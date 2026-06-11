// src/components/AdminDashboard.jsx
import { useState } from "react"
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"
import { B, AT, StatCard, fmt, fmtFull, diaCorto, avatarColor } from "../constants"

const DIAS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]

// Barra horizontal simple para distribuciones
function Barra({ label, value, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:B.textSub,marginBottom:3}}>
        <span>{label}</span><span style={{color:B.text,fontWeight:600}}>{value}</span>
      </div>
      <div style={{background:"rgba(255,255,255,0.06)",borderRadius:100,height:7,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:color||B.gold,borderRadius:100}}/>
      </div>
    </div>
  )
}

export function AdminDashboard({ students, income }) {
  const [detalle, setDetalle] = useState(null)  // 'activos' | 'clases' | 'ingresos' | 'asistencia'

  const activos  = students.filter(s => s.estado === "OK")
  const vencidos = students.filter(s => s.estado === "VENCIDO")
  const totalCl  = students.reduce((a, s) => a + s.realizadas, 0)
  const lastMes  = income[income.length - 1]

  // Última clase real
  let ultimaFecha = null
  students.forEach(s => s.asistencia.forEach(a => {
    const k = (f => { const [d,m]=String(f).split("/").map(Number); return (m||0)*100+(d||0) })(a.f)
    const ku = ultimaFecha ? (f => { const [d,m]=String(f).split("/").map(Number); return (m||0)*100+(d||0) })(ultimaFecha) : -1
    if (k > ku) ultimaFecha = a.f
  }))
  const hoyPres = ultimaFecha
    ? students.filter(s => s.asistencia.some(a => a.f === ultimaFecha && a.m === "P"))
    : []

  // Distribución global de asistencias
  const dist = { P:0, I:0, X:0, R:0 }
  students.forEach(s => s.asistencia.forEach(a => { if (dist[a.m] !== undefined) dist[a.m]++ }))
  const totMarcas = dist.P + dist.I + dist.X + dist.R
  const promAsist = totMarcas ? Math.round(((dist.P + dist.R) / totMarcas) * 100) : 0

  // Asistencia por día de la semana
  const wd = DIAS.map(() => ({ pres:0, tot:0 }))
  students.forEach(s => s.asistencia.forEach(a => {
    if (!a.m) return
    const [d,m] = String(a.f).split("/").map(Number)
    const idx = new Date(2026, (m||1)-1, d||1).getDay()
    wd[idx].tot++
    if (a.m === "P" || a.m === "R") wd[idx].pres++
  }))

  // Ingresos: totales, split, promedio, proyección
  const totalAnual  = income.reduce((a,m) => a+m.total, 0)
  const totalProfe  = income.reduce((a,m) => a+m.profe, 0)
  const totalCancha = income.reduce((a,m) => a+m.cancha, 0)
  const promMes = income.length ? Math.round(totalAnual / income.length) : 0
  const last3   = income.slice(-3)
  const proy    = last3.length ? Math.round(last3.reduce((a,m)=>a+m.total,0) / last3.length) : 0

  // Cuándo se cobra (a partir de pagos con fecha)
  const pagosFecha = []
  students.forEach(s => (s.pagosDetalle || []).forEach(p => { if (p.fecha) pagosFecha.push(p) }))
  const porDiaSemana = [0,0,0,0,0,0,0]
  const porSemanaMes = [0,0,0,0,0]   // semana 1..5 del mes
  pagosFecha.forEach(p => {
    const [Y,M,D] = p.fecha.split("-").map(Number)
    const dt = new Date(Y, M-1, D)
    porDiaSemana[dt.getDay()]++
    porSemanaMes[Math.min(4, Math.ceil(D/7)-1)]++
  })

  const cerrar = () => setDetalle(null)

  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:20}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Dashboard</h1>
        <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Tocá cada tarjeta para ver el detalle · 2026</p>
      </div>

      <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <StatCard label="Activos"    value={activos.length} sub={`${vencidos.length} vencidos`} icon="✅" onClick={()=>setDetalle("activos")}/>
        <StatCard label="Clases"     value={totalCl}        sub="realizadas"  icon="🎾" color="#60a5fa" onClick={()=>setDetalle("clases")}/>
        <StatCard label="Último mes" value={fmt(lastMes.total)} sub={lastMes.mes} icon="💰" onClick={()=>setDetalle("ingresos")}/>
        <StatCard label="Asistencia" value={`${promAsist}%`} sub="promedio"    icon="📈" onClick={()=>setDetalle("asistencia")}/>
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

      {/* ── Modal de detalle ── */}
      {detalle && (
        <div onClick={cerrar}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:B.bgCard,border:`1px solid ${B.goldBorder}`,borderRadius:16,padding:22,width:"100%",maxWidth:420,maxHeight:"88vh",overflowY:"auto"}}>

            {detalle==="activos" && (
              <div>
                <div style={{fontSize:15,fontWeight:700,color:B.gold,marginBottom:14}}>Alumnos</div>
                <Barra label="Activos"  value={activos.length}  max={students.length} color={B.gold}/>
                <Barra label="Vencidos" value={vencidos.length} max={students.length} color="#f87171"/>
                {vencidos.length>0 && (
                  <>
                    <div style={{fontSize:11,color:B.textSub,textTransform:"uppercase",letterSpacing:1,margin:"14px 0 8px"}}>Vencidos a renovar</div>
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      {vencidos.map(s => (
                        <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:B.text}}>
                          <div style={{width:22,height:22,background:avatarColor(s.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#fff"}}>{s.iniciales}</div>
                          {s.nombre}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {detalle==="clases" && (
              <div>
                <div style={{fontSize:15,fontWeight:700,color:B.gold,marginBottom:14}}>Clases ({totMarcas} registros)</div>
                {["P","I","X","R"].map(k => (
                  <Barra key={k} label={AT[k].label} value={dist[k]} max={totMarcas} color={AT[k].text}/>
                ))}
              </div>
            )}

            {detalle==="ingresos" && (
              <div>
                <div style={{fontSize:15,fontWeight:700,color:B.gold,marginBottom:14}}>Ingresos {fmt(totalAnual)}</div>
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  <div style={{flex:1,background:B.bg,border:`1px solid ${B.border}`,borderRadius:10,padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:16,fontWeight:700,color:B.gold}}>{Math.round(totalProfe/totalAnual*100)}%</div>
                    <div style={{fontSize:10,color:B.textSub}}>Profe · {fmt(totalProfe)}</div>
                  </div>
                  <div style={{flex:1,background:B.bg,border:`1px solid ${B.border}`,borderRadius:10,padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:16,fontWeight:700,color:"#60a5fa"}}>{Math.round(totalCancha/totalAnual*100)}%</div>
                    <div style={{fontSize:10,color:B.textSub}}>Cancha · {fmt(totalCancha)}</div>
                  </div>
                </div>
                <div style={{fontSize:11,color:B.textSub,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Por mes</div>
                {income.map(m => <Barra key={m.mes} label={m.mes} value={Math.round(m.total/1000)} max={Math.max(...income.map(x=>x.total))/1000} color={B.gold}/>)}
                <div style={{background:B.bg,border:`1px solid ${B.goldBorder}`,borderRadius:10,padding:"12px 14px",marginTop:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}>
                    <span style={{color:B.textSub}}>Promedio mensual</span><span style={{color:B.text,fontWeight:600}}>{fmtFull(promMes)}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                    <span style={{color:B.textSub}}>Estimación próximo mes</span><span style={{color:B.gold,fontWeight:700}}>{fmtFull(proy)}</span>
                  </div>
                  <div style={{fontSize:10,color:B.textMuted,marginTop:6}}>Estimación = promedio de los últimos 3 meses.</div>
                </div>

                <div style={{fontSize:11,color:B.textSub,textTransform:"uppercase",letterSpacing:1,margin:"16px 0 8px"}}>Cuándo se cobra</div>
                {pagosFecha.length === 0 ? (
                  <div style={{fontSize:12,color:B.textMuted}}>Se irá completando a medida que registres pagos (cada pago nuevo guarda su fecha).</div>
                ) : (
                  <>
                    <div style={{fontSize:10,color:B.textSub,marginBottom:4}}>Por día de la semana</div>
                    {DIAS.map((d,i) => porDiaSemana[i]>0 && <Barra key={d} label={d} value={porDiaSemana[i]} max={Math.max(...porDiaSemana)} color={B.gold}/>)}
                    <div style={{fontSize:10,color:B.textSub,margin:"8px 0 4px"}}>Por semana del mes</div>
                    {porSemanaMes.map((v,i) => v>0 && <Barra key={i} label={`Semana ${i+1}`} value={v} max={Math.max(...porSemanaMes)} color="#60a5fa"/>)}
                  </>
                )}
              </div>
            )}

            {detalle==="asistencia" && (
              <div>
                <div style={{fontSize:15,fontWeight:700,color:B.gold,marginBottom:14}}>Asistencia · {promAsist}% promedio</div>
                <div style={{fontSize:11,color:B.textSub,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Tasa por día de la semana</div>
                {DIAS.map((d,i) => {
                  if (d === "Dom" || wd[i].tot === 0) return null
                  const r = Math.round((wd[i].pres / wd[i].tot) * 100)
                  return <Barra key={d} label={`${d} (${wd[i].tot} clases)`} value={r} max={100} color={r>=75?B.gold:r>=50?"#fbbf24":"#f87171"}/>
                })}
              </div>
            )}

            <button onClick={cerrar}
              style={{width:"100%",marginTop:16,padding:"10px",borderRadius:9,border:`1px solid ${B.border}`,background:"transparent",color:B.textSub,fontSize:13,cursor:"pointer"}}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
