// src/App.jsx
import { useState }       from "react"
import { useAcademia }    from "./hooks/useAcademia"
import { B, LogoLR, PROFE_PIN } from "./constants"
import { PinPad }         from "./components/PinPad"
import { AdminMode }      from "./components/AdminMode"
import { StudentMode }    from "./components/StudentMode"
import { seedFirestore }  from "./seed"

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

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { students, payments, loading, error, updateStudent } = useAcademia()
  const [mode, setMode]                         = useState(null)
  const [currentStudentId, setCurrentStudentId] = useState(null)
  const [loginError, setLoginError]             = useState("")

  if (loading) return <LoadingScreen/>
  if (error)   return <ErrorScreen error={error}/>

  const handleLogin = (pin) => {
    if (pin === PROFE_PIN) {
      setMode("admin")
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

  const handleLogout = () => {
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

      <button onClick={seedFirestore} style={{position:"fixed",bottom:12,right:12,zIndex:9999,padding:"8px 14px",background:"#16a34a",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",fontSize:12}}>🌱 Seed DB</button>

      {mode === null      && <PinPad     onSubmit={handleLogin} error={loginError} setError={setLoginError}/>}
      {mode === "admin"   && <AdminMode  students={students} payments={payments} onUpdate={updateStudent} onLogout={handleLogout}/>}
      {mode === "student" && currentStudent && <StudentMode student={currentStudent} onLogout={handleLogout}/>}
    </>
  )
}
