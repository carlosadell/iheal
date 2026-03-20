import { useState } from 'react'

const GREEN  = '#c5f135'
const CARD   = '#1e2128'
const BORDER = '#2a2e38'
const TEXT2  = '#c8ccd8'
const TEXT3  = '#888a96'

export default function Reports({ setPage }) {
  const [recipient, setRecipient] = useState('')
  const [language,  setLanguage]  = useState('English')
  const [dates,     setDates]     = useState('')
  const [notes,     setNotes]     = useState('')

  const generate = () => {
    const prompt = `Generate a clinical health report for ${recipient || 'my doctor'} in ${language}. Date range: ${dates || 'March 2026'}. ${notes ? 'Focus on: ' + notes : 'Include sleep architecture, HRV trends, body composition, medications and supplements, and lab results.'}`
    sessionStorage.setItem('iheal_report_prompt', prompt)
    setPage('coach')
  }

  return (
    <div>
      <div style={s.hero}>
        <div style={s.heroOverlay} /><div style={s.heroGlow} />
        <div style={s.heroContent}>
          <div style={s.eyebrow}>Generate</div>
          <div style={s.heroTitle}>REPORTS</div>
        </div>
      </div>

      <div style={s.sec}>New Report</div>
      <div style={{ padding: '0 16px' }}>
        <label style={s.flbl}>Recipient Name</label>
        <input style={s.finput} value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="e.g. Dr. Anton" />

        <label style={s.flbl}>Language</label>
        <select style={s.finput} value={language} onChange={e => setLanguage(e.target.value)}>
          <option>English</option>
          <option>Russian</option>
          <option>Spanish</option>
        </select>

        <label style={s.flbl}>Date Range</label>
        <input style={s.finput} value={dates} onChange={e => setDates(e.target.value)} placeholder="e.g. March 1–20, 2026" />

        <label style={s.flbl}>What to include</label>
        <textarea style={s.ftextarea} value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Focus on sleep and Trazodone response. Skip nutrition details." />
      </div>

      <button onClick={generate} style={s.btnMain}>GENERATE REPORT</button>

      <div style={s.sec}>Previous Reports</div>
      <div style={s.card}>
        {[
          { name: 'Dr. Anton — Psychiatrist', lang: 'Russian', date: '15 Mar 2026', desc: 'Sleep + HRV + medications' },
          { name: 'Clinical Summary',         lang: 'English', date: '15 Mar 2026', desc: 'Full clinical summary' },
          { name: 'Resumen Clínico',          lang: 'Spanish', date: '15 Mar 2026', desc: 'Full clinical summary' },
        ].map(r => (
          <div key={r.name} style={s.row}>
            <div style={s.rowL}>
              <div style={s.ricon}>📋</div>
              <div>
                <div style={s.rtitle}>{r.name}</div>
                <div style={s.rsub}>{r.date} · {r.lang} · {r.desc}</div>
              </div>
            </div>
            <div style={{ fontSize: 18, color: TEXT3 }}>›</div>
          </div>
        ))}
      </div>

      <div style={{ height: 28 }} />
    </div>
  )
}

const s = {
  hero:        { position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg,#0d1200 0%,#000 55%)' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 10%,#000 100%)' },
  heroGlow:    { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 30%,rgba(197,241,53,.08) 0%,transparent 65%)' },
  heroContent: { position: 'relative', padding: '16px 18px 14px' },
  eyebrow:     { fontSize: 12, fontWeight: 600, color: GREEN, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 3 },
  heroTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, letterSpacing: 1, lineHeight: 1, color: '#fff' },
  sec:         { fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: '2px', color: '#fff', padding: '14px 16px 9px', textTransform: 'uppercase' },
  flbl:        { display: 'block', fontSize: 11, fontWeight: 600, color: TEXT2, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 7, marginTop: 14 },
  finput:      { width: '100%', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', fontSize: 16, color: '#fff', fontFamily: "'DM Sans', sans-serif", outline: 'none' },
  ftextarea:   { width: '100%', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', fontSize: 16, color: '#fff', fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'none', height: 84, lineHeight: 1.5 },
  btnMain:     { display: 'block', width: 'calc(100% - 32px)', margin: '16px 16px 0', padding: 15, borderRadius: 12, background: GREEN, border: 'none', fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, letterSpacing: 1, color: '#000', cursor: 'pointer' },
  card:        { background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden', margin: '0 16px' },
  row:         { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' },
  rowL:        { display: 'flex', alignItems: 'center', gap: 12 },
  ricon:       { width: 36, height: 36, borderRadius: 10, background: '#2e3240', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  rtitle:      { fontSize: 15, fontWeight: 500, color: '#fff' },
  rsub:        { fontSize: 13, color: TEXT2, marginTop: 2 },
}
