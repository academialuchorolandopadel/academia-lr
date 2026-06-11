// src/components/AdminMode.jsx
import { useState, useMemo } from "react"
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"
import {
  B, AT, LogoLR, INCOME_DATA, PLANES, SCHEDULE_SLOTS,
  DIAS_KEYS, DIAS_LABEL, RECENT_DATES,
  fmt, fmtFull, initials, avatarColor,
} from "../constants"

const ADMIN_NAV = [
  { id:"dashboard",  label:"Dashboard",  emoji:"▦" },
  { id:"alumnos",    label:"Alumnos",    emoji:"◉" },
  { id:"asistencia", label:"Asistencia", emoji:"◈" },
  { id:"pagos",      label:"Pagos",      emoji:"◇" },
  { id:"horarios",   label:"Horarios",   emoji:"◻" },
  { id:"ingresos",   label:"Ingresos",   emoji:"△" },
  { id:"planes",     label:"Planes",     emoji:"❖" },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function AdminSidebar({ active, onNav, onLogout }) {
  return (
    <div style={{width:200,background:B.bgDark,borderRight:`1px solid ${B.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"20px 16px",borderBottom:`1px solid ${B.border}`,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
        <LogoLR size={44}/>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:12,fontWeight:700,color:B.gold,letterSpacing:2,textTransform:"uppercase"}}>Academia LR</div>
          <div style={{fontSize:10,color:B.textSub,marginTop:2}}>Modo Profe</div>
        </div>
      </div>
      <nav style={{flex:1,padding:"10px 6px",display:"flex",flexDirection:"column",gap:2}}>
        {ADMIN_NAV.map(({ id, label, emoji }) => {
          const on = active === id
          return (
            <button key={id} onClick={() => onNav(id)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:8,border:"none",cursor:"pointer",textAlign:"left",width:"100%",background:on?B.goldBg:"transparent",color:on?B.gold:B.textSub,fontWeight:on?600:400,fontSize:13,borderLeft:`2px solid ${on?B.gold:"transparent"}`,fontFamily:"'Segoe UI',sans-serif"}}>
              <span>{emoji}</span>{label}
            </button>
          )
        })}
      </nav>
      <div style={{padding:"12px 14px",borderTop:`1px solid ${B.border}`}}>
        <button onClick={onLogout}
          style={{width:"100%",padding:"8px",borderRadius:8,border:`1px solid ${B.border}`,background:"transparent",color:B.textSub,fontSize:12,cursor:"pointer"}}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color }) {
  const c = color || B.gold
  return (
    <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:"16px 18px",flex:1,minWidth:120}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:10,color:B.textSub,marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
          <div style={{fontSize:26,fontWeight:700,color:B.text,lineHeight:1}}>{value}</div>
          {sub && <div style={{fontSize:11,color:c,marginTop:4}}>{sub}</div>}
        </div>
        {icon && <span style={{fontSize:20}}>{icon}</span>}
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function AdminDashboard({ students, income }) {
  const active   = students.filter(s => s.estado === "OK").length
  const vencidos = students.filter(s => s.estado === "VENCIDO").length
  const totalCl  = students.reduce((a, s) => a + s.realizadas, 0)
  const lastMes  = income[income.length - 1]
  const hoyPres  = students.filter(s => s.asistencia[s.asistencia.length-1]?.m === "P")

  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:20}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Dashboard</h1>
        <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Resumen general · 2026</p>
      </div>
      <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <StatCard label="Activos"    value={active}             sub={`${vencidos} vencidos`} icon="✅"/>
        <StatCard label="Clases"     value={totalCl}            sub="realizadas"             icon="🎾" color="#60a5fa"/>
        <StatCard label="Último mes" value={fmt(lastMes.total)} sub={lastMes.mes}            icon="💰"/>
        <StatCard label="Asistencia" value="82%"                sub="promedio"               icon="📈"/>
      </div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 340px",background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:600,color:B.text,marginBottom:12}}>Ingresos 2026</div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={income}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={B.gold}    stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={B.gold}    stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={B.border}/>
              <XAxis dataKey="mes" tick={{fill:B.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v => fmt(v)} tick={{fill:B.textSub,fontSize:9}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v,n) => [fmtFull(v), n==="profe"?"Profe":"Cancha"]}
                contentStyle={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:8,color:B.text}}/>
              <Area type="monotone" dataKey="profe"  stroke={B.gold}    fill="url(#gP)" strokeWidth={2}/>
              <Area type="monotone" dataKey="cancha" stroke="#60a5fa" fill="url(#gC)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{flex:"1 1 160px",background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:600,color:B.text,marginBottom:4}}>Última clase</div>
          <div style={{fontSize:11,color:B.textSub,marginBottom:12}}>30 Abr · {hoyPres.length} presentes</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {hoyPres.map(s => (
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:24,height:24,background:avatarColor(s.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:B.gold,border:`1px solid ${B.border}`}}>{s.iniciales}</div>
                <span style={{fontSize:11,color:B.text}}>{s.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Alumnos ──────────────────────────────────────────────────────────────────
function AdminAlumnos({ students }) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("TODOS")

  const filtered = useMemo(() =>
    students.filter(s =>
      s.nombre.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "TODOS" || s.estado === filter)
    ), [students, search, filter])

  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:18}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Alumnos</h1>
        <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>{students.length} registrados</p>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar..."
          style={{flex:"1 1 150px",padding:"8px 12px",background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:13,outline:"none"}}/>
        {["TODOS","OK","VENCIDO"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{padding:"7px 12px",borderRadius:8,border:`1px solid ${filter===f?B.gold:B.border}`,background:filter===f?B.goldBg:B.bgCard,color:filter===f?B.gold:B.textSub,cursor:"pointer",fontSize:12,fontWeight:filter===f?600:400}}>
            {f}
          </button>
        ))}
      </div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${B.border}`}}>
              {["Alumno","Estado","Abonadas","Realizadas","Dif.","Plan"].map(h => (
                <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s,i) => {
              const diff = s.abonadas - s.realizadas
              return (
                <tr key={s.id} style={{borderBottom:i<filtered.length-1?`1px solid ${B.border}`:"none"}}
                  onMouseEnter={e=>e.currentTarget.style.background=B.bg}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"10px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:28,height:28,background:avatarColor(s.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:B.gold,border:`1px solid ${B.border}`}}>{s.iniciales}</div>
                      <span style={{fontSize:12,color:B.text,fontWeight:500}}>{s.nombre}</span>
                    </div>
                  </td>
                  <td style={{padding:"10px 12px"}}>
                    <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:s.estado==="OK"?B.goldBg:B.dangerBg,color:s.estado==="OK"?B.gold:"#f87171",border:`1px solid ${s.estado==="OK"?B.goldBorder:B.dangerBorder}`}}>{s.estado}</span>
                  </td>
                  <td style={{padding:"10px 12px",fontSize:12,color:B.text}}>{s.abonadas}</td>
                  <td style={{padding:"10px 12px",fontSize:12,color:B.text}}>{s.realizadas}</td>
                  <td style={{padding:"10px 12px"}}>
                    <span style={{fontSize:12,fontWeight:600,color:diff>0?B.gold:diff<0?"#f87171":B.textSub}}>{diff>0?`+${diff}`:diff}</span>
                  </td>
                  <td style={{padding:"10px 12px",fontSize:11,color:B.textSub}}>{s.plan}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Asistencia ───────────────────────────────────────────────────────────────
function AdminAsistencia({ students, onUpdate }) {
  const hoy     = "01/05"
  const activeS = students.filter(s => s.estado === "OK")

  const markAll = (marca) => {
    activeS.forEach(s => onUpdate(s.id, st => {
      const has = st.asistencia.find(a => a.f === hoy)
      return {
        ...st,
        asistencia: has
          ? st.asistencia.map(a => a.f === hoy ? { ...a, m: marca } : a)
          : [...st.asistencia, { f: hoy, m: marca }],
      }
    }))
  }

  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Asistencia</h1>
        <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Clic en celda para editar</p>
      </div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:10,padding:"12px 16px",marginBottom:12}}>
        <div style={{fontSize:11,color:B.textSub,marginBottom:8}}>Clase de hoy ({hoy}) — marcar todos como:</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["P","I","X","R"].map(k => {
            const s = AT[k]
            return (
              <button key={k} onClick={() => markAll(k)}
                style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${s.border}`,background:s.bg,color:s.text,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                {k} — {s.label}
              </button>
            )
          })}
        </div>
      </div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,overflow:"auto"}}>
        <table style={{borderCollapse:"collapse",minWidth:"100%"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${B.border}`}}>
              <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase",minWidth:140}}>Alumno</th>
              {[...RECENT_DATES, hoy].map(d => (
                <th key={d} style={{padding:"10px 10px",textAlign:"center",fontSize:10,color:d===hoy?B.gold:B.textSub,fontWeight:600,whiteSpace:"nowrap"}}>{d}{d===hoy?" ★":""}</th>
              ))}
              <th style={{padding:"10px 10px",textAlign:"center",fontSize:10,color:B.textSub,fontWeight:600}}>%</th>
            </tr>
          </thead>
          <tbody>
            {activeS.map((s, si) => {
              const allD = [...RECENT_DATES, hoy]
              const row  = allD.map(d => s.asistencia.find(a => a.f === d)?.m || "")
              const pres = row.filter(c => c === "P").length
              const tot  = row.filter(c => c !== "").length
              const pct  = tot ? Math.round((pres/tot)*100) : null

              return (
                <tr key={s.id} style={{borderBottom:si<activeS.length-1?`1px solid ${B.border}`:"none"}}
                  onMouseEnter={e=>e.currentTarget.style.background=B.bg}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"8px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{width:24,height:24,background:avatarColor(s.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:B.gold,border:`1px solid ${B.border}`}}>{s.iniciales}</div>
                      <span style={{fontSize:11,color:B.text,whiteSpace:"nowrap"}}>{s.nombre}</span>
                    </div>
                  </td>
                  {allD.map((d, di) => {
                    const marca = row[di]
                    const st    = AT[marca]
                    const isHoy = d === hoy
                    return (
                      <td key={di} style={{padding:"4px 5px",textAlign:"center"}}>
                        <button
                          onClick={() => {
                            const cycle = ["","P","I","X","R"]
                            const next  = cycle[(cycle.indexOf(marca)+1) % cycle.length]
                            onUpdate(s.id, ss => {
                              const has = ss.asistencia.find(a => a.f === d)
                              return {
                                ...ss,
                                asistencia: has
                                  ? ss.asistencia.map(a => a.f === d ? { ...a, m: next } : a)
                                  : [...ss.asistencia, { f: d, m: next }],
                              }
                            })
                          }}
                          style={{width:30,height:26,borderRadius:5,border:`1px solid ${st?st.border:isHoy?B.goldBorder:B.border}`,background:st?st.bg:isHoy?B.goldBg:"transparent",color:st?st.text:isHoy?B.gold:B.textMuted,fontSize:10,fontWeight:700,cursor:"pointer"}}>
                          {marca || "·"}
                        </button>
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
    </div>
  )
}

// ─── Pagos ────────────────────────────────────────────────────────────────────
function AdminPagos({ payments }) {
  const cols   = ["ene","feb","mar","abr"]
  const labels = ["Enero","Febrero","Marzo","Abril"]

  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Pagos</h1>
        <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Historial 2026</p>
      </div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${B.border}`}}>
              <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase"}}>Alumno</th>
              {labels.map(l => <th key={l} style={{padding:"10px 12px",textAlign:"right",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase"}}>{l}</th>)}
              <th style={{padding:"10px 12px",textAlign:"right",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase"}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p,i) => {
              const total = cols.reduce((a,m) => a+(p[m]||0), 0)
              return (
                <tr key={p.alumno} style={{borderBottom:i<payments.length-1?`1px solid ${B.border}`:"none"}}
                  onMouseEnter={e=>e.currentTarget.style.background=B.bg}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"11px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:26,height:26,background:avatarColor(p.alumno),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:B.gold,border:`1px solid ${B.border}`}}>{initials(p.alumno)}</div>
                      <span style={{fontSize:12,color:B.text}}>{p.alumno}</span>
                    </div>
                  </td>
                  {cols.map(m => (
                    <td key={m} style={{padding:"11px 12px",textAlign:"right"}}>
                      {p[m] ? <span style={{fontSize:12,color:B.gold,fontWeight:500}}>{fmt(p[m])}</span>
                             : <span style={{fontSize:12,color:B.textMuted}}>—</span>}
                    </td>
                  ))}
                  <td style={{padding:"11px 12px",textAlign:"right"}}>
                    <span style={{fontSize:12,fontWeight:700,color:B.text}}>{fmt(total)}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{borderTop:`1px solid ${B.border}`,background:B.bg}}>
              <td style={{padding:"10px 16px",fontSize:11,fontWeight:700,color:B.textSub}}>TOTALES</td>
              {cols.map(m => {
                const t = payments.reduce((a,p) => a+(p[m]||0), 0)
                return <td key={m} style={{padding:"10px 12px",textAlign:"right",fontSize:11,fontWeight:700,color:B.gold}}>{t ? fmt(t) : "—"}</td>
              })}
              <td style={{padding:"10px 12px",textAlign:"right",fontSize:12,fontWeight:700,color:B.gold}}>
                {fmt(payments.reduce((a,p) => a+cols.reduce((b,m) => b+(p[m]||0), 0), 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ─── Horarios ─────────────────────────────────────────────────────────────────
function AdminHorarios() {
  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Horarios</h1>
      </div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${B.border}`}}>
              <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase",width:60}}>Hora</th>
              {DIAS_LABEL.map(d => (
                <th key={d} style={{padding:"10px 10px",textAlign:"center",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase"}}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCHEDULE_SLOTS.map((slot,i) => {
              const hasAny = DIAS_KEYS.some(d => slot[d])
              return (
                <tr key={slot.hora} style={{borderBottom:i<SCHEDULE_SLOTS.length-1?`1px solid ${B.border}`:"none",background:hasAny?B.bg:"transparent"}}>
                  <td style={{padding:"10px 16px",fontSize:11,color:B.textSub}}>{slot.hora}</td>
                  {DIAS_KEYS.map(d => (
                    <td key={d} style={{padding:"5px 5px",textAlign:"center"}}>
                      {slot[d] && (
                        <div style={{background:B.goldBg,border:`1px solid ${B.goldBorder}`,borderRadius:7,padding:"6px 7px"}}>
                          <div style={{fontSize:10,fontWeight:600,color:B.gold}}>{slot[d]}</div>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Ingresos ─────────────────────────────────────────────────────────────────
function AdminIngresos({ income }) {
  const totalAnual  = income.reduce((a,m) => a+m.total, 0)
  const totalProfe  = income.reduce((a,m) => a+m.profe, 0)
  const totalCancha = income.reduce((a,m) => a+m.cancha, 0)

  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Ingresos</h1>
      </div>
      <div style={{display:"flex",gap:12,marginBottom:18,flexWrap:"wrap"}}>
        <StatCard label="Total 2026" value={fmt(totalAnual)}     sub="acumulado"                                     icon="💰"/>
        <StatCard label="Profe"      value={fmt(totalProfe)}     sub={`${Math.round(totalProfe/totalAnual*100)}%`}   icon="🎾"/>
        <StatCard label="Cancha"     value={fmt(totalCancha)}    sub={`${Math.round(totalCancha/totalAnual*100)}%`}  icon="🏟️" color="#60a5fa"/>
        <StatCard label="Ahorro 5%"  value={fmt(totalAnual*0.05)} sub="objetivo"                                    icon="🐖" color="#fbbf24"/>
      </div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:18}}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={income} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={B.border}/>
            <XAxis dataKey="mes" tick={{fill:B.textSub,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v => fmt(v)} tick={{fill:B.textSub,fontSize:9}} axisLine={false} tickLine={false}/>
            <Tooltip formatter={(v,n) => [fmtFull(v), n==="profe"?"Profe":"Cancha"]}
              contentStyle={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:8,color:B.text}}/>
            <Bar dataKey="profe"  fill={B.gold}    radius={[4,4,0,0]} name="profe"/>
            <Bar dataKey="cancha" fill="#3b82f6" radius={[4,4,0,0]} name="cancha"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Planes ───────────────────────────────────────────────────────────────────
function AdminPlanes() {
  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Planes</h1>
      </div>
      <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:20}}>
        {PLANES.map(p => (
          <div key={p.code} style={{flex:"1 1 160px",background:B.bgCard,border:`1px solid ${p.popular?B.gold:B.border}`,borderRadius:14,padding:20,position:"relative"}}>
            {p.popular && (
              <div style={{position:"absolute",top:12,right:12,fontSize:9,fontWeight:700,color:B.bgDark,background:B.gold,padding:"2px 8px",borderRadius:20}}>POPULAR</div>
            )}
            <div style={{fontSize:22,fontWeight:800,color:B.gold,marginBottom:2}}>{p.code}</div>
            <div style={{fontSize:15,fontWeight:700,color:B.text,marginBottom:1}}>{p.nombre}</div>
            <div style={{fontSize:11,color:B.textSub,marginBottom:12}}>{p.clases} clase{p.clases>1?"s":""}</div>
            <div style={{borderTop:`1px solid ${B.border}`,paddingTop:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:11,color:B.textSub}}>Individual</span>
                <span style={{fontSize:13,fontWeight:700,color:B.text}}>{fmtFull(p.individual)}</span>
              </div>
              {p.pareja && (
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:11,color:B.textSub}}>Pareja</span>
                  <span style={{fontSize:13,fontWeight:700,color:B.text}}>{fmtFull(p.pareja)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:18}}>
        <div style={{fontSize:13,fontWeight:600,color:B.text,marginBottom:12}}>Tipos de asistencia</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {Object.entries(AT).map(([k,v]) => (
            <div key={k} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:9,background:v.bg,border:`1px solid ${v.border}`,flex:"1 1 120px"}}>
              <span style={{fontSize:18,fontWeight:800,color:v.text}}>{k}</span>
              <span style={{fontSize:12,color:v.text,fontWeight:500}}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── AdminMode (componente exportado) ─────────────────────────────────────────
export function AdminMode({ students, payments, onUpdate, onLogout }) {
  const [view, setView] = useState("dashboard")

  return (
    <div style={{display:"flex",height:"100vh",background:B.bg,color:B.text,fontFamily:"'Segoe UI',system-ui,sans-serif",overflow:"hidden"}}>
      <AdminSidebar active={view} onNav={setView} onLogout={onLogout}/>
      <main style={{flex:1,overflowY:"auto"}}>
        {view==="dashboard"  && <AdminDashboard  students={students} income={INCOME_DATA}/>}
        {view==="alumnos"    && <AdminAlumnos    students={students}/>}
        {view==="asistencia" && <AdminAsistencia students={students} onUpdate={onUpdate}/>}
        {view==="pagos"      && <AdminPagos      payments={payments}/>}
        {view==="horarios"   && <AdminHorarios/>}
        {view==="ingresos"   && <AdminIngresos   income={INCOME_DATA}/>}
        {view==="planes"     && <AdminPlanes/>}
      </main>
    </div>
  )
}
