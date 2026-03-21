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

const PROTOCOL_ITEMS = [
  {key:'epi',    icon:'🧬', name:'Epitalon',                sub:'2mg subQ · before bed',             time:'~21:00', group:'peptide'},
  {key:'tra',    icon:'💊', name:'Trazodone (Триттико)',     sub:'50mg wk1 · 100mg wk2 · 150mg wk3', time:'21:00',  group:'med'},
  {key:'eti_am', icon:'💊', name:'Etifoxine — Morning',     sub:'50mg',                              time:'09:00',  group:'med'},
  {key:'eti_md', icon:'💊', name:'Etifoxine — Midday',      sub:'50mg',                              time:'14:00',  group:'med'},
  {key:'eti_ev', icon:'💊', name:'Etifoxine — Evening',     sub:'50mg',                              time:'17:00',  group:'med'},
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

// Returns today's date as YYYY-MM-DD string
function todayKey() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`
}

// Build protocol list including Retatrutide only on Mondays
function buildProtocolItems() {
  const isMonday = new Date().getDay() === 1
  const items = [...PROTOCOL_ITEMS]
  if (isMonday) {
    items.unshift({key:'ret', icon:'💉', name:'Retatrutide', sub:'1mg subcutaneous · after food', time:'Monday', group:'peptide'})
  }
  return items
}

// Load today's check state from localStorage
// Returns {protocol: {key: bool}, supplements: {key: bool}}
function loadChecks() {
  try {
    const stored = localStorage.getItem('iheal_checks')
    if (!stored) return null
    const parsed = JSON.parse(stored)
    // If stored date is not today, ignore it (daily reset)
    if (parsed.date !== todayKey()) return null
    return parsed
  } catch {
    return null
  }
}

// Save current check state to localStorage with today's date
function saveChecks(protocolState, supplementsState) {
  try {
    const checks = {
      date: todayKey(),
      protocol: Object.fromEntries(protocolState.map(p => [p.key, p.done])),
      supplements: Object.fromEntries(supplementsState.map(s => [s.key, s.done])),
    }
    localStorage.setItem('iheal_checks', JSON.stringify(checks))
  } catch {}
}

// Build initial protocol state, restoring today's checks if available
function buildProtocol() {
  const items = buildProtocolItems()
  const saved = loadChecks()
  return items.map(p => ({
    ...p,
    done: saved?.protocol?.[p.key] ?? false,
  }))
}

// Build initial supplements state, restoring today's checks if available
function buildSupplements() {
  const saved = loadChecks()
  return SUPPLEMENT_ITEMS.map(s => ({
    ...s,
    done: saved?.supplements?.[s.key] ?? false,
  }))
}

export default function App() {
  const [page, setPage]         = useState('home')
  const [protocol, setProtocol] = useState(buildProtocol)
  const [supplements, setSupps] = useState(buildSupplements)
  const [macroTab, setMacroTab] = useState('kcal')
  const [time, setTime]         = useState('')
  const [todayStr, setTodayStr] = useState('')
  const [dayNum, setDayNum]     = useState(1)

  // Clock and date ticker
  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setTime(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`)
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
      setTodayStr(`Saint Petersburg · ${months[n.getMonth()]} ${n.getDate()}, ${n.getFullYear()}`)
      const diff = Math.floor((n - PROTOCOL_START) / (1000*60*60*24)) + 1
      setDayNum(diff > 0 ? diff : 1)
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [])

  // Persist checks to localStorage whenever protocol or supplements change
  useEffect(() => {
    saveChecks(protocol, supplements)
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
      {/* TOPBAR */}
      <div style={{height:54,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',borderBottom:`1px solid ${BORDER}`,background:BG,flexShrink:0,zIndex:20}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:30,height:30,background:G,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:'#000'}}>iH</div>
          <span style={{fontSize:19,fontWeight:700,letterSpacing:.3}}>i<span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:1,color:G}}>Heal</span></span>
        </div>
        <div style={{fontSize:13,color:'#b0b4c0',fontWeight:500}}>Carlos</div>
      </div>

      {/* CONTENT */}
      <div style={{flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch',minHeight:0}}>
        {page==='home'     && <Home     {...shared}/>}
        {page==='protocol' && <Protocol {...shared}/>}
        {page==='coach'    && <Coach    {...shared}/>}
        {page==='profile'  && <Profile  {...shared} setPage={setPage}/>}
        {page==='reports'  && <Reports  {...shared}/>}
        {page==='settings' && <Settings {...shared} setPage={setPage}/>}
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
