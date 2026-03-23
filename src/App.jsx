import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Protocol from './pages/Protocol'
import Coach from './pages/Coach'
import Profile from './pages/Profile'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import { seedProfile, recommendedNextLabs } from './data/seed'
import {
  fetchSleepLogs, fetchBodyComposition, fetchMacroLogs,
  fetchLabResults, fetchBpLogs, upsertProtocolCheck, fetchProtocolChecks
} from './lib/supabase'

const NAV = [
  { id: 'home',     label: 'Home',     icon: '⬡' },
  { id: 'protocol', label: 'Protocol', icon: '◈' },
  { id: 'coach',    label: 'AI Coach', icon: '✦' },
  { id: 'profile',  label: 'Profile',  icon: '◉' },
  { id: 'reports',  label: 'Reports',  icon: '◎' },
]

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

function buildProtocolItems() {
  const isMonday = new Date().getDay() === 1
  const items = [...PROTOCOL_ITEMS]
  if (isMonday) items.unshift({key:'ret', icon:'💉', name:'Retatrutide', sub:'1mg subcutaneous · after food', time:'Monday', group:'peptide'})
  return items
}

export default function App() {
  const [page,        setPage]     = useState('home')
  const [protocol,    setProtocol] = useState(() => buildProtocolItems().map(p => ({...p, done:false})))
  const [supplements, setSupps]    = useState(() => SUPPLEMENT_ITEMS.map(s => ({...s, done:false})))
  const [macroTab,    setMacroTab] = useState('kcal')
  const [time,        setTime]     = useState(getTime)
  const [todayStr,    setTodayStr] = useState(getTodayStr)
  const [dayNum,      setDayNum]   = useState(getDayNum)
  const [sleepLogs,   setSleepLogs]  = useState([])
  const [bodyComp,    setBodyComp]   = useState([])
  const [macroLogs,   setMacroLogs]  = useState([])
  const [labResults,  setLabResults] = useState([])
  const [bpLogs,      setBpLogs]     = useState([])
  const [loading,     setLoading]    = useState(true)

  useEffect(() => {
    async function loadAll() {
      const [sleep, body, macros, labs, bp, checks] = await Promise.all([
        fetchSleepLogs(),
        fetchBodyComposition(),
        fetchMacroLogs(),
        fetchLabResults(),
        fetchBpLogs(),
        fetchProtocolChecks(getTodayKey()),
      ])
      if (sleep.length)  setSleepLogs(sleep)
      if (body.length)   setBodyComp(body)
      if (macros.length) setMacroLogs(macros)
      if (labs.length)   setLabResults(labs)
      if (bp.length)     setBpLogs(bp)
      if (checks.length) {
        const checkMap = Object.fromEntries(checks.map(c => [c.key, c.done]))
        setProtocol(p => p.map(i => ({...i, done: checkMap[i.key] ?? false})))
        setSupps(s => s.map(i => ({...i, done: checkMap[i.key] ?? false})))
      }
      setLoading(false)
    }
    loadAll()
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setTime(getTime())
      setTodayStr(getTodayStr())
      setDayNum(getDayNum())
    }, 10000)
    return () => clearInterval(id)
  }, [])

  const togProto = async (key) => {
    const current = protocol.find(i => i.key === key)
    if (!current) return
    const newDone = !current.done
    setProtocol(p => p.map(i => i.key === key ? {...i, done: newDone} : i))
    await upsertProtocolCheck(getTodayKey(), key, newDone)
  }

  const togSupp = async (key) => {
    const current = supplements.find(i => i.key === key)
    if (!current) return
    const newDone = !current.done
    setSupps(s => s.map(i => i.key === key ? {...i, done: newDone} : i))
    await upsertProtocolCheck(getTodayKey(), key, newDone)
  }

  const shared = {
    protocol, supplements, macroTab, time, todayStr, dayNum, loading,
    setMacroTab, togProto, togSupp, setPage,
    sleepLogs, bodyComp, labResults, macroLogs, bpLogs,
    profile:  seedProfile,
    nextLabs: recommendedNextLabs,
    isMonday: new Date().getDay() === 1,
    refreshSleep:  () => fetchSleepLogs().then(d => { if(d.length) setSleepLogs(d) }),
    refreshMacros: () => fetchMacroLogs().then(d => { if(d.length) setMacroLogs(d) }),
    refreshBody:   () => fetchBodyComposition().then(d => { if(d.length) setBodyComp(d) }),
    refreshBp:     () => fetchBpLogs().then(d => setBpLogs(d)),
    refreshLabs:   () => fetchLabResults().then(d => { if(d.length) setLabResults(d) }),
  }

  const G = '#c5f135', BG = '#000', BORDER = '#2a2e38', T3 = '#808490'

  return (
    <div style={{position:'fixed',inset:0,display:'flex',flexDirection:'column',maxWidth:430,margin:'0 auto',background:BG,color:'#fff',fontFamily:"'DM Sans',sans-serif"}}>
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
