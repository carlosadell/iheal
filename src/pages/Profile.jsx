import { seedBodyComposition, seedLabResults, seedNextLabs } from '../data/seed.js'

const GREEN  = '#c5f135'
const CARD   = '#1e2128'
const BORDER = '#2a2e38'
const TEXT2  = '#c8ccd8'
const TEXT3  = '#888a96'
const CARD3  = '#2e3240'

export default function Profile({ setPage }) {
  const latest = seedBodyComposition[seedBodyComposition.length - 1]

  return (
    <div>
      <div style={s.hdr}>
        <div style={s.avatar}>CA</div>
        <div style={{ position: 'relative' }}>
          <div style={s.pname}>CARLOS A.</div>
          <div style={s.psub}>Saint Petersburg, Russia · 45y</div>
          <div style={s.ppro}>PRO</div>
        </div>
      </div>

      <div style={s.sec}>Body Composition <span style={s.secSub}>{latest.date}</span></div>
      <div style={s.grid}>
        {[
          { lbl: 'Weight',      val: latest.weight_kg,    unit: 'kg', delta: '↓ 0.4 kg — good', dc: 'pos' },
          { lbl: 'Body Fat',    val: latest.body_fat_pct, unit: '%',  delta: '↓ trending down',  dc: 'pos', sub: 'Goal: sub-20%' },
          { lbl: 'Muscle Mass', val: latest.muscle_mass_kg,unit:'kg', delta: 'stable',            dc: 'ok'  },
          { lbl: 'Visceral Fat',val: latest.visceral_fat, unit: '',   delta: '↓ improving',       dc: 'warn', sub: 'Target: <5' },
        ].map(m => (
          <div key={m.lbl} style={s.metric}>
            <div style={s.mlbl}>{m.lbl}</div>
            <div style={s.mval}>{m.val}<span style={{ fontSize: 15, color: TEXT2 }}> {m.unit}</span></div>
            {m.sub && <div style={s.munit}>{m.sub}</div>}
            <div style={{ ...s.mdelta, ...(m.dc === 'pos' ? s.dPos : m.dc === 'warn' ? s.dWarn : s.dOk) }}>
              {m.delta}
            </div>
          </div>
        ))}
      </div>

      <div style={s.sec}>Lab Results</div>
      <div style={s.card}>
        {seedLabResults.map(l => (
          <div key={l.name} style={s.labRow}>
            <div style={{ fontSize: 14, color: '#fff' }}>{l.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 11, color: TEXT3 }}>{l.range}</div>
              <div style={{
                fontSize: 14, fontWeight: 600,
                color: l.status === 'ok' ? GREEN : l.status === 'warn' ? '#ffb400' : TEXT3,
                ...(l.status === 'pending' ? { fontSize: 12, fontWeight: 400 } : {}),
              }}>
                {l.value ?? 'Pending'}
                {l.unit && l.value ? <span style={{ fontSize: 10, fontWeight: 400, color: TEXT3 }}> {l.unit}</span> : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.sec}>Recommended Next Labs</div>
      <div style={s.card}>
        {seedNextLabs.map(l => (
          <div key={l} style={s.nextLabRow}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: CARD3, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>🧪</div>
            <div style={{ fontSize: 14, color: TEXT2, lineHeight: 1.4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Settings link */}
      <div style={{ margin: '16px 16px 0' }}>
        <div style={{ ...s.card, cursor: 'pointer' }} onClick={() => setPage('settings')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: CARD3, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚙️</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>Settings &amp; Goals</div>
            </div>
            <div style={{ fontSize: 20, color: TEXT3 }}>›</div>
          </div>
        </div>
      </div>

      <div style={{ height: 28 }} />
    </div>
  )
}

const s = {
  hdr:     { padding: '18px 16px 14px', display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(160deg,#0d1200 0%,#000 70%)', borderBottom: `1px solid ${BORDER}`, position: 'relative', overflow: 'hidden' },
  avatar:  { width: 56, height: 56, borderRadius: 14, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: '#000', flexShrink: 0 },
  pname:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, color: '#fff' },
  psub:    { fontSize: 13, color: TEXT2, marginTop: 2 },
  ppro:    { display: 'inline-block', background: GREEN, color: '#000', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, marginTop: 6 },
  sec:     { fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: '2px', color: '#fff', padding: '14px 16px 9px', textTransform: 'uppercase' },
  secSub:  { fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: TEXT3, textTransform: 'none', letterSpacing: 0, fontWeight: 400, marginLeft: 8 },
  grid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px' },
  metric:  { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 13px 12px' },
  mlbl:    { fontSize: 11, fontWeight: 600, color: TEXT2, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 5 },
  mval:    { fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: '.5px', color: GREEN, lineHeight: 1 },
  munit:   { fontSize: 12, color: TEXT2, marginTop: 3 },
  mdelta:  { display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600, marginTop: 6, padding: '2px 9px', borderRadius: 20 },
  dPos:    { background: 'rgba(76,175,80,.12)', color: '#66bb6a' },
  dOk:     { background: 'rgba(255,255,255,.07)', color: TEXT2 },
  dWarn:   { background: 'rgba(255,180,0,.1)', color: '#ffb400' },
  card:    { background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden', margin: '0 16px' },
  labRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${BORDER}` },
  nextLabRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${BORDER}` },
}
