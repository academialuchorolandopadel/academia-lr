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
// También arma el reporte semanal en PDF sin librerías externas.

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
export const toMin = (h) => { const [a, b] = String(h).split(":").map(Number); return (a || 0) * 60 + (b || 0) }

// Días Lun–Sáb de una semana (offset en semanas respecto de la actual)
export function diasDeSemana(offset = 0, hoy = new Date()) {
  const dow = hoy.getDay()
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + (dow === 0 ? -6 : 1 - dow) + offset * 7)
  return DIAS.map((diaFull, i) => {
    const d = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i)
    return { f: ddmm(d), dia: CORTOS[i], diaFull, date: d }
  })
}

// Todos los días Lun–Sáb del mes de 'ref'
export function diasDelMes(ref = new Date()) {
  const out = []
  const d = new Date(ref.getFullYear(), ref.getMonth(), 1)
  while (d.getMonth() === ref.getMonth()) {
    const dow = d.getDay()
    if (dow !== 0) out.push({ f: ddmm(d), dia: CORTOS[dow - 1], diaFull: DIAS[dow - 1], date: new Date(d) })
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
      return { ...l, n, tarifa, subtotal: n * tarifa }
    })
  const sum = (arr, k) => arr.reduce((a, x) => a + x[k], 0)
  const ind = lista.filter(l => esIndividual(l.tipo))
  const grp = lista.filter(l => !esIndividual(l.tipo))
  return {
    lineas: lista, pendientes, excluidos,
    horas: lista.length,
    alumnos: sum(lista, "n"),
    individual: { n: sum(ind, "n"), monto: sum(ind, "subtotal") },
    grupal:     { n: sum(grp, "n"), monto: sum(grp, "subtotal") },
    total: sum(lista, "subtotal"),
  }
}

// ─── PDF sin librerías (Helvetica estándar, codificación WinAnsi) ────────────
// Anchos de Helvetica / Helvetica-Bold para los códigos 32..255 (en milésimas de punto)
const W_REG  = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,0,556,0,222,556,333,1000,556,556,333,1000,667,333,1000,0,611,0,0,222,222,333,333,350,556,1000,333,1000,500,333,944,0,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500]
const W_BOLD = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,0,556,0,278,556,500,1000,556,556,333,1000,667,333,1000,0,611,0,0,278,278,500,500,350,556,1000,333,1000,556,333,944,0,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556]
const EXTRA = { "€":0x80,"‚":0x82,"„":0x84,"…":0x85,"‘":0x91,"’":0x92,"“":0x93,"”":0x94,"•":0x95,"–":0x96,"—":0x97,"™":0x99 }
const codigo = (ch) => {
  const c = ch.charCodeAt(0)
  if ((c >= 32 && c <= 126) || (c >= 160 && c <= 255)) return c
  return EXTRA[ch] || 63 // "?"
}
const ancho = (str, size, bold) => {
  const W = bold ? W_BOLD : W_REG
  let w = 0
  for (const ch of String(str)) w += W[codigo(ch) - 32] || 556
  return (w * size) / 1000
}
const pdfStr = (str) => {
  let out = ""
  for (const ch of String(str)) {
    const s = String.fromCharCode(codigo(ch))
    out += (s === "(" || s === ")" || s === "\\") ? "\\" + s : s
  }
  return "(" + out + ")"
}
const recortar = (str, maxW, size, bold) => {
  let s = String(str)
  if (ancho(s, size, bold) <= maxW) return s
  while (s.length > 1 && ancho(s + "…", size, bold) > maxW) s = s.slice(0, -1)
  return s + "…"
}
const envolver = (str, maxW, size, bold) => {
  const lineas = []
  let actual = ""
  for (const p of String(str).split(" ")) {
    const prueba = actual ? actual + " " + p : p
    if (ancho(prueba, size, bold) > maxW && actual) { lineas.push(actual); actual = p }
    else actual = prueba
  }
  if (actual) lineas.push(actual)
  return lineas
}

const A4 = { w: 595.28, h: 841.89 }
const M  = 40
const NAVY = "#09203E", BRONCE = "#A06D23", GRIS = "#5B6472", CLARO = "#F6F0E6", BORDE = "#DDD2BF", ROJO = "#B42318"
const rgb = (hex) => [1, 3, 5].map(i => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(3)).join(" ")
const n2 = (v) => v.toFixed(2)

