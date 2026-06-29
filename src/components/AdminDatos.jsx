// src/components/AdminDatos.jsx
import { B, fmtFull, fmtFechaCorta } from "../constants"

const hoyTxt = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` }

const esc = (v) => {
  const s = v == null ? "" : String(v)
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s
}
const toCSV = (headers, rows) =>
  "\uFEFF" + [headers.join(";"), ...rows.map(r => r.map(esc).join(";"))].join("\n")

const descargar = (nombre, contenido, tipo) => {
  try {
    const blob = new Blob([contenido], { type: tipo })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = nombre; document.body.appendChild(a); a.click()
    setTimeout(() => { URL.revokeObjectURL(url); a.remove() }, 1500)
  } catch (e) { alert("No se pudo descargar el archivo.") }
}

export function AdminDatos({ students, schedule, planes, consejos, income }) {
  const fecha = hoyTxt()

  const backupCompleto = () => {
    const data = {
      app: "Academia LR",
      exportado: new Date().toISOString(),
      alumnos: students,
      agenda: schedule,
      planes,
      consejos,
      ingresos: income,
    }
    descargar(`academia-lr-backup-${fecha}.json`, JSON.stringify(data, null, 2), "application/json")
  }

  const exportarAlumnos = () => {
    const headers = ["Nombre","Plan","Estado","Abonadas","Realizadas","Disponibles","Telefono","Email","PIN","Archivado"]
    const rows = [...students]
      .sort((a,b)=>a.nombre.localeCompare(b.nombre))
      .map(s => [s.nombre, s.plan, s.estado, s.abonadas, s.realizadas, (s.abonadas-s.realizadas), s.tel||"", s.email||"", s.pin||"", s.archivado?"Sí":"No"])
    descargar(`alumnos-${fecha}.csv`, toCSV(headers, rows), "text/csv")
  }

  const exportarPagos = () => {
    const headers = ["Alumno","Fecha","Mes","Monto","Clases"]
    const rows = []
    students.forEach(s => (s.pagosDetalle||[]).forEach(p =>
      rows.push([s.nombre, p.fecha?fmtFechaCorta(p.fecha):"", p.mes||"", p.monto||0, p.clases!=null?p.clases:""])))
    rows.sort((a,b)=> String(a[0]).localeCompare(String(b[0])))
    descargar(`pagos-${fecha}.csv`, toCSV(headers, rows), "text/csv")
  }

  const exportarAsistencia = () => {
    const headers = ["Alumno","Fecha","Marca"]
    const rows = []
    students.forEach(s => (s.asistencia||[]).forEach(a =>
      rows.push([s.nombre, a.f, a.m])))
    rows.sort((a,b)=> String(a[0]).localeCompare(String(b[0])))
    descargar(`asistencia-${fecha}.csv`, toCSV(headers, rows), "text/csv")
  }

  const totalPagos = students.reduce((acc,s)=> acc + (s.pagosDetalle||[]).reduce((b,p)=>b+(p.monto||0),0), 0)

  const Card = ({ titulo, desc, boton, onClick, destacado }) => (
    <div style={{background:B.bgCard,border:`1px solid ${destacado?B.goldBorder:B.border}`,borderRadius:12,padding:18,display:"flex",flexDirection:"column",gap:10}}>
      <div>
        <div style={{fontSize:14,fontWeight:700,color:B.text,marginBottom:4}}>{titulo}</div>
        <div style={{fontSize:12,color:B.textSub,lineHeight:1.5}}>{desc}</div>
      </div>
      <button onClick={onClick}
        style={{padding:"10px",borderRadius:9,border:destacado?"none":`1px solid ${B.border}`,background:destacado?B.gold:"transparent",color:destacado?B.bgDark:B.text,fontSize:13,fontWeight:700,cursor:"pointer"}}>
        {boton}
      </button>
    </div>
  )

  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:18}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Datos y copias</h1>
        <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Descargá una copia de seguridad cada tanto y guardala en un lugar seguro</p>
      </div>

      <div style={{background:B.bg,border:`1px solid ${B.border}`,borderRadius:12,padding:"12px 16px",marginBottom:18,fontSize:12,color:B.textSub}}>
        {students.length} alumnos · {students.reduce((a,s)=>a+(s.pagosDetalle||[]).length,0)} pagos registrados · {fmtFull(totalPagos)} en pagos
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:560}}>
        <Card destacado
          titulo="Copia de seguridad completa (JSON)"
          desc="Guarda TODO: alumnos, asistencia, pagos, agenda, planes y consejos. Es el respaldo principal por si algo se borra o se daña. Hacelo una vez por semana o por mes."
          boton="⬇ Descargar copia completa"
          onClick={backupCompleto}/>
        <Card
          titulo="Alumnos (Excel / CSV)"
          desc="Listado de alumnos con plan, estado, clases y contacto. Se abre en Excel o Google Sheets."
          boton="⬇ Descargar alumnos"
          onClick={exportarAlumnos}/>
        <Card
          titulo="Pagos (Excel / CSV)"
          desc="Todos los pagos con alumno, fecha, monto y clases. Útil para tu contabilidad."
          boton="⬇ Descargar pagos"
          onClick={exportarPagos}/>
        <Card
          titulo="Asistencia (Excel / CSV)"
          desc="Todas las marcas de asistencia (fecha y resultado) de cada alumno."
          boton="⬇ Descargar asistencia"
          onClick={exportarAsistencia}/>
      </div>

      <div style={{fontSize:11,color:B.textMuted,marginTop:18,maxWidth:560,lineHeight:1.6}}>
        La copia completa (JSON) es la que sirve para restaurar si pasa algo. Los archivos de Excel son para consultar o llevar tu contabilidad aparte. Los archivos quedan en la carpeta de Descargas de tu dispositivo.
      </div>
    </div>
  )
}
