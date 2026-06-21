// src/components/PinPad.jsx
import { useState } from "react"
import { B } from "../constants"

export function PinPad({ onSubmit, error, setError }) {
  const [pin, setPin] = useState("")
  const KEYS = [["1","2","3"],["4","5","6"],["7","8","9"],["","0","⌫"]]

  const press = (val) => {
    if (val === "⌫") { setPin(p => p.slice(0,-1)); setError(""); return }
    if (pin.length >= 4) return
    const np = pin + val
    setPin(np)
    setError("")
    if (np.length === 4) setTimeout(() => {
      if (!onSubmit(np)) { setError("PIN incorrecto. Intentá de nuevo."); setPin("") }
    }, 200)
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:`linear-gradient(160deg,${B.bgDark} 0%,${B.bg} 60%,#0c1520 100%)`,padding:24,fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        <div style={{position:"absolute",top:"-15%",left:"-10%",width:500,height:500,borderRadius:"50%",background:`radial-gradient(circle,${B.goldBg},transparent 70%)`}}/>
        <div style={{position:"absolute",bottom:"-15%",right:"-10%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(30,58,95,0.4),transparent 70%)"}}/>
      </div>
      <div style={{position:"relative",width:"100%",maxWidth:340,background:"rgba(10,20,40,0.85)",backdropFilter:"blur(24px)",border:`1px solid ${B.goldBorder}`,borderRadius:24,padding:"40px 28px 36px",boxShadow:"0 40px 80px rgba(0,0,0,0.6)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
            <img src={`${import.meta.env.BASE_URL}lr-vertical.png`} alt="Academia Lucho Rolando"
              style={{width:210,maxWidth:"72%",height:"auto"}}/>
          </div>
          <div style={{fontSize:11,color:B.textSub,marginTop:4,letterSpacing:2,textTransform:"uppercase"}}>
            Ingresá tu PIN
          </div>
        </div>

        <div style={{marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"center",gap:14}}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{width:50,height:50,borderRadius:14,border:`2px solid ${pin.length>i?B.gold:B.goldBorder}`,background:pin.length>i?B.goldBg:"rgba(255,255,255,0.02)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
                {pin.length > i && <div style={{width:14,height:14,borderRadius:"50%",background:B.gold}}/>}
              </div>
            ))}
          </div>
          {error && (
            <div style={{textAlign:"center",marginTop:12,fontSize:13,color:"#f87171"}}>{error}</div>
          )}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {KEYS.map((row,ri) => (
            <div key={ri} style={{display:"flex",gap:10,justifyContent:"center"}}>
              {row.map((k,ki) =>
                k === "" ? <div key={ki} style={{flex:1,maxWidth:86}}/> :
                <button key={ki} onClick={() => press(k)}
                  style={{flex:1,maxWidth:86,height:56,borderRadius:14,background:k==="⌫"?"rgba(255,255,255,0.04)":"rgba(30,58,95,0.4)",border:`1px solid ${B.border}`,color:B.text,fontSize:k==="⌫"?20:22,cursor:"pointer",fontFamily:"monospace"}}>
                  {k}
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{textAlign:"center",marginTop:20,fontSize:11,color:B.textMuted}}>
          Profe (9999) · Alumnos · Un solo acceso
        </div>
      </div>
    </div>
  )
}
