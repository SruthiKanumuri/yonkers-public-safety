import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const P={navy:"#10233f",blue:"#1f6feb",cyan:"#1aa6b7",green:"#20a35b",amber:"#f2a900",red:"#d83b3b",purple:"#7c4dff",muted:"#64748b",line:"#d9e2ef",bg:"#f4f7fb",card:"#ffffff",text:"#1e293b"};

// ── ADA: inject global accessibility CSS ─────────────────────────────────────
const ADA_CSS=`
  *:focus-visible { outline: 3px solid #1f6feb !important; outline-offset: 2px !important; border-radius: 4px; }
  .skip-nav { position:absolute; top:-100px; left:16px; background:#10233f; color:#fff; padding:10px 18px; border-radius:6px; font-weight:700; font-size:14px; z-index:99999; text-decoration:none; transition:top 0.1s; }
  .skip-nav:focus { top:16px; }
  body.ada-high-contrast { filter: contrast(1.55) saturate(1.2) !important; }
  body.ada-large-text { font-size: 118% !important; }
  body.ada-large-text button, body.ada-large-text input, body.ada-large-text select, body.ada-large-text textarea { font-size: 1.05rem !important; }
  body.ada-reduce-motion * { animation: none !important; transition: none !important; }
  body.ada-dyslexia { font-family: Arial, Helvetica, sans-serif !important; letter-spacing: 0.06em !important; word-spacing: 0.18em !important; line-height: 1.8 !important; }
  .ada-toolbar { position:fixed; bottom:24px; left:24px; z-index:9998; display:flex; flex-direction:column; align-items:flex-start; gap:6px; }
  .ada-toggle-btn { background:#10233f; color:#fff; border:none; border-radius:50%; width:48px; height:48px; font-size:22px; cursor:pointer; box-shadow:0 4px 16px rgba(0,0,0,0.22); display:grid; place-items:center; }
  .ada-toggle-btn:hover { background:#1f6feb; }
  .ada-panel { background:#fff; border:1.5px solid #d9e2ef; border-radius:14px; padding:16px; min-width:224px; box-shadow:0 8px 32px rgba(15,35,63,0.14); }
  .ada-panel-title { font-size:12px; font-weight:800; color:#10233f; text-transform:uppercase; letter-spacing:.07em; margin-bottom:10px; }
  .ada-option { display:flex; align-items:center; justify-content:space-between; padding:7px 0; border-bottom:1px solid #f1f5f9; font-size:13px; color:#1e293b; gap:10px; }
  .ada-option:last-child { border-bottom:none; }
  .ada-switch { width:38px; height:22px; border-radius:999px; border:none; background:#d9e2ef; cursor:pointer; position:relative; transition:background 0.2s; flex-shrink:0; }
  .ada-switch.on { background:#1f6feb; }
  .ada-switch::after { content:''; position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:left 0.2s; }
  .ada-switch.on::after { left:19px; }
  .ada-font-btn { background:#f1f5f9; border:1px solid #d9e2ef; border-radius:6px; width:28px; height:28px; cursor:pointer; font-weight:700; font-size:13px; display:grid; place-items:center; color:#1e293b; }
  .ada-font-btn:hover { background:#e2e8f0; }
`;

function injectADAStyles(){
  if(document.getElementById("ada-styles"))return;
  const s=document.createElement("style");
  s.id="ada-styles"; s.textContent=ADA_CSS;
  document.head.appendChild(s);
}

function ADAToolbar(){
  const[open,setOpen]=useState(false);
  const[highContrast,setHighContrast]=useState(false);
  const[largeText,setLargeText]=useState(false);
  const[reduceMotion,setReduceMotion]=useState(false);
  const[dyslexia,setDyslexia]=useState(false);
  const[fontSize,setFontSize]=useState(100);
  useEffect(()=>{ injectADAStyles(); },[]);
  const toggle=(cls,val)=>{ val?document.body.classList.add(cls):document.body.classList.remove(cls); };
  const toggleHC=()=>{ const v=!highContrast; setHighContrast(v); toggle("ada-high-contrast",v); };
  const toggleLT=()=>{ const v=!largeText; setLargeText(v); toggle("ada-large-text",v); };
  const toggleRM=()=>{ const v=!reduceMotion; setReduceMotion(v); toggle("ada-reduce-motion",v); };
  const toggleDX=()=>{ const v=!dyslexia; setDyslexia(v); toggle("ada-dyslexia",v); };
  const changeFS=(d)=>{ const n=Math.min(140,Math.max(80,fontSize+d)); setFontSize(n); document.documentElement.style.fontSize=n+"%"; };
  const resetAll=()=>{
    setHighContrast(false);setLargeText(false);setReduceMotion(false);setDyslexia(false);setFontSize(100);
    ["ada-high-contrast","ada-large-text","ada-reduce-motion","ada-dyslexia"].forEach(c=>document.body.classList.remove(c));
    document.documentElement.style.fontSize="100%"; setOpen(false);
  };
  const SW=({on,onToggle,label})=><button className={`ada-switch ${on?"on":""}`} role="switch" aria-checked={on} aria-label={label} onClick={onToggle}/>;
  return(
    <div className="ada-toolbar" role="region" aria-label="Accessibility options">
      {open&&(
        <div className="ada-panel" role="dialog" aria-label="Accessibility settings">
          <div className="ada-panel-title">♿ Accessibility</div>
          <div className="ada-option"><span>High contrast</span><SW on={highContrast} onToggle={toggleHC} label="Toggle high contrast"/></div>
          <div className="ada-option"><span>Large text</span><SW on={largeText} onToggle={toggleLT} label="Toggle large text"/></div>
          <div className="ada-option"><span>Reduce motion</span><SW on={reduceMotion} onToggle={toggleRM} label="Toggle reduce motion"/></div>
          <div className="ada-option"><span>Dyslexia font</span><SW on={dyslexia} onToggle={toggleDX} label="Toggle dyslexia font"/></div>
          <div className="ada-option">
            <span>Font size</span>
            <div style={{display:"flex",alignItems:"center",gap:6}} role="group" aria-label="Font size">
              <button className="ada-font-btn" onClick={()=>changeFS(-10)} aria-label="Decrease font size">A−</button>
              <span style={{fontSize:11,fontWeight:600,color:"#64748b",minWidth:32,textAlign:"center"}} aria-live="polite">{fontSize}%</span>
              <button className="ada-font-btn" onClick={()=>changeFS(10)} aria-label="Increase font size">A+</button>
            </div>
          </div>
          <button onClick={resetAll} style={{marginTop:10,width:"100%",background:"#f1f5f9",border:"1px solid #d9e2ef",borderRadius:8,padding:"7px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#475569"}} aria-label="Reset all accessibility settings">Reset all settings</button>
        </div>
      )}
      <button className="ada-toggle-btn" onClick={()=>setOpen(o=>!o)} aria-expanded={open} aria-haspopup="dialog" aria-label={open?"Close accessibility menu":"Open accessibility menu"} title="Accessibility options">♿</button>
    </div>
  );
}

const CAT_COLORS=["#d83b3b","#f2a900","#1f6feb","#20a35b","#7c4dff","#1aa6b7","#e91e8c","#64748b"];
const PRIO_COLORS={Critical:P.red,High:P.amber,Normal:P.blue,Low:P.green};
const FUNNEL_COLORS=[P.blue,P.cyan,P.amber,P.green];
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const API="http://localhost:3001/api";

function genData(days){
  return{
    trend:Array.from({length:days},(_,i)=>({date:new Date(Date.now()-(days-1-i)*86400000).toISOString().slice(0,10),count:rand(40,130)})),
    categories:[{name:"Theft",value:677},{name:"Suspicious",value:507},{name:"Vandalism",value:581},{name:"Vehicle",value:245},{name:"Noise",value:198},{name:"Other",value:210}],
    priorities:[{name:"Critical",count:44,pct:18},{name:"High",count:142,pct:58},{name:"Normal",count:1112,pct:92},{name:"Low",count:823,pct:70}],
    channels:[{name:"Mobile",count:1093,pct:100},{name:"Web",count:712,pct:65},{name:"Kiosk",count:290,pct:27},{name:"Call Ctr",count:485,pct:44}],
    funnel:[{stage:"Submitted",count:2418,pct:100},{stage:"Validated",count:1925,pct:80},{stage:"Assigned",count:1338,pct:55},{stage:"Resolved",count:942,pct:39}],
    kpis:[
      {id:1,label:"Total Reports",value:"2,418",trend:"▲ 14% vs prior",dir:"up"},
      {id:2,label:"High Priority",value:"186",trend:"▼ 6% fewer",dir:"down"},
      {id:3,label:"Avg Response",value:"11m",trend:"▲ 22% faster",dir:"up"},
      {id:4,label:"Resolution Rate",value:"78%",trend:"▲ 5 pts",dir:"up"},
      {id:5,label:"Queue Backlog",value:"143",trend:"● Watch",dir:"flat"},
      {id:6,label:"Spam Rate",value:"4.7%",trend:"▼ 1.2 pts",dir:"down"},
      {id:7,label:"Anon Tips",value:"32%",trend:"▲ 3 pts",dir:"up"},
      {id:8,label:"Satisfaction",value:"4.3/5",trend:"▲ 0.4",dir:"up"},
    ],
    queue:[
      {id:"YR-2026-1048",category:"Suspicious Activity",location:"Getty Square",priority:"Critical",status:"Needs Review",team:"Patrol Desk",sla:"18 min left"},
      {id:"YR-2026-1039",category:"Vehicle Break-in",location:"Park Hill",priority:"High",status:"Assigned",team:"Field Unit B",sla:"42 min left"},
      {id:"YR-2026-1021",category:"Vandalism",location:"Nodine Hill",priority:"High",status:"Evidence Review",team:"Investigations",sla:"1h 12m left"},
      {id:"YR-2026-1012",category:"Noise/Disturbance",location:"Waterfront",priority:"Normal",status:"Pending",team:"Queue",sla:"On track"},
      {id:"YR-2026-0998",category:"Theft",location:"McLean Ave",priority:"Critical",status:"Needs Review",team:"Field Unit A",sla:"5 min left"},
      {id:"YR-2026-0991",category:"Assault",location:"Getty Square",priority:"High",status:"Assigned",team:"Special Ops",sla:"29 min left"},
    ],
    sla:{compliance:84,onTime:156,total:186},
    hotspots:[{location:"Getty Square",count:33,x:82,y:58,color:P.red},{location:"Waterfront",count:28,x:245,y:82,color:P.red},{location:"Park Hill",count:19,x:175,y:115,color:P.amber},{location:"Nodine Hill",count:14,x:118,y:162,color:P.blue}],
    heatmap:{days:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],hours:[0,3,6,9,12,15,18,21],grid:Object.fromEntries(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].flatMap(d=>[0,3,6,9,12,15,18,21].map(h=>[`${d}-${h}`,rand(0,12)]))),max:12},
  };
}

function useData(filters){
  const[data,setData]=useState(()=>genData(30));
  const[live,setLive]=useState(false);
  const[loading,setLoading]=useState(false);
  const qs=`?days=${filters.days}&precinct=${filters.precinct}&channel=${filters.channel}&priority=${filters.priority}`;
  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const[kpis,trend,categories,priorities,channels,funnel,sla,queue]=await Promise.all([
        fetch(`${API}/kpis${qs}`).then(r=>r.json()),fetch(`${API}/trend${qs}`).then(r=>r.json()),
        fetch(`${API}/categories${qs}`).then(r=>r.json()),fetch(`${API}/priorities${qs}`).then(r=>r.json()),
        fetch(`${API}/channels${qs}`).then(r=>r.json()),fetch(`${API}/funnel${qs}`).then(r=>r.json()),
        fetch(`${API}/sla${qs}`).then(r=>r.json()),fetch(`${API}/queue${qs}`).then(r=>r.json()),
      ]);
      setData(d=>({...d,kpis,trend,categories,priorities,channels,funnel,sla,queue:queue.map(r=>({...r,sla:r.slaFormatted||r.sla||"—"}))}));
      setLive(true);
    }catch{setData(genData(parseInt(filters.days)||30));setLive(false);}
    finally{setLoading(false);}
  },[qs]);
  useEffect(()=>{load();},[load]);
  return{data,live,loading,reload:load};
}

