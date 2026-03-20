import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Protocol from './pages/Protocol'
import Coach from './pages/Coach'
import Profile from './pages/Profile'
import Reports from './pages/Reports.jsx'
import { seedProfile, seedSleepLogs, seedBodyComposition, seedLabResults, seedMacroLogs, recommendedNextLabs } from './data/seed'

const NAV = [
  { id: 'home',     label: 'Home',     icon: '⬡' },
  { id: 'protocol', label: 'Protocol', icon: '◈' },
  { id: 'coach',    label: 'AI Coach', icon: '✦' },
  { id: 'profile',  label: 'Profile',  icon: '◉' },
  { id: 'reports',  label: 'Reports',  icon: '◎' },
]

function buildProtocol() {
  const isMonday = new Date().getDay() === 1
  return [
    ...(isMonday ? [{key:'ret', icon:'💉', name:'Retatrutide', sub:'1mg subcutaneous · after food', time:'Monday', group:'peptide', done:false}] : []),
    {key:'epi',    icon:'🧬', name:'Epitalon',                sub:'2mg subQ · before bed',             time:'~21:00', group:'peptide', done:false},
    {key:'tra',    icon:'💊', name:'Trazodone (Триттико)',     sub:'50mg wk1 · 100mg wk2 · 150mg wk3', time:'21:00',  group:'med',     done:false},
    {key:'eti_am', icon:'💊', name:'Etifoxine — Morning',     sub:'50mg',                              time:'09:00',  group:'med',     done:false},
    {key:'eti_md', icon:'💊', name:'Etifoxine — Midday',      sub:'50mg',                              time:'14:00',  group:'med',     done:false},
    {key:'eti_ev', icon:'💊', name:'Etifoxine — Evening',     sub:'50mg',                              time:'17:00',  group:'med',     done:false},
  ]
}

const SUPPS = [
  {key:'vitc',   icon:'🍊', name:'Vitamin C',                   sub:'900–1800mg · on waking',  done:false},
  {key:'magcit', icon:'🌊', name:'Magnesium Citrate 400mg',     sub:'morning',                 done:false},
  {key:'bcomp',  icon:'🅱️', name:'B-Complex Methylated',        sub:'morning',                 done:false},
  {key:'k2',     icon:'🫙', name:'Vitamin K2 MK-7',             sub:'2 capsules · daily',      done:false},
  {key:'d3',     icon:'☀️', name:'Vitamin D3 10,000 IU',        sub:'4× per week',             done:false},
  {key:'dhea',   icon:'⚡', name:'DHEA',                         sub:'100mg · daily',           done:false},
  {key:'magbis', icon:'🌙', name:'Magnesium Bisglycinate + B6',  sub:'evening',                done:false},
]

export default function App() {
  const [page, setPage]         = useState('home')
  const [protocol, setProtocol] = useState(buildProtocol)
  const [supplements, setSupps] = useState(SUPPS)
  const [moods, setMoods]       = useState({morning:null,midday:null,evening:null})
  const [macroTab, setMacroTab] = useState('kcal')
  const [chatMsgs, setChatMsgs] = useState([
    {role:'ai', text:"I'm your iHeal AI Coach. Share Oura data, RENPHO scans, lab results, food photos, or ask me anything. I have your full health context."}
  ])
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setTime(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`)
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [])

  const togProto = (key) => setProtocol(p => p.map(i => i.key===key ? {...i,done:!i.done} : i))
  const togSupp  = (key) => setSupps(s  => s.map(i => i.key===key ? {...i,done:!i.done} : i))
  const setMood  = (period, val) => setMoods(m => ({...m, [period]: m[period]===val ? null : val}))

  const shared = {
    protocol, supplements, moods, macroTab, chatMsgs, time,
    setMacroTab, togProto, togSupp, setMood, setChatMsgs, setPage,
    sleepLogs: seedSleepLogs,
    bodyComp: seedBodyComposition,
    labResults: seedLabResults,
    macroLogs: seedMacroLogs,
    profile: seedProfile,
    nextLabs: recommendedNextLabs,
    isMonday: new Date().getDay() === 1,
  }

  const G = '#c5f135', BG = '#000', CARD = '#1e2128', BORDER = '#2a2e38'
  const T = '#fff', T2 = '#b0b4c0', T3 = '#808490'

  return (
    <div style={{position:'fixed',inset:0,display:'flex',flexDirection:'column',maxWidth:430,margin:'0 auto',background:BG,color:T,fontFamily:"'DM Sans',sans-serif"}}>
      {/* TOPBAR */}
      <div style={{height:54,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',borderBottom:`1px solid ${BORDER}`,background:BG,flexShrink:0,zIndex:20}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:30,height:30,background:G,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:'#000'}}>iH</div>
          <span style={{fontSize:19,fontWeight:700,letterSpacing:.3}}>i<span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:1,color:G}}>Heal</span></span>
        </div>
        <div style={{display:'flex',gap:5}}>
          {['Carlos','Katya','Mira'].map(n => (
            <button key={n} style={{padding:'5px 12px',borderRadius:20,background:n==='Carlos'?G:CARD,border:`1px solid ${n==='Carlos'?G:BORDER}`,color:n==='Carlos'?'#000':T2,fontSize:11,fontWeight:n==='Carlos'?700:500,cursor:'pointer',fontFamily:'inherit'}}>{n}</button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch',minHeight:0}}>
        {page==='home'     && <Home     {...shared}/>}
        {page==='protocol' && <Protocol {...shared}/>}
        {page==='coach'    && <Coach    {...shared}/>}
        {page==='profile'  && <Profile  {...shared}/>}
        {page==='reports'  && <Reports  {...shared}/>}
      </div>

      {/* BOTTOM NAV */}
      <div style={{display:'flex',background:BG,borderTop:`1px solid ${BORDER}`,flexShrink:0,zIndex:20,paddingBottom:'env(safe-area-inset-bottom)'}}>
        {NAV.map(n => (
          <div key={n.id} onClick={()=>setPage(n.id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'9px 4px 8px',cursor:'pointer',gap:3,color:page===n.id?G:T3,transition:'.15s'}}>
            <span style={{fontSize:21,lineHeight:1}}>{n.icon}</span>
            <span style={{fontSize:11,fontWeight:500,textTransform:'uppercase',letterSpacing:.4}}>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
