import { useState, useMemo, useRef } from "react";
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

const SCHEDULE_SLOTS = [
  { hora:"8:00",  lunes:"",           martes:"",            miercoles:"",         jueves:"",            viernes:"",          sabado:"" },
  { hora:"9:00",  lunes:"",           martes:"Guada Rolon", miercoles:"",         jueves:"Guada Rolon", viernes:"Lucho R.",  sabado:"" },
  { hora:"10:00", lunes:"",           martes:"",            miercoles:"",         jueves:"",            viernes:"",          sabado:"" },
  { hora:"11:30", lunes:"",           martes:"",            miercoles:"Lucho R.", jueves:"",            viernes:"",          sabado:"" },
  { hora:"12:00", lunes:"Lucho R.",   martes:"",            miercoles:"",         jueves:"",            viernes:"",          sabado:"" },
  { hora:"15:00", lunes:"",           martes:"",            miercoles:"",         jueves:"",            viernes:"",          sabado:"" },
  { hora:"16:00", lunes:"",           martes:"",            miercoles:"",         jueves:"Lucho R.",    viernes:"",          sabado:"" },
  { hora:"17:00", lunes:"",           martes:"",            miercoles:"",         jueves:"",            viernes:"",          sabado:"" },
  { hora:"18:00", lunes:"",           martes:"",            miercoles:"",         jueves:"",            viernes:"",          sabado:"" },
  { hora:"19:00", lunes:"",           martes:"",            miercoles:"",         jueves:"",            viernes:"",          sabado:"" },
];

