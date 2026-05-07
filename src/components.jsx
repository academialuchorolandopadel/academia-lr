import { useState, useRef } from "react";
import { B, AT, NOTE_STYLE } from "./tokens-data.js";
import { avatarColor } from "./tokens-data.js";

/* ══════════════════════════════════════════════════════════════
   components.jsx — Logo, Avatar, PinPad, Modales, Campanita
   Academia LR
══════════════════════════════════════════════════════════════ */

/* ──────────── LOGO ──────────── */
export function LogoLR({ size = 40, color = B.gold }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="88" height="88" rx="4" stroke={color} strokeWidth="5" fill="none"/>
      <line x1="6" y1="72" x2="94" y2="72" stroke={color} strokeWidth="3.5"/>
      <line x1="50" y1="6" x2="50" y2="16" stroke={color} strokeWidth="3.5"/>
      <line x1="50" y1="72" x2="50" y2="94" stroke={color} strokeWidth="3.5"/>
      <path d="M14 18 L14 66 L44 66" stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M54 18 L54 66" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none"/>
      <path d="M54 18 L74 18 Q86 18 86 32 Q86 46 74 46 L54 46" stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M68 46 L86 66" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/* ──────────── AVATAR ──────────── */
export function StudentAvatar({ student, size = 30, fontSize = 10, showBadge = false, onClick = null }) {
  const s = size;
  const fs = fontSize;
  return (
    <div onClick={onClick} style={{ position: "relative", cursor: onClick ? "pointer" : "default", flexShrink: 0 }}>
      {student.foto ? (
        <img src={student.foto} alt={student.nombre} style={{ width: s, height: s, borderRadius: "50%", objectFit: "cover", border: `1px solid ${B.border}` }} />
      ) : (
        <div style={{ width: s, height: s, borderRadius: "50%", background: avatarColor(student.nombre), display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${B.border}`, fontSize: fs, fontWeight: 700, color: B.gold }}>
          {student.iniciales}
        </div>
      )}
      {showBadge && (
        <div style={{ position: "absolute", bottom: -1, right: -1, width: s * 0.35, height: s * 0.35, background: B.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: s * 0.22 }}>
          📷
        </div>
      )}
    </div>
  );
}

/* ──────────── PIN PAD (login) ──────────── */
export function PinPad({ onSubmit, error, setError }) {
  const [pin, setPin] = useState("");
  const KEYS = [["1","2","3"],["4","5","6"],["7","8","9"],["","0","⌫"]];

  const press = (val) => {
    if (val === "⌫") { setPin(p => p.slice(0, -1)); setError(""); return; }
    if (pin.length >= 4) return;
    const np = pin + val; setPin(np); setError("");
    if (np.length === 4) setTimeout(() => { if (!onSubmit(np)) { setError("PIN incorrecto. Intentá de nuevo."); setPin(""); } }, 200);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: `linear-gradient(160deg, ${B.bgDark} 0%, ${B.bg} 60%, #0c1520 100%)`, padding: 24, fontFamily: "'Segoe UI',sans-serif" }}>
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-15%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${B.goldBg},transparent 70%)` }}/>
        <div style={{ position: "absolute", bottom: "-15%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle,rgba(30,58,95,0.4),transparent 70%)` }}/>
      </div>
      <div style={{ position: "relative", width: "100%", maxWidth: 340, background: "rgba(10,20,40,0.85)", backdropFilter: "blur(24px)", border: `1px solid ${B.goldBorder}`, borderRadius: 24, padding: "40px 28px 36px", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <LogoLR size={64}/>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: B.gold, letterSpacing: 3, textTransform: "uppercase" }}>Academia LR</div>
          <div style={{ fontSize: 11, color: B.textSub, marginTop: 4, letterSpacing: 2, textTransform: "uppercase" }}>Ingresá tu PIN</div>
        </div>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 50, height: 50, borderRadius: 14, border: `2px solid ${pin.length > i ? B.gold : B.goldBorder}`, background: pin.length > i ? B.goldBg : "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                {pin.length > i && <div style={{ width: 14, height: 14, borderRadius: "50%", background: B.gold }}/>}
              </div>
            ))}
          </div>
          {error && <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "#f87171" }}>{error}</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {KEYS.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {row.map((k, ki) => k === "" ? <div key={ki} style={{ flex: 1, maxWidth: 86 }}/> :
                <button key={ki} onClick={() => press(k)} style={{ flex: 1, maxWidth: 86, height: 56, borderRadius: 14, background: k === "⌫" ? "rgba(255,255,255,0.04)" : `rgba(30,58,95,0.4)`, border: `1px solid ${B.border}`, color: B.text, fontSize: k === "⌫" ? 20 : 22, cursor: "pointer", fontFamily: "monospace", transition: "all 0.15s" }}>
                  {k}
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: B.textMuted }}>Profe · Alumnos · Un solo acceso</div>
      </div>
    </div>
  );
}

