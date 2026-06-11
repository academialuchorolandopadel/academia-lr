// src/constants.jsx
// Colores, datos estáticos, helpers y LogoLR compartidos entre componentes

// ─── Paleta ───────────────────────────────────────────────────────────────────
export const B = {
  bg:"#0f1a2e", bgDark:"#0a1428", bgCard:"#132038", border:"#1e3a5f",
  gold:"#c9a44a", goldLight:"#e0b86a", goldBg:"rgba(201,164,74,0.10)", goldBorder:"rgba(201,164,74,0.30)",
  text:"#ffffff", textSub:"#8a9bb5", textMuted:"#3d5a7a",
  danger:"#dc2626", dangerBg:"rgba(220,38,38,0.08)", dangerBorder:"rgba(220,38,38,0.30)",
  warningBg:"rgba(217,119,6,0.08)", warningBorder:"rgba(217,119,6,0.30)",
  infoBg:"rgba(59,130,246,0.08)", infoBorder:"rgba(59,130,246,0.30)",
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
export function LogoLR({ size = 40, color = B.gold }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect x="6" y="6" width="88" height="88" rx="4" stroke={color} strokeWidth="5" fill="none"/>
      <line x1="6" y1="72" x2="94" y2="72" stroke={color} strokeWidth="3.5"/>
      <line x1="50" y1="6" x2="50" y2="16" stroke={color} strokeWidth="3.5"/>
      <line x1="50" y1="72" x2="50" y2="94" stroke={color} strokeWidth="3.5"/>
      <path d="M14 18 L14 66 L44 66" stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M54 18 L54 66" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none"/>
      <path d="M54 18 L74 18 Q86 18 86 32 Q86 46 74 46 L54 46" stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M68 46 L86 66" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

// ─── StatCard (tarjeta de métrica, opcionalmente clickeable) ──────────────────
export function StatCard({ label, value, sub, icon, color, onClick }) {
  const c = color || B.gold
  return (
    <div onClick={onClick} style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:"16px 18px",flex:1,minWidth:120,cursor:onClick?"pointer":"default"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:10,color:B.textSub,marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
          <div style={{fontSize:26,fontWeight:700,color:B.text,lineHeight:1}}>{value}</div>
          {sub && <div style={{fontSize:11,color:c,marginTop:4}}>{sub}</div>}
        </div>
        {icon && <span style={{fontSize:20}}>{icon}</span>}
      </div>
      {onClick && <div style={{fontSize:9,color:B.textMuted,marginTop:8,letterSpacing:0.5}}>ver detalle ›</div>}
    </div>
  )
}

// ─── Constantes ───────────────────────────────────────────────────────────────
export const PROFE_PIN = "9999"
// Email del profe (lo vas a crear en Firebase Auth). NO es secreto, podés editarlo.
export const PROFE_EMAIL = "Luchorolandoacademia@gmail.com"

export const AT = {
  P: { bg:"#052e16", border:"#16a34a", text:"#4ade80", label:"Presente",      icon:"✓" },
  I: { bg:"#450a0a", border:"#dc2626", text:"#f87171", label:"Injustificada", icon:"✗" },
  X: { bg:"#422006", border:"#d97706", text:"#fbbf24", label:"A reprogramar", icon:"↺" },
  R: { bg:"#172554", border:"#2563eb", text:"#60a5fa", label:"Recuperada",    icon:"↩" },
}

export const NOTE_STYLE = {
  danger:  { bg:B.dangerBg,  border:B.dangerBorder,  text:"#f87171" },
  warning: { bg:B.warningBg, border:B.warningBorder, text:"#fbbf24" },
  info:    { bg:B.infoBg,    border:B.infoBorder,    text:"#93c5fd" },
  ok:      { bg:B.goldBg,    border:B.goldBorder,    text:B.gold    },
}

export const DIAS_KEYS  = ["lunes","martes","miercoles","jueves","viernes","sabado"]
export const DIAS_LABEL = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]

// Meses en orden de calendario (para pagos dinámicos)
export const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

// Ingresos reales 2026 (desde planilla)
export const INCOME_DATA = [
  { mes:"Ene", total:6150000,  profe:4305000,  cancha:1845000 },
  { mes:"Feb", total:12265000, profe:8585500,  cancha:3679500 },
  { mes:"Mar", total:13465000, profe:9425500,  cancha:4039500 },
  { mes:"Abr", total:14850000, profe:10395000, cancha:4455000 },
  { mes:"May", total:12515000, profe:8760500,  cancha:2878450 },
  { mes:"Jun", total:7860000,  profe:5502000,  cancha:2358000 },
]

export const PLANES = [
  { code:"U", nombre:"Clase Única", clases:1,  individual:100000, pareja:150000 },
  { code:"C", nombre:"4 Clases",   clases:4,  individual:380000, pareja:600000 },
  { code:"O", nombre:"8 Clases",   clases:8,  individual:650000, pareja:1100000, popular:true },
  { code:"D", nombre:"12 Clases",  clases:12, individual:950000, pareja:1440000 },
]

export const SCHEDULE_SLOTS = [
  { hora:"9:00",  lunes:"",         martes:"Guada Rolon", miercoles:"",         jueves:"Guada Rolon", viernes:"Lucho R.", sabado:"" },
  { hora:"11:30", lunes:"",         martes:"",            miercoles:"Lucho R.", jueves:"",            viernes:"",         sabado:"" },
  { hora:"12:00", lunes:"Lucho R.", martes:"",            miercoles:"",         jueves:"",            viernes:"",         sabado:"" },
  { hora:"16:00", lunes:"",         martes:"",            miercoles:"",         jueves:"Lucho R.",    viernes:"",         sabado:"" },
  { hora:"18:00", lunes:"",         martes:"",            miercoles:"",         jueves:"",            viernes:"",         sabado:"" },
  { hora:"19:00", lunes:"",         martes:"",            miercoles:"",         jueves:"",            viernes:"",         sabado:"" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const fmt = (n) =>
  n >= 1000000 ? `₲${(n / 1000000).toFixed(1)}M` : `₲${(n / 1000).toFixed(0)}K`

export const fmtFull = (n) =>
  "₲ " + new Intl.NumberFormat("es").format(n)

export const initials = (name) =>
  name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()

export const avatarColor = (name) => {
  const c = ["#1d3a6e","#2d1b4e","#1a3a2e","#3a1a2a","#1a2a3a","#2a3a1a","#3a2a1a"]
  let h = 0
  for (let ch of name) h = (h * 31 + ch.charCodeAt(0)) & 0xffffffff
  return c[Math.abs(h) % c.length]
}

// Fecha de hoy en formato "DD/MM" (igual que la planilla)
export const hoyDDMM = () => {
  const d = new Date()
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`
}

// Día de la semana corto a partir de "DD/MM" (datos 2026)
export const diaCorto = (f) => {
  const [d, m] = String(f).split("/").map(Number)
  const dias = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]
  return dias[new Date(2026, (m||1)-1, d||1).getDay()]
}

// Clave de orden cronológico para fechas "DD/MM"
export const dateKey = (f) => {
  const [d, m] = String(f).split("/").map(Number)
  return (m || 0) * 100 + (d || 0)
}

export const getNotifications = (s) => {
  const notes = []
  const disp  = s.abonadas - s.realizadas
  const recup = s.asistencia.filter(a => a.m === "X").length
  const ausen = s.asistencia.filter(a => a.m === "I").length

  if (s.estado === "VENCIDO")
    notes.push({ type:"danger",  icon:"🚨", title:"Paquete vencido",
      body:"Tu paquete se agotó. Hablá con el profe para renovar." })
  else if (disp <= 2 && disp > 0)
    notes.push({ type:"warning", icon:"⚠️", title:"Paquete por vencer",
      body:`Solo te quedan ${disp} clase${disp>1?"s":""} disponible${disp>1?"s":""}. ¡Renová pronto!` })
  else if (disp > 0)
    notes.push({ type:"ok",      icon:"🎾", title:"Clases disponibles",
      body:`Tenés ${disp} clases para usar. ¡A entrenar!` })

  if (recup > 0)
    notes.push({ type:"warning", icon:"📅", title:`${recup} clase${recup>1?"s":""} a reprogramar`,
      body:"Coordiná con el profe para recuperar tus clases pendientes." })
  if (ausen >= 2)
    notes.push({ type:"danger",  icon:"❗", title:"Ausencias injustificadas",
      body:`Tuviste ${ausen} ausencias sin aviso.` })
  if (notes.length === 0)
    notes.push({ type:"ok",      icon:"✅", title:"Todo en orden",
      body:"Tu cuenta está al día. ¡Seguí así!" })

  return notes
}
