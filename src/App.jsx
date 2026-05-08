import { useState, useMemo, useEffect, useRef } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CULTURAS = ["Soja","Sorgo","Trigo","Milho","Feijão"];
const CULTURA_COLORS = { Soja:"#e8c84a",Sorgo:"#d4763a",Trigo:"#c8a830",Milho:"#f0d050",Feijão:"#b86840" };
const CULTURA_GRAD   = { Soja:["#f0d060","#8a6010"],Sorgo:["#e08040","#702010"],Trigo:["#d4b840","#806010"],Milho:["#f8e060","#a07010"],Feijão:["#c87848","#602010"] };
const FAZENDAS = ["Fazenda Cercadinho JHS","Fazenda Takaoka JHS","Fazenda Dois Irmãos JHS","Fazenda Amália JHS"];
const PIVOS    = ["Sequeiro",...Array.from({length:35},(_,i)=>`Pivô ${String(i+1).padStart(2,"0")}`)];
const MESES_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

let nextId = 20;
const INIT = [
  {id:1,data:"2025-01-10",fazenda:"Fazenda Cercadinho JHS",pivo:"Pivô 01",cultura:"Soja",hectares:80},
  {id:2,data:"2025-01-18",fazenda:"Fazenda Takaoka JHS",pivo:"Sequeiro",cultura:"Milho",hectares:55},
  {id:3,data:"2025-02-05",fazenda:"Fazenda Dois Irmãos JHS",pivo:"Pivô 03",cultura:"Trigo",hectares:40},
  {id:4,data:"2025-03-12",fazenda:"Fazenda Amália JHS",pivo:"Pivô 02",cultura:"Soja",hectares:90},
  {id:5,data:"2025-04-08",fazenda:"Fazenda Cercadinho JHS",pivo:"Pivô 02",cultura:"Feijão",hectares:35},
  {id:6,data:"2025-05-20",fazenda:"Fazenda Takaoka JHS",pivo:"Pivô 01",cultura:"Soja",hectares:120},
  {id:7,data:"2025-06-15",fazenda:"Fazenda Dois Irmãos JHS",pivo:"Sequeiro",cultura:"Milho",hectares:60},
  {id:8,data:"2025-07-22",fazenda:"Fazenda Amália JHS",pivo:"Pivô 03",cultura:"Trigo",hectares:45},
  {id:9,data:"2025-08-10",fazenda:"Fazenda Cercadinho JHS",pivo:"Pivô 04",cultura:"Sorgo",hectares:70},
  {id:10,data:"2025-09-05",fazenda:"Fazenda Takaoka JHS",pivo:"Pivô 02",cultura:"Soja",hectares:95},
  {id:11,data:"2025-10-18",fazenda:"Fazenda Dois Irmãos JHS",pivo:"Pivô 01",cultura:"Feijão",hectares:28},
  {id:12,data:"2025-11-30",fazenda:"Fazenda Amália JHS",pivo:"Sequeiro",cultura:"Milho",hectares:88},
  {id:13,data:"2026-01-08",fazenda:"Fazenda Cercadinho JHS",pivo:"Pivô 01",cultura:"Soja",hectares:75},
  {id:14,data:"2026-01-22",fazenda:"Fazenda Takaoka JHS",pivo:"Pivô 03",cultura:"Milho",hectares:48},
  {id:15,data:"2026-02-14",fazenda:"Fazenda Takaoka JHS",pivo:"Sequeiro",cultura:"Feijão",hectares:30},
  {id:16,data:"2026-02-28",fazenda:"Fazenda Dois Irmãos JHS",pivo:"Pivô 02",cultura:"Soja",hectares:110},
  {id:17,data:"2026-03-10",fazenda:"Fazenda Amália JHS",pivo:"Pivô 05",cultura:"Milho",hectares:65},
  {id:18,data:"2026-03-25",fazenda:"Fazenda Cercadinho JHS",pivo:"Pivô 02",cultura:"Trigo",hectares:52},
  {id:19,data:"2026-04-12",fazenda:"Fazenda Amália JHS",pivo:"Pivô 01",cultura:"Soja",hectares:88},
];

const fmt      = d => { const [y,m,dia]=d.split("-"); return `${dia}/${m}/${y}`; };
const fmtShort = d => { const [,m,dia]=d.split("-"); return `${dia}/${MESES_PT[parseInt(m)-1]}`; };
const anoOf    = d => parseInt(d.split("-")[0]);
const mesOf    = d => parseInt(d.split("-")[1])-1;
const nomeFaz  = f => f.replace(" JHS","");

// ─── REAL PHOTO IMAGES ───────────────────────────────────────────────────────
// All images from Wikimedia Commons (public domain / CC)
const FOTO_URLS = {
  Soja:      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Soybean_and_pod.jpg/320px-Soybean_and_pod.jpg",
  Milho:     "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/1px-Camponotus_flavomarginatus_ant.jpg",
  Trigo:     "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/WheatField.jpg/320px-WheatField.jpg",
  Sorgo:     "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Sorghum_bicolor_cropped.jpg/240px-Sorghum_bicolor_cropped.jpg",
  Feijão:    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Feijão.jpg/320px-Feijão.jpg",
  Milho2:    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Corncobs_in_field.jpg/320px-Corncobs_in_field.jpg",
  Harvester: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Combine_harvester.jpg/320px-Combine_harvester.jpg",
};

// Better direct CDN URLs (Unsplash free-to-use)
const CULTURA_FOTOS = {
  Soja:    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop&auto=format",
  Milho:   "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&h=200&fit=crop&auto=format",
  Trigo:   "https://images.unsplash.com/photo-1535912559178-39d03ec94d40?w=200&h=200&fit=crop&auto=format",
  Sorgo:   "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Sorghum_bicolor_cropped.jpg/240px-Sorghum_bicolor_cropped.jpg",
  Feijão:  "https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=200&h=200&fit=crop&auto=format",
};

const HARVESTER_FOTO = "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=200&fit=crop&auto=format";
const FIELD_FOTO     = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=300&fit=crop&auto=format";

