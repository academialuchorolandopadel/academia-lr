// src/utils/reporteCancha.js
//
// Pago de cancha al club: se cobra POR ALUMNO según el tipo de turno de la agenda.
//   · Individual → tarifa individual · Dual o grupal → tarifa grupal
//   · Se cobran las marcas P (presente), R (recuperada) e I (faltó sin avisar).
//     La X (reprogramada con aviso) no se cobra.
// La asistencia guarda el día pero no la hora: la hora y el tipo salen de la agenda.
// Si un alumno no está en la agenda ese día, o tiene más de un turno, queda
// "a revisar" y el profe elige el horario a mano (no se adivina un monto).
//
// También arma el reporte semanal en PDF (motor en ./pdf.js).

import { A4, M, NAVY, BRONCE, GRIS, CLARO, BORDE, ROJO, n2, txt, rect, linea, envolver, serializar, logoJpeg, aBlob } from "./pdf"
export { entregarPdf, puedeCompartirArchivos } from "./pdf"

export const MARCAS_COBRABLES = ["P", "R", "I"]
export const TARIFAS_DEFAULT  = { individual: 25000, grupal: 20000, club: "Fanáticos" }
export const ETIQUETA_TIPO    = { individual: "Individual", pareja: "Dual", grupal: "Grupal" }
export const esIndividual = (tipo) => tipo === "individual"
export const tarifaDe     = (tipo, tarifas) => esIndividual(tipo) ? tarifas.individual : tarifas.grupal
export const gs = (n) => "Gs. " + String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")

const DIAS   = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]
const CORTOS = ["Lun","Mar","Mié","Jue","Vie","Sáb"]
const pad = (n) => String(n).padStart(2, "0")
const ddmm = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
export const ddmmyyyy = (d) => `${ddmm(d)}/${d.getFullYear()}`
export const isoDe = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Cancha de un turno en una fecha. Lo cargado ese día manda; si no, la cancha habitual de la agenda.
// schedule.canchasDia = { "2026-10-21|18:00": "3" } · schedule.canchas = { "Martes|18:00": "2" }
export function canchaDe(schedule, dia, hora) {
  const delDia = ((schedule && schedule.canchasDia) || {})[`${dia.iso}|${hora}`]
  if (delDia) return { valor: String(delDia), habitual: false }
  const hab = ((schedule && schedule.canchas) || {})[`${dia.diaFull}|${hora}`]
  return hab ? { valor: String(hab), habitual: true } : { valor: "", habitual: false }
}
export const toMin = (h) => { const [a, b] = String(h).split(":").map(Number); return (a || 0) * 60 + (b || 0) }

// Días Lun–Sáb de una semana (offset en semanas respecto de la actual)
export function diasDeSemana(offset = 0, hoy = new Date()) {
  const dow = hoy.getDay()
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + (dow === 0 ? -6 : 1 - dow) + offset * 7)
  return DIAS.map((diaFull, i) => {
    const d = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i)
    return { f: ddmm(d), dia: CORTOS[i], diaFull, date: d, iso: isoDe(d) }
  })
}

// Todos los días Lun–Sáb del mes de 'ref'
export function diasDelMes(ref = new Date()) {
  const out = []
  const d = new Date(ref.getFullYear(), ref.getMonth(), 1)
  while (d.getMonth() === ref.getMonth()) {
    const dow = d.getDay()
    if (dow !== 0) out.push({ f: ddmm(d), dia: CORTOS[dow - 1], diaFull: DIAS[dow - 1], date: new Date(d), iso: isoDe(d) })
    d.setDate(d.getDate() + 1)
  }
  return out
}

