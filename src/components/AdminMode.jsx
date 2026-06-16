// src/components/AdminMode.jsx
import { useState, useMemo, useEffect } from "react"
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"
import {
  B, AT, LogoLR, INCOME_DATA, MESES, StatCard,
  DIAS_LABEL, hoyDDMM, dateKey, diaCorto,
  fmt, fmtFull, initials, avatarColor,
} from "../constants"
import { AdminDashboard } from "./AdminDashboard"
import { AdminConsejos } from "./AdminConsejos"

const ADMIN_NAV = [
  { id:"dashboard",  label:"Dashboard",  emoji:"▦" },
  { id:"alumnos",    label:"Alumnos",    emoji:"◉" },
  { id:"asistencia", label:"Asistencia", emoji:"◈" },
  { id:"pagos",      label:"Pagos",      emoji:"◇" },
  { id:"agenda",     label:"Agenda",     emoji:"◻" },
  { id:"ingresos",   label:"Ingresos",   emoji:"△" },
  { id:"planes",     label:"Planes",     emoji:"❖" },
  { id:"consejos",   label:"Consejos",   emoji:"💡" },
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

// ─── Alumnos ──────────────────────────────────────────────────────────────────
const VACIO = { nombre:"", pin:"", plan:"8 Clases", abonadas:"", email:"", tel:"" }

function AlumnoForm({ inicial, titulo, onGuardar, onCancelar, error, planOpts = [] }) {
  const [f, setF] = useState(inicial)
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }))
  const inp = {width:"100%",margin:"4px 0 10px",padding:"9px 10px",background:B.bg,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:14,outline:"none"}
  const lbl = {fontSize:11,color:B.textSub,textTransform:"uppercase",letterSpacing:1}
  return (
    <div>
      <div style={{fontSize:15,fontWeight:700,color:B.gold,marginBottom:14}}>{titulo}</div>
      <label style={lbl}>Nombre</label>
      <input style={inp} value={f.nombre} onChange={e=>set("nombre",e.target.value)} placeholder="Nombre y apellido"/>
      <label style={lbl}>PIN (4 dígitos)</label>
      <input style={inp} value={f.pin} onChange={e=>set("pin",e.target.value)} inputMode="numeric" maxLength={4} placeholder="1234"/>
      <label style={lbl}>Plan</label>
      <select style={inp} value={f.plan} onChange={e=>set("plan",e.target.value)}>
        {planOpts.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <label style={lbl}>Clases abonadas</label>
      <input style={inp} type="number" inputMode="numeric" value={f.abonadas} onChange={e=>set("abonadas",e.target.value)} placeholder="0"/>
      <label style={lbl}>Email (opcional)</label>
      <input style={inp} value={f.email} onChange={e=>set("email",e.target.value)} placeholder="—"/>
      <label style={lbl}>Teléfono (opcional)</label>
      <input style={inp} value={f.tel} onChange={e=>set("tel",e.target.value)} placeholder="—"/>
      {error && <div style={{fontSize:12,color:"#f87171",marginBottom:8}}>{error}</div>}
      <button onClick={()=>onGuardar(f)} style={{width:"100%",padding:"11px",borderRadius:9,border:"none",background:B.gold,color:B.bgDark,fontSize:14,fontWeight:700,cursor:"pointer"}}>Guardar</button>
      <button onClick={onCancelar} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:9,border:`1px solid ${B.border}`,background:"transparent",color:B.textSub,fontSize:13,cursor:"pointer"}}>Cancelar</button>
    </div>
  )
}

