import { useState, useMemo } from "react";
import {
  B, AT, NOTE_STYLE, DIAS_KEYS, DIAS_LABEL,
  fmtFull, getNotifications, genId, capacidadMax, puedeCancelar,
  INITIAL_SCHEDULE,
} from "./tokens-data.js";
import {
  LogoLR, StudentAvatar, PinChangeModal, AvatarEditor,
} from "./components.jsx";

/* ══════════════════════════════════════════════════════════════
   student.jsx — Modo Alumno completo
   Academia LR
══════════════════════════════════════════════════════════════ */

export default function StudentMode({ student, onLogout, onUpdate, onAddNotification }) {
  const [tab, setTab] = useState("cuenta");
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const notes = getNotifications(student);
  const badgeCount = notes.filter(n => n.type === "danger" || n.type === "warning").length;
  const disp = student.abonadas - student.realizadas;
  const pct = Math.round((student.realizadas / Math.max(student.abonadas, 1)) * 100);
  const presentes = student.asistencia.filter(a => a.m === "P").length;
  const totalC = student.asistencia.filter(a => a.m !== "").length;
  const asistPct = totalC ? Math.round((presentes / totalC) * 100) : 0;

  const TABS = [
    { id: "cuenta",     label: "Mi Cuenta",  icon: "◈" },
    { id: "avisos",     label: "Avisos",     icon: "🔔", badge: badgeCount },
    { id: "asistencia", label: "Asistencia", icon: "◉" },
    { id: "pagos",      label: "Pagos",      icon: "◇" },
    { id: "horarios",   label: "Horarios",   icon: "◻" },
  ];

  const handlePinChange = (nuevoPin) => {
    onUpdate(student.id, s => ({ ...s, pin: nuevoPin }));
  };

  const handleAvatarChange = (fotoData) => {
    onUpdate(student.id, s => ({ ...s, foto: fotoData }));
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg,${B.bgDark} 0%,${B.bg} 100%)`, fontFamily: "'Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ background: `rgba(10,20,40,0.95)`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${B.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LogoLR size={34} />
            <div>
              <div style={{ fontSize: 10, color: B.gold, letterSpacing: 2, textTransform: "uppercase" }}>Academia LR</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: B.text }}>{student.nombre}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: student.estado === "OK" ? B.goldBg : B.dangerBg, color: student.estado === "OK" ? B.gold : "#f87171", border: `1px solid ${student.estado === "OK" ? B.goldBorder : B.dangerBorder}` }}>{student.estado}</span>
            <button onClick={onLogout} style={{ background: "transparent", border: `1px solid ${B.border}`, borderRadius: 8, color: B.textSub, fontSize: 12, padding: "5px 10px", cursor: "pointer" }}>Salir</button>
          </div>
        </div>
        <div style={{ display: "flex", padding: "0 20px", overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              position: "relative", padding: "9px 16px", background: "transparent", border: "none",
              borderBottom: `2px solid ${tab === t.id ? B.gold : "transparent"}`,
              color: tab === t.id ? B.gold : B.textSub, fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap"
            }}>
              {t.icon} {t.label}
              {t.badge > 0 && <span style={{ position: "absolute", top: 5, right: 3, width: 16, height: 16, background: B.danger, borderRadius: "50%", fontSize: 9, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {showPinModal && <PinChangeModal currentPin={student.pin} onSave={handlePinChange} onClose={() => setShowPinModal(false)} />}
      {showAvatarModal && <AvatarEditor student={student} onSave={handleAvatarChange} onClose={() => setShowAvatarModal(false)} />}

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>

        {/* ──────── MI CUENTA ──────── */}
        {tab === "cuenta" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div onClick={() => setShowAvatarModal(true)} style={{ cursor: "pointer", display: "inline-block", position: "relative" }}>
                <StudentAvatar student={student} size={90} fontSize={30} showBadge />
              </div>
              <div style={{ marginTop: 10, fontSize: 13, color: B.textSub }}>
                PIN: <code style={{ color: B.gold, background: B.goldBg, padding: "2px 8px", borderRadius: 4, fontSize: 13 }}>{student.pin}</code>
                <button onClick={() => setShowPinModal(true)} style={{ marginLeft: 8, background: "transparent", border: "none", color: B.gold, cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>Cambiar</button>
              </div>
            </div>

            <div style={{ background: B.goldBg, border: `1px solid ${B.goldBorder}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: B.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Tu plan · {student.plan}</div>
              <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 20 }}>
                {[{ n: student.abonadas, l: "Abonadas", c: B.text }, { n: student.realizadas, l: "Realizadas", c: B.gold }, { n: disp, l: "Disponibles", c: disp <= 2 ? "#fbbf24" : "#60a5fa" }].map(({ n, l, c }) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 40, fontWeight: 700, color: c, lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: 10, color: B.textSub, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 100, height: 7, overflow: "hidden", marginBottom: 5 }}>
                <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: `linear-gradient(90deg,${B.gold},${B.goldLight})`, borderRadius: 100 }} />
              </div>
              <div style={{ fontSize: 11, color: B.textSub, textAlign: "right" }}>{pct}% utilizado</div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {[
                { l: "Asistencia", v: `${asistPct}%`, i: "📊", c: asistPct >= 75 ? B.gold : asistPct >= 50 ? "#fbbf24" : "#f87171" },
                { l: "Presentes", v: presentes, i: "✅", c: B.gold },
                { l: "Plan", v: student.plan.split(" ")[0], i: "📋", c: "#60a5fa" }
              ].map(({ l, v, i, c }) => (
                <div key={l} style={{ flex: 1, background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, padding: "13px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{i}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
                  <div style={{ fontSize: 10, color: B.textSub, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>

            {(student.email || student.tel) && (
              <div style={{ background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, color: B.textSub, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Mis datos</div>
                {student.email && <div style={{ fontSize: 13, color: B.textSub, marginBottom: 4 }}>📧 {student.email}</div>}
                {student.tel && <div style={{ fontSize: 13, color: B.textSub }}>📱 {student.tel}</div>}
              </div>
            )}
          </div>
        )}

        {/* ──────── AVISOS ──────── */}
        {tab === "avisos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {notes.map((n, i) => {
              const s = NOTE_STYLE[n.type];
              return (
                <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, padding: "18px 20px", display: "flex", gap: 14 }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>{n.icon}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: s.text, marginBottom: 6 }}>{n.title}</div>
                    <div style={{ fontSize: 13, color: B.textSub, lineHeight: 1.6 }}>{n.body}</div>
                  </div>
                </div>
              );
            })}
            <div style={{ background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, padding: "12px 16px", fontSize: 11, color: B.textSub, lineHeight: 1.6 }}>
              ℹ️ Los avisos se generan automáticamente según tu estado de cuenta y asistencia.
            </div>
          </div>
        )}

        {/* ──────── ASISTENCIA ──────── */}
        {tab === "asistencia" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {["P", "I", "X", "R"].map(k => {
                const s = AT[k]; const n = student.asistencia.filter(a => a.m === k).length;
                return (
                  <div key={k} style={{ flex: "1 1 80px", padding: "12px 10px", borderRadius: 12, background: s.bg, border: `1px solid ${s.border}`, textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: s.text }}>{n}</div>
                    <div style={{ fontSize: 10, color: s.text, opacity: 0.8, letterSpacing: 1, textTransform: "uppercase", marginTop: 3 }}>{s.label}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {student.asistencia.map(({ f, m }, i) => {
                const s = AT[m];
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: s ? `${s.bg}88` : B.bgCard, border: `1px solid ${s ? s.border + "55" : B.border}`, borderRadius: 12, padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ fontSize: 12, color: B.textSub, minWidth: 50 }}>{f}</div>
                      <div style={{ width: 1, height: 18, background: B.border }} />
                      <div style={{ fontSize: 13, color: s ? s.text : B.textMuted }}>{s ? s.label : "Sin clase registrada"}</div>
                    </div>
                    {s && <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: s.text, fontWeight: 700 }}>{s.icon}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ──────── PAGOS ──────── */}
        {tab === "pagos" && (
          <div>
            {Object.keys(student.pagos).length > 0 ? (
              <>
                <div style={{ background: B.goldBg, border: `1px solid ${B.goldBorder}`, borderRadius: 18, padding: "20px 24px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 10, color: B.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Total abonado 2026</div>
                    <div style={{ fontSize: 30, fontWeight: 700, color: B.text }}>{fmtFull(Object.values(student.pagos).reduce((a, v) => a + v, 0))}</div>
                  </div>
                  <span style={{ fontSize: 36 }}>💰</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.entries(student.pagos).map(([mes, monto]) => (
                    <div key={mes} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, padding: "13px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: B.goldBg, border: `1px solid ${B.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📅</div>
                        <div>
                          <div style={{ fontSize: 14, color: B.text }}>{mes}</div>
                          <div style={{ fontSize: 10, color: B.gold, letterSpacing: 1, textTransform: "uppercase" }}>PAGADO</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: B.gold }}>{fmtFull(monto)}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ background: B.dangerBg, border: `1px solid ${B.dangerBorder}`, borderRadius: 16, padding: 32, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 15, color: "#f87171" }}>Sin pagos registrados</div>
                <div style={{ fontSize: 13, color: B.textSub, marginTop: 6 }}>Consultá con tu profe.</div>
              </div>
            )}
          </div>
        )}

        {/* ──────── HORARIOS (NUEVO) ──────── */}
        {tab === "horarios" && (
          <StudentHorarios
            student={student}
            onUpdate={onUpdate}
            onAddNotification={onAddNotification}
          />
        )}

      </div>
    </div>
  );
}

/* ──────────── SUBSECCIÓN: HORARIOS DEL ALUMNO ──────────── */
function StudentHorarios({ student, onUpdate, onAddNotification }) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState("12/05");
  const [showConfirm, setShowConfirm] = useState(null); // { dia, hora, slot }

  const schedule = INITIAL_SCHEDULE;
  const ags = student.agendamientos || [];
  const disp = student.abonadas - student.realizadas;
  const sinClases = disp <= 0;

  const handleAgendarse = (dia, hora, tipo) => {
    if (sinClases) {
      // Permitir igual pero con advertencia
    }
    setShowConfirm({ dia, hora, tipo });
  };

  const confirmarAgendamiento = () => {
    if (!showConfirm) return;
    const agendamiento = {
      id: genId(),
      fecha: fechaSeleccionada,
      hora: showConfirm.hora,
      tipo: showConfirm.tipo,
      estado: "pendiente",
      agendadoPor: "alumno",
      createdAt: new Date().toISOString(),
    };
    onUpdate(student.id, s => ({
      ...s,
      agendamientos: [...(s.agendamientos || []), agendamiento],
    }));
    onAddNotification({
      id: genId(), para: "profe", alumnoId: student.id, tipo: "agendamiento_pendiente",
      mensaje: `${student.nombre} se agendó para el ${fechaSeleccionada} a las ${showConfirm.hora}`,
      titulo: "Nuevo agendamiento", leido: false, createdAt: new Date().toLocaleString("es"),
      data: { agendamientoId: agendamiento.id, fecha: fechaSeleccionada, hora: showConfirm.hora }
    });
    setShowConfirm(null);
  };

  const cancelarAgendamiento = (ag) => {
    if (!puedeCancelar(ag.fecha, ag.hora)) {
      alert("No se puede cancelar con menos de 6 horas de anticipación.");
      return;
    }
    onUpdate(student.id, s => ({
      ...s,
      agendamientos: (s.agendamientos || []).map(a => a.id === ag.id ? { ...a, estado: "cancelado" } : a),
    }));
    onAddNotification({
      id: genId(), para: "profe", alumnoId: student.id, tipo: "cancelacion",
      mensaje: `${student.nombre} canceló su clase del ${ag.fecha} a las ${ag.hora}`,
      titulo: "Cancelación", leido: false, createdAt: new Date().toLocaleString("es"),
      data: { agendamientoId: ag.id, fecha: ag.fecha, hora: ag.hora }
    });
  };

  return (
    <div>
      {/* Fecha */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: B.textSub, marginBottom: 6 }}>📅 Fecha</div>
        <input type="text" value={fechaSeleccionada} onChange={e => setFechaSeleccionada(e.target.value)} placeholder="DD/MM" style={{ padding: "10px 14px", borderRadius: 10, background: B.bgCard, border: `1px solid ${B.border}`, color: B.text, fontSize: 14, fontFamily: "'Segoe UI',sans-serif", width: "100%" }} />
      </div>

      {/* Mis agendamientos */}
      {ags.filter(a => a.fecha === fechaSeleccionada && a.estado !== "cancelado" && a.estado !== "rechazado").length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: B.textSub, marginBottom: 8 }}>📋 Mis clases este día</div>
          {ags.filter(a => a.fecha === fechaSeleccionada && a.estado !== "cancelado" && a.estado !== "rechazado").map(ag => (
            <div key={ag.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderRadius: 10, marginBottom: 6,
              background: ag.estado === "aprobado" ? "#052e16" : ag.estado === "pendiente" ? B.pendienteBg : B.bgCard,
              border: `1px solid ${ag.estado === "aprobado" ? "#16a34a" : ag.estado === "pendiente" ? B.pendienteBorder : B.border}`
            }}>
              <div>
                <div style={{ fontSize: 13, color: B.text, fontWeight: 600 }}>{ag.hora} · {ag.tipo}</div>
                <div style={{ fontSize: 11, color: ag.estado === "aprobado" ? "#4ade80" : ag.estado === "pendiente" ? B.pendiente : B.textSub }}>
                  {ag.estado === "aprobado" ? "✅ Confirmada" : ag.estado === "pendiente" ? "⏳ Pendiente" : ag.estado}
                </div>
              </div>
              {puedeCancelar(ag.fecha, ag.hora) && (
                <button onClick={() => cancelarAgendamiento(ag)} style={{ padding: "4px 10px", borderRadius: 6, background: B.dangerBg, border: `1px solid ${B.dangerBorder}`, color: "#f87171", fontSize: 11, cursor: "pointer" }}>Cancelar</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Grilla */}
      <div style={{ fontSize: 12, color: B.textSub, marginBottom: 8 }}>🕐 Horarios disponibles</div>
      <div style={{ background: B.bgCard, border: `1px solid ${B.border}`, borderRadius: 12, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: `1px solid ${B.border}` }}>
            <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, color: B.textSub, fontWeight: 600, width: 60 }}>Hora</th>
            <th style={{ padding: "8px", textAlign: "center", fontSize: 11, color: B.textSub, fontWeight: 600 }}>Alumnos</th>
            <th style={{ padding: "8px", textAlign: "center", fontSize: 11, color: B.textSub, fontWeight: 600 }}>Cupo</th>
            <th style={{ padding: "8px", textAlign: "center", fontSize: 11, color: B.textSub, fontWeight: 600 }}>Acción</th>
          </tr></thead>
          <tbody>
            {schedule.map((slot, idx) => {
              const cap = capacidadMax(slot.tipo);
              const alumnosEnSlot = slot["lunes"] || []; // Simplificado: mostramos lunes como ejemplo
              const libres = cap - alumnosEnSlot.length;
              const colorSlot = slot.tipo === "individual" ? { bg: B.individualBg, border: B.individualBorder, text: B.individual } : { bg: B.grupalBg, border: B.grupalBorder, text: B.grupal };
              const yaAnotado = ags.some(a => a.fecha === fechaSeleccionada && a.hora === slot.hora && a.estado !== "cancelado" && a.estado !== "rechazado");

              return (
                <tr key={slot.hora} style={{ borderBottom: idx < schedule.length - 1 ? `1px solid ${B.border}` : "none" }}>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: B.textSub, fontWeight: 500 }}>
                    {slot.hora}
                    <div style={{ fontSize: 9, color: B.textMuted }}>{slot.duracion}′ · {slot.tipo}</div>
                  </td>
                  <td style={{ padding: "6px", textAlign: "center" }}>
                    <div style={{ background: colorSlot.bg, border: `1px solid ${colorSlot.border}`, borderRadius: 8, padding: "8px 6px", minHeight: 50 }}>
                      {alumnosEnSlot.length === 0 ? (
                        <div style={{ fontSize: 10, color: B.textMuted }}>Vacío</div>
                      ) : (
                        alumnosEnSlot.map((nombre, i) => (
                          <div key={i} style={{ fontSize: 10, color: colorSlot.text, fontWeight: 500, marginBottom: 2 }}>{nombre}</div>
                        ))
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "6px", textAlign: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: libres > 0 ? (slot.tipo === "individual" ? B.individual : B.grupal) : B.danger }}>
                      {libres > 0 ? `${libres}/${cap}` : "Lleno"}
                    </span>
                  </td>
                  <td style={{ padding: "6px", textAlign: "center" }}>
                    {yaAnotado ? (
                      <span style={{ fontSize: 10, color: B.gold }}>Anotado</span>
                    ) : libres > 0 ? (
                      <button onClick={() => handleAgendarse("lunes", slot.hora, slot.tipo)} style={{ padding: "5px 12px", borderRadius: 8, background: B.gold, color: B.bgDark, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                        {sinClases ? "⚠️ Anotarme" : "Anotarme"}
                      </button>
                    ) : (
                      <span style={{ fontSize: 10, color: B.textMuted }}>Completo</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sinClases && (
        <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: B.warningBg, border: `1px solid ${B.warningBorder}`, fontSize: 12, color: "#fbbf24" }}>
          ⚠️ No tenés clases disponibles. Podés anotarte pero quedará pendiente de aprobación.
        </div>
      )}

      {/* Modal confirmación */}
      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 320, background: B.bgCard, border: `1px solid ${B.goldBorder}`, borderRadius: 24, padding: "28px 22px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎾</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: B.gold, marginBottom: 4 }}>Confirmar agendamiento</div>
            <div style={{ fontSize: 13, color: B.textSub, marginBottom: 6 }}>
              {fechaSeleccionada} · {showConfirm.hora} · {showConfirm.tipo}
            </div>
            {sinClases && (
              <div style={{ fontSize: 12, color: "#fbbf24", marginBottom: 12, background: B.warningBg, padding: "8px", borderRadius: 8 }}>
                ⚠️ No tenés clases disponibles. El profe deberá aprobar igual.
              </div>
            )}
            <div style={{ fontSize: 11, color: B.textSub, marginBottom: 18 }}>
              Tu agendamiento quedará <strong style={{ color: B.pendiente }}>pendiente</strong> hasta que el profe lo apruebe.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowConfirm(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${B.border}`, background: "transparent", color: B.textSub, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <button onClick={confirmarAgendamiento} style={{ flex: 1, padding: "10px", borderRadius: 10, background: B.gold, color: B.bgDark, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
