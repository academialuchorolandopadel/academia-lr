// src/hooks/useAcademia.js
//
// Estructura en Firestore:
//   /alumnos/{id}                   ← datos base del alumno
//   /alumnos/{id}/asistencia/{key}  ← { fecha: "07/04", marca: "P" }
//   /alumnos/{id}/pagos/{mes}       ← { mes: "Enero", monto: 650000 }

import { useState, useEffect, useCallback, useRef } from 'react'
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

// ─── Helpers ────────────────────────────────────────────────────────────────
// Ordena fechas "DD/MM" cronológicamente (el orden de texto da mal: "01/05" < "07/04")
const dateKey = (f) => {
  const [d, m] = String(f).split('/').map(Number)
  return (m || 0) * 100 + (d || 0)
}

// realizadas = Presentes + Recuperadas (definición elegida)
const countRealizadas = (asistencia) =>
  asistencia.filter(a => a.m === 'P' || a.m === 'R').length

// ─── Lectura de un alumno completo ────────────────────────────────────────────
async function fetchAlumnoFull(docSnap) {
  const base = { ...docSnap.data(), id: docSnap.id }

  // Asistencia (ordenada en JS, no en Firestore, para que el orden sea real)
  const asistSnap = await getDocs(collection(db, 'alumnos', docSnap.id, 'asistencia'))
  base.asistencia = asistSnap.docs
    .map(d => ({ f: d.data().fecha, m: d.data().marca }))
    .sort((a, b) => dateKey(a.f) - dateKey(b.f))

  // Pagos como objeto { Enero: 650000, ... }
  const pagosSnap = await getDocs(collection(db, 'alumnos', docSnap.id, 'pagos'))
  base.pagos = {}
  pagosSnap.docs.forEach(d => { base.pagos[d.data().mes] = d.data().monto })

  // realizadas siempre derivado de la asistencia → nunca diverge
  base.realizadas = countRealizadas(base.asistencia)

  return base
}

// ─── Escritura (solo lo que cambió) ────────────────────────────────────────────
const BASE_FIELDS = ['nombre','iniciales','estado','plan','abonadas','email','tel','pin']

async function syncToFirestore(oldS, newS) {
  const id = newS.id

  // 1. Campos base que cambiaron (realizadas NO está acá: es derivado)
  const diff = {}
  BASE_FIELDS.forEach(f => { if (oldS[f] !== newS[f]) diff[f] = newS[f] })
  if (Object.keys(diff).length > 0) {
    await updateDoc(doc(db, 'alumnos', id), diff)
  }

  // 2. Entradas de asistencia que cambiaron
  const oldMap = Object.fromEntries(oldS.asistencia.map(a => [a.f, a.m]))
  for (const { f, m } of newS.asistencia) {
    if (oldMap[f] !== m) {
      const key = f.replace('/', '-')
      await setDoc(doc(db, 'alumnos', id, 'asistencia', key), { fecha: f, marca: m })
    }
  }

  // 3. realizadas derivado: se guarda solo si cambió (local y remoto coinciden)
  const nuevasRealizadas = countRealizadas(newS.asistencia)
  if (nuevasRealizadas !== oldS.realizadas) {
    await updateDoc(doc(db, 'alumnos', id), { realizadas: nuevasRealizadas })
  }
}

// ─── Hook principal ────────────────────────────────────────────────────────────
export function useAcademia() {
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const studentsRef = useRef([])

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, 'alumnos'))
        const list = await Promise.all(snap.docs.map(fetchAlumnoFull))
        list.sort((a, b) => a.nombre.localeCompare(b.nombre))
        setStudents(list)
        studentsRef.current = list
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
    // realizadas se recalcula acá también → la UI y Firestore nunca divergen
    updated.realizadas = countRealizadas(updated.asistencia)

    setStudents(prev => {
      const next = prev.map(s => s.id === id ? updated : s)
      studentsRef.current = next
      return next
    })

    syncToFirestore(old, updated).catch(err =>
      console.error('Firestore write error:', err)
    )
  }, [])

  // Pagos con TODOS los meses (no solo ene-abr)
  const payments = students
    .map(s => ({ alumno: s.nombre, meses: s.pagos || {} }))
    .filter(p => Object.keys(p.meses).length > 0)

  return { students, payments, loading, error, updateStudent }
}
