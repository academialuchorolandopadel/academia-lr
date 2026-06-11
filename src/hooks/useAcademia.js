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
import { SCHEDULE_SLOTS, DIAS_KEYS, DIAS_LABEL } from '../constants'

// ─── Helpers ────────────────────────────────────────────────────────────────
const dateKey = (f) => {
  const [d, m] = String(f).split('/').map(Number)
  return (m || 0) * 100 + (d || 0)
}
const countRealizadas = (asistencia) =>
  asistencia.filter(a => a.m === 'P' || a.m === 'R').length

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
  base.pagos = {}
  pagosSnap.docs.forEach(d => { base.pagos[d.data().mes] = d.data().monto })
  base.realizadas = countRealizadas(base.asistencia)
  base.estado = computeEstado(base.abonadas, base.realizadas)
  return base
}

// ─── Escritura de alumno (solo lo que cambió) ─────────────────────────────────
const BASE_FIELDS = ['nombre','iniciales','estado','plan','abonadas','email','tel','pin']

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

  // Registrar / editar un pago. addClases (opcional) suma al paquete (abonadas).
  const addPayment = useCallback((id, mes, monto, addClases = 0) => {
    const old = studentsRef.current.find(s => s.id === id)
    if (!old) return
    const extra = Number(addClases) || 0
    const pagos = { ...(old.pagos || {}), [mes]: Number(monto) }
    const abonadas = old.abonadas + extra
    const estado = computeEstado(abonadas, old.realizadas)
    const updated = { ...old, pagos, abonadas, estado }
    commitLocal(id, updated)
    ;(async () => {
      try {
        await setDoc(doc(db, 'alumnos', id, 'pagos', mes), { mes, monto: Number(monto) })
        if (extra) await updateDoc(doc(db, 'alumnos', id), { abonadas, estado })
      } catch (e) { console.error('addPayment error:', e) }
    })()
  }, [])

  const removePayment = useCallback((id, mes) => {
    const old = studentsRef.current.find(s => s.id === id)
    if (!old) return
    const pagos = { ...(old.pagos || {}) }
    delete pagos[mes]
    commitLocal(id, { ...old, pagos })
    deleteDoc(doc(db, 'alumnos', id, 'pagos', mes)).catch(e => console.error('removePayment error:', e))
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

  const saveSchedule = useCallback((next) => {
    setSchedule(next)
    setDoc(doc(db, 'config', 'horarios'), next).catch(err => console.error('Schedule write error:', err))
  }, [])

  return { students, schedule, loading, error, updateStudent, addStudent, deleteStudent, addPayment, removePayment, saveSchedule }
}
