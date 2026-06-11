// src/hooks/useAcademia.js
//
// Estructura en Firestore:
//
//  /alumnos/{id}                   ← datos base del alumno
//  /alumnos/{id}/asistencia/{key}  ← { fecha: "07/04", marca: "P" }
//  /alumnos/{id}/pagos/{mes}       ← { mes: "Enero", monto: 650000 }
//
// El hook expone la misma API que el App.jsx original
// (students, payments, updateStudent) → cero cambios en los componentes.

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection, doc, getDocs,
  setDoc, updateDoc,
  query, orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'

// ─── Helpers de lectura ────────────────────────────────────────────────────────

async function fetchAlumnoFull(docSnap) {
  const base = { ...docSnap.data(), id: docSnap.id }

  // Asistencia ordenada por fecha
  const asistSnap = await getDocs(
    query(
      collection(db, 'alumnos', docSnap.id, 'asistencia'),
      orderBy('fecha'),
    )
  )
  base.asistencia = asistSnap.docs.map(d => ({
    f: d.data().fecha,
    m: d.data().marca,
  }))

  // Pagos como objeto { Enero: 650000, Febrero: 650000, ... }
  const pagosSnap = await getDocs(collection(db, 'alumnos', docSnap.id, 'pagos'))
  base.pagos = {}
  pagosSnap.docs.forEach(d => {
    base.pagos[d.data().mes] = d.data().monto
  })

  return base
}

// ─── Sincronización a Firestore (diff + escritura mínima) ─────────────────────

const BASE_FIELDS = ['nombre','iniciales','estado','plan','abonadas','realizadas','email','tel','pin']

async function syncToFirestore(oldS, newS) {
  const id = newS.id  // string (Firestore doc ID)

  // 1. Solo escribe los campos base que cambiaron
  const diff = {}
  BASE_FIELDS.forEach(f => { if (oldS[f] !== newS[f]) diff[f] = newS[f] })
  if (Object.keys(diff).length > 0) {
    await updateDoc(doc(db, 'alumnos', id), diff)
  }

  // 2. Escribe solo las entradas de asistencia que cambiaron
  const oldMap = Object.fromEntries(oldS.asistencia.map(a => [a.f, a.m]))
  for (const { f, m } of newS.asistencia) {
    if (oldMap[f] !== m) {
      const key = f.replace('/', '-')   // "07/04" → "07-04"
      await setDoc(
        doc(db, 'alumnos', id, 'asistencia', key),
        { fecha: f, marca: m }
      )
    }
  }

  // 3. Recalcula realizadas (= cantidad de "P" en asistencia)
  const presentes = newS.asistencia.filter(a => a.m === 'P').length
  if (presentes !== oldS.realizadas) {
    await updateDoc(doc(db, 'alumnos', id), { realizadas: presentes })
  }
}

// ─── Hook principal ────────────────────────────────────────────────────────────

export function useAcademia() {
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  // Ref para leer el estado actual sin capturar un closure viejo
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

  // Misma firma que el updateStudent original del App.jsx
  const updateStudent = useCallback((id, updater) => {
    const old = studentsRef.current.find(s => s.id === id)
    if (!old) return

    const updated = updater(old)

    // Actualización local optimista (instantánea para la UI)
    setStudents(prev => {
      const next = prev.map(s => s.id === id ? updated : s)
      studentsRef.current = next
      return next
    })

    // Escritura async a Firestore (no bloquea la UI)
    syncToFirestore(old, updated).catch(err =>
      console.error('Firestore write error:', err)
    )
  }, [])

  // Mismo shape que INITIAL_PAYMENTS del App original
  const payments = students
    .map(s => ({
      alumno: s.nombre,
      ene: s.pagos?.Enero   || 0,
      feb: s.pagos?.Febrero || 0,
      mar: s.pagos?.Marzo   || 0,
      abr: s.pagos?.Abril   || 0,
    }))
    .filter(p => p.ene || p.feb || p.mar || p.abr)

  return { students, payments, loading, error, updateStudent }
}
