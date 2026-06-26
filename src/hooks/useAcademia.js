// src/hooks/useAcademia.js
//
// Estructura en Firestore:
//   /alumnos/{id}                   ← datos base del alumno
//   /alumnos/{id}/asistencia/{key}  ← { fecha: "07/04", marca: "P" }
//   /alumnos/{id}/pagos/{mes}       ← { mes: "Enero", monto: 650000 }
//   /config/horarios                ← { horas: [...], asign: { "Lunes|9:00": [nombres] } }

import { useState, useEffect, useCallback, useRef } from 'react'
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { SCHEDULE_SLOTS, DIAS_KEYS, DIAS_LABEL, PLANES, MESES } from '../constants'

// ─── Helpers ────────────────────────────────────────────────────────────────
const dateKey = (f) => {
  const [d, m] = String(f).split('/').map(Number)
  return (m || 0) * 100 + (d || 0)
}
// Clases dadas (consumen del paquete): P (presente), I (injustificada, no avisó),
// R (recuperada). X (a reprogramar) NO cuenta: queda pendiente de recuperar.
const countRealizadas = (asistencia) =>
  asistencia.filter(a => a.m === 'P' || a.m === 'I' || a.m === 'R').length

// Fecha local en formato ISO YYYY-MM-DD
const isoLocal = (dt = new Date()) =>
  `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`

// Pagos: cada registro es un paquete { id, fecha, monto, clases, mes }
const mesDeFecha = (f) => f ? MESES[Number(String(f).slice(5,7)) - 1] : null
const sortPagos  = (arr) => [...arr].sort((a, b) => String(b.fecha||'').localeCompare(String(a.fecha||'')))
const pagosMap   = (detalle) => {
  const m = {}
  detalle.forEach(p => { if (p.mes) m[p.mes] = (m[p.mes] || 0) + (p.monto || 0) })
  return m
}

// Estado automático: si le quedan clases disponibles → OK, si no → VENCIDO
const computeEstado = (abonadas, realizadas) =>
  ((abonadas || 0) - (realizadas || 0)) > 0 ? 'OK' : 'VENCIDO'

function defaultSchedule() {
  const horas = SCHEDULE_SLOTS.map(s => s.hora)
  const asign = {}
  SCHEDULE_SLOTS.forEach(slot => {
    DIAS_KEYS.forEach((dk, i) => {
      if (slot[dk]) asign[`${DIAS_LABEL[i]}|${slot.hora}`] = [slot[dk]]
    })
  })
  return { horas, asign }
}

// ─── Lectura de un alumno completo ────────────────────────────────────────────
async function fetchAlumnoFull(docSnap) {
  const base = { ...docSnap.data(), id: docSnap.id }
  const asistSnap = await getDocs(collection(db, 'alumnos', docSnap.id, 'asistencia'))
  base.asistencia = asistSnap.docs
    .map(d => ({ f: d.data().fecha, m: d.data().marca }))
    .sort((a, b) => dateKey(a.f) - dateKey(b.f))
  const pagosSnap = await getDocs(collection(db, 'alumnos', docSnap.id, 'pagos'))
  base.pagosDetalle = pagosSnap.docs.map(d => {
    const x = d.data()
    const fecha = x.fecha || null
    return {
      id: d.id,
      fecha,
      monto: x.monto || 0,
      clases: (x.clases ?? null),
      mes: x.mes || mesDeFecha(fecha),
    }
  })
  base.pagosDetalle = sortPagos(base.pagosDetalle)
  base.pagos = pagosMap(base.pagosDetalle)
  base.realizadas = countRealizadas(base.asistencia)
  base.estado = computeEstado(base.abonadas, base.realizadas)
  base.archivado = base.archivado || false
  return base
}

// ─── Escritura de alumno (solo lo que cambió) ─────────────────────────────────
const BASE_FIELDS = ['nombre','iniciales','estado','plan','abonadas','email','tel','pin','archivado']

async function syncToFirestore(oldS, newS) {
  const id = newS.id
  const diff = {}
  BASE_FIELDS.forEach(f => { if (oldS[f] !== newS[f]) diff[f] = newS[f] })
  if (Object.keys(diff).length > 0) await updateDoc(doc(db, 'alumnos', id), diff)

  const oldMap = Object.fromEntries(oldS.asistencia.map(a => [a.f, a.m]))
  for (const { f, m } of newS.asistencia) {
    if (oldMap[f] !== m) {
      const key = f.replace('/', '-')
      await setDoc(doc(db, 'alumnos', id, 'asistencia', key), { fecha: f, marca: m })
    }
  }
  const nuevasRealizadas = countRealizadas(newS.asistencia)
  if (nuevasRealizadas !== oldS.realizadas)
    await updateDoc(doc(db, 'alumnos', id), { realizadas: nuevasRealizadas })
}