// ─── Cálculo ──────────────────────────────────────────────────────────────────
// resoluciones: { "<idAlumno>|<dd/mm>": { hora, tipo } | { excluir: true } }
// para los casos que la agenda no resuelve sola.
export function calcularCancha({ students = [], schedule = {}, dias = [], tarifas = TARIFAS_DEFAULT, resoluciones = {} }) {
  const horas  = [...(schedule.horas || [])].sort((a, b) => toMin(a) - toMin(b))
  const asign  = schedule.asign || {}
  const tipos  = schedule.tipos || {}
  const lineas = {}
  const pendientes = []
  let excluidos = 0

  for (const c of dias) {
    for (const s of students) {
      const rec = (s.asistencia || []).find(a => a.f === c.f)
      if (!rec || !MARCAS_COBRABLES.includes(rec.m)) continue
      const clave = `${s.id}|${c.f}`
      const r = resoluciones[clave]
      if (r && r.excluir) { excluidos++; continue }
      const suyos = horas.filter(h => (asign[`${c.diaFull}|${h}`] || []).includes(s.nombre))
      let hora = null, tipo = null
      if (r && r.hora) {
        hora = r.hora
        tipo = tipos[`${c.diaFull}|${r.hora}`] || r.tipo || null
      } else if (suyos.length === 1 && tipos[`${c.diaFull}|${suyos[0]}`]) {
        hora = suyos[0]
        tipo = tipos[`${c.diaFull}|${hora}`]
      }
      if (!hora || !tipo) {
        pendientes.push({
          clave, alumno: s, dia: c, marca: rec.m,
          motivo: (r && r.hora) ? "Ese horario no tiene tipo: elegí individual o dual/grupal"
                : suyos.length === 0 ? "No figura en la agenda de ese día (¿recuperación?)"
                : suyos.length > 1   ? `Tiene ${suyos.length} turnos ese día`
                : "Su turno no tiene tipo (individual/dual/grupal) en la agenda",
          sugerida: (r && r.hora) || (suyos.length === 1 ? suyos[0] : ""),
        })
        continue
      }
      const k = `${c.f}|${hora}`
      if (!lineas[k]) lineas[k] = { dia: c, hora, tipo, alumnos: [] }
      lineas[k].alumnos.push({ id: s.id, nombre: s.nombre, marca: rec.m, clave, manual: !!(r && r.hora) })
    }
  }

  const lista = Object.values(lineas)
    .sort((a, b) => (a.dia.date - b.dia.date) || (toMin(a.hora) - toMin(b.hora)))
    .map(l => {
      const n = l.alumnos.length, tarifa = tarifaDe(l.tipo, tarifas)
      const c = canchaDe(schedule, l.dia, l.hora)
      return { ...l, n, tarifa, subtotal: n * tarifa, cancha: c.valor, canchaHabitual: c.habitual }
    })
  const sum = (arr, k) => arr.reduce((a, x) => a + x[k], 0)
  const ind = lista.filter(l => esIndividual(l.tipo))
  const grp = lista.filter(l => !esIndividual(l.tipo))
  // Detalle por tipo de turno. Los grupales se separan por cuántos alumnos se cobraron
  // ese día (grupal de 3, grupal de 4…). Un dual sigue siendo dual aunque venga uno solo.
  const grupos = {}
  for (const l of lista) {
    const clave = l.tipo === "grupal" ? `grupal-${l.n}` : l.tipo
    if (!grupos[clave]) grupos[clave] = {
      clave, tarifa: l.tarifa, horas: 0, alumnos: 0, monto: 0,
      etiqueta: l.tipo === "grupal" ? `Grupal de ${l.n}` : (ETIQUETA_TIPO[l.tipo] || l.tipo),
      orden: l.tipo === "individual" ? 0 : l.tipo === "pareja" ? 1 : l.tipo === "grupal" ? 10 + l.n : 99,
    }
    grupos[clave].horas += 1
    grupos[clave].alumnos += l.n
    grupos[clave].monto += l.subtotal
  }
  const desglose = Object.values(grupos).sort((a, b) => a.orden - b.orden)
  return {
    desglose,
    lineas: lista, pendientes, excluidos,
    sinCancha: lista.filter(l => !l.cancha).length,
    horas: lista.length,
    alumnos: sum(lista, "n"),
    individual: { n: sum(ind, "n"), monto: sum(ind, "subtotal") },
    grupal:     { n: sum(grp, "n"), monto: sum(grp, "subtotal") },
    total: sum(lista, "subtotal"),
  }
}

