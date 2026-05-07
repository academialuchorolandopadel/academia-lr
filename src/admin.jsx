import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  B, AT, DIAS_KEYS, DIAS_LABEL, RECENT_DATES,
  INCOME_DATA, PLANES, INITIAL_SCHEDULE, INITIAL_PAYMENTS,
  fmt, fmtFull, initials, avatarColor, detectarPlan, genId, capacidadMax,
} from "./tokens-data.js";
import { LogoLR, StudentAvatar } from "./components.jsx";

/* ══════════════════════════════════════════════════════════════
   admin.jsx — Modo Profe completo
   Academia LR
══════════════════════════════════════════════════════════════ */

/* ──────────── SIDEBAR ──────────── */
const ADMIN_NAV = [
  { id:"dashboard",  label:"Dashboard",  emoji:"▦" },
  { id:"alumnos",    label:"Alumnos",    emoji:"◉" },
  { id:"asistencia", label:"Asistencia", emoji:"◈" },
  { id:"pagos",      label:"Pagos",      emoji:"◇" },
  { id:"horarios",   label:"Horarios",   emoji:"◻" },
  { id:"ingresos",   label:"Ingresos",   emoji:"△" },
  { id:"planes",     label:"Planes",     emoji:"❖" },
];

function AdminSidebar({ active, onNav, onLogout }) {
  return (
    <div style={{ width: 215, background: B.bgDark, borderRight: `1px solid ${B.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "22px 18px 20px", borderBottom: `1px solid ${B.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <LogoLR size={48} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: B.gold, letterSpacing: 2, textTransform: "uppercase" }}>Academia LR</div>
          <div style={{ fontSize: 10, color: B.textSub, letterSpacing: 1, marginTop: 2 }}>Modo Profe</div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {ADMIN_NAV.map(({ id, label, emoji }) => {
          const on = active === id;
          return (
            <button key={id} onClick={() => onNav(id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8,
              border: "none", cursor: "pointer", textAlign: "left", width: "100%",
              background: on ? B.goldBg : "transparent", color: on ? B.gold : B.textSub,
              fontWeight: on ? 600 : 400, fontSize: 13,
              borderLeft: `2px solid ${on ? B.gold : "transparent"}`, transition: "all 0.15s",
              fontFamily: "'Segoe UI',sans-serif"
            }}>
              <span style={{ fontSize: 14 }}>{emoji}</span> {label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "14px 18px", borderTop: `1px solid ${B.border}` }}>
        <button onClick={onLogout} style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${B.border}`, background: "transparent", color: B.textSub, fontSize: 12, cursor: "pointer", fontFamily: "'Segoe UI',sans-serif" }}>Cerrar sesión</button>
      </div>
    </div>
  );
}

/* ──────────── STAT CARD ──────────── */
function StatCard({ label, value, sub, icon, color }) {
  const c = color || B.gold;
  return (
    <div style={{ background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, padding: "18px 20px", flex: 1, minWidth: 130 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: B.textSub, marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: B.text, lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: c, marginTop: 5 }}>{sub}</div>}
        </div>
        {icon && <span style={{ fontSize: 22 }}>{icon}</span>}
      </div>
    </div>
  );
}

/* ──────────── DASHBOARD ──────────── */
function AdminDashboard({ students }) {
  const active = students.filter(s => s.estado === "OK").length;
  const vencidos = students.filter(s => s.estado === "VENCIDO").length;
  const totalCl = students.reduce((a, s) => a + s.realizadas, 0);
  const lastMes = INCOME_DATA[INCOME_DATA.length - 1];
  const hoyPres = students.filter(s => s.asistencia[s.asistencia.length - 1]?.m === "P");
  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: B.text, margin: 0 }}>Dashboard</h1>
        <p style={{ color: B.textSub, fontSize: 13, margin: "4px 0 0" }}>Resumen general · Mayo 2026</p>
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Alumnos activos" value={active} sub={`${vencidos} vencidos`} icon="✅" />
        <StatCard label="Clases realizadas" value={totalCl} sub="en el año" icon="🎾" color="#60a5fa" />
        <StatCard label="Ingreso último mes" value={fmt(lastMes.total)} sub={lastMes.mes} icon="💰" />
        <StatCard label="Tasa asistencia" value="82%" sub="promedio OK" icon="📈" />
      </div>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 380px", background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: B.text, marginBottom: 14 }}>Ingresos 2026</div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={INCOME_DATA}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={B.gold} stopOpacity={0.3} /><stop offset="95%" stopColor={B.gold} stopOpacity={0} /></linearGradient>
                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} /><stop offset="95%" stopColor="#60a5fa" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={B.border} />
              <XAxis dataKey="mes" tick={{ fill: B.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v)} tick={{ fill: B.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v, n) => [fmtFull(v), n === "profe" ? "Profe" : "Cancha"]} contentStyle={{ background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 8, color: B.text }} />
              <Area type="monotone" dataKey="profe" stroke={B.gold} fill="url(#gP)" strokeWidth={2} />
              <Area type="monotone" dataKey="cancha" stroke="#60a5fa" fill="url(#gC)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: B.textSub }}><div style={{ width: 10, height: 10, background: B.gold, borderRadius: 2 }} /> Profe</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: B.textSub }}><div style={{ width: 10, height: 10, background: "#60a5fa", borderRadius: 2 }} /> Cancha</div>
          </div>
        </div>
        <div style={{ flex: "1 1 200px", background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: B.text, marginBottom: 4 }}>Última clase</div>
          <div style={{ fontSize: 11, color: B.textSub, marginBottom: 14 }}>30 Abr · {hoyPres.length} presentes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto" }}>
            {hoyPres.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StudentAvatar student={s} size={26} fontSize={9} />
                <span style={{ fontSize: 12, color: B.text }}>{s.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────── ALUMNOS (con reset PIN) ──────────── */
function AdminAlumnos({ students, onUpdate }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("TODOS");
  const [resetTarget, setResetTarget] = useState(null);

  const filtered = useMemo(() => students.filter(s => {
    const ms = s.nombre.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "TODOS" || s.estado === filter;
    return ms && mf;
  }), [students, search, filter]);

  const handleResetPin = () => {
    if (!resetTarget) return;
    onUpdate(resetTarget.id, s => ({ ...s, pin: "0000" }));
    setResetTarget(null);
  };

  return (
    <div style={{ padding: 28 }}>
      {resetTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: B.bgCard, border: `1px solid ${B.goldBorder}`, borderRadius: 20, padding: "28px 24px", textAlign: "center", maxWidth: 320 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: B.gold, marginBottom: 8 }}>Resetear PIN</div>
            <div style={{ fontSize: 13, color: B.textSub, marginBottom: 16 }}>¿Resetear el PIN de <strong style={{ color: B.text }}>{resetTarget.nombre}</strong> a <strong style={{ color: B.gold }}>0000</strong>?</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setResetTarget(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${B.border}`, background: "transparent", color: B.textSub, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleResetPin} style={{ flex: 1, padding: "10px", borderRadius: 10, background: B.gold, color: B.bgDark, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Resetear</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 700, color: B.text, margin: 0 }}>Alumnos</h1><p style={{ color: B.textSub, fontSize: 13, margin: "4px 0 0" }}>{students.length} registrados</p></div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar alumno..." style={{ flex: "1 1 180px", padding: "9px 14px", background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 8, color: B.text, fontSize: 13, outline: "none", fontFamily: "'Segoe UI',sans-serif" }} />
        {["TODOS","OK","VENCIDO"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${filter === f ? B.gold : B.border}`, background: filter === f ? B.goldBg : B.bgCard, color: filter === f ? B.gold : B.textSub, cursor: "pointer", fontSize: 12, fontWeight: filter === f ? 600 : 400, fontFamily: "'Segoe UI',sans-serif" }}>{f}</button>
        ))}
      </div>
      <div style={{ background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `1px solid ${B.border}` }}>
            {["Alumno","PIN","Estado","Abonadas","Realizadas","Diferencia","Plan","Acción"].map(h => (
              <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, color: B.textSub, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((s, i) => {
              const diff = s.abonadas - s.realizadas;
              return (
                <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${B.border}` : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = B.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <StudentAvatar student={s} size={30} fontSize={10} />
                      <span style={{ fontSize: 13, color: B.text, fontWeight: 500 }}>{s.nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: "11px 14px" }}><code style={{ fontSize: 12, color: B.gold, background: B.goldBg, padding: "2px 8px", borderRadius: 4 }}>{s.pin}</code></td>
                  <td style={{ padding: "11px 14px" }}><span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: s.estado === "OK" ? B.goldBg : B.dangerBg, color: s.estado === "OK" ? B.gold : "#f87171", border: `1px solid ${s.estado === "OK" ? B.goldBorder : B.dangerBorder}` }}>{s.estado}</span></td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: B.text }}>{s.abonadas}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: B.text }}>{s.realizadas}</td>
                  <td style={{ padding: "11px 14px" }}><span style={{ fontSize: 13, fontWeight: 600, color: diff > 0 ? B.gold : diff < 0 ? "#f87171" : B.textSub }}>{diff > 0 ? `+${diff}` : diff}</span></td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: B.textSub }}>{s.plan}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <button onClick={() => setResetTarget(s)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${B.warningBorder}`, background: B.warningBg, color: B.warning, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>🔒 Reset</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: 32, textAlign: "center", color: B.textSub }}>No se encontraron alumnos</div>}
      </div>
    </div>
  );
}

/* ──────────── ASISTENCIA ──────────── */
function AdminAsistencia({ students, onUpdate }) {
  const hoy = "01/05";
  const activeS = students.filter(s => s.estado === "OK");
  const markAll = (marca) => {
    activeS.forEach(s => onUpdate(s.id, st => {
      const has = st.asistencia.find(a => a.f === hoy);
      return { ...st, asistencia: has ? st.asistencia.map(a => a.f === hoy ? { ...a, m: marca } : a) : [...st.asistencia, { f: hoy, m: marca }] };
    }));
  };
  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 20 }}><h1 style={{ fontSize: 24, fontWeight: 700, color: B.text, margin: 0 }}>Asistencia</h1><p style={{ color: B.textSub, fontSize: 13, margin: "4px 0 0" }}>Historial · Clic en celda para editar</p></div>
      <div style={{ background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: B.textSub, marginBottom: 10 }}>📋 Clase de hoy ({hoy}) — marcar todos como:</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["P","I","X","R"].map(k => <button key={k} onClick={() => markAll(k)} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${AT[k].border}`, background: AT[k].bg, color: AT[k].text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Segoe UI',sans-serif" }}>{k} — {AT[k].label}</button>)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {Object.entries(AT).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, background: v.bg, border: `1px solid ${v.border}` }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: v.text }}>{k}</span><span style={{ fontSize: 11, color: v.text }}>{v.label}</span>
          </div>
        ))}
      </div>
      <div style={{ background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, overflow: "auto" }}>
        <table style={{ borderCollapse: "collapse", minWidth: "100%" }}>
          <thead><tr style={{ borderBottom: `1px solid ${B.border}` }}>
            <th style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, color: B.textSub, fontWeight: 600, textTransform: "uppercase", minWidth: 160 }}>Alumno</th>
            {[...RECENT_DATES, hoy].map(d => <th key={d} style={{ padding: "11px 12px", textAlign: "center", fontSize: 11, color: d === hoy ? B.gold : B.textSub, fontWeight: 600, whiteSpace: "nowrap" }}>{d}{d === hoy ? " ★" : ""}</th>)}
            <th style={{ padding: "11px 12px", textAlign: "center", fontSize: 11, color: B.textSub, fontWeight: 600 }}>%</th>
          </tr></thead>
          <tbody>
            {activeS.map((s, si) => {
              const allD = [...RECENT_DATES, hoy];
              const row = allD.map(d => s.asistencia.find(a => a.f === d)?.m || "");
              const pres = row.filter(c => c === "P").length;
              const tot = row.filter(c => c !== "").length;
              const pct = tot ? Math.round((pres / tot) * 100) : null;
              return (
                <tr key={s.id} style={{ borderBottom: si < activeS.length - 1 ? `1px solid ${B.border}` : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = B.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "9px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <StudentAvatar student={s} size={26} fontSize={9} />
                      <span style={{ fontSize: 12, color: B.text, whiteSpace: "nowrap" }}>{s.nombre}</span>
                    </div>
                  </td>
                  {allD.map((d, di) => {
                    const marca = row[di]; const st = AT[marca]; const isHoy = d === hoy;
                    return (
                      <td key={di} style={{ padding: "5px 6px", textAlign: "center" }}>
                        <button onClick={() => {
                          const cycle = ["", "P", "I", "X", "R"];
                          const next = cycle[(cycle.indexOf(marca) + 1) % cycle.length];
                          onUpdate(s.id, ss => {
                            const has = ss.asistencia.find(a => a.f === d);
                            return { ...ss, asistencia: has ? ss.asistencia.map(a => a.f === d ? { ...a, m: next } : a) : [...ss.asistencia, { f: d, m: next }] };
                          });
                        }} style={{ width: 34, height: 28, borderRadius: 6, border: `1px solid ${st ? st.border : isHoy ? B.goldBorder : B.border}`, background: st ? st.bg : isHoy ? B.goldBg : "transparent", color: st ? st.text : isHoy ? B.gold : B.textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          {marca || "·"}
                        </button>
                      </td>
                    );
                  })}
                  <td style={{ padding: "9px 12px", textAlign: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: pct === null ? B.textMuted : pct >= 75 ? B.gold : pct >= 50 ? "#fbbf24" : "#f87171" }}>{pct !== null ? `${pct}%` : "—"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────── PAGOS (con carga nueva) ──────────── */
function AdminPagos({ students, onUpdate }) {
  const [showCarga, setShowCarga] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [monto, setMonto] = useState("");
  const [clasesManual, setClasesManual] = useState("");
  const [usoAutomatico, setUsoAutomatico] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState("Mayo");

  const planDetectado = monto ? detectarPlan(parseInt(monto)) : null;

  const handleCargarPago = () => {
    if (!alumnoSeleccionado || !monto) return;
    const montoNum = parseInt(monto);
    const clases = usoAutomatico && planDetectado ? planDetectado.clases : parseInt(clasesManual) || 0;
    onUpdate(alumnoSeleccionado.id, s => ({
      ...s,
      pagos: { ...s.pagos, [mesSeleccionado]: montoNum },
      abonadas: s.abonadas + clases,
    }));
    setShowCarga(false); setMonto(""); setClasesManual(""); setAlumnoSeleccionado(null); setUsoAutomatico(true);
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 700, color: B.text, margin: 0 }}>Pagos</h1><p style={{ color: B.textSub, fontSize: 13, margin: "4px 0 0" }}>Historial de cuotas · 2026</p></div>
        <button onClick={() => setShowCarga(true)} style={{ padding: "10px 18px", borderRadius: 10, background: B.gold, color: B.bgDark, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Cargar pago</button>
      </div>

      {/* Modal carga de pago */}
      {showCarga && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 380, background: B.bgCard, border: `1px solid ${B.goldBorder}`, borderRadius: 24, padding: "28px 24px" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: B.gold, marginBottom: 20 }}>Cargar pago</div>

            <label style={{ fontSize: 12, color: B.textSub, display: "block", marginBottom: 6 }}>Alumno</label>
            <select value={alumnoSeleccionado?.id || ""} onChange={e => setAlumnoSeleccionado(students.find(s => s.id === parseInt(e.target.value)))} style={{ width: "100%", padding: "10px", borderRadius: 10, background: B.bg, border: `1px solid ${B.border}`, color: B.text, fontSize: 13, marginBottom: 14, fontFamily: "'Segoe UI',sans-serif" }}>
              <option value="">Seleccionar alumno...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>

            <label style={{ fontSize: 12, color: B.textSub, display: "block", marginBottom: 6 }}>Monto (₲)</label>
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="Ej: 650000" style={{ width: "100%", padding: "10px", borderRadius: 10, background: B.bg, border: `1px solid ${B.border}`, color: B.text, fontSize: 14, marginBottom: 6, fontFamily: "'Segoe UI',sans-serif" }} />

            {planDetectado && (
              <div style={{ fontSize: 12, color: B.gold, background: B.goldBg, padding: "8px 12px", borderRadius: 8, marginBottom: 12 }}>
                🎾 Detectado: <strong>{planDetectado.plan.nombre}</strong> ({planDetectado.tipo}) → {planDetectado.clases} clases
              </div>
            )}

            <label style={{ fontSize: 12, color: B.textSub, display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <input type="checkbox" checked={usoAutomatico} onChange={e => setUsoAutomatico(e.target.checked)} />
              Asignar clases automáticamente por monto
            </label>

            {!usoAutomatico && (
              <>
                <label style={{ fontSize: 12, color: B.textSub, display: "block", marginBottom: 6 }}>Clases a asignar (manual)</label>
                <input type="number" value={clasesManual} onChange={e => setClasesManual(e.target.value)} placeholder="Ej: 8" style={{ width: "100%", padding: "10px", borderRadius: 10, background: B.bg, border: `1px solid ${B.border}`, color: B.text, fontSize: 14, marginBottom: 14, fontFamily: "'Segoe UI',sans-serif" }} />
              </>
            )}

            <label style={{ fontSize: 12, color: B.textSub, display: "block", marginBottom: 6 }}>Mes</label>
            <select value={mesSeleccionado} onChange={e => setMesSeleccionado(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: 10, background: B.bg, border: `1px solid ${B.border}`, color: B.text, fontSize: 13, marginBottom: 20, fontFamily: "'Segoe UI',sans-serif" }}>
              {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setShowCarga(false); setMonto(""); setAlumnoSeleccionado(null); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${B.border}`, background: "transparent", color: B.textSub, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleCargarPago} disabled={!alumnoSeleccionado || !monto} style={{ flex: 1, padding: "10px", borderRadius: 10, background: !alumnoSeleccionado || !monto ? B.border : B.gold, color: B.bgDark, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: !alumnoSeleccionado || !monto ? 0.5 : 1 }}>Cargar</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de pagos */}
      <div style={{ background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `1px solid ${B.border}` }}>
            <th style={{ padding: "11px 18px", textAlign: "left", fontSize: 11, color: B.textSub, fontWeight: 600, textTransform: "uppercase" }}>Alumno</th>
            {["Enero","Febrero","Marzo","Abril"].map(l => <th key={l} style={{ padding: "11px 14px", textAlign: "right", fontSize: 11, color: B.textSub, fontWeight: 600, textTransform: "uppercase" }}>{l}</th>)}
            <th style={{ padding: "11px 14px", textAlign: "right", fontSize: 11, color: B.textSub, fontWeight: 600, textTransform: "uppercase" }}>Total</th>
          </tr></thead>
          <tbody>
            {INITIAL_PAYMENTS.map((p, i) => {
              const cols = ["ene","feb","mar","abr"];
              const total = cols.reduce((a, m) => a + (p[m] || 0), 0);
              return (
                <tr key={p.alumno} style={{ borderBottom: i < INITIAL_PAYMENTS.length - 1 ? `1px solid ${B.border}` : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = B.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 28, height: 28, background: avatarColor(p.alumno), borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: B.gold, border: `1px solid ${B.border}` }}>{initials(p.alumno)}</div>
                      <span style={{ fontSize: 13, color: B.text }}>{p.alumno}</span>
                    </div>
                  </td>
                  {cols.map(m => <td key={m} style={{ padding: "12px 14px", textAlign: "right" }}>{p[m] ? <span style={{ fontSize: 12, color: B.gold, fontWeight: 500 }}>{fmt(p[m])}</span> : <span style={{ fontSize: 12, color: B.textMuted }}>—</span>}</td>)}
                  <td style={{ padding: "12px 14px", textAlign: "right" }}><span style={{ fontSize: 13, fontWeight: 700, color: B.text }}>{fmt(total)}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────── HORARIOS EDITABLE ──────────── */
function AdminHorarios({ students, onUpdate, onAddNotification }) {
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [agendamientosPendientes, setAgendamientosPendientes] = useState([]);

  // Juntar agendamientos de todos los alumnos
  const todosAgendamientos = useMemo(() => {
    const ags = [];
    students.forEach(s => {
      (s.agendamientos || []).forEach(a => {
        ags.push({ ...a, alumnoId: s.id, nombre: s.nombre, iniciales: s.iniciales, foto: s.foto });
      });
    });
    return ags;
  }, [students]);

  // Agendamientos pendientes de aprobación
  const pendientes = useMemo(() => todosAgendamientos.filter(a => a.estado === "pendiente"), [todosAgendamientos]);

  const aprobarAgendamiento = (ag) => {
    onUpdate(ag.alumnoId, s => ({
      ...s,
      agendamientos: (s.agendamientos || []).map(a => a.id === ag.id ? { ...a, estado: "aprobado" } : a),
    }));
    onAddNotification({
      id: genId(), para: "alumno", alumnoId: ag.alumnoId, tipo: "aprobado",
      mensaje: `✅ Tu clase del ${ag.fecha} a las ${ag.hora} fue aprobada.`,
      titulo: "Clase aprobada", leido: false, createdAt: new Date().toLocaleString("es"),
      data: { agendamientoId: ag.id }
    });
  };

  const rechazarAgendamiento = (ag) => {
    onUpdate(ag.alumnoId, s => ({
      ...s,
      agendamientos: (s.agendamientos || []).map(a => a.id === ag.id ? { ...a, estado: "rechazado" } : a),
    }));
    onAddNotification({
      id: genId(), para: "alumno", alumnoId: ag.alumnoId, tipo: "rechazado",
      mensaje: `❌ Tu clase del ${ag.fecha} a las ${ag.hora} fue rechazada.`,
      titulo: "Clase rechazada", leido: false, createdAt: new Date().toLocaleString("es"),
      data: { agendamientoId: ag.id }
    });
  };

  const publicarSlot = (dia, hora) => {
    onAddNotification({
      id: genId(), para: "todos", alumnoId: null, tipo: "horario_publicado",
      mensaje: `📢 Nuevo horario disponible: ${dia} ${hora}`,
      titulo: "¡Horario libre!", leido: false, createdAt: new Date().toLocaleString("es"),
      data: { dia, hora }
    });
  };

  const cambiarTipo = (idx, nuevoTipo) => {
    setSchedule(prev => prev.map((s, i) => i === idx ? { ...s, tipo: nuevoTipo } : s));
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 20 }}><h1 style={{ fontSize: 24, fontWeight: 700, color: B.text, margin: 0 }}>Horarios</h1><p style={{ color: B.textSub, fontSize: 13, margin: "4px 0 0" }}>Grilla semanal editable</p></div>

      {/* Pendientes */}
      {pendientes.length > 0 && (
        <div style={{ background: B.warningBg, border: `1px solid ${B.warningBorder}`, borderRadius: 12, padding: "14px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", marginBottom: 10 }}>🔔 Agendamientos pendientes ({pendientes.length})</div>
          {pendientes.map(ag => (
            <div key={ag.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${B.warningBorder}` }}>
              <div>
                <span style={{ fontSize: 13, color: B.text, fontWeight: 600 }}>{ag.nombre}</span>
                <span style={{ fontSize: 11, color: B.textSub, marginLeft: 10 }}>{ag.fecha} · {ag.hora} · {ag.tipo}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => aprobarAgendamiento(ag)} style={{ padding: "4px 12px", borderRadius: 6, background: "#16a34a", color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✓ Aprobar</button>
                <button onClick={() => rechazarAgendamiento(ag)} style={{ padding: "4px 12px", borderRadius: 6, background: B.danger, color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✗ Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grilla */}
      <div style={{ background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `1px solid ${B.border}` }}>
            <th style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, color: B.textSub, fontWeight: 600, textTransform: "uppercase", width: 70 }}>Hora</th>
            {DIAS_LABEL.map(d => <th key={d} style={{ padding: "8px 6px", textAlign: "center", fontSize: 11, color: B.textSub, fontWeight: 600, textTransform: "uppercase" }}>{d}</th>)}
            <th style={{ padding: "8px", textAlign: "center", fontSize: 11, color: B.textSub, fontWeight: 600 }}>Tipo</th>
            <th style={{ padding: "8px", textAlign: "center", fontSize: 11, color: B.textSub, fontWeight: 600 }}>Acción</th>
          </tr></thead>
          <tbody>
            {schedule.map((slot, idx) => {
              const cap = capacidadMax(slot.tipo);
              return (
                <tr key={slot.hora} style={{ borderBottom: idx < schedule.length - 1 ? `1px solid ${B.border}` : "none" }}>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: B.textSub, fontWeight: 500 }}>{slot.hora} <span style={{ fontSize: 10, color: B.textMuted }}>({slot.duracion}′)</span></td>
                  {DIAS_KEYS.map(dia => {
                    const alumnosEnSlot = slot[dia] || [];
                    const libres = cap - alumnosEnSlot.length;
                    const colorSlot = slot.tipo === "individual" ? { bg: B.individualBg, border: B.individualBorder, text: B.individual } : { bg: B.grupalBg, border: B.grupalBorder, text: B.grupal };
                    return (
                      <td key={dia} style={{ padding: "4px", textAlign: "center" }}>
                        <div style={{ background: colorSlot.bg, border: `1px solid ${colorSlot.border}`, borderRadius: 8, padding: "7px 6px", minHeight: 56, position: "relative" }}>
                          {alumnosEnSlot.map((nombre, i) => {
                            const stu = students.find(s => s.nombre === nombre);
                            return (
                              <div key={i} style={{ fontSize: 10, color: colorSlot.text, fontWeight: 500, marginBottom: 2 }}>
                                {nombre}
                                <button onClick={() => {
                                  const nuevos = alumnosEnSlot.filter(n => n !== nombre);
                                  setSchedule(prev => prev.map((s, si) => si === idx ? { ...s, [dia]: nuevos } : s));
                                }} style={{ marginLeft: 4, background: "transparent", border: "none", color: B.danger, cursor: "pointer", fontSize: 10 }}>✕</button>
                              </div>
                            );
                          })}
                          {libres > 0 && (
                            <select onChange={e => {
                              if (!e.target.value) return;
                              setSchedule(prev => prev.map((s, si) => si === idx ? { ...s, [dia]: [...alumnosEnSlot, e.target.value] } : s));
                              e.target.value = "";
                            }} style={{ width: "100%", fontSize: 10, padding: "3px", borderRadius: 4, background: B.bg, border: `1px solid ${B.border}`, color: B.textSub, marginTop: 4 }}>
                              <option value="">+ Agregar ({libres} libre{libres > 1 ? "s" : ""})</option>
                              {students.filter(s => !alumnosEnSlot.includes(s.nombre)).map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                            </select>
                          )}
                          {libres === 0 && <div style={{ fontSize: 10, color: B.textMuted, marginTop: 4 }}>Completo</div>}
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ padding: "4px", textAlign: "center" }}>
                    <select value={slot.tipo} onChange={e => cambiarTipo(idx, e.target.value)} style={{ fontSize: 10, padding: "3px", borderRadius: 4, background: B.bg, border: `1px solid ${B.border}`, color: B.textSub }}>
                      <option value="individual">Indiv.</option>
                      <option value="grupal">Grupal</option>
                    </select>
                  </td>
                  <td style={{ padding: "4px", textAlign: "center" }}>
                    <button onClick={() => publicarSlot(DIAS_LABEL[DIAS_KEYS.indexOf(DIAS_KEYS[0])], slot.hora)} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 6, background: B.goldBg, border: `1px solid ${B.goldBorder}`, color: B.gold, cursor: "pointer" }}>📢</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────── INGRESOS ──────────── */
function AdminIngresos() {
  const totalAnual = INCOME_DATA.reduce((a, m) => a + m.total, 0);
  const totalProfe = INCOME_DATA.reduce((a, m) => a + m.profe, 0);
  const totalCancha = INCOME_DATA.reduce((a, m) => a + m.cancha, 0);
  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 20 }}><h1 style={{ fontSize: 24, fontWeight: 700, color: B.text, margin: 0 }}>Ingresos</h1><p style={{ color: B.textSub, fontSize: 13, margin: "4px 0 0" }}>Resumen financiero 2026</p></div>
      <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        <StatCard label="Total 2026" value={fmt(totalAnual)} sub="acumulado" icon="💰" />
        <StatCard label="Parte profe" value={fmt(totalProfe)} sub={`${Math.round(totalProfe / totalAnual * 100)}%`} icon="🎾" />
        <StatCard label="Parte cancha" value={fmt(totalCancha)} sub={`${Math.round(totalCancha / totalAnual * 100)}%`} icon="🏟️" color="#60a5fa" />
        <StatCard label="Ahorro 5%" value={fmt(totalAnual * 0.05)} sub="objetivo anual" icon="🐖" color="#fbbf24" />
      </div>
      <div style={{ background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, padding: 22, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: B.text, marginBottom: 14 }}>Profe vs Cancha por mes</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={INCOME_DATA} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={B.border} />
            <XAxis dataKey="mes" tick={{ fill: B.textSub, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => fmt(v)} tick={{ fill: B.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [fmtFull(v), n === "profe" ? "Profe" : "Cancha"]} contentStyle={{ background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 8, color: B.text }} />
            <Bar dataKey="profe" fill={B.gold} radius={[4, 4, 0, 0]} name="profe" />
            <Bar dataKey="cancha" fill="#3b82f6" radius={[4, 4, 0, 0]} name="cancha" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `1px solid ${B.border}` }}>
            {["Mes","Total","Profe","Cancha","% Profe"].map(h => <th key={h} style={{ padding: "11px 18px", textAlign: h === "Mes" ? "left" : "right", fontSize: 11, color: B.textSub, fontWeight: 600, textTransform: "uppercase" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {INCOME_DATA.map((m, i) => (
              <tr key={m.mes} style={{ borderBottom: i < INCOME_DATA.length - 1 ? `1px solid ${B.border}` : "none" }}
                onMouseEnter={e => e.currentTarget.style.background = B.bg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 18px", fontSize: 13, color: B.text, fontWeight: 500 }}>{m.mes}</td>
                <td style={{ padding: "12px 18px", textAlign: "right", fontSize: 13, color: B.text, fontWeight: 700 }}>{fmtFull(m.total)}</td>
                <td style={{ padding: "12px 18px", textAlign: "right", fontSize: 13, color: B.gold }}>{fmtFull(m.profe)}</td>
                <td style={{ padding: "12px 18px", textAlign: "right", fontSize: 13, color: "#60a5fa" }}>{fmtFull(m.cancha)}</td>
                <td style={{ padding: "12px 18px", textAlign: "right", fontSize: 13, color: B.textSub }}>{Math.round(m.profe / m.total * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────── PLANES ──────────── */
function AdminPlanes() {
  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 20 }}><h1 style={{ fontSize: 24, fontWeight: 700, color: B.text, margin: 0 }}>Planes</h1><p style={{ color: B.textSub, fontSize: 13, margin: "4px 0 0" }}>Precios vigentes</p></div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        {PLANES.map(p => (
          <div key={p.code} style={{ flex: "1 1 180px", background: B.bgCard, border: `1px solid ${p.popular ? B.gold : B.border}`, borderRadius: 16, padding: 24, position: "relative" }}>
            {p.popular && <div style={{ position: "absolute", top: 14, right: 14, fontSize: 10, fontWeight: 700, color: B.bgDark, background: B.gold, padding: "2px 9px", borderRadius: 20 }}>POPULAR</div>}
            <div style={{ fontSize: 26, fontWeight: 800, color: B.gold, marginBottom: 3 }}>{p.code}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: B.text, marginBottom: 2 }}>{p.nombre}</div>
            <div style={{ fontSize: 12, color: B.textSub, marginBottom: 16 }}>{p.clases} clase{p.clases > 1 ? "s" : ""}</div>
            <div style={{ borderTop: `1px solid ${B.border}`, paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 12, color: B.textSub }}>Individual</span><span style={{ fontSize: 15, fontWeight: 700, color: B.text }}>{fmtFull(p.individual)}</span></div>
              {p.pareja && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: B.textSub }}>En pareja</span><span style={{ fontSize: 15, fontWeight: 700, color: B.text }}>{fmtFull(p.pareja)}</span></div>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, padding: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: B.text, marginBottom: 14 }}>Tipos de asistencia</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(AT).map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderRadius: 10, background: v.bg, border: `1px solid ${v.border}`, flex: "1 1 130px" }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: v.text }}>{k}</span>
              <span style={{ fontSize: 13, color: v.text, fontWeight: 500 }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────── ADMIN MODE WRAPPER ──────────── */
export default function AdminMode({ students, payments, onUpdate, onAddNotification, notifications, onMarkRead, onClearAll, onLogout }) {
  const [view, setView] = useState("dashboard");
  return (
    <div style={{ display: "flex", height: "100vh", background: B.bg, color: B.text, fontFamily: "'Segoe UI',system-ui,sans-serif", overflow: "hidden" }}>
      <AdminSidebar active={view} onNav={setView} onLogout={onLogout} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {view === "dashboard"  && <AdminDashboard students={students} />}
        {view === "alumnos"    && <AdminAlumnos students={students} onUpdate={onUpdate} />}
        {view === "asistencia" && <AdminAsistencia students={students} onUpdate={onUpdate} />}
        {view === "pagos"      && <AdminPagos students={students} onUpdate={onUpdate} />}
        {view === "horarios"   && <AdminHorarios students={students} onUpdate={onUpdate} onAddNotification={onAddNotification} />}
        {view === "ingresos"   && <AdminIngresos />}
        {view === "planes"     && <AdminPlanes />}
      </main>
    </div>
  );
}