function txt(ops, x, y, str, { size = 10, bold = false, color = NAVY, align = "left" } = {}) {
  const w = ancho(str, size, bold)
  const xx = align === "right" ? x - w : align === "center" ? x - w / 2 : x
  ops.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${rgb(color)} rg ${n2(xx)} ${n2(A4.h - y)} Td ${pdfStr(str)} Tj ET`)
}
function rect(ops, x, y, w, h, color) {
  ops.push(`${rgb(color)} rg ${n2(x)} ${n2(A4.h - y - h)} ${n2(w)} ${n2(h)} re f`)
}
function linea(ops, x1, y1, x2, y2, color, grosor = 0.6) {
  ops.push(`${rgb(color)} RG ${grosor} w ${n2(x1)} ${n2(A4.h - y1)} m ${n2(x2)} ${n2(A4.h - y2)} l S`)
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
    fecha: M + 8, dia: M + 72, hora: M + 148, tipo: M + 200,
    alumnos: M + 318, tarifa: M + 420, subtotal: A4.w - M - 8,
  }
  const encabezadoTabla = (y) => {
    rect(ops, M, y, anchoUtil, 22, NAVY)
    const o = { size: 8.5, bold: true, color: "#FFFFFF" }
    txt(ops, col.fecha, y + 14.5, "FECHA", o)
    txt(ops, col.dia, y + 14.5, "DÍA", o)
    txt(ops, col.hora, y + 14.5, "HORA", o)
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
    txt(ops, col.tipo, b, ETIQUETA_TIPO[l.tipo] || l.tipo, o)
    txt(ops, col.alumnos, b, String(l.n), { ...o, bold: true, align: "center" })
    txt(ops, col.tarifa, b, gs(l.tarifa), { ...o, align: "right", color: GRIS })
    txt(ops, col.subtotal, b, gs(l.subtotal), { ...o, bold: true, align: "right" })
    y += 20
  })
  linea(ops, M, y, A4.w - M, y, BORDE, 0.8)

  // Totales
  if (y + 120 > LIMITE) y = nuevaPagina()
  y += 26
  const fila = (etq, valor, opts = {}) => {
    txt(ops, M + 8, y, etq, { size: opts.size || 10, bold: !!opts.bold, color: opts.color || NAVY })
    txt(ops, A4.w - M - 8, y, valor, { size: opts.size || 10, bold: !!opts.bold, align: "right", color: opts.color || NAVY })
    y += opts.salto || 18
  }
  fila(`Clases individuales: ${res.individual.n} × ${gs(tarifas.individual)}`, gs(res.individual.monto))
  fila(`Clases dual / grupal: ${res.grupal.n} × ${gs(tarifas.grupal)}`, gs(res.grupal.monto), { salto: 12 })
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

// Arma el archivo PDF (string binario: 1 caracter = 1 byte)
function serializar(paginas, logo, titulo) {
  const obj = []
  obj[1] = "<< /Type /Catalog /Pages 2 0 R >>"
  obj[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
  obj[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
  let sig = 5
  let xobj = ""
  if (logo) {
    obj[sig] = `<< /Type /XObject /Subtype /Image /Width ${logo.w} /Height ${logo.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.data.length} >>\nstream\n${logo.data}\nendstream`
    xobj = ` /XObject << /Logo ${sig} 0 R >>`
    sig++
  }
  const kids = []
  for (const ops of paginas) {
    const contenido = ops.join("\n")
    const pg = sig, ct = sig + 1
    sig += 2
    obj[pg] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4.w} ${A4.h}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >>${xobj} >> /Contents ${ct} 0 R >>`
    obj[ct] = `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`
    kids.push(`${pg} 0 R`)
  }
  obj[2] = `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${kids.length} >>`
  const info = sig++
  obj[info] = `<< /Title ${pdfStr(titulo)} /Producer (Academia LR) >>`

  let out = "%PDF-1.4\n%âãÏÓ\n"
  const offs = []
  for (let i = 1; i < sig; i++) {
    offs[i] = out.length
    out += `${i} 0 obj\n${obj[i]}\nendobj\n`
  }
  const xref = out.length
  out += `xref\n0 ${sig}\n0000000000 65535 f \n`
  for (let i = 1; i < sig; i++) out += String(offs[i]).padStart(10, "0") + " 00000 n \n"
  out += `trailer\n<< /Size ${sig} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return out
}

// ─── Solo en el navegador ─────────────────────────────────────────────────────
// Convierte el logo PNG a JPEG (fondo blanco) para poder incrustarlo en el PDF
async function logoJpeg(url) {
  try {
    const img = await new Promise((ok, mal) => {
      const i = new Image()
      i.onload = () => ok(i)
      i.onerror = mal
      i.src = url
    })
    const escala = Math.min(1, 240 / img.naturalWidth)
    const w = Math.round(img.naturalWidth * escala), h = Math.round(img.naturalHeight * escala)
    const cv = document.createElement("canvas")
    cv.width = w; cv.height = h
    const ctx = cv.getContext("2d")
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    return { data: atob(cv.toDataURL("image/jpeg", 0.92).split(",")[1]), w, h }
  } catch (e) {
    return null // sin logo, el PDF sale igual
  }
}

export async function generarPdfCancha(datos, logoUrl) {
  const logo = logoUrl ? await logoJpeg(logoUrl) : null
  const bin = armarPdfCancha(datos, logo)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) & 0xff
  return new Blob([bytes], { type: "application/pdf" })
}

// ¿El celu permite compartir archivos (WhatsApp, Drive, etc.)?
export function puedeCompartirArchivos() {
  try {
    return !!(navigator.canShare && navigator.canShare({ files: [new File(["x"], "x.pdf", { type: "application/pdf" })] }))
  } catch (e) { return false }
}

// modo "compartir" abre el menú de compartir del celu; "descargar" baja el archivo
export async function entregarPdf(blob, nombre, modo = "descargar") {
  if (modo === "compartir") {
    try {
      await navigator.share({ files: [new File([blob], nombre, { type: "application/pdf" })], title: nombre })
      return "ok"
    } catch (e) {
      if (e && e.name === "AbortError") return "cancelado"
      // si falla, cae a descargar
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
  return "ok"
}
