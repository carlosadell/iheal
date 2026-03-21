import { seedDoctor } from '../data/seed.js'

const GREEN  = '#c5f135'
const CARD   = '#1e2128'
const BORDER = '#2a2e38'
const TEXT2  = '#c8ccd8'
const TEXT3  = '#888a96'
const CARD3  = '#2e3240'

export default function Protocol({ protocol, togProto, supplements, togSupp, today }) {
  const peptides = protocol.filter(p => p.group === 'peptide')
  const meds     = protocol.filter(p => p.group === 'med')

  return (
    <div>
      <div style={s.hero}>
        <div style={s.heroOverlay} /><div style={s.heroGlow} />
        <div style={s.heroContent}>
          <div style={s.eyebrow}>Active stack</div>
          <div style={s.heroTitle}>PROTOCOL</div>
        </div>
      </div>

      <div style={s.sec}>Peptides &amp; Medications</div>
      <div style={s.card}>
        <div style={s.groupLbl}>PEPTIDES</div>
        {peptides.map(p => (
          <div key={p.key} style={s.row} onClick={() => togProto(p.key)}>
            <div style={s.rowL}>
              <div style={s.ricon}>{p.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.rtitle}>{p.name}</div>
                <div style={s.rsub}>{p.sub}</div>
              </div>
            </div>
            <div style={s.rowR}>
              <span style={{ ...s.badge, ...(p.done ? s.badgeDone : s.badgeGreen) }}>
                {p.done ? 'DONE' : 'PENDING'}
              </span>
              <div style={{ ...s.chk, ...(p.done ? s.chkDone : {}) }}>
                {p.done && <span style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>✓</span>}
              </div>
            </div>
          </div>
        ))}
        {today !== 1 && (
          <div style={{ padding: '10px 16px', fontSize: 13, color: TEXT3, borderTop: `1px solid ${BORDER}` }}>
            ⏭ Retatrutide — next dose Monday
          </div>
        )}
        <div style={s.groupLbl}>MEDICATIONS</div>
        {meds.map(p => (
          <div key={p.key} style={s.row} onClick={() => togProto(p.key)}>
            <div style={s.rowL}>
              <div style={s.ricon}>{p.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.rtitle}>{p.name}</div>
                <div style={s.rsub}>{p.sub}</div>
              </div>
            </div>
            <div style={s.rowR}>
              <span style={{ ...s.badge, ...(p.done ? s.badgeDone : s.badgeGreen) }}>
                {p.done ? 'DONE' : 'PENDING'}
              </span>
              <div style={{ ...s.chk, ...(p.done ? s.chkDone : {}) }}>
                {p.done && <span style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>✓</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.sec}>Supplements</div>
      <div style={s.card}>
        {supplements.map(sup => (
          <div key={sup.key} style={s.row} onClick={() => togSupp(sup.key)}>
            <div style={s.rowL}>
              <div style={s.ricon}>{sup.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.rtitle}>{sup.name}</div>
                <div style={s.rsub}>{sup.sub}</div>
              </div>
            </div>
            <div style={s.rowR}>
              <span style={{ ...s.badge, ...(sup.done ? s.badgeDone : s.badgeGreen) }}>
                {sup.done ? 'DONE' : 'TAKE'}
              </span>
              <div style={{ ...s.chk, ...(sup.done ? s.chkDone : {}) }}>
                {sup.done && <span style={{ fontSize: 13, fontWeight: 700, color: '#000' }}>✓</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.sec}>Prescribing Doctor</div>
      <div style={s.card}>
        {[
          ['Doctor',    seedDoctor.name],
          ['Clinic',    seedDoctor.clinic + ', SPB'],
          ['Diagnosis', seedDoctor.diagnosis],
          ['Next Appt', seedDoctor.next_appointment],
          ['Contact',   seedDoctor.contact],
        ].map(([l, v]) => (
          <div key={l} style={{ ...s.row, cursor: 'default' }}>
            <span style={{ fontSize: 14, color: TEXT2 }}>{l}</span>
            <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{v}</span>
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
  card:        { background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden', margin: '0 16px' },
  groupLbl:    { padding: '9px 16px 7px', fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: '2px', textTransform: 'uppercase', borderBottom: `1px solid ${BORDER}`, background: 'rgba(197,241,53,.03)' },
  row:         { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', userSelect: 'none' },
  rowL:        { display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  ricon:       { width: 38, height: 38, borderRadius: 10, background: CARD3, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 },
  rtitle:      { fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: 1.2 },
  rsub:        { fontSize: 13, color: TEXT2, marginTop: 3 },
  rowR:        { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  badge:       { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '.3px' },
  badgeGreen:  { background: 'rgba(197,241,53,.12)', color: GREEN },
  badgeDone:   { background: 'rgba(255,255,255,.06)', color: TEXT3 },
  chk:         { width: 26, height: 26, borderRadius: 7, border: `2px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  chkDone:     { background: GREEN, borderColor: GREEN },
}
