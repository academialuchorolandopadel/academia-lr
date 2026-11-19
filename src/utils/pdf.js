// src/utils/pdf.js
//
// Motor de PDF propio, sin librerías: Helvetica estándar (codificación WinAnsi),
// textos, rectángulos, líneas y un logo JPEG. Lo usan los reportes de cancha y de evaluación.
// Coordenadas: x desde la izquierda, y desde ARRIBA de la hoja (en puntos; A4 = 595 × 842).

export const pad = (n) => String(n).padStart(2, "0")
export const ddmmyyyy = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`

// ─── PDF sin librerías (Helvetica estándar, codificación WinAnsi) ────────────
// Anchos de Helvetica / Helvetica-Bold para los códigos 32..255 (en milésimas de punto)
const W_REG  = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,0,556,0,222,556,333,1000,556,556,333,1000,667,333,1000,0,611,0,0,222,222,333,333,350,556,1000,333,1000,500,333,944,0,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500]
const W_BOLD = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,0,556,0,278,556,500,1000,556,556,333,1000,667,333,1000,0,611,0,0,278,278,500,500,350,556,1000,333,1000,556,333,944,0,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556]
const EXTRA = { "€":0x80,"‚":0x82,"ƒ":0x83,"„":0x84,"…":0x85,"†":0x86,"‡":0x87,"ˆ":0x88,"‰":0x89,"Š":0x8A,"‹":0x8B,"Œ":0x8C,"Ž":0x8E,
  "‘":0x91,"’":0x92,"“":0x93,"”":0x94,"•":0x95,"–":0x96,"—":0x97,"˜":0x98,"™":0x99,"š":0x9A,"›":0x9B,"œ":0x9C,"ž":0x9E,"Ÿ":0x9F }
// Símbolos que no existen en la fuente del PDF → su equivalente más cercano
const REEMPLAZOS = { "↔": "–", "→": "›", "←": "‹", "₲": "Gs.", "−": "-", "▲": "+", "▼": "-", "✓": "•", "★": "*" }
const normal = (str) => String(str).replace(/[↔→←₲−▲▼✓★]/g, ch => REEMPLAZOS[ch])
const codigo = (ch) => {
  const c = ch.charCodeAt(0)
  if ((c >= 32 && c <= 126) || (c >= 160 && c <= 255)) return c
  return EXTRA[ch] || 63 // "?"
}
export const ancho = (str, size, bold) => {
  const W = bold ? W_BOLD : W_REG
  let w = 0
  for (const ch of normal(str)) w += W[codigo(ch) - 32] || 556
  return (w * size) / 1000
}
export const pdfStr = (str) => {
  let out = ""
  for (const ch of normal(str)) {
    const s = String.fromCharCode(codigo(ch))
    out += (s === "(" || s === ")" || s === "\\") ? "\\" + s : s
  }
  return "(" + out + ")"
}
export const recortar = (str, maxW, size, bold) => {
  let s = String(str)
  if (ancho(s, size, bold) <= maxW) return s
  while (s.length > 1 && ancho(s + "…", size, bold) > maxW) s = s.slice(0, -1)
  return s + "…"
}
export const envolver = (str, maxW, size, bold) => {
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

export const A4 = { w: 595.28, h: 841.89 }
export const M  = 40
export const NAVY = "#09203E", BRONCE = "#A06D23", GRIS = "#5B6472", CLARO = "#F6F0E6", BORDE = "#DDD2BF", ROJO = "#B42318"
const rgb = (hex) => [1, 3, 5].map(i => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(3)).join(" ")
export const n2 = (v) => v.toFixed(2)

export function txt(ops, x, y, str, { size = 10, bold = false, color = NAVY, align = "left" } = {}) {
  const w = ancho(str, size, bold)
  const xx = align === "right" ? x - w : align === "center" ? x - w / 2 : x
  ops.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${rgb(color)} rg ${n2(xx)} ${n2(A4.h - y)} Td ${pdfStr(str)} Tj ET`)
}
export function rect(ops, x, y, w, h, color) {
  ops.push(`${rgb(color)} rg ${n2(x)} ${n2(A4.h - y - h)} ${n2(w)} ${n2(h)} re f`)
}
export function linea(ops, x1, y1, x2, y2, color, grosor = 0.6) {
  ops.push(`${rgb(color)} RG ${grosor} w ${n2(x1)} ${n2(A4.h - y1)} m ${n2(x2)} ${n2(A4.h - y2)} l S`)
}

// Arma el archivo PDF (string binario: 1 caracter = 1 byte)
export function serializar(paginas, logo, titulo) {
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
export async function logoJpeg(url) {
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

// String binario del PDF → archivo (Blob)
export function aBlob(bin) {
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
