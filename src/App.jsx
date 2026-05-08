import { useState, useMemo, useRef, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

/* ══════════════════════════════════════════════════════════════
   BRAND TOKENS — Academia LR
══════════════════════════════════════════════════════════════ */
const B = {
  bg:        "#0f1a2e",
  bgDark:    "#0a1428",
  bgCard:    "#132038",
  border:    "#1e3a5f",
  gold:      "#c9a44a",
  goldLight: "#e0b86a",
  goldBg:    "rgba(201,164,74,0.10)",
  goldBorder:"rgba(201,164,74,0.30)",
  text:      "#ffffff",
  textSub:   "#8a9bb5",
  textMuted: "#3d5a7a",
  ok:        "#c9a44a",
  okBg:      "rgba(201,164,74,0.10)",
  okBorder:  "rgba(201,164,74,0.35)",
  danger:    "#dc2626",
  dangerBg:  "rgba(220,38,38,0.08)",
  dangerBorder:"rgba(220,38,38,0.30)",
  warning:   "#d97706",
  warningBg: "rgba(217,119,6,0.08)",
  warningBorder:"rgba(217,119,6,0.30)",
  info:      "#3b82f6",
  infoBg:    "rgba(59,130,246,0.08)",
  infoBorder:"rgba(59,130,246,0.30)",
  individual:   "#3b82f6",
  individualBg: "#172554",
  individualBorder: "#2563eb",
  grupal:       "#22c55e",
  grupalBg:     "#1a3a2e",
  grupalBorder: "#16a34a",
  pendiente:    "#fbbf24",
  pendienteBg:  "#422006",
  pendienteBorder: "#d97706",
};

/* ══════════════════════════════════════════════════════════════
   SVG LOGO — LR Monogram
══════════════════════════════════════════════════════════════ */
function LogoLR({ size = 40, color = B.gold }) {
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

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */
const PROFE_PIN = "9999";

const AT = {
  P:{ bg:"#052e16",    border:"#16a34a", text:"#4ade80", label:"Presente",      icon:"✓" },
  I:{ bg:"#450a0a",    border:"#dc2626", text:"#f87171", label:"Injustificada", icon:"✗" },
  X:{ bg:"#422006",    border:"#d97706", text:"#fbbf24", label:"A reprogramar", icon:"↺" },
  R:{ bg:"#172554",    border:"#2563eb", text:"#60a5fa", label:"Recuperada",    icon:"↩" },
};

const NOTE_STYLE = {
  danger:  { bg:B.dangerBg,  border:B.dangerBorder,  text:"#f87171" },
  warning: { bg:B.warningBg, border:B.warningBorder, text:"#fbbf24" },
  info:    { bg:B.infoBg,    border:B.infoBorder,    text:"#93c5fd" },
  ok:      { bg:B.goldBg,    border:B.goldBorder,    text:B.gold    },
};

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS_KEYS  = ["lunes","martes","miercoles","jueves","viernes","sabado"];
const DIAS_LABEL = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const RECENT_DATES = ["07/04","09/04","14/04","16/04","22/04","24/04","28/04","30/04"];

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */
const INCOME_DATA = [
  { mes:"Ene", total:6150000,  profe:4305000,  cancha:1845000 },
  { mes:"Feb", total:12265000, profe:8585500,  cancha:3679500 },
  { mes:"Mar", total:13465000, profe:9425500,  cancha:4039500 },
  { mes:"Abr", total:14850000, profe:10395000, cancha:4455000 },
  { mes:"May", total:930000,   profe:651000,   cancha:279000  },
];

const PLANES = [
  { code:"U", nombre:"Clase Única", clases:1,  individual:100000,  pareja:150000  },
  { code:"C", nombre:"4 Clases",   clases:4,  individual:380000,  pareja:600000  },
  { code:"O", nombre:"8 Clases",   clases:8,  individual:650000,  pareja:1100000, popular:true },
  { code:"D", nombre:"12 Clases",  clases:12, individual:950000,  pareja:1440000 },
];

const INITIAL_SCHEDULE = [
  { hora:"8:00",  lunes:[], martes:[], miercoles:[], jueves:[], viernes:[], sabado:[], tipo:"grupal", duracion:60 },
  { hora:"9:00",  lunes:[], martes:["Guada Rolon"], miercoles:[], jueves:["Guada Rolon"], viernes:["Lucho R."], sabado:[], tipo:"grupal", duracion:60 },
  { hora:"10:00", lunes:[], martes:[], miercoles:[], jueves:[], viernes:[], sabado:[], tipo:"grupal", duracion:60 },
  { hora:"11:30", lunes:[], martes:[], miercoles:["Lucho R."], jueves:[], viernes:[], sabado:[], tipo:"grupal", duracion:60 },
  { hora:"12:00", lunes:["Lucho R."], martes:[], miercoles:[], jueves:[], viernes:[], sabado:[], tipo:"individual", duracion:60 },
  { hora:"15:00", lunes:[], martes:[], miercoles:[], jueves:[], viernes:[], sabado:[], tipo:"grupal", duracion:60 },
  { hora:"16:00", lunes:[], martes:[], miercoles:[], jueves:["Lucho R."], viernes:[], sabado:[], tipo:"grupal", duracion:60 },
  { hora:"17:00", lunes:[], martes:[], miercoles:[], jueves:[], viernes:[], sabado:[], tipo:"grupal", duracion:90 },
  { hora:"18:00", lunes:[], martes:[], miercoles:[], jueves:[], viernes:[], sabado:[], tipo:"grupal", duracion:90 },
  { hora:"19:00", lunes:[], martes:[], miercoles:[], jueves:[], viernes:[], sabado:[], tipo:"grupal", duracion:90 },
];

const INITIAL_STUDENTS = [
  { id:1,  pin:"1234", nombre:"Vale Marengo",   iniciales:"VM", estado:"OK",      abonadas:39, realizadas:33, email:"valeriamarengo@hotmail.com",     tel:"981130838",    plan:"12 Clases", pagos:{Enero:740000,Febrero:650000,Marzo:650000,Abril:650000},   asistencia:[{f:"07/04",m:"P"},{f:"09/04",m:"P"},{f:"14/04",m:"P"},{f:"16/04",m:"P"},{f:"22/04",m:"P"},{f:"24/04",m:"P"},{f:"28/04",m:"P"},{f:"30/04",m:"P"}], foto:null, agendamientos:[] },
  { id:2,  pin:"0002", nombre:"Euge",            iniciales:"EU", estado:"OK",      abonadas:11, realizadas:8,  email:"",                               tel:"981419378",    plan:"8 Clases",  pagos:{Enero:262000,Febrero:350000,Marzo:350000},                asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:""},{f:"22/04",m:"P"},{f:"24/04",m:""},{f:"28/04",m:"P"},{f:"30/04",m:""}], foto:null, agendamientos:[] },
  { id:3,  pin:"0003", nombre:"Arnaldo",         iniciales:"AR", estado:"OK",      abonadas:11, realizadas:8,  email:"",                               tel:"981419378",    plan:"8 Clases",  pagos:{Enero:263000,Febrero:350000,Marzo:350000},                asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:""},{f:"22/04",m:"P"},{f:"24/04",m:""},{f:"28/04",m:"P"},{f:"30/04",m:""}], foto:null, agendamientos:[] },
  { id:4,  pin:"4444", nombre:"Diego Sanchez",   iniciales:"DS", estado:"VENCIDO", abonadas:12, realizadas:12, email:"D.sanchezareco@gmail.com",       tel:"991703651",    plan:"12 Clases", pagos:{Febrero:90000,Marzo:220000,Abril:700000},                asistencia:[{f:"07/04",m:"P"},{f:"09/04",m:"P"},{f:"14/04",m:"P"},{f:"16/04",m:"P"},{f:"22/04",m:"P"},{f:"24/04",m:"P"},{f:"28/04",m:"P"},{f:"30/04",m:"P"}], foto:null, agendamientos:[] },
  { id:5,  pin:"0000", nombre:"Lucho Rolando",   iniciales:"LR", estado:"OK",      abonadas:6,  realizadas:2,  email:"luisangelrolando2024@gmail.com", tel:"595971515309", plan:"4 Clases",  pagos:{},                                                       asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:"I"},{f:"16/04",m:""},{f:"22/04",m:""},{f:"24/04",m:"X"},{f:"28/04",m:""},{f:"30/04",m:""}], foto:null, agendamientos:[] },
  { id:7,  pin:"7777", nombre:"Miguel Zacarias", iniciales:"MZ", estado:"OK",      abonadas:32, realizadas:25, email:"mzacarias@grupomipac.com",       tel:"981693213",    plan:"8 Clases",  pagos:{Febrero:550000,Marzo:840000,Abril:840000},               asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:""},{f:"22/04",m:""},{f:"24/04",m:""},{f:"28/04",m:"P"},{f:"30/04",m:"P"}], foto:null, agendamientos:[] },
  { id:8,  pin:"0008", nombre:"Lucy",            iniciales:"LU", estado:"OK",      abonadas:24, realizadas:20, email:"lucymedinavazquez@gmail.com",    tel:"981509440",    plan:"8 Clases",  pagos:{Febrero:650000,Marzo:700000,Abril:700000},               asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:""},{f:"22/04",m:"P"},{f:"24/04",m:"P"},{f:"28/04",m:"P"},{f:"30/04",m:"I"}], foto:null, agendamientos:[] },
  { id:10, pin:"1010", nombre:"Rosse Rivelli",   iniciales:"RR", estado:"OK",      abonadas:36, realizadas:30, email:"",                               tel:"",             plan:"12 Clases", pagos:{Enero:500000,Febrero:650000,Marzo:650000,Abril:650000},   asistencia:[{f:"07/04",m:"P"},{f:"09/04",m:"P"},{f:"14/04",m:"P"},{f:"16/04",m:"P"},{f:"22/04",m:""},{f:"24/04",m:"P"},{f:"28/04",m:"P"},{f:"30/04",m:"I"}], foto:null, agendamientos:[] },
  { id:17, pin:"1717", nombre:"Martin Cueto",    iniciales:"MC", estado:"OK",      abonadas:21, realizadas:17, email:"",                               tel:"",             plan:"8 Clases",  pagos:{Enero:380000,Febrero:650000,Marzo:650000},               asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:""},{f:"22/04",m:""},{f:"24/04",m:""},{f:"28/04",m:""},{f:"30/04",m:""}], foto:null, agendamientos:[] },
  { id:18, pin:"1818", nombre:"Guada Rolon",     iniciales:"GR", estado:"OK",      abonadas:19, realizadas:15, email:"",                               tel:"",             plan:"8 Clases",  pagos:{Enero:380000,Febrero:380000,Marzo:380000,Abril:380000},  asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:""},{f:"22/04",m:""},{f:"24/04",m:""},{f:"28/04",m:""},{f:"30/04",m:"P"}], foto:null, agendamientos:[] },
  { id:27, pin:"2727", nombre:"Franco Verano",   iniciales:"FV", estado:"OK",      abonadas:30, realizadas:24, email:"",                               tel:"",             plan:"12 Clases", pagos:{Enero:650000,Febrero:650000,Marzo:650000,Abril:650000},  asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:"P"},{f:"22/04",m:""},{f:"24/04",m:"P"},{f:"28/04",m:""},{f:"30/04",m:"P"}], foto:null, agendamientos:[] },
  { id:30, pin:"3030", nombre:"Arturo Grau",     iniciales:"AG", estado:"OK",      abonadas:51, realizadas:44, email:"",                               tel:"",             plan:"12 Clases", pagos:{Enero:950000,Febrero:950000,Marzo:950000,Abril:950000},  asistencia:[{f:"07/04",m:"P"},{f:"09/04",m:"P"},{f:"14/04",m:"I"},{f:"16/04",m:"P"},{f:"22/04",m:""},{f:"24/04",m:"P"},{f:"28/04",m:"I"},{f:"30/04",m:"X"}], foto:null, agendamientos:[] },
  { id:45, pin:"4545", nombre:"Mauro Coche",     iniciales:"MC", estado:"OK",      abonadas:40, realizadas:37, email:"",                               tel:"",             plan:"8 Clases",  pagos:{Enero:650000,Febrero:650000,Marzo:650000,Abril:650000},  asistencia:[{f:"07/04",m:"P"},{f:"09/04",m:"P"},{f:"14/04",m:"P"},{f:"16/04",m:"P"},{f:"22/04",m:""},{f:"24/04",m:"P"},{f:"28/04",m:"P"},{f:"30/04",m:"P"}], foto:null, agendamientos:[] },
  { id:47, pin:"4747", nombre:"Marcos Ibañez",   iniciales:"MI", estado:"OK",      abonadas:14, realizadas:13, email:"",                               tel:"",             plan:"8 Clases",  pagos:{Marzo:650000,Abril:650000},                              asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:"P"},{f:"16/04",m:""},{f:"22/04",m:""},{f:"24/04",m:""},{f:"28/04",m:"P"},{f:"30/04",m:""}], foto:null, agendamientos:[] },
  { id:52, pin:"5252", nombre:"Yanina",          iniciales:"YA", estado:"OK",      abonadas:13, realizadas:10, email:"",                               tel:"",             plan:"8 Clases",  pagos:{Marzo:650000,Abril:650000},                              asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:""},{f:"22/04",m:""},{f:"24/04",m:""},{f:"28/04",m:""},{f:"30/04",m:""}], foto:null, agendamientos:[] },
];

