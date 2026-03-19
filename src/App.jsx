import { useState, useEffect } from 'react'
import { seedProtocol, seedPeptides, seedMedications, seedSupplements, seedLabResults, seedPendingTests, seedSleepLog, seedBodyComposition, seedGoals, seedProfile } from './data/seed.js'

// Pages
import Home from './pages/Home.jsx'
import Protocol from './pages/Protocol.jsx'
import Coach from './pages/Coach.jsx'
import Profile from './pages/Profile.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'

const PROFILES = [
  { id: 'carlos', initials: 'CA', label: 'Carlos' },
  { id: 'katya', initials: 'KA', label: 'Katya' },
  { id: 'mira', initials: 'MI', label: 'Mira' },
]

const NAV = [
  { id: 'home', label: 'Home', icon: '⬡' },
  { id: 'protocol', label: 'Protocol', icon: '⬢' },
  { id: 'coach', label: 'Coach', icon: '◈' },
  { id: 'profile', label: 'Profile', icon: '◉' },
  { id: 'reports', label: 'Reports', icon: '◎' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

export default function App() {
  const [page, setPage] = useState('home')
  const [profile, setProfile] = useState('carlos')
  const [protocol, setProtocol] = useState(seedProtocol.map(p => ({ ...p, done: false })))
  const [moods, setMoods] = useState({ morning: null, midday: null, evening: null })
  const [goals, setGoals] = useState(seedGoals)
  const [chatMsgs, setChatMsgs] = useState([
    { role: 'ai', text: "Hello Carlos. I'm your iHeal AI Coach. Share anything here — screenshots of your Oura Ring, RENPHO scans, lab results, or just tell me how you feel. I'll update your profile automatically and answer any health questions." }
  ])
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const timeStr = `${String(time.getHours()).padStart(2,'0')}:${String(time.getMinutes()).padStart(2,'0')}:${String(time.getSeconds()).padStart(2,'0')}`
  const dateStr = `${days[time.getDay()]}, ${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()}`

  const currentPeriod = () => {
    const h = time.getHours()
    if (h >= 5 && h < 12) return 'morning'
    if (h >= 12 && h < 18) return 'midday'
    return 'evening'
  }

  const toggleProto = (key) => {
    setProtocol(prev => prev.map(p => p.key === key ? { ...p, done: !p.done } : p))
  }

  const setMood = (period, val) => {
    setMoods(prev => ({ ...prev, [period]: val }))
  }

  const goCoach = (msg) => {
    if (msg) setChatMsgs(prev => [...prev, { role: 'user', text: msg }])
    setPage('coach')
  }

  const pageProps = {
    profile, protocol, moods, goals, chatMsgs,
    setChatMsgs, setGoals, toggleProto, setMood,
    goCoach, currentPeriod,
    sleepLog: seedSleepLog,
    bodyComp: seedBodyComposition,
    labResults: seedLabResults,
    pendingTests: seedPendingTests,
    peptides: seedPeptides,
    medications: seedMedications,
    supplements: seedSupplements,
    profileData: seedProfile,
  }

  const titles = { home:'Home', protocol:'Protocol', coach:'AI Coach', profile:'Health Profile', reports:'Reports', settings:'Settings' }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#080d16', color:'#d8e8f5', fontFamily:"'Outfit', sans-serif", position:'relative' }}>
      {/* Background */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:'radial-gradient(ellipse 800px 500px at 10% 15%,rgba(0,212,184,0.055) 0%,transparent 65%), radial-gradient(ellipse 700px 500px at 90% 80%,rgba(77,159,255,0.055) 0%,transparent 65%)'
      }} />
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.022) 1px,transparent 1px)', backgroundSize:'28px 28px'
      }} />

      {/* SIDEBAR — desktop only */}
      <aside style={{ width:215, background:'rgba(10,15,25,0.93)', backdropFilter:'blur(24px)', borderRight:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, height:'100vh', zIndex:200 }}
        className="hidden-mobile">
        <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#00d4b8,#4d9fff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>✦</div>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:600, letterSpacing:'-0.4px' }}>i<span style={{ color:'#00d4b8' }}>Heal</span></span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
            {PROFILES.map(p => (
              <div key={p.id} onClick={() => setProfile(p.id)}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 9px', borderRadius:8, cursor:'pointer',
                  background: profile===p.id ? 'rgba(0,212,184,0.09)' : 'transparent',
                  border: profile===p.id ? '1px solid rgba(0,212,184,0.18)' : '1px solid transparent' }}>
                <div style={{ width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700,
                  background: p.id==='carlos'?'linear-gradient(135deg,#4d9fff,#00d4b8)':p.id==='katya'?'linear-gradient(135deg,#ff5c6a,#ffb347)':'linear-gradient(135deg,#a78bfa,#ff5c6a)',
                  color:'#080d16' }}>{p.initials}</div>
                <span style={{ fontSize:12, fontWeight:500, color: profile===p.id?'#00d4b8':'#6b7f96' }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
        <nav style={{ flex:1, padding:10, overflowY:'auto' }}>
          {NAV.map(n => (
            <div key={n.id} onClick={() => setPage(n.id)}
              style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 10px', borderRadius:8, cursor:'pointer', marginBottom:2,
                color: page===n.id?'#00d4b8':'#6b7f96', fontWeight: page===n.id?500:400, fontSize:13,
                background: page===n.id?'rgba(0,212,184,0.09)':'transparent',
                border: page===n.id?'1px solid rgba(0,212,184,0.15)':'1px solid transparent' }}>
              <span style={{ fontSize:14, width:17, textAlign:'center' }}>{n.icon}</span>
              {n.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft:215, flex:1, display:'flex', flexDirection:'column', minHeight:'100vh', position:'relative', zIndex:1 }} className="main-area">
        {/* Topbar */}
        <div style={{ background:'rgba(10,15,25,0.88)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'11px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}
          className="hidden-mobile">
          <div>
            <div style={{ fontSize:13, fontWeight:500 }}>{titles[page]}</div>
            <div style={{ fontSize:11, color:'#6b7f96', marginTop:1 }}>{dateStr}</div>
          </div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:20, fontWeight:600, color:'#00d4b8', letterSpacing:'-0.5px' }}>{timeStr}</div>
        </div>

        {/* Mobile header */}
        <div style={{ display:'none', background:'rgba(10,15,25,0.96)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'11px 13px', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:200 }}
          className="show-mobile">
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:26, height:26, borderRadius:7, background:'linear-gradient(135deg,#00d4b8,#4d9fff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>✦</div>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, fontWeight:600 }}>i<span style={{ color:'#00d4b8' }}>Heal</span></span>
          </div>
          <div style={{ display:'flex', gap:4 }}>
            {PROFILES.map(p => (
              <button key={p.id} onClick={() => setProfile(p.id)}
                style={{ padding:'4px 10px', borderRadius:18, border: profile===p.id?'1px solid #00d4b8':'1px solid rgba(255,255,255,0.07)',
                  background: profile===p.id?'#00d4b8':'transparent', color: profile===p.id?'#080d16':'#6b7f96',
                  fontSize:11, cursor:'pointer', fontFamily:'inherit', fontWeight: profile===p.id?600:400 }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Page content */}
        {profile !== 'carlos' ? (
          <div style={{ maxWidth:1020, margin:'0 auto', padding:'60px 24px', textAlign:'center', width:'100%' }}>
            <div style={{ fontSize:18, fontWeight:600, marginBottom:8 }}>{profile === 'katya' ? 'Katya' : 'Mira'}'s Profile</div>
            <div style={{ fontSize:13, color:'#6b7f96', marginBottom:22 }}>Health tracking coming soon</div>
          </div>
        ) : (
          <>
            {page === 'home' && <Home {...pageProps} dateStr={dateStr} timeStr={timeStr} />}
            {page === 'protocol' && <Protocol {...pageProps} />}
            {page === 'coach' && <Coach {...pageProps} />}
            {page === 'profile' && <Profile {...pageProps} />}
            {page === 'reports' && <Reports {...pageProps} />}
            {page === 'settings' && <Settings {...pageProps} />}
          </>
        )}

        {/* Mobile bottom nav */}
        <nav style={{ display:'none', position:'fixed', bottom:0, left:0, right:0, background:'rgba(10,15,25,0.97)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(255,255,255,0.07)', padding:'7px 0 13px', zIndex:200 }}
          className="show-mobile">
          {NAV.filter(n => n.id !== 'settings').map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, border:'none', background:'transparent',
                color: page===n.id?'#00d4b8':'#3d5068', cursor:'pointer', padding:'3px 0', fontFamily:'inherit' }}>
              <span style={{ fontSize:16 }}>{n.icon}</span>
              <span style={{ fontSize:9, fontWeight:500, letterSpacing:'0.3px', textTransform:'uppercase' }}>{n.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          .main-area { margin-left: 0 !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  )
}
