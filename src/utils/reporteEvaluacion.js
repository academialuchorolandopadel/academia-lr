// src/utils/reporteEvaluacion.js
//
// PDF de una evaluación (prueba de nivel o trimestral) para entregarle al alumno:
// categoría F.A.P. por golpe y general, desplazamientos, otros parámetros y los
// textos del profe. Si hay una evaluación anterior, muestra cuánto cambió.
// Usa el motor propio de ./pdf.js (sin librerías).

import {
  GOLPES_CAT, CUANTIFICADORES, PARAMS_EXTRA, ESCALA_EXTRA, TESTS_DESPLAZ, PROTOCOLO_TESTS,
  NIVELES, catGolpe, fmtCat, fmtSeg, periodoEval, compararEval,
} from "../constants"
import {
  A4, M, NAVY, BRONCE, GRIS, CLARO, BORDE, pad, ddmmyyyy,
  txt, rect, linea, envolver, recortar, serializar, logoJpeg, aBlob,
} from "./pdf"

const VERDE = "#1E7B34", ROJO = "#B42318"
const fechaDe = (iso) => {
  const [y, m, d] = String(iso || "").split("-").map(Number)
  return y && m && d ? new Date(y, m - 1, d) : null
}
const fechaTxt = (iso) => { const d = fechaDe(iso); return d ? ddmmyyyy(d) : "" }
const coma = (n, dec) => n.toFixed(dec).replace(".", ",")
const conSigno = (n, dec) => (n > 0 ? "+" : n < 0 ? "-" : "") + coma(Math.abs(n), dec)

// Nombre de archivo sin tildes ni espacios: Evaluacion_Juan_Perez_2026-11-16.pdf
export const nombreArchivoEval = (alumno, ev) => {
  const limpio = String((alumno && alumno.nombre) || "alumno")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
  return `Evaluacion_${limpio || "alumno"}_${(ev && ev.fecha) || "sin-fecha"}.pdf`
}

