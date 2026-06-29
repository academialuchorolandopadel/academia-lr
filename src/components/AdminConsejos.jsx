// src/components/AdminConsejos.jsx
import { useState } from "react"
import { B } from "../constants"

export function AdminConsejos({ consejos, onSave }) {
  const [txt, setTxt] = useState("")
  const [img, setImg] = useState("")
  const [vid, setVid] = useState("")
  const lista = consejos || []

  const agregar = () => {
    const t = txt.trim(), i = img.trim(), v = vid.trim()
    if (!t && !i && !v) return
    if (i && !/^https?:\/\//i.test(i)) { alert("El enlace de imagen debe empezar con http:// o https://"); return }
    if (v && !/^https?:\/\//i.test(v)) { alert("El enlace de video debe empezar con http:// o https://"); return }
    onSave([{ id: String(Date.now()), texto: t, imagen: i, video: v, fecha: new Date().toISOString() }, ...lista])
    setTxt(""); setImg(""); setVid("")
  }
  const borrar = (id) => {
    if (window.confirm("¿Eliminar este consejo?")) onSave(lista.filter(c => c.id !== id))
  }

  const inp = {width:"100%",padding:"10px",background:B.bg,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:13,outline:"none",marginTop:8}

  return (
    <div style={{padding:24}}>
      <div style={{marginBottom:16}}>
        <h1 style={{fontSize:22,fontWeight:700,color:B.text,margin:0}}>Consejos del profe</h1>
        <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Lo que cargues acá lo ven todos tus alumnos en su app. Podés sumar una imagen y un video por enlace.</p>
      </div>

      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:16,marginBottom:16,maxWidth:560}}>
        <textarea value={txt} onChange={e=>setTxt(e.target.value)} rows={3}
          placeholder="Escribí un consejo, dato o detalle técnico para tus alumnos..."
          style={{width:"100%",padding:"10px",background:B.bg,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:14,outline:"none",resize:"vertical",fontFamily:"inherit"}}/>

        <input value={img} onChange={e=>setImg(e.target.value)} placeholder="🖼  Enlace de imagen (opcional)" style={inp}/>
        <input value={vid} onChange={e=>setVid(e.target.value)} placeholder="🎬  Enlace de video — YouTube/Instagram (opcional)" style={inp}/>

        {img.trim() && /^https?:\/\//i.test(img.trim()) && (
          <img src={img.trim()} alt="vista previa" onError={e=>{e.target.style.display="none"}}
            style={{marginTop:10,width:"100%",maxHeight:180,objectFit:"contain",borderRadius:8,border:`1px solid ${B.border}`,background:B.bg}}/>
        )}

        <button onClick={agregar}
          style={{marginTop:10,padding:"9px 16px",borderRadius:8,border:"none",background:B.gold,color:B.bgDark,fontSize:13,fontWeight:700,cursor:"pointer"}}>
          + Agregar consejo
        </button>
        <div style={{fontSize:11,color:B.textMuted,marginTop:8,lineHeight:1.5}}>
          Para el video, subilo a YouTube (podés ponerlo "oculto/no listado") o usá el link de Instagram, y pegá el enlace acá.
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:560}}>
        {lista.length===0 && <div style={{fontSize:13,color:B.textMuted}}>Sin consejos todavía.</div>}
        {lista.map(c => (
          <div key={c.id} style={{background:B.goldBg,border:`1px solid ${B.goldBorder}`,borderRadius:12,padding:"14px 16px"}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <span style={{fontSize:20,flexShrink:0}}>🎾</span>
              <div style={{flex:1,fontSize:13,color:B.text,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{c.texto}</div>
              <button onClick={()=>borrar(c.id)} style={{background:"transparent",border:"none",color:B.textMuted,cursor:"pointer",fontSize:14,flexShrink:0}}>🗑</button>
            </div>
            {c.imagen && (
              <img src={c.imagen} alt="" onError={e=>{e.target.style.display="none"}}
                style={{marginTop:10,width:"100%",maxHeight:240,objectFit:"contain",borderRadius:8,border:`1px solid ${B.goldBorder}`,background:B.bg}}/>
            )}
            {c.video && (
              <a href={c.video} target="_blank" rel="noopener noreferrer"
                style={{display:"inline-block",marginTop:10,padding:"7px 14px",borderRadius:8,background:B.bg,border:`1px solid ${B.goldBorder}`,color:B.gold,fontSize:12,fontWeight:600,textDecoration:"none"}}>
                ▶ Ver video
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
