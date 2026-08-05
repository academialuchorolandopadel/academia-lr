// src/App.jsx
import { useState, useEffect } from "react"
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously } from "firebase/auth"
import { coachDe, HEAD_UID } from "./constants"
import { auth } from "./firebase"
import { useAcademia } from "./hooks/useAcademia"
import { B, LogoLR, PROFE_PIN, PROFE_EMAIL } from "./constants"
import { PinPad }      from "./components/PinPad"
import { AdminMode }   from "./components/AdminMode"
import { StudentMode } from "./components/StudentMode"

// ── Seed inicial (usar UNA sola vez, luego volver a comentar) ────────────────
// import { seedFirestore } from "./seed"

// ─── Pantallas de estado ──────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:B.bg,gap:16,fontFamily:"'Segoe UI',sans-serif"}}>
      <LogoLR size={52}/>
      <div style={{fontSize:13,color:B.textSub,letterSpacing:2,textTransform:"uppercase"}}>Cargando...</div>
    </div>
  )
}

function ErrorScreen({ error }) {
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:B.bg,fontFamily:"'Segoe UI',sans-serif",padding:24}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
        <div style={{fontSize:16,color:"#f87171",marginBottom:8}}>Error de conexión</div>
        <div style={{fontSize:12,color:B.textSub}}>{error}</div>
      </div>
    </div>
  )
}

// ─── Login del profe (contraseña Firebase Auth) ───────────────────────────────
function ProfeAuth({ onSuccess, onCancel }) {
  const [email, setEmail] = useState("")
  const [pw, setPw]     = useState("")
  const [err, setErr]   = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!email.trim() || !pw || busy) return
    setBusy(true); setErr("")
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pw)
      onSuccess()
    } catch (e) {
      setErr("Email o contraseña incorrectos.")
      setBusy(false)
    }
  }

  const inputStyle = (bad) => ({width:"100%",padding:"12px 14px",background:"rgba(30,58,95,0.4)",border:`1px solid ${bad?B.dangerBorder:B.border}`,borderRadius:12,color:B.text,fontSize:15,outline:"none",marginBottom:10})

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(160deg,${B.bgDark} 0%,${B.bg} 60%,#0c1520 100%)`,padding:24,fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{width:"100%",maxWidth:340,background:"rgba(10,20,40,0.85)",backdropFilter:"blur(24px)",border:`1px solid ${B.goldBorder}`,borderRadius:24,padding:"36px 28px",boxShadow:"0 40px 80px rgba(0,0,0,0.6)"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><LogoLR size={56}/></div>
        <div style={{textAlign:"center",fontSize:18,fontWeight:700,color:B.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Modo Profe</div>
        <div style={{textAlign:"center",fontSize:11,color:B.textSub,marginBottom:24,letterSpacing:1}}>Ingresá tu email y contraseña</div>

        <input
          type="email"
          value={email}
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          onChange={e => { setEmail(e.target.value); setErr("") }}
          onKeyDown={e => { if (e.key === "Enter") submit() }}
          placeholder="Email"
          style={inputStyle(err)}
        />
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setErr("") }}
          onKeyDown={e => { if (e.key === "Enter") submit() }}
          placeholder="Contraseña"
          style={inputStyle(err)}
        />
        {err && <div style={{fontSize:12,color:"#f87171",marginBottom:6,textAlign:"center"}}>{err}</div>}

        <button onClick={submit} disabled={busy}
          style={{width:"100%",marginTop:6,padding:"12px",borderRadius:12,border:"none",background:B.gold,color:B.bgDark,fontSize:14,fontWeight:700,cursor:busy?"default":"pointer",opacity:busy?0.6:1}}>
          {busy ? "Verificando..." : "Entrar"}
        </button>
        <button onClick={onCancel}
          style={{width:"100%",marginTop:10,padding:"10px",borderRadius:12,border:`1px solid ${B.border}`,background:"transparent",color:B.textSub,fontSize:13,cursor:"pointer"}}>
          Volver
        </button>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [authChecked, setAuthChecked]           = useState(false)
  const { students, schedules, planes, consejos, temas, canchaRate, loading, error, updateStudent, addStudent, deleteStudent, addPayment, updatePayment, removePayment, saveSchedule, savePlanes, saveConsejos, saveTemas, saveCanchaRate, setHabilidad, loadNotas, addNota, deleteNota } = useAcademia(authChecked)
  const [mode, setMode]                         = useState(null) // null | profe | admin | student
  const [currentStudentId, setCurrentStudentId] = useState(null)
  const [loginError, setLoginError]             = useState("")
  const [coach, setCoach]                       = useState(null)

  // Sesión: el profe entra con email + contraseña. Los alumnos usan un login
  // anónimo (solo para obtener un token y poder LEER; no pueden escribir datos).
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try { await signInAnonymously(auth) }
        catch (e) { console.error("Anon auth error:", e); setAuthChecked(true) }
        return
      }
      if (!user.isAnonymous) { setCoach(coachDe(user.uid)); setMode("admin") }   // profe
      setAuthChecked(true)
    })
    return unsub
  }, [])

  if (loading || !authChecked) return <LoadingScreen/>
  if (error)   return <ErrorScreen error={error}/>

  const handleLogin = (pin) => {
    if (pin === PROFE_PIN) {
      setMode("profe")          // pasa al gate de contraseña
      return true
    }
    const found = students.find(s => s.pin === pin)
    if (found) {
      setCurrentStudentId(found.id)
      setMode("student")
      return true
    }
    return false
  }

  const handleLogout = async () => {
    try { await signOut(auth) } catch (_) {}
    setMode(null)
    setCurrentStudentId(null)
    setLoginError("")
  }

  const currentStudent = students.find(s => s.id === currentStudentId) || null

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${B.bg}; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${B.bgDark}; }
        ::-webkit-scrollbar-thumb { background: ${B.border}; border-radius: 3px; }
        input::placeholder { color: ${B.textMuted}; }
        button:focus { outline: none; }
      `}</style>

      {/* Botón de seed — descomentar solo para cargar datos, luego borrar */}
      {/* <button onClick={seedFirestore} style={{position:"fixed",bottom:12,right:12,zIndex:9999,padding:"8px 14px",background:"#16a34a",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:12}}>🌱 Seed DB</button> */}

      {mode === null      && <PinPad     onSubmit={handleLogin} error={loginError} setError={setLoginError}/>}
      {mode === "profe"   && <ProfeAuth  onSuccess={() => setMode("admin")} onCancel={() => setMode(null)}/>}
      {mode === "admin"   && <AdminMode  coach={coach} students={students} schedules={schedules} planes={planes} consejos={consejos} temas={temas} onUpdate={updateStudent} onAddStudent={addStudent} onDeleteStudent={deleteStudent} onSaveSchedule={saveSchedule} onSavePlanes={savePlanes} onSaveConsejos={saveConsejos} onSaveTemas={saveTemas} onSetHabilidad={setHabilidad} canchaRate={canchaRate} onSaveCanchaRate={saveCanchaRate} onAddPayment={addPayment} onUpdatePayment={updatePayment} onRemovePayment={removePayment} onLogout={handleLogout}/>}
      {mode === "student" && currentStudent && <StudentMode student={currentStudent} onLogout={handleLogout} consejos={consejos} schedule={(schedules && schedules[currentStudent.dueno || HEAD_UID]) || { horas: [], asign: {} }} temas={temas} onLoadNotas={loadNotas} onAddNota={addNota} onDeleteNota={deleteNota}/>}
    </>
  )
}
