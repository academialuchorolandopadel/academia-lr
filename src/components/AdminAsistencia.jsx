// src/components/AdminAsistencia.jsx
import { useState, useMemo } from "react"
import { B, AT, DIAS_LABEL, hoyDDMM, diaCorto, avatarColor } from "../constants"

export function AdminAsistencia({ students, schedule, onUpdate }) {
  const [wk, setWk]           = useState(0)
  const [showAll, setShowAll] = useState(false)
  const [searchA, setSearchA] = useState("")
  const [selId, setSelId]     = useState(null)
  const hoy     = hoyDDMM()
  const activeS = students.filter(s => !s.archivado)  // OK y vencidos; solo se ocultan los archivados

  // Semana Lun–Sáb
  const cols = useMemo(() => {
    const cortos = ["Lun","Mar","Mié","Jue","Vie","Sáb"]
    const base = new Date()
    const dow  = base.getDay()
    const toMon = (dow === 0 ? -6 : 1 - dow)
    const monday = new Date(base)
    monday.setDate(base.getDate() + toMon + wk * 7)
    return cortos.map((dia, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i)
      const f = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`
      return { f, dia, diaFull: DIAS_LABEL[i] }
    })
  }, [wk])

  const [focus, setFocus] = useState(() => {
    const d = new Date().getDay()
    return d === 0 ? 0 : d - 1
  })

  const namesForDay = (diaFull) => {
    const set = new Set()
    ;(schedule?.horas || []).forEach(h => {
      ;(schedule?.asign?.[`${diaFull}|${h}`] || []).forEach(n => set.add(n))
    })
    return set
  }

  const setMark = (s, fecha, marca) => onUpdate(s.id, st => {
    const has = st.asistencia.find(a => a.f === fecha)
    return {
      ...st,
      asistencia: has
        ? st.asistencia.map(a => a.f === fecha ? { ...a, m: marca } : a)
        : [...st.asistencia, { f: fecha, m: marca }],
    }
  })
  const cycle = (s, fecha, actual) => {
    const seq = ["","P","I","X","R"]
    setMark(s, fecha, seq[(seq.indexOf(actual)+1) % seq.length])
  }

  const overallPct = (s) => {
    const tot  = s.asistencia.filter(a => a.m).length
    const pres = s.asistencia.filter(a => a.m === "P" || a.m === "R").length
    return tot ? Math.round((pres / tot) * 100) : null
  }

  const buscando = searchA.trim() !== ""
  const matches = buscando
    ? students.filter(s => s.nombre.toLowerCase().includes(searchA.trim().toLowerCase()))
    : []
  const selStudent = matches.find(s => s.id === selId) || (matches.length === 1 ? matches[0] : null)

  const esSemana  = focus === "semana"
  const dispCols  = esSemana ? cols : [cols[focus]]
  const focusDate = esSemana ? hoy : cols[focus].f
  let rows = activeS
  if (!esSemana && !showAll) {
    const nombres = namesForDay(cols[focus].diaFull)
    rows = activeS.filter(s => nombres.has(s.nombre))
  }
  const markAll = (marca) => rows.forEach(s => setMark(s, focusDate, marca))

  const cellBtn = (marca, isHoy=false) => {
    const st = AT[marca]
    return {width:30,height:26,borderRadius:5,border:`1px solid ${st?st.border:isHoy?B.goldBorder:B.border}`,background:st?st.bg:isHoy?B.goldBg:"transparent",color:st?st.text:isHoy?B.gold:B.textMuted,fontSize:10,fontWeight:700,cursor:"pointer"}
  }

  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:12}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Asistencia</h1>
        <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Por día se ven los que entrenan · buscá un alumno para ver y corregir todo su historial</p>
      </div>

      {/* Buscador de alumno */}
      <input value={searchA} onChange={e=>{ setSearchA(e.target.value); setSelId(null) }}
        placeholder="🔍 Buscar un alumno para ver su historial completo..."
        style={{width:"100%",padding:"9px 12px",marginBottom:14,background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:13,outline:"none"}}/>

      {/* ── MODO BÚSQUEDA: historial completo de un alumno ── */}
      {buscando ? (
        <div>
          {matches.length === 0 && (
            <div style={{fontSize:13,color:B.textMuted,padding:"10px 2px"}}>No se encontró ningún alumno con ese nombre.</div>
          )}
          {matches.length > 1 && (
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              {matches.map(s => {
                const on = selStudent && selStudent.id === s.id
                return (
                  <button key={s.id} onClick={()=>setSelId(s.id)}
                    style={{padding:"7px 11px",borderRadius:8,border:`1px solid ${on?B.gold:B.border}`,background:on?B.goldBg:B.bgCard,color:on?B.gold:B.textSub,fontSize:12,cursor:"pointer",fontWeight:on?600:400}}>
                    {s.nombre}
                  </button>
                )
              })}
            </div>
          )}

          {selStudent && (() => {
            const s = selStudent
            const disp = s.abonadas - s.realizadas
            const hist = [...s.asistencia].reverse()
            return (
              <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:18}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <div style={{width:38,height:38,background:avatarColor(s.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff"}}>{s.iniciales}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:700,color:B.text}}>{s.nombre}</div>
                    <div style={{fontSize:11,color:B.textSub}}>Abonadas {s.abonadas} · Dadas {s.realizadas} · Disponibles <b style={{color:disp>0?B.gold:"#f87171"}}>{disp}</b></div>
                  </div>
                  <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:s.estado==="OK"?B.goldBg:B.dangerBg,color:s.estado==="OK"?B.gold:"#f87171",border:`1px solid ${s.estado==="OK"?B.goldBorder:B.dangerBorder}`}}>{s.estado}</span>
                </div>

                <div style={{fontSize:10,color:B.textSub,marginBottom:8}}>Tocá una marca para corregirla (P → I → X → R → vacío)</div>
                {hist.length === 0 && <div style={{fontSize:12,color:B.textMuted}}>Sin asistencias registradas.</div>}
                <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:420,overflowY:"auto"}}>
                  {hist.map(({f,m}, i) => (
                    <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 10px",borderRadius:8,background:B.bg,border:`1px solid ${B.border}`}}>
                      <span style={{fontSize:12,color:B.text}}>{diaCorto(f)} {f}</span>
                      <button onClick={()=>cycle(s,f,m)} style={cellBtn(m)}>{m || "·"}</button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      ) : (
      <>
      {/* Navegación de semanas */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:10,flexWrap:"wrap"}}>
        <button onClick={()=>setWk(wk-1)} style={{padding:"7px 12px",borderRadius:8,border:`1px solid ${B.border}`,background:B.bgCard,color:B.text,fontSize:13,cursor:"pointer"}}>◀ Semana</button>
        <span style={{fontSize:12,color:B.textSub}}>{cols[0].f} al {cols[5].f}{wk!==0 && <button onClick={()=>setWk(0)} style={{marginLeft:8,padding:"4px 9px",borderRadius:7,border:`1px solid ${B.goldBorder}`,background:B.goldBg,color:B.gold,fontSize:11,cursor:"pointer",fontWeight:600}}>Hoy</button>}</span>
        <button onClick={()=>setWk(wk+1)} style={{padding:"7px 12px",borderRadius:8,border:`1px solid ${B.border}`,background:B.bgCard,color:B.text,fontSize:13,cursor:"pointer"}}>Semana ▶</button>
      </div>

      {/* Selector de día / semana */}
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {cols.map((c, i) => {
          const on = focus === i
          return (
            <button key={c.f} onClick={()=>setFocus(i)}
              style={{padding:"7px 10px",borderRadius:8,border:`1px solid ${on?B.gold:B.border}`,background:on?B.goldBg:B.bgCard,color:on?B.gold:B.textSub,fontSize:12,fontWeight:on?600:400,cursor:"pointer",textAlign:"center",lineHeight:1.2}}>
              {c.dia}<br/><span style={{fontSize:10,opacity:0.8}}>{c.f}{c.f===hoy?" ★":""}</span>
            </button>
          )
        })}
        <button onClick={()=>setFocus("semana")}
          style={{padding:"7px 12px",borderRadius:8,border:`1px solid ${esSemana?B.gold:B.border}`,background:esSemana?B.goldBg:B.bgCard,color:esSemana?B.gold:B.textSub,fontSize:12,fontWeight:esSemana?600:400,cursor:"pointer"}}>
          Semana
        </button>
      </div>

      {/* Marcar todos + Ver todos */}
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:10,padding:"12px 16px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:8}}>
          <div style={{fontSize:11,color:B.textSub}}>Marcar todos ({focusDate}) como:</div>
          {!esSemana && (
            <button onClick={()=>setShowAll(v=>!v)}
              style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${showAll?B.gold:B.border}`,background:showAll?B.goldBg:"transparent",color:showAll?B.gold:B.textSub,fontSize:11,cursor:"pointer",fontWeight:600}}>
              {showAll ? "✓ Viendo todos" : "Ver todos"}
            </button>
          )}
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["P","I","X","R"].map(k => {
            const st = AT[k]
            return (
              <button key={k} onClick={() => markAll(k)}
                style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${st.border}`,background:st.bg,color:st.text,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                {k} — {st.label}
              </button>
            )
          })}
        </div>
        {!esSemana && (
          <div style={{fontSize:11,color:B.textSub,marginTop:8}}>
            {rows.length} alumno{rows.length!==1?"s":""} {showAll ? "en total" : "con clase este día"}
          </div>
        )}
      </div>

      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,overflow:"auto"}}>
        <table style={{borderCollapse:"collapse",minWidth:"100%"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${B.border}`}}>
              <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase",minWidth:140}}>Alumno</th>
              {dispCols.map(c => (
                <th key={c.f} style={{padding:"8px 10px",textAlign:"center",fontSize:10,color:c.f===hoy?B.gold:B.textSub,fontWeight:600,whiteSpace:"nowrap"}}>
                  <div style={{fontSize:10,fontWeight:700}}>{c.dia}</div>
                  <div style={{fontSize:9,opacity:0.85}}>{c.f}{c.f===hoy?" ★":""}</div>
                </th>
              ))}
              <th style={{padding:"10px 10px",textAlign:"center",fontSize:10,color:B.textSub,fontWeight:600}}>%</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={dispCols.length+2} style={{padding:"20px 16px",textAlign:"center",fontSize:12,color:B.textMuted}}>
                Nadie asignado este día en la agenda. Tocá "Ver todos" para marcar igual.
              </td></tr>
            )}
            {rows.map((s, si) => {
              const pct = overallPct(s)
              return (
                <tr key={s.id} style={{borderBottom:si<rows.length-1?`1px solid ${B.border}`:"none"}}
                  onMouseEnter={e=>e.currentTarget.style.background=B.bg}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"8px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{width:24,height:24,background:avatarColor(s.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:B.gold,border:`1px solid ${B.border}`}}>{s.iniciales}</div>
                      <span style={s.estado==="VENCIDO"
                        ? {fontSize:11,color:"#f87171",whiteSpace:"nowrap",border:`1px solid ${B.dangerBorder}`,background:B.dangerBg,padding:"2px 7px",borderRadius:6,fontWeight:600}
                        : {fontSize:11,color:B.text,whiteSpace:"nowrap"}}>{s.nombre}</span>
                    </div>
                  </td>
                  {dispCols.map((c) => {
                    const marca = s.asistencia.find(a => a.f === c.f)?.m || ""
                    return (
                      <td key={c.f} style={{padding:"4px 5px",textAlign:"center"}}>
                        <button onClick={() => cycle(s, c.f, marca)} style={cellBtn(marca, c.f===hoy)}>{marca || "·"}</button>
                      </td>
                    )
                  })}
                  <td style={{padding:"8px 10px",textAlign:"center"}}>
                    <span style={{fontSize:11,fontWeight:600,color:pct===null?B.textMuted:pct>=75?B.gold:pct>=50?"#fbbf24":"#f87171"}}>
                      {pct !== null ? `${pct}%` : "—"}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      </>
      )}
    </div>
  )
}