/* ──────────── PIN CHANGE MODAL ──────────── */
export function PinChangeModal({ currentPin, onSave, onClose }) {
  const [step, setStep] = useState("current");
  const [pinActual, setPinActual] = useState("");
  const [pinNuevo, setPinNuevo] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const KEYS = [["1","2","3"],["4","5","6"],["7","8","9"],["","0","⌫"]];

  const press = (val, setter, current) => {
    if (val === "⌫") { setter(p => p.slice(0, -1)); setError(""); return; }
    if (current.length >= 4) return;
    setter(current + val);
    setError("");
  };

  const renderKeypad = (value, setter, onComplete) => (
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 42, height: 42, borderRadius: 12, border: `2px solid ${value.length > i ? B.gold : B.goldBorder}`, background: value.length > i ? B.goldBg : "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {value.length > i && <div style={{ width: 11, height: 11, borderRadius: "50%", background: B.gold }}/>}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {KEYS.map((row, ri) => (
          <div key={ri} style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {row.map((k, ki) => k === "" ? <div key={ki} style={{ flex: 1, maxWidth: 70 }}/> :
              <button key={ki} onClick={() => press(k, setter, value)} style={{ flex: 1, maxWidth: 70, height: 48, borderRadius: 12, background: k === "⌫" ? "rgba(255,255,255,0.04)" : `rgba(30,58,95,0.4)`, border: `1px solid ${B.border}`, color: B.text, fontSize: k === "⌫" ? 18 : 20, cursor: "pointer", fontFamily: "monospace" }}>{k}</button>
            )}
          </div>
        ))}
      </div>
      {value.length === 4 && (
        <button onClick={onComplete} style={{ width: "100%", marginTop: 16, padding: "10px", borderRadius: 10, background: B.gold, color: B.bgDark, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" }}>Continuar</button>
      )}
    </div>
  );

  const handleStep1 = () => {
    if (pinActual !== currentPin) { setError("PIN actual incorrecto"); setPinActual(""); return; }
    setError(""); setStep("new");
  };
  const handleStep2 = () => {
    if (pinNuevo === currentPin) { setError("El nuevo PIN no puede ser igual al actual"); setPinNuevo(""); return; }
    setError(""); setStep("confirm");
  };
  const handleStep3 = () => {
    if (pinConfirm !== pinNuevo) { setError("Los PIN no coinciden."); setPinConfirm(""); return; }
    onSave(pinNuevo); setSuccess(true); setTimeout(onClose, 1500);
  };

  if (success) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
        <div style={{ background: B.bgCard, border: `1px solid ${B.goldBorder}`, borderRadius: 20, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: B.gold }}>¡PIN actualizado!</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 320, background: B.bgCard, border: `1px solid ${B.goldBorder}`, borderRadius: 24, padding: "28px 22px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: B.gold, marginBottom: 4 }}>
            {step === "current" ? "Ingresá tu PIN actual" : step === "new" ? "Elegí tu nuevo PIN" : "Confirmá tu nuevo PIN"}
          </div>
          <div style={{ fontSize: 11, color: B.textSub }}>
            {step === "current" ? "Por seguridad, verificá tu identidad" : step === "new" ? "Creá un PIN de 4 dígitos" : "Repetí el PIN para confirmar"}
          </div>
        </div>
        {error && <div style={{ textAlign: "center", marginBottom: 12, fontSize: 12, color: "#f87171" }}>{error}</div>}
        {step === "current" && renderKeypad(pinActual, setPinActual, handleStep1)}
        {step === "new" && renderKeypad(pinNuevo, setPinNuevo, handleStep2)}
        {step === "confirm" && renderKeypad(pinConfirm, setPinConfirm, handleStep3)}
        <button onClick={onClose} style={{ width: "100%", marginTop: 12, padding: "8px", borderRadius: 8, background: "transparent", border: `1px solid ${B.border}`, color: B.textSub, fontSize: 12, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" }}>Cancelar</button>
      </div>
    </div>
  );
}

/* ──────────── AVATAR EDITOR ──────────── */
export function AvatarEditor({ student, onSave, onClose }) {
  const inputRef = useRef(null);
  const MAX_SIZE = 1.5 * 1024 * 1024;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_SIZE) { alert("La imagen debe pesar menos de 1.5 MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { onSave(ev.target.result); onClose(); };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 300, background: B.bgCard, border: `1px solid ${B.goldBorder}`, borderRadius: 24, padding: "28px 22px 24px", textAlign: "center" }}>
        <div style={{ marginBottom: 20 }}>
          <StudentAvatar student={student} size={100} fontSize={32} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: B.text, marginBottom: 4 }}>Foto de perfil</div>
        <div style={{ fontSize: 11, color: B.textSub, marginBottom: 18 }}>Máx. 1.5 MB · JPG, PNG</div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        <button onClick={() => inputRef.current?.click()} style={{ width: "100%", padding: "10px", borderRadius: 10, marginBottom: 8, background: B.gold, color: B.bgDark, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" }}>📷 Subir foto</button>
        {student.foto && (
          <button onClick={() => { onSave(null); onClose(); }} style={{ width: "100%", padding: "10px", borderRadius: 10, marginBottom: 8, background: B.dangerBg, color: "#f87171", border: `1px solid ${B.dangerBorder}`, fontSize: 13, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" }}>🗑️ Quitar foto</button>
        )}
        <button onClick={onClose} style={{ width: "100%", padding: "8px", borderRadius: 8, background: "transparent", border: `1px solid ${B.border}`, color: B.textSub, fontSize: 12, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" }}>Cancelar</button>
      </div>
    </div>
  );
}

/* ──────────── CAMPANITA DE NOTIFICACIONES ──────────── */
export function NotificationBell({ notifications, onMarkRead, onClearAll }) {
  const [open, setOpen] = useState(false);
  const noLeidas = notifications.filter(n => !n.leido).length;

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{ background: "transparent", border: `1px solid ${B.border}`, borderRadius: 10, color: B.textSub, fontSize: 18, padding: "6px 10px", cursor: "pointer", position: "relative" }}>
        🔔
        {noLeidas > 0 && (
          <span style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, background: B.danger, borderRadius: "50%", fontSize: 10, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{noLeidas}</span>
        )}
      </button>
      {open && (
        <div style={{ position: "absolute", top: 42, right: 0, width: 320, maxHeight: 400, overflowY: "auto", background: B.bgCard, border: `1px solid ${B.goldBorder}`, borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.7)", zIndex: 200 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${B.border}` }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: B.text }}>Notificaciones</span>
            {notifications.length > 0 && (
              <button onClick={onClearAll} style={{ background: "transparent", border: "none", color: B.textSub, fontSize: 11, cursor: "pointer" }}>Limpiar todo</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: B.textSub, fontSize: 13 }}>No hay notificaciones</div>
          ) : (
            notifications.slice().reverse().map(n => {
              const st = NOTE_STYLE[n.tipo === "agendamiento_pendiente" || n.tipo === "paquete_agotado" ? "warning" : n.tipo === "aprobado" || n.tipo === "horario_publicado" ? "ok" : n.tipo === "rechazado" || n.tipo === "cancelacion" ? "danger" : "info"];
              return (
                <div key={n.id} onClick={() => onMarkRead(n.id)} style={{ padding: "12px 16px", borderBottom: `1px solid ${B.border}`, cursor: "pointer", background: n.leido ? "transparent" : B.goldBg, transition: "background 0.2s" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: st?.text || B.text, marginBottom: 3 }}>{n.titulo || n.mensaje}</div>
                  <div style={{ fontSize: 11, color: B.textSub }}>{n.createdAt}</div>
                </div>
              );
            })
          )}
        </div>
      )}
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
    </div>
  );
}
