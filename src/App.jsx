import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Protocol from './pages/Protocol'
import Coach from './pages/Coach'
import Profile from './pages/Profile'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import { seedProfile, seedSleepLogs, seedBodyComposition, seedLabResults, seedMacroLogs, recommendedNextLabs } from './data/seed'

const NAV = [
  { id: 'home',     label: 'Home',     icon: '⬡' },
  { id: 'protocol', label: 'Protocol', icon: '◈' },
  { id: 'coach',    label: 'AI Coach', icon: '✦' },
  { id: 'profile',  label: 'Profile',  icon: '◉' },
  { id: 'reports',  label: 'Reports',  icon: '◎' },
]

// ─── Protocol and supplement item definitions (no done state here) ───────────

const PROTOCOL_ITEMS = [
  {key:'epi',    icon:'🧬', name:'Epitalon',               sub:'2mg subQ · before bed',             time:'~21:00', group:'peptide'},
  {key:'tra',    icon:'💊', name:'Trazodone (Триттико)',    sub:'50mg wk1 · 100mg wk2 · 150mg wk3', time:'21:00',  group:'med'},
  {key:'eti_am', icon:'💊', name:'Etifoxine — Morning',    sub:'50mg',                              time:'09:00',  group:'med'},
  {key:'eti_md', icon:'💊', name:'Etifoxine — Midday',     sub:'50mg',                              time:'14:00',  group:'med'},
  {key:'eti_ev', icon:'💊', name:'Etifoxine — Evening',    sub:'50mg',                              time:'17:00',  group:'med'},
]

const SUPPLEMENT_ITEMS = [
  {key:'vitc',   icon:'🍊', name:'Vitamin C',                   sub:'900–1800mg · on waking'},
  {key:'magcit', icon:'🌊', name:'Magnesium Citrate 400mg',     sub:'morning'},
  {key:'bcomp',  icon:'🅱️', name:'B-Complex Methylated',        sub:'morning'},
  {key:'k2',     icon:'🫙', name:'Vitamin K2 MK-7',             sub:'2 capsules · daily'},
  {key:'d3',     icon:'☀️', name:'Vitamin D3 10,000 IU',        sub:'4× per week'},
  {key:'dhea',   icon:'⚡', name:'DHEA',                        sub:'100mg · daily'},
  {key:'magbis', icon:'🌙', name:'Magnesium Bisglycinate + B6', sub:'evening'},
]

const PROTOCOL_START = new Date('2026-03-09')
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

// ─── Date helpers — computed immediately, not in useEffect ────────────────────

function getTodayKey() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`
}

function getTodayStr() {
  const n = new Date()
  return `Saint Petersburg · ${MONTHS[n.getMonth()]} ${n.getDate()}, ${n.getFullYear()}`
}

function getDayNum() {
  const diff = Math.floor((new Date() - PROTOCOL_START) / (1000*60*60*24)) + 1
  return diff > 0 ? diff : 1
}

function getTime() {
  const n = new Date()
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`
}

// ─── LocalStorage persistence for daily check state ──────────────────────────

function loadSavedChecks() {
  try {
    const raw = localStorage.getItem('iheal_checks')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Discard if saved on a different day — automatic daily reset
    if (parsed.date !== getTodayKey()) return null
    return parsed
  } catch {
    return null
  }
}

function persistChecks(protocolArr, supplementsArr) {
  try {
    localStorage.setItem('iheal_checks', JSON.stringify({
      date:        getTodayKey(),
      protocol:    Object.fromEntries(protocolArr.map(p => [p.key, p.done])),
      supplements: Object.fromEntries(supplementsArr.map(s => [s.key, s.done])),
    }))
  } catch {}
}

// ─── Build initial state, restoring today's checks if they exist ─────────────

function buildInitialProtocol() {
  const isMonday = new Date().getDay() === 1
  const saved    = loadSavedChecks()
  const items    = [...PROTOCOL_ITEMS]
  if (isMonday) {
    items.unshift({key:'ret', icon:'💉', name:'Retatrutide', sub:'1mg subcutaneous · after food', time:'Monday', group:'peptide'})
  }
  return items.map(p => ({ ...p, done: saved?.protocol?.[p.key] ?? false }))
}

function buildInitialSupplements() {
  const saved = loadSavedChecks()
  return SUPPLEMENT_ITEMS.map(s => ({ ...s, done: saved?.supplements?.[s.key] ?? false }))
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [page,       setPage]    = useState('home')
  const [protocol,   setProtocol] = useState(buildInitialProtocol)
  const [supplements, setSupps]  = useState(buildInitialSupplements)
  const [macroTab,   setMacroTab] = useState('kcal')
  // Initialise date/time immediately so there is no flash of wrong values
  const [time,    setTime]    = useState(getTime)
  const [todayStr,setTodayStr] = useState(getTodayStr)
  const [dayNum,  setDayNum]  = useState(getDayNum)

  // Tick every 10 seconds to keep time/date fresh
  useEffect(() => {
    const id = setInterval(() => {
      setTime(getTime())
      setTodayStr(getTodayStr())
      setDayNum(getDayNum())
    }, 10000)
    return () => clearInterval(id)
  }, [])

  // Persist checks to localStorage whenever the user taps a checkbox
  useEffect(() => {
    persistChecks(protocol, supplements)
  }, [protocol, supplements])

  const togProto = (key) => setProtocol(p => p.map(i => i.key===key ? {...i, done:!i.done} : i))
  const togSupp  = (key) => setSupps(s  => s.map(i => i.key===key ? {...i, done:!i.done} : i))

  const shared = {
    protocol, supplements, macroTab, time, todayStr, dayNum,
    setMacroTab, togProto, togSupp, setPage,
    sleepLogs:  seedSleepLogs,
    bodyComp:   seedBodyComposition,
    labResults: seedLabResults,
    macroLogs:  seedMacroLogs,
    profile:    seedProfile,
    nextLabs:   recommendedNextLabs,
    isMonday:   new Date().getDay() === 1,
  }

  const G = '#c5f135', BG = '#000', CARD = '#1e2128', BORDER = '#2a2e38'
  const T = '#fff', T3 = '#808490'

  return (
    <div style={{position:'fixed',inset:0,display:'flex',flexDirection:'column',maxWidth:430,margin:'0 auto',background:BG,color:T,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{height:54,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',borderBottom:`1px solid ${BORDER}`,background:BG,flexShrink:0,zIndex:20}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:30,height:30,background:G,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:'#000'}}>iH</div>
          <span style={{fontSize:19,fontWeight:700,letterSpacing:.3}}>i<span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:1,color:G}}>Heal</span></span>
        </div>
        <div style={{fontSize:13,color:'#b0b4c0',fontWeight:500}}>Carlos</div>
      </div>

      <div style={{flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch',minHeight:0}}>
        {page==='home'     && <Home     {...shared}/>}
        {page==='protocol' && <Protocol {...shared}/>}
        {page==='coach'    && <Coach    {...shared}/>}
        {page==='profile'  && <Profile  {...shared} setPage={setPage}/>}
        {page==='reports'  && <Reports  {...shared}/>}
        {page==='settings' && <Settings {...shared} setPage={setPage}/>}
      </div>

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