function CultImg({cultura, size=28, radius=8, style:s={}}) {
  const [err,setErr] = useState(false);
  const fallback = {Soja:"🌱",Milho:"🌽",Trigo:"🌾",Sorgo:"🌾",Feijão:"🫘"};

  // Sorgo: SVG distinto do trigo
  if(cultura === "Sorgo") return (
    <div style={{width:size,height:size,borderRadius:radius,background:"linear-gradient(145deg,#3a1a08,#1a0a04)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,...s}}>
      <svg width={size*0.75} height={size*0.75} viewBox="0 0 48 48" fill="none">
        <line x1="24" y1="46" x2="24" y2="20" stroke="#8a5020" strokeWidth="2.5"/>
        <ellipse cx="24" cy="13" rx="10" ry="13" fill="#8b1a1a" opacity="0.95"/>
        <ellipse cx="24" cy="11" rx="8" ry="11" fill="#a82020"/>
        {[6,8,10,12,14,16,18,20].map((y,i)=>(
          <circle key={i} cx={17+Math.sin(i*1.1)*6} cy={y} r="2" fill="#cc3030" opacity="0.9"/>
        ))}
        {[6,8,10,12,14,16,18,20].map((y,i)=>(
          <circle key={i+8} cx={24+Math.cos(i*0.9)*5} cy={y} r="2" fill="#b82828" opacity="0.95"/>
        ))}
        {[7,9,11,13,15,17,19].map((y,i)=>(
          <circle key={i+16} cx={29+Math.sin(i*1.3)*4} cy={y} r="1.8" fill="#d43030" opacity="0.85"/>
        ))}
        <path d="M18 20 C14 22 12 30 14 38" stroke="#5a2808" strokeWidth="1.5" fill="none"/>
        <path d="M30 20 C34 23 34 32 32 38" stroke="#5a2808" strokeWidth="1.5" fill="none"/>
      </svg>
    </div>
  );

  // Milho: emoji original
  if(cultura === "Milho") return (
    <div style={{width:size,height:size,borderRadius:radius,background:"linear-gradient(145deg,#1a1608,#0a0c02)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,...s}}>
      <span style={{fontSize:size*0.62,lineHeight:1,userSelect:"none"}}>🌽</span>
    </div>
  );

  // Feijão: emoji original
  if(cultura === "Feijão") return (
    <div style={{width:size,height:size,borderRadius:radius,background:"linear-gradient(145deg,#1a0e08,#0a0602)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,...s}}>
      <span style={{fontSize:size*0.62,lineHeight:1,userSelect:"none"}}>🫘</span>
    </div>
  );

  // Soja: PNG hospedado no repositório
  if(cultura === "Soja") return (
    <div style={{width:size,height:size,borderRadius:radius,background:"linear-gradient(145deg,#0e1e08,#060e04)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,...s}}>
      <img src="/soja.png" alt="Soja" style={{width:size*0.95,height:size*0.95,objectFit:"contain",display:"block"}}/>
    </div>
  );

  // Milho: emoji original
  if(cultura === "Milho") return (
    <div style={{width:size,height:size,borderRadius:radius,background:"linear-gradient(145deg,#1a1608,#0a0c02)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,...s}}>
      <span style={{fontSize:size*0.62,lineHeight:1,userSelect:"none"}}>🌽</span>
    </div>
  );

  // Feijão: emoji original
  if(cultura === "Feijão") return (
    <div style={{width:size,height:size,borderRadius:radius,background:"linear-gradient(145deg,#1a0e08,#0a0602)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,...s}}>
      <span style={{fontSize:size*0.62,lineHeight:1,userSelect:"none"}}>🫘</span>
    </div>
  );

  // Soja: imagem exata com fundo removido, embutida em base64
  if(cultura === "Soja") return (
    <div style={{
      width:size, height:size, borderRadius:radius,
      background:"linear-gradient(145deg,#0e1e08,#060e04)",
      display:"flex", alignItems:"center", justifyContent:"center",
      overflow:"hidden", flexShrink:0, ...s,
    }}>
      <img
        src={}
        alt="Soja"
        style={{
          width:size*0.95, height:size*0.95,
          objectFit:"contain",
          display:"block",
        }}
      />
    </div>
  );

  if(err) return <span style={{fontSize:size*0.8,lineHeight:1}}>{fallback[cultura]}</span>;
  return (
    <img
      src={CULTURA_FOTOS[cultura]}
      alt={cultura}
      onError={()=>setErr(true)}
      style={{width:size,height:size,borderRadius:radius,objectFit:"cover",display:"block",...s}}
    />
  );
}

function HarvesterImg({size=32, style:s={}}) {
  const [err,setErr] = useState(false);
  if(err) return <span style={{fontSize:size*0.6}}>🚜</span>;
  return (
    <img
      src={HARVESTER_FOTO}
      alt="Colheitadeira"
      onError={()=>setErr(true)}
      style={{width:size,height:size*0.6,objectFit:"cover",borderRadius:6,display:"block",...s}}
    />
  );
}

function FieldBg({style:s={}}) {
  const [err,setErr] = useState(false);
  if(err) return null;
  return (
    <img
      src={FIELD_FOTO}
      alt=""
      onError={()=>setErr(true)}
      style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.12,pointerEvents:"none",...s}}
    />
  );
}

// Keep SVG helpers for UI icons (not crop images)
const Icons = {
  // Tractor / Farm icon
  Farm: ({size=28,color="#6ab04a"}) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="20" width="24" height="16" rx="2" fill={color} opacity="0.9"/>
      <rect x="6" y="14" width="14" height="10" rx="2" fill={color}/>
      <rect x="8" y="16" width="5" height="6" rx="1" fill="#1a3a0a" opacity="0.7"/>
      <rect x="14" y="16" width="5" height="6" rx="1" fill="#1a3a0a" opacity="0.5"/>
      <circle cx="10" cy="36" r="7" fill="#1a1a0a" stroke="#2a3a1a" strokeWidth="1.5"/>
      <circle cx="10" cy="36" r="3.5" fill="#2a2a1a"/>
      <circle cx="10" cy="36" r="1.5" fill={color}/>
      <circle cx="30" cy="36" r="5" fill="#1a1a0a" stroke="#2a3a1a" strokeWidth="1.5"/>
      <circle cx="30" cy="36" r="2.5" fill="#2a2a1a"/>
      <circle cx="30" cy="36" r="1" fill={color}/>
      <rect x="28" y="22" width="14" height="4" rx="1" fill={color} opacity="0.7"/>
      <rect x="38" y="18" width="4" height="4" rx="1" fill={color} opacity="0.5"/>
    </svg>
  ),
  // Dashboard / chart icon
  Dashboard: ({size=22,active=false}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="13" width="5" height="8" rx="1" fill={active?"#e8c84a":"#3a5a2a"}/>
      <rect x="10" y="8" width="5" height="13" rx="1" fill={active?"#e8c84a":"#3a5a2a"}/>
      <rect x="17" y="3" width="5" height="18" rx="1" fill={active?"#e8c84a":"#2a4a1a"}/>
      <path d="M3 16 L8 11 L13 14 L21 6" stroke={active?"#f0d060":"#4a6a3a"} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  // Plus / register icon
  Plus: ({size=22,active=false}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={active?"#e8c84a":"#3a5a2a"} strokeWidth="1.5"/>
      <line x1="12" y1="7" x2="12" y2="17" stroke={active?"#f0d060":"#4a6a3a"} strokeWidth="2" strokeLinecap="round"/>
      <line x1="7" y1="12" x2="17" y2="12" stroke={active?"#f0d060":"#4a6a3a"} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  // History / list icon
  History: ({size=22,active=false}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M3 12h14M3 18h10" stroke={active?"#e8c84a":"#3a5a2a"} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="19" cy="16" r="4" fill="none" stroke={active?"#f0d060":"#4a6a3a"} strokeWidth="1.5"/>
      <path d="M19 14v2l1 1" stroke={active?"#f0d060":"#4a6a3a"} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  // Summary / pie icon
  Resumo: ({size=22,active=false}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3 A9 9 0 0 1 21 12 L12 12 Z" fill={active?"#e8c84a":"#3a5a2a"}/>
      <path d="M12 12 L21 12 A9 9 0 1 1 12 3" fill={active?"#c8a830":"#2a4a1a"} opacity="0.7"/>
      <circle cx="12" cy="12" r="4" fill="#080e06"/>
    </svg>
  ),
  // Weather / sun
  Sun: ({size=18}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" fill="#f0d050" stroke="#e8c040" strokeWidth="1"/>
      {[0,45,90,135,180,225,270,315].map((deg,i)=>{
        const rad=deg*Math.PI/180;
        return <line key={i} x1={12+8*Math.cos(rad)} y1={12+8*Math.sin(rad)} x2={12+10*Math.cos(rad)} y2={12+10*Math.sin(rad)} stroke="#f0d050" strokeWidth="1.5" strokeLinecap="round"/>;
      })}
    </svg>
  ),
  // Location pin
  Pin: ({size=14,color="#6ab04a"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={color} opacity="0.9"/>
      <circle cx="12" cy="9" r="2.5" fill="#0a1808"/>
    </svg>
  ),
  // Medal / trophy
  Medal: ({size=24}) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="28" r="14" fill="#c8a830" stroke="#e8c840" strokeWidth="1.5"/>
      <circle cx="24" cy="28" r="10" fill="#e8c840"/>
      <circle cx="24" cy="28" r="7" fill="#f8d840" opacity="0.6"/>
      <path d="M24 22 L25.5 26.5 H30 L26.5 29 L28 33.5 L24 31 L20 33.5 L21.5 29 L18 26.5 H22.5 Z" fill="#a07010"/>
      <path d="M16 14 L8 4 H20 L24 10 L28 4 H40 L32 14" fill="#c8a830"/>
      <path d="M16 14 L20 10 L24 14 L28 10 L32 14" fill="#e8c840"/>
    </svg>
  ),
  // Wheat field landscape
  Field: ({size=40}) => (
    <svg width={size} height={size*0.6} viewBox="0 0 120 72" fill="none">
      <rect width="120" height="72" fill="#1a3a08"/>
      <rect x="0" y="45" width="120" height="27" fill="#2a5010"/>
      {[0,10,20,30,40,50,60,70,80,90,100,110].map((x,i)=>(
        <g key={i}>
          <line x1={x+5} y1="72" x2={x+5} y2="38" stroke="#4a8020" strokeWidth="2"/>
          <ellipse cx={x+5} cy="36" rx="3" ry="6" fill="#8ab030" opacity="0.8"/>
          <line x1={x+5} y1="50" x2={x+9} y2="45" stroke="#4a8020" strokeWidth="1"/>
          <line x1={x+5} y1="44" x2={x+1} y2="40" stroke="#4a8020" strokeWidth="1"/>
        </g>
      ))}
      <rect x="0" y="55" width="120" height="2" fill="#f0d040" opacity="0.15"/>
      <rect x="0" y="62" width="120" height="2" fill="#f0d040" opacity="0.1"/>
      <rect x="60" y="0" width="60" height="45" fill="#0a2006" opacity="0.3"/>
      <circle cx="95" cy="12" r="8" fill="#f0d040" opacity="0.15"/>
    </svg>
  ),
  // Checkmark
  Check: ({size=16,color="#6ab04a"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 12L10 17L19 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  // Chevron
  Chevron: ({size=14,dir="down",color="#4a7a3a"}) => {
    const paths = {down:"M6 9l6 6 6-6",up:"M18 15l-6-6-6 6",right:"M9 6l6 6-6 6",left:"M15 6l-6 6 6 6"};
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d={paths[dir]} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  },
  // Trash
  Trash: ({size=14}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#aa5a5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="10" y1="11" x2="10" y2="17" stroke="#aa5a5a" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="11" x2="14" y2="17" stroke="#aa5a5a" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  // Edit pencil
  Edit: ({size=14}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#6a9a5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#6a9a5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  // Search
  Search: ({size=16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="#4a7a3a" strokeWidth="1.5"/>
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#4a7a3a" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  // Water drop (pivô)
  Drop: ({size=18,color="#5ab0d0"}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 5 9 5 14a7 7 0 0014 0c0-5-7-12-7-12z" fill={color} opacity="0.8"/>
      <path d="M9 15a3 3 0 006 0" stroke="white" strokeWidth="1" opacity="0.5" fill="none"/>
    </svg>
  ),
  // Calendar
  Cal: ({size=16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="#4a7a3a" strokeWidth="1.5" fill="none"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke="#4a7a3a" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="2" x2="8" y2="6" stroke="#4a7a3a" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="10" x2="21" y2="10" stroke="#4a7a3a" strokeWidth="1"/>
      <rect x="7" y="14" width="3" height="3" rx="0.5" fill="#6a9a5a"/>
      <rect x="14" y="14" width="3" height="3" rx="0.5" fill="#6a9a5a" opacity="0.6"/>
    </svg>
  ),
};

const CulturaIcon = ({cultura, size=28, radius=8}) => (
  <CultImg cultura={cultura} size={size} radius={radius}/>
);

// ─── ANIMATED NUMBER ──────────────────────────────────────────────────────────
function AnimNum({value, style:s={}}) {
  const [disp,setDisp]=useState(0);
  const ref=useRef(0);
  useEffect(()=>{
    const start=ref.current,end=value,dur=900;
    const t0=performance.now();
    const step=now=>{
      const p=Math.min((now-t0)/dur,1);
      const ease=1-Math.pow(1-p,3);
      const cur=Math.round(start+(end-start)*ease);
      setDisp(cur); ref.current=cur;
      if(p<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },[value]);
  return <span style={s}>{disp.toLocaleString("pt-BR")}</span>;
}

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
function Sparkline({values,color="#e8c84a",height=36,width=90}) {
  if(!values||values.length<2) return null;
  const max=Math.max(...values,1);
  const pts=values.map((v,i)=>{
    const x=(i/(values.length-1))*width;
    const y=height-(v/max)*(height-4)-2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{overflow:"visible"}}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={`0,${height} ${pts} ${width},${height}`} fill="url(#sparkGrad)" stroke="none"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      {values.length>0 && (()=>{
        const lastX=(values.length-1)/(values.length-1)*width;
        const lastY=height-(values[values.length-1]/max)*(height-4)-2;
        return <circle cx={lastX} cy={lastY} r="3" fill={color} stroke="#0d1808" strokeWidth="1"/>;
      })()}
    </svg>
  );
}

// ─── DONUT ────────────────────────────────────────────────────────────────────
function Donut({data,size=100}) {
  const r=36,cx=size/2,cy=size/2,circ=2*Math.PI*r;
  const total=data.reduce((s,d)=>s+d.value,0)||1;
  let offset=0;
  const gap=1.5;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2a10" strokeWidth="10"/>
      {data.map((d,i)=>{
        const dash=Math.max(0,(d.value/total)*circ-gap);
        const el=(
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={d.color} strokeWidth="10"
            strokeDasharray={`${dash} ${circ-dash}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            filter={i===0?"url(#glow)":undefined}
          />
        );
        offset+=(d.value/total)*circ;
        return el;
      })}
    </svg>
  );
}

// ─── BAR CHART ────────────────────────────────────────────────────────────────
function BarChart({data,height=60}) {
  const max=Math.max(...data.map(d=>d.v),1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:3,height:height+14}}>
      {data.map((d,i)=>{
        const h=d.v>0?(d.v/max)*(height-4):0;
        const isActive=d.active;
        return (
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <div style={{position:"relative",width:"100%",display:"flex",justifyContent:"center"}}>
              <div style={{
                width:"80%",borderRadius:"3px 3px 0 0",
                background:d.v>0
                  ? isActive
                    ? "linear-gradient(180deg,#f8e060,#c89020)"
                    : "linear-gradient(180deg,#a8882a,#6a5010)"
                  : "#1a2a10",
                height:h||2,
                boxShadow:isActive?"0 0 8px #e8c84a66":"none",
                transition:"height 0.7s cubic-bezier(0.34,1.56,0.64,1)",
              }}/>
            </div>
            <span style={{fontSize:7,color:isActive?"#c8a830":"#3a5a2a",fontWeight:isActive?"bold":"normal"}}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({msg}) {
  if(!msg) return null;
  const cfg={ok:{bg:"#0d2a0d",bd:"#2a6a2a",icon:"✓"},erro:{bg:"#2a0d0d",bd:"#6a2a2a",icon:"✕"},aviso:{bg:"#2a1e08",bd:"#6a5020",icon:"⚠"}};
  const c=cfg[msg.tipo]||cfg.ok;
  return (
    <div style={{
      position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",
      zIndex:9999,display:"flex",alignItems:"center",gap:8,
      background:c.bg,border:`1px solid ${c.bd}`,
      backdropFilter:"blur(10px)",
      color:"#d8e8c0",padding:"10px 18px",borderRadius:24,
      fontSize:13,whiteSpace:"nowrap",
      boxShadow:"0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
      animation:"toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      <span style={{fontSize:12,color:c.bd}}>{c.icon}</span>
      {msg.txt}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({registros, anoAtual}) {
  const regAno  =useMemo(()=>registros.filter(r=>anoOf(r.data)===anoAtual),[registros,anoAtual]);
  const totalAno=useMemo(()=>regAno.reduce((s,r)=>s+r.hectares,0),[regAno]);
  const totalAll=useMemo(()=>registros.reduce((s,r)=>s+r.hectares,0),[registros]);
  const mesAtual=new Date().getMonth();

  const mensal=useMemo(()=>{
    const m=Array(12).fill(0);
    for(const r of regAno) m[mesOf(r.data)]+=r.hectares;
    return MESES_PT.map((label,i)=>({label,v:m[i],active:i===mesAtual}));
  },[regAno,mesAtual]);

  const ultimos=useMemo(()=>[...registros].sort((a,b)=>b.data.localeCompare(a.data)).slice(0,4),[registros]);
  const porCultura=useMemo(()=>{
    const m={};
    for(const r of regAno) m[r.cultura]=(m[r.cultura]||0)+r.hectares;
    return CULTURAS.filter(c=>m[c]).map(c=>({name:c,value:m[c],color:CULTURA_COLORS[c]}));
  },[regAno]);

  const maisProductivo=useMemo(()=>{
    const m={};
    for(const r of regAno){m[r.data]=(m[r.data]||0)+r.hectares;}
    const best=Object.entries(m).sort((a,b)=>b[1]-a[1])[0];
    return best?{data:fmt(best[0]),ha:best[1]}:null;
  },[regAno]);

  const haEsteMes=mensal[mesAtual].v;
  const diasComReg=useMemo(()=>new Set(regAno.map(r=>r.data)).size,[regAno]);
  const mediaDia=diasComReg?Math.round(totalAno/diasComReg):0;
  const spark=mensal.slice(6).map(d=>d.v);

  return (
    <div style={{paddingBottom:32}}>
      {/* Hero */}
      <div style={{
        borderRadius:20,overflow:"hidden",marginBottom:12,position:"relative",
        background:"linear-gradient(145deg,#1c3d0a 0%,#0e2206 40%,#081608 100%)",
        border:"1px solid #2a5a14",
        boxShadow:"0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}>
        {/* Real field photo bg */}
        <FieldBg/>
        {/* Noise overlay */}
        <div style={{
          position:"absolute",inset:0,opacity:0.04,
          backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}/>
        <div style={{position:"relative",padding:"20px 18px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <Icons.Sun size={14}/>
                <span style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"#6a9a4a"}}>Safra {anoAtual}</span>
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                <AnimNum value={totalAno} style={{
                  fontSize:52,fontWeight:"900",lineHeight:1,
                  background:"linear-gradient(135deg,#f8e060,#c89030)",
                  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                  letterSpacing:-2,fontFamily:"Georgia,serif",
                }}/>
                <span style={{fontSize:18,color:"#8ab050",fontWeight:"300"}}>ha</span>
              </div>
              <div style={{fontSize:11,color:"#4a7a3a",marginTop:3}}>
                {regAno.length} colheitas · {new Set(regAno.map(r=>r.fazenda)).size} fazendas
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <Sparkline values={spark} color="#e8c84a" height={44} width={88}/>
              <div style={{fontSize:8,color:"#3a5a2a",letterSpacing:1.5,marginTop:2,textTransform:"uppercase"}}>Últ. 6 meses</div>
            </div>
          </div>

          {/* Meta bar */}
          <div style={{marginTop:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontSize:9,color:"#4a7a3a",letterSpacing:1.5,textTransform:"uppercase"}}>Meta da safra · 1.000 ha</span>
              <span style={{fontSize:10,color:"#8ab050",fontWeight:"bold"}}>{Math.min(100,Math.round((totalAno/1000)*100))}%</span>
            </div>
            <div style={{height:7,background:"rgba(0,0,0,0.4)",borderRadius:4,overflow:"hidden",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.5)"}}>
              <div style={{
                height:"100%",borderRadius:4,
                background:"linear-gradient(90deg,#3a8020,#a0c030,#f0d040)",
                width:`${Math.min(100,(totalAno/1000)*100)}%`,
                boxShadow:"0 0 12px #c0d04066",
                transition:"width 1.2s cubic-bezier(0.34,1.56,0.64,1)",
              }}/>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
        {[
          {label:"Este mês",value:haEsteMes,icon:<Icons.Cal size={16}/>,color:"#50b090",grad:["#50b090","#208060"]},
          {label:"Média/dia",value:mediaDia,icon:<Icons.Dashboard size={16} active/>,color:"#a070e0",grad:["#a070e0","#602090"]},
          {label:"Histórico",value:totalAll,icon:<Icons.Medal size={16}/>,color:"#e09040",grad:["#e09040","#804010"]},
        ].map(k=>(
          <div key={k.label} style={{
            background:`linear-gradient(145deg,#0f1e0a,#080e06)`,
            border:`1px solid ${k.color}33`,
            borderTop:`2px solid ${k.color}`,
            borderRadius:14,padding:"10px 8px",
            boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
          }}>
            <div style={{marginBottom:5}}>{k.icon}</div>
            <AnimNum value={k.value} style={{
              fontSize:19,fontWeight:"bold",display:"block",lineHeight:1,
              background:`linear-gradient(135deg,${k.grad[0]},${k.grad[1]})`,
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            }}/>
            <div style={{fontSize:8,color:"#3a5a2a",marginTop:2,letterSpacing:0.5}}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Chart row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 100px",gap:10,marginBottom:12}}>
        <div style={{
          background:"linear-gradient(145deg,#0f1e0a,#080e06)",
          border:"1px solid #1a3a0a",borderRadius:14,padding:"12px 10px",
          boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
        }}>
          <div style={{fontSize:8,letterSpacing:2,textTransform:"uppercase",color:"#4a7a3a",marginBottom:6}}>
            Produção mensal — {anoAtual}
          </div>
          <BarChart data={mensal} height={55}/>
        </div>
        <div style={{
          background:"linear-gradient(145deg,#0f1e0a,#080e06)",
          border:"1px solid #1a3a0a",borderRadius:14,padding:"10px 6px",
          display:"flex",flexDirection:"column",alignItems:"center",
          boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
        }}>
          <div style={{fontSize:8,letterSpacing:1.5,textTransform:"uppercase",color:"#4a7a3a",marginBottom:4,textAlign:"center"}}>Culturas</div>
          <div style={{position:"relative"}}>
            <Donut data={porCultura} size={76}/>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:16,fontWeight:"bold",color:"#c8a830"}}>{porCultura.length}</span>
              <span style={{fontSize:7,color:"#3a5a2a"}}>tipos</span>
            </div>
          </div>
          {porCultura.slice(0,3).map(d=>(
            <div key={d.name} style={{display:"flex",alignItems:"center",gap:3,marginTop:2}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:d.color,flexShrink:0}}/>
              <span style={{fontSize:7.5,color:"#5a7a4a"}}>{d.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dia mais produtivo */}
      {maisProductivo && (
        <div style={{
          display:"flex",alignItems:"center",gap:12,
          background:"linear-gradient(135deg,#1a2e0a,#0a1608)",
          border:"1px solid #2a4a1a",borderRadius:14,
          padding:"12px 14px",marginBottom:12,
          boxShadow:"0 4px 16px rgba(0,0,0,0.4)",
        }}>
          <div style={{flexShrink:0}}><Icons.Medal size={36}/></div>
          <div>
            <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#4a7a3a",marginBottom:2}}>Dia mais produtivo</div>
            <div style={{fontSize:20,fontWeight:"bold",background:"linear-gradient(135deg,#f0d040,#a07010)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              {maisProductivo.ha.toLocaleString("pt-BR")} ha
            </div>
            <div style={{fontSize:11,color:"#5a7a4a"}}>{maisProductivo.data}</div>
          </div>
        </div>
      )}

      {/* Ultimos registros */}
      <div style={{
        background:"linear-gradient(145deg,#0f1e0a,#080e06)",
        border:"1px solid #1a3a0a",borderRadius:14,padding:"12px",
        boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
      }}>
        <div style={{fontSize:8,letterSpacing:2,textTransform:"uppercase",color:"#4a7a3a",marginBottom:10}}>Últimas colheitas</div>
        {ultimos.map((r,i)=>(
          <div key={r.id} style={{
            display:"flex",alignItems:"center",gap:10,
            padding:"9px 0",
            borderBottom:i<ultimos.length-1?"1px solid #111e09":"none",
          }}>
            <div style={{
              width:38,height:38,borderRadius:10,flexShrink:0,
              overflow:"hidden",
              border:`1px solid ${CULTURA_COLORS[r.cultura]}44`,
              boxShadow:`0 2px 8px ${CULTURA_COLORS[r.cultura]}22`,
            }}>
              <CultImg cultura={r.cultura} size={38} radius={0}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,color:"#c0c8a0",fontWeight:"500",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {nomeFaz(r.fazenda)}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                <Icons.Cal size={10}/>
                <span style={{fontSize:10,color:"#3a5a2a"}}>{fmtShort(r.data)}</span>
                <Icons.Drop size={10}/>
                <span style={{fontSize:10,color:"#3a5a2a"}}>{r.pivo}</span>
              </div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{
                fontSize:15,fontWeight:"bold",
                background:`linear-gradient(135deg,${CULTURA_COLORS[r.cultura]},${CULTURA_GRAD[r.cultura][1]})`,
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              }}>{r.hectares.toLocaleString("pt-BR")}</div>
              <div style={{fontSize:8,color:"#3a5a2a"}}>ha</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── REGISTRAR ────────────────────────────────────────────────────────────────
function Registrar({onSave, editData, onCancelEdit}) {
  const [form,setForm]=useState(editData||{
    data:new Date().toISOString().split("T")[0],
    fazenda:FAZENDAS[0],pivoModo:"lista",pivo:"",pivoLivre:"",cultura:"Soja",hectares:"",
  });
  useEffect(()=>{if(editData)setForm(editData);},[editData]);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  const handleSave=()=>{
    const pivoFinal=form.pivoModo==="lista"?form.pivo:(form.pivoLivre||"").trim();
    if(!form.fazenda||!pivoFinal||!form.hectares||!form.data) return onSave(null,"Preencha todos os campos!");
    const ha=parseFloat(form.hectares);
    if(isNaN(ha)||ha<=0) return onSave(null,"Hectares inválido!");
    onSave({...form,pivo:pivoFinal,hectares:ha});
    if(!editData) setForm({data:new Date().toISOString().split("T")[0],fazenda:FAZENDAS[0],pivoModo:"lista",pivo:"",pivoLivre:"",cultura:"Soja",hectares:""});
  };

  return (
    <div style={{paddingBottom:32}}>
      {/* Header */}
      <div style={{
        borderRadius:16,overflow:"hidden",marginBottom:14,position:"relative",
        background:"linear-gradient(135deg,#1a2e0a,#0a1608)",
        border:"1px solid #2a5a14",padding:"16px",
        boxShadow:"0 8px 30px rgba(0,0,0,0.5)",
      }}>
        <div style={{position:"absolute",right:-10,top:-10,opacity:0.18,overflow:"hidden",borderRadius:8}}>
          <HarvesterImg size={90}/>
        </div>
        <div style={{position:"relative"}}>
          <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"#5a9a4a",marginBottom:3}}>
            {editData?"Editar Registro":"Nova Colheita"}
          </div>
          <div style={{fontSize:20,fontWeight:"bold",color:"#d0e0a0"}}>
            {editData?"Atualizar dados":"Registrar produção do dia"}
          </div>
        </div>
      </div>

      {/* Date */}
      <SectionCard icon={<Icons.Cal size={14}/>} label="Data da Colheita">
        <input type="date" value={form.data} onChange={e=>set("data",e.target.value)} style={IS}/>
      </SectionCard>

      {/* Fazenda */}
      <SectionCard icon={<Icons.Farm size={14}/>} label="Fazenda">
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {FAZENDAS.map(f=>{
            const sel=form.fazenda===f;
            return (
              <button key={f} onClick={()=>set("fazenda",f)} style={{
                padding:"11px 14px",borderRadius:12,cursor:"pointer",
                fontFamily:"inherit",fontSize:13,textAlign:"left",
                background:sel?"linear-gradient(135deg,#162e0a,#0a1c06)":"#0a1208",
                border:`1px solid ${sel?"#3a7a1a":"#152010"}`,
                color:sel?"#d0e8a0":"#5a7a4a",
                display:"flex",alignItems:"center",gap:10,
                boxShadow:sel?"0 0 16px rgba(58,122,26,0.3)":"none",
                transition:"all 0.2s",
              }}>
                <div style={{
                  width:8,height:8,borderRadius:"50%",flexShrink:0,
                  background:sel?"#6ab04a":"#1a3a0a",
                  boxShadow:sel?"0 0 8px #6ab04a":"none",
                  transition:"all 0.2s",
                }}/>
                <Icons.Pin size={12} color={sel?"#6ab04a":"#2a4a1a"}/>
                <span>{nomeFaz(f)}<span style={{color:"#2a4a1a",fontSize:10}}> JHS</span></span>
                {sel && <div style={{marginLeft:"auto"}}><Icons.Check size={14}/></div>}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Pivô */}
      <SectionCard icon={<Icons.Drop size={14}/>} label="Pivô / Talhão">
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          {["lista","livre"].map(m=>(
            <button key={m} onClick={()=>set("pivoModo",m)} style={{
              flex:1,padding:"8px 0",fontSize:10,letterSpacing:1,
              textTransform:"uppercase",fontFamily:"inherit",
              background:form.pivoModo===m?"linear-gradient(135deg,#162e0a,#0a1c06)":"transparent",
              border:`1px solid ${form.pivoModo===m?"#3a7a1a":"#152010"}`,
              color:form.pivoModo===m?"#b0d080":"#3a5a2a",
              borderRadius:10,cursor:"pointer",transition:"all 0.2s",
            }}>{m==="lista"?"↓ Selecionar":"✎ Digitar"}</button>
          ))}
        </div>
        {form.pivoModo==="lista"
          ? <select value={form.pivo} onChange={e=>set("pivo",e.target.value)} style={IS}>
              <option value="">— Selecione —</option>
              {PIVOS.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          : <input value={form.pivoLivre||""} placeholder="Nome do pivô ou talhão"
              onChange={e=>set("pivoLivre",e.target.value)} style={IS}/>
        }
      </SectionCard>

      {/* Cultura */}
      <SectionCard icon={<CulturaIcon cultura="Soja" size={14}/>} label="Cultura">
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
          {CULTURAS.map(c=>{
            const sel=form.cultura===c;
            const [g1,g2]=CULTURA_GRAD[c];
            return (
              <button key={c} onClick={()=>set("cultura",c)} style={{
                padding:"6px 2px 8px",borderRadius:12,cursor:"pointer",
                fontFamily:"inherit",fontSize:8.5,letterSpacing:0.3,textTransform:"uppercase",
                background:sel?`linear-gradient(145deg,${g1}20,${g2}10)`:"#090f07",
                border:`1px solid ${sel?CULTURA_COLORS[c]+"88":"#152010"}`,
                color:sel?CULTURA_COLORS[c]:"#3a5a2a",
                display:"flex",flexDirection:"column",alignItems:"center",gap:4,
                boxShadow:sel?`0 0 16px ${CULTURA_COLORS[c]}33`:"none",
                transition:"all 0.25s",
              }}>
                <div style={{
                  width:32,height:32,borderRadius:8,overflow:"hidden",
                  border:`1px solid ${sel?CULTURA_COLORS[c]+"66":"#1a3a0a"}`,
                  flexShrink:0,
                }}>
                  <CultImg cultura={c} size={32} radius={0}/>
                </div>
                {c}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Hectares */}
      <SectionCard icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M3 21l6-6m0 0l3-9 3 9m-6 0h6M3 21h18" stroke="#4a7a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      } label="Área Colhida">
        <div style={{position:"relative"}}>
          <input type="number" value={form.hectares} placeholder="0" min="0" step="0.01"
            onChange={e=>set("hectares",e.target.value)}
            style={{
              ...IS,fontSize:40,textAlign:"center",
              background:"linear-gradient(135deg,#f8e06022,#c8900808)",
              fontWeight:"900",letterSpacing:-2,height:76,padding:"0 40px 0 16px",
              color:"transparent",
            }}/>
          <div style={{
            position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
            pointerEvents:"none",gap:6,
          }}>
            <span style={{
              fontSize:40,fontWeight:"900",letterSpacing:-2,
              background:"linear-gradient(135deg,#f8e060,#c89020)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            }}>{form.hectares||"0"}</span>
            <span style={{fontSize:16,color:"#6a9a4a",marginTop:8}}>ha</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginTop:8}}>
          {[10,25,50,100].map(v=>(
            <button key={v} onClick={()=>set("hectares",String((parseFloat(form.hectares)||0)+v))} style={{
              padding:"8px 0",fontSize:12,fontFamily:"inherit",fontWeight:"bold",
              background:"linear-gradient(145deg,#0f1e0a,#080e06)",
              border:"1px solid #1a3a0a",color:"#5a8a4a",
              borderRadius:8,cursor:"pointer",
              boxShadow:"0 2px 8px rgba(0,0,0,0.3)",
              transition:"all 0.15s",
            }}>+{v}</button>
          ))}
        </div>
      </SectionCard>

      {/* Save button */}
      <div style={{display:"flex",gap:8}}>
        <button onClick={handleSave} style={{
          flex:1,
          background:"linear-gradient(135deg,#4a9a2a,#2a6010)",
          color:"#d0f0a0",border:"none",padding:"15px",borderRadius:14,
          fontSize:14,letterSpacing:1,textTransform:"uppercase",
          cursor:"pointer",fontFamily:"inherit",fontWeight:"bold",
          boxShadow:"0 8px 24px rgba(74,154,42,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
          display:"flex",alignItems:"center",justifyContent:"center",gap:8,
        }}>
          <Icons.Check size={16} color="#d0f0a0"/>
          {editData?"Salvar Alterações":"Registrar Colheita"}
        </button>
        {editData && (
          <button onClick={onCancelEdit} style={{
            background:"#0f1e0a",color:"#5a7a4a",border:"1px solid #1a3a0a",
            padding:"15px 16px",borderRadius:14,fontSize:16,cursor:"pointer",
          }}>✕</button>
        )}
      </div>
    </div>
  );
}

// ─── HISTORICO ────────────────────────────────────────────────────────────────
function Historico({registros, onEdit, onDelete}) {
  const anoAtual=new Date().getFullYear();
  const [ano,setAno]=useState(anoAtual);
  const [fazFiltro,setFazFiltro]=useState("");
  const [cultFiltro,setCultFiltro]=useState("");
  const [busca,setBusca]=useState("");

  const anos=useMemo(()=>{const s=new Set(registros.map(r=>anoOf(r.data)));return[...s].sort((a,b)=>b-a);},[registros]);
  const lista=useMemo(()=>
    [...registros]
      .filter(r=>anoOf(r.data)===ano)
      .filter(r=>!fazFiltro||r.fazenda===fazFiltro)
      .filter(r=>!cultFiltro||r.cultura===cultFiltro)
      .filter(r=>!busca||r.fazenda.toLowerCase().includes(busca.toLowerCase())||r.pivo.toLowerCase().includes(busca.toLowerCase()))
      .sort((a,b)=>b.data.localeCompare(a.data))
  ,[registros,ano,fazFiltro,cultFiltro,busca]);

  const totalFiltrado=lista.reduce((s,r)=>s+r.hectares,0);

  return (
    <div style={{paddingBottom:32}}>
      {/* Search */}
      <div style={{position:"relative",marginBottom:10}}>
        <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}>
          <Icons.Search size={15}/>
        </div>
        <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar fazenda ou pivô..."
          style={{...IS,paddingLeft:34,fontSize:13}}/>
      </div>

      {/* Anos */}
      <div style={{display:"flex",gap:6,marginBottom:8,overflowX:"auto",paddingBottom:2}}>
        {anos.map(a=>(
          <button key={a} onClick={()=>setAno(a)} style={{
            padding:"5px 14px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",
            fontSize:12,whiteSpace:"nowrap",fontWeight:ano===a?"bold":"normal",
            background:ano===a?"linear-gradient(135deg,#c8a020,#806008)":"#0a1208",
            border:`1px solid ${ano===a?"#c8a020":"#152010"}`,
            color:ano===a?"#0a0800":"#4a6a3a",
            boxShadow:ano===a?"0 0 12px #c8a02044":"none",
          }}>{a}</button>
        ))}
      </div>

      {/* Fazenda chips */}
      <div style={{display:"flex",gap:5,marginBottom:6,overflowX:"auto",paddingBottom:2}}>
        {["",  ...FAZENDAS].map(f=>(
          <button key={f||"all"} onClick={()=>setFazFiltro(f)} style={chipSt(fazFiltro===f&&(f||!fazFiltro))}>
            {f?nomeFaz(f):"Todas"}
          </button>
        ))}
      </div>

      {/* Cultura chips */}
      <div style={{display:"flex",gap:5,marginBottom:10,overflowX:"auto",paddingBottom:2}}>
        <button onClick={()=>setCultFiltro("")} style={chipSt(!cultFiltro)}>Todas</button>
        {CULTURAS.map(c=>(
          <button key={c} onClick={()=>setCultFiltro(cultFiltro===c?"":c)} style={{
            ...chipSt(cultFiltro===c),
            borderColor:cultFiltro===c?CULTURA_COLORS[c]+"88":undefined,
            color:cultFiltro===c?CULTURA_COLORS[c]:undefined,
          }}>
            <span style={{fontSize:10}}>{CULTURA_ICONS_EMOJI[c]}</span> {c}
          </button>
        ))}
      </div>

      {/* Total strip */}
      {lista.length>0&&(
        <div style={{
          background:"linear-gradient(135deg,#0f1e0a,#080e06)",border:"1px solid #1a3a0a",
          borderRadius:10,padding:"8px 14px",marginBottom:10,
          display:"flex",justifyContent:"space-between",alignItems:"center",
          boxShadow:"0 2px 12px rgba(0,0,0,0.3)",
        }}>
          <span style={{fontSize:11,color:"#3a5a2a"}}>{lista.length} registros</span>
          <span style={{
            fontSize:16,fontWeight:"bold",
            background:"linear-gradient(135deg,#f0d040,#a07010)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          }}>{totalFiltrado.toLocaleString("pt-BR")} ha</span>
        </div>
      )}

      {lista.length===0?(
        <div style={{textAlign:"center",padding:"60px 0",color:"#1a3a1a"}}>
          <div style={{marginBottom:10,borderRadius:12,overflow:"hidden",width:120,margin:"0 auto 12px"}}>
            <img src={FIELD_FOTO} alt="" style={{width:120,height:70,objectFit:"cover",opacity:0.3,borderRadius:12}}/>
          </div>
          <div style={{fontSize:14,color:"#2a4a2a"}}>Nenhum registro encontrado</div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {lista.map(r=>{
            const [g1,g2]=CULTURA_GRAD[r.cultura];
            return (
              <div key={r.id} style={{
                background:"linear-gradient(145deg,#0f1e0a,#080e06)",
                border:"1px solid #152010",
                borderLeft:`3px solid ${CULTURA_COLORS[r.cultura]}`,
                borderRadius:12,padding:"11px 12px",
                boxShadow:"0 4px 16px rgba(0,0,0,0.4)",
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4,flexWrap:"wrap"}}>
                      <span style={{
                        fontSize:10,color:"#3a6a2a",fontFamily:"monospace",
                        background:"#0a1208",padding:"2px 7px",borderRadius:5,
                        border:"1px solid #152010",
                      }}>{fmt(r.data)}</span>
                      <span style={{
                        fontSize:10,padding:"2px 8px",borderRadius:5,
                        background:`${CULTURA_COLORS[r.cultura]}18`,
                        border:`1px solid ${CULTURA_COLORS[r.cultura]}33`,
                        color:CULTURA_COLORS[r.cultura],
                      }}>{CULTURA_ICONS_EMOJI[r.cultura]} {r.cultura}</span>
                    </div>
                    <div style={{fontSize:13,color:"#c0c8a0",fontWeight:"500",marginBottom:2}}>
                      {nomeFaz(r.fazenda)}<span style={{color:"#2a4a1a",fontSize:10}}> JHS</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <Icons.Drop size={10}/>
                      <span style={{fontSize:11,color:"#3a5a2a"}}>{r.pivo}</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0,paddingLeft:8}}>
                    <div style={{
                      fontSize:22,fontWeight:"900",lineHeight:1,
                      background:`linear-gradient(135deg,${g1},${g2})`,
                      WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                    }}>{r.hectares.toLocaleString("pt-BR")}</div>
                    <div style={{fontSize:8,color:"#3a5a2a",marginBottom:6}}>hectares</div>
                    <div style={{display:"flex",gap:5,justifyContent:"flex-end"}}>
                      <button onClick={()=>onEdit(r)} style={{
                        background:"#111e09",border:"1px solid #1a3a0a",
                        cursor:"pointer",padding:"5px 8px",borderRadius:7,
                        display:"flex",alignItems:"center",gap:3,
                      }}><Icons.Edit size={13}/></button>
                      <button onClick={()=>onDelete(r.id)} style={{
                        background:"#1a0909",border:"1px solid #3a1010",
                        cursor:"pointer",padding:"5px 8px",borderRadius:7,
                        display:"flex",alignItems:"center",gap:3,
                      }}><Icons.Trash size={13}/></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── RESUMO ───────────────────────────────────────────────────────────────────
function Resumo({registros}) {
  const anoAtual=new Date().getFullYear();
  const [ano,setAno]=useState(anoAtual);
  const anos=useMemo(()=>{const s=new Set(registros.map(r=>anoOf(r.data)));return[...s].sort((a,b)=>b-a);},[registros]);
  const regAno=useMemo(()=>registros.filter(r=>anoOf(r.data)===ano),[registros,ano]);
  const totalAno=useMemo(()=>regAno.reduce((s,r)=>s+r.hectares,0),[regAno]);
  const totalAll=useMemo(()=>registros.reduce((s,r)=>s+r.hectares,0),[registros]);
  const porCultura=useMemo(()=>{const m={};for(const r of regAno)m[r.cultura]=(m[r.cultura]||0)+r.hectares;return m;},[regAno]);
  const porFazenda=useMemo(()=>{const m={};for(const r of regAno){if(!m[r.fazenda])m[r.fazenda]={total:0,culturas:{}};m[r.fazenda].total+=r.hectares;m[r.fazenda].culturas[r.cultura]=(m[r.fazenda].culturas[r.cultura]||0)+r.hectares;}return m;},[regAno]);
  const fazHist=useMemo(()=>{const m={};for(const r of registros){if(!m[r.fazenda])m[r.fazenda]={total:0,culturas:{}};m[r.fazenda].total+=r.hectares;m[r.fazenda].culturas[r.cultura]=(m[r.fazenda].culturas[r.cultura]||0)+r.hectares;}return m;},[registros]);
  const fazPorCultura=useMemo(()=>{const m={};for(const r of regAno){if(!m[r.cultura])m[r.cultura]={};m[r.cultura][r.fazenda]=(m[r.cultura][r.fazenda]||0)+r.hectares;}return m;},[regAno]);
  const mensalData=useMemo(()=>{const m=Array(12).fill(0);for(const r of regAno)m[mesOf(r.data)]+=r.hectares;return MESES_PT.map((label,i)=>({label,v:m[i],active:i===new Date().getMonth()}));},[regAno]);

  const [cultExpand,setCultExpand]=useState(null);
  const [fazExpand,setFazExpand]=useState(null);
  const [histExpand,setHistExpand]=useState(null);

  return (
    <div style={{paddingBottom:32}}>
      {/* Ano selector */}
      <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",paddingBottom:4}}>
        {anos.map(a=>(
          <button key={a} onClick={()=>setAno(a)} style={{
            padding:"6px 16px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",
            fontSize:13,whiteSpace:"nowrap",fontWeight:ano===a?"bold":"normal",
            background:ano===a?"linear-gradient(135deg,#c8a020,#806008)":"#0a1208",
            border:`1px solid ${ano===a?"#c8a020":"#152010"}`,
            color:ano===a?"#0a0800":"#4a6a3a",
            boxShadow:ano===a?"0 0 12px #c8a02044":"none",
          }}>{a}</button>
        ))}
      </div>

      {/* Total hero */}
      <div style={{
        borderRadius:18,overflow:"hidden",marginBottom:14,position:"relative",
        background:"linear-gradient(145deg,#1c3d0a,#0a1a06)",
        border:"1px solid #2a5a14",padding:"20px",textAlign:"center",
        boxShadow:"0 16px 50px rgba(0,0,0,0.6)",
      }}>
        <FieldBg/>
        <div style={{position:"relative"}}>
          <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"#5a9a4a",marginBottom:4}}>Safra {ano} — Total Colhido</div>
          <AnimNum value={totalAno} style={{
            fontSize:56,fontWeight:"900",lineHeight:1,display:"block",
            background:"linear-gradient(135deg,#f8e060 30%,#c89030)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            letterSpacing:-2,fontFamily:"Georgia,serif",
          }}/>
          <div style={{fontSize:16,color:"#6a9a4a",marginTop:2}}>hectares</div>
          <div style={{fontSize:11,color:"#3a5a2a",marginTop:4}}>
            {regAno.length} registros · {new Set(regAno.map(r=>r.fazenda)).size} fazendas · {Object.keys(porCultura).length} culturas
          </div>
          {anos.length>1&&(
            <div style={{marginTop:10,paddingTop:8,borderTop:"1px solid #1a3a0a"}}>
              <span style={{fontSize:10,color:"#2a4a2a"}}>Acumulado histórico: </span>
              <span style={{fontSize:11,color:"#4a7a4a",fontWeight:"bold"}}>{totalAll.toLocaleString("pt-BR")} ha</span>
              <span style={{fontSize:10,color:"#2a4a2a"}}> · {anos.length} safras</span>
            </div>
          )}
        </div>
      </div>

      {/* Mensal bar */}
      <div style={{background:"linear-gradient(145deg,#0f1e0a,#080e06)",border:"1px solid #152010",borderRadius:14,padding:"12px",marginBottom:14,boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>
        <div style={{fontSize:8,letterSpacing:2,textTransform:"uppercase",color:"#3a6a2a",marginBottom:6}}>Distribuição Mensal — {ano}</div>
        <BarChart data={mensalData} height={65}/>
      </div>

      {/* Culturas */}
      <div style={{background:"linear-gradient(145deg,#0f1e0a,#080e06)",border:"1px solid #152010",borderRadius:14,padding:"12px",marginBottom:14,boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>
        <div style={{fontSize:8,letterSpacing:2,textTransform:"uppercase",color:"#3a6a2a",marginBottom:10}}>Por Cultura — {ano}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {CULTURAS.filter(c=>porCultura[c]).map(c=>{
            const ha=porCultura[c]||0,pct=totalAno?Math.round((ha/totalAno)*100):0,exp=cultExpand===c;
            const [g1,g2]=CULTURA_GRAD[c];
            return (
              <div key={c} onClick={()=>setCultExpand(exp?null:c)} style={{
                background:exp?`linear-gradient(145deg,${g1}12,${g2}06)`:"#090f07",
                border:`1px solid ${exp?CULTURA_COLORS[c]+"66":CULTURA_COLORS[c]+"22"}`,
                borderTop:`3px solid ${CULTURA_COLORS[c]}`,borderRadius:12,
                cursor:"pointer",overflow:"hidden",gridColumn:exp?"1/-1":"auto",
                boxShadow:exp?`0 0 24px ${CULTURA_COLORS[c]}22`:"0 2px 8px rgba(0,0,0,0.3)",
                transition:"all 0.25s",
              }}>
                <div style={{padding:"12px 10px",textAlign:"center"}}>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:3}}>
                    <CulturaIcon cultura={c} size={exp?32:24}/>
                  </div>
                  <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:"#4a7a4a",marginTop:1}}>{c}</div>
                  <div style={{
                    fontSize:exp?28:18,fontWeight:"900",marginTop:3,
                    background:`linear-gradient(135deg,${g1},${g2})`,
                    WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                    fontVariantNumeric:"tabular-nums",
                  }}>{ha.toLocaleString("pt-BR")}</div>
                  <div style={{fontSize:8,color:"#2a4a2a"}}>hectares</div>
                  <div style={{marginTop:6,height:3,background:"#0a1208",borderRadius:2}}>
                    <div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${g1},${g2})`,width:`${pct}%`,transition:"width 0.9s ease"}}/>
                  </div>
                  <div style={{fontSize:8,color:"#2a4a2a",marginTop:2}}>{pct}% do ano</div>
                  <div style={{fontSize:8,color:exp?CULTURA_COLORS[c]:"#1a3a1a",marginTop:4}}>
                    {exp?"▲ fechar":"▼ ver fazendas"}
                  </div>
                </div>
                {exp&&(
                  <div style={{borderTop:`1px solid ${CULTURA_COLORS[c]}22`,padding:"8px 12px 12px"}}>
                    <div style={{fontSize:8,letterSpacing:2,textTransform:"uppercase",color:"#3a6a3a",marginBottom:8}}>Colhido por fazenda</div>
                    {Object.entries(fazPorCultura[c]||{}).sort((a,b)=>b[1]-a[1]).map(([faz,fha])=>(
                      <div key={faz} style={{
                        display:"flex",justifyContent:"space-between",alignItems:"center",
                        padding:"8px 10px",marginBottom:5,
                        background:`${CULTURA_COLORS[c]}0d`,border:`1px solid ${CULTURA_COLORS[c]}1a`,borderRadius:8,
                      }}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <Icons.Pin size={10} color={CULTURA_COLORS[c]}/>
                          <span style={{fontSize:12,color:"#a0b080"}}>{nomeFaz(faz)}</span>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:14,fontWeight:"bold",color:CULTURA_COLORS[c]}}>{fha.toLocaleString("pt-BR")} ha</div>
                          <div style={{fontSize:8,color:"#2a4a2a"}}>{Math.round((fha/ha)*100)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fazendas */}
      <div style={{background:"linear-gradient(145deg,#0f1e0a,#080e06)",border:"1px solid #152010",borderRadius:14,padding:"12px",marginBottom:14,boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>
        <div style={{fontSize:8,letterSpacing:2,textTransform:"uppercase",color:"#3a6a2a",marginBottom:10}}>Por Fazenda — {ano}</div>
        {Object.entries(porFazenda).sort((a,b)=>b[1].total-a[1].total).map(([faz,d])=>{
          const exp=fazExpand===faz;
          return (
            <div key={faz} style={{border:"1px solid #152010",borderRadius:10,marginBottom:8,overflow:"hidden",background:exp?"#0c1909":"transparent",boxShadow:"0 2px 10px rgba(0,0,0,0.3)"}}>
              <button onClick={()=>setFazExpand(exp?null:faz)} style={{
                width:"100%",background:"none",border:"none",cursor:"pointer",
                padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:"inherit",
              }}>
                <div style={{textAlign:"left"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <Icons.Farm size={14} color="#6ab04a"/>
                    <span style={{fontSize:13,color:"#b8c890",fontWeight:"500"}}>{nomeFaz(faz)}<span style={{color:"#2a4a1a",fontSize:10}}> JHS</span></span>
                  </div>
                  <div style={{display:"flex",gap:3}}>
                    {Object.entries(d.culturas).sort((a,b)=>b[1]-a[1]).map(([cult])=>(
                      <span key={cult} style={{background:`${CULTURA_COLORS[cult]}22`,color:CULTURA_COLORS[cult],borderRadius:5,padding:"1px 5px",fontSize:10}}>
                        {CULTURA_ICONS_EMOJI[cult]}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0,paddingLeft:8}}>
                  <div style={{fontSize:18,fontWeight:"bold",background:"linear-gradient(135deg,#f0d040,#a07010)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                    {d.total.toLocaleString("pt-BR")} ha
                  </div>
                  <div style={{fontSize:8,color:"#2a4a1a"}}>{totalAno?Math.round((d.total/totalAno)*100):0}% do ano</div>
                  <Icons.Chevron size={12} dir={exp?"up":"down"} color="#2a5a1a"/>
                </div>
              </button>
              {exp&&(
                <div style={{padding:"0 14px 14px"}}>
                  <div style={{height:5,background:"#0a1208",borderRadius:3,overflow:"hidden",display:"flex",marginBottom:10}}>
                    {Object.entries(d.culturas).sort((a,b)=>b[1]-a[1]).map(([cult,ha])=>(
                      <div key={cult} style={{height:"100%",background:CULTURA_COLORS[cult],width:`${Math.round((ha/d.total)*100)}%`}}/>
                    ))}
                  </div>
                  {Object.entries(d.culturas).sort((a,b)=>b[1]-a[1]).map(([cult,ha])=>(
                    <div key={cult} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",marginBottom:5,background:`${CULTURA_COLORS[cult]}0f`,border:`1px solid ${CULTURA_COLORS[cult]}1a`,borderRadius:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <CulturaIcon cultura={cult} size={20}/>
                        <span style={{fontSize:13,color:"#a0b080"}}>{cult}</span>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:15,fontWeight:"bold",color:CULTURA_COLORS[cult]}}>{ha.toLocaleString("pt-BR")} ha</div>
                        <div style={{fontSize:8,color:"#2a4a2a"}}>{Math.round((ha/d.total)*100)}% da fazenda</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Histórico */}
      <div style={{background:"linear-gradient(145deg,#0f1e0a,#080e06)",border:"1px solid #152010",borderRadius:14,padding:"12px",boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>
        <div style={{fontSize:8,letterSpacing:2,textTransform:"uppercase",color:"#3a6a2a",marginBottom:4}}>Histórico — Todas as Safras</div>
        <div style={{fontSize:11,color:"#2a4a2a",marginBottom:12}}>
          Total acumulado: <span style={{color:"#5a8a4a",fontWeight:"bold"}}>{totalAll.toLocaleString("pt-BR")} ha · {anos.length} safras</span>
        </div>
        {Object.entries(fazHist).sort((a,b)=>b[1].total-a[1].total).map(([faz,d])=>{
          const exp=histExpand===faz;
          return (
            <div key={faz} style={{marginBottom:6,border:"1px solid #152010",borderRadius:8,overflow:"hidden"}}>
              <button onClick={()=>setHistExpand(exp?null:faz)} style={{
                width:"100%",background:exp?"#0c1909":"transparent",border:"none",cursor:"pointer",
                fontFamily:"inherit",padding:"9px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <Icons.Farm size={12} color="#4a7a3a"/>
                  <span style={{fontSize:12,color:"#6a8a5a"}}>{nomeFaz(faz)}<span style={{color:"#2a4a2a",fontSize:10}}> JHS</span></span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:13,fontWeight:"bold",color:"#4a7a4a"}}>{d.total.toLocaleString("pt-BR")} ha</span>
                  <Icons.Chevron size={11} dir={exp?"up":"down"} color="#2a4a2a"/>
                </div>
              </button>
              {exp&&(
                <div style={{padding:"4px 12px 10px"}}>
                  {Object.entries(d.culturas).sort((a,b)=>b[1]-a[1]).map(([cult,ha])=>(
                    <div key={cult} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 8px",marginBottom:4,background:`${CULTURA_COLORS[cult]}0a`,borderRadius:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <CulturaIcon cultura={cult} size={16}/>
                        <span style={{fontSize:11,color:"#5a7a4a"}}>{cult}</span>
                      </div>
                      <span style={{fontSize:12,fontWeight:"bold",color:CULTURA_COLORS[cult]}}>{ha.toLocaleString("pt-BR")} ha</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SECTION CARD ─────────────────────────────────────────────────────────────
function SectionCard({icon, label, children}) {
  return (
    <div style={{
      background:"linear-gradient(145deg,#0f1e0a,#080e06)",
      border:"1px solid #152010",borderRadius:14,padding:"12px 14px",marginBottom:10,
      boxShadow:"0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)",
    }}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
        {icon}
        <span style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"#3a6a2a"}}>{label}</span>
      </div>
      {children}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
const STORAGE_KEY = "jhs_colheita_registros";
const STORAGE_ID  = "jhs_colheita_nextid";

function loadRegistros() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  // First load: seed with INIT and save
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INIT));
  return INIT;
}

function saveRegistros(lista) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lista)); } catch(e) {}
}

function loadNextId() {
  try {
    const v = localStorage.getItem(STORAGE_ID);
    if (v) return parseInt(v);
  } catch(e) {}
  return nextId;
}

function saveNextId(id) {
  try { localStorage.setItem(STORAGE_ID, String(id)); } catch(e) {}
}

export default function App() {
  const [registros,setRegistrosRaw]=useState(()=>loadRegistros());
  const [aba,setAba]=useState("registrar");
  const [editReg,setEditReg]=useState(null);
  const [msg,setMsg]=useState(null);
  const [online,setOnline]=useState(navigator.onLine);
  const anoAtual=new Date().getFullYear();
  const idRef = useRef(loadNextId());

  // Persist whenever registros change
  const setRegistros = (updater) => {
    setRegistrosRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveRegistros(next);
      return next;
    });
  };

  // Track online/offline
  useEffect(()=>{
    const on  = ()=>setOnline(true);
    const off = ()=>setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return ()=>{ window.removeEventListener("online",on); window.removeEventListener("offline",off); };
  },[]);

  const toast=(txt,tipo="ok")=>{setMsg({txt,tipo});setTimeout(()=>setMsg(null),3000);};

  const handleSave=(data,errMsg)=>{
    if(!data){toast(errMsg,"erro");return;}
    if(editReg){
      setRegistros(prev=>prev.map(r=>r.id===editReg.id?{...r,...data}:r));
      setEditReg(null);setAba("historico");toast("Registro atualizado!");
    } else {
      const newId = idRef.current++;
      saveNextId(idRef.current);
      setRegistros(prev=>[...prev,{id:newId,...data}]);
      toast("Colheita registrada!");
    }
  };

  const handleEdit=r=>{
    const isLista=PIVOS.includes(r.pivo);
    setEditReg({...r,pivoModo:isLista?"lista":"livre",pivo:isLista?r.pivo:"",pivoLivre:isLista?"":r.pivo,hectares:String(r.hectares)});
    setAba("registrar");
  };

  const handleDelete=id=>{setRegistros(prev=>prev.filter(r=>r.id!==id));toast("Registro excluído.","aviso");};

  const TABS=[
    {id:"registrar",label:"Registrar",Icon:Icons.Plus},
    {id:"historico",label:"Histórico",Icon:Icons.History},
    {id:"resumo",label:"Resumo",Icon:Icons.Resumo},
  ];

  return (
    <div style={{
      position:"fixed",inset:0,display:"flex",flexDirection:"column",
      background:"#06100404",fontFamily:"-apple-system,'Segoe UI',sans-serif",
      color:"#c8d8a8",
    }}>
      {/* Ambient bg */}
      <div style={{
        position:"absolute",inset:0,zIndex:0,
        background:"radial-gradient(ellipse 80% 50% at 50% 0%,#1a4008 0%,#040a02 60%)",
        pointerEvents:"none",
      }}/>
      <div style={{
        position:"absolute",inset:0,zIndex:0,pointerEvents:"none",opacity:0.025,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}/>

      <Toast msg={msg}/>

      {/* Top bar */}
      <div style={{
        flexShrink:0,position:"relative",zIndex:10,
        background:"rgba(6,14,3,0.95)",
        backdropFilter:"blur(20px)",
        borderBottom:"1px solid #1a3a0a",
        paddingTop:"max(env(safe-area-inset-top,0px),12px)",
        padding:"max(env(safe-area-inset-top,0px),12px) 16px 0",
      }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{
              width:36,height:36,borderRadius:10,
              overflow:"hidden",
              border:"1px solid #3a7a1a",
              boxShadow:"0 4px 16px rgba(42,106,10,0.5)",
              flexShrink:0,
            }}>
              <HarvesterImg size={36} style={{width:36,height:36,borderRadius:0}}/>
            </div>
            <div>
              <div style={{
                fontSize:16,fontWeight:"bold",
                background:"linear-gradient(135deg,#d0e890,#8ab040)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                letterSpacing:0.3,
              }}>JHS Colheita</div>
              <div style={{fontSize:8,color:"#2a4a1a",letterSpacing:2.5,textTransform:"uppercase"}}>Gestão Agrícola</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end"}}>
              <Icons.Sun size={11}/>
              <span style={{fontSize:10,color:"#3a6a2a"}}>{new Date().toLocaleDateString("pt-BR",{weekday:"short",day:"numeric",month:"short"})}</span>
            </div>
            <div style={{
              display:"flex",alignItems:"center",gap:3,justifyContent:"flex-end",marginTop:2,
            }}>
              <div style={{
                width:6,height:6,borderRadius:"50%",flexShrink:0,
                background: online ? "#4aaa2a" : "#aa4a2a",
                boxShadow: online ? "0 0 6px #4aaa2a" : "0 0 6px #aa4a2a",
              }}/>
              <span style={{fontSize:8,color: online ? "#3a7a2a" : "#7a3a2a", letterSpacing:0.5}}>
                {online ? "Online" : "Offline — dados salvos"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"scroll",overflowX:"hidden",WebkitOverflowScrolling:"touch",minHeight:0,position:"relative",zIndex:5,padding:"14px 14px 0"}}>
        {aba==="registrar" && <Registrar onSave={handleSave} editData={editReg} onCancelEdit={()=>{setEditReg(null);setAba("historico");}}/>}
        {aba==="historico" && <Historico registros={registros} onEdit={handleEdit} onDelete={handleDelete}/>}
        {aba==="resumo"    && <Resumo registros={registros}/>}
      </div>

      {/* Bottom nav */}
      <div style={{
        flexShrink:0,position:"relative",zIndex:10,
        background:"rgba(6,14,3,0.97)",
        backdropFilter:"blur(20px)",
        borderTop:"1px solid #1a3a0a",
        display:"flex",
        paddingBottom:"env(safe-area-inset-bottom,0px)",
        boxShadow:"0 -8px 32px rgba(0,0,0,0.6)",
      }}>
        {TABS.map(({id,label,Icon})=>{
          const active=aba===id;
          return (
            <button key={id} onClick={()=>setAba(id)} style={{
              flex:1,border:"none",cursor:"pointer",fontFamily:"inherit",
              background:"transparent",padding:"10px 0 8px",
              display:"flex",flexDirection:"column",alignItems:"center",gap:3,
              position:"relative",
            }}>
              {active&&(
                <div style={{
                  position:"absolute",top:0,left:"20%",right:"20%",height:2,
                  background:"linear-gradient(90deg,#3a8020,#d0c040)",
                  borderRadius:"0 0 3px 3px",
                  boxShadow:"0 0 8px #a0d04066",
                }}/>
              )}
              <Icon size={21} active={active}/>
              <span style={{
                fontSize:8.5,letterSpacing:0.5,
                color:active?"#a0c050":"#1e3a1a",
                textTransform:"uppercase",
                fontWeight:active?"bold":"normal",
              }}>{label}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        html,body,#root{margin:0;padding:0;height:100%;width:100%;overflow:hidden;background:#060e04;}
        input,select{outline:none;}
        input:focus,select:focus{border-color:#3a7a1a!important;box-shadow:0 0 0 3px rgba(58,122,26,0.15)!important;}
        ::-webkit-scrollbar{width:2px;}
        ::-webkit-scrollbar-thumb{background:#1a3a0a;border-radius:2px;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.4) sepia(1) hue-rotate(80deg);cursor:pointer;}
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box;}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-14px) scale(0.88)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
        select option{background:#0a1a06;color:#c0d0a0;}
      `}</style>
    </div>
  );
}

// Emoji fallback for chips (small use)
const CULTURA_ICONS_EMOJI={Soja:"🌱",Sorgo:"🌾",Trigo:"🌾",Milho:"🌽",Feijão:"🫘"};

const IS={
  width:"100%",background:"rgba(10,20,6,0.8)",border:"1px solid #1a3a0a",
  color:"#c0d090",padding:"11px 13px",borderRadius:10,
  fontSize:14,fontFamily:"inherit",transition:"all 0.2s",
  boxShadow:"inset 0 2px 8px rgba(0,0,0,0.4)",
};

const chipSt=active=>({
  padding:"4px 11px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",
  fontSize:11,whiteSpace:"nowrap",border:"1px solid",
  background:active?"linear-gradient(135deg,#162e0a,#0a1c06)":"transparent",
  borderColor:active?"#2a5a1a":"#152010",
  color:active?"#8ab050":"#2a4a2a",
  boxShadow:active?"0 0 8px rgba(42,90,26,0.3)":"none",
  transition:"all 0.15s",
});
