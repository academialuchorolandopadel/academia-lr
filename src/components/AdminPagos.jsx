// src/components/AdminPagos.jsx
import { useState } from "react"
import { B, MESES, fmt, fmtFull, fmtFechaCorta, avatarColor } from "../constants"

const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` }
const inp = {width:"100%",margin:"4px 0 12px",padding:"10px",background:B.bg,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:14,outline:"none"}
const lbl = {fontSize:11,color:B.textSub,textTransform:"uppercase",letterSpacing:1}

export function AdminPagos({ students, onAddPayment, onUpdatePayment, onRemovePayment }) {
  const [nuevo, setNuevo]       = useState(false)
  const [sel, setSel]           = useState(null)
  const [editando, setEditando] = useState(false)

  const [fSid, setFSid]       = useState("")
  const [fMonto, setFMonto]   = useState("")
  const [fClases, setFClases] = useState("")
  const [fFecha, setFFecha]   = useState(hoyISO())

  const activos  = students.filter(s => !s.archivado)
  const conPagos = students.filter(s => (s.pagosDetalle || []).length > 0)
                           .sort((a,b) => a.nombre.localeCompare(b.nombre))
  const cols = MESES.filter(m => students.some(s => (s.pagosDetalle || []).some(p => p.mes === m)))
  const pagosDe = (s, m) => (s.pagosDetalle || []).filter(p => p.mes === m)
  const totalDe = (s) => (s.pagosDetalle || []).reduce((a,p) => a + (p.monto||0), 0)

  const mesNom  = MESES[new Date().getMonth()]
  const anioAct = new Date().getFullYear(), mesAct = new Date().getMonth()+1
  const cobradoMes = students.reduce((a,s) => a + (s.pagosDetalle||[])
    .filter(p => p.fecha && Number(p.fecha.slice(0,4))===anioAct && Number(p.fecha.slice(5,7))===mesAct)
    .reduce((b,p) => b + (p.monto||0), 0), 0)

  const abrirNuevo = () => { setFSid(""); setFMonto(""); setFClases(""); setFFecha(hoyISO()); setNuevo(true) }
  const guardarNuevo = () => {
    if (!fSid || !(Number(fMonto) > 0)) return
    onAddPayment(fSid, { monto: Number(fMonto), clases: Number(fClases)||0, fecha: fFecha })
    setNuevo(false)
  }
  const abrirPago = (s, p) => { setSel({ ...p, sid: s.id, nombre: s.nombre, iniciales: s.iniciales }); setEditando(false) }
  const abrirEditar = () => { setFMonto(String(sel.monto)); setFClases(sel.clases!=null?String(sel.clases):""); setFFecha(sel.fecha||hoyISO()); setEditando(true) }
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
          <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Cobrado en {mesNom}: <b style={{color:B.gold}}>{fmtFull(cobradoMes)}</b> · tocá un monto para ver el detalle</p>
        </div>
        <button onClick={abrirNuevo}
          style={{padding:"9px 16px",borderRadius:9,border:"none",background:B.gold,color:B.bgDark,fontSize:13,fontWeight:700,cursor:"pointer"}}>
          + Registrar pago
        </button>
      </div>

      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${B.border}`}}>
              <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase",whiteSpace:"nowrap"}}>Alumno</th>
              {cols.map(m => <th key={m} style={{padding:"10px 12px",textAlign:"right",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase",whiteSpace:"nowrap"}}>{m.slice(0,3)}</th>)}
              <th style={{padding:"10px 12px",textAlign:"right",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase"}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {conPagos.map((s,i) => (
              <tr key={s.id} style={{borderBottom:i<conPagos.length-1?`1px solid ${B.border}`:"none"}}>
                <td style={{padding:"11px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:26,height:26,background:avatarColor(s.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:B.gold,border:`1px solid ${B.border}`}}>{s.iniciales}</div>
                    <span style={{fontSize:12,color:B.text,whiteSpace:"nowrap"}}>{s.nombre}</span>
                  </div>
                </td>
                {cols.map(m => {
                  const pays = pagosDe(s, m)
                  return (
                    <td key={m} style={{padding:"8px 12px",textAlign:"right",verticalAlign:"top"}}>
                      {pays.length === 0
                        ? <span style={{fontSize:12,color:B.textMuted}}>—</span>
                        : <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end"}}>
                            {pays.map((p,j) => (
                              <button key={p.id||j} onClick={()=>abrirPago(s,p)}
                                style={{background:"transparent",border:"none",padding:0,cursor:"pointer",fontSize:12,color:B.gold,fontWeight:500,textDecoration:pays.length>1?"underline":"none"}}>
                                {fmt(p.monto)}
                              </button>
                            ))}
                          </div>}
                    </td>
                  )
                })}
                <td style={{padding:"11px 12px",textAlign:"right"}}>
                  <span style={{fontSize:12,fontWeight:700,color:B.text}}>{fmt(totalDe(s))}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{borderTop:`1px solid ${B.border}`,background:B.bg}}>
              <td style={{padding:"10px 16px",fontSize:11,fontWeight:700,color:B.textSub}}>TOTALES</td>
              {cols.map(m => {
                const t = conPagos.reduce((a,s) => a + pagosDe(s,m).reduce((b,p)=>b+(p.monto||0),0), 0)
                return <td key={m} style={{padding:"10px 12px",textAlign:"right",fontSize:11,fontWeight:700,color:B.gold}}>{t?fmt(t):"—"}</td>
              })}
              <td style={{padding:"10px 12px",textAlign:"right",fontSize:12,fontWeight:700,color:B.gold}}>
                {fmt(conPagos.reduce((a,s)=>a+totalDe(s),0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {conPagos.length===0 && <div style={{fontSize:13,color:B.textMuted,marginTop:14}}>Sin pagos registrados todavía.</div>}

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
