// src/components/AdminCancha.jsx
// Pago de cancha al club, POR ALUMNO según el tipo de turno de la agenda
// (individual / dual o grupal). Se cobran P, R e I; la X (reprogramada con aviso) no.
// Genera el reporte semanal en PDF para mandarle al club.
import { useState, useMemo, useEffect } from "react"
import { B, avatarColor, fmtFull, HEAD_UID } from "../constants"
import {
  calcularCancha, diasDeSemana, diasDelMes, ddmmyyyy, toMin,
  TARIFAS_DEFAULT, ETIQUETA_TIPO,
  generarPdfCancha, entregarPdf, puedeCompartirArchivos,
} from "../utils/reporteCancha"

const LS_RES = "lr_cancha_resoluciones"   // decisiones "a revisar" (se guardan en este celu)
const leerRes = () => { try { return JSON.parse(localStorage.getItem(LS_RES) || "{}") || {} } catch (e) { return {} } }
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]

export function AdminCancha({ students = [], schedule, profeUid, profeNombre = "", rate, onSaveRate }) {
  const [wk, setWk] = useState(0)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({ individual: "", grupal: "", club: "" })
  const [resoluciones, setResoluciones] = useState(leerRes)
  const [generando, setGenerando] = useState(false)
  const [msg, setMsg] = useState("")

  // Tarifas guardadas (si la app todavía tiene el formato viejo de un solo valor, se usan las de Fanáticos)
  const cfgNueva = !!rate && typeof rate === "object"
  const tarifas = { ...TARIFAS_DEFAULT, ...(cfgNueva ? rate : {}) }
  const sched = schedule || { horas: [], asign: {}, tipos: {} }
  const horasAgenda = [...(sched.horas || [])].sort((a, b) => toMin(a) - toMin(b))

  // Un reporte por profe: solo sus alumnos y su agenda
  const alumnos = useMemo(
    () => profeUid ? students.filter(s => (s.dueno || HEAD_UID) === profeUid) : students,
    [students, profeUid])

  const dias = useMemo(() => diasDeSemana(wk), [wk])
  const res = calcularCancha({ students: alumnos, schedule: sched, dias, tarifas, resoluciones })
  const hoy = new Date()
  const mes = calcularCancha({ students: alumnos, schedule: sched, dias: diasDelMes(hoy), tarifas, resoluciones })

  useEffect(() => { try { localStorage.setItem(LS_RES, JSON.stringify(resoluciones)) } catch (e) {} }, [resoluciones])
  const resolver = (clave, valor) => setResoluciones(prev => {
    const next = { ...prev }
    if (valor) next[clave] = valor; else delete next[clave]
    return next
  })

  const fechasSemana = new Set(dias.map(d => d.f))
  const deshacerExcluidos = () => setResoluciones(prev => {
    const next = { ...prev }
    Object.keys(next).forEach(k => { if (next[k] && next[k].excluir && fechasSemana.has(k.split("|")[1])) delete next[k] })
    return next
  })

  const abrirEdicion = () => {
    setForm({ individual: String(tarifas.individual), grupal: String(tarifas.grupal), club: tarifas.club || "" })
    setEditando(true)
  }
  const guardarTarifas = () => {
    onSaveRate({
      individual: Number(form.individual) || 0,
      grupal: Number(form.grupal) || 0,
      club: form.club.trim() || TARIFAS_DEFAULT.club,
    })
    setEditando(false)
  }

  const exportar = async (modo) => {
    if (res.pendientes.length && !window.confirm(
      `Hay ${res.pendientes.length} asistencia${res.pendientes.length === 1 ? "" : "s"} sin horario identificado que NO van a entrar en el total. ¿Exportar igual?`)) return
    setGenerando(true); setMsg("")
    try {
      const blob = await generarPdfCancha({
        club: tarifas.club, profe: profeNombre, desde: dias[0].date, hasta: dias[5].date,
        res, tarifas, generado: new Date(),
      }, `${import.meta.env.BASE_URL}lr-mark.png`)
      const d = dias[0].date
      const nombre = `Cancha_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}_${(profeNombre || "profe").split(" ")[0]}.pdf`
      const r = await entregarPdf(blob, nombre, modo)
      if (r === "ok") setMsg(modo === "compartir" ? "" : "✓ PDF descargado")
    } catch (e) {
      console.error("PDF cancha:", e)
      setMsg("No se pudo generar el PDF. Probá de nuevo.")
    }
    setGenerando(false)
  }

  const card = { background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12 }
  const btn = (activo) => ({ padding: "7px 12px", borderRadius: 8, border: `1px solid ${activo ? B.gold : B.border}`, background: activo ? B.goldBg : "transparent", color: activo ? B.gold : B.textSub, fontSize: 12, fontWeight: activo ? 700 : 500, cursor: "pointer" })
  const inp = { width: "100%", padding: "8px 10px", background: B.bg, border: `1px solid ${B.border}`, borderRadius: 8, color: B.text, fontSize: 14, outline: "none", marginTop: 4 }
  const lbl = { fontSize: 10, color: B.textSub, textTransform: "uppercase", letterSpacing: 1 }

  // Líneas agrupadas por día para la lista
  const porDia = {}
  res.lineas.forEach(l => { (porDia[l.dia.f] = porDia[l.dia.f] || { dia: l.dia, lineas: [] }).lineas.push(l) })

  return (
    <div style={{ padding: 24, maxWidth: 640 }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: B.text, margin: 0 }}>Cancha a pagar al club</h1>
        <p style={{ color: B.textSub, fontSize: 13, margin: "4px 0 0", lineHeight: 1.45 }}>
          Por alumno, según el tipo de turno de la agenda{profeNombre ? <> · <b style={{ color: B.text }}>{profeNombre}</b></> : null}.
          Se cobran presentes, recuperadas y ausencias sin aviso; las reprogramadas con aviso no.
        </p>
      </div>

      {!schedule && (
        <div style={{ ...card, borderColor: B.dangerBorder, background: B.dangerBg, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#f87171" }}>
          Falta subir la versión nueva de AdminMode.jsx para que esta pantalla lea la agenda.
        </div>
      )}

      {/* Tarifas */}
      <div style={{ ...card, padding: "12px 16px", marginBottom: 16 }}>
        {!editando ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div>
              <div style={lbl}>Individual</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: B.gold }}>{fmtFull(tarifas.individual)}</div>
            </div>
            <div>
              <div style={lbl}>Dual / grupal</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: B.gold }}>{fmtFull(tarifas.grupal)}</div>
            </div>
            <div>
              <div style={lbl}>Club</div>
              <div style={{ fontSize: 14, color: B.text }}>{tarifas.club}</div>
            </div>
            <button onClick={abrirEdicion} disabled={!cfgNueva}
              style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 8, border: `1px solid ${B.border}`, background: "transparent", color: B.textSub, fontSize: 12, cursor: cfgNueva ? "pointer" : "default", opacity: cfgNueva ? 1 : 0.5 }}>
              Editar
            </button>
            {!cfgNueva && <div style={{ width: "100%", fontSize: 11, color: B.textMuted }}>Para poder editar las tarifas falta subir useAcademia.js.</div>}
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <label style={{ flex: "1 1 120px" }}><span style={lbl}>Individual (₲ por alumno)</span>
                <input type="number" inputMode="numeric" value={form.individual} onChange={e => setForm(f => ({ ...f, individual: e.target.value }))} style={inp} /></label>
              <label style={{ flex: "1 1 120px" }}><span style={lbl}>Dual / grupal (₲ por alumno)</span>
                <input type="number" inputMode="numeric" value={form.grupal} onChange={e => setForm(f => ({ ...f, grupal: e.target.value }))} style={inp} /></label>
              <label style={{ flex: "1 1 160px" }}><span style={lbl}>Club</span>
                <input value={form.club} onChange={e => setForm(f => ({ ...f, club: e.target.value }))} style={inp} /></label>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={guardarTarifas} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: B.gold, color: B.bgDark, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Guardar</button>
              <button onClick={() => setEditando(false)} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${B.border}`, background: "transparent", color: B.textSub, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {/* Semana */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={() => setWk(wk - 1)} style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${B.border}`, background: B.bgCard, color: B.text, fontSize: 13, cursor: "pointer" }}>◀ Semana</button>
        <span style={{ fontSize: 12, color: B.textSub }}>
          {dias[0].f} al {dias[5].f}
          {wk !== 0 && <button onClick={() => setWk(0)} style={{ marginLeft: 8, padding: "4px 9px", borderRadius: 7, border: `1px solid ${B.goldBorder}`, background: B.goldBg, color: B.gold, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Hoy</button>}
        </span>
        <button onClick={() => setWk(wk + 1)} style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${B.border}`, background: B.bgCard, color: B.text, fontSize: 13, cursor: "pointer" }}>Semana ▶</button>
      </div>

      {/* Resumen de la semana */}
      <div style={{ background: B.goldBg, border: `1px solid ${B.goldBorder}`, borderRadius: 16, padding: "16px 20px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: B.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>A pagar esta semana</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: B.text, lineHeight: 1.1 }}>{fmtFull(res.total)}</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10, fontSize: 12, color: B.textSub }}>
          <span><b style={{ color: B.text }}>{res.horas}</b> hora{res.horas === 1 ? "" : "s"} de cancha</span>
          <span><b style={{ color: B.text }}>{res.alumnos}</b> alumno{res.alumnos === 1 ? "" : "s"} (clases)</span>
          <span>Individual: <b style={{ color: B.text }}>{res.individual.n}</b> · Dual/grupal: <b style={{ color: B.text }}>{res.grupal.n}</b></span>
        </div>
        {res.excluidos > 0 && (
          <div style={{ fontSize: 11, color: B.textMuted, marginTop: 8 }}>
            {res.excluidos} marca{res.excluidos === 1 ? "" : "s"} marcada{res.excluidos === 1 ? "" : "s"} como "no cobrar" ·{" "}
            <button onClick={deshacerExcluidos} style={{ background: "transparent", border: "none", color: B.gold, fontSize: 11, textDecoration: "underline", cursor: "pointer", padding: 0 }}>deshacer</button>
          </div>
        )}
      </div>

      {/* A revisar */}
      {res.pendientes.length > 0 && (
        <div style={{ ...card, borderColor: "rgba(251,191,36,0.55)", background: B.warningBg, padding: "12px 14px", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", marginBottom: 2 }}>⚠ {res.pendientes.length} a revisar</div>
          <div style={{ fontSize: 12, color: B.textSub, marginBottom: 10, lineHeight: 1.4 }}>La agenda no alcanza para saber en qué horario fueron. Elegí el horario y se suma al total.</div>
          {res.pendientes.map(p => {
            const r = resoluciones[p.clave] || {}
            const hora = r.hora || p.sugerida || ""
            const tipoAgenda = hora ? (sched.tipos || {})[`${p.dia.diaFull}|${hora}`] : null
            return (
              <div key={p.clave} style={{ background: B.bg, border: `1px solid ${B.border}`, borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 24, height: 24, background: avatarColor(p.alumno.nombre), borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#fff" }}>{p.alumno.iniciales}</div>
                  <span style={{ fontSize: 13, color: B.text, fontWeight: 600, flex: 1, minWidth: 0 }}>{p.alumno.nombre}</span>
                  <span style={{ fontSize: 12, color: B.textSub }}>{p.dia.dia} {p.dia.f} · {p.marca}</span>
                </div>
                <div style={{ fontSize: 11, color: B.textMuted, marginBottom: 8 }}>{p.motivo}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <select value={hora} onChange={e => resolver(p.clave, e.target.value ? { hora: e.target.value, tipo: r.tipo } : null)}
                    style={{ padding: "7px 9px", background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 8, color: B.text, fontSize: 13, outline: "none" }}>
                    <option value="">Elegí el horario…</option>
                    {horasAgenda.map(h => {
                      const t = (sched.tipos || {})[`${p.dia.diaFull}|${h}`]
                      return <option key={h} value={h}>{h}{t ? ` · ${ETIQUETA_TIPO[t]}` : " · sin tipo"}</option>
                    })}
                  </select>
                  {hora && !tipoAgenda && ["individual", "grupal"].map(t => (
                    <button key={t} onClick={() => resolver(p.clave, { hora, tipo: t })} style={btn(r.tipo === t)}>
                      {t === "individual" ? "Individual" : "Dual / grupal"}
                    </button>
                  ))}
                  <button onClick={() => resolver(p.clave, { excluir: true })} title="Por ejemplo, una marca cargada por error"
                    style={{ ...btn(false), marginLeft: "auto", fontSize: 11 }}>No cobrar</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Exportar */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        {puedeCompartirArchivos() && (
          <button onClick={() => exportar("compartir")} disabled={generando}
            style={{ flex: "1 1 160px", padding: "11px", borderRadius: 10, border: "none", background: B.gold, color: B.bgDark, fontSize: 14, fontWeight: 700, cursor: generando ? "default" : "pointer", opacity: generando ? 0.6 : 1 }}>
            {generando ? "Generando…" : "📤 Compartir PDF"}
          </button>
        )}
        <button onClick={() => exportar("descargar")} disabled={generando}
          style={{ flex: "1 1 160px", padding: "11px", borderRadius: 10, border: `1px solid ${B.goldBorder}`, background: "transparent", color: B.gold, fontSize: 14, fontWeight: 700, cursor: generando ? "default" : "pointer", opacity: generando ? 0.6 : 1 }}>
          {generando ? "Generando…" : "⬇ Descargar PDF"}
        </button>
      </div>
      <div style={{ fontSize: 11, color: msg.startsWith("✓") ? "#4ade80" : msg ? "#f87171" : B.textMuted, marginBottom: 16, minHeight: 14 }}>
        {msg || `Semana del ${ddmmyyyy(dias[0].date)} al ${ddmmyyyy(dias[5].date)}`}
      </div>

      {/* Detalle por día y horario */}
      {res.lineas.length === 0 && <div style={{ fontSize: 13, color: B.textMuted, marginBottom: 16 }}>Sin clases cobrables esta semana.</div>}
      {Object.values(porDia).map(({ dia, lineas }) => (
        <div key={dia.f} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: B.textSub, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{dia.diaFull} {dia.f}</div>
          {lineas.map(l => (
            <div key={l.hora} style={{ ...card, padding: "10px 13px", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: B.text, minWidth: 46 }}>{l.hora}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: B.goldBg, border: `1px solid ${B.goldBorder}`, color: B.gold }}>{ETIQUETA_TIPO[l.tipo] || l.tipo}</span>
                <span style={{ fontSize: 12, color: B.textSub, flex: 1, textAlign: "right" }}>{l.n} × {fmtFull(l.tarifa)}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: B.gold, minWidth: 90, textAlign: "right" }}>{fmtFull(l.subtotal)}</span>
              </div>
              <div style={{ fontSize: 11, color: B.textMuted, marginTop: 5, lineHeight: 1.6 }}>
                {l.alumnos.map((a, i) => (
                  <span key={a.id}>
                    {i > 0 && " · "}
                    {a.manual ? (
                      <button onClick={() => { if (window.confirm(`¿Volver a revisar el horario de ${a.nombre} del ${dia.f}?`)) resolver(a.clave, null) }}
                        title="Horario elegido a mano: tocá para cambiarlo"
                        style={{ background: "transparent", border: "none", padding: 0, color: B.gold, fontSize: 11, cursor: "pointer", textDecoration: "underline dotted" }}>
                        {a.nombre}{a.marca !== "P" ? ` (${a.marca})` : ""} ✎
                      </button>
                    ) : <>{a.nombre}{a.marca !== "P" ? ` (${a.marca})` : ""}</>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Mes en curso */}
      <div style={{ ...card, padding: "12px 16px", marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={lbl}>Mes en curso · {MESES[hoy.getMonth()]}</div>
          <div style={{ fontSize: 12, color: B.textSub, marginTop: 3 }}>
            {mes.horas} hora{mes.horas === 1 ? "" : "s"} · {mes.alumnos} alumno{mes.alumnos === 1 ? "" : "s"}
            {mes.pendientes.length > 0 && <span style={{ color: "#fbbf24" }}> · {mes.pendientes.length} a revisar sin sumar</span>}
          </div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: B.text }}>{fmtFull(mes.total)}</div>
      </div>
    </div>
  )
}