const INITIAL_PAYMENTS = [
  { alumno:"Vale Marengo",  ene:740000, feb:650000, mar:650000, abr:650000 },
  { alumno:"Euge",          ene:262000, feb:350000, mar:350000 },
  { alumno:"Arnaldo",       ene:263000, feb:350000, mar:350000 },
  { alumno:"Diego Sanchez",             feb:90000,  mar:220000, abr:700000 },
  { alumno:"Miguel Zacarias",           feb:550000, mar:840000, abr:840000 },
  { alumno:"Lucy",                      feb:650000, mar:700000, abr:700000 },
  { alumno:"Rosse Rivelli", ene:500000, feb:650000, mar:650000, abr:650000 },
  { alumno:"Martin Cueto",  ene:380000, feb:650000, mar:650000 },
  { alumno:"Guada Rolon",   ene:380000, feb:380000, mar:380000, abr:380000 },
  { alumno:"Franco Verano", ene:650000, feb:650000, mar:650000, abr:650000 },
  { alumno:"Arturo Grau",   ene:950000, feb:950000, mar:950000, abr:950000 },
  { alumno:"Mauro Coche",   ene:650000, feb:650000, mar:650000, abr:650000 },
];

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
const fmt     = (n) => n>=1000000 ? `₲${(n/1000000).toFixed(1)}M` : `₲${(n/1000).toFixed(0)}K`;
const fmtFull = (n) => "₲ " + new Intl.NumberFormat("es").format(n);
const initials= (name) => name.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
const avatarColor = (name) => {
  const cols = ["#1d3a6e","#2d1b4e","#1a3a2e","#3a1a2a","#1a2a3a","#2a3a1a","#3a2a1a"];
  let h=0; for(let c of name) h=(h*31+c.charCodeAt(0))&0xffffffff;
  return cols[Math.abs(h)%cols.length];
};
const getNotifications = (s) => {
  const notes=[];
  const disp  = s.abonadas - s.realizadas;
  const recup = s.asistencia.filter(a=>a.m==="X").length;
  const ausen = s.asistencia.filter(a=>a.m==="I").length;
  if (s.estado==="VENCIDO")       notes.push({type:"danger", icon:"🚨",title:"Paquete vencido",       body:"Tu paquete se agotó. Hablá con el profe para renovar."});
  else if (disp<=2 && disp>0)     notes.push({type:"warning",icon:"⚠️",title:"Paquete por vencer",    body:`Solo te quedan ${disp} clase${disp>1?"s":""} disponible${disp>1?"s":""}. ¡Renová pronto!`});
  else if (disp>0)                notes.push({type:"ok",     icon:"🎾",title:"Clases disponibles",     body:`Tenés ${disp} clases para usar. ¡A entrenar!`});
  if (recup>0)                    notes.push({type:"warning",icon:"📅",title:`${recup} clase${recup>1?"s":""} a reprogramar`, body:"Coordiná con el profe para recuperar tus clases pendientes."});
  if (ausen>=2)                   notes.push({type:"danger", icon:"❗",title:"Ausencias injustificadas",body:`Tuviste ${ausen} ausencias sin aviso. Recordá avisar si no podés asistir.`});
  if (notes.length===0)           notes.push({type:"ok",     icon:"✅",title:"Todo en orden",          body:"Tu cuenta está al día. ¡Seguí así!"});
  return notes;
};
const detectarPlan = (monto) => {
  for (const p of PLANES) {
    if (monto === p.individual) return { plan: p, tipo: "individual", clases: p.clases };
    if (p.pareja && monto === p.pareja) return { plan: p, tipo: "pareja", clases: p.clases };
  }
  return null;
};
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const capacidadMax = (tipo) => tipo === "individual" ? 1 : 4;
const puedeCancelar = (fechaStr, horaStr) => {
  const [d, m] = fechaStr.split("/").map(Number);
  const [h, min] = horaStr.split(":").map(Number);
  const fc = new Date(2026, m - 1, d, h, min || 0, 0);
  const ahora = new Date();
  return (fc.getTime() - ahora.getTime()) / (1000 * 60 * 60) > 6;
};

