/* ══════════════════════════════════════════════════════════════
   tokens-data.js — Colores, constantes, datos y helpers
   Academia LR
══════════════════════════════════════════════════════════════ */

/* ──────────── BRAND TOKENS ──────────── */
export const B = {
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
  libre:        "#1e3a5f",
  libreBg:      "rgba(255,255,255,0.02)",
};

/* ──────────── CONSTANTES ──────────── */
export const PROFE_PIN = "9999";

export const AT = {
  P:{ bg:"#052e16", border:"#16a34a", text:"#4ade80", label:"Presente",      icon:"✓" },
  I:{ bg:"#450a0a", border:"#dc2626", text:"#f87171", label:"Injustificada", icon:"✗" },
  X:{ bg:"#422006", border:"#d97706", text:"#fbbf24", label:"A reprogramar", icon:"↺" },
  R:{ bg:"#172554", border:"#2563eb", text:"#60a5fa", label:"Recuperada",    icon:"↩" },
};

export const NOTE_STYLE = {
  danger:  { bg:B.dangerBg,  border:B.dangerBorder,  text:"#f87171" },
  warning: { bg:B.warningBg, border:B.warningBorder, text:"#fbbf24" },
  info:    { bg:B.infoBg,    border:B.infoBorder,    text:"#93c5fd" },
  ok:      { bg:B.goldBg,    border:B.goldBorder,    text:B.gold    },
};

export const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
export const DIAS_KEYS  = ["lunes","martes","miercoles","jueves","viernes","sabado"];
export const DIAS_LABEL = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
export const RECENT_DATES = ["07/04","09/04","14/04","16/04","22/04","24/04","28/04","30/04"];

/* ──────────── DATOS INICIALES ──────────── */
export const INCOME_DATA = [
  { mes:"Ene", total:6150000,  profe:4305000,  cancha:1845000 },
  { mes:"Feb", total:12265000, profe:8585500,  cancha:3679500 },
  { mes:"Mar", total:13465000, profe:9425500,  cancha:4039500 },
  { mes:"Abr", total:14850000, profe:10395000, cancha:4455000 },
  { mes:"May", total:930000,   profe:651000,   cancha:279000  },
];

export const PLANES = [
  { code:"U", nombre:"Clase Única", clases:1,  individual:100000,  pareja:150000  },
  { code:"C", nombre:"4 Clases",   clases:4,  individual:380000,  pareja:600000  },
  { code:"O", nombre:"8 Clases",   clases:8,  individual:650000,  pareja:1100000, popular:true },
  { code:"D", nombre:"12 Clases",  clases:12, individual:950000,  pareja:1440000 },
];

export const INITIAL_SCHEDULE = [
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

export const INITIAL_STUDENTS = [
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

export const INITIAL_PAYMENTS = [
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

/* ──────────── HELPERS ──────────── */
export const fmt = (n) => n >= 1000000 ? `₲${(n/1000000).toFixed(1)}M` : `₲${(n/1000).toFixed(0)}K`;
export const fmtFull = (n) => "₲ " + new Intl.NumberFormat("es").format(n);
export const initials = (name) => name.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();

export const avatarColor = (name) => {
  const cols = ["#1d3a6e","#2d1b4e","#1a3a2e","#3a1a2a","#1a2a3a","#2a3a1a","#3a2a1a"];
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return cols[Math.abs(h) % cols.length];
};

export const getNotifications = (s) => {
  const notes = [];
  const disp = s.abonadas - s.realizadas;
  const recup = s.asistencia.filter(a => a.m === "X").length;
  const ausen = s.asistencia.filter(a => a.m === "I").length;
  if (s.estado === "VENCIDO")        notes.push({ type:"danger",  icon:"🚨", title:"Paquete vencido",        body:"Tu paquete se agotó. Hablá con el profe para renovar." });
  else if (disp <= 2 && disp > 0)    notes.push({ type:"warning", icon:"⚠️", title:"Paquete por vencer",     body:`Solo te quedan ${disp} clase${disp>1?"s":""} disponible${disp>1?"s":""}. ¡Renová pronto!` });
  else if (disp > 0)                 notes.push({ type:"ok",      icon:"🎾", title:"Clases disponibles",      body:`Tenés ${disp} clases para usar. ¡A entrenar!` });
  if (recup > 0)                     notes.push({ type:"warning", icon:"📅", title:`${recup} clase${recup>1?"s":""} a reprogramar`, body:"Coordiná con el profe para recuperar tus clases pendientes." });
  if (ausen >= 2)                    notes.push({ type:"danger",  icon:"❗", title:"Ausencias injustificadas", body:`Tuviste ${ausen} ausencias sin aviso. Recordá avisar si no podés asistir.` });
  if (notes.length === 0)            notes.push({ type:"ok",      icon:"✅", title:"Todo en orden",           body:"Tu cuenta está al día. ¡Seguí así!" });
  return notes;
};

export const detectarPlan = (monto) => {
  const matches = [];
  for (const p of PLANES) {
    if (monto === p.individual) matches.push({ plan: p, tipo: "individual", clases: p.clases });
    if (p.pareja && monto === p.pareja) matches.push({ plan: p, tipo: "pareja", clases: p.clases });
  }
  return matches.length > 0 ? matches[0] : null;
};

export const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const capacidadMax = (tipo) => tipo === "individual" ? 1 : 4;

export const puedeCancelar = (fechaStr, horaStr) => {
  const [d, m] = fechaStr.split("/").map(Number);
  const [h, min] = horaStr.split(":").map(Number);
  const fechaClase = new Date(2026, m - 1, d, h, min || 0, 0);
  const ahora = new Date();
  const diffMs = fechaClase.getTime() - ahora.getTime();
  const diffHoras = diffMs / (1000 * 60 * 60);
  return diffHoras > 6;
};
