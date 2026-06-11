// src/components/AdminMode.jsx
import { useState, useMemo } from "react"
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"
import {
  B, AT, LogoLR, INCOME_DATA, PLANES, MESES,
  DIAS_LABEL, hoyDDMM, dateKey,
  fmt, fmtFull, initials, avatarColor,
} from "../constants"

const ADMIN_NAV = [
  { id:"dashboard",  label:"Dashboard",  emoji:"▦" },
  { id:"alumnos",    label:"Alumnos",    emoji:"◉" },
  { id:"asistencia", label:"Asistencia", emoji:"◈" },
  { id:"pagos",      label:"Pagos",      emoji:"◇" },
  { id:"agenda",     label:"Agenda",     emoji:"◻" },
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

  let ultimaFecha = null
  students.forEach(s => s.asistencia.forEach(a => {
    if (!ultimaFecha || dateKey(a.f) > dateKey(ultimaFecha)) ultimaFecha = a.f
  }))
  const hoyPres = ultimaFecha
    ? students.filter(s => s.asistencia.some(a => a.f === ultimaFecha && a.m === "P"))
    : []

  let totMarcas = 0, totPres = 0
  students.forEach(s => s.asistencia.forEach(a => {
    if (a.m) { totMarcas++; if (a.m === "P" || a.m === "R") totPres++ }
  }))
  const promAsist = totMarcas ? Math.round((totPres / totMarcas) * 100) : 0

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
        <StatCard label="Asistencia" value={`${promAsist}%`}    sub="promedio"               icon="📈"/>
      </div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 340px",background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:600,color:B.text,marginBottom:12}}>Ingresos 2026</div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={income}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={B.gold}  stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={B.gold}  stopOpacity={0}/>
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
              <Area type="monotone" dataKey="profe"  stroke={B.gold}  fill="url(#gP)" strokeWidth={2}/>
              <Area type="monotone" dataKey="cancha" stroke="#60a5fa" fill="url(#gC)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{flex:"1 1 160px",background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:600,color:B.text,marginBottom:4}}>Última clase</div>
          <div style={{fontSize:11,color:B.textSub,marginBottom:12}}>{ultimaFecha || "—"} · {hoyPres.length} presentes</div>
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
  const hoy     = hoyDDMM()
  const activeS = students.filter(s => s.estado === "OK")

  const cols = useMemo(() => {
    const set = new Set([hoy])
    activeS.forEach(s => s.asistencia.forEach(a => { if (a.f) set.add(a.f) }))
    return [...set].sort((a, b) => dateKey(a) - dateKey(b)).slice(-12)
  }, [activeS, hoy])

  const setMark = (s, fecha, marca) => onUpdate(s.id, st => {
    const has = st.asistencia.find(a => a.f === fecha)
    return {
      ...st,
      asistencia: has
        ? st.asistencia.map(a => a.f === fecha ? { ...a, m: marca } : a)
        : [...st.asistencia, { f: fecha, m: marca }],
    }
  })

  const markAll = (marca) => activeS.forEach(s => setMark(s, hoy, marca))

  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Asistencia</h1>
        <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Clic en celda para editar · ★ = hoy ({hoy})</p>
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
              {cols.map(d => (
                <th key={d} style={{padding:"10px 10px",textAlign:"center",fontSize:10,color:d===hoy?B.gold:B.textSub,fontWeight:600,whiteSpace:"nowrap"}}>{d}{d===hoy?" ★":""}</th>
              ))}
              <th style={{padding:"10px 10px",textAlign:"center",fontSize:10,color:B.textSub,fontWeight:600}}>%</th>
            </tr>
          </thead>
          <tbody>
            {activeS.map((s, si) => {
              const row  = cols.map(d => s.asistencia.find(a => a.f === d)?.m || "")
              const pres = row.filter(c => c === "P" || c === "R").length
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
                  {cols.map((d, di) => {
                    const marca = row[di]
                    const st    = AT[marca]
                    const isHoy = d === hoy
                    return (
                      <td key={di} style={{padding:"4px 5px",textAlign:"center"}}>
                        <button
                          onClick={() => {
                            const cycle = ["","P","I","X","R"]
                            const next  = cycle[(cycle.indexOf(marca)+1) % cycle.length]
                            setMark(s, d, next)
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
function AdminPagos({ students, onAddPayment, onRemovePayment }) {
  const mesActual = MESES[new Date().getMonth()]
  const [open, setOpen]     = useState(false)
  const [sid, setSid]       = useState("")
  const [mes, setMes]       = useState(mesActual)
  const [monto, setMonto]   = useState("")
  const [clases, setClases] = useState("")

  const conPagos = students.filter(s => Object.keys(s.pagos || {}).length > 0)
  const cols = MESES.filter(m => students.some(s => s.pagos && s.pagos[m]))

  const abrir = (studentId = "", mesSel = mesActual) => {
    const st = students.find(s => s.id === studentId)
    setSid(studentId)
    setMes(mesSel)
    setMonto(st && st.pagos && st.pagos[mesSel] ? String(st.pagos[mesSel]) : "")
    setClases("")
    setOpen(true)
  }

  const guardar = () => {
    if (!sid || !mes || !(Number(monto) > 0)) return
    onAddPayment(sid, mes, Number(monto), Number(clases) || 0)
    setOpen(false)
  }

  const sel = students.find(s => s.id === sid)
  const yaExiste = sel && sel.pagos && sel.pagos[mes]

  const quitar = () => {
    if (sid && mes && window.confirm(`¿Quitar el pago de ${mes} de ${sel.nombre}?`)) {
      onRemovePayment(sid, mes)
      setOpen(false)
    }
  }

  return (
    <div style={{padding:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Pagos</h1>
          <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Tocá un monto para editarlo · 2026</p>
        </div>
        <button onClick={() => abrir()}
          style={{padding:"9px 16px",borderRadius:9,border:"none",background:B.gold,color:B.bgDark,fontSize:13,fontWeight:700,cursor:"pointer"}}>
          + Registrar pago
        </button>
      </div>

      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${B.border}`}}>
              <th style={{padding:"10px 16px",textAlign:"left",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase"}}>Alumno</th>
              {cols.map(l => <th key={l} style={{padding:"10px 12px",textAlign:"right",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase"}}>{l.slice(0,3)}</th>)}
              <th style={{padding:"10px 12px",textAlign:"right",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase"}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {conPagos.map((s,i) => {
              const total = cols.reduce((a,m) => a + ((s.pagos && s.pagos[m]) || 0), 0)
              return (
                <tr key={s.id} style={{borderBottom:i<conPagos.length-1?`1px solid ${B.border}`:"none"}}>
                  <td style={{padding:"11px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:26,height:26,background:avatarColor(s.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:B.gold,border:`1px solid ${B.border}`}}>{s.iniciales}</div>
                      <span style={{fontSize:12,color:B.text}}>{s.nombre}</span>
                    </div>
                  </td>
                  {cols.map(m => (
                    <td key={m} onClick={() => abrir(s.id, m)} style={{padding:"11px 12px",textAlign:"right",cursor:"pointer"}}>
                      {s.pagos && s.pagos[m]
                        ? <span style={{fontSize:12,color:B.gold,fontWeight:500}}>{fmt(s.pagos[m])}</span>
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
                const t = conPagos.reduce((a,s) => a + ((s.pagos && s.pagos[m]) || 0), 0)
                return <td key={m} style={{padding:"10px 12px",textAlign:"right",fontSize:11,fontWeight:700,color:B.gold}}>{t ? fmt(t) : "—"}</td>
              })}
              <td style={{padding:"10px 12px",textAlign:"right",fontSize:12,fontWeight:700,color:B.gold}}>
                {fmt(conPagos.reduce((a,s) => a + cols.reduce((b,m) => b + ((s.pagos && s.pagos[m]) || 0), 0), 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Modal registrar / editar pago */}
      {open && (
        <div onClick={() => setOpen(false)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
          <div onClick={e => e.stopPropagation()}
            style={{background:B.bgCard,border:`1px solid ${B.goldBorder}`,borderRadius:16,padding:22,width:"100%",maxWidth:360}}>
            <div style={{fontSize:15,fontWeight:700,color:B.gold,marginBottom:16}}>Registrar pago</div>

            <label style={{fontSize:11,color:B.textSub,textTransform:"uppercase",letterSpacing:1}}>Alumno</label>
            <select value={sid} onChange={e => abrir(e.target.value, mes)}
              style={{width:"100%",margin:"5px 0 12px",padding:"10px",background:B.bg,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:14}}>
              <option value="">Elegí un alumno…</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>

            <label style={{fontSize:11,color:B.textSub,textTransform:"uppercase",letterSpacing:1}}>Mes</label>
            <select value={mes} onChange={e => { setMes(e.target.value); const st = students.find(x=>x.id===sid); setMonto(st && st.pagos && st.pagos[e.target.value] ? String(st.pagos[e.target.value]) : "") }}
              style={{width:"100%",margin:"5px 0 12px",padding:"10px",background:B.bg,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:14}}>
              {MESES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <label style={{fontSize:11,color:B.textSub,textTransform:"uppercase",letterSpacing:1}}>Monto (₲)</label>
            <input type="number" inputMode="numeric" value={monto} onChange={e => setMonto(e.target.value)} placeholder="650000"
              style={{width:"100%",margin:"5px 0 12px",padding:"10px",background:B.bg,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:14,outline:"none"}}/>

            <label style={{fontSize:11,color:B.textSub,textTransform:"uppercase",letterSpacing:1}}>Sumar clases al paquete (opcional)</label>
            <input type="number" inputMode="numeric" value={clases} onChange={e => setClases(e.target.value)} placeholder="0"
              style={{width:"100%",margin:"5px 0 16px",padding:"10px",background:B.bg,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:14,outline:"none"}}/>

            <button onClick={guardar}
              style={{width:"100%",padding:"11px",borderRadius:9,border:"none",background:B.gold,color:B.bgDark,fontSize:14,fontWeight:700,cursor:"pointer"}}>
              Guardar
            </button>
            {yaExiste && (
              <button onClick={quitar}
                style={{width:"100%",marginTop:8,padding:"10px",borderRadius:9,border:`1px solid ${B.dangerBorder}`,background:B.dangerBg,color:"#f87171",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                Quitar este pago
              </button>
            )}
            <button onClick={() => setOpen(false)}
              style={{width:"100%",marginTop:8,padding:"10px",borderRadius:9,border:`1px solid ${B.border}`,background:"transparent",color:B.textSub,fontSize:13,cursor:"pointer"}}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Agenda (editable) ────────────────────────────────────────────────────────
const toMin = (h) => { const [hh, mm] = String(h).split(":").map(Number); return hh*60 + (mm||0) }

function AdminAgenda({ schedule, students, onSave }) {
  const [sel, setSel]           = useState(null)   // {dia, hora} celda en edición
  const [nuevaHora, setNuevaHora] = useState("")

  const horas = [...(schedule.horas || [])].sort((a,b) => toMin(a) - toMin(b))
  const asign = schedule.asign || {}
  const activos = students.filter(s => s.estado === "OK")
  const keyOf = (dia, hora) => `${dia}|${hora}`

  const toggle = (dia, hora, nombre) => {
    const k = keyOf(dia, hora)
    const cur = asign[k] || []
    const next = cur.includes(nombre) ? cur.filter(n => n !== nombre) : [...cur, nombre]
    const nextAsign = { ...asign }
    if (next.length === 0) delete nextAsign[k]; else nextAsign[k] = next
    onSave({ ...schedule, asign: nextAsign })
  }

  const addHora = () => {
    const h = nuevaHora.trim()
    if (!h || horas.includes(h)) { setNuevaHora(""); return }
    onSave({ ...schedule, horas: [...horas, h] })
    setNuevaHora("")
  }

  const removeHora = (h) => {
    if (!window.confirm(`¿Eliminar el horario ${h} y sus asignaciones?`)) return
    const nextAsign = { ...asign }
    DIAS_LABEL.forEach(d => delete nextAsign[keyOf(d, h)])
    onSave({ horas: horas.filter(x => x !== h), asign: nextAsign })
  }

  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Agenda semanal</h1>
        <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Tocá una celda para asignar alumnos activos</p>
      </div>

      {/* Agregar horario */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input value={nuevaHora} onChange={e=>setNuevaHora(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter") addHora() }}
          placeholder="Nuevo horario (ej 17:30)"
          style={{padding:"8px 12px",background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:13,outline:"none",width:180}}/>
        <button onClick={addHora}
          style={{padding:"8px 14px",borderRadius:8,border:"none",background:B.gold,color:B.bgDark,fontSize:13,fontWeight:700,cursor:"pointer"}}>
          + Agregar horario
        </button>
      </div>

      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:640}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${B.border}`}}>
              <th style={{padding:"10px 12px",textAlign:"left",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase",width:70}}>Hora</th>
              {DIAS_LABEL.map(d => (
                <th key={d} style={{padding:"10px 8px",textAlign:"center",fontSize:10,color:B.textSub,fontWeight:600,textTransform:"uppercase"}}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horas.map((h, i) => (
              <tr key={h} style={{borderBottom:i<horas.length-1?`1px solid ${B.border}`:"none"}}>
                <td style={{padding:"8px 12px",fontSize:11,color:B.textSub,whiteSpace:"nowrap"}}>
                  {h}
                  <button onClick={()=>removeHora(h)} title="Eliminar horario"
                    style={{marginLeft:6,background:"transparent",border:"none",color:B.textMuted,cursor:"pointer",fontSize:12}}>✕</button>
                </td>
                {DIAS_LABEL.map(d => {
                  const lista = asign[keyOf(d,h)] || []
                  return (
                    <td key={d} onClick={()=>setSel({dia:d,hora:h})}
                      style={{padding:"6px 6px",textAlign:"center",cursor:"pointer",verticalAlign:"top",minWidth:90}}>
                      <div style={{display:"flex",flexDirection:"column",gap:3,minHeight:30}}>
                        {lista.map(n => (
                          <div key={n} style={{background:avatarColor(n),borderRadius:6,padding:"3px 6px",fontSize:10,color:"#fff",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{n}</div>
                        ))}
                        {lista.length===0 && <div style={{fontSize:14,color:B.textMuted}}>+</div>}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal selector de alumnos */}
      {sel && (
        <div onClick={()=>setSel(null)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:B.bgCard,border:`1px solid ${B.goldBorder}`,borderRadius:16,padding:20,width:"100%",maxWidth:360,maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
            <div style={{fontSize:14,fontWeight:700,color:B.gold,marginBottom:2}}>{sel.dia} · {sel.hora}</div>
            <div style={{fontSize:11,color:B.textSub,marginBottom:12}}>Tocá para agregar o quitar</div>
            <div style={{overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
              {activos.map(s => {
                const on = (asign[keyOf(sel.dia,sel.hora)]||[]).includes(s.nombre)
                return (
                  <button key={s.id} onClick={()=>toggle(sel.dia,sel.hora,s.nombre)}
                    style={{display:"flex",alignItems:"center",gap:9,padding:"9px 11px",borderRadius:9,border:`1px solid ${on?B.gold:B.border}`,background:on?B.goldBg:"transparent",cursor:"pointer",textAlign:"left"}}>
                    <div style={{width:26,height:26,background:avatarColor(s.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff"}}>{s.iniciales}</div>
                    <span style={{flex:1,fontSize:13,color:B.text}}>{s.nombre}</span>
                    {on && <span style={{color:B.gold,fontWeight:700}}>✓</span>}
                  </button>
                )
              })}
            </div>
            <button onClick={()=>setSel(null)}
              style={{marginTop:14,padding:"10px",borderRadius:9,border:"none",background:B.gold,color:B.bgDark,fontSize:13,fontWeight:700,cursor:"pointer"}}>
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Ingresos ─────────────────────────────────────────────────────────────────
function AdminIngresos({ income }) {
  const totalAnual  = income.reduce((a,m) => a+m.total, 0)
  const totalProfe  = income.reduce((a,m) => a+m.profe, 0)
  const totalCancha = income.reduce((a,m) => a+m.cancha, 0)
  const pct = (v) => totalAnual ? Math.round(v/totalAnual*100) : 0
  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Ingresos</h1>
      </div>
      <div style={{display:"flex",gap:12,marginBottom:18,flexWrap:"wrap"}}>
        <StatCard label="Total 2026" value={fmt(totalAnual)}      sub="acumulado"        icon="💰"/>
        <StatCard label="Profe"      value={fmt(totalProfe)}      sub={`${pct(totalProfe)}%`}  icon="🎾"/>
        <StatCard label="Cancha"     value={fmt(totalCancha)}     sub={`${pct(totalCancha)}%`} icon="🏟️" color="#60a5fa"/>
        <StatCard label="Ahorro 5%"  value={fmt(totalAnual*0.05)} sub="objetivo"         icon="🐖" color="#fbbf24"/>
      </div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:18}}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={income} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={B.border}/>
            <XAxis dataKey="mes" tick={{fill:B.textSub,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v => fmt(v)} tick={{fill:B.textSub,fontSize:9}} axisLine={false} tickLine={false}/>
            <Tooltip formatter={(v,n) => [fmtFull(v), n==="profe"?"Profe":"Cancha"]}
              contentStyle={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:8,color:B.text}}/>
            <Bar dataKey="profe"  fill={B.gold}  radius={[4,4,0,0]} name="profe"/>
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
export function AdminMode({ students, schedule, onUpdate, onSaveSchedule, onAddPayment, onRemovePayment, onLogout }) {
  const [view, setView] = useState("dashboard")
  return (
    <div style={{display:"flex",height:"100vh",background:B.bg,color:B.text,fontFamily:"'Segoe UI',system-ui,sans-serif",overflow:"hidden"}}>
      <AdminSidebar active={view} onNav={setView} onLogout={onLogout}/>
      <main style={{flex:1,overflowY:"auto"}}>
        {view==="dashboard"  && <AdminDashboard  students={students} income={INCOME_DATA}/>}
        {view==="alumnos"    && <AdminAlumnos    students={students}/>}
        {view==="asistencia" && <AdminAsistencia students={students} onUpdate={onUpdate}/>}
        {view==="pagos"      && <AdminPagos      students={students} onAddPayment={onAddPayment} onRemovePayment={onRemovePayment}/>}
        {view==="agenda"     && <AdminAgenda     schedule={schedule} students={students} onSave={onSaveSchedule}/>}
        {view==="ingresos"   && <AdminIngresos   income={INCOME_DATA}/>}
        {view==="planes"     && <AdminPlanes/>}
      </main>
    </div>
  )
}