/* ══════════════════════════════════════════════════════════════
   SHARED: PIN PAD
══════════════════════════════════════════════════════════════ */
function PinPad({ onSubmit, error, setError }) {
  const [pin,setPin]=useState("");
  const KEYS=[["1","2","3"],["4","5","6"],["7","8","9"],["","0","⌫"]];
  const press=(val)=>{
    if(val==="⌫"){setPin(p=>p.slice(0,-1));setError("");return;}
    if(pin.length>=4) return;
    const np=pin+val; setPin(np); setError("");
    if(np.length===4) setTimeout(()=>{ if(!onSubmit(np)){setError("PIN incorrecto. Intentá de nuevo.");setPin("");} },200);
  };
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:`linear-gradient(160deg, ${B.bgDark} 0%, ${B.bg} 60%, #0c1520 100%)`,padding:24,fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        <div style={{position:"absolute",top:"-15%",left:"-10%",width:500,height:500,borderRadius:"50%",background:`radial-gradient(circle,${B.goldBg},transparent 70%)`}}/>
        <div style={{position:"absolute",bottom:"-15%",right:"-10%",width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle,rgba(30,58,95,0.4),transparent 70%)`}}/>
      </div>
      <div style={{position:"relative",width:"100%",maxWidth:340,background:"rgba(10,20,40,0.85)",backdropFilter:"blur(24px)",border:`1px solid ${B.goldBorder}`,borderRadius:24,padding:"40px 28px 36px",boxShadow:"0 40px 80px rgba(0,0,0,0.6)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
            <LogoLR size={64}/>
          </div>
          <div style={{fontSize:20,fontWeight:700,color:B.gold,letterSpacing:3,textTransform:"uppercase"}}>Academia LR</div>
          <div style={{fontSize:11,color:B.textSub,marginTop:4,letterSpacing:2,textTransform:"uppercase"}}>Ingresá tu PIN</div>
        </div>
        <div style={{marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"center",gap:14}}>
            {[0,1,2,3].map(i=>(
              <div key={i} style={{width:50,height:50,borderRadius:14,border:`2px solid ${pin.length>i?B.gold:B.goldBorder}`,background:pin.length>i?B.goldBg:"rgba(255,255,255,0.02)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
                {pin.length>i && <div style={{width:14,height:14,borderRadius:"50%",background:B.gold}}/>}
              </div>
            ))}
          </div>
          {error && <div style={{textAlign:"center",marginTop:12,fontSize:13,color:"#f87171"}}>{error}</div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {KEYS.map((row,ri)=>(
            <div key={ri} style={{display:"flex",gap:10,justifyContent:"center"}}>
              {row.map((k,ki)=>k===""?<div key={ki} style={{flex:1,maxWidth:86}}/>:
                <button key={ki} onClick={()=>press(k)} style={{flex:1,maxWidth:86,height:56,borderRadius:14,background:k==="⌫"?"rgba(255,255,255,0.04)":`rgba(30,58,95,0.4)`,border:`1px solid ${B.border}`,color:B.text,fontSize:k==="⌫"?20:22,cursor:"pointer",fontFamily:"monospace",transition:"all 0.15s"}}>
                  {k}
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:20,fontSize:11,color:B.textMuted}}>Profe · Alumnos · Un solo acceso</div>
      </div>
    </div>
  );
}
/* ══════════════════════════════════════════════════════════════
   SHARED: PIN CHANGE MODAL (alumno)
══════════════════════════════════════════════════════════════ */
function PinChangeModal({ currentPin, onSave, onClose }) {
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
    setter(current + val); setError("");
  };
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
            {step === "current" ? "Por seguridad" : step === "new" ? "Creá un PIN de 4 dígitos" : "Repetí el PIN"}
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

/* ══════════════════════════════════════════════════════════════
   SHARED: AVATAR EDITOR (alumno)
══════════════════════════════════════════════════════════════ */
function AvatarEditor({ student, onSave, onClose }) {
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
          {student.foto ? (
            <img src={student.foto} alt="Perfil" style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: `3px solid ${B.gold}` }} />
          ) : (
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: avatarColor(student.nombre), display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${B.gold}`, margin: "0 auto", fontSize: 32, fontWeight: 700, color: B.gold }}>
              {student.iniciales}
            </div>
          )}
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