// ─── Hook principal ────────────────────────────────────────────────────────────
export function useAcademia() {
  const [students, setStudents] = useState([])
  const [schedule, setSchedule] = useState({ horas: [], asign: {} })
  const [planes, setPlanes]     = useState(PLANES)
  const [consejos, setConsejos] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const studentsRef = useRef([])

  const commitLocal = (id, updated) => setStudents(prev => {
    const next = prev.map(s => s.id === id ? updated : s)
    studentsRef.current = next
    return next
  })

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, 'alumnos'))
        const list = await Promise.all(snap.docs.map(fetchAlumnoFull))
        list.sort((a, b) => a.nombre.localeCompare(b.nombre))
        setStudents(list)
        studentsRef.current = list
        const schSnap = await getDoc(doc(db, 'config', 'horarios'))
        setSchedule(schSnap.exists() ? schSnap.data() : defaultSchedule())
        const planSnap = await getDoc(doc(db, 'config', 'planes'))
        if (planSnap.exists() && Array.isArray(planSnap.data().lista)) setPlanes(planSnap.data().lista)
        const consSnap = await getDoc(doc(db, 'config', 'consejos'))
        if (consSnap.exists() && Array.isArray(consSnap.data().items)) setConsejos(consSnap.data().items)
      } catch (err) {
        console.error('Firestore load error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const updateStudent = useCallback((id, updater) => {
    const old = studentsRef.current.find(s => s.id === id)
    if (!old) return
    const updated = updater(old)
    updated.realizadas = countRealizadas(updated.asistencia)
    updated.estado = computeEstado(updated.abonadas, updated.realizadas)
    commitLocal(id, updated)
    syncToFirestore(old, updated).catch(err => console.error('Firestore write error:', err))
  }, [])

  // Registrar un pago = un paquete nuevo { monto, clases, fecha }
  const addPayment = useCallback((id, { monto, clases = 0, fecha = null }) => {
    const old = studentsRef.current.find(s => s.id === id)
    if (!old) return
    const f = fecha || isoLocal()
    const cl = Number(clases) || 0
    const mes = mesDeFecha(f)
    const abonadas = old.abonadas + cl
    const estado = computeEstado(abonadas, old.realizadas)
    const tempId = 'tmp_' + Date.now()
    const rec = { id: tempId, fecha: f, monto: Number(monto), clases: cl, mes }
    const detalle = sortPagos([rec, ...(old.pagosDetalle || [])])
    commitLocal(id, { ...old, pagosDetalle: detalle, pagos: pagosMap(detalle), abonadas, estado })
    ;(async () => {
      try {
        const ref = await addDoc(collection(db, 'alumnos', id, 'pagos'), { fecha: f, monto: Number(monto), clases: cl, mes })
        const cur = studentsRef.current.find(s => s.id === id)
        if (cur) {
          const fixed = (cur.pagosDetalle || []).map(p => p.id === tempId ? { ...p, id: ref.id } : p)
          commitLocal(id, { ...cur, pagosDetalle: fixed })
        }
        await updateDoc(doc(db, 'alumnos', id), { abonadas, estado })
      } catch (e) { console.error('addPayment error:', e) }
    })()
  }, [])

  // Editar un pago existente (ajusta abonadas por la diferencia de clases)
  const updatePayment = useCallback((id, pagoId, { monto, clases, fecha }) => {
    const old = studentsRef.current.find(s => s.id === id)
    if (!old) return
    const prev = (old.pagosDetalle || []).find(p => p.id === pagoId)
    if (!prev) return
    const f = fecha || prev.fecha || isoLocal()
    const cl = Number(clases) || 0
    const mes = mesDeFecha(f)
    const abonadas = old.abonadas + (cl - (Number(prev.clases) || 0))
    const estado = computeEstado(abonadas, old.realizadas)
    const detalle = sortPagos((old.pagosDetalle || []).map(p =>
      p.id === pagoId ? { ...p, fecha: f, monto: Number(monto), clases: cl, mes } : p))
    commitLocal(id, { ...old, pagosDetalle: detalle, pagos: pagosMap(detalle), abonadas, estado })
    ;(async () => {
      try {
        await updateDoc(doc(db, 'alumnos', id, 'pagos', pagoId), { fecha: f, monto: Number(monto), clases: cl, mes })
        await updateDoc(doc(db, 'alumnos', id), { abonadas, estado })
      } catch (e) { console.error('updatePayment error:', e) }
    })()
  }, [])

  // Quitar un pago (resta sus clases de abonadas)
  const removePayment = useCallback((id, pagoId) => {
    const old = studentsRef.current.find(s => s.id === id)
    if (!old) return
    const prev = (old.pagosDetalle || []).find(p => p.id === pagoId)
    const cl = Number(prev?.clases) || 0
    const abonadas = old.abonadas - cl
    const estado = computeEstado(abonadas, old.realizadas)
    const detalle = (old.pagosDetalle || []).filter(p => p.id !== pagoId)
    commitLocal(id, { ...old, pagosDetalle: detalle, pagos: pagosMap(detalle), abonadas, estado })
    ;(async () => {
      try {
        await deleteDoc(doc(db, 'alumnos', id, 'pagos', pagoId))
        await updateDoc(doc(db, 'alumnos', id), { abonadas, estado })
      } catch (e) { console.error('removePayment error:', e) }
    })()
  }, [])

  // Alta de alumno nuevo. Devuelve { ok, msg }.
  const addStudent = useCallback(async (data) => {
    const nombre = (data.nombre || '').trim()
    if (!nombre) return { ok: false, msg: 'Falta el nombre' }
    const pin = (data.pin || '').trim()
    if (!/^\d{4}$/.test(pin)) return { ok: false, msg: 'El PIN debe ser de 4 dígitos' }
    if (pin === '9999') return { ok: false, msg: 'El PIN 9999 está reservado para el profe' }
    if (studentsRef.current.some(s => s.pin === pin)) return { ok: false, msg: 'Ese PIN ya está en uso' }
    const abonadas = Number(data.abonadas) || 0
    const base = {
      nombre, pin,
      iniciales: nombre.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase(),
      estado: computeEstado(abonadas, 0),
      plan: data.plan || '8 Clases',
      abonadas, realizadas: 0,
      email: data.email || '', tel: data.tel || '',
    }
    try {
      const ref = await addDoc(collection(db, 'alumnos'), base)
      const nuevo = { ...base, id: ref.id, asistencia: [], pagos: {} }
      const next = [...studentsRef.current, nuevo].sort((a,b) => a.nombre.localeCompare(b.nombre))
      studentsRef.current = next
      setStudents(next)
      return { ok: true }
    } catch (e) {
      console.error('addStudent error:', e)
      return { ok: false, msg: 'No se pudo guardar (¿estás logueado como profe?)' }
    }
  }, [])

  // Baja de alumno: borra el doc y sus subcolecciones.
  const deleteStudent = useCallback(async (id) => {
    const next = studentsRef.current.filter(s => s.id !== id)
    studentsRef.current = next
    setStudents(next)
    try {
      const asis = await getDocs(collection(db, 'alumnos', id, 'asistencia'))
      await Promise.all(asis.docs.map(d => deleteDoc(d.ref)))
      const pag = await getDocs(collection(db, 'alumnos', id, 'pagos'))
      await Promise.all(pag.docs.map(d => deleteDoc(d.ref)))
      await deleteDoc(doc(db, 'alumnos', id))
    } catch (e) {
      console.error('deleteStudent error:', e)
    }
  }, [])

  const saveConsejos = useCallback((items) => {
    setConsejos(items)
    setDoc(doc(db, 'config', 'consejos'), { items }).catch(err => console.error('Consejos write error:', err))
  }, [])

  // Notas personales del alumno (bitácora)
  const loadNotas = useCallback(async (id) => {
    const snap = await getDocs(collection(db, 'alumnos', id, 'notas'))
    return snap.docs
      .map(d => ({ id: d.id, texto: d.data().texto, fecha: d.data().fecha || null }))
      .sort((a, b) => String(b.fecha||'').localeCompare(String(a.fecha||'')))
  }, [])
  const addNota = useCallback(async (id, texto) => {
    const fecha = new Date().toISOString()
    const ref = await addDoc(collection(db, 'alumnos', id, 'notas'), { texto, fecha })
    return { id: ref.id, texto, fecha }
  }, [])
  const deleteNota = useCallback(async (id, notaId) => {
    await deleteDoc(doc(db, 'alumnos', id, 'notas', notaId))
  }, [])

  const savePlanes = useCallback((lista) => {
    setPlanes(lista)
    setDoc(doc(db, 'config', 'planes'), { lista }).catch(err => console.error('Planes write error:', err))
  }, [])

  const saveSchedule = useCallback((next) => {
    setSchedule(next)
    setDoc(doc(db, 'config', 'horarios'), next).catch(err => console.error('Schedule write error:', err))
  }, [])

  return { students, schedule, planes, consejos, loading, error, updateStudent, addStudent, deleteStudent, addPayment, updatePayment, removePayment, saveSchedule, savePlanes, saveConsejos, loadNotas, addNota, deleteNota }
}
