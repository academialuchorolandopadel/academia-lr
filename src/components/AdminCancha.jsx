// src/components/AdminCancha.jsx
import { useState, useMemo } from "react"
import { B, DIAS_LABEL, avatarColor, fmt, fmtFull } from "../constants"

const MARCAS_CANCHA = ["P", "I", "R"] // ocuparon la cancha; X (reprogramada) no cuenta

export function AdminCancha({ students, rate, onSaveRate }) {
  const [wk, setWk] = useState(0)
  const [editRate, setEditRate] = useState(false)
  const [rateTxt, setRateTxt] = useState(String(rate))

  // Semana Lun–Sáb (misma lógica que Asistencia)
  const cols = useMemo(() => {
    const cortos = ["Lun","Mar","Mié","Jue","Vie","Sáb"]
    const base = new Date()
    const dow  = base.getDay()
    const toMon = (dow === 0 ? -6 : 1 - dow)
    const monday = new Date(base); monday.setDate(base.getDate() + toMon + wk * 7)
    return cortos.map((dia, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i)
      const f = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`
      return { f, dia, diaFull: DIAS_LABEL[i] }
    })
  }, [wk])
  const weekDates = cols.map(c => c.f)

  const cuenta = (s, fechas) => (s.asistencia || []).filter(a => fechas.includes(a.f) && MARCAS_CANCHA.includes(a.m)).length

  // Por alumno en la semana
  const perStudent = students.map(s => ({ s, n: cuenta(s, weekDates) })).filter(x => x.n > 0).sort((a,b) => b.n - a.n)
  const clasesSemana = perStudent.reduce((a,x) => a + x.n, 0)
  const feeSemana = clasesSemana * rate

  // Total del mes actual (por MM de la fecha DD/MM)
  const mm = String(new Date().getMonth() + 1).padStart(2, "0")
  const clasesMes = students.reduce((a,s) => a + (s.asistencia || []).filter(x => x.f && x.f.slice(3,5) === mm && MARCAS_CANCHA.includes(x.m)).length, 0)
  const feeMes = clasesMes * rate

  const guardarRate = () => { onSaveRate(Number(rateTxt) || 0); setEditRate(false) }

  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Cancha a pagar al club</h1>
        <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Se cuenta cada clase que ocupó la cancha (presente, ausente sin aviso y recuperada). La reprogramada con aviso no cuenta.</p>
      </div>

      {/* Valor por clase, editable */}
      <div style={{display:"flex",alignItems:"center",gap:10,background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:"12px 16px",marginBottom:16,maxWidth:420,flexWrap:"wrap"}}>
        <span style={{fontSize:13,color:B.textSub}}>Valor por clase:</span>
        {!editRate ? (
          <>
            <span style={{fontSize:16,fontWeight:700,color:B.gold}}>{fmtFull(rate)}</span>
            <button onClick={()=>{ setRateTxt(String(rate)); setEditRate(true) }}
              style={{marginLeft:"auto",padding:"5px 12px",borderRadius:8,border:`1px solid ${B.border}`,background:"transparent",color:B.textSub,fontSize:12,cursor:"pointer"}}>Editar</button>
          </>
        ) : (
          <>
            <input type="number" inputMode="numeric" value={rateTxt} onChange={e=>setRateTxt(e.target.value)} autoFocus
              style={{width:120,padding:"7px 10px",background:B.bg,border:`1px solid ${B.goldBorder}`,borderRadius:8,color:B.text,fontSize:14,outline:"none"}}/>
            <button onClick={guardarRate} style={{padding:"7px 12px",borderRadius:8,border:"none",background:B.gold,color:B.bgDark,fontSize:12,fontWeight:700,cursor:"pointer"}}>Guardar</button>
            <button onClick={()=>setEditRate(false)} style={{padding:"7px 10px",borderRadius:8,border:`1px solid ${B.border}`,background:"transparent",color:B.textSub,fontSize:12,cursor:"pointer"}}>Cancelar</button>
          </>
        )}
      </div>

      {/* Total del mes */}
      <div style={{background:B.goldBg,border:`1px solid ${B.goldBorder}`,borderRadius:16,padding:"18px 22px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,maxWidth:560}}>
        <div>
          <div style={{fontSize:10,color:B.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>A pagar este mes</div>
          <div style={{fontSize:30,fontWeight:800,color:B.text}}>{fmtFull(feeMes)}</div>
          <div style={{fontSize:12,color:B.textSub,marginTop:3}}>{clasesMes} clase{clasesMes===1?"":"s"} × {fmt(rate)}</div>
        </div>
        <span style={{fontSize:34}}>🏟️</span>
      </div>

      {/* Navegador de semana */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,maxWidth:560}}>
        <button onClick={()=>setWk(wk-1)} style={{padding:"7px 12px",borderRadius:8,border:`1px solid ${B.border}`,background:B.bgCard,color:B.text,fontSize:13,cursor:"pointer"}}>◀ Semana</button>
        <span style={{fontSize:12,color:B.textSub}}>{cols[0].f} al {cols[5].f}{wk!==0 && <button onClick={()=>setWk(0)} style={{marginLeft:8,padding:"4px 9px",borderRadius:7,border:`1px solid ${B.goldBorder}`,background:B.goldBg,color:B.gold,fontSize:11,cursor:"pointer",fontWeight:600}}>Hoy</button>}</span>
        <button onClick={()=>setWk(wk+1)} style={{padding:"7px 12px",borderRadius:8,border:`1px solid ${B.border}`,background:B.bgCard,color:B.text,fontSize:13,cursor:"pointer"}}>Semana ▶</button>
      </div>

      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:"14px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:560}}>
        <div style={{fontSize:13,color:B.textSub}}>Esta semana: <b style={{color:B.text}}>{clasesSemana}</b> clase{clasesSemana===1?"":"s"}</div>
        <div style={{fontSize:18,fontWeight:800,color:B.gold}}>{fmtFull(feeSemana)}</div>
      </div>

      {/* Detalle por alumno */}
      <div style={{maxWidth:560}}>
        {perStudent.length === 0 && <div style={{fontSize:13,color:B.textMuted}}>Sin clases registradas esta semana.</div>}
        {perStudent.map(({ s, n }) => (
          <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:10,padding:"10px 13px",marginBottom:7}}>
            <div style={{width:28,height:28,background:avatarColor(s.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:B.gold,border:`1px solid ${B.border}`}}>{s.iniciales}</div>
            <span style={{fontSize:13,color:B.text,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.nombre}</span>
            <span style={{fontSize:12,color:B.textSub}}>{n} × {fmt(rate)}</span>
            <span style={{fontSize:13,fontWeight:700,color:B.gold,minWidth:64,textAlign:"right"}}>{fmt(n*rate)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
