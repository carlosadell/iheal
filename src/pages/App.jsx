import { useState, useEffect } from 'react'
import Home from './pages/Home.jsx'
import Protocol from './pages/Protocol.jsx'
import Coach from './pages/Coach.jsx'
import Profile from './pages/Profile.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import { seedProtocol, seedSupplements, seedGoals } from './data/seed.js'

const NAV = [
  { id: 'home',     label: 'Home',     icon: '⬡' },
  { id: 'protocol', label: 'Protocol', icon: '◈' },
  { id: 'coach',    label: 'AI Coach', icon: '✦' },
  { id: 'profile',  label: 'Profile',  icon: '◉' },
  { id: 'reports',  label: 'Reports',  icon: '◎' },
]

const PROFILES = [
  { id: 'carlos', label: 'Carlos' },
  { id: 'katya',  label: 'Katya'  },
  { id: 'mira',   label: 'Mira'   },
]

export default function App() {
  const [page, setPage]       = useState('home')
  const [profile, setProfile] = useState('carlos')
  const [goals, setGoals]     = useState(seedGoals)
  const [macroTab, setMacroTab] = useState('kcal')
  const [time, setTime]       = useState('')

  const today = new Date().getDay()
  const [protocol, setProtocol] = useState(
    seedProtocol
      .filter(p => !p.monday_only || today === 1)
      .map(p => ({ ...p, done: false }))
  )
  const [supplements, setSupplements] = useState(
    seedSupplements.map(s => ({ ...s, done: false }))
  )

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setTime(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`)
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [])

  const toggleProtocol   = (key) => setProtocol(prev => prev.map(p => p.key === key ? { ...p, done: !p.done } : p))
  const toggleSupplement = (key) => setSupplements(prev => prev.map(s => s.key === key ? { ...s, done: !s.done } : s))

  const doneProt  = protocol.filter(p => p.done).length + supplements.filter(s => s.done).length
  const totalProt = protocol.length + supplements.length

  const sharedProps = {
    profile, setProfile, page, setPage,
    protocol, toggleProtocol,
    supplements, toggleSupplement,
    goals, setGoals,
    macroTab, setMacroTab,
    doneProt, totalProt,
    time, today,
  }

  const renderPage = () => {
    if (profile !== 'carlos') return <OtherProfile name={profile} setPage={setPage} setProfile={setProfile} />
    switch (page) {
      case 'home':     return <Home     {...sharedProps} />
      case 'protocol': return <Protocol {...sharedProps} />
      case 'coach':    return <Coach    {...sharedProps} />
      case 'profile':  return <Profile  {...sharedProps} setPage={setPage} />
      case 'reports':  return <Reports  {...sharedProps} />
      case 'settings': return <Settings {...sharedProps} />
      default:         return <Home     {...sharedProps} />
    }
  }

  return (
    <div style={s.shell}>
      <div style={s.topbar}>
        <div style={s.brand}>
          <div style={s.brandMark}>iH</div>
          <span style={s.brandI}>i</span><span style={s.brandHeal}>Heal</span>
        </div>
        <div style={s.profileRow}>
          {PROFILES.map(p => (
            <button key={p.id} onClick={() => { setProfile(p.id); setPage('home') }}
              style={{ ...s.pp, ...(profile === p.id ? s.ppActive : {}) }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={s.content}>{renderPage()}</div>

      <div style={s.nav}>
        {NAV.map(n => (
          <div key={n.id}
            onClick={() => { setProfile('carlos'); setPage(n.id) }}
            style={{ ...s.bn, ...(page === n.id && profile === 'carlos' ? s.bnActive : {}) }}>
            <span style={s.bnIcon}>{n.icon}</span>
            <span style={s.bnLabel}>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function OtherProfile({ name, setPage, setProfile }) {
  return (
    <div style={{ textAlign: 'center', padding: '72px 24px' }}>
      <div style={{ width: 60, height: 60, borderRadius: 15, background: '#1e2128', border: '1px solid #2a2e38', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>
        {name === 'katya' ? '👩' : '👶'}
      </div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, marginBottom: 8 }}>{name.toUpperCase()}</div>
      <div style={{ fontSize: 15, color: '#b0b4c0', marginBottom: 28 }}>Profile not yet set up</div>
      <button onClick={() => { setProfile('carlos'); setPage('coach') }}
        style={{ padding: '14px 32px', background: '#c5f135', border: 'none', borderRadius: 12, fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, letterSpacing: 1, color: '#000', cursor: 'pointer' }}>
        SET UP IN AI COACH
      </button>
    </div>
  )
}

const s = {
  shell: { position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto', background: '#000', color: '#fff', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' },
  topbar: { height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: '#000', borderBottom: '1px solid #2a2e38', flexShrink: 0, zIndex: 20 },
  brand: { display: 'flex', alignItems: 'center', gap: 8 },
  brandMark: { width: 32, height: 32, background: '#c5f135', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, color: '#000' },
  brandI:    { fontWeight: 700, fontSize: 21, color: '#fff', letterSpacing: 0 },
  brandHeal: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 1, color: '#c5f135' },
  profileRow: { display: 'flex', gap: 5 },
  pp: { padding: '6px 14px', borderRadius: 20, background: '#1e2128', border: '1px solid #2a2e38', fontSize: 13, fontWeight: 500, color: '#b0b4c0', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  ppActive: { background: '#c5f135', color: '#000', borderColor: '#c5f135', fontWeight: 700 },
  content: { flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', minHeight: 0 },
  nav: { height: 60, display: 'flex', background: '#000', borderTop: '1px solid #2a2e38', flexShrink: 0, zIndex: 20, paddingBottom: 'env(safe-area-inset-bottom)' },
  bn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 4px 6px', cursor: 'pointer', gap: 3, color: '#707480', transition: '.15s' },
  bnActive: { color: '#c5f135' },
  bnIcon:  { fontSize: 22, lineHeight: 1 },
  bnLabel: { fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.4px' },
}