// datos: { club, profe, desde (Date), hasta (Date), res (calcularCancha), tarifas, generado (Date) }
// logo: { data (JPEG en string binario), w, h } o null
export function armarPdfCancha(datos, logo = null) {
  const { club, profe, desde, hasta, res, tarifas } = datos
  const generado = datos.generado || new Date()
  const paginas = []
  let ops = []
  paginas.push(ops)
  const anchoUtil = A4.w - 2 * M

  // Encabezado (página 1)
  let xTitulo = M
  if (logo) {
    const lh = 40, lw = lh * logo.w / logo.h
    ops.push(`q ${n2(lw)} 0 0 ${n2(lh)} ${n2(M)} ${n2(A4.h - 30 - lh)} cm /Logo Do Q`)
    xTitulo = M + lw + 12
  }
  txt(ops, xTitulo, 50, "Reporte de uso de cancha", { size: 17, bold: true })
  txt(ops, xTitulo, 66, `Academia LR · ${club || ""}`, { size: 10, color: GRIS })
  txt(ops, A4.w - M, 42, "SEMANA", { size: 8, bold: true, color: BRONCE, align: "right" })
  txt(ops, A4.w - M, 57, `${ddmmyyyy(desde)} al ${ddmmyyyy(hasta)}`, { size: 11, bold: true, align: "right" })
  txt(ops, A4.w - M, 71, `Profe: ${profe || ""}`, { size: 9, color: GRIS, align: "right" })
  linea(ops, M, 86, A4.w - M, 86, BRONCE, 1.5)

  // Resumen
  const gap = 10, bw = (anchoUtil - 2 * gap) / 3, by = 100, bh = 56
  const cajas = [
    { l: "HORAS DE CANCHA", v: String(res.horas) },
    { l: "ALUMNOS (CLASES)", v: String(res.alumnos) },
    { l: "TOTAL A PAGAR", v: gs(res.total), fuerte: true },
  ]
  cajas.forEach((c, i) => {
    const x = M + i * (bw + gap)
    rect(ops, x, by, bw, bh, c.fuerte ? NAVY : CLARO)
    txt(ops, x + 12, by + 18, c.l, { size: 7.5, bold: true, color: c.fuerte ? "#E4CFAB" : BRONCE })
    txt(ops, x + 12, by + 42, c.v, { size: c.fuerte ? 16 : 18, bold: true, color: c.fuerte ? "#FFFFFF" : NAVY })
  })

  // Tabla
  const col = {
    fecha: M + 8, dia: M + 58, hora: M + 126, cancha: M + 196, tipo: M + 234,
    alumnos: M + 330, tarifa: M + 425, subtotal: A4.w - M - 8,
  }
  const encabezadoTabla = (y) => {
    rect(ops, M, y, anchoUtil, 22, NAVY)
    const o = { size: 8.5, bold: true, color: "#FFFFFF" }
    txt(ops, col.fecha, y + 14.5, "FECHA", o)
    txt(ops, col.dia, y + 14.5, "DÍA", o)
    txt(ops, col.hora, y + 14.5, "HORA", o)
    txt(ops, col.cancha, y + 14.5, "CANCHA", { ...o, align: "center" })
    txt(ops, col.tipo, y + 14.5, "TIPO", o)
    txt(ops, col.alumnos, y + 14.5, "ALUMNOS", { ...o, align: "center" })
    txt(ops, col.tarifa, y + 14.5, "TARIFA", { ...o, align: "right" })
    txt(ops, col.subtotal, y + 14.5, "SUBTOTAL", { ...o, align: "right" })
    return y + 22
  }
  const LIMITE = A4.h - 70
  const nuevaPagina = () => {
    ops = []
    paginas.push(ops)
    txt(ops, M, 44, `Reporte de uso de cancha · ${ddmmyyyy(desde)} al ${ddmmyyyy(hasta)} (continuación)`, { size: 9, color: GRIS })
    return 58
  }

  let y = by + bh + 22
  y = encabezadoTabla(y)
  if (res.lineas.length === 0) {
    txt(ops, M + 8, y + 18, "Sin clases cobrables en la semana.", { size: 10, color: GRIS })
    y += 28
  }
  res.lineas.forEach((l, i) => {
    if (y + 20 > LIMITE) { y = nuevaPagina(); y = encabezadoTabla(y) }
    if (i % 2 === 1) rect(ops, M, y, anchoUtil, 20, CLARO)
    const b = y + 13.5, o = { size: 9.5 }
    txt(ops, col.fecha, b, l.dia.f, o)
    txt(ops, col.dia, b, l.dia.diaFull, o)
    txt(ops, col.hora, b, l.hora, o)
    txt(ops, col.cancha, b, l.cancha || "—", { ...o, bold: !!l.cancha, align: "center", color: l.cancha ? NAVY : GRIS })
    txt(ops, col.tipo, b, ETIQUETA_TIPO[l.tipo] || l.tipo, o)
    txt(ops, col.alumnos, b, String(l.n), { ...o, bold: true, align: "center" })
    txt(ops, col.tarifa, b, gs(l.tarifa), { ...o, align: "right", color: GRIS })
    txt(ops, col.subtotal, b, gs(l.subtotal), { ...o, bold: true, align: "right" })
    y += 20
  })
  linea(ops, M, y, A4.w - M, y, BORDE, 0.8)

  // Detalle por tipo de turno + total
  const desglose = res.desglose || []
  if (y + 110 + desglose.length * 18 > LIMITE) y = nuevaPagina()
  y += 26
  const fila = (etq, valor, opts = {}) => {
    txt(ops, M + 8, y, etq, { size: opts.size || 10, bold: !!opts.bold, color: opts.color || NAVY })
    txt(ops, A4.w - M - 8, y, valor, { size: opts.size || 10, bold: !!opts.bold, align: "right", color: opts.color || NAVY })
    y += opts.salto || 18
  }
  const cd = { tipo: M + 8, horas: M + 200, alumnos: M + 270, tarifa: M + 390, monto: A4.w - M - 8 }
  const h = { size: 7.5, bold: true, color: BRONCE }
  txt(ops, cd.tipo, y, "DETALLE POR TIPO DE TURNO", h)
  txt(ops, cd.horas, y, "HORAS", { ...h, align: "center" })
  txt(ops, cd.alumnos, y, "ALUMNOS", { ...h, align: "center" })
  txt(ops, cd.tarifa, y, "TARIFA", { ...h, align: "right" })
  txt(ops, cd.monto, y, "MONTO", { ...h, align: "right" })
  y += 16
  for (const g of desglose) {
    txt(ops, cd.tipo, y, g.etiqueta, { size: 10 })
    txt(ops, cd.horas, y, String(g.horas), { size: 10, bold: true, align: "center" })
    txt(ops, cd.alumnos, y, String(g.alumnos), { size: 10, align: "center" })
    txt(ops, cd.tarifa, y, gs(g.tarifa), { size: 10, align: "right", color: GRIS })
    txt(ops, cd.monto, y, gs(g.monto), { size: 10, align: "right" })
    y += 18
  }
  txt(ops, cd.tipo, y, "Total", { size: 10, bold: true })
  txt(ops, cd.horas, y, String(res.horas), { size: 10, bold: true, align: "center" })
  txt(ops, cd.alumnos, y, String(res.alumnos), { size: 10, bold: true, align: "center" })
  y += 12
  linea(ops, M, y, A4.w - M, y, BRONCE, 1.2)
  y += 22
  fila("TOTAL A PAGAR", gs(res.total), { size: 13, bold: true, salto: 26 })

  if (res.pendientes && res.pendientes.length) {
    const aviso = `Atención: ${res.pendientes.length} asistencia${res.pendientes.length === 1 ? "" : "s"} sin horario identificado no ${res.pendientes.length === 1 ? "está incluida" : "están incluidas"} en este total.`
    for (const l of envolver(aviso, anchoUtil - 16, 9, true)) { txt(ops, M + 8, y, l, { size: 9, bold: true, color: ROJO }); y += 13 }
    y += 6
  }
  const criterio = "Criterio: se paga por alumno según el tipo de turno (individual o dual/grupal). Se incluyen las asistencias, las clases recuperadas y las ausencias sin aviso. Las clases reprogramadas con aviso no se cobran."
  for (const l of envolver(criterio, anchoUtil - 16, 8.5, false)) {
    if (y + 12 > LIMITE) y = nuevaPagina()
    txt(ops, M + 8, y, l, { size: 8.5, color: GRIS }); y += 12
  }

  // Pie en todas las páginas
  const gen = `${ddmmyyyy(generado)} ${pad(generado.getHours())}:${pad(generado.getMinutes())}`
  paginas.forEach((p, i) => {
    linea(p, M, A4.h - 46, A4.w - M, A4.h - 46, BORDE, 0.6)
    txt(p, M, A4.h - 32, `Generado el ${gen} · App Academia LR`, { size: 8, color: GRIS })
    txt(p, A4.w - M, A4.h - 32, `Página ${i + 1} de ${paginas.length}`, { size: 8, color: GRIS, align: "right" })
  })

  return serializar(paginas, logo, `Cancha ${ddmmyyyy(desde)} al ${ddmmyyyy(hasta)} - ${profe || ""}`)
}

export async function generarPdfCancha(datos, logoUrl) {
  const logo = logoUrl ? await logoJpeg(logoUrl) : null
  return aBlob(armarPdfCancha(datos, logo))
}
