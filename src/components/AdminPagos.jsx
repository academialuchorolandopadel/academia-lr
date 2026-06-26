// src/components/AdminPagos.jsx
import { useState } from "react"
import { B, MESES, fmt, fmtFull, fmtFechaCorta, avatarColor } from "../constants"

const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` }
const inp = {width:"100%",margin:"4px 0 12px",padding:"10px",background:B.bg,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:14,outline:"none"}
const lbl = {fontSize:11,color:B.textSub,textTransform:"uppercase",letterSpacing:1}

export function AdminPagos({ students, onAddPayment, onUpdatePayment, onRemovePayment }) {
  const [search, setSearch] = useState("")
  const [nuevo, setNuevo]   = useState(false)
  const [sel, setSel]       = useState(null)      // registro seleccionado
  const [editando, setEditando] = useState(false)

  // form
  const [fSid, setFSid]       = useState("")
  const [fMonto, setFMonto]   = useState("")
  const [fClases, setFClases] = useState("")
  const [fFecha, setFFecha]   = useState(hoyISO())

  const activos = students.filter(s => !s.archivado)

  // lista plana de todos los pagos
  const registros = []
  students.forEach(s => (s.pagosDetalle || []).forEach(pg =>
    registros.push({ ...pg, sid: s.id, nombre: s.nombre, iniciales: s.iniciales })))
  registros.sort((a,b) => String(b.fecha||"").localeCompare(String(a.fecha||"")))
  const filtrados = registros.filter(r => r.nombre.toLowerCase().includes(search.toLowerCase()))

  // cobrado este mes
  const mesNom = MESES[new Date().getMonth()]
  const anioAct = new Date().getFullYear()
  const cobradoMes = registros
    .filter(r => r.fecha && Number(r.fecha.slice(0,4))===anioAct && Number(r.fecha.slice(5,7))===new Date().getMonth()+1)
    .reduce((a,r) => a + (r.monto||0), 0)

  const abrirNuevo = () => {
    setFSid(""); setFMonto(""); setFClases(""); setFFecha(hoyISO()); setNuevo(true)
  }
  const guardarNuevo = () => {
    if (!fSid || !(Number(fMonto) > 0)) return
    onAddPayment(fSid, { monto: Number(fMonto), clases: Number(fClases)||0, fecha: fFecha })
    setNuevo(false)
  }
  const abrirEditar = () => {
    setFMonto(String(sel.monto)); setFClases(sel.clases!=null?String(sel.clases):""); setFFecha(sel.fecha||hoyISO()); setEditando(true)
  }
  const guardarEdit = () => {
    if (!(Number(fMonto) > 0)) return
    onUpdatePayment(sel.sid, sel.id, { monto: Number(fMonto), clases: Number(fClases)||0, fecha: fFecha })
    setSel(null); setEditando(false)
  }
  const quitar = () => {
    if (window.confirm(`¿Quitar este pago de ${sel.nombre}? Se descuentan sus clases del paquete.`)) {
      onRemovePayment(sel.sid, sel.id); setSel(null); setEditando(false)
    }
  }
  const cerrar = () => { setNuevo(false); setSel(null); setEditando(false) }

  return (
    <div style={{padding:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Pagos</h1>
          <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Cobrado en {mesNom}: <b style={{color:B.gold}}>{fmtFull(cobradoMes)}</b></p>
        </div>
        <button onClick={abrirNuevo}
          style={{padding:"9px 16px",borderRadius:9,border:"none",background:B.gold,color:B.bgDark,fontSize:13,fontWeight:700,cursor:"pointer"}}>
          + Registrar pago
        </button>
      </div>

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar por alumno..."
        style={{width:"100%",padding:"9px 12px",marginBottom:14,background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:13,outline:"none"}}/>

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtrados.length===0 && <div style={{fontSize:13,color:B.textMuted,padding:"8px 2px"}}>Sin pagos registrados todavía.</div>}
        {filtrados.map((r,i) => (
          <div key={r.sid+"-"+(r.id||i)} onClick={()=>{ setSel(r); setEditando(false) }}
            style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:30,height:30,background:avatarColor(r.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:B.gold,border:`1px solid ${B.border}`,flexShrink:0}}>{r.iniciales}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,color:B.text,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.nombre}</div>
              <div style={{fontSize:11,color:B.textSub}}>{fmtFechaCorta(r.fecha)} · {r.clases!=null?`${r.clases} clase${r.clases===1?"":"s"}`:"clases s/d"}</div>
            </div>
            <div style={{fontSize:14,fontWeight:700,color:B.gold,flexShrink:0}}>{fmt(r.monto)}</div>
          </div>
        ))}
      </div>

      {/* Modal registrar nuevo */}
      {nuevo && (
        <div onClick={cerrar} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:B.bgCard,border:`1px solid ${B.goldBorder}`,borderRadius:16,padding:22,width:"100%",maxWidth:360,maxHeight:"88vh",overflowY:"auto"}}>
            <div style={{fontSize:15,fontWeight:700,color:B.gold,marginBottom:14}}>Registrar pago (nuevo paquete)</div>
            <label style={lbl}>Alumno</label>
            <select value={fSid} onChange={e=>setFSid(e.target.value)} style={inp}>
              <option value="">Elegí un alumno…</option>
              {activos.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
            <label style={lbl}>Monto (₲)</label>
            <input type="number" inputMode="numeric" value={fMonto} onChange={e=>setFMonto(e.target.value)} placeholder="650000" style={inp}/>
            <label style={lbl}>Clases que cubre este pago</label>
            <input type="number" inputMode="numeric" value={fClases} onChange={e=>setFClases(e.target.value)} placeholder="8" style={inp}/>
            <label style={lbl}>Fecha del pago (inicio del paquete)</label>
            <input type="date" value={fFecha} onChange={e=>setFFecha(e.target.value)} style={inp}/>
            <button onClick={guardarNuevo} style={{width:"100%",padding:"11px",borderRadius:9,border:"none",background:B.gold,color:B.bgDark,fontSize:14,fontWeight:700,cursor:"pointer"}}>Guardar paquete</button>
            <button onClick={cerrar} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:9,border:`1px solid ${B.border}`,background:"transparent",color:B.textSub,fontSize:13,cursor:"pointer"}}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Modal ver / editar pago guardado */}
      {sel && (
        <div onClick={cerrar} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:B.bgCard,border:`1px solid ${B.goldBorder}`,borderRadius:16,padding:22,width:"100%",maxWidth:360,maxHeight:"88vh",overflowY:"auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <div style={{width:36,height:36,background:avatarColor(sel.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>{sel.iniciales}</div>
              <div style={{fontSize:15,fontWeight:700,color:B.text}}>{sel.nombre}</div>
            </div>

            {!editando ? (
              <>
                <div style={{background:B.bg,border:`1px solid ${B.border}`,borderRadius:12,padding:16,marginBottom:14}}>
                  <div style={{fontSize:10,color:B.textSub,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Paquete registrado</div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8}}>
                    <span style={{color:B.textSub}}>Fecha (inicio)</span><span style={{color:B.text,fontWeight:600}}>{fmtFechaCorta(sel.fecha)}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8}}>
                    <span style={{color:B.textSub}}>Monto</span><span style={{color:B.gold,fontWeight:700}}>{fmtFull(sel.monto)}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                    <span style={{color:B.textSub}}>Clases pagadas</span><span style={{color:B.text,fontWeight:600}}>{sel.clases!=null?sel.clases:"no especificado"}</span>
                  </div>
                </div>
                <button onClick={abrirEditar} style={{width:"100%",padding:"11px",borderRadius:9,border:"none",background:B.gold,color:B.bgDark,fontSize:14,fontWeight:700,cursor:"pointer"}}>Editar</button>
                <button onClick={quitar} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:9,border:`1px solid ${B.dangerBorder}`,background:B.dangerBg,color:"#f87171",fontSize:13,fontWeight:600,cursor:"pointer"}}>Quitar pago</button>
                <button onClick={cerrar} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:9,border:`1px solid ${B.border}`,background:"transparent",color:B.textSub,fontSize:13,cursor:"pointer"}}>Cerrar</button>
              </>
            ) : (
              <>
                <label style={lbl}>Monto (₲)</label>
                <input type="number" inputMode="numeric" value={fMonto} onChange={e=>setFMonto(e.target.value)} style={inp}/>
                <label style={lbl}>Clases que cubre este pago</label>
                <input type="number" inputMode="numeric" value={fClases} onChange={e=>setFClases(e.target.value)} style={inp}/>
                <label style={lbl}>Fecha del pago (inicio del paquete)</label>
                <input type="date" value={fFecha} onChange={e=>setFFecha(e.target.value)} style={inp}/>
                <button onClick={guardarEdit} style={{width:"100%",padding:"11px",borderRadius:9,border:"none",background:B.gold,color:B.bgDark,fontSize:14,fontWeight:700,cursor:"pointer"}}>Guardar cambios</button>
                <button onClick={()=>setEditando(false)} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:9,border:`1px solid ${B.border}`,background:"transparent",color:B.textSub,fontSize:13,cursor:"pointer"}}>Volver</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