const INITIAL_STUDENTS = [
  { id:1,  pin:"1234", nombre:"Vale Marengo",   iniciales:"VM", estado:"OK",      abonadas:39, realizadas:33, email:"valeriamarengo@hotmail.com",     tel:"981130838",    plan:"12 Clases", pagos:{Enero:740000,Febrero:650000,Marzo:650000,Abril:650000},   asistencia:[{f:"07/04",m:"P"},{f:"09/04",m:"P"},{f:"14/04",m:"P"},{f:"16/04",m:"P"},{f:"22/04",m:"P"},{f:"24/04",m:"P"},{f:"28/04",m:"P"},{f:"30/04",m:"P"}], foto:null },
  { id:2,  pin:"0002", nombre:"Euge",            iniciales:"EU", estado:"OK",      abonadas:11, realizadas:8,  email:"",                               tel:"981419378",    plan:"8 Clases",  pagos:{Enero:262000,Febrero:350000,Marzo:350000},                asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:""},{f:"22/04",m:"P"},{f:"24/04",m:""},{f:"28/04",m:"P"},{f:"30/04",m:""}], foto:null },
  { id:3,  pin:"0003", nombre:"Arnaldo",         iniciales:"AR", estado:"OK",      abonadas:11, realizadas:8,  email:"",                               tel:"981419378",    plan:"8 Clases",  pagos:{Enero:263000,Febrero:350000,Marzo:350000},                asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:""},{f:"22/04",m:"P"},{f:"24/04",m:""},{f:"28/04",m:"P"},{f:"30/04",m:""}], foto:null },
  { id:4,  pin:"4444", nombre:"Diego Sanchez",   iniciales:"DS", estado:"VENCIDO", abonadas:12, realizadas:12, email:"D.sanchezareco@gmail.com",       tel:"991703651",    plan:"12 Clases", pagos:{Febrero:90000,Marzo:220000,Abril:700000},                asistencia:[{f:"07/04",m:"P"},{f:"09/04",m:"P"},{f:"14/04",m:"P"},{f:"16/04",m:"P"},{f:"22/04",m:"P"},{f:"24/04",m:"P"},{f:"28/04",m:"P"},{f:"30/04",m:"P"}], foto:null },
  { id:5,  pin:"0000", nombre:"Lucho Rolando",   iniciales:"LR", estado:"OK",      abonadas:6,  realizadas:2,  email:"luisangelrolando2024@gmail.com", tel:"595971515309", plan:"4 Clases",  pagos:{},                                                       asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:"I"},{f:"16/04",m:""},{f:"22/04",m:""},{f:"24/04",m:"X"},{f:"28/04",m:""},{f:"30/04",m:""}], foto:null },
  { id:7,  pin:"7777", nombre:"Miguel Zacarias", iniciales:"MZ", estado:"OK",      abonadas:32, realizadas:25, email:"mzacarias@grupomipac.com",       tel:"981693213",    plan:"8 Clases",  pagos:{Febrero:550000,Marzo:840000,Abril:840000},               asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:""},{f:"22/04",m:""},{f:"24/04",m:""},{f:"28/04",m:"P"},{f:"30/04",m:"P"}], foto:null },
  { id:8,  pin:"0008", nombre:"Lucy",            iniciales:"LU", estado:"OK",      abonadas:24, realizadas:20, email:"lucymedinavazquez@gmail.com",    tel:"981509440",    plan:"8 Clases",  pagos:{Febrero:650000,Marzo:700000,Abril:700000},               asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:""},{f:"22/04",m:"P"},{f:"24/04",m:"P"},{f:"28/04",m:"P"},{f:"30/04",m:"I"}], foto:null },
  { id:10, pin:"1010", nombre:"Rosse Rivelli",   iniciales:"RR", estado:"OK",      abonadas:36, realizadas:30, email:"",                               tel:"",             plan:"12 Clases", pagos:{Enero:500000,Febrero:650000,Marzo:650000,Abril:650000},   asistencia:[{f:"07/04",m:"P"},{f:"09/04",m:"P"},{f:"14/04",m:"P"},{f:"16/04",m:"P"},{f:"22/04",m:""},{f:"24/04",m:"P"},{f:"28/04",m:"P"},{f:"30/04",m:"I"}], foto:null },
  { id:17, pin:"1717", nombre:"Martin Cueto",    iniciales:"MC", estado:"OK",      abonadas:21, realizadas:17, email:"",                               tel:"",             plan:"8 Clases",  pagos:{Enero:380000,Febrero:650000,Marzo:650000},               asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:""},{f:"22/04",m:""},{f:"24/04",m:""},{f:"28/04",m:""},{f:"30/04",m:""}], foto:null },
  { id:18, pin:"1818", nombre:"Guada Rolon",     iniciales:"GR", estado:"OK",      abonadas:19, realizadas:15, email:"",                               tel:"",             plan:"8 Clases",  pagos:{Enero:380000,Febrero:380000,Marzo:380000,Abril:380000},  asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:""},{f:"22/04",m:""},{f:"24/04",m:""},{f:"28/04",m:""},{f:"30/04",m:"P"}], foto:null },
  { id:27, pin:"2727", nombre:"Franco Verano",   iniciales:"FV", estado:"OK",      abonadas:30, realizadas:24, email:"",                               tel:"",             plan:"12 Clases", pagos:{Enero:650000,Febrero:650000,Marzo:650000,Abril:650000},  asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:"P"},{f:"22/04",m:""},{f:"24/04",m:"P"},{f:"28/04",m:""},{f:"30/04",m:"P"}], foto:null },
  { id:30, pin:"3030", nombre:"Arturo Grau",     iniciales:"AG", estado:"OK",      abonadas:51, realizadas:44, email:"",                               tel:"",             plan:"12 Clases", pagos:{Enero:950000,Febrero:950000,Marzo:950000,Abril:950000},  asistencia:[{f:"07/04",m:"P"},{f:"09/04",m:"P"},{f:"14/04",m:"I"},{f:"16/04",m:"P"},{f:"22/04",m:""},{f:"24/04",m:"P"},{f:"28/04",m:"I"},{f:"30/04",m:"X"}], foto:null },
  { id:45, pin:"4545", nombre:"Mauro Coche",     iniciales:"MC", estado:"OK",      abonadas:40, realizadas:37, email:"",                               tel:"",             plan:"8 Clases",  pagos:{Enero:650000,Febrero:650000,Marzo:650000,Abril:650000},  asistencia:[{f:"07/04",m:"P"},{f:"09/04",m:"P"},{f:"14/04",m:"P"},{f:"16/04",m:"P"},{f:"22/04",m:""},{f:"24/04",m:"P"},{f:"28/04",m:"P"},{f:"30/04",m:"P"}], foto:null },
  { id:47, pin:"4747", nombre:"Marcos Ibañez",   iniciales:"MI", estado:"OK",      abonadas:14, realizadas:13, email:"",                               tel:"",             plan:"8 Clases",  pagos:{Marzo:650000,Abril:650000},                              asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:"P"},{f:"16/04",m:""},{f:"22/04",m:""},{f:"24/04",m:""},{f:"28/04",m:"P"},{f:"30/04",m:""}], foto:null },
  { id:52, pin:"5252", nombre:"Yanina",          iniciales:"YA", estado:"OK",      abonadas:13, realizadas:10, email:"",                               tel:"",             plan:"8 Clases",  pagos:{Marzo:650000,Abril:650000},                              asistencia:[{f:"07/04",m:""},{f:"09/04",m:""},{f:"14/04",m:""},{f:"16/04",m:""},{f:"22/04",m:""},{f:"24/04",m:""},{f:"28/04",m:""},{f:"30/04",m:""}], foto:null },
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
  const [step, setStep] = useState("current"); // current | new | confirm
  const [pinActual, setPinActual] = useState("");
  const [pinNuevo, setPinNuevo] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const KEYS = [["1","2","3"],["4","5","6"],["7","8","9"],["","0","⌫"]];

  const press = (val, setter, current) => {
    if (val === "⌫") { setter(p => p.slice(0, -1)); setError(""); return; }
    if (current.length >= 4) return;
    const np = current + val;
    setter(np);
    setError("");
  };

  const handleStep1 = () => {
    if (pinActual.length !== 4) return;
    if (pinActual !== currentPin) {
      setError("PIN actual incorrecto");
      setPinActual("");
      return;
    }
    setError("");
    setStep("new");
  };

  const handleStep2 = () => {
    if (pinNuevo.length !== 4) return;
    if (pinNuevo === currentPin) {
      setError("El nuevo PIN no puede ser igual al actual");
      setPinNuevo("");
      return;
    }
    setError("");
    setStep("confirm");
  };

  const handleStep3 = () => {
    if (pinConfirm.length !== 4) return;
    if (pinConfirm !== pinNuevo) {
      setError("Los PIN no coinciden. Intentá de nuevo.");
      setPinConfirm("");
      return;
    }
    onSave(pinNuevo);
    setSuccess(true);
    setTimeout(onClose, 1500);
  };

  const renderKeypad = (value, setter, onComplete) => (
    <div>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: 42, height: 42, borderRadius: 12,
            border: `2px solid ${value.length > i ? B.gold : B.goldBorder}`,
            background: value.length > i ? B.goldBg : "rgba(255,255,255,0.02)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {value.length > i && <div style={{ width: 11, height: 11, borderRadius: "50%", background: B.gold }} />}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {KEYS.map((row, ri) => (
          <div key={ri} style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {row.map((k, ki) => k === "" ? <div key={ki} style={{ flex: 1, maxWidth: 70 }} /> :
              <button key={ki} onClick={() => press(k, setter, value)}
                style={{ flex: 1, maxWidth: 70, height: 48, borderRadius: 12, background: k === "⌫" ? "rgba(255,255,255,0.04)" : `rgba(30,58,95,0.4)`, border: `1px solid ${B.border}`, color: B.text, fontSize: k === "⌫" ? 18 : 20, cursor: "pointer", fontFamily: "monospace" }}>
                {k}
              </button>
            )}
          </div>
        ))}
      </div>
      {value.length === 4 && (
        <button onClick={onComplete} style={{
          width: "100%", marginTop: 16, padding: "10px", borderRadius: 10,
          background: B.gold, color: B.bgDark, border: "none", fontSize: 14,
          fontWeight: 700, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif"
        }}>
          Continuar
        </button>
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
            {step === "current" ? "Por seguridad, verificá tu identidad" : step === "new" ? "Creá un PIN de 4 dígitos" : "Repetí el PIN para confirmar"}
          </div>
        </div>
        {error && <div style={{ textAlign: "center", marginBottom: 12, fontSize: 12, color: "#f87171" }}>{error}</div>}
        {step === "current" && renderKeypad(pinActual, setPinActual, handleStep1)}
        {step === "new" && renderKeypad(pinNuevo, setPinNuevo, handleStep2)}
        {step === "confirm" && renderKeypad(pinConfirm, setPinConfirm, handleStep3)}
        <button onClick={onClose} style={{
          width: "100%", marginTop: 12, padding: "8px", borderRadius: 8,
          background: "transparent", border: `1px solid ${B.border}`, color: B.textSub,
          fontSize: 12, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif"
        }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SHARED: AVATAR EDITOR (alumno)
══════════════════════════════════════════════════════════════ */
function AvatarEditor({ student, onSave, onClose }) {
  const inputRef = useRef(null);
  const MAX_SIZE = 1.5 * 1024 * 1024; // 1.5 MB

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_SIZE) {
      alert("La imagen debe pesar menos de 1.5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      onSave(ev.target.result);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onSave(null);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 300, background: B.bgCard, border: `1px solid ${B.goldBorder}`, borderRadius: 24, padding: "28px 22px 24px", textAlign: "center" }}>
        {/* Preview */}
        <div style={{ marginBottom: 20 }}>
          {student.foto ? (
            <img src={student.foto} alt="Perfil" style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: `3px solid ${B.gold}` }} />
          ) : (
            <div style={{
              width: 100, height: 100, borderRadius: "50%", background: avatarColor(student.nombre),
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `3px solid ${B.gold}`, margin: "0 auto",
              fontSize: 32, fontWeight: 700, color: B.gold
            }}>
              {student.iniciales}
            </div>
          )}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: B.text, marginBottom: 4 }}>Foto de perfil</div>
        <div style={{ fontSize: 11, color: B.textSub, marginBottom: 18 }}>Máx. 1.5 MB · JPG, PNG</div>

        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        <button onClick={() => inputRef.current?.click()} style={{
          width: "100%", padding: "10px", borderRadius: 10, marginBottom: 8,
          background: B.gold, color: B.bgDark, border: "none", fontSize: 14,
          fontWeight: 700, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif"
        }}>
          📷 Subir foto
        </button>

        {student.foto && (
          <button onClick={handleRemove} style={{
            width: "100%", padding: "10px", borderRadius: 10, marginBottom: 8,
            background: B.dangerBg, color: "#f87171", border: `1px solid ${B.dangerBorder}`,
            fontSize: 13, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif"
          }}>
            🗑️ Quitar foto
          </button>
        )}

        <button onClick={onClose} style={{
          width: "100%", padding: "8px", borderRadius: 8,
          background: "transparent", border: `1px solid ${B.border}`, color: B.textSub,
          fontSize: 12, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif"
        }}>
          Cancelar
        </button>
      </div>
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
function AdminDashboard({students,income}){
  const active  = students.filter(s=>s.estado==="OK").length;
  const vencidos= students.filter(s=>s.estado==="VENCIDO").length;
  const totalCl = students.reduce((a,s)=>a+s.realizadas,0);
  const lastMes = income[income.length-1];
  const hoyPres = students.filter(s=>s.asistencia[s.asistencia.length-1]?.m==="P");
  return (
    <div style={{padding:28}}>
      <div style={{marginBottom:22}}>
        <h1 style={{fontSize:24,fontWeight:700,color:B.text,margin:0}}>Dashboard</h1>
        <p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Resumen general · Mayo 2026</p>
      </div>
      <div style={{display:"flex",gap:14,marginBottom:24,flexWrap:"wrap"}}>
        <StatCard label="Alumnos activos"   value={active}            sub={`${vencidos} vencidos`} icon="✅"/>
        <StatCard label="Clases realizadas" value={totalCl}           sub="en el año"              icon="🎾" color="#60a5fa"/>
        <StatCard label="Ingreso último mes"value={fmt(lastMes.total)} sub={lastMes.mes}           icon="💰" color={B.gold}/>
        <StatCard label="Tasa asistencia"   value="82%"               sub="promedio OK"            icon="📈"/>
      </div>
      <div style={{display:"flex",gap:18,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 380px",background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:22}}>
          <div style={{fontSize:14,fontWeight:600,color:B.text,marginBottom:14}}>Ingresos 2026</div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={income}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={B.gold} stopOpacity={0.3}/><stop offset="95%" stopColor={B.gold} stopOpacity={0}/></linearGradient>
                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/><stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={B.border}/>
              <XAxis dataKey="mes" tick={{fill:B.textSub,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tickFormatter={v=>fmt(v)} tick={{fill:B.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v,n)=>[fmtFull(v),n==="profe"?"Profe":"Cancha"]} contentStyle={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:8,color:B.text}}/>
              <Area type="monotone" dataKey="profe"  stroke={B.gold}    fill="url(#gP)" strokeWidth={2}/>
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
                <td style={{padding:"11px 14px"}}>
                  <code style={{fontSize:12,color:B.gold,background:B.goldBg,padding:"2px 8px",borderRadius:4}}>{s.pin}</code>
                </td>
                <td style={{padding:"11px 14px"}}>
                  <span style={{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:20,background:s.estado==="OK"?B.goldBg:B.dangerBg,color:s.estado==="OK"?B.gold:"#f87171",border:`1px solid ${s.estado==="OK"?B.goldBorder:B.dangerBorder}`}}>{s.estado}</span>
                </td>
                <td style={{padding:"11px 14px",fontSize:13,color:B.text}}>{s.abonadas}</td>
                <td style={{padding:"11px 14px",fontSize:13,color:B.text}}>{s.realizadas}</td>
                <td style={{padding:"11px 14px"}}><span style={{fontSize:13,fontWeight:600,color:diff>0?B.gold:diff<0?"#f87171":B.textSub}}>{diff>0?`+${diff}`:diff}</span></td>
                <td style={{padding:"11px 14px",fontSize:12,color:B.textSub}}>{s.plan}</td>
                <td style={{padding:"11px 14px"}}>
                  <button onClick={()=>setResetTarget(s)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${B.warningBorder}`,background:B.warningBg,color:B.warning,fontSize:11,cursor:"pointer",fontWeight:600}}>🔒 Reset</button>
                </td>
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
      <div style={{marginBottom:20}}><h1 style={{fontSize:24,fontWeight:700,color:B.text,margin:0}}>Asistencia</h1><p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Historial completo · Clic en celda para editar</p></div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:"14px 18px",marginBottom:16}}>
        <div style={{fontSize:12,color:B.textSub,marginBottom:10}}>📋 Clase de hoy ({hoy}) — marcar todos como:</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["P","I","X","R"].map(k=>{const s=AT[k];return<button key={k} onClick={()=>markAll(k)} style={{padding:"7px 16px",borderRadius:8,border:`1px solid ${s.border}`,background:s.bg,color:s.text,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Segoe UI',sans-serif"}}>{k} — {s.label}</button>;})}
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
                    {s.foto ? (
                      <img src={s.foto} alt="" style={{width:26,height:26,borderRadius:"50%",objectFit:"cover",border:`1px solid ${B.border}`,flexShrink:0}} />
                    ) : (
                      <div style={{width:26,height:26,background:avatarColor(s.nombre),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:B.gold,flexShrink:0,border:`1px solid ${B.border}`}}>{s.iniciales}</div>
                    )}
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
                <td style={{padding:"9px 12px",textAlign:"center"}}>
                  <span style={{fontSize:12,fontWeight:600,color:pct===null?B.textMuted:pct>=75?B.gold:pct>=50?"#fbbf24":"#f87171"}}>{pct!==null?`${pct}%`:"—"}</span>
                </td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ADMIN — Pagos */
function AdminPagos({payments}){
  const cols=["ene","feb","mar","abr"];
  const labels=["Enero","Febrero","Marzo","Abril"];
  return (
    <div style={{padding:28}}>
      <div style={{marginBottom:20}}><h1 style={{fontSize:24,fontWeight:700,color:B.text,margin:0}}>Pagos</h1><p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Historial de cuotas · 2026</p></div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:`1px solid ${B.border}`}}>
            <th style={{padding:"11px 18px",textAlign:"left",fontSize:11,color:B.textSub,fontWeight:600,textTransform:"uppercase"}}>Alumno</th>
            {labels.map((l,i)=><th key={i} style={{padding:"11px 14px",textAlign:"right",fontSize:11,color:B.textSub,fontWeight:600,textTransform:"uppercase"}}>{l}</th>)}
            <th style={{padding:"11px 14px",textAlign:"right",fontSize:11,color:B.textSub,fontWeight:600,textTransform:"uppercase"}}>Total</th>
          </tr></thead>
          <tbody>
            {payments.map((p,i)=>{
              const total=cols.reduce((a,m)=>a+(p[m]||0),0);
              return <tr key={p.alumno} style={{borderBottom:i<payments.length-1?`1px solid ${B.border}`:"none"}} onMouseEnter={e=>e.currentTarget.style.background=B.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"12px 18px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:28,height:28,background:avatarColor(p.alumno),borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:B.gold,border:`1px solid ${B.border}`}}>{initials(p.alumno)}</div>
                    <span style={{fontSize:13,color:B.text}}>{p.alumno}</span>
                  </div>
                </td>
                {cols.map(m=><td key={m} style={{padding:"12px 14px",textAlign:"right"}}>{p[m]?<span style={{fontSize:12,color:B.gold,fontWeight:500}}>{fmt(p[m])}</span>:<span style={{fontSize:12,color:B.textMuted}}>—</span>}</td>)}
                <td style={{padding:"12px 14px",textAlign:"right"}}><span style={{fontSize:13,fontWeight:700,color:B.text}}>{fmt(total)}</span></td>
              </tr>;
            })}
          </tbody>
          <tfoot><tr style={{borderTop:`1px solid ${B.border}`,background:B.bg}}>
            <td style={{padding:"11px 18px",fontSize:12,fontWeight:700,color:B.textSub}}>TOTALES</td>
            {cols.map(m=>{const t=payments.reduce((a,p)=>a+(p[m]||0),0);return<td key={m} style={{padding:"11px 14px",textAlign:"right",fontSize:12,fontWeight:700,color:B.gold}}>{t?fmt(t):"—"}</td>;})}
            <td style={{padding:"11px 14px",textAlign:"right",fontSize:13,fontWeight:700,color:B.gold}}>{fmt(payments.reduce((a,p)=>a+cols.reduce((b,m)=>b+(p[m]||0),0),0))}</td>
          </tr></tfoot>
        </table>
      </div>
    </div>
  );
}

/* ADMIN — Horarios */
function AdminHorarios(){
  return (
    <div style={{padding:28}}>
      <div style={{marginBottom:20}}><h1 style={{fontSize:24,fontWeight:700,color:B.text,margin:0}}>Horarios</h1><p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Grilla semanal</p></div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,overflow:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:`1px solid ${B.border}`}}>
            <th style={{padding:"11px 18px",textAlign:"left",fontSize:11,color:B.textSub,fontWeight:600,textTransform:"uppercase",width:70}}>Hora</th>
            {DIAS_LABEL.map(d=><th key={d} style={{padding:"11px 12px",textAlign:"center",fontSize:11,color:B.textSub,fontWeight:600,textTransform:"uppercase"}}>{d}</th>)}
          </tr></thead>
          <tbody>
            {SCHEDULE_SLOTS.map((slot,i)=>{
              const hasAny=DIAS_KEYS.some(d=>slot[d]);
              return <tr key={slot.hora} style={{borderBottom:i<SCHEDULE_SLOTS.length-1?`1px solid ${B.border}`:"none",background:hasAny?B.bg:"transparent"}}>
                <td style={{padding:"11px 18px",fontSize:12,color:B.textSub,fontWeight:500}}>{slot.hora}</td>
                {DIAS_KEYS.map(d=>(
                  <td key={d} style={{padding:"6px 6px",textAlign:"center"}}>
                    {slot[d]?<div style={{background:B.goldBg,border:`1px solid ${B.goldBorder}`,borderRadius:8,padding:"7px 8px"}}>
                      <div style={{fontSize:11,fontWeight:600,color:B.gold}}>{slot[d]}</div>
                    </div>:null}
                  </td>
                ))}
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ADMIN — Ingresos */
function AdminIngresos({income}){
  const totalAnual=income.reduce((a,m)=>a+m.total,0);
  const totalProfe=income.reduce((a,m)=>a+m.profe,0);
  const totalCancha=income.reduce((a,m)=>a+m.cancha,0);
  return (
    <div style={{padding:28}}>
      <div style={{marginBottom:20}}><h1 style={{fontSize:24,fontWeight:700,color:B.text,margin:0}}>Ingresos</h1><p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Resumen financiero 2026</p></div>
      <div style={{display:"flex",gap:14,marginBottom:22,flexWrap:"wrap"}}>
        <StatCard label="Total 2026"  value={fmt(totalAnual)}  sub="acumulado"                            icon="💰"/>
        <StatCard label="Parte profe" value={fmt(totalProfe)}  sub={`${Math.round(totalProfe/totalAnual*100)}%`}  icon="🎾"/>
        <StatCard label="Parte cancha"value={fmt(totalCancha)} sub={`${Math.round(totalCancha/totalAnual*100)}%`} icon="🏟️" color="#60a5fa"/>
        <StatCard label="Ahorro 5%"   value={fmt(totalAnual*0.05)} sub="objetivo anual"                  icon="🐖" color="#fbbf24"/>
      </div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:22,marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:600,color:B.text,marginBottom:14}}>Profe vs Cancha por mes</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={income} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={B.border}/>
            <XAxis dataKey="mes" tick={{fill:B.textSub,fontSize:12}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>fmt(v)} tick={{fill:B.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
            <Tooltip formatter={(v,n)=>[fmtFull(v),n==="profe"?"Profe":"Cancha"]} contentStyle={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:8,color:B.text}}/>
            <Bar dataKey="profe"  fill={B.gold}    radius={[4,4,0,0]} name="profe"/>
            <Bar dataKey="cancha" fill="#3b82f6" radius={[4,4,0,0]} name="cancha"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:`1px solid ${B.border}`}}>
            {["Mes","Total","Profe","Cancha","% Profe"].map(h=><th key={h} style={{padding:"11px 18px",textAlign:h==="Mes"?"left":"right",fontSize:11,color:B.textSub,fontWeight:600,textTransform:"uppercase"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {income.map((m,i)=>(
              <tr key={m.mes} style={{borderBottom:i<income.length-1?`1px solid ${B.border}`:"none"}} onMouseEnter={e=>e.currentTarget.style.background=B.bg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"12px 18px",fontSize:13,color:B.text,fontWeight:500}}>{m.mes}</td>
                <td style={{padding:"12px 18px",textAlign:"right",fontSize:13,color:B.text,fontWeight:700}}>{fmtFull(m.total)}</td>
                <td style={{padding:"12px 18px",textAlign:"right",fontSize:13,color:B.gold}}>{fmtFull(m.profe)}</td>
                <td style={{padding:"12px 18px",textAlign:"right",fontSize:13,color:"#60a5fa"}}>{fmtFull(m.cancha)}</td>
                <td style={{padding:"12px 18px",textAlign:"right",fontSize:13,color:B.textSub}}>{Math.round(m.profe/m.total*100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ADMIN — Planes */
function AdminPlanes(){
  return (
    <div style={{padding:28}}>
      <div style={{marginBottom:20}}><h1 style={{fontSize:24,fontWeight:700,color:B.text,margin:0}}>Planes</h1><p style={{color:B.textSub,fontSize:13,margin:"4px 0 0"}}>Precios vigentes</p></div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:24}}>
        {PLANES.map(p=>(
          <div key={p.code} style={{flex:"1 1 180px",background:B.bgCard,border:`1px solid ${p.popular?B.gold:B.border}`,borderRadius:16,padding:24,position:"relative"}}>
            {p.popular&&<div style={{position:"absolute",top:14,right:14,fontSize:10,fontWeight:700,color:B.bgDark,background:B.gold,padding:"2px 9px",borderRadius:20}}>POPULAR</div>}
            <div style={{fontSize:26,fontWeight:800,color:B.gold,marginBottom:3}}>{p.code}</div>
            <div style={{fontSize:17,fontWeight:700,color:B.text,marginBottom:2}}>{p.nombre}</div>
            <div style={{fontSize:12,color:B.textSub,marginBottom:16}}>{p.clases} clase{p.clases>1?"s":""}</div>
            <div style={{borderTop:`1px solid ${B.border}`,paddingTop:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,color:B.textSub}}>Individual</span><span style={{fontSize:15,fontWeight:700,color:B.text}}>{fmtFull(p.individual)}</span></div>
              {p.pareja&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:B.textSub}}>En pareja</span><span style={{fontSize:15,fontWeight:700,color:B.text}}>{fmtFull(p.pareja)}</span></div>}
            </div>
          </div>
        ))}
      </div>
      <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:22}}>
        <div style={{fontSize:14,fontWeight:600,color:B.text,marginBottom:14}}>Tipos de asistencia</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {Object.entries(AT).map(([k,v])=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px",borderRadius:10,background:v.bg,border:`1px solid ${v.border}`,flex:"1 1 130px"}}>
              <span style={{fontSize:20,fontWeight:800,color:v.text}}>{k}</span>
              <span style={{fontSize:13,color:v.text,fontWeight:500}}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ADMIN MODE WRAPPER */
function AdminMode({students,payments,onUpdate,onLogout}){
  const [view,setView]=useState("dashboard");
  return (
    <div style={{display:"flex",height:"100vh",background:B.bg,color:B.text,fontFamily:"'Segoe UI',system-ui,sans-serif",overflow:"hidden"}}>
      <AdminSidebar active={view} onNav={setView} onLogout={onLogout}/>
      <main style={{flex:1,overflowY:"auto"}}>
        {view==="dashboard"  && <AdminDashboard  students={students} income={INCOME_DATA}/>}
        {view==="alumnos"    && <AdminAlumnos    students={students} onUpdate={onUpdate}/>}
        {view==="asistencia" && <AdminAsistencia students={students} onUpdate={onUpdate}/>}
        {view==="pagos"      && <AdminPagos      payments={payments}/>}
        {view==="horarios"   && <AdminHorarios/>}
        {view==="ingresos"   && <AdminIngresos   income={INCOME_DATA}/>}
        {view==="planes"     && <AdminPlanes/>}
      </main>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STUDENT MODE
══════════════════════════════════════════════════════════════ */
function StudentMode({student,onLogout,onUpdate}){
  const [tab,setTab]=useState("cuenta");
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const notes=getNotifications(student);
  const badgeCount=notes.filter(n=>n.type==="danger"||n.type==="warning").length;
  const disp=student.abonadas-student.realizadas;
  const pct=Math.round((student.realizadas/Math.max(student.abonadas,1))*100);
  const presentes=student.asistencia.filter(a=>a.m==="P").length;
  const totalC=student.asistencia.filter(a=>a.m!=="").length;
  const asistPct=totalC?Math.round((presentes/totalC)*100):0;

  const TABS=[
    {id:"cuenta",     label:"Mi Cuenta",  icon:"◈"},
    {id:"avisos",     label:"Avisos",     icon:"🔔", badge:badgeCount},
    {id:"asistencia", label:"Asistencia", icon:"◉"},
    {id:"pagos",      label:"Pagos",      icon:"◇"},
  ];

  const handlePinChange = (nuevoPin) => {
    onUpdate(student.id, s => ({ ...s, pin: nuevoPin }));
  };

  const handleAvatarChange = (fotoData) => {
    onUpdate(student.id, s => ({ ...s, foto: fotoData }));
  };

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(180deg,${B.bgDark} 0%,${B.bg} 100%)`,fontFamily:"'Segoe UI',sans-serif"}}>
      {/* Header */}
      <div style={{background:`rgba(10,20,40,0.95)`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${B.border}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <LogoLR size={34}/>
            <div>
              <div style={{fontSize:10,color:B.gold,letterSpacing:2,textTransform:"uppercase"}}>Academia LR</div>
              <div style={{fontSize:14,fontWeight:700,color:B.text}}>{student.nombre}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",background:student.estado==="OK"?B.goldBg:B.dangerBg,color:student.estado==="OK"?B.gold:"#f87171",border:`1px solid ${student.estado==="OK"?B.goldBorder:B.dangerBorder}`}}>{student.estado}</span>
            <button onClick={onLogout} style={{background:"transparent",border:`1px solid ${B.border}`,borderRadius:8,color:B.textSub,fontSize:12,padding:"5px 10px",cursor:"pointer"}}>Salir</button>
          </div>
        </div>
        <div style={{display:"flex",padding:"0 20px",overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{position:"relative",padding:"9px 16px",background:"transparent",border:"none",borderBottom:`2px solid ${tab===t.id?B.gold:"transparent"}`,color:tab===t.id?B.gold:B.textSub,fontSize:13,fontWeight:tab===t.id?600:400,cursor:"pointer",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>
              {t.icon} {t.label}
              {t.badge>0&&<span style={{position:"absolute",top:5,right:3,width:16,height:16,background:B.danger,borderRadius:"50%",fontSize:9,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {showPinModal && <PinChangeModal currentPin={student.pin} onSave={handlePinChange} onClose={() => setShowPinModal(false)} />}
      {showAvatarModal && <AvatarEditor student={student} onSave={handleAvatarChange} onClose={() => setShowAvatarModal(false)} />}

      <div style={{maxWidth:520,margin:"0 auto",padding:"24px 20px"}}>

        {/* MI CUENTA */}
        {tab==="cuenta"&&(
          <div>
            {/* Avatar + PIN section */}
            <div style={{textAlign:"center",marginBottom:20}}>
              <div onClick={()=>setShowAvatarModal(true)} style={{cursor:"pointer",display:"inline-block",position:"relative"}}>
                {student.foto ? (
                  <img src={student.foto} alt="Perfil" style={{width:90,height:90,borderRadius:"50%",objectFit:"cover",border:`3px solid ${B.gold}`}} />
                ) : (
                  <div style={{width:90,height:90,borderRadius:"50%",background:avatarColor(student.nombre),display:"flex",alignItems:"center",justifyContent:"center",border:`3px solid ${B.gold}`,fontSize:30,fontWeight:700,color:B.gold}}>
                    {student.iniciales}
                  </div>
                )}
                <div style={{position:"absolute",bottom:2,right:2,width:26,height:26,background:B.gold,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>📷</div>
              </div>
              <div style={{marginTop:10,fontSize:13,color:B.textSub}}>
                PIN: <code style={{color:B.gold,background:B.goldBg,padding:"2px 8px",borderRadius:4,fontSize:13}}>{student.pin}</code>
                <button onClick={()=>setShowPinModal(true)} style={{marginLeft:8,background:"transparent",border:"none",color:B.gold,cursor:"pointer",fontSize:12,textDecoration:"underline"}}>Cambiar</button>
              </div>
            </div>

            <div style={{background:B.goldBg,border:`1px solid ${B.goldBorder}`,borderRadius:16,padding:20,marginBottom:16}}>
              <div style={{fontSize:10,color:B.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>Tu plan · {student.plan}</div>
              <div style={{display:"flex",justifyContent:"space-around",marginBottom:20}}>
                {[{n:student.abonadas,l:"Abonadas",c:B.text},{n:student.realizadas,l:"Realizadas",c:B.gold},{n:disp,l:"Disponibles",c:disp<=2?"#fbbf24":"#60a5fa"}].map(({n,l,c})=>(
                  <div key={l} style={{textAlign:"center"}}>
                    <div style={{fontSize:40,fontWeight:700,color:c,lineHeight:1}}>{n}</div>
                    <div style={{fontSize:10,color:B.textSub,letterSpacing:1,textTransform:"uppercase",marginTop:4}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"rgba(255,255,255,0.08)",borderRadius:100,height:7,overflow:"hidden",marginBottom:5}}>
                <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:`linear-gradient(90deg,${B.gold},${B.goldLight})`,borderRadius:100}}/>
              </div>
              <div style={{fontSize:11,color:B.textSub,textAlign:"right"}}>{pct}% utilizado</div>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              {[{l:"Asistencia",v:`${asistPct}%`,i:"📊",c:asistPct>=75?B.gold:asistPct>=50?"#fbbf24":"#f87171"},{l:"Presentes",v:presentes,i:"✅",c:B.gold},{l:"Plan",v:student.plan.split(" ")[0],i:"📋",c:"#60a5fa"}].map(({l,v,i,c})=>(
                <div key={l} style={{flex:1,background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:"13px 10px",textAlign:"center"}}>
                  <div style={{fontSize:18,marginBottom:4}}>{i}</div>
                  <div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div>
                  <div style={{fontSize:10,color:B.textSub,letterSpacing:1,textTransform:"uppercase",marginTop:4}}>{l}</div>
                </div>
              ))}
            </div>
            {(student.email||student.tel)&&(
              <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:"14px 16px"}}>
                <div style={{fontSize:10,color:B.textSub,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Mis datos</div>
                {student.email&&<div style={{fontSize:13,color:B.textSub,marginBottom:4}}>📧 {student.email}</div>}
                {student.tel&&<div style={{fontSize:13,color:B.textSub}}>📱 {student.tel}</div>}
              </div>
            )}
          </div>
        )}

        {/* AVISOS */}
        {tab==="avisos"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {notes.map((n,i)=>{const s=NOTE_STYLE[n.type];return(
              <div key={i} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:16,padding:"18px 20px",display:"flex",gap:14}}>
                <span style={{fontSize:26,flexShrink:0}}>{n.icon}</span>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:s.text,marginBottom:6}}>{n.title}</div>
                  <div style={{fontSize:13,color:B.textSub,lineHeight:1.6}}>{n.body}</div>
                </div>
              </div>
            );})}
            <div style={{background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:"12px 16px",fontSize:11,color:B.textSub,lineHeight:1.6}}>
              ℹ️ Los avisos se generan automáticamente según tu estado de cuenta y asistencia.
            </div>
          </div>
        )}

        {/* ASISTENCIA */}
        {tab==="asistencia"&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {["P","I","X","R"].map(k=>{const s=AT[k];const n=student.asistencia.filter(a=>a.m===k).length;return(
                <div key={k} style={{flex:"1 1 80px",padding:"12px 10px",borderRadius:12,background:s.bg,border:`1px solid ${s.border}`,textAlign:"center"}}>
                  <div style={{fontSize:26,fontWeight:700,color:s.text}}>{n}</div>
                  <div style={{fontSize:10,color:s.text,opacity:0.8,letterSpacing:1,textTransform:"uppercase",marginTop:3}}>{s.label}</div>
                </div>
              );})}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {student.asistencia.map(({f,m},i)=>{const s=AT[m];return(
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:s?`${s.bg}88`:B.bgCard,border:`1px solid ${s?s.border+"55":B.border}`,borderRadius:12,padding:"13px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{fontSize:12,color:B.textSub,minWidth:50}}>{f}</div>
                    <div style={{width:1,height:18,background:B.border}}/>
                    <div style={{fontSize:13,color:s?s.text:B.textMuted}}>{s?s.label:"Sin clase registrada"}</div>
                  </div>
                  {s&&<div style={{width:30,height:30,borderRadius:8,background:s.bg,border:`1px solid ${s.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:s.text,fontWeight:700}}>{s.icon}</div>}
                </div>
              );})}
            </div>
          </div>
        )}

        {/* PAGOS */}
        {tab==="pagos"&&(
          <div>
            {Object.keys(student.pagos).length>0?(
              <>
                <div style={{background:B.goldBg,border:`1px solid ${B.goldBorder}`,borderRadius:18,padding:"20px 24px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:10,color:B.gold,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Total abonado 2026</div>
                    <div style={{fontSize:30,fontWeight:700,color:B.text}}>{fmtFull(Object.values(student.pagos).reduce((a,v)=>a+v,0))}</div>
                  </div>
                  <span style={{fontSize:36}}>💰</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {Object.entries(student.pagos).map(([mes,monto])=>(
                    <div key={mes} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:B.bgCard,border:`1px solid ${B.border}`,borderRadius:12,padding:"13px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:32,height:32,borderRadius:10,background:B.goldBg,border:`1px solid ${B.goldBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>📅</div>
                        <div>
                          <div style={{fontSize:14,color:B.text}}>{mes}</div>
                          <div style={{fontSize:10,color:B.gold,letterSpacing:1,textTransform:"uppercase"}}>PAGADO</div>
                        </div>
                      </div>
                      <div style={{fontSize:15,fontWeight:700,color:B.gold}}>{fmtFull(monto)}</div>
                    </div>
                  ))}
                </div>
              </>
            ):(
              <div style={{background:B.dangerBg,border:`1px solid ${B.dangerBorder}`,borderRadius:16,padding:32,textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:12}}>📋</div>
                <div style={{fontSize:15,color:"#f87171"}}>Sin pagos registrados</div>
                <div style={{fontSize:13,color:B.textSub,marginTop:6}}>Consultá con tu profe.</div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════════ */
export default function App() {
  const [students,setStudents]=useState(INITIAL_STUDENTS);
  const [payments]=useState(INITIAL_PAYMENTS);
  const [mode,setMode]=useState(null);
  const [currentStudentId,setCurrentStudentId]=useState(null);
  const [loginError,setLoginError]=useState("");

  const handleLogin=(pin)=>{
    if(pin===PROFE_PIN){ setMode("admin"); return true; }
    const found=students.find(s=>s.pin===pin);
    if(found){ setCurrentStudentId(found.id); setMode("student"); return true; }
    return false;
  };
  const handleLogout=()=>{ setMode(null); setCurrentStudentId(null); setLoginError(""); };
  const updateStudent=(id,updater)=>{ setStudents(prev=>prev.map(s=>s.id===id?updater(s):s)); };
  const currentStudent=students.find(s=>s.id===currentStudentId)||null;

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${B.bg};}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:${B.bgDark};}
        ::-webkit-scrollbar-thumb{background:${B.border};border-radius:3px;}
        input::placeholder{color:${B.textMuted};}
        button:focus{outline:none;}
        select:focus{outline:none;}
      `}</style>
      {mode===null      && <PinPad     onSubmit={handleLogin} error={loginError} setError={setLoginError}/>}
      {mode==="admin"   && <AdminMode  students={students} payments={payments} onUpdate={updateStudent} onLogout={handleLogout}/>}
      {mode==="student" && currentStudent && <StudentMode student={currentStudent} onLogout={handleLogout} onUpdate={updateStudent}/>}
    </>
  );
}