function useBreakpoint(){
  const get=()=>({isMobile:window.innerWidth<640,isTablet:window.innerWidth>=640&&window.innerWidth<1024,isDesktop:window.innerWidth>=1024});
  const[bp,setBp]=useState(get);
  useEffect(()=>{const fn=()=>setBp(get());window.addEventListener("resize",fn);return()=>window.removeEventListener("resize",fn);},[]);
  return bp;
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function PBadge({p}){const c={Critical:{bg:"#ffe7e7",cl:"#b42323"},High:{bg:"#fff2cc",cl:"#925a00"},Normal:{bg:"#e8f6ee",cl:"#146c3e"},Low:{bg:"#eef4ff",cl:"#174073"}}[p]||{bg:"#eef4ff",cl:"#174073"};return<span style={{...c,borderRadius:999,padding:"3px 9px",fontWeight:800,fontSize:11,whiteSpace:"nowrap"}}>{p}</span>;}
function SBadge({s}){return<span style={{background:"#eef4ff",color:"#174073",borderRadius:999,padding:"3px 9px",fontWeight:800,fontSize:11,whiteSpace:"nowrap"}}>{s}</span>;}
function Btn({children,onClick,color="blue",style={}}){const c={blue:{bg:P.blue,cl:"#fff"},navy:{bg:P.navy,cl:"#fff"},red:{bg:P.red,cl:"#fff"},light:{bg:"#eef4ff",cl:"#174073"},amber:{bg:"#fff2cc",cl:"#925a00"},ghost:{bg:"transparent",cl:P.muted,border:`1px solid ${P.line}`}}[color];return<button onClick={onClick} style={{background:c.bg,color:c.cl,border:c.border||0,borderRadius:9,padding:"8px 14px",fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",...style}}>{children}</button>;}

function Gauge({v}){
  const color=v>=80?P.green:v>=60?P.amber:P.red;
  const a=(v/100)*180;const ex=(110+90*Math.cos(Math.PI-a*Math.PI/180)).toFixed(2);const ey=(110-90*Math.sin(a*Math.PI/180)).toFixed(2);
  return<div style={{textAlign:"center"}}><svg viewBox="0 0 220 130" width="100%" style={{maxWidth:200,overflow:"visible"}}>
    <path d="M20,110 A90,90 0 0,1 200,110" fill="none" stroke="#e8eef6" strokeWidth={18} strokeLinecap="round"/>
    <path d={`M20,110 A90,90 0 ${a>90?1:0},1 ${ex},${ey}`} fill="none" stroke={color} strokeWidth={18} strokeLinecap="round"/>
    <text x="110" y="108" textAnchor="middle" fontSize="30" fontWeight="900" fill={P.navy}>{v}%</text>
    <text x="110" y="125" textAnchor="middle" fontSize="11" fill={P.muted}>SLA Compliance</text>
  </svg></div>;
}

function Heatmap({hm}){
  if(!hm)return null;
  const getS=v=>{const p=v/hm.max;return p<0.2?{bg:"#d9e9ff",cl:"#173b70"}:p<0.4?{bg:"#a9cffc",cl:"#173b70"}:p<0.6?{bg:"#6fa8f7",cl:"#fff"}:p<0.8?{bg:P.blue,cl:"#fff"}:{bg:P.navy,cl:"#fff"}};
  return<div style={{overflowX:"auto"}}><div style={{minWidth:260}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:3}}>
      {hm.days.map(d=><div key={d} style={{height:22,borderRadius:4,background:"#e8eef6",display:"grid",placeItems:"center",fontSize:9,color:"#173b70",fontWeight:800}}>{d}</div>)}
    </div>
    {hm.hours.map(h=><div key={h} style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:3}}>
      {hm.days.map(d=>{const v=hm.grid[`${d}-${h}`]||0;const s=getS(v);return<div key={d} style={{height:22,borderRadius:4,display:"grid",placeItems:"center",fontSize:8,fontWeight:800,background:s.bg,color:s.cl}}>{v||""}</div>;})}
    </div>)}
  </div></div>;
}

// Real Leaflet map — requires: npm install leaflet react-leaflet
function GeoMap({hotspots}){
  const[L,setL]=useState(null);
  const[MapComponents,setMapComponents]=useState(null);
  const mapRef=useRef(null);

  useEffect(()=>{
    // Dynamically import leaflet to avoid SSR issues
    Promise.all([
      import('leaflet'),
      import('react-leaflet')
    ]).then(([leaflet,reactLeaflet])=>{
      // Fix default marker icons
      delete leaflet.default.Icon.Default.prototype._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setL(leaflet.default);
      setMapComponents(reactLeaflet);
    }).catch(()=>{
      // Fallback if leaflet not installed
      setL(null);
    });
    // Load leaflet CSS
    if(!document.getElementById('leaflet-css')){
      const link=document.createElement('link');
      link.id='leaflet-css';
      link.rel='stylesheet';
      link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  },[]);

  // Real Yonkers coordinates for each hotspot
  const hotspotCoords={
    "Getty Square":   [40.9312,-73.8988],
    "Waterfront":     [40.9280,-73.8942],
    "Park Hill":      [40.9356,-73.8847],
    "Nodine Hill":    [40.9389,-73.9012],
    "McLean Ave":     [40.9201,-73.8756],
    "Yonkers Ave":    [40.9145,-73.8934],
  };

  const priorityColor=(count)=>{
    if(count>=30) return P.red;
    if(count>=20) return P.amber;
    return P.blue;
  };

  if(!MapComponents||!L){
    return(
      <div style={{height:280,borderRadius:12,background:"linear-gradient(135deg,#dfefff,#f8fbff)",border:`1px solid ${P.line}`,display:"grid",placeItems:"center"}}>
        <div style={{textAlign:"center",color:P.muted}}>
          <div style={{fontSize:28,marginBottom:8}}>🗺️</div>
          <div style={{fontSize:13,fontWeight:600}}>Loading map...</div>
          <div style={{fontSize:11,marginTop:4}}>Run: npm install leaflet react-leaflet</div>
        </div>
      </div>
    );
  }

  const{MapContainer,TileLayer,CircleMarker,Popup}=MapComponents;

  return(
    <div style={{height:280,borderRadius:12,overflow:"hidden",border:`1px solid ${P.line}`}}>
      <MapContainer
        center={[40.9312,-73.8988]}
        zoom={13}
        style={{height:"100%",width:"100%"}}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {(hotspots||[]).map(z=>{
          const coords=hotspotCoords[z.location]||[40.9312,-73.8988];
          const color=priorityColor(z.count);
          return(
            <CircleMarker
              key={z.location}
              center={coords}
              radius={Math.max(12,z.count/2)}
              pathOptions={{
                fillColor:color,
                fillOpacity:0.85,
                color:"#fff",
                weight:2,
              }}
            >
              <Popup>
                <div style={{textAlign:"center",padding:"4px 8px"}}>
                  <strong style={{fontSize:14,color:P.navy}}>{z.location}</strong><br/>
                  <span style={{fontSize:13,color:color,fontWeight:700}}>{z.count} reports</span><br/>
                  <span style={{fontSize:11,color:P.muted}}>
                    {z.count>=30?"🔴 Critical hotspot":z.count>=20?"🟡 High activity":"🔵 Moderate activity"}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// ── Sidebar (reused in admin pages) ──────────────────────────────────────────
function AdminSidebar({activeItem,items,onNavigate}){
  return<aside style={{width:200,background:"#0f1f38",color:"#fff",padding:"20px 0",flexShrink:0,minHeight:"100vh"}}>
    <div style={{padding:"0 16px 18px",borderBottom:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:34,height:34,borderRadius:8,background:"#fff",color:P.navy,display:"grid",placeItems:"center",fontWeight:900,fontSize:15,flexShrink:0}}>Y</div>
      <div><div style={{fontSize:11,fontWeight:800,lineHeight:1.3}}>City of Yonkers</div><div style={{fontSize:10,opacity:.65}}>Public Safety Admin</div></div>
    </div>
    <nav style={{padding:"10px 0"}}>
      {items.map(([label,icon])=>{const active=label===activeItem;return<div key={label} onClick={()=>onNavigate&&onNavigate(label)} style={{padding:"9px 16px",fontSize:12,fontWeight:active?700:400,background:active?"rgba(255,255,255,.13)":"transparent",color:active?"#fff":"rgba(255,255,255,.65)",cursor:"pointer",borderLeft:active?`3px solid ${P.blue}`:"3px solid transparent",transition:"background .15s"}}>{icon} {label}</div>;})}
    </nav>
  </aside>;
}

// ── NavBar ─────────────────────────────────────────────────────────────────────
// ── PAGE 0: Demo Login ────────────────────────────────────────────────────────
function PageLogin({onLogin}){
  const ROLES=[
    {key:"citizen",label:"Citizen",icon:"🧑",desc:"Report incidents & track your cases",email:"citizen@yonkers.gov",pass:"demo1234",color:P.blue,landing:"report"},
    {key:"admin",label:"Admin",icon:"🔐",desc:"Full system access & dispatch controls",email:"admin@yonkers.gov",pass:"admin5678",color:P.navy,landing:"admin"},
  ];
  const[role,setRole]=useState("citizen");
  const[email,setEmail]=useState("citizen@yonkers.gov");
  const[pass,setPass]=useState("demo1234");
  const[showPass,setShowPass]=useState(false);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");
  const selectRole=(r)=>{setRole(r.key);setEmail(r.email);setPass(r.pass);setError("");};
  const handleLogin=(e)=>{
    e.preventDefault();setError("");
    const matched=ROLES.find(r=>r.email===email&&r.pass===pass);
    if(!matched){setError("Invalid credentials. Use Auto-fill for demo access.");return;}
    setLoading(true);
    setTimeout(()=>{setLoading(false);onLogin(matched.key,matched.landing);},900);
  };
  const activeRole=ROLES.find(r=>r.key===role);
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${P.navy} 0%,#1565c0 60%,#1aa6b7 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-120,right:-120,width:400,height:400,borderRadius:"50%",background:"rgba(255,255,255,.04)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-80,left:-80,width:300,height:300,borderRadius:"50%",background:"rgba(255,255,255,.04)",pointerEvents:"none"}}/>
      <div style={{textAlign:"center",marginBottom:28,color:"#fff"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
          <svg width="56" height="64" viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M28 3L4 13V32C4 46 14 58 28 62C42 58 52 46 52 32V13L28 3Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
            <path d="M28 11L11 18.5V32C11 42.5 18.5 52 28 55.5C37.5 52 45 42.5 45 32V18.5L28 11Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
            <text x="28" y="38" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="Arial,sans-serif">Y</text>
          </svg>
        </div>
        <h1 style={{margin:"0 0 6px",fontSize:24,fontWeight:900,letterSpacing:"-.01em"}}>Yonkers Public Safety</h1>
        <p style={{margin:0,opacity:.8,fontSize:14}}>Integrated Crime Reporting & Community Response</p>
      </div>
      <div style={{background:P.card,borderRadius:20,padding:28,width:"100%",maxWidth:420,boxShadow:"0 24px 64px rgba(0,0,0,.25)"}}>
        <div style={{marginBottom:20}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:P.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>Sign in as</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {ROLES.map(r=>(
              <button key={r.key} type="button" onClick={()=>selectRole(r)}
                style={{border:`2px solid ${role===r.key?r.color:P.line}`,background:role===r.key?"#eef4ff":"#f8faff",borderRadius:11,padding:"12px 10px",cursor:"pointer",textAlign:"center",transition:"all .15s"}}
                aria-pressed={role===r.key}>
                <div style={{fontSize:22,marginBottom:4}}>{r.icon}</div>
                <div style={{fontSize:13,fontWeight:700,color:role===r.key?r.color:P.text}}>{r.label}</div>
                <div style={{fontSize:10,color:P.muted,lineHeight:1.4,marginTop:2}}>{r.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{background:"#f0f9ff",border:"1px solid #bae0fd",borderRadius:10,padding:"10px 13px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:"#0369a1",marginBottom:2}}>🎯 Demo credentials</div>
            <div style={{fontSize:11,color:P.muted}}>{activeRole?.email} / {activeRole?.pass}</div>
          </div>
          <button type="button" onClick={()=>{setEmail(activeRole.email);setPass(activeRole.pass);setError("");}}
            style={{background:"#0369a1",color:"#fff",border:0,borderRadius:7,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
            Auto-fill ↗
          </button>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{marginBottom:12}}>
            <label htmlFor="login-email" style={{display:"block",fontSize:11,fontWeight:700,color:P.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Email address</label>
            <input id="login-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"
              style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${error?P.red:P.line}`,borderRadius:9,fontSize:14,boxSizing:"border-box"}}
              aria-describedby={error?"login-error":undefined}/>
          </div>
          <div style={{marginBottom:16}}>
            <label htmlFor="login-pass" style={{display:"block",fontSize:11,fontWeight:700,color:P.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Password</label>
            <div style={{position:"relative"}}>
              <input id="login-pass" type={showPass?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)} required autoComplete="current-password"
                style={{width:"100%",padding:"10px 40px 10px 12px",border:`1.5px solid ${error?P.red:P.line}`,borderRadius:9,fontSize:14,boxSizing:"border-box"}}/>
              <button type="button" onClick={()=>setShowPass(s=>!s)}
                style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:0,cursor:"pointer",fontSize:16,color:P.muted,padding:0}}
                aria-label={showPass?"Hide password":"Show password"}>{showPass?"🙈":"👁️"}</button>
            </div>
          </div>
          {error&&<div id="login-error" role="alert" style={{background:"#fff0f0",border:`1px solid ${P.red}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:P.red,marginBottom:12,fontWeight:600}}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{width:"100%",background:loading?"#94a3b8":activeRole?.color||P.blue,color:"#fff",border:0,borderRadius:10,padding:"13px",fontWeight:800,fontSize:15,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
            aria-busy={loading}>
            {loading?<><span style={{display:"inline-block",width:16,height:16,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>Signing in…</>:`Sign in as ${activeRole?.label} →`}
          </button>
        </form>
        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:P.muted,lineHeight:1.6}}>
          This is a <strong>demo environment</strong>. No real data is stored.<br/>
          For emergencies call <strong style={{color:P.red}}>911</strong>.
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:20,flexWrap:"wrap",justifyContent:"center"}}>
        {[["🟢","System online"],["🔒","Secure connection"],["♿","ADA compliant"]].map(([icon,label])=>(
          <div key={label} style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,padding:"5px 13px",fontSize:12,color:"#fff",display:"flex",alignItems:"center",gap:5}}>{icon} {label}</div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function NavBar({page,setPage,live,user,onLogout}){
  const allPages=[{id:"report",label:"📝 Report Crime"},{id:"dashboard",label:"📊 My Dashboard"},{id:"analytics",label:"📈 Analytics"},{id:"queue",label:"📋 Manage Queue"},{id:"admin",label:"🔐 Admin"}];
  const pages=user==="citizen"?allPages.filter(p=>p.id!=="queue"&&p.id!=="admin"):allPages;
  return<nav aria-label="Main navigation" style={{background:P.navy,color:"#fff",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:52,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(0,0,0,.25)",gap:12,flexWrap:"wrap"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
      <svg width="28" height="32" viewBox="0 0 28 32" fill="none"><path d="M14 1L2 6V16C2 23 7 29 14 31C21 29 26 23 26 16V6L14 1Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/><text x="14" y="20" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">Y</text></svg>
      <span style={{fontWeight:800,fontSize:14,whiteSpace:"nowrap"}}>Yonkers Public Safety</span>
    </div>
    <div role="menubar" aria-label="Page navigation" style={{display:"flex",gap:3,alignItems:"center",flexWrap:"wrap"}}>
      {pages.map(p=><button key={p.id} role="menuitem" aria-current={page===p.id?"page":undefined} onClick={()=>setPage(p.id)} style={{background:page===p.id?"rgba(255,255,255,.17)":"transparent",color:"#fff",border:page===p.id?"1px solid rgba(255,255,255,.28)":"1px solid transparent",borderRadius:8,padding:"5px 11px",fontWeight:page===p.id?700:500,fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>{p.label}</button>)}
      <span aria-live="polite" style={{marginLeft:6,background:"rgba(255,255,255,.11)",borderRadius:999,padding:"3px 10px",fontSize:11}}>{live?"🟢 Live":"🟡 Demo"}</span>
      {user&&<div style={{display:"flex",alignItems:"center",gap:8,marginLeft:8,paddingLeft:10,borderLeft:"1px solid rgba(255,255,255,.2)"}}>
        <span style={{fontSize:12,opacity:.85}}>{user==="admin"?"🔐 Admin":"🧑 Citizen"}</span>
        <button onClick={onLogout} style={{background:"rgba(255,255,255,.12)",color:"#fff",border:"1px solid rgba(255,255,255,.2)",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer"}} aria-label="Sign out">Sign out</button>
      </div>}
    </div>
  </nav>;
}

// ── PAGE 1: Report Crime (Redesigned) ─────────────────────────────────────────
function PageReportCrime({onSubmit}){
  const STEPS=['Category','Details','Evidence','Contact','Review'];
  const[step,setStep]=useState(0);
  const[form,setForm]=useState({type:"",date:"",time:"",location:"",details:"",contact:"app",files:[]});
  const[submitted,setSubmitted]=useState(false);
  const[mapReady,setMapReady]=useState(false);
  const[MapC,setMapC]=useState(null);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  const CATS=[
    {key:"Vehicle Incident",icon:"🚗",desc:"Theft, vandalism, abandoned vehicle, or hit-and-run"},
    {key:"Property Crime",icon:"🏠",desc:"Burglary, theft, damaged property, or trespassing"},
    {key:"Community Concern",icon:"🧍",desc:"Noise, disorderly conduct, or public nuisance"},
    {key:"Submit a Tip",icon:"📎",desc:"Share information or photos anonymously"},
    {key:"Suspicious Activity",icon:"👁️",desc:"Unusual behavior or concerning individuals"},
    {key:"Assault",icon:"🚨",desc:"Physical altercation or threats of violence"},
  ];

  const CONTACTS=[
    {key:"app",icon:"📱",label:"App notification"},
    {key:"email",icon:"✉️",label:"Email"},
    {key:"phone",icon:"📞",label:"Phone call"},
    {key:"anon",icon:"🔒",label:"Stay anonymous"},
  ];

  useEffect(()=>{
    if(step===1){
      Promise.all([import('leaflet'),import('react-leaflet')]).then(([L,RL])=>{
        delete L.default.Icon.Default.prototype._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
        setMapC(RL);setMapReady(true);
      }).catch(()=>{});
      if(!document.getElementById('lf-css-rc')){
        const l=document.createElement('link');l.id='lf-css-rc';l.rel='stylesheet';
        l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(l);
      }
    }
  },[step]);

  function MapClickHandler(){
    const{useMapEvents}=MapC;
    useMapEvents({click(e){
      set('lat',e.latlng.lat);set('lng',e.latlng.lng);
      set('location',`${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
    }});
    return null;
  }

  const handleSubmit=async()=>{
    try{await fetch(`${API}/reports`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({category:form.type||"Other",location:form.location||"Unknown",priority:"Normal",channel:"Web",description:form.details})});}catch{}
    setSubmitted(true);if(onSubmit)onSubmit();
  };

  const canNext=()=>{
    if(step===0) return !!form.type;
    if(step===1) return !!form.location||!!form.details;
    return true;
  };

  if(submitted)return(
    <div style={{minHeight:"80vh",display:"grid",placeItems:"center",background:P.bg}}>
      <div style={{background:P.card,borderRadius:20,padding:"48px 40px",textAlign:"center",maxWidth:420,boxShadow:"0 16px 48px rgba(15,35,63,.1)"}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"#e8f6ee",display:"grid",placeItems:"center",margin:"0 auto 20px",fontSize:32}}>✅</div>
        <h2 style={{margin:"0 0 10px",color:P.navy,fontSize:22,fontWeight:700}}>Report submitted!</h2>
        <p style={{color:P.muted,marginBottom:8,lineHeight:1.6,fontSize:14}}>Your case number is</p>
        <div style={{background:"#eef4ff",borderRadius:10,padding:"12px 20px",marginBottom:20,display:"inline-block"}}>
          <span style={{fontWeight:700,color:P.blue,fontSize:18,letterSpacing:".04em"}}>YR-2026-{rand(1000,9999)}</span>
        </div>
        <p style={{color:P.muted,marginBottom:24,fontSize:13}}>You'll receive updates via your selected contact preference. Save your case number for reference.</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>{setSubmitted(false);setStep(0);setForm({type:"",date:"",time:"",location:"",details:"",contact:"app",files:[]});}} style={{flex:1,background:P.card,color:P.text,border:`1px solid ${P.line}`,borderRadius:10,padding:"11px",fontWeight:600,cursor:"pointer",fontSize:13}}>New report</button>
          <button style={{flex:1,background:P.navy,color:"#fff",border:0,borderRadius:10,padding:"11px",fontWeight:600,cursor:"pointer",fontSize:13}}>Track status</button>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{background:P.bg,minHeight:"100vh"}}>
      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,${P.navy},#1565c0)`,color:"#fff",padding:"28px 32px 44px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <svg width="42" height="48" viewBox="0 0 42 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 2L3 9V23C3 33.5 11 42 21 46C31 42 39 33.5 39 23V9L21 2Z" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5"/>
              <path d="M21 8L10 13V23C10 30 15 36.5 21 39.5C27 36.5 32 30 32 23V13L21 8Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
              <text x="21" y="29" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold" fontFamily="Arial, sans-serif">Y</text>
            </svg>
            <div>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".12em",opacity:.75,marginBottom:3}}>City of Yonkers · Public Safety</div>
              <h1 style={{margin:0,fontSize:20,fontWeight:900,lineHeight:1.3}}>Integrated Crime Reporting & Community Response</h1>
            </div>
          </div>
          <a href="tel:911" style={{background:P.red,color:"#fff",borderRadius:10,padding:"10px 18px",fontWeight:800,textDecoration:"none",fontSize:14,flexShrink:0,display:"flex",alignItems:"center",gap:6}}>🚨 Call 911</a>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:20,alignItems:"center",flexWrap:"wrap"}}>
          <div>
            <h2 style={{margin:"0 0 6px",fontSize:16,fontWeight:700,opacity:.95}}>Report a crime or safety concern</h2>
            <p style={{margin:0,opacity:.8,fontSize:13,lineHeight:1.6}}>Submit non-emergency reports, upload evidence, check case status, and connect with Yonkers public safety services from one secure app.</p>
          </div>
          <div style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",borderRadius:12,padding:"12px 16px",minWidth:200,flexShrink:0}}>
            <div style={{fontSize:11,fontWeight:700,marginBottom:8,opacity:.9}}>System Status</div>
            {[["🟢","Online reporting"],["🔒","Evidence upload"],["🔔","Notifications"]].map(([icon,label])=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.08)",fontSize:11}}>
                <span style={{opacity:.8}}>{icon} {label}</span>
                <span style={{background:"rgba(32,163,91,.3)",color:"#7fffa8",borderRadius:999,padding:"1px 8px",fontWeight:700,fontSize:10}}>Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:980,margin:"0 auto",padding:"0 24px 40px",marginTop:-20}}>

        {/* Progress bar */}
        <div style={{background:P.card,borderRadius:12,padding:"14px 20px",marginBottom:16,boxShadow:"0 4px 14px rgba(15,35,63,.07)",display:"flex",alignItems:"center",gap:0}}>
          {STEPS.map((s,i)=>(
            <React.Fragment key={s}>
              <div style={{display:"flex",alignItems:"center",gap:6,cursor:i<step?"pointer":"default"}} onClick={()=>i<step&&setStep(i)}>
                <div style={{width:24,height:24,borderRadius:"50%",background:i<step?P.green:i===step?P.blue:"#e8eef6",color:i<=step?"#fff":P.muted,display:"grid",placeItems:"center",fontSize:11,fontWeight:700,flexShrink:0,transition:"all .2s"}}>
                  {i<step?"✓":i+1}
                </div>
                <span style={{fontSize:12,fontWeight:i===step?600:400,color:i===step?P.blue:i<step?P.green:P.muted,whiteSpace:"nowrap"}}>{s}</span>
              </div>
              {i<STEPS.length-1&&<div style={{flex:1,height:2,background:i<step?P.green:"#e8eef6",margin:"0 8px",borderRadius:999,transition:"background .3s",minWidth:12}}/>}
            </React.Fragment>
          ))}
        </div>

        {/* Emergency notice */}
        <div style={{background:"#fff8e7",border:`1px solid ${P.amber}`,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#633806",display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:16,flexShrink:0}}>⚠️</span>
          <span><strong>Emergency?</strong> Do not use this form for active crimes in progress or immediate danger. <strong>Call 911 immediately.</strong></span>
        </div>

        {/* Step 0 — Category */}
        {step===0&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16,alignItems:"start"}}>
            <div style={{background:P.card,borderRadius:14,overflow:"hidden",boxShadow:"0 4px 14px rgba(15,35,63,.07)"}}>
              <div style={{padding:"18px 20px",borderBottom:`1px solid ${P.line}`}}>
                <h2 style={{margin:0,fontSize:16,fontWeight:700,color:P.navy}}>What would you like to report?</h2>
                <p style={{margin:"4px 0 0",fontSize:12,color:P.muted}}>Choose the category that best describes the incident</p>
              </div>
              <div style={{padding:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {CATS.map(c=>(
                  <div key={c.key} onClick={()=>set("type",c.key)} style={{border:`${form.type===c.key?"2px solid "+P.blue:"1px solid "+P.line}`,background:form.type===c.key?"#eef4ff":P.card,borderRadius:11,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:12,transition:"all .15s"}}>
                    <div style={{width:38,height:38,borderRadius:9,background:form.type===c.key?"#b5d4f4":"#f1f5f9",display:"grid",placeItems:"center",fontSize:20,flexShrink:0}}>{c.icon}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:P.text,marginBottom:3}}>{c.key}</div>
                      <div style={{fontSize:11,color:P.muted,lineHeight:1.4}}>{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Side info panel */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{background:P.card,borderRadius:14,padding:18,boxShadow:"0 4px 14px rgba(15,35,63,.07)"}}>
                <h3 style={{margin:"0 0 12px",fontSize:14,fontWeight:700,color:P.navy}}>How it works</h3>
                {[{n:1,icon:"📋",t:"Choose category",d:"Select what best describes your incident"},{n:2,icon:"📍",t:"Add location",d:"Pin the location on the map or type an address"},{n:3,icon:"📸",t:"Upload evidence",d:"Attach photos, videos, or documents"},{n:4,icon:"✅",t:"Submit & track",d:"Get a case number and live status updates"}].map(s=>(
                  <div key={s.n} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:P.navy,color:"#fff",display:"grid",placeItems:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{s.n}</div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:P.text,marginBottom:2}}>{s.icon} {s.t}</div>
                      <div style={{fontSize:11,color:P.muted,lineHeight:1.4}}>{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{background:"#fff8e7",border:`1px solid ${P.amber}`,borderRadius:12,padding:14}}>
                <div style={{fontSize:12,fontWeight:700,color:"#925a00",marginBottom:6}}>⏱ Takes about 3 min</div>
                <div style={{fontSize:11,color:"#633806",lineHeight:1.5}}>Reports are reviewed within 24 hours. For urgent matters use priority escalation after submission.</div>
              </div>
              <div style={{background:"#eef4ff",border:`1px solid ${P.blue}`,borderRadius:12,padding:14}}>
                <div style={{fontSize:12,fontWeight:700,color:"#174073",marginBottom:6}}>📞 Non-emergency line</div>
                <div style={{fontSize:13,fontWeight:700,color:P.blue,marginBottom:2}}>(914) 377-7900</div>
                <div style={{fontSize:11,color:P.muted}}>Mon–Fri 8AM–6PM</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — Details */}
        {step===1&&(
          <div style={{background:P.card,borderRadius:14,overflow:"hidden",boxShadow:"0 4px 14px rgba(15,35,63,.07)"}}>
            <div style={{padding:"18px 20px",borderBottom:`1px solid ${P.line}`}}>
              <h2 style={{margin:0,fontSize:16,fontWeight:700,color:P.navy}}>Incident details</h2>
              <p style={{margin:"4px 0 0",fontSize:12,color:P.muted}}>Tell us when and where it happened</p>
            </div>
            <div style={{padding:20}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div><label style={{display:"block",fontSize:11,fontWeight:600,color:P.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>Date</label>
                  <input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={{width:"100%",padding:"9px 12px",border:`1px solid ${P.line}`,borderRadius:8,fontSize:13,boxSizing:"border-box"}}/></div>
                <div><label style={{display:"block",fontSize:11,fontWeight:600,color:P.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>Approximate time</label>
                  <input type="time" value={form.time} onChange={e=>set("time",e.target.value)} style={{width:"100%",padding:"9px 12px",border:`1px solid ${P.line}`,borderRadius:8,fontSize:13,boxSizing:"border-box"}}/></div>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <label style={{display:"block",fontSize:11,fontWeight:600,color:P.muted,textTransform:"uppercase",letterSpacing:".05em"}}>📍 Pin location on map <span style={{fontWeight:400,textTransform:"none",fontSize:11}}>(click map or type below)</span></label>
                  <button type="button" onClick={()=>{
                    if(!navigator.geolocation){alert("Geolocation not supported by your browser.");return;}
                    navigator.geolocation.getCurrentPosition(pos=>{
                      set("lat",pos.coords.latitude);
                      set("lng",pos.coords.longitude);
                      set("location",`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
                    },()=>alert("Unable to retrieve your location. Please allow location access."));
                  }} style={{background:"#eef4ff",color:P.blue,border:`1px solid #b5d4f4`,borderRadius:7,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                    📍 Use my location
                  </button>
                </div>
                <div style={{borderRadius:10,overflow:"hidden",border:`1px solid ${P.line}`,marginBottom:8}}>
                  {mapReady&&MapC
                    ?<MapC.MapContainer center={[form.lat||40.9312,form.lng||(-73.8988)]} zoom={14} style={{height:240,width:"100%"}}>
                        <MapC.TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                        <MapClickHandler/>
                        <MapC.Marker position={[form.lat||40.9312,form.lng||(-73.8988)]}><MapC.Popup>📍 Incident here</MapC.Popup></MapC.Marker>
                      </MapC.MapContainer>
                    :<div style={{height:240,background:"#f0f6ff",display:"grid",placeItems:"center",color:P.muted,fontSize:13}}>🗺️ Loading map...</div>
                  }
                </div>
                <input value={form.location} onChange={e=>set("location",e.target.value)} placeholder="Street address, intersection, or landmark…" style={{width:"100%",padding:"9px 12px",border:`1px solid ${P.line}`,borderRadius:8,fontSize:13,boxSizing:"border-box"}}/>
                {form.lat&&form.lat!==40.9312&&<div style={{fontSize:11,color:P.green,marginTop:4,fontWeight:600}}>✅ Pin placed at {Number(form.lat).toFixed(4)}, {Number(form.lng).toFixed(4)}</div>}
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:600,color:P.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>What happened?</label>
                <textarea value={form.details} onChange={e=>set("details",e.target.value)} rows={4} placeholder="Describe what happened, who was involved, direction of travel, vehicle descriptions, clothing, or other helpful details…" style={{width:"100%",padding:"9px 12px",border:`1px solid ${P.line}`,borderRadius:8,fontSize:13,resize:"vertical",boxSizing:"border-box"}}/>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Evidence */}
        {step===2&&(
          <div style={{background:P.card,borderRadius:14,overflow:"hidden",boxShadow:"0 4px 14px rgba(15,35,63,.07)"}}>
            <div style={{padding:"18px 20px",borderBottom:`1px solid ${P.line}`}}>
              <h2 style={{margin:0,fontSize:16,fontWeight:700,color:P.navy}}>Upload evidence <span style={{fontWeight:400,color:P.muted,fontSize:14}}>(optional)</span></h2>
              <p style={{margin:"4px 0 0",fontSize:12,color:P.muted}}>Photos, videos, or documents related to the incident</p>
            </div>
            <div style={{padding:20}}>
              <label style={{display:"block",border:`2px dashed ${P.line}`,borderRadius:12,padding:"32px 20px",textAlign:"center",cursor:"pointer",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="#f8faff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <input type="file" multiple accept="image/*,video/*,.pdf" onChange={e=>set("files",Array.from(e.target.files))} style={{display:"none"}}/>
                <div style={{fontSize:32,marginBottom:10}}>📁</div>
                <div style={{fontSize:14,fontWeight:600,color:P.text,marginBottom:4}}>Drag files here or click to browse</div>
                <div style={{fontSize:12,color:P.muted}}>JPG, PNG, MP4, PDF — max 50MB each</div>
              </label>
              {form.files.length>0&&(
                <div style={{marginTop:14}}>
                  {form.files.map((f,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#f8faff",borderRadius:8,marginBottom:6,fontSize:13}}>
                      <span style={{fontSize:18}}>📄</span>
                      <span style={{flex:1,color:P.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</span>
                      <span style={{color:P.muted,fontSize:11}}>{(f.size/1024).toFixed(0)}KB</span>
                      <button onClick={()=>set("files",form.files.filter((_,j)=>j!==i))} style={{background:"none",border:0,color:P.muted,cursor:"pointer",fontSize:16,padding:0}}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{marginTop:16,background:"#eef4ff",borderRadius:10,padding:"12px 14px",fontSize:12,color:"#174073"}}>
                <strong>Tip:</strong> Clear photos of the scene, vehicles, or suspects significantly improve case resolution rates.
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Contact */}
        {step===3&&(
          <div style={{background:P.card,borderRadius:14,overflow:"hidden",boxShadow:"0 4px 14px rgba(15,35,63,.07)"}}>
            <div style={{padding:"18px 20px",borderBottom:`1px solid ${P.line}`}}>
              <h2 style={{margin:0,fontSize:16,fontWeight:700,color:P.navy}}>How should we contact you?</h2>
              <p style={{margin:"4px 0 0",fontSize:12,color:P.muted}}>Choose how you want to receive case updates</p>
            </div>
            <div style={{padding:20}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                {CONTACTS.map(c=>(
                  <div key={c.key} onClick={()=>set("contact",c.key)} style={{border:`${form.contact===c.key?"2px solid "+P.blue:"1px solid "+P.line}`,background:form.contact===c.key?"#eef4ff":P.card,borderRadius:11,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,fontSize:14,fontWeight:form.contact===c.key?600:400,color:form.contact===c.key?P.blue:P.text,transition:"all .15s"}}>
                    <span style={{fontSize:22}}>{c.icon}</span>{c.label}
                  </div>
                ))}
              </div>
              {form.contact!=="anon"&&(
                <div style={{marginTop:4}}>
                  <label style={{display:"block",fontSize:11,fontWeight:600,color:P.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>{form.contact==="email"?"Email address":form.contact==="phone"?"Phone number":"Notification email"}</label>
                  <input type={form.contact==="email"?"email":"tel"} placeholder={form.contact==="email"?"your@email.com":form.contact==="phone"?"(914) 555-0100":"your@email.com"} style={{width:"100%",padding:"9px 12px",border:`1px solid ${P.line}`,borderRadius:8,fontSize:13,boxSizing:"border-box"}}/>
                </div>
              )}
              {form.contact==="anon"&&<div style={{background:"#e8f6ee",borderRadius:10,padding:"12px 14px",fontSize:12,color:"#146c3e",marginTop:4}}>✅ Your identity will not be shared with officers. The report itself is still fully processed.</div>}
            </div>
          </div>
        )}

        {/* Step 4 — Review */}
        {step===4&&(
          <div style={{background:P.card,borderRadius:14,overflow:"hidden",boxShadow:"0 4px 14px rgba(15,35,63,.07)"}}>
            <div style={{padding:"18px 20px",borderBottom:`1px solid ${P.line}`}}>
              <h2 style={{margin:0,fontSize:16,fontWeight:700,color:P.navy}}>Review your report</h2>
              <p style={{margin:"4px 0 0",fontSize:12,color:P.muted}}>Please check the details before submitting</p>
            </div>
            <div style={{padding:20}}>
              {[
                ["Category",form.type||"Not selected"],
                ["Date & time",`${form.date||"Not set"} ${form.time||""}`.trim()],
                ["Location",form.location||"Not set"],
                ["Description",form.details||(
                  <span style={{color:P.muted,fontStyle:"italic"}}>No description provided</span>
                )],
                ["Evidence",form.files.length>0?`${form.files.length} file(s) attached`:"No files attached"],
                ["Contact",CONTACTS.find(c=>c.key===form.contact)?.label||"App notification"],
              ].map(([label,value])=>(
                <div key={label} style={{display:"flex",gap:16,alignItems:"flex-start",padding:"10px 0",borderBottom:`1px solid ${P.line}`}}>
                  <span style={{fontSize:12,fontWeight:600,color:P.muted,minWidth:110,paddingTop:1}}>{label}</span>
                  <span style={{fontSize:13,color:P.text,flex:1,lineHeight:1.5}}>{value}</span>
                </div>
              ))}
              <div style={{marginTop:16,background:"#fff8e7",borderRadius:10,padding:"11px 14px",fontSize:12,color:"#633806"}}>
                By submitting this report you confirm the information is accurate to the best of your knowledge.
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{display:"flex",gap:10,marginTop:14}}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{background:P.card,color:P.text,border:`1px solid ${P.line}`,borderRadius:10,padding:"12px 20px",fontWeight:600,cursor:"pointer",fontSize:13,minWidth:100}}>← Back</button>}
          {step<4
            ?<button onClick={()=>canNext()&&setStep(s=>s+1)} style={{flex:1,background:canNext()?P.navy:"#b0bec5",color:"#fff",border:0,borderRadius:10,padding:"12px",fontWeight:600,cursor:canNext()?"pointer":"not-allowed",fontSize:14,transition:"background .2s"}}>
                {step===0&&!form.type?"Select a category to continue":"Continue →"}
              </button>
            :<button onClick={handleSubmit} style={{flex:1,background:P.green,color:"#fff",border:0,borderRadius:10,padding:"12px",fontWeight:700,cursor:"pointer",fontSize:14}}>✅ Submit report</button>
          }
        </div>
        {step===0&&<p style={{textAlign:"center",fontSize:11,color:P.muted,marginTop:10}}>Takes about 3 minutes to complete</p>}
      </div>
    </div>
  );
}

// ── PAGE 2: Citizen Dashboard ─────────────────────────────────────────────────
function PageDashboard({setPage}){
  const INIT_CASES=[
    {id:"YR-2026-0814",type:"Property Crime",location:"123 Warburton Ave",submitted:"May 12",status:"Under Review",update:"Assigned to Field Unit A",priority:"High",description:"Burglary reported at residence. Back window was broken. Laptop and jewelry missing.",officer:"Officer James Carter",phone:"(914) 377-7900",nextStep:"Evidence review scheduled for May 20"},
    {id:"YR-2026-0791",type:"Vehicle Incident",location:"Oak St Parking Lot",submitted:"May 8",status:"Resolved",update:"Case closed — officer report filed",priority:"Normal",description:"Vehicle break-in. Passenger window smashed. Bag and sunglasses taken from front seat.",officer:"Officer Maria Lopez",phone:"(914) 377-7900",nextStep:"Case closed. Report available for insurance."},
    {id:"YR-2026-0742",type:"Suspicious Activity",location:"Nodine Hill Park",submitted:"May 3",status:"Pending",update:"Awaiting additional information",priority:"Low",description:"Unknown individual observed near playground after closing hours. No direct threat reported.",officer:"Unassigned",phone:"(914) 377-7900",nextStep:"Pending precinct review"},
  ];
  const[cases,setCases]=useState(INIT_CASES);
  const[selectedCase,setSelectedCase]=useState(null);
  const[showNewReport,setShowNewReport]=useState(false);
  const[mapReady,setMapReady]=useState(false);
  const[MapComponents,setMapComponents]=useState(null);
  const[newForm,setNewForm]=useState({type:"",location:"",details:"",lat:40.9312,lng:-73.8988});
  const[submitted,setSubmitted]=useState(false);
  const sc={Resolved:{bg:"#e8f6ee",cl:"#146c3e"},"Under Review":{bg:"#fff2cc",cl:"#925a00"},Pending:{bg:"#eef4ff",cl:"#174073"}};
  const pc={High:{bg:"#ffe7e7",cl:"#b42323"},Normal:{bg:"#eef4ff",cl:"#174073"},Low:{bg:"#f1f5f9",cl:"#475569"}};
  const setF=(k,v)=>setNewForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    if(showNewReport){
      Promise.all([import('leaflet'),import('react-leaflet')]).then(([L,RL])=>{
        delete L.default.Icon.Default.prototype._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
        setMapComponents(RL);
        setMapReady(true);
      }).catch(()=>{});
      if(!document.getElementById('leaflet-css2')){
        const link=document.createElement('link');
        link.id='leaflet-css2';link.rel='stylesheet';
        link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
    }
  },[showNewReport]);

  const handleSubmitNew=(e)=>{
    e.preventDefault();
    const newCase={
      id:`YR-2026-${rand(1000,9999)}`,
      type:newForm.type||"Other",
      location:newForm.location||`${newForm.lat.toFixed(4)}, ${newForm.lng.toFixed(4)}`,
      submitted:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'}),
      status:"Pending",
      update:"Received — awaiting initial review",
      priority:"Normal",
      description:newForm.details,
      officer:"Unassigned",
      phone:"(914) 377-7900",
      nextStep:"Pending precinct review",
    };
    setCases(c=>[newCase,...c]);
    setSubmitted(true);
    setTimeout(()=>{setSubmitted(false);setShowNewReport(false);setNewForm({type:"",location:"",details:"",lat:40.9312,lng:-73.8988});},2500);
  };

  // Click handler component for map
  function LocationPicker(){
    const{useMapEvents}=MapComponents;
    useMapEvents({click(e){setF('lat',e.latlng.lat);setF('lng',e.latlng.lng);setF('location',`${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);},});
    return null;
  }

  return<div style={{background:P.bg,minHeight:"100vh"}}>

    {/* ── View Details Modal ── */}
    {selectedCase&&<div style={{position:"fixed",inset:0,background:"rgba(10,25,50,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setSelectedCase(null)}>
      <div style={{background:P.card,borderRadius:18,padding:28,maxWidth:540,width:"100%",boxShadow:"0 24px 64px rgba(10,25,50,.2)",position:"relative"}} onClick={e=>e.stopPropagation()}>
        <button onClick={()=>setSelectedCase(null)} style={{position:"absolute",top:16,right:16,background:"#f1f5f9",border:0,borderRadius:"50%",width:32,height:32,fontSize:18,cursor:"pointer",color:P.muted}}>×</button>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:18,flexWrap:"wrap"}}>
          <span style={{fontWeight:900,color:P.blue,fontSize:16}}>{selectedCase.id}</span>
          <span style={{...sc[selectedCase.status],borderRadius:999,padding:"3px 10px",fontWeight:800,fontSize:12}}>{selectedCase.status}</span>
          <span style={{...pc[selectedCase.priority],borderRadius:999,padding:"3px 10px",fontWeight:800,fontSize:12}}>{selectedCase.priority}</span>
        </div>
        <h2 style={{margin:"0 0 14px",fontSize:18,fontWeight:900,color:P.navy}}>{selectedCase.type}</h2>
        <div style={{display:"grid",gap:12,marginBottom:18}}>
          {[["📍 Location",selectedCase.location],["📅 Submitted",selectedCase.submitted],["👮 Assigned Officer",selectedCase.officer],["📞 Contact",selectedCase.phone],["💬 Latest Update",selectedCase.update],["🔜 Next Step",selectedCase.nextStep]].map(([l,v])=><div key={l} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:12,fontWeight:700,color:P.muted,minWidth:140,paddingTop:1}}>{l}</span>
            <span style={{fontSize:13,color:P.text,fontWeight:500}}>{v}</span>
          </div>)}
        </div>
        <div style={{background:"#f8faff",borderRadius:11,padding:14,marginBottom:18}}>
          <div style={{fontSize:12,fontWeight:700,color:P.muted,marginBottom:6}}>📋 INCIDENT DESCRIPTION</div>
          <p style={{margin:0,fontSize:13,color:P.text,lineHeight:1.6}}>{selectedCase.description}</p>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button onClick={()=>setSelectedCase(null)} style={{flex:1,background:P.blue,color:"#fff",border:0,borderRadius:10,padding:"11px 18px",fontWeight:700,cursor:"pointer",fontSize:13}}>Close</button>
          <button style={{flex:1,background:"#eef4ff",color:"#174073",border:0,borderRadius:10,padding:"11px 18px",fontWeight:700,cursor:"pointer",fontSize:13}}>📥 Download Report</button>
        </div>
      </div>
    </div>}

    {/* ── New Report Modal with Map ── */}
    {showNewReport&&<div style={{position:"fixed",inset:0,background:"rgba(10,25,50,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setShowNewReport(false)}>
      <div style={{background:P.card,borderRadius:18,padding:24,maxWidth:620,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(10,25,50,.2)",position:"relative"}} onClick={e=>e.stopPropagation()}>
        <button onClick={()=>setShowNewReport(false)} style={{position:"absolute",top:14,right:14,background:"#f1f5f9",border:0,borderRadius:"50%",width:32,height:32,fontSize:18,cursor:"pointer",color:P.muted}}>×</button>
        {submitted
          ?<div style={{textAlign:"center",padding:"32px 0"}}>
              <div style={{fontSize:52,marginBottom:12}}>✅</div>
              <h3 style={{margin:"0 0 8px",color:P.navy,fontSize:20}}>Report Submitted!</h3>
              <p style={{color:P.muted,fontSize:14}}>Your case has been created and is pending review.</p>
            </div>
          :<>
            <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:900}}>+ New Report</h2>
            <p style={{margin:"0 0 16px",color:P.muted,fontSize:13}}>Fill in the details and pin the location on the map.</p>
            <div style={{background:"#fff8e7",border:`1px solid ${P.amber}`,borderRadius:9,padding:"9px 13px",marginBottom:14,fontSize:12}}><strong>⚠️ Emergency?</strong> Do not use this form — <strong>Call 911</strong></div>
            <form onSubmit={handleSubmitNew}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                <div><label style={{fontSize:11,fontWeight:700,color:P.muted,display:"block",marginBottom:4,textTransform:"uppercase"}}>Incident Type *</label>
                  <select value={newForm.type} onChange={e=>setF('type',e.target.value)} required style={{width:"100%",padding:"9px 11px",border:`1px solid ${P.line}`,borderRadius:8,fontSize:13,background:P.card}}>
                    <option value="">Select type</option>
                    <option>Vehicle Incident</option><option>Property Crime</option>
                    <option>Community Concern</option><option>Suspicious Activity</option>
                    <option>Submit a Tip</option><option>Assault</option>
                  </select></div>
                <div><label style={{fontSize:11,fontWeight:700,color:P.muted,display:"block",marginBottom:4,textTransform:"uppercase"}}>Location</label>
                  <input value={newForm.location} onChange={e=>setF('location',e.target.value)} placeholder="Or click on map below" style={{width:"100%",padding:"9px 11px",border:`1px solid ${P.line}`,borderRadius:8,fontSize:13,boxSizing:"border-box"}}/></div>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:700,color:P.muted,display:"block",marginBottom:4,textTransform:"uppercase"}}>📍 Pin Location on Map <span style={{fontWeight:400,textTransform:"none"}}>(click to place pin)</span></label>
                <div style={{height:220,borderRadius:10,overflow:"hidden",border:`1px solid ${P.line}`}}>
                  {mapReady&&MapComponents
                    ?<MapComponents.MapContainer center={[newForm.lat,newForm.lng]} zoom={13} style={{height:"100%",width:"100%"}}>
                        <MapComponents.TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                        <LocationPicker/>
                        <MapComponents.Marker position={[newForm.lat,newForm.lng]}>
                          <MapComponents.Popup>📍 Incident location</MapComponents.Popup>
                        </MapComponents.Marker>
                      </MapComponents.MapContainer>
                    :<div style={{height:"100%",display:"grid",placeItems:"center",background:"#f8faff",color:P.muted,fontSize:13}}>🗺️ Loading map...</div>
                  }
                </div>
                {newForm.lat!==40.9312&&<div style={{fontSize:11,color:P.green,marginTop:4,fontWeight:600}}>✅ Pin placed at {newForm.lat.toFixed(5)}, {newForm.lng.toFixed(5)}</div>}
              </div>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:11,fontWeight:700,color:P.muted,display:"block",marginBottom:4,textTransform:"uppercase"}}>Incident Details</label>
                <textarea value={newForm.details} onChange={e=>setF('details',e.target.value)} rows={3} placeholder="Describe what happened, who was involved, any vehicle descriptions..." style={{width:"100%",padding:"9px 11px",border:`1px solid ${P.line}`,borderRadius:8,fontSize:13,resize:"vertical",boxSizing:"border-box"}}/>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button type="submit" style={{flex:1,background:P.blue,color:"#fff",border:0,borderRadius:10,padding:"12px",fontWeight:800,fontSize:14,cursor:"pointer"}}>Submit Report</button>
                <button type="button" onClick={()=>setShowNewReport(false)} style={{flex:1,background:"#eef4ff",color:"#174073",border:0,borderRadius:10,padding:"12px",fontWeight:700,fontSize:14,cursor:"pointer"}}>Cancel</button>
              </div>
            </form>
          </>
        }
      </div>
    </div>}

    {/* ── Main Page ── */}
    <div style={{background:`linear-gradient(135deg,${P.navy},#1565c0)`,color:"#fff",padding:"28px 24px 36px"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:".1em",opacity:.78,marginBottom:5}}>City of Yonkers · Public Safety</div>
        <h1 style={{margin:"0 0 6px",fontSize:22,fontWeight:900}}>Crime Reporting Dashboard</h1>
        <p style={{margin:0,opacity:.82,fontSize:14}}>Track your submitted reports and stay informed about public safety in your area.</p>
      </div>
    </div>
    <main style={{padding:"22px 24px",maxWidth:1100,margin:"0 auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginBottom:20}}>
        {[["My Reports",cases.length,"Total submitted"],["Open Cases",cases.filter(c=>c.status!=="Resolved").length,"Currently active"],["Resolved",cases.filter(c=>c.status==="Resolved").length,"Closed this month"],["Avg Response","2.4d","For my cases"]].map(([l,v,h])=><div key={l} style={{background:P.card,border:`1px solid ${P.line}`,borderRadius:13,padding:16,boxShadow:"0 4px 12px rgba(15,35,63,.06)"}}>
          <div style={{fontSize:11,color:P.muted,fontWeight:700,marginBottom:3}}>{l}</div>
          <div style={{fontSize:26,fontWeight:900,color:P.navy,margin:"5px 0 2px"}}>{v}</div>
          <div style={{fontSize:11,color:P.muted}}>{h}</div>
        </div>)}
      </div>
      <div style={{background:P.card,borderRadius:14,padding:20,boxShadow:"0 4px 12px rgba(15,35,63,.06)",marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
          <h2 style={{margin:0,fontSize:16,fontWeight:800}}>My Submitted Reports</h2>
          <button onClick={()=>setShowNewReport(true)} style={{background:P.blue,color:"#fff",border:0,borderRadius:9,padding:"8px 16px",fontWeight:700,cursor:"pointer",fontSize:13}}>+ New Report</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          {cases.map(c=><div key={c.id} style={{border:`1px solid ${P.line}`,borderRadius:11,padding:15,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,transition:"background .2s"}} onMouseEnter={e=>e.currentTarget.style.background="#f8faff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
            <div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5,flexWrap:"wrap"}}>
                <span style={{fontWeight:800,color:P.blue,fontSize:13}}>{c.id}</span>
                <span style={{...sc[c.status],borderRadius:999,padding:"2px 9px",fontWeight:800,fontSize:11}}>{c.status}</span>
                <span style={{...pc[c.priority]||{bg:"#eef4ff",cl:"#174073"},borderRadius:999,padding:"2px 9px",fontWeight:700,fontSize:11}}>{c.priority}</span>
              </div>
              <div style={{fontWeight:600,fontSize:14,marginBottom:2}}>{c.type}</div>
              <div style={{fontSize:12,color:P.muted}}>📍 {c.location} · {c.submitted}</div>
              <div style={{fontSize:12,color:P.muted,marginTop:2}}>💬 {c.update}</div>
            </div>
            <button onClick={()=>setSelectedCase(c)} style={{background:"#eef4ff",color:"#174073",border:0,borderRadius:9,padding:"8px 14px",fontWeight:700,fontSize:12,cursor:"pointer"}}>View Details</button>
          </div>)}
        </div>
      </div>
      <div style={{background:P.card,borderRadius:14,padding:20,boxShadow:"0 4px 12px rgba(15,35,63,.06)"}}>
        <h2 style={{margin:"0 0 14px",fontSize:16,fontWeight:800}}>Neighborhood Safety Alerts</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>
          {[{icon:"🔶",title:"Increased vehicle thefts",area:"Park Hill / Getty Square",time:"Last 48 hours",bg:"#fff8e7",border:P.amber},{icon:"ℹ️",title:"Community meeting tonight",area:"Waterfront Community Center",time:"Today 7:00 PM",bg:"#eef4ff",border:P.blue},{icon:"✅",title:"Operation cleanup complete",area:"Nodine Hill corridor",time:"Yesterday",bg:"#e8f6ee",border:P.green}].map(a=><div key={a.title} style={{background:a.bg,border:`1px solid ${a.border}`,borderRadius:11,padding:14}}>
            <div style={{fontSize:20,marginBottom:5}}>{a.icon}</div>
            <div style={{fontWeight:700,fontSize:13,marginBottom:2}}>{a.title}</div>
            <div style={{fontSize:11,color:P.muted}}>{a.area}</div>
            <div style={{fontSize:11,color:P.muted}}>{a.time}</div>
          </div>)}
        </div>
      </div>
    </main>
  </div>;
}

// ── PAGE 3: Analytics ─────────────────────────────────────────────────────────
function PageAnalytics({data,live,loading,reload,filters,setFilters}){
  const{isDesktop,isTablet}=useBreakpoint();
  const[syncT,setSyncT]=useState(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));
  const refresh=()=>{reload();setSyncT(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));};
  const setF=(k,v)=>setFilters(f=>({...f,[k]:v}));
  const{kpis,trend,categories,priorities,channels,funnel,sla,heatmap,hotspots}=data;
  const kpiCols=isDesktop?"repeat(4,1fr)":"repeat(2,1fr)";
  const chartCols=isDesktop?"1.2fr 1fr 1fr":isTablet?"1fr 1fr":"1fr";
  return<div style={{background:P.bg,minHeight:"100vh"}}>
    <div style={{background:`linear-gradient(135deg,${P.navy},#173b70)`,color:"#fff",padding:"16px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
      <div><div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".1em",opacity:.75}}>City of Yonkers · Public Safety</div><div style={{fontSize:18,fontWeight:800,marginTop:2}}>Digital Analytics Dashboard</div></div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:999,padding:"5px 11px",fontSize:12}}>{live?"🟢 Live API":"🟡 Demo"}</span>
        <span style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:999,padding:"5px 11px",fontSize:12}}>Sync: {syncT}</span>
        <button onClick={refresh} style={{background:"#fff",color:P.navy,border:0,borderRadius:8,padding:"7px 13px",fontWeight:700,fontSize:13,cursor:"pointer"}}>{loading?"...":"↻"} Refresh</button>
      </div>
    </div>
    <main style={{padding:"18px 22px"}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        {[{k:"days",label:"Days",opts:[["7","7d"],["14","14d"],["30","30d"],["60","60d"]]},{k:"precinct",label:"Precinct",opts:[["All","All"],["Getty Square","Getty Sq"],["Park Hill","Park Hill"],["Nodine Hill","Nodine"],["Waterfront","Waterfront"]]},{k:"channel",label:"Channel",opts:[["All","All"],["Mobile","Mobile"],["Web","Web"],["Kiosk","Kiosk"],["Call Center","Call Ctr"]]},{k:"priority",label:"Priority",opts:[["All","All"],["Critical","Critical"],["High","High"],["Normal","Normal"],["Low","Low"]]}].map(({k,label,opts})=><div key={k} style={{background:P.card,border:`1px solid ${P.line}`,borderRadius:8,padding:"6px 10px",display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:11,color:P.muted,fontWeight:700}}>{label}:</span>
          <select value={filters[k]} onChange={e=>setF(k,e.target.value)} style={{border:0,outline:0,fontSize:12,fontWeight:600,color:P.text,background:"transparent",cursor:"pointer"}}>{opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
        </div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:kpiCols,gap:11,marginBottom:13}}>
        {kpis.map(k=><div key={k.id} style={{background:P.card,border:`1px solid ${P.line}`,borderRadius:12,padding:14,boxShadow:"0 3px 10px rgba(15,35,63,.06)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-16,top:-16,width:56,height:56,borderRadius:"50%",background:"rgba(31,111,235,.07)"}}/>
          <div style={{fontSize:11,color:P.muted,fontWeight:700,lineHeight:1.3}}>{k.label}</div>
          <div style={{fontSize:22,fontWeight:900,margin:"5px 0 2px",color:P.text}}>{k.value}</div>
          <div style={{fontSize:10,fontWeight:800,color:k.dir==="up"?P.green:k.dir==="down"?P.red:P.amber}}>{k.trend}</div>
        </div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:chartCols,gap:12}}>
        <div style={{gridColumn:isDesktop?"span 2":"auto",background:P.card,border:`1px solid ${P.line}`,borderRadius:13,padding:16,boxShadow:"0 3px 10px rgba(15,35,63,.06)"}}>
          <h3 style={{margin:"0 0 2px",fontSize:14,fontWeight:800}}>1. Daily Report Volume Trend</h3>
          <p style={{margin:"0 0 10px",fontSize:11,color:P.muted}}>Submitted reports over selected period.</p>
          <ResponsiveContainer width="100%" height={200}><AreaChart data={trend} margin={{top:4,right:4,left:-20,bottom:0}}>
            <defs><linearGradient id="gba" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={P.blue} stopOpacity={.18}/><stop offset="95%" stopColor={P.blue} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={P.line} vertical={false}/>
            <XAxis dataKey="date" tick={{fontSize:9,fill:P.muted}} tickFormatter={d=>d.slice(5)} interval={Math.floor(trend.length/5)}/><YAxis tick={{fontSize:9,fill:P.muted}}/>
            <Tooltip contentStyle={{borderRadius:9,border:`1px solid ${P.line}`,fontSize:12}}/>
            <Area type="monotone" dataKey="count" name="Reports" stroke={P.blue} strokeWidth={3} fill="url(#gba)" dot={false} activeDot={{r:5}}/>
          </AreaChart></ResponsiveContainer>
        </div>
        <div style={{background:P.card,border:`1px solid ${P.line}`,borderRadius:13,padding:16,boxShadow:"0 3px 10px rgba(15,35,63,.06)"}}>
          <h3 style={{margin:"0 0 2px",fontSize:14,fontWeight:800}}>2. Reports by Category</h3>
          <p style={{margin:"0 0 8px",fontSize:11,color:P.muted}}>Incident type breakdown.</p>
          <ResponsiveContainer width="100%" height={165}><PieChart><Pie data={categories} cx="50%" cy="50%" innerRadius={46} outerRadius={70} dataKey="value" paddingAngle={2}>{categories.map((_,i)=><Cell key={i} fill={CAT_COLORS[i%8]}/>)}</Pie><Tooltip contentStyle={{borderRadius:9,border:`1px solid ${P.line}`,fontSize:12}}/></PieChart></ResponsiveContainer>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",fontSize:10,color:P.muted}}>{categories.slice(0,4).map((c,i)=><span key={c.name} style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:CAT_COLORS[i],display:"inline-block"}}/>{c.name}</span>)}</div>
        </div>
        <div style={{background:P.card,border:`1px solid ${P.line}`,borderRadius:13,padding:16,boxShadow:"0 3px 10px rgba(15,35,63,.06)"}}>
          <h3 style={{margin:"0 0 2px",fontSize:14,fontWeight:800}}>3. Priority Distribution</h3>
          <p style={{margin:"0 0 10px",fontSize:11,color:P.muted}}>Reports by urgency level.</p>
          {priorities.map(p=><div key={p.name} style={{display:"grid",gridTemplateColumns:"76px 1fr 40px",gap:7,alignItems:"center",margin:"9px 0",fontSize:12}}>
            <span style={{fontWeight:600}}>{p.name}</span>
            <div style={{height:10,background:"#e8eef6",borderRadius:999,overflow:"hidden"}}><div style={{height:"100%",borderRadius:999,background:PRIO_COLORS[p.name],width:`${p.pct}%`,transition:"width .5s ease"}}/></div>
            <b style={{textAlign:"right",fontSize:11}}>{p.count.toLocaleString()}</b>
          </div>)}
        </div>
        <div style={{background:P.card,border:`1px solid ${P.line}`,borderRadius:13,padding:16,boxShadow:"0 3px 10px rgba(15,35,63,.06)"}}>
          <h3 style={{margin:"0 0 2px",fontSize:14,fontWeight:800}}>4. Heatmap</h3>
          <p style={{margin:"0 0 8px",fontSize:11,color:P.muted}}>Day & hour concentration.</p>
          <Heatmap hm={heatmap}/>
        </div>
        <div style={{background:P.card,border:`1px solid ${P.line}`,borderRadius:13,padding:16,boxShadow:"0 3px 10px rgba(15,35,63,.06)"}}>
          <h3 style={{margin:"0 0 2px",fontSize:14,fontWeight:800}}>5. Funnel</h3>
          <p style={{margin:"0 0 8px",fontSize:11,color:P.muted}}>Intake-to-resolution lifecycle.</p>
          <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"center",padding:"4px 0"}}>
            {funnel.map((s,i)=><div key={s.stage} style={{width:`${Math.max(32,s.pct)}%`,minWidth:90,height:34,borderRadius:8,background:FUNNEL_COLORS[i],color:"#fff",fontWeight:800,display:"grid",placeItems:"center",fontSize:12}}>{s.stage} · {s.count.toLocaleString()}</div>)}
          </div>
        </div>
        <div style={{background:P.card,border:`1px solid ${P.line}`,borderRadius:13,padding:16,boxShadow:"0 3px 10px rgba(15,35,63,.06)"}}>
          <h3 style={{margin:"0 0 2px",fontSize:14,fontWeight:800}}>6. Geo Hotspot Map</h3>
          <p style={{margin:"0 0 8px",fontSize:11,color:P.muted}}>Report clustering across Yonkers.</p>
          <GeoMap hotspots={hotspots}/>
        </div>
        <div style={{background:P.card,border:`1px solid ${P.line}`,borderRadius:13,padding:16,boxShadow:"0 3px 10px rgba(15,35,63,.06)"}}>
          <h3 style={{margin:"0 0 2px",fontSize:14,fontWeight:800}}>7. Channel Usage</h3>
          <p style={{margin:"0 0 8px",fontSize:11,color:P.muted}}>Reports by intake channel.</p>
          <ResponsiveContainer width="100%" height={175}><BarChart data={channels} margin={{top:4,right:4,left:-20,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke={P.line} vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:10,fill:P.muted}}/><YAxis tick={{fontSize:9,fill:P.muted}}/>
            <Tooltip contentStyle={{borderRadius:9,border:`1px solid ${P.line}`,fontSize:12}}/>
            <Bar dataKey="count" name="Reports" radius={[5,5,0,0]}>{channels.map((_,i)=><Cell key={i} fill={[P.blue,P.cyan,P.purple,P.green][i]}/>)}</Bar>
          </BarChart></ResponsiveContainer>
        </div>
        <div style={{background:P.card,border:`1px solid ${P.line}`,borderRadius:13,padding:16,boxShadow:"0 3px 10px rgba(15,35,63,.06)"}}>
          <h3 style={{margin:"0 0 2px",fontSize:14,fontWeight:800}}>8. SLA Gauge</h3>
          <p style={{margin:"0 0 6px",fontSize:11,color:P.muted}}>Priority reports inside target window.</p>
          <Gauge v={sla.compliance}/>
          <div style={{display:"flex",justifyContent:"center",gap:16,fontSize:12,marginTop:6}}>
            <span style={{color:P.muted}}>Total: <b style={{color:P.text}}>{sla.total}</b></span>
            <span style={{color:P.muted}}>On-time: <b style={{color:P.green}}>{sla.onTime}</b></span>
          </div>
        </div>
      </div>
    </main>
  </div>;
}

// ── PAGE 4: Manage Queue ───────────────────────────────────────────────────────
function PageManageQueue({data}){
  const[search,setSearch]=useState("");
  const[selected,setSelected]=useState([]);
  const[editId,setEditId]=useState(null);
  const queue=data.queue||[];
  const filtered=queue.filter(r=>!search||(r.id+r.category+r.location+r.team).toLowerCase().includes(search.toLowerCase()));
  const toggle=id=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const metrics=[{label:"Open queue",value:"128",hint:"+14 since 8:00 AM",cl:P.text},{label:"High priority",value:"18",hint:"6 need review now",cl:P.red},{label:"SLA at risk",value:"11",hint:"Under 30 min remaining",cl:P.amber},{label:"Assigned today",value:"72",hint:"84% routed",cl:P.green},{label:"Avg. first response",value:"12m",hint:"Target: 15m",cl:P.text}];
  const sideItems=[["Dashboard","📊"],["Manage Queue","📋"],["High Priority","🔴"],["Map View","🗺️"],["Officer Assignment","👮"],["Reports","📄"],["Settings","⚙️"]];
  return<div style={{display:"flex",minHeight:"100vh",background:P.bg}}>
    <AdminSidebar activeItem="Manage Queue" items={sideItems}/>
    <main style={{flex:1,overflow:"auto"}}>
      <div style={{background:P.card,borderBottom:`1px solid ${P.line}`,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
        <div><h2 style={{margin:0,fontSize:17,fontWeight:900}}>Manage Queue</h2><p style={{margin:"2px 0 0",fontSize:12,color:P.muted}}>Review, prioritize, assign, escalate, and resolve submitted reports.</p></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Btn color="light">Export CSV</Btn><Btn color="navy">Queue Rules</Btn><Btn color="blue">+ Create Admin Case</Btn>
        </div>
      </div>
      <div style={{padding:"18px 20px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:11,marginBottom:18}}>
          {metrics.map(m=><div key={m.label} style={{background:P.card,border:`1px solid ${P.line}`,borderRadius:11,padding:13,boxShadow:"0 3px 10px rgba(15,35,63,.05)"}}>
            <div style={{fontSize:11,color:P.muted,fontWeight:700,marginBottom:3}}>{m.label}</div>
            <div style={{fontSize:24,fontWeight:900,color:m.cl,margin:"3px 0 2px"}}>{m.value}</div>
            <div style={{fontSize:11,color:P.muted}}>{m.hint}</div>
          </div>)}
        </div>
        <div style={{background:P.card,borderRadius:11,padding:12,marginBottom:12,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",border:`1px solid ${P.line}`}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search case ID, address, keyword..." style={{flex:1,minWidth:180,padding:"7px 11px",border:`1px solid ${P.line}`,borderRadius:8,fontSize:13}}/>
          {[["All priorities"],["All categories"],["All statuses"],["Sort: SLA first"]].map(([l])=><select key={l} style={{padding:"7px 9px",border:`1px solid ${P.line}`,borderRadius:8,fontSize:12,background:P.card}}><option>{l}</option></select>)}
          <Btn color="blue">Apply</Btn>
        </div>
        {selected.length>0&&<div style={{background:"#eef4ff",border:`1px solid ${P.blue}`,borderRadius:9,padding:"9px 13px",marginBottom:11,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <strong style={{fontSize:13}}>{selected.length} selected</strong>
          <div style={{display:"flex",gap:7}}><Btn color="light">Bulk Assign</Btn><Btn color="amber">Escalate</Btn><Btn color="light">Merge Duplicate</Btn></div>
        </div>}
        <div style={{background:P.card,borderRadius:13,border:`1px solid ${P.line}`,overflow:"hidden",boxShadow:"0 3px 10px rgba(15,35,63,.05)"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"#f8faff"}}><th style={{padding:"9px 12px",textAlign:"left",borderBottom:`1px solid ${P.line}`}}><input type="checkbox" onChange={e=>setSelected(e.target.checked?filtered.map(r=>r.id):[])}/></th>
                {["Case","Priority","Category","Location","SLA","Owner","Actions"].map(h=><th key={h} style={{padding:"9px 12px",textAlign:"left",borderBottom:`1px solid ${P.line}`,color:P.muted,fontSize:11,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>)}
              </tr></thead>
              <tbody>{filtered.map(r=><tr key={r.id} onMouseEnter={e=>e.currentTarget.style.background="#f8faff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`}}><input type="checkbox" checked={selected.includes(r.id)} onChange={()=>toggle(r.id)}/></td>
                <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`,fontWeight:700,color:P.blue,whiteSpace:"nowrap"}}>{r.id}</td>
                <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`}}><PBadge p={r.priority}/></td>
                <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`}}>{r.category}</td>
                <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`}}>{r.location}</td>
                <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`,color:(r.sla||"").includes("5 min")||(r.sla||"").includes("18 min")?P.red:P.muted,fontWeight:600,whiteSpace:"nowrap"}}>{r.sla||"—"}</td>
                <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`}}>{r.team}</td>
                <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`}}>
                  {editId===r.id
                    ?<div style={{display:"flex",gap:6}}><button onClick={()=>setEditId(null)} style={{background:"#e8f6ee",color:"#146c3e",border:0,borderRadius:7,padding:"5px 10px",fontWeight:700,fontSize:11,cursor:"pointer"}}>Save</button><button onClick={()=>setEditId(null)} style={{background:"#f4f7fb",color:P.muted,border:0,borderRadius:7,padding:"5px 10px",fontWeight:700,fontSize:11,cursor:"pointer"}}>Cancel</button></div>
                    :<div style={{display:"flex",gap:5}}><button onClick={()=>setEditId(r.id)} style={{background:"#eef4ff",color:"#174073",border:0,borderRadius:7,padding:"5px 10px",fontWeight:700,fontSize:11,cursor:"pointer"}}>Assign</button><button style={{background:"#fff2cc",color:"#925a00",border:0,borderRadius:7,padding:"5px 10px",fontWeight:700,fontSize:11,cursor:"pointer"}}>Escalate</button></div>}
                </td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>;
}

// ── PAGE 5: Admin Dashboard ────────────────────────────────────────────────────
function PageAdmin({data,live}){
  const UNITS=["Patrol Desk","Field Unit A","Field Unit B","Field Unit C","Investigations","Special Ops","K9 Unit","Traffic Division"];
  const SEED_QUEUE=[
    {id:"YR-2026-1048",category:"Suspicious Activity",location:"Getty Square",priority:"Critical",status:"Needs Review",team:"Patrol Desk",sla:"18 min left",evidence:true},
    {id:"YR-2026-1039",category:"Vehicle Break-in",location:"Park Hill",priority:"High",status:"Assigned",team:"Field Unit B",sla:"42 min left",evidence:false},
    {id:"YR-2026-1021",category:"Vandalism",location:"Nodine Hill",priority:"High",status:"Evidence Review",team:"Investigations",sla:"1h 12m left",evidence:true},
    {id:"YR-2026-0998",category:"Theft",location:"McLean Ave",priority:"Critical",status:"Needs Review",team:"Field Unit A",sla:"5 min left",evidence:false},
    {id:"YR-2026-0991",category:"Assault",location:"Getty Square",priority:"High",status:"Assigned",team:"Special Ops",sla:"29 min left",evidence:true},
    {id:"YR-2026-0984",category:"Property Crime",location:"Waterfront",priority:"High",status:"Needs Review",team:"Unassigned",sla:"55 min left",evidence:false},
    {id:"YR-2026-0977",category:"Community Concern",location:"Yonkers Ave",priority:"Normal",status:"Assigned",team:"Field Unit C",sla:"2h 5m left",evidence:false},
    {id:"YR-2026-0965",category:"Suspicious Activity",location:"Park Hill",priority:"High",status:"Evidence Review",team:"Investigations",sla:"1h 30m left",evidence:true},
  ];
  const AUDIT_SEED=[
    {time:"10:42 AM",user:"Admin",action:"Escalated YR-2026-0998 to Critical"},
    {time:"10:38 AM",user:"Dispatch",action:"Assigned YR-2026-1039 to Field Unit B"},
    {time:"10:21 AM",user:"Admin",action:"Closed YR-2026-0943 — resolved"},
    {time:"09:55 AM",user:"System",action:"Auto-escalated YR-2026-1021 — SLA breach warning"},
    {time:"09:33 AM",user:"Dispatch",action:"Reassigned YR-2026-0991 to Special Ops"},
  ];

  const[activeSection,setActiveSection]=useState("System Dashboard");
  const[search,setSearch]=useState("");
  const[queueRows,setQueueRows]=useState(SEED_QUEUE);
  const[selected,setSelected]=useState(null);
  const[assignModal,setAssignModal]=useState(null);
  const[assignTo,setAssignTo]=useState("");
  const[escalateModal,setEscalateModal]=useState(null);
  const[emergencyModal,setEmergencyModal]=useState(false);
  const[exportDone,setExportDone]=useState(false);
  const[toast,setToast]=useState(null);
  const[auditLog,setAuditLog]=useState(AUDIT_SEED);
  const[filterPriority,setFilterPriority]=useState("All");
  const[filterStatus,setFilterStatus]=useState("All");
  const[usersOnline]=useState(["Dispatch #1","Officer Carter","Officer Lopez","Sgt. Rivera","K9 Handler"]);

  const showToast=(msg,color=P.green)=>{setToast({msg,color});setTimeout(()=>setToast(null),3000);};
  const addAudit=(action)=>setAuditLog(l=>[{time:new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}),user:"Admin",action},...l].slice(0,20));

  const doAssign=()=>{
    if(!assignTo)return;
    setQueueRows(rows=>rows.map(r=>r.id===assignModal.id?{...r,team:assignTo,status:"Assigned"}:r));
    addAudit(`Assigned ${assignModal.id} to ${assignTo}`);
    showToast(`✅ ${assignModal.id} assigned to ${assignTo}`);
    setAssignModal(null);setAssignTo("");
  };
  const doEscalate=(row)=>{
    setQueueRows(rows=>rows.map(r=>r.id===row.id?{...r,priority:"Critical",status:"Needs Review"}:r));
    addAudit(`Escalated ${row.id} to Critical`);
    showToast(`🚨 ${row.id} escalated to Critical`,P.red);
    setEscalateModal(null);
  };
  const doClose=(id)=>{
    setQueueRows(rows=>rows.filter(r=>r.id!==id));
    addAudit(`Closed case ${id} — resolved`);
    showToast(`✅ Case ${id} closed`);
    setSelected(null);
  };
  const doExport=()=>{
    const csv=["Case,Category,Location,Priority,Status,Team,SLA",...queueRows.map(r=>`${r.id},${r.category},${r.location},${r.priority},${r.status},${r.team},${r.sla}`)].join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="yonkers_queue_export.csv";a.click();
    setExportDone(true);showToast("📥 Queue exported as CSV");setTimeout(()=>setExportDone(false),3000);
  };

  const filtered=queueRows.filter(r=>{
    const matchSearch=!search||(r.id+r.category+r.location).toLowerCase().includes(search.toLowerCase());
    const matchP=filterPriority==="All"||r.priority===filterPriority;
    const matchS=filterStatus==="All"||r.status===filterStatus;
    return matchSearch&&matchP&&matchS;
  });

  const criticalCount=queueRows.filter(r=>r.priority==="Critical").length;
  const highCount=queueRows.filter(r=>r.priority==="High").length;
  const unassigned=queueRows.filter(r=>r.team==="Unassigned").length;
  const evidenceCount=queueRows.filter(r=>r.evidence).length;

  const NAV=[["System Dashboard","📊"],["Queue Management","📋"],["Submitted Reports","📁"],["Dispatch / Assignment","🚔"],["Evidence Review","🔍"],["Analytics","📈"],["Users & Roles","👥"],["Audit Log","📜"]];

  const slaColor=(sla)=>{
    if(!sla)return P.muted;
    if(sla.includes("5 min")||sla.includes("4 min")||sla.includes("3 min")||sla.includes("2 min")||sla.includes("1 min"))return P.red;
    if(sla.includes("18 min")||sla.includes("29 min"))return P.amber;
    return P.muted;
  };

  return<div style={{display:"flex",minHeight:"100vh",background:P.bg}}>

    {/* ── Toast ── */}
    {toast&&<div style={{position:"fixed",bottom:24,right:24,background:toast.color,color:"#fff",borderRadius:10,padding:"12px 20px",fontWeight:700,fontSize:13,zIndex:9999,boxShadow:"0 8px 24px rgba(0,0,0,.2)",animation:"fadein .3s"}}>{toast.msg}</div>}

    {/* ── Review Modal ── */}
    {selected&&<div style={{position:"fixed",inset:0,background:"rgba(10,25,50,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setSelected(null)}>
      <div style={{background:P.card,borderRadius:18,padding:28,maxWidth:520,width:"100%",boxShadow:"0 24px 64px rgba(10,25,50,.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <span style={{fontWeight:900,color:P.blue,fontSize:16}}>{selected.id}</span>
          <button onClick={()=>setSelected(null)} style={{background:"#f1f5f9",border:0,borderRadius:"50%",width:32,height:32,fontSize:18,cursor:"pointer"}}>×</button>
        </div>
        <h2 style={{margin:"0 0 14px",fontSize:18,fontWeight:900,color:P.navy}}>{selected.category}</h2>
        {[["📍 Location",selected.location],["🚨 Priority",selected.priority],["📋 Status",selected.status],["👮 Assigned To",selected.team],["⏱ SLA",selected.sla],["📎 Evidence",selected.evidence?"Attached":"None"]].map(([l,v])=>(
          <div key={l} style={{display:"flex",gap:12,padding:"8px 0",borderBottom:`1px solid ${P.line}`}}>
            <span style={{fontSize:12,fontWeight:700,color:P.muted,minWidth:130}}>{l}</span>
            <span style={{fontSize:13,color:P.text,fontWeight:500}}>{v}</span>
          </div>
        ))}
        <div style={{display:"flex",gap:8,marginTop:18,flexWrap:"wrap"}}>
          <button onClick={()=>{setAssignModal(selected);setSelected(null);}} style={{flex:1,background:"#eef4ff",color:"#174073",border:0,borderRadius:9,padding:"10px",fontWeight:700,fontSize:13,cursor:"pointer"}}>🔄 Reassign</button>
          <button onClick={()=>{setEscalateModal(selected);setSelected(null);}} style={{flex:1,background:"#fff2cc",color:"#925a00",border:0,borderRadius:9,padding:"10px",fontWeight:700,fontSize:13,cursor:"pointer"}}>⬆ Escalate</button>
          <button onClick={()=>doClose(selected.id)} style={{flex:1,background:"#e8f6ee",color:"#146c3e",border:0,borderRadius:9,padding:"10px",fontWeight:700,fontSize:13,cursor:"pointer"}}>✅ Close Case</button>
        </div>
      </div>
    </div>}

    {/* ── Assign Modal ── */}
    {assignModal&&<div style={{position:"fixed",inset:0,background:"rgba(10,25,50,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setAssignModal(null)}>
      <div style={{background:P.card,borderRadius:18,padding:28,maxWidth:400,width:"100%",boxShadow:"0 24px 64px rgba(10,25,50,.2)"}} onClick={e=>e.stopPropagation()}>
        <h3 style={{margin:"0 0 4px",fontSize:17,fontWeight:900}}>Assign Case</h3>
        <p style={{margin:"0 0 16px",color:P.muted,fontSize:13}}>{assignModal.id} — {assignModal.category}</p>
        <label style={{fontSize:11,fontWeight:700,color:P.muted,display:"block",marginBottom:6,textTransform:"uppercase"}}>Assign to unit</label>
        <select value={assignTo} onChange={e=>setAssignTo(e.target.value)} style={{width:"100%",padding:"10px 12px",border:`1px solid ${P.line}`,borderRadius:9,fontSize:14,marginBottom:16,background:P.card}}>
          <option value="">Select unit…</option>
          {UNITS.map(u=><option key={u}>{u}</option>)}
        </select>
        <div style={{display:"flex",gap:8}}>
          <button onClick={doAssign} style={{flex:1,background:P.blue,color:"#fff",border:0,borderRadius:9,padding:"11px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Confirm Assignment</button>
          <button onClick={()=>setAssignModal(null)} style={{flex:1,background:"#f1f5f9",color:P.text,border:0,borderRadius:9,padding:"11px",fontWeight:600,fontSize:13,cursor:"pointer"}}>Cancel</button>
        </div>
      </div>
    </div>}

    {/* ── Escalate Modal ── */}
    {escalateModal&&<div style={{position:"fixed",inset:0,background:"rgba(10,25,50,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setEscalateModal(null)}>
      <div style={{background:P.card,borderRadius:18,padding:28,maxWidth:400,width:"100%",boxShadow:"0 24px 64px rgba(10,25,50,.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:36,marginBottom:12,textAlign:"center"}}>🚨</div>
        <h3 style={{margin:"0 0 8px",fontSize:17,fontWeight:900,textAlign:"center"}}>Escalate to Critical?</h3>
        <p style={{margin:"0 0 20px",color:P.muted,fontSize:13,textAlign:"center"}}>{escalateModal.id} — {escalateModal.category} at {escalateModal.location}</p>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>doEscalate(escalateModal)} style={{flex:1,background:P.red,color:"#fff",border:0,borderRadius:9,padding:"11px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Yes, Escalate</button>
          <button onClick={()=>setEscalateModal(null)} style={{flex:1,background:"#f1f5f9",color:P.text,border:0,borderRadius:9,padding:"11px",fontWeight:600,fontSize:13,cursor:"pointer"}}>Cancel</button>
        </div>
      </div>
    </div>}

    {/* ── Emergency Modal ── */}
    {emergencyModal&&<div style={{position:"fixed",inset:0,background:"rgba(80,0,0,.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setEmergencyModal(false)}>
      <div style={{background:P.card,borderRadius:18,padding:32,maxWidth:440,width:"100%",boxShadow:"0 24px 64px rgba(0,0,0,.4)",textAlign:"center"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:48,marginBottom:14}}>🚨</div>
        <h2 style={{margin:"0 0 10px",fontSize:20,fontWeight:900,color:P.red}}>Emergency Escalation</h2>
        <p style={{color:P.muted,marginBottom:20,fontSize:13,lineHeight:1.6}}>This will immediately notify all available units, escalate all Critical cases, and alert the duty supervisor. This action is logged.</p>
        <div style={{background:"#ffe7e7",borderRadius:10,padding:"11px 14px",marginBottom:20,fontSize:12,color:"#7a1a1a",fontWeight:600}}>⚠️ All {criticalCount} Critical cases will be broadcast to active units.</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{
            setQueueRows(rows=>rows.map(r=>({...r,status:r.priority==="Critical"?"Dispatched":r.status})));
            addAudit("EMERGENCY ESCALATION triggered — all critical cases dispatched");
            showToast("🚨 Emergency escalation sent to all units",P.red);
            setEmergencyModal(false);
          }} style={{flex:1,background:P.red,color:"#fff",border:0,borderRadius:9,padding:"12px",fontWeight:800,fontSize:14,cursor:"pointer"}}>🚨 Confirm Escalation</button>
          <button onClick={()=>setEmergencyModal(false)} style={{flex:1,background:"#f1f5f9",color:P.text,border:0,borderRadius:9,padding:"12px",fontWeight:600,fontSize:13,cursor:"pointer"}}>Cancel</button>
        </div>
      </div>
    </div>}

    {/* ── Sidebar ── */}
    <aside style={{width:212,background:"#0f1f38",color:"#fff",flexShrink:0,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 14px",borderBottom:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",gap:9}}>
        <svg width="30" height="34" viewBox="0 0 30 34" fill="none"><path d="M15 1L2 6.5V16C2 23 8 29.5 15 32C22 29.5 28 23 28 16V6.5L15 1Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2"/><text x="15" y="21" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">Y</text></svg>
        <div><div style={{fontSize:11,fontWeight:800}}>City of Yonkers</div><div style={{fontSize:10,opacity:.6}}>Public Safety Admin</div></div>
      </div>
      <nav style={{padding:"8px 0",flex:1}}>
        {NAV.map(([l,icon])=><div key={l} onClick={()=>setActiveSection(l)} style={{padding:"9px 14px",fontSize:12,fontWeight:activeSection===l?700:400,background:activeSection===l?"rgba(255,255,255,.12)":"transparent",color:activeSection===l?"#fff":"rgba(255,255,255,.6)",cursor:"pointer",borderLeft:activeSection===l?`3px solid ${P.blue}`:"3px solid transparent",display:"flex",alignItems:"center",gap:8,transition:"all .15s"}}>
          <span style={{fontSize:14}}>{icon}</span>{l}
        </div>)}
      </nav>
      <div style={{margin:"0 10px 14px",background:"rgba(255,255,255,.07)",borderRadius:9,padding:"10px 12px"}}>
        <div style={{fontSize:10,fontWeight:700,opacity:.7,marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>Online Now</div>
        {usersOnline.map(u=><div key={u} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,fontSize:11,opacity:.8}}><span style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",flexShrink:0}}></span>{u}</div>)}
      </div>
    </aside>

    {/* ── Main ── */}
    <main style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>

      {/* Top bar */}
      <div style={{background:P.card,borderBottom:`1px solid ${P.line}`,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,position:"sticky",top:0,zIndex:10}}>
        <div>
          <h2 style={{margin:0,fontSize:16,fontWeight:900}}>{activeSection}</h2>
          <p style={{margin:"1px 0 0",fontSize:11,color:P.muted}}>High-priority reported issues, queue control, assignment, and case review.</p>
        </div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search case ID, address…" style={{padding:"7px 11px",border:`1px solid ${P.line}`,borderRadius:8,fontSize:13,width:200}}/>
          <button onClick={doExport} style={{background:exportDone?"#e8f6ee":P.card,color:exportDone?"#146c3e":P.text,border:`1px solid ${P.line}`,borderRadius:8,padding:"7px 14px",fontWeight:600,fontSize:12,cursor:"pointer"}}>{exportDone?"✅ Exported":"📥 Export CSV"}</button>
          <button onClick={()=>setEmergencyModal(true)} style={{background:P.red,color:"#fff",border:0,borderRadius:8,padding:"7px 14px",fontWeight:700,fontSize:12,cursor:"pointer"}}>🚨 Emergency Escalation</button>
        </div>
      </div>

      <div style={{padding:"16px 20px",flex:1}}>

        {/* KPI cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
          {[
            {label:"New Reports",value:queueRows.length,trend:`${unassigned} require initial review`,cl:P.text},
            {label:"High Priority",value:criticalCount+highCount,trend:`${criticalCount} critical / active risk`,cl:P.red},
            {label:"Avg. First Response",value:"06m",trend:"Target under 10 minutes",cl:P.green},
            {label:"Queue Backlog",value:queueRows.filter(r=>r.status==="Needs Review").length,trend:"Down 8% from yesterday",cl:P.amber},
          ].map(m=>(
            <div key={m.label} style={{background:P.card,border:`1px solid ${P.line}`,borderRadius:13,padding:"15px 17px",boxShadow:"0 4px 12px rgba(15,35,63,.06)"}}>
              <div style={{fontSize:10,color:P.muted,fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:".06em"}}>{m.label}</div>
              <div style={{fontSize:28,fontWeight:900,color:m.cl,margin:"4px 0 2px"}}>{m.value}</div>
              <div style={{fontSize:11,color:P.muted}}>{m.trend}</div>
            </div>
          ))}
        </div>

        {/* Priority queue table */}
        <div style={{background:P.card,borderRadius:13,border:`1px solid ${P.line}`,overflow:"hidden",boxShadow:"0 4px 12px rgba(15,35,63,.06)",marginBottom:16}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${P.line}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <h3 style={{margin:0,fontSize:14,fontWeight:800}}>Priority Report Queue</h3>
            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
              <select value={filterPriority} onChange={e=>setFilterPriority(e.target.value)} style={{padding:"4px 8px",border:`1px solid ${P.line}`,borderRadius:6,fontSize:11,background:P.card}}>
                <option>All</option><option>Critical</option><option>High</option><option>Normal</option>
              </select>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{padding:"4px 8px",border:`1px solid ${P.line}`,borderRadius:6,fontSize:11,background:P.card}}>
                <option>All</option><option>Needs Review</option><option>Assigned</option><option>Evidence Review</option><option>Dispatched</option>
              </select>
              {[["Critical","#ffe7e7","#b42323"],["High","#fff2cc","#925a00"],["Unassigned","#f1f5f9","#475569"],["Evidence Attached","#eef4ff","#174073"]].map(([l,bg,cl])=>(
                <span key={l} style={{background:bg,color:cl,borderRadius:999,padding:"2px 9px",fontWeight:700,fontSize:10}}>{l}: {l==="Critical"?criticalCount:l==="High"?highCount:l==="Unassigned"?unassigned:evidenceCount}</span>
              ))}
            </div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"#f8faff"}}>
                {["Case","Issue","Location","Priority","Status","Assigned To","SLA","Action"].map(h=>(
                  <th key={h} style={{padding:"9px 12px",textAlign:"left",borderBottom:`1px solid ${P.line}`,color:P.muted,fontSize:10,textTransform:"uppercase",whiteSpace:"nowrap",letterSpacing:".05em"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(r=>(
                  <tr key={r.id} style={{cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f8faff"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                    <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`,fontWeight:700,color:P.blue,whiteSpace:"nowrap"}} onClick={()=>setSelected(r)}>{r.id}</td>
                    <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`}}>{r.category}{r.evidence&&<span style={{marginLeft:6,fontSize:10,background:"#eef4ff",color:"#174073",borderRadius:4,padding:"1px 5px"}}>📎</span>}</td>
                    <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`}}>{r.location}</td>
                    <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`}}><PBadge p={r.priority}/></td>
                    <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`}}><SBadge s={r.status}/></td>
                    <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`,color:r.team==="Unassigned"?P.red:P.text,fontWeight:r.team==="Unassigned"?700:400}}>{r.team}</td>
                    <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`,color:slaColor(r.sla),fontWeight:600,whiteSpace:"nowrap"}}>{r.sla||"—"}</td>
                    <td style={{padding:"10px 12px",borderBottom:`1px solid ${P.line}`}}>
                      <div style={{display:"flex",gap:5}}>
                        <button onClick={()=>setSelected(r)} style={{background:"#eef4ff",color:"#174073",border:0,borderRadius:6,padding:"5px 9px",fontWeight:700,fontSize:11,cursor:"pointer"}}>Review</button>
                        <button onClick={()=>setAssignModal(r)} style={{background:"#e8f6ee",color:"#146c3e",border:0,borderRadius:6,padding:"5px 9px",fontWeight:700,fontSize:11,cursor:"pointer"}}>Assign</button>
                        <button onClick={()=>setEscalateModal(r)} style={{background:"#fff2cc",color:"#925a00",border:0,borderRadius:6,padding:"5px 9px",fontWeight:700,fontSize:11,cursor:"pointer"}}>Escalate</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length===0&&<tr><td colSpan={8} style={{padding:"24px",textAlign:"center",color:P.muted,fontSize:13}}>No cases match your filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom row: system status + audit log */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:14}}>
          {/* System status */}
          <div style={{background:P.card,borderRadius:13,border:`1px solid ${P.line}`,padding:16,boxShadow:"0 4px 12px rgba(15,35,63,.06)"}}>
            <h3 style={{margin:"0 0 12px",fontSize:13,fontWeight:800}}>System Status</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[
                {name:"CAD / RMS",status:"Connected",bg:"#e8f6ee",cl:"#146c3e",icon:"🔗"},
                {name:"GIS Map Service",status:"Active",bg:"#e8f6ee",cl:"#146c3e",icon:"🗺️"},
                {name:"Notification Service",status:"Active",bg:"#e8f6ee",cl:"#146c3e",icon:"🔔"},
                {name:"Evidence Storage",status:"85% capacity",bg:"#fff2cc",cl:"#925a00",icon:"💾"},
                {name:"API Gateway",status:"Healthy",bg:"#e8f6ee",cl:"#146c3e",icon:"⚙️"},
                {name:"Audit Logger",status:"Running",bg:"#e8f6ee",cl:"#146c3e",icon:"📜"},
              ].map(s=>(
                <div key={s.name} style={{border:`1px solid ${P.line}`,borderRadius:10,padding:"12px 13px"}}>
                  <div style={{fontSize:18,marginBottom:6}}>{s.icon}</div>
                  <div style={{fontSize:12,fontWeight:700,marginBottom:5,color:P.text}}>{s.name}</div>
                  <span style={{background:s.bg,color:s.cl,borderRadius:999,padding:"2px 9px",fontWeight:700,fontSize:10}}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit log */}
          <div style={{background:P.card,borderRadius:13,border:`1px solid ${P.line}`,padding:16,boxShadow:"0 4px 12px rgba(15,35,63,.06)"}}>
            <h3 style={{margin:"0 0 12px",fontSize:13,fontWeight:800}}>Audit Log</h3>
            <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:220,overflowY:"auto"}}>
              {auditLog.map((a,i)=>(
                <div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${P.line}`,alignItems:"flex-start"}}>
                  <span style={{fontSize:10,color:P.muted,whiteSpace:"nowrap",marginTop:1,minWidth:60}}>{a.time}</span>
                  <div>
                    <span style={{fontSize:10,fontWeight:700,color:P.blue,marginRight:4}}>{a.user}</span>
                    <span style={{fontSize:11,color:P.text}}>{a.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>;
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App(){
  const[user,setUser]=useState(null); // null=logged out, "citizen"|"admin"
  const[page,setPage]=useState("report");
  const[filters,setFilters]=useState({days:"30",precinct:"All",channel:"All",priority:"All"});
  const{data,live,loading,reload}=useData(filters);

  const handleLogin=(role,landing)=>{
    setUser(role);
    setPage(landing);
  };
  const handleLogout=()=>{
    setUser(null);
    setPage("report");
  };

  if(!user) return(
    <div style={{fontFamily:"Inter,Segoe UI,Arial,sans-serif"}}>
      <PageLogin onLogin={handleLogin}/>
      <ADAToolbar/>
    </div>
  );

  return<div style={{fontFamily:"Inter,Segoe UI,Arial,sans-serif",color:P.text,minHeight:"100vh"}}>
    <a href="#main-content" className="skip-nav">Skip to main content</a>
    <NavBar page={page} setPage={setPage} live={live} user={user} onLogout={handleLogout}/>
    <main id="main-content" tabIndex={-1} style={{outline:"none"}}>
      {page==="report"   &&<PageReportCrime onSubmit={()=>reload()}/>}
      {page==="dashboard"&&<PageDashboard setPage={setPage}/>}
      {page==="analytics"&&<PageAnalytics data={data} live={live} loading={loading} reload={reload} filters={filters} setFilters={setFilters}/>}
      {page==="queue"    &&user==="admin"&&<PageManageQueue data={data} live={live}/>}
      {page==="admin"    &&user==="admin"&&<PageAdmin data={data} live={live}/>}
    </main>
    <ADAToolbar/>
  </div>;
}