function Ficha({ s, onEditar, onArchivar, onBaja, onCerrar }) {
  const disp = s.abonadas - s.realizadas
  const cuenta = (m) => s.asistencia.filter(a => a.m === m).length
  const pagos = Object.entries(s.pagos || {})
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <div style={{width:46,height:46,background:avatarColor(s.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"#fff"}}>{s.iniciales}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:17,fontWeight:700,color:B.text}}>{s.nombre}</div>
          <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:s.estado==="OK"?B.goldBg:B.dangerBg,color:s.estado==="OK"?B.gold:"#f87171",border:`1px solid ${s.estado==="OK"?B.goldBorder:B.dangerBorder}`}}>{s.estado}</span>
        </div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[{n:s.abonadas,l:"Abonadas"},{n:s.realizadas,l:"Realizadas"},{n:disp,l:"Disponibles"}].map(({n,l})=>(
          <div key={l} style={{flex:1,background:B.bg,border:`1px solid ${B.border}`,borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
            <div style={{fontSize:20,fontWeight:700,color:l==="Disponibles"?(disp<=2?"#fbbf24":B.gold):B.text}}>{n}</div>
            <div style={{fontSize:9,color:B.textSub,textTransform:"uppercase",letterSpacing:1,marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{background:B.bg,border:`1px solid ${B.border}`,borderRadius:10,padding:"10px 12px",marginBottom:10,fontSize:12,color:B.textSub}}>
        <div style={{marginBottom:4}}>📋 Plan: <span style={{color:B.text}}>{s.plan}</span></div>
        <div style={{marginBottom:4}}>🔑 PIN: <span style={{color:B.text}}>{s.pin}</span></div>
        {s.email && <div style={{marginBottom:4}}>📧 {s.email}</div>}
        {s.tel && <div>📱 {s.tel}</div>}
      </div>

      <div style={{display:"flex",gap:6,marginBottom:10}}>
        {["P","I","X","R"].map(k=>{const st=AT[k];return(
          <div key={k} style={{flex:1,background:st.bg,border:`1px solid ${st.border}`,borderRadius:8,padding:"8px 4px",textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:700,color:st.text}}>{cuenta(k)}</div>
            <div style={{fontSize:8,color:st.text,opacity:0.8,textTransform:"uppercase"}}>{st.label}</div>
          </div>
        )})}
      </div>

      {pagos.length>0 && (
        <div style={{background:B.bg,border:`1px solid ${B.border}`,borderRadius:10,padding:"10px 12px",marginBottom:14}}>
          <div style={{fontSize:10,color:B.textSub,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Pagos</div>
          {pagos.map(([m,v])=>(
            <div key={m} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
              <span style={{color:B.textSub}}>{m}</span><span style={{color:B.gold,fontWeight:600}}>{fmtFull(v)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{background:B.bg,border:`1px solid ${B.border}`,borderRadius:10,padding:"10px 12px",marginBottom:14}}>
        <div style={{fontSize:10,color:B.textSub,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Historial de asistencias</div>
        {s.asistencia.length===0 && <div style={{fontSize:12,color:B.textMuted}}>Sin registros aún.</div>}
        <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:180,overflowY:"auto"}}>
          {[...s.asistencia].reverse().map(({f,m},i)=>{const st=AT[m];return(
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 8px",borderRadius:7,background:st?`${st.bg}88`:B.bgCard,border:`1px solid ${st?st.border+"55":B.border}`}}>
              <span style={{fontSize:12,color:B.text}}>{diaCorto(f)} {f}</span>
              <span style={{fontSize:11,color:st?st.text:B.textMuted,fontWeight:600}}>{st?st.label:"—"}</span>
            </div>
          )})}
        </div>
      </div>
      <button onClick={onEditar} style={{width:"100%",padding:"11px",borderRadius:9,border:"none",background:B.gold,color:B.bgDark,fontSize:14,fontWeight:700,cursor:"pointer"}}>Editar</button>
      <button onClick={onArchivar} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:9,border:`1px solid ${B.border}`,background:B.bgCard,color:B.textSub,fontSize:13,fontWeight:600,cursor:"pointer"}}>{s.archivado ? "Desarchivar (volvió)" : "Archivar (dejó de venir)"}</button>
      <button onClick={onBaja} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:9,border:`1px solid ${B.dangerBorder}`,background:B.dangerBg,color:"#f87171",fontSize:13,fontWeight:600,cursor:"pointer"}}>Dar de baja</button>
      <button onClick={onCerrar} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:9,border:`1px solid ${B.border}`,background:"transparent",color:B.textSub,fontSize:13,cursor:"pointer"}}>Cerrar</button>
    </div>
  )
}

function AdminAlumnos({ students, onAdd, onUpdate, onDelete, planNames = [] }) {
  const [search, setSearch]   = useState("")
  const [filter, setFilter]   = useState("Vigentes")
  const [selId, setSelId]     = useState(null)
  const [editing, setEditing] = useState(false)
  const [adding, setAdding]   = useState(false)
  const [err, setErr]         = useState("")

  const filtered = useMemo(() => students.filter(s => {
    if (!s.nombre.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === "Archivados") return s.archivado
    if (s.archivado) return false
    if (filter === "OK")      return s.estado === "OK"
    if (filter === "Vencido") return s.estado === "VENCIDO"
    return true // Vigentes
  }), [students, search, filter])

  const nVig = students.filter(s => !s.archivado).length
  const nArch = students.filter(s => s.archivado).length

  const sel = students.find(s => s.id === selId) || null

  const cerrarTodo = () => { setSelId(null); setEditing(false); setAdding(false); setErr("") }

  const guardarNuevo = async (f) => {
    const r = await onAdd(f)
    if (r && r.ok) cerrarTodo(); else setErr((r && r.msg) || "Error")
  }
  const guardarEdit = (f) => {
    const nombre = (f.nombre || "").trim() || sel.nombre
    onUpdate(selId, st => ({
      ...st,
      nombre,
      iniciales: nombre.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase(),
      pin: f.pin, plan: f.plan, abonadas: Number(f.abonadas)||0,
      email: f.email, tel: f.tel,
    }))
    setEditing(false)
  }
  const archivar = () => {
    if (sel) { onUpdate(sel.id, st => ({ ...st, archivado: !st.archivado })); cerrarTodo() }
  }
  const darDeBaja = () => {
    if (sel && window.confirm(`¿Dar de baja a ${sel.nombre}? Se borran todos sus datos y no se puede deshacer.`)) {
      onDelete(sel.id); cerrarTodo()
    }
  }

  return (
    <div style={{padding:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Alumnos</h1>
          <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>{nVig} vigentes · {nArch} archivados · tocá uno para ver su ficha</p>
        </div>
        <button onClick={()=>{ setAdding(true); setErr("") }}
          style={{padding:"9px 16px",borderRadius:9,border:"none",background:B.gold,color:B.bgDark,fontSize:13,fontWeight:700,cursor:"pointer"}}>
          + Agregar alumno
        </button>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar..."
          style={{flex:"1 1 150px",padding:"8px 12px",background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:13,outline:"none"}}/>
        {["Vigentes","OK","Vencido","Archivados"].map(f => (
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
                <tr key={s.id} onClick={()=>{ setSelId(s.id); setEditing(false) }}
                  style={{borderBottom:i<filtered.length-1?`1px solid ${B.border}`:"none",cursor:"pointer"}}
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

      {(sel || adding) && (
        <div onClick={cerrarTodo}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:B.bgCard,border:`1px solid ${B.goldBorder}`,borderRadius:16,padding:22,width:"100%",maxWidth:380,maxHeight:"88vh",overflowY:"auto"}}>
            {adding && (
              <AlumnoForm inicial={VACIO} titulo="Nuevo alumno" error={err} planOpts={planNames}
                onGuardar={guardarNuevo} onCancelar={cerrarTodo}/>
            )}
            {sel && editing && (
              <AlumnoForm titulo="Editar alumno" planOpts={planNames}
                inicial={{nombre:sel.nombre,pin:sel.pin,plan:sel.plan,abonadas:String(sel.abonadas),email:sel.email||"",tel:sel.tel||""}}
                onGuardar={guardarEdit} onCancelar={()=>setEditing(false)}/>
            )}
            {sel && !editing && (
              <Ficha s={sel} onEditar={()=>setEditing(true)} onArchivar={archivar} onBaja={darDeBaja} onCerrar={cerrarTodo}/>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Asistencia ───────────────────────────────────────────────────────────────
function AdminAsistencia({ students, schedule, onUpdate }) {
  const [wk, setWk] = useState(0)
  const hoy     = hoyDDMM()
  const activeS = students.filter(s => !s.archivado)  // OK y vencidos; solo se ocultan los archivados

  // Semana Lun–Sáb (con etiqueta corta y completa)
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

  // foco: índice de día 0–5, o "semana". Por defecto, hoy (si está en la semana).
  const [focus, setFocus] = useState(() => {
    const d = new Date().getDay()           // 0 Dom..6 Sáb
    return d === 0 ? 0 : d - 1              // Lun=0 .. Sáb=5
  })
  const [showAll, setShowAll] = useState(false)

  // Alumnos asignados a un día en la agenda
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

  const overallPct = (s) => {
    const tot  = s.asistencia.filter(a => a.m).length
    const pres = s.asistencia.filter(a => a.m === "P" || a.m === "R").length
    return tot ? Math.round((pres / tot) * 100) : null
  }

  const esSemana = focus === "semana"
  const dispCols = esSemana ? cols : [cols[focus]]
  const focusDate = esSemana ? hoy : cols[focus].f

  // Filas a mostrar
  let rows = activeS
  if (!esSemana && !showAll) {
    const nombres = namesForDay(cols[focus].diaFull)
    rows = activeS.filter(s => nombres.has(s.nombre))
  }

  const markAll = (marca) => rows.forEach(s => setMark(s, focusDate, marca))

  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:14}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Asistencia</h1>
        <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Por día se ven solo los que entrenan (según la agenda)</p>
      </div>

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
                    const st    = AT[marca]
                    const isHoy = c.f === hoy
                    return (
                      <td key={c.f} style={{padding:"4px 5px",textAlign:"center"}}>
                        <button
                          onClick={() => {
                            const cycle = ["","P","I","X","R"]
                            const next  = cycle[(cycle.indexOf(marca)+1) % cycle.length]
                            setMark(s, c.f, next)
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
  const hoyISO = (() => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` })()
  const [open, setOpen]     = useState(false)
  const [sid, setSid]       = useState("")
  const [mes, setMes]       = useState(mesActual)
  const [monto, setMonto]   = useState("")
  const [clases, setClases] = useState("")
  const [fechaPago, setFechaPago] = useState(hoyISO)

  const conPagos = students.filter(s => Object.keys(s.pagos || {}).length > 0)
  const cols = MESES.filter(m => students.some(s => s.pagos && s.pagos[m]))

  const abrir = (studentId = "", mesSel = mesActual) => {
    const st = students.find(s => s.id === studentId)
    setSid(studentId)
    setMes(mesSel)
    setMonto(st && st.pagos && st.pagos[mesSel] ? String(st.pagos[mesSel]) : "")
    setClases("")
    setFechaPago(hoyISO)
    setOpen(true)
  }

  const guardar = () => {
    if (!sid || !mes || !(Number(monto) > 0)) return
    onAddPayment(sid, mes, Number(monto), Number(clases) || 0, fechaPago)
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
              style={{width:"100%",margin:"5px 0 12px",padding:"10px",background:B.bg,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:14,outline:"none"}}/>

            <label style={{fontSize:11,color:B.textSub,textTransform:"uppercase",letterSpacing:1}}>Fecha del pago</label>
            <input type="date" value={fechaPago} onChange={e => setFechaPago(e.target.value)}
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
  const activos = students.filter(s => !s.archivado)  // OK y vencidos; solo se ocultan los archivados
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
        <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Tocá una celda para asignar alumnos</p>
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
                    <span style={s.estado==="VENCIDO"
                      ? {fontSize:13,color:"#f87171",border:`1px solid ${B.dangerBorder}`,background:B.dangerBg,padding:"2px 8px",borderRadius:6,fontWeight:600}
                      : {flex:1,fontSize:13,color:B.text}}>{s.nombre}</span>
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

// ─── Planes (editable) ────────────────────────────────────────────────────────
function PlanForm({ inicial, titulo, onGuardar, onCancelar }) {
  const [f, setF] = useState(inicial)
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }))
  const inp = {width:"100%",margin:"4px 0 10px",padding:"9px 10px",background:B.bg,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:14,outline:"none"}
  const lbl = {fontSize:11,color:B.textSub,textTransform:"uppercase",letterSpacing:1}
  return (
    <div>
      <div style={{fontSize:15,fontWeight:700,color:B.gold,marginBottom:14}}>{titulo}</div>
      <label style={lbl}>Código (1 letra)</label>
      <input style={inp} value={f.code} maxLength={2} onChange={e=>set("code",e.target.value)} placeholder="O"/>
      <label style={lbl}>Nombre</label>
      <input style={inp} value={f.nombre} onChange={e=>set("nombre",e.target.value)} placeholder="8 Clases"/>
      <label style={lbl}>Cantidad de clases</label>
      <input style={inp} type="number" inputMode="numeric" value={f.clases} onChange={e=>set("clases",e.target.value)} placeholder="8"/>
      <label style={lbl}>Precio individual (₲)</label>
      <input style={inp} type="number" inputMode="numeric" value={f.individual} onChange={e=>set("individual",e.target.value)} placeholder="650000"/>
      <label style={lbl}>Precio pareja (₲, opcional)</label>
      <input style={inp} type="number" inputMode="numeric" value={f.pareja} onChange={e=>set("pareja",e.target.value)} placeholder="—"/>
      <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:B.text,margin:"4px 0 14px",cursor:"pointer"}}>
        <input type="checkbox" checked={!!f.popular} onChange={e=>set("popular",e.target.checked)} style={{width:18,height:18,accentColor:B.gold}}/>
        Destacar como POPULAR
      </label>
      <button onClick={()=>onGuardar(f)} style={{width:"100%",padding:"11px",borderRadius:9,border:"none",background:B.gold,color:B.bgDark,fontSize:14,fontWeight:700,cursor:"pointer"}}>Guardar</button>
      <button onClick={onCancelar} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:9,border:`1px solid ${B.border}`,background:"transparent",color:B.textSub,fontSize:13,cursor:"pointer"}}>Cancelar</button>
    </div>
  )
}

function AdminPlanes({ planes, onSave }) {
  const lista = planes || []
  const [edit, setEdit] = useState(null)   // índice (number), "new", o null

  const guardar = (f) => {
    const plan = {
      code: (f.code || "").toUpperCase().slice(0,2) || "?",
      nombre: (f.nombre || "").trim() || "Paquete",
      clases: Number(f.clases) || 0,
      individual: Number(f.individual) || 0,
      popular: !!f.popular,
    }
    if (f.pareja !== "" && f.pareja != null) plan.pareja = Number(f.pareja)
    const next = edit === "new" ? [...lista, plan] : lista.map((p,i) => i===edit ? plan : p)
    onSave(next)
    setEdit(null)
  }
  const borrar = (i) => {
    if (window.confirm(`¿Eliminar el paquete "${lista[i].nombre}"?`)) onSave(lista.filter((_,j)=>j!==i))
  }
  const inicialDe = (i) => {
    if (i === "new") return { code:"", nombre:"", clases:"", individual:"", pareja:"", popular:false }
    const p = lista[i]
    return { code:p.code||"", nombre:p.nombre||"", clases:String(p.clases||""), individual:String(p.individual||""), pareja:p.pareja!=null?String(p.pareja):"", popular:!!p.popular }
  }

  return (
    <div style={{padding:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Planes</h1>
          <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Tocá un paquete para editarlo</p>
        </div>
        <button onClick={()=>setEdit("new")}
          style={{padding:"9px 16px",borderRadius:9,border:"none",background:B.gold,color:B.bgDark,fontSize:13,fontWeight:700,cursor:"pointer"}}>
          + Nuevo paquete
        </button>
      </div>

      <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:20}}>
        {lista.map((p, i) => (
          <div key={i} onClick={()=>setEdit(i)} style={{flex:"1 1 160px",background:B.bgCard,border:`1px solid ${p.popular?B.gold:B.border}`,borderRadius:14,padding:20,position:"relative",cursor:"pointer"}}>
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
              {p.pareja != null && (
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:11,color:B.textSub}}>Pareja</span>
                  <span style={{fontSize:13,fontWeight:700,color:B.text}}>{fmtFull(p.pareja)}</span>
                </div>
              )}
            </div>
            <button onClick={(e)=>{ e.stopPropagation(); borrar(i) }}
              style={{position:"absolute",bottom:10,right:10,background:"transparent",border:"none",color:B.textMuted,cursor:"pointer",fontSize:13}}>🗑</button>
          </div>
        ))}
        {lista.length===0 && <div style={{fontSize:13,color:B.textMuted}}>Sin paquetes. Tocá "+ Nuevo paquete".</div>}
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

      {edit !== null && (
        <div onClick={()=>setEdit(null)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:B.bgCard,border:`1px solid ${B.goldBorder}`,borderRadius:16,padding:22,width:"100%",maxWidth:360,maxHeight:"88vh",overflowY:"auto"}}>
            <PlanForm inicial={inicialDe(edit)} titulo={edit==="new"?"Nuevo paquete":"Editar paquete"}
              onGuardar={guardar} onCancelar={()=>setEdit(null)}/>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Detección de pantalla chica ─────────────────────────────────────────────
function useIsMobile(bp = 720) {
  const [m, setM] = useState(typeof window !== "undefined" && window.innerWidth < bp)
  useEffect(() => {
    const on = () => setM(window.innerWidth < bp)
    window.addEventListener("resize", on)
    return () => window.removeEventListener("resize", on)
  }, [bp])
  return m
}

// ─── Barra superior (celular) ─────────────────────────────────────────────────
function AdminTopNav({ active, onNav, onLogout }) {
  return (
    <div style={{background:B.bgDark,borderBottom:`1px solid ${B.border}`,position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <LogoLR size={28}/>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:B.gold,letterSpacing:2,textTransform:"uppercase"}}>Academia LR</div>
            <div style={{fontSize:9,color:B.textSub}}>Modo Profe</div>
          </div>
        </div>
        <button onClick={onLogout}
          style={{background:"transparent",border:`1px solid ${B.border}`,borderRadius:8,color:B.textSub,fontSize:12,padding:"5px 10px",cursor:"pointer"}}>
          Salir
        </button>
      </div>
      <div style={{display:"flex",overflowX:"auto",padding:"0 8px",gap:2}}>
        {ADMIN_NAV.map(({ id, label, emoji }) => {
          const on = active === id
          return (
            <button key={id} onClick={() => onNav(id)}
              style={{padding:"9px 12px",background:"transparent",border:"none",borderBottom:`2px solid ${on?B.gold:"transparent"}`,color:on?B.gold:B.textSub,fontSize:13,fontWeight:on?600:400,whiteSpace:"nowrap",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:"'Segoe UI',sans-serif"}}>
              <span>{emoji}</span>{label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── AdminMode (componente exportado) ─────────────────────────────────────────
export function AdminMode({ students, schedule, planes, consejos, onUpdate, onAddStudent, onDeleteStudent, onSaveSchedule, onSavePlanes, onSaveConsejos, onAddPayment, onRemovePayment, onLogout }) {
  const [view, setView] = useState("dashboard")
  const isMobile = useIsMobile()
  const planNames = (planes || []).map(p => p.nombre)

  const renderView = () => (
    <>
      {view==="dashboard"  && <AdminDashboard  students={students} income={INCOME_DATA}/>}
      {view==="alumnos"    && <AdminAlumnos    students={students} onAdd={onAddStudent} onUpdate={onUpdate} onDelete={onDeleteStudent} planNames={planNames}/>}
      {view==="asistencia" && <AdminAsistencia students={students} schedule={schedule} onUpdate={onUpdate}/>}
      {view==="pagos"      && <AdminPagos      students={students} onAddPayment={onAddPayment} onRemovePayment={onRemovePayment}/>}
      {view==="agenda"     && <AdminAgenda     schedule={schedule} students={students} onSave={onSaveSchedule}/>}
      {view==="ingresos"   && <AdminIngresos   income={INCOME_DATA}/>}
      {view==="planes"     && <AdminPlanes     planes={planes} onSave={onSavePlanes}/>}
      {view==="consejos"   && <AdminConsejos   consejos={consejos} onSave={onSaveConsejos}/>}
    </>
  )

  // Celular: pestañas arriba, contenido a lo ancho debajo
  if (isMobile) {
    return (
      <div style={{minHeight:"100vh",background:B.bg,color:B.text,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
        <AdminTopNav active={view} onNav={setView} onLogout={onLogout}/>
        <main>{renderView()}</main>
      </div>
    )
  }

  // Tablet / escritorio: barra lateral
  return (
    <div style={{display:"flex",height:"100vh",background:B.bg,color:B.text,fontFamily:"'Segoe UI',system-ui,sans-serif",overflow:"hidden"}}>
      <AdminSidebar active={view} onNav={setView} onLogout={onLogout}/>
      <main style={{flex:1,overflowY:"auto"}}>{renderView()}</main>
    </div>
  )
}
