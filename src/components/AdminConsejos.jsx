// src/components/AdminConsejos.jsx
import { useState } from "react"
import { B } from "../constants"

export function AdminConsejos({ consejos, onSave }) {
  const [txt, setTxt] = useState("")
  const lista = consejos || []
  const agregar = () => {
    const t = txt.trim()
    if (!t) return
    onSave([{ id: String(Date.now()), texto: t, fecha: new Date().toISOString() }, ...lista])
    setTxt("")
  }
  const borrar = (id) => {
    if (window.confirm("¿Eliminar este consejo?")) onSave(lista.filter(c => c.id !== id))
  }
  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Consejos del profe</h1>
        <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Lo que escribas acá lo ven todos tus alumnos en su app</p>
      </div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:16,marginBottom:16,maxWidth:560}}>
        <textarea value={txt} onChange={e=>setTxt(e.target.value)} rows={3}
          placeholder="Escribí un consejo, dato o frase para tus alumnos..."
          style={{width:"100%",padding:"10px",background:B.bg,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:14,outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
        <button onClick={agregar}
          style={{marginTop:8,padding:"9px 16px",borderRadius:8,border:"none",background:B.gold,color:B.bgDark,fontSize:13,fontWeight:700,cursor:"pointer"}}>
          + Agregar consejo
        </button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:560}}>
        {lista.length===0 && <div style={{fontSize:13,color:B.textMuted}}>Sin consejos todavía.</div>}
        {lista.map(c => (
          <div key={c.id} style={{background:B.goldBg,border:`1px solid ${B.goldBorder}`,borderRadius:12,padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
            <span style={{fontSize:20,flexShrink:0}}>🎾</span>
            <div style={{flex:1,fontSize:13,color:B.text,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{c.texto}</div>
            <button onClick={()=>borrar(c.id)} style={{background:"transparent",border:"none",color:B.textMuted,cursor:"pointer",fontSize:14,flexShrink:0}}>🗑</button>
          </div>
        ))}
      </div>
    </div>
  )
}
