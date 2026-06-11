// src/components/StudentMode.jsx
import { useState } from "react"
import { B, AT, NOTE_STYLE, fmtFull, getNotifications, LogoLR } from "../constants"

export function StudentMode({ student, onLogout }) {
  const [tab, setTab] = useState("cuenta")

  const notes      = getNotifications(student)
  const badgeCount = notes.filter(n => n.type==="danger" || n.type==="warning").length
  const disp       = student.abonadas - student.realizadas
  const pct        = Math.round((student.realizadas / Math.max(student.abonadas,1)) * 100)
  const presentes  = student.asistencia.filter(a => a.m === "P").length
  const totalC     = student.asistencia.filter(a => a.m !== "").length
  const asistPct   = totalC ? Math.round((presentes/totalC)*100) : 0

  const TABS = [
    { id:"cuenta",     label:"Mi Cuenta",  icon:"◈" },
    { id:"avisos",     label:"Avisos",     icon:"🔔", badge:badgeCount },
    { id:"asistencia", label:"Asistencia", icon:"◉" },
    { id:"pagos",      label:"Pagos",      icon:"◇" },
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

      </div>
    </div>
  )
}
