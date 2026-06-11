// src/seed.js
//
// Script de siembra — ejecutar UNA sola vez para cargar los datos iniciales.
//
// Cómo usarlo:
//   1. Agregá un botón en App.jsx en modo DEV:
//        import { seedFirestore } from './seed'
//        <button onClick={seedFirestore}>Seed DB</button>
//   2. Hacé clic → revisá la consola del navegador
//   3. Eliminá el botón una vez que los datos estén en Firestore

import { db } from './firebase'
import { doc, setDoc, collection } from 'firebase/firestore'

const STUDENTS = [
  {
    id: '1', pin: '1234', nombre: 'Vale Marengo',   iniciales: 'VM',
    estado: 'OK',      abonadas: 39, realizadas: 33,
    email: 'valeriamarengo@hotmail.com', tel: '981130838', plan: '12 Clases',
    pagos: { Enero: 740000, Febrero: 650000, Marzo: 650000, Abril: 650000 },
    asistencia: [
      {f:'07/04',m:'P'},{f:'09/04',m:'P'},{f:'14/04',m:'P'},{f:'16/04',m:'P'},
      {f:'22/04',m:'P'},{f:'24/04',m:'P'},{f:'28/04',m:'P'},{f:'30/04',m:'P'},
    ],
  },
  {
    id: '4', pin: '4444', nombre: 'Diego Sanchez',  iniciales: 'DS',
    estado: 'VENCIDO', abonadas: 12, realizadas: 12,
    email: 'D.sanchezareco@gmail.com', tel: '991703651', plan: '12 Clases',
    pagos: { Febrero: 90000, Marzo: 220000, Abril: 700000 },
    asistencia: [
      {f:'07/04',m:'P'},{f:'09/04',m:'P'},{f:'28/04',m:'P'},{f:'30/04',m:'P'},
    ],
  },
  {
    id: '5', pin: '0000', nombre: 'Lucho Rolando',  iniciales: 'LR',
    estado: 'OK',      abonadas: 6,  realizadas: 2,
    email: 'luisangelrolando2024@gmail.com', tel: '595971515309', plan: '4 Clases',
    pagos: {},
    asistencia: [{f:'14/04',m:'I'},{f:'24/04',m:'X'}],
  },
  {
    id: '7', pin: '7777', nombre: 'Miguel Zacarias', iniciales: 'MZ',
    estado: 'OK',      abonadas: 32, realizadas: 25,
    email: 'mzacarias@grupomipac.com', tel: '981693213', plan: '8 Clases',
    pagos: { Febrero: 550000, Marzo: 840000, Abril: 840000 },
    asistencia: [{f:'28/04',m:'P'},{f:'30/04',m:'P'}],
  },
  {
    id: '30', pin: '3030', nombre: 'Arturo Grau',   iniciales: 'AG',
    estado: 'OK',      abonadas: 51, realizadas: 44,
    email: '', tel: '', plan: '12 Clases',
    pagos: { Enero: 950000, Febrero: 950000, Marzo: 950000, Abril: 950000 },
    asistencia: [
      {f:'07/04',m:'P'},{f:'09/04',m:'P'},{f:'14/04',m:'I'},{f:'16/04',m:'P'},
      {f:'24/04',m:'P'},{f:'28/04',m:'I'},{f:'30/04',m:'X'},
    ],
  },
  {
    id: '45', pin: '4545', nombre: 'Mauro Coche',   iniciales: 'MC',
    estado: 'OK',      abonadas: 40, realizadas: 37,
    email: '', tel: '', plan: '8 Clases',
    pagos: { Enero: 650000, Febrero: 650000, Marzo: 650000, Abril: 650000 },
    asistencia: [
      {f:'07/04',m:'P'},{f:'09/04',m:'P'},{f:'14/04',m:'P'},{f:'16/04',m:'P'},
      {f:'24/04',m:'P'},{f:'28/04',m:'P'},{f:'30/04',m:'P'},
    ],
  },
  {
    id: '18', pin: '1818', nombre: 'Guada Rolon',   iniciales: 'GR',
    estado: 'OK',      abonadas: 19, realizadas: 15,
    email: '', tel: '', plan: '8 Clases',
    pagos: { Enero: 380000, Febrero: 380000, Marzo: 380000, Abril: 380000 },
    asistencia: [{f:'30/04',m:'P'}],
  },
  {
    id: '27', pin: '2727', nombre: 'Franco Verano', iniciales: 'FV',
    estado: 'OK',      abonadas: 30, realizadas: 24,
    email: '', tel: '', plan: '12 Clases',
    pagos: { Enero: 650000, Febrero: 650000, Marzo: 650000, Abril: 650000 },
    asistencia: [{f:'16/04',m:'P'},{f:'24/04',m:'P'},{f:'30/04',m:'P'}],
  },
]

export async function seedFirestore() {
  console.log('🌱 Iniciando seed de Firestore...')

  for (const student of STUDENTS) {
    const { asistencia, pagos, ...base } = student

    // Documento base del alumno
    await setDoc(doc(db, 'alumnos', student.id), base)

    // Subcolección asistencia
    for (const { f, m } of asistencia) {
      const key = f.replace('/', '-')   // "07/04" → "07-04"
      await setDoc(
        doc(db, 'alumnos', student.id, 'asistencia', key),
        { fecha: f, marca: m }
      )
    }

    // Subcolección pagos
    for (const [mes, monto] of Object.entries(pagos)) {
      await setDoc(
        doc(db, 'alumnos', student.id, 'pagos', mes),
        { mes, monto }
      )
    }

    console.log(`  ✅ ${base.nombre}`)
  }

  console.log('🎾 Seed completado! Podés eliminar el botón de seed.')
}
