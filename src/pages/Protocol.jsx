import { seedDoctor } from '../data/seed.js'

const GREEN  = '#c5f135'
const CARD   = '#1e2128'
const BORDER = '#2a2e38'
const TEXT2  = '#b0b4c0'
const TEXT3  = '#6a6e7a'
const CARD3  = '#2e3240'

export default function Protocol({ protocol, toggleProtocol, supplements, toggleSupplement, today }) {
  const peptides = protocol.filter(p => p.group === 'peptide')
  const meds     = protocol.filter(p => p.group === 'med')

  return (
    <div>
      {/* HERO */}
      <div style={s.hero}>
        <div style={s.heroOverlay} /><div style={s.heroGlow} />
        <div style={s.heroContent}>
          <div style={s.eyebrow}>Active stack</div>
          <div style={s.heroTitle}>PROTOCOL</div>
        </div>
      </div>

      {/* PEPTIDES & MEDICATIONS */}
      <div style={s.sec}>Peptides &amp; Medications</div>
      <div style={s.card}>
        <div style={s.groupLbl}>PEPTIDES</div>
        {peptides.map(p => <ProtocolRow key={p.key} item={p} onToggle={toggleProtocol} />)}
        {!today === 1 && (
          <div style={{ padding: '10px 16px', fontSize: 11, color: TEXT3, borderTop: `1px solid ${BORDER}` }}>
            ⏭ Retatrutide — next dose Monday
          </div>
        )}
        <div style={s.groupLbl}>MEDICATIONS</div>
        {meds.map(p => <ProtocolRow key={p.key} item={p} onToggle={toggleProtocol} />)}
      </div>

      {/* Note about Retatrutide if not Monday */}
      {today !== 1 && (
        <div style={{ margin: '8px 16px 0', padding: '10px 14px', background: 'rgba(255,255,255,.03)', border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 12, color: TEXT3 }}>
          ⏭ Retatrutide — next dose Monday
        </div>
      )}

      {/* SUPPLEMENTS */}
      <div style={s.sec}>Supplements</div>
      <div style={s.card}>
        {supplements.map(s2 => <SuppRow key={s2.key} item={s2} onToggle={toggleSupplement} />)}
      </div>

      {/* PRESCRIBING DOCTOR */}
      <div style={s.sec}>Prescribing Doctor</div>
      <div style={s.card}>
        {[
          ['Doctor',    seedDoctor.name],
          ['Clinic',    seedDoctor.clinic + ', SPB'],
          ['Diagnosis', seedDoctor.diagnosis],
          ['Next Appt', seedDoctor.next_appointment],
          ['Contact',   seedDoctor.contact],
        ].map(([l, v]) => (
          <div key={l} style={s.infoRow}>
            <span style={{ fontSize: 13, color: TEXT2 }}>{l}</span>
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ height: 24 }} />
    </div>
  )
}

function ProtocolRow({ item, onToggle }) {
  return (
    <div onClick={() => onToggle(item.key)} style={s.row}>
      <div style={s.rowL}>
        <div style={s.ricon}>{item.icon}</div>
        <div>
          <div style={s.rtitle}>{item.name}</div>
          <div style={s.rsub}>{item.dose} · {item.timing}</div>
        </div>
      </div>
      <div style={s.rowR}>
        <span style={{ ...s.badge, ...(item.done ? s.badgeDone : s.badgeGreen) }}>
          {item.done ? 'DONE' : 'PENDING'}
        </span>
        <div style={{ ...s.chk, ...(item.done ? s.chkDone : {}) }}>
          {item.done && <span style={{ fontSize: 12, fontWeight: 700, color: '#000' }}>✓</span>}
        </div>
      </div>
    </div>
  )
}

function SuppRow({ item, onToggle }) {
  return (
    <div onClick={() => onToggle(item.key)} style={s.row}>
      <div style={s.rowL}>
        <div style={s.ricon}>{item.icon}</div>
        <div>
          <div style={s.rtitle}>{item.name}</div>
          <div style={s.rsub}>{item.dose} · {item.timing}</div>
        </div>
      </div>
      <div style={s.rowR}>
        <span style={{ ...s.badge, ...(item.done ? s.badgeDone : s.badgeGreen) }}>
          {item.done ? 'DONE' : 'TAKE'}
        </span>
        <div style={{ ...s.chk, ...(item.done ? s.chkDone : {}) }}>
          {item.done && <span style={{ fontSize: 12, fontWeight: 700, color: '#000' }}>✓</span>}
        </div>
      </div>
    </div>
  )
}

const s = {
  hero: { position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg,#0d1200 0%,#000 55%)' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 10%,#000 100%)' },
  heroGlow:    { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 30%,rgba(197,241,53,.08) 0%,transparent 65%)' },
  heroContent: { position: 'relative', padding: '14px 18px 12px' },
  eyebrow:     { fontSize: 11, fontWeight: 600, color: GREEN, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 3 },
  heroTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 1, lineHeight: 1, color: '#fff' },
  sec:         { fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: '2px', color: '#fff', padding: '13px 16px 8px', textTransform: 'uppercase' },
  card:        { background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden', margin: '0 16px' },
  groupLbl:    { padding: '9px 16px 6px', fontSize: 10, fontWeight: 700, color: GREEN, letterSpacing: '2px', textTransform: 'uppercase', borderBottom: `1px solid ${BORDER}`, background: 'rgba(197,241,53,.03)' },
  row:         { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer' },
  rowL:        { display: 'flex', alignItems: 'center', gap: 11 },
  ricon:       { width: 36, height: 36, borderRadius: 10, background: CARD3, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  rtitle:      { fontSize: 14, fontWeight: 500, color: '#fff', lineHeight: 1.2 },
  rsub:        { fontSize: 11, color: TEXT2, marginTop: 2 },
  rowR:        { display: 'flex', alignItems: 'center', gap: 8 },
  badge:       { padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '.3px' },
  badgeGreen:  { background: 'rgba(197,241,53,.12)', color: GREEN },
  badgeDone:   { background: 'rgba(255,255,255,.06)', color: TEXT3 },
  chk:         { width: 24, height: 24, borderRadius: 6, border: `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  chkDone:     { background: GREEN, borderColor: GREEN },
  infoRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${BORDER}` },
}
