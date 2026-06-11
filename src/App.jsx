// src/App.jsx
import { useState } from "react"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
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
  const [pw, setPw]     = useState("")
  const [err, setErr]   = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!pw || busy) return
    setBusy(true); setErr("")
    try {
      await signInWithEmailAndPassword(auth, PROFE_EMAIL, pw)
      onSuccess()
    } catch (e) {
      setErr("Contraseña incorrecta.")
      setBusy(false)
    }
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(160deg,${B.bgDark} 0%,${B.bg} 60%,#0c1520 100%)`,padding:24,fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{width:"100%",maxWidth:340,background:"rgba(10,20,40,0.85)",backdropFilter:"blur(24px)",border:`1px solid ${B.goldBorder}`,borderRadius:24,padding:"36px 28px",boxShadow:"0 40px 80px rgba(0,0,0,0.6)"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><LogoLR size={56}/></div>
        <div style={{textAlign:"center",fontSize:18,fontWeight:700,color:B.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Modo Profe</div>
        <div style={{textAlign:"center",fontSize:11,color:B.textSub,marginBottom:24,letterSpacing:1}}>Ingresá tu contraseña</div>

        <input
          type="password"
          value={pw}
          autoFocus
          onChange={e => { setPw(e.target.value); setErr("") }}
          onKeyDown={e => { if (e.key === "Enter") submit() }}
          placeholder="Contraseña"
          style={{width:"100%",padding:"12px 14px",background:"rgba(30,58,95,0.4)",border:`1px solid ${err?B.dangerBorder:B.border}`,borderRadius:12,color:B.text,fontSize:15,outline:"none",marginBottom:6}}
        />
        {err && <div style={{fontSize:12,color:"#f87171",marginBottom:6,textAlign:"center"}}>{err}</div>}

        <button onClick={submit} disabled={busy}
          style={{width:"100%",marginTop:10,padding:"12px",borderRadius:12,border:"none",background:B.gold,color:B.bgDark,fontSize:14,fontWeight:700,cursor:busy?"default":"pointer",opacity:busy?0.6:1}}>
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
  const { students, payments, loading, error, updateStudent } = useAcademia()
  const [mode, setMode]                         = useState(null) // null | profe | admin | student
  const [currentStudentId, setCurrentStudentId] = useState(null)
  const [loginError, setLoginError]             = useState("")

  if (loading) return <LoadingScreen/>
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
      {mode === "admin"   && <AdminMode  students={students} payments={payments} onUpdate={updateStudent} onLogout={handleLogout}/>}
      {mode === "student" && currentStudent && <StudentMode student={currentStudent} onLogout={handleLogout}/>}
    </>
  )
}