// datos: { alumno, ev, prev (evaluación anterior o null), temas, profe, generado }
export function armarPdfEvaluacion(datos, logo = null) {
  const { alumno, ev, prev = null, temas = [], profe = "" } = datos
  const generado = datos.generado || new Date()
  const c = compararEval(ev, prev, temas)
  const inicial = ev.tipo === "inicial"
  const titulo = inicial ? "Prueba de nivel" : "Evaluación trimestral"
  const anchoUtil = A4.w - 2 * M
  const LIMITE = A4.h - 64
  const paginas = []
  let ops = []
  paginas.push(ops)
  let y = 0

  const nuevaPagina = () => {
    ops = []
    paginas.push(ops)
    txt(ops, M, 44, `${titulo} · ${alumno.nombre} (continuación)`, { size: 9, color: GRIS })
    y = 62
  }
  const asegurar = (alto) => { if (y + alto > LIMITE) nuevaPagina() }
  const seccion = (nombre, altoMinimo = 60) => {
    asegurar(altoMinimo + 28)
    y += 22
    txt(ops, M, y, nombre.toUpperCase(), { size: 9, bold: true, color: BRONCE })
    linea(ops, M, y + 6, A4.w - M, y + 6, BORDE, 0.8)
    y += 20
  }
  const parrafo = (texto, { size = 10, color = NAVY, bold = false, sangria = 0, interlinea } = {}) => {
    const alto = interlinea || size * 1.45
    for (const l of envolver(texto, anchoUtil - sangria, size, bold)) {
      asegurar(alto)
      txt(ops, M + sangria, y, l, { size, color, bold })
      y += alto
    }
  }

  // ── Encabezado ──────────────────────────────────────────────────────────────
  let xTitulo = M
  if (logo) {
    const lh = 40, lw = lh * logo.w / logo.h
    ops.push(`q ${lw.toFixed(2)} 0 0 ${lh} ${M} ${(A4.h - 30 - lh).toFixed(2)} cm /Logo Do Q`)
    xTitulo = M + lw + 12
  }
  txt(ops, xTitulo, 50, titulo, { size: 17, bold: true })
  txt(ops, xTitulo, 66, `Academia LR · ${inicial ? "Evaluación de punto de partida" : periodoEval(ev.fecha)}`, { size: 10, color: GRIS })
  const anchoDerecha = A4.w - M - (xTitulo + 170)
  txt(ops, A4.w - M, 42, "ALUMNO", { size: 8, bold: true, color: BRONCE, align: "right" })
  txt(ops, A4.w - M, 57, recortar(alumno.nombre, anchoDerecha, 12, true), { size: 12, bold: true, align: "right" })
  txt(ops, A4.w - M, 71, `${fechaTxt(ev.fecha)}${profe ? ` · Profe: ${profe}` : ""}`, { size: 9, color: GRIS, align: "right" })
  linea(ops, M, 86, A4.w - M, 86, BRONCE, 1.5)

  // ── Resumen ─────────────────────────────────────────────────────────────────
  const gap = 10, bw = (anchoUtil - 2 * gap) / 3, by = 100, bh = 62
  const cajas = [
    { l: "CATEGORÍA GENERAL", v: fmtCat(c.catGen), fuerte: true,
      sub: c.deltaCat != null ? `${conSigno(c.deltaCat, 1)} vs. anterior` : (c.catGen != null ? "Método F.A.P." : "Sin golpes evaluados") },
    { l: "PROGRESO TÉCNICO", v: `${ev.pct ?? 0}%`,
      sub: c.deltaPct != null ? `${c.deltaPct > 0 ? "+" : ""}${c.deltaPct} puntos vs. anterior` : "Mapa de habilidades" },
    { l: prev ? "COMPARADA CON" : "REFERENCIA", v: prev ? fechaTxt(prev.fecha) : "Punto de partida",
      sub: prev ? periodoEval(prev.fecha) : "Las próximas se comparan con esta" },
  ]
  cajas.forEach((k, i) => {
    const x = M + i * (bw + gap)
    rect(ops, x, by, bw, bh, k.fuerte ? NAVY : CLARO)
    txt(ops, x + 12, by + 17, k.l, { size: 7.5, bold: true, color: k.fuerte ? "#E4CFAB" : BRONCE })
    const vs = k.v.length > 10 ? 13 : 19
    txt(ops, x + 12, by + 40, recortar(k.v, bw - 24, vs, true), { size: vs, bold: true, color: k.fuerte ? "#FFFFFF" : NAVY })
    txt(ops, x + 12, by + 54, recortar(k.sub, bw - 24, 8, false), { size: 8, color: k.fuerte ? "#E4CFAB" : GRIS })
  })
  y = by + bh

  // ── Golpes (categorización F.A.P.) ──────────────────────────────────────────
  const hayGolpes = GOLPES_CAT.some(g => CUANTIFICADORES.some(q => ((ev.golpes || {})[g.id] || {})[q.id]))
  if (hayGolpes) {
    seccion("Golpes · categoría por cuantificador", 140)
    const cg = { golpe: M + 8, apt: M + 196, dir: M + 258, vel: M + 320, fac: M + 382, cat: A4.w - M - 8 }
    rect(ops, M, y, anchoUtil, 22, NAVY)
    const o = { size: 8, bold: true, color: "#FFFFFF" }
    txt(ops, cg.golpe, y + 14.5, "GOLPE", o)
    txt(ops, cg.apt, y + 14.5, "APTITUD", { ...o, align: "center" })
    txt(ops, cg.dir, y + 14.5, "DIRECCIÓN", { ...o, align: "center" })
    txt(ops, cg.vel, y + 14.5, "VELOCIDAD", { ...o, align: "center" })
    txt(ops, cg.fac, y + 14.5, "FACTOR", { ...o, align: "center" })
    txt(ops, cg.cat, y + 14.5, "CATEGORÍA", { ...o, align: "right" })
    y += 22
    GOLPES_CAT.forEach((g, i) => {
      const vals = (ev.golpes || {})[g.id] || {}
      const cat = catGolpe(ev, g.id)
      const dg = c.golpes ? c.golpes.find(x => x.id === g.id) : null
      if (i % 2 === 1) rect(ops, M, y, anchoUtil, 30, CLARO)
      txt(ops, cg.golpe, y + 13, g.nombre, { size: 10, bold: true })
      txt(ops, cg.golpe, y + 24, `Factor: ${g.factor}`, { size: 7.5, color: GRIS })
      const celda = (x, v) => txt(ops, x, y + 18, v ? `${v}ª` : "—", { size: 10, align: "center", color: v ? NAVY : GRIS })
      celda(cg.apt, vals.aptitud); celda(cg.dir, vals.direccion); celda(cg.vel, vals.velocidad); celda(cg.fac, vals.factor)
      if (dg && dg.delta != null && dg.delta !== 0) {
        const dt = `(${conSigno(dg.delta, 1)})`
        txt(ops, cg.cat, y + 18, dt, { size: 8.5, bold: true, color: dg.delta < 0 ? VERDE : ROJO, align: "right" })
        const anchoDt = 34
        txt(ops, cg.cat - anchoDt, y + 18, fmtCat(cat), { size: 11, bold: true, align: "right", color: cat != null ? NAVY : GRIS })
      } else {
        txt(ops, cg.cat, y + 18, fmtCat(cat), { size: 11, bold: true, align: "right", color: cat != null ? NAVY : GRIS })
      }
      y += 30
    })
    linea(ops, M, y, A4.w - M, y, BORDE, 0.8)
    y += 14
    parrafo("Escala del Método de Categorización F.A.P.: de 7ª (inicial) a 2ª (avanzado). Un número más bajo indica más nivel. Factor específico: continuidad en el smash, profundidad en la volea, error en la pegada de fondo y levantadas en la salida de pared.", { size: 8, color: GRIS })
  }

  // ── Desplazamientos ─────────────────────────────────────────────────────────
  const hayDesplaz = c.tests.some(t => t.nivel || t.prom != null)
  if (hayDesplaz) {
    seccion("Desplazamientos", 130)
    parrafo(`Protocolo: ${PROTOCOLO_TESTS}.`, { size: 8, color: GRIS })
    y += 4
    const cd = { test: M + 8, nivel: M + 150, r1: M + 245, r2: M + 293, r3: M + 341, prom: M + 412, dif: A4.w - M - 8 }
    rect(ops, M, y, anchoUtil, 22, NAVY)
    const o = { size: 8, bold: true, color: "#FFFFFF" }
    txt(ops, cd.test, y + 14.5, "TEST", o)
    txt(ops, cd.nivel, y + 14.5, "NIVEL", o)
    txt(ops, cd.r1, y + 14.5, "R1", { ...o, align: "center" })
    txt(ops, cd.r2, y + 14.5, "R2", { ...o, align: "center" })
    txt(ops, cd.r3, y + 14.5, "R3", { ...o, align: "center" })
    txt(ops, cd.prom, y + 14.5, "PROMEDIO", { ...o, align: "center" })
    txt(ops, cd.dif, y + 14.5, prev ? "CAMBIO" : "", { ...o, align: "right" })
    y += 22
    c.tests.forEach((t, i) => {
      const tiempos = (((ev.desplaz || {})[t.id] || {}).tiempos || [])
      if (i % 2 === 1) rect(ops, M, y, anchoUtil, 30, CLARO)
      txt(ops, cd.test, y + 13, t.nombre, { size: 10, bold: true })
      txt(ops, cd.test, y + 24, t.recorrido, { size: 7.5, color: GRIS })
      txt(ops, cd.nivel, y + 18, t.nivel ? NIVELES[t.nivel - 1] : "—", { size: 9.5, color: t.nivel ? NAVY : GRIS })
      ;[cd.r1, cd.r2, cd.r3].forEach((x, k) => {
        const v = Number(tiempos[k])
        txt(ops, x, y + 18, Number.isFinite(v) && v > 0 ? coma(v, 2) : "—", { size: 9.5, align: "center", color: GRIS })
      })
      txt(ops, cd.prom, y + 18, fmtSeg(t.prom), { size: 10, bold: true, align: "center", color: t.prom != null ? NAVY : GRIS })
      if (t.delta != null && t.delta !== 0) {
        txt(ops, cd.dif, y + 18, `${conSigno(t.delta, 2)} s`, { size: 9, bold: true, align: "right", color: t.delta < 0 ? VERDE : ROJO })
      } else if (t.delta === 0) {
        txt(ops, cd.dif, y + 18, "igual", { size: 9, align: "right", color: GRIS })
      }
      y += 30
    })
    linea(ops, M, y, A4.w - M, y, BORDE, 0.8)
    y += 14
    if (prev) parrafo("En el cambio, un valor negativo (verde) significa que fue más rápido que en la evaluación anterior.", { size: 8, color: GRIS })
  }

  // ── Otros parámetros ────────────────────────────────────────────────────────
  const extras = ev.extras || {}
  if (PARAMS_EXTRA.some(p => extras[p.id] > 0)) {
    seccion("Otros parámetros", 100)
    PARAMS_EXTRA.forEach(p => {
      asegurar(22)
      const v = Number(extras[p.id]) || 0
      txt(ops, M + 8, y + 4, p.nombre, { size: 10 })
      for (let k = 1; k <= 4; k++) rect(ops, M + 300 + (k - 1) * 22, y - 6, 18, 12, k <= v ? BRONCE : CLARO)
      txt(ops, A4.w - M - 8, y + 4, v ? ESCALA_EXTRA[v - 1] : "—", { size: 10, bold: !!v, align: "right", color: v ? NAVY : GRIS })
      y += 22
    })
  }

  // ── Golpes que subieron de nivel (mapa de habilidades) ─────────────────────
  if (prev && c.subieron.length) {
    seccion("Habilidades que subieron de nivel", 40)
    const corto = ["Intro", "Dominio", "Perfeccionamiento", "Máster"]
    parrafo(c.subieron.map(x => `${x.nombre}: ${x.antes ? corto[x.antes - 1] : "sin nivel"} > ${corto[x.ahora - 1]}`).join(" · "), { size: 9.5 })
  }

  // ── Textos del profe ────────────────────────────────────────────────────────
  for (const [nombre, texto] of [["Fortalezas", ev.fortalezas], ["A mejorar", ev.mejorar], ["Objetivos para el próximo trimestre", ev.objetivos]]) {
    if (!texto) continue
    seccion(nombre, 40)
    for (const par of String(texto).split(/\n+/)) { parrafo(par); y += 3 }
  }

  // ── Pie en todas las páginas ────────────────────────────────────────────────
  const gen = `${ddmmyyyy(generado)} ${pad(generado.getHours())}:${pad(generado.getMinutes())}`
  paginas.forEach((p, i) => {
    linea(p, M, A4.h - 46, A4.w - M, A4.h - 46, BORDE, 0.6)
    txt(p, M, A4.h - 32, `Academia LR · Generado el ${gen}`, { size: 8, color: GRIS })
    txt(p, A4.w - M, A4.h - 32, `Página ${i + 1} de ${paginas.length}`, { size: 8, color: GRIS, align: "right" })
  })

  return serializar(paginas, logo, `${titulo} - ${alumno.nombre} - ${fechaTxt(ev.fecha)}`)
}

export async function generarPdfEvaluacion(datos, logoUrl) {
  const logo = logoUrl ? await logoJpeg(logoUrl) : null
  return aBlob(armarPdfEvaluacion(datos, logo))
}
