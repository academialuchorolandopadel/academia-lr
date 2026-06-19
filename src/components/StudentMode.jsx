// src/components/StudentMode.jsx
import { useState, useEffect } from "react"
import { B, AT, NOTE_STYLE, fmtFull, getNotifications, LogoLR, DIAS_LABEL, CAP_TIPO, TIPO_LABEL } from "../constants"

export function StudentMode({ student, onLogout, consejos = [], schedule = {}, onLoadNotas, onAddNota, onDeleteNota }) {
  const [tab, setTab] = useState("cuenta")

  const notes      = getNotifications(student)
  const badgeCount = notes.filter(n => n.type==="danger" || n.type==="warning").length
  const disp       = student.abonadas - student.realizadas

  // Horarios con lugar disponible (solo los que tienen tipo asignado)
  const toMinS = (h) => { const [hh,mm] = String(h).split(":").map(Number); return hh*60+(mm||0) }
  const horariosLibres = []
  DIAS_LABEL.forEach(dia => {
    ;[...(schedule.horas || [])].sort((a,b)=>toMinS(a)-toMinS(b)).forEach(hora => {
      const k = `${dia}|${hora}`
      const tipo = (schedule.tipos || {})[k]
      if (!tipo) return
      const cap = CAP_TIPO[tipo]
      const ocup = (schedule.asign || {})[k] || []
      if (ocup.length < cap) horariosLibres.push({ dia, hora, tipo, cap, ocup, libres: cap - ocup.length })
    })
  })
  const pct        = Math.round((student.realizadas / Math.max(student.abonadas,1)) * 100)
  const presentes  = student.asistencia.filter(a => a.m === "P").length
  const totalC     = student.asistencia.filter(a => a.m !== "").length
  const asistPct   = totalC ? Math.round((presentes/totalC)*100) : 0

  // Notas personales (bitácora)
  const [notas, setNotas]         = useState(null)   // null = sin cargar
  const [nuevaNota, setNuevaNota] = useState("")
  const [guardando, setGuardando] = useState(false)
  useEffect(() => {
    if (tab === "notas" && notas === null && onLoadNotas) {
      onLoadNotas(student.id).then(setNotas).catch(() => setNotas([]))
    }
  }, [tab])
  const guardarNota = async () => {
    const t = nuevaNota.trim()
    if (!t || guardando) return
    setGuardando(true)
    try {
      const n = await onAddNota(student.id, t)
      setNotas(prev => [n, ...(prev || [])])
      setNuevaNota("")
    } catch (e) { /* noop */ }
    setGuardando(false)
  }
  const borrarNota = async (notaId) => {
    if (!window.confirm("¿Borrar esta nota?")) return
    try { await onDeleteNota(student.id, notaId) } catch (e) {}
    setNotas(prev => (prev || []).filter(n => n.id !== notaId))
  }
  const fechaNota = (iso) => {
    if (!iso) return ""
    const d = new Date(iso)
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`
  }

  const TABS = [
    { id:"cuenta",     label:"Mi Cuenta",  icon:"◈" },
    { id:"avisos",     label:"Avisos",     icon:"🔔", badge:badgeCount },
    { id:"asistencia", label:"Asistencia", icon:"◉" },
    { id:"pagos",      label:"Pagos",      icon:"◇" },
    { id:"horarios",   label:"Horarios",   icon:"📅" },
    { id:"consejos",   label:"Consejos",   icon:"💡" },
    { id:"notas",      label:"Mis notas",  icon:"📝" },
  ]

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(180deg,${B.bgDark} 0%,${B.bg} 100%)`,fontFamily:"'Segoe UI',sans-serif"}}>

      {/* ── Header ── */}
      <div style={{background:"rgba(10,20,40,0.95)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${B.border}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <LogoLR size={32}/>
            <div>
              <div style={{fontSize:10,color:B.gold,letterSpacing:2,textTransform:"uppercase"}}>Academia LR</div>
              <div style={{fontSize:14,fontWeight:700,color:B.text}}>{student.nombre}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,textTransform:"uppercase",background:student.estado==="OK"?B.goldBg:B.dangerBg,color:student.estado==="OK"?B.gold:"#f87171",border:`1px solid ${student.estado==="OK"?B.goldBorder:B.dangerBorder}`}}>
              {student.estado}
            </span>
            <button onClick={onLogout}
              style={{background:"transparent",border:`1px solid ${B.border}`,borderRadius:8,color:B.textSub,fontSize:12,padding:"5px 10px",cursor:"pointer"}}>
              Salir
            </button>
          </div>
        </div>
        <div style={{display:"flex",padding:"0 20px",overflowX:"auto"}}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{position:"relative",padding:"9px 14px",background:"transparent",border:"none",borderBottom:`2px solid ${tab===t.id?B.gold:"transparent"}`,color:tab===t.id?B.gold:B.textSub,fontSize:13,fontWeight:tab===t.id?600:400,cursor:"pointer",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>
              {t.icon} {t.label}
              {t.badge>0 && <span style={{position:"absolute",top:5,right:2,width:15,height:15,background:B.danger,borderRadius:"50%",fontSize:8,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenido ── */}
      <div style={{maxWidth:500,margin:"0 auto",padding:"20px 16px"}}>

        {/* Tab: Mi Cuenta */}
        {tab==="cuenta" && (
          <div>
            <div style={{background:B.goldBg,border:`1px solid ${B.goldBorder}`,borderRadius:14,padding:18,marginBottom:14}}>
              <div style={{fontSize:10,color:B.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>
                Tu plan · {student.plan}
              </div>
              <div style={{display:"flex",justifyContent:"space-around",marginBottom:16}}>
                {[
                  { n:student.abonadas,  l:"Abonadas",   c:B.text },
                  { n:student.realizadas,l:"Realizadas",  c:B.gold },
                  { n:disp,              l:"Disponibles", c:disp<=2?"#fbbf24":"#60a5fa" },
                ].map(({n,l,c}) => (
                  <div key={l} style={{textAlign:"center"}}>
                    <div style={{fontSize:36,fontWeight:700,color:c,lineHeight:1}}>{n}</div>
                    <div style={{fontSize:10,color:B.textSub,letterSpacing:1,textTransform:"uppercase",marginTop:3}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"rgba(255,255,255,0.08)",borderRadius:100,height:6,overflow:"hidden",marginBottom:4}}>
                <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:`linear-gradient(90deg,${B.gold},${B.goldLight})`,borderRadius:100}}/>
              </div>
              <div style={{fontSize:10,color:B.textSub,textAlign:"right"}}>{pct}% utilizado</div>
            </div>

            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {[
                { l:"Asistencia", v:`${asistPct}%`, i:"📊", c:asistPct>=75?B.gold:asistPct>=50?"#fbbf24":"#f87171" },
                { l:"Presentes",  v:presentes,       i:"✅", c:B.gold },
                { l:"Plan",       v:student.plan.split(" ")[0], i:"📋", c:"#60a5fa" },
              ].map(({l,v,i,c}) => (
                <div key={l} style={{flex:1,background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:10,padding:"12px 8px",textAlign:"center"}}>
                  <div style={{fontSize:16,marginBottom:3}}>{i}</div>
                  <div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div>
                  <div style={{fontSize:9,color:B.textSub,letterSpacing:1,textTransform:"uppercase",marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>

            {(student.email || student.tel) && (
              <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:9,color:B.textSub,letterSpacing:2,textTransform:"uppercase",marginBottom:7}}>Mis datos</div>
                {student.email && <div style={{fontSize:12,color:B.textSub,marginBottom:3}}>📧 {student.email}</div>}
                {student.tel   && <div style={{fontSize:12,color:B.textSub}}>📱 {student.tel}</div>}
              </div>
            )}
          </div>
        )}

        {/* Tab: Avisos */}
        {tab==="avisos" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {notes.map((n,i) => {
              const s = NOTE_STYLE[n.type]
              return (
                <div key={i} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:14,padding:"16px 18px",display:"flex",gap:12}}>
                  <span style={{fontSize:24,flexShrink:0}}>{n.icon}</span>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:s.text,marginBottom:5}}>{n.title}</div>
                    <div style={{fontSize:12,color:B.textSub,lineHeight:1.5}}>{n.body}</div>
                  </div>
                </div>
              )
            })}
            <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:10,padding:"10px 14px",fontSize:11,color:B.textSub}}>
              ℹ️ Los avisos se generan automáticamente.
            </div>
          </div>
        )}

        {/* Tab: Asistencia */}
        {tab==="asistencia" && (
          <div>
            <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
              {["P","I","X","R"].map(k => {
                const s = AT[k]
                const n = student.asistencia.filter(a => a.m === k).length
                return (
                  <div key={k} style={{flex:"1 1 70px",padding:"10px 8px",borderRadius:10,background:s.bg,border:`1px solid ${s.border}`,textAlign:"center"}}>
                    <div style={{fontSize:22,fontWeight:700,color:s.text}}>{n}</div>
                    <div style={{fontSize:9,color:s.text,opacity:0.8,letterSpacing:1,textTransform:"uppercase",marginTop:2}}>{s.label}</div>
                  </div>
                )
              })}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {student.asistencia.map(({f,m},i) => {
                const s = AT[m]
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:s?`${s.bg}88`:B.bgCard,border:`1px solid ${s?s.border+"55":B.border}`,borderRadius:10,padding:"11px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{fontSize:11,color:B.textSub,minWidth:46}}>{f}</div>
                      <div style={{width:1,height:16,background:B.border}}/>
                      <div style={{fontSize:12,color:s?s.text:B.textMuted}}>{s?s.label:"Sin clase registrada"}</div>
                    </div>
                    {s && (
                      <div style={{width:28,height:28,borderRadius:7,background:s.bg,border:`1px solid ${s.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:s.text,fontWeight:700}}>
                        {s.icon}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab: Pagos */}
        {tab==="pagos" && (
          <div>
            {Object.keys(student.pagos||{}).length > 0 ? (
              <>
                <div style={{background:B.goldBg,border:`1px solid ${B.goldBorder}`,borderRadius:16,padding:"18px 22px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:10,color:B.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Total abonado 2026</div>
                    <div style={{fontSize:28,fontWeight:700,color:B.text}}>
                      {fmtFull(Object.values(student.pagos).reduce((a,v) => a+v, 0))}
                    </div>
                  </div>
                  <span style={{fontSize:32}}>💰</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {Object.entries(student.pagos).map(([mes,monto]) => (
                    <div key={mes} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:10,padding:"12px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:30,height:30,borderRadius:9,background:B.goldBg,border:`1px solid ${B.goldBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>📅</div>
                        <div>
                          <div style={{fontSize:13,color:B.text}}>{mes}</div>
                          <div style={{fontSize:9,color:B.gold,letterSpacing:1,textTransform:"uppercase"}}>PAGADO</div>
                        </div>
                      </div>
                      <div style={{fontSize:14,fontWeight:700,color:B.gold}}>{fmtFull(monto)}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{background:B.dangerBg,border:`1px solid ${B.dangerBorder}`,borderRadius:14,padding:28,textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:10}}>📋</div>
                <div style={{fontSize:14,color:"#f87171"}}>Sin pagos registrados</div>
                <div style={{fontSize:12,color:B.textSub,marginTop:5}}>Consultá con tu profe.</div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Horarios disponibles */}
        {tab==="horarios" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{fontSize:12,color:B.textSub,marginBottom:2}}>Horarios con lugar libre. Consultá con el profe para anotarte.</div>
            {horariosLibres.length === 0 ? (
              <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:14,padding:28,textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:10}}>📅</div>
                <div style={{fontSize:14,color:B.textSub}}>No hay horarios con lugar disponible por ahora.</div>
              </div>
            ) : horariosLibres.map((s2, i) => (
              <div key={i} style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontSize:14,fontWeight:700,color:B.text}}>{s2.dia} · {s2.hora}</div>
                  <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,background:B.goldBg,color:B.gold,border:`1px solid ${B.goldBorder}`}}>{TIPO_LABEL[s2.tipo]}</span>
                </div>
                <div style={{fontSize:12,color:B.gold,fontWeight:600,marginBottom:s2.ocup.length?8:0}}>
                  {s2.libres} lugar{s2.libres>1?"es":""} disponible{s2.libres>1?"s":""} de {s2.cap}
                </div>
                {s2.ocup.length>0 && (
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                    {s2.ocup.map(n => (
                      <span key={n} style={{fontSize:11,color:B.textSub,background:B.bg,border:`1px solid ${B.border}`,borderRadius:6,padding:"2px 8px"}}>{n}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab: Consejos del profe */}
        {tab==="consejos" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {consejos.length === 0 ? (
              <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:14,padding:28,textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:10}}>💡</div>
                <div style={{fontSize:14,color:B.textSub}}>Todavía no hay consejos.</div>
              </div>
            ) : consejos.map((c, i) => (
              <div key={c.id || i} style={{background:B.goldBg,border:`1px solid ${B.goldBorder}`,borderRadius:14,padding:"16px 18px",display:"flex",gap:12}}>
                <span style={{fontSize:22,flexShrink:0}}>🎾</span>
                <div style={{fontSize:13,color:B.text,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{c.texto}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Mis notas (bitácora personal) */}
        {tab==="notas" && (
          <div>
            <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:14,padding:14,marginBottom:14}}>
              <div style={{fontSize:11,color:B.textSub,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Nueva nota</div>
              <textarea value={nuevaNota} onChange={e=>setNuevaNota(e.target.value)} rows={3}
                placeholder="Anotá algo de tu clase, tu juego, un partido o torneo..."
                style={{width:"100%",padding:"10px",background:B.bg,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:14,outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
              <button onClick={guardarNota} disabled={guardando}
                style={{width:"100%",marginTop:8,padding:"10px",borderRadius:8,border:"none",background:B.gold,color:B.bgDark,fontSize:14,fontWeight:700,cursor:guardando?"default":"pointer",opacity:guardando?0.6:1}}>
                {guardando ? "Guardando..." : "Agregar nota"}
              </button>
            </div>
            {notas === null ? (
              <div style={{fontSize:12,color:B.textMuted,textAlign:"center",padding:10}}>Cargando...</div>
            ) : notas.length === 0 ? (
              <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:14,padding:24,textAlign:"center"}}>
                <div style={{fontSize:28,marginBottom:8}}>📝</div>
                <div style={{fontSize:13,color:B.textSub}}>Tu bitácora está vacía. ¡Escribí tu primera nota!</div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {notas.map(n => (
                  <div key={n.id} style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:"12px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                      <div style={{fontSize:13,color:B.text,lineHeight:1.5,whiteSpace:"pre-wrap",flex:1}}>{n.texto}</div>
                      <button onClick={()=>borrarNota(n.id)} style={{background:"transparent",border:"none",color:B.textMuted,cursor:"pointer",fontSize:13,flexShrink:0}}>🗑</button>
                    </div>
                    <div style={{fontSize:10,color:B.textMuted,marginTop:6}}>{fechaNota(n.fecha)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