/* ══════════════════════════════════════════════════════════════
   SHARED: NOTIFICATION BELL
══════════════════════════════════════════════════════════════ */
function NotificationBell({ notifications, onMarkRead, onClearAll }) {
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
            {notifications.length > 0 && <button onClick={onClearAll} style={{ background: "transparent", border: "none", color: B.textSub, fontSize: 11, cursor: "pointer" }}>Limpiar todo</button>}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: B.textSub, fontSize: 13 }}>No hay notificaciones</div>
          ) : (
            notifications.slice().reverse().map(n => {
              const st = NOTE_STYLE[n.tipo === "agendamiento_pendiente" || n.tipo === "paquete_agotado" ? "warning" : n.tipo === "aprobado" || n.tipo === "horario_publicado" ? "ok" : n.tipo === "rechazado" || n.tipo === "cancelacion" ? "danger" : "info"];
              return (
                <div key={n.id} onClick={() => onMarkRead(n.id)} style={{ padding: "12px 16px", borderBottom: `1px solid ${B.border}`, cursor: "pointer", background: n.leido ? "transparent" : B.goldBg }}>
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

/* ══════════════════════════════════════════════════════════════
   ADMIN — Sidebar
══════════════════════════════════════════════════════════════ */
const ADMIN_NAV = [
  {id:"dashboard",  label:"Dashboard",  emoji:"▦"},
  {id:"alumnos",    label:"Alumnos",    emoji:"◉"},
  {id:"asistencia", label:"Asistencia", emoji:"◈"},
  {id:"pagos",      label:"Pagos",      emoji:"◇"},
  {id:"horarios",   label:"Horarios",   emoji:"◻"},
  {id:"ingresos",   label:"Ingresos",   emoji:"△"},
  {id:"planes",     label:"Planes",     emoji:"❖"},
];

function AdminSidebar({active,onNav,onLogout}){
  return (
    <div style={{width:215,background:B.bgDark,borderRight:`1px solid ${B.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"22px 18px 20px",borderBottom:`1px solid ${B.border}`,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
        <LogoLR size={48}/>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:13,fontWeight:700,color:B.gold,letterSpacing:2,textTransform:"uppercase"}}>Academia LR</div>
          <div style={{fontSize:10,color:B.textSub,letterSpacing:1,marginTop:2}}>Modo Profe</div>
        </div>
      </div>
      <nav style={{flex:1,padding:"12px 8px",display:"flex",flexDirection:"column",gap:2}}>
        {ADMIN_NAV.map(({id,label,emoji})=>{
          const on=active===id;
          return <button key={id} onClick={()=>onNav(id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:8,border:"none",cursor:"pointer",textAlign:"left",width:"100%",background:on?B.goldBg:"transparent",color:on?B.gold:B.textSub,fontWeight:on?600:400,fontSize:13,borderLeft:`2px solid ${on?B.gold:"transparent"}`,transition:"all 0.15s",fontFamily:"'Segoe UI',sans-serif"}}>
            <span style={{fontSize:14}}>{emoji}</span> {label}
          </button>;
        })}
      </nav>
      <div style={{padding:"14px 18px",borderTop:`1px solid ${B.border}`}}>
        <button onClick={onLogout} style={{width:"100%",padding:"8px",borderRadius:8,border:`1px solid ${B.border}`,background:"transparent",color:B.textSub,fontSize:12,cursor:"pointer",fontFamily:"'Segoe UI',sans-serif"}}>Cerrar sesión</button>
      </div>
    </div>
  );
}

function StatCard({label,value,sub,icon,color}){
  const c=color||B.gold;
  return (
    <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:"18px 20px",flex:1,minWidth:130}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:11,color:B.textSub,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
          <div style={{fontSize:28,fontWeight:700,color:B.text,lineHeight:1}}>{value}</div>
          {sub&&<div style={{fontSize:11,color:c,marginTop:5}}>{sub}</div>}
        </div>
        {icon&&<span style={{fontSize:22}}>{icon}</span>}
      </div>
    </div>
  );
}

/* ADMIN — Dashboard */
function AdminDashboard({students}){
  const active  = students.filter(s=>s.estado==="OK").length;
  const vencidos= students.filter(s=>s.estado==="VENCIDO").length;
  const totalCl = students.reduce((a,s)=>a+s.realizadas,0);
  const lastMes = INCOME_DATA[INCOME_DATA.length-1];
  const hoyPres = students.filter(s=>s.asistencia[s.asistencia.length-1]?.m==="P");
  return (
    <div style={{padding:28}}>
      <div style={{marginBottom:22}}><h1 style={{fontSize:24,fontWeight:700,color:B.text,margin:0}}>Dashboard</h1><p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Resumen general · Mayo 2026</p></div>
      <div style={{display:"flex",gap:14,marginBottom:24,flexWrap:"wrap"}}>
        <StatCard label="Alumnos activos" value={active} sub={`${vencidos} vencidos`} icon="✅"/>
        <StatCard label="Clases realizadas" value={totalCl} sub="en el año" icon="🎾" color="#60a5fa"/>
        <StatCard label="Ingreso último mes" value={fmt(lastMes.total)} sub={lastMes.mes} icon="💰" color={B.gold}/>
        <StatCard label="Tasa asistencia" value="82%" sub="promedio OK" icon="📈"/>
      </div>
      <div style={{display:"flex",gap:18,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 380px",background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:22}}>
          <div style={{fontSize:14,fontWeight:600,color:B.text,marginBottom:14}}>Ingresos 2026</div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={INCOME_DATA}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={B.gold} stopOpacity={0.3}/><stop offset="95%" stopColor={B.gold} stopOpacity={0}/></linearGradient>
                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/><stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={B.border}/>
              <XAxis dataKey="mes" tick={{fill:B.textSub,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>fmt(v)} tick={{fill:B.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v,n)=>[fmtFull(v),n==="profe"?"Profe":"Cancha"]} contentStyle={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:8,color:B.text}}/>
              <Area type="monotone" dataKey="profe" stroke={B.gold} fill="url(#gP)" strokeWidth={2}/>
              <Area type="monotone" dataKey="cancha" stroke="#60a5fa" fill="url(#gC)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:14,marginTop:6}}>
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:B.textSub}}><div style={{width:10,height:10,background:B.gold,borderRadius:2}}/> Profe</div>
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:B.textSub}}><div style={{width:10,height:10,background:"#60a5fa",borderRadius:2}}/> Cancha</div>
          </div>
        </div>
        <div style={{flex:"1 1 200px",background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:22}}>
          <div style={{fontSize:14,fontWeight:600,color:B.text,marginBottom:4}}>Última clase</div>
          <div style={{fontSize:11,color:B.textSub,marginBottom:14}}>30 Abr · {hoyPres.length} presentes</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:200,overflowY:"auto"}}>
            {hoyPres.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:8}}>
                {s.foto ? (
                  <img src={s.foto} alt="" style={{width:26,height:26,borderRadius:"50%",objectFit:"cover",border:`1px solid ${B.border}`,flexShrink:0}} />
                ) : (
                  <div style={{width:26,height:26,background:avatarColor(s.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:B.gold,flexShrink:0,border:`1px solid ${B.border}`}}>{s.iniciales}</div>
                )}
                <span style={{fontSize:12,color:B.text}}>{s.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ADMIN — Alumnos (con reset PIN) */
function AdminAlumnos({students, onUpdate}){
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("TODOS");
  const [resetTarget, setResetTarget] = useState(null);
  const filtered=useMemo(()=>students.filter(s=>{
    const ms=s.nombre.toLowerCase().includes(search.toLowerCase());
    const mf=filter==="TODOS"||s.estado===filter;
    return ms&&mf;
  }),[students,search,filter]);
  const handleResetPin = () => {
    if (!resetTarget) return;
    onUpdate(resetTarget.id, s => ({ ...s, pin: "0000" }));
    setResetTarget(null);
  };
  return (
    <div style={{padding:28}}>
      {resetTarget && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:B.bgCard,border:`1px solid ${B.goldBorder}`,borderRadius:20,padding:"28px 24px",textAlign:"center",maxWidth:320}}>
            <div style={{fontSize:16,fontWeight:700,color:B.gold,marginBottom:8}}>Resetear PIN</div>
            <div style={{fontSize:13,color:B.textSub,marginBottom:16}}>¿Resetear el PIN de <strong style={{color:B.text}}>{resetTarget.nombre}</strong> a <strong style={{color:B.gold}}>0000</strong>?</div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setResetTarget(null)} style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${B.border}`,background:"transparent",color:B.textSub,fontSize:13,cursor:"pointer"}}>Cancelar</button>
              <button onClick={handleResetPin} style={{flex:1,padding:"10px",borderRadius:10,background:B.gold,color:B.bgDark,border:"none",fontSize:13,fontWeight:700,cursor:"pointer"}}>Resetear</button>
            </div>
          </div>
        </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h1 style={{fontSize:24,fontWeight:700,color:B.text,margin:0}}>Alumnos</h1><p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>{students.length} registrados</p></div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar alumno..." style={{flex:"1 1 180px",padding:"9px 14px",background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:8,color:B.text,fontSize:13,outline:"none",fontFamily:"'Segoe UI',sans-serif"}}/>
        {["TODOS","OK","VENCIDO"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${filter===f?B.gold:B.border}`,background:filter===f?B.goldBg:B.bgCard,color:filter===f?B.gold:B.textSub,cursor:"pointer",fontSize:12,fontWeight:filter===f?600:400,fontFamily:"'Segoe UI',sans-serif"}}>{f}</button>
        ))}
      </div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:`1px solid ${B.border}`}}>
            {["Alumno","PIN","Estado","Abonadas","Realizadas","Diferencia","Plan","Acción"].map(h=>(
              <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:11,color:B.textSub,fontWeight:600,textTransform:"uppercase",letterSpacing:0.8}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((s,i)=>{
              const diff=s.abonadas-s.realizadas;
              return <tr key={s.id} style={{borderBottom:i<filtered.length-1?`1px solid ${B.border}`:"none"}} onMouseEnter={e=>e.currentTarget.style.background=B.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"11px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    {s.foto ? (
                      <img src={s.foto} alt="" style={{width:30,height:30,borderRadius:"50%",objectFit:"cover",border:`1px solid ${B.border}`,flexShrink:0}} />
                    ) : (
                      <div style={{width:30,height:30,background:avatarColor(s.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:B.gold,flexShrink:0,border:`1px solid ${B.border}`}}>{s.iniciales}</div>
                    )}
                    <span style={{fontSize:13,color:B.text,fontWeight:500}}>{s.nombre}</span>
                  </div>
                </td>
                <td style={{padding:"11px 14px"}}><code style={{fontSize:12,color:B.gold,background:B.goldBg,padding:"2px 8px",borderRadius:4}}>{s.pin}</code></td>
                <td style={{padding:"11px 14px"}}><span style={{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:20,background:s.estado==="OK"?B.goldBg:B.dangerBg,color:s.estado==="OK"?B.gold:"#f87171",border:`1px solid ${s.estado==="OK"?B.goldBorder:B.dangerBorder}`}}>{s.estado}</span></td>
                <td style={{padding:"11px 14px",fontSize:13,color:B.text}}>{s.abonadas}</td>
                <td style={{padding:"11px 14px",fontSize:13,color:B.text}}>{s.realizadas}</td>
                <td style={{padding:"11px 14px"}}><span style={{fontSize:13,fontWeight:600,color:diff>0?B.gold:diff<0?"#f87171":B.textSub}}>{diff>0?`+${diff}`:diff}</span></td>
                <td style={{padding:"11px 14px",fontSize:12,color:B.textSub}}>{s.plan}</td>
                <td style={{padding:"11px 14px"}}><button onClick={()=>setResetTarget(s)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${B.warningBorder}`,background:B.warningBg,color:B.warning,fontSize:11,cursor:"pointer",fontWeight:600}}>🔒 Reset</button></td>
              </tr>;
            })}
          </tbody>
        </table>
        {filtered.length===0&&<div style={{padding:32,textAlign:"center",color:B.textSub}}>No se encontraron alumnos</div>}
      </div>
    </div>
  );
}

/* ADMIN — Asistencia */
function AdminAsistencia({students,onUpdate}){
  const hoy="01/05";
  const activeS=students.filter(s=>s.estado==="OK");
  const markAll=(marca)=>{
    activeS.forEach(s=>onUpdate(s.id,st=>{
      const has=st.asistencia.find(a=>a.f===hoy);
      return {...st,asistencia:has?st.asistencia.map(a=>a.f===hoy?{...a,m:marca}:a):[...st.asistencia,{f:hoy,m:marca}]};
    }));
  };
  return (
    <div style={{padding:28}}>
      <div style={{marginBottom:20}}><h1 style={{fontSize:24,fontWeight:700,color:B.text,margin:0}}>Asistencia</h1><p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Historial · Clic en celda para editar</p></div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:"14px 18px",marginBottom:16}}>
        <div style={{fontSize:12,color:B.textSub,marginBottom:10}}>📋 Clase de hoy ({hoy}) — marcar todos como:</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["P","I","X","R"].map(k=>(<button key={k} onClick={()=>markAll(k)} style={{padding:"7px 16px",borderRadius:8,border:`1px solid ${AT[k].border}`,background:AT[k].bg,color:AT[k].text,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Segoe UI',sans-serif"}}>{k} — {AT[k].label}</button>))}
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {Object.entries(AT).map(([k,v])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,background:v.bg,border:`1px solid ${v.border}`}}>
            <span style={{fontSize:12,fontWeight:700,color:v.text}}>{k}</span><span style={{fontSize:11,color:v.text}}>{v.label}</span>
          </div>
        ))}
      </div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,overflow:"auto"}}>
        <table style={{borderCollapse:"collapse",minWidth:"100%"}}>
          <thead><tr style={{borderBottom:`1px solid ${B.border}`}}>
            <th style={{padding:"11px 18px",textAlign:"left",fontSize:11,color:B.textSub,fontWeight:600,textTransform:"uppercase",minWidth:160}}>Alumno</th>
            {[...RECENT_DATES,hoy].map(d=><th key={d} style={{padding:"11px 12px",textAlign:"center",fontSize:11,color:d===hoy?B.gold:B.textSub,fontWeight:600,whiteSpace:"nowrap"}}>{d}{d===hoy?" ★":""}</th>)}
            <th style={{padding:"11px 12px",textAlign:"center",fontSize:11,color:B.textSub,fontWeight:600}}>%</th>
          </tr></thead>
          <tbody>
            {activeS.map((s,si)=>{
              const allD=[...RECENT_DATES,hoy];
              const row=allD.map(d=>s.asistencia.find(a=>a.f===d)?.m||"");
              const pres=row.filter(c=>c==="P").length;
              const tot=row.filter(c=>c!=="").length;
              const pct=tot?Math.round((pres/tot)*100):null;
              return <tr key={s.id} style={{borderBottom:si<activeS.length-1?`1px solid ${B.border}`:"none"}} onMouseEnter={e=>e.currentTarget.style.background=B.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"9px 18px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {s.foto ? <img src={s.foto} alt="" style={{width:26,height:26,borderRadius:"50%",objectFit:"cover",border:`1px solid ${B.border}`,flexShrink:0}} /> : <div style={{width:26,height:26,background:avatarColor(s.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:B.gold,flexShrink:0,border:`1px solid ${B.border}`}}>{s.iniciales}</div>}
                    <span style={{fontSize:12,color:B.text,whiteSpace:"nowrap"}}>{s.nombre}</span>
                  </div>
                </td>
                {allD.map((d,di)=>{
                  const marca=row[di]; const st=AT[marca]; const isHoy=d===hoy;
                  return <td key={di} style={{padding:"5px 6px",textAlign:"center"}}>
                    <button onClick={()=>{
                      const cycle=["","P","I","X","R"];
                      const next=cycle[(cycle.indexOf(marca)+1)%cycle.length];
                      onUpdate(s.id,ss=>{
                        const has=ss.asistencia.find(a=>a.f===d);
                        return {...ss,asistencia:has?ss.asistencia.map(a=>a.f===d?{...a,m:next}:a):[...ss.asistencia,{f:d,m:next}]};
                      });
                    }} style={{width:34,height:28,borderRadius:6,border:`1px solid ${st?st.border:isHoy?B.goldBorder:B.border}`,background:st?st.bg:isHoy?B.goldBg:"transparent",color:st?st.text:isHoy?B.gold:B.textMuted,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                      {marca||"·"}
                    </button>
                  </td>;
                })}
                <td style={{padding:"9px 12px",textAlign:"center"}}><span style={{fontSize:12,fontWeight:600,color:pct===null?B.textMuted:pct>=75?B.gold:pct>=50?"#fbbf24":"#f87171"}}>{pct!==null?`${pct}%`:"—"}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
