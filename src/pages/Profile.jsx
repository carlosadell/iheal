import { seedBodyComposition, seedLabResults, seedNextLabs } from '../data/seed.js'

const GREEN  = '#c5f135'
const CARD   = '#1e2128'
const BORDER = '#2a2e38'
const TEXT2  = '#b0b4c0'
const TEXT3  = '#6a6e7a'
const CARD3  = '#2e3240'

export default function Profile() {
  const latest = seedBodyComposition[seedBodyComposition.length - 1]

  return (
    <div>
      {/* PROFILE HEADER */}
      <div style={s.hdr}>
        <div style={s.avatar}>CA</div>
        <div style={{ position: 'relative' }}>
          <div style={s.pname}>CARLOS A.</div>
          <div style={s.psub}>Saint Petersburg, Russia · 45y</div>
          <div style={s.ppro}>PRO</div>
        </div>
      </div>

      {/* BODY COMPOSITION */}
      <div style={s.sec}>Body Composition <span style={s.secSub}>{latest.date}</span></div>
      <div style={s.grid}>
        {[
          { lbl: 'Weight',      val: latest.weight_kg,     unit: 'kg',  delta: '↓ 0.4 kg — good', dc: 'pos' },
          { lbl: 'Body Fat',    val: latest.body_fat_pct,  unit: '%',   delta: '↓ trending down', dc: 'pos', sub: 'Goal: sub-20%' },
          { lbl: 'Muscle Mass', val: latest.muscle_kg,     unit: 'kg',  delta: 'stable',           dc: 'ok' },
          { lbl: 'Visceral Fat',val: latest.visceral_fat,  unit: '',    delta: '↓ improving',       dc: 'warn', sub: 'Target: <5' },
        ].map(m => (
          <div key={m.lbl} style={s.metric}>
            <div style={s.mlbl}>{m.lbl}</div>
            <div style={s.mval}>
              {m.val}
              {m.unit && <span style={{ fontSize: 14, color: TEXT2 }}> {m.unit}</span>}
            </div>
            {m.sub && <div style={s.munit}>{m.sub}</div>}
            <div style={{ ...s.mdelta, ...(m.dc === 'pos' ? s.dPos : m.dc === 'warn' ? s.dWarn : s.dOk) }}>
              {m.delta}
            </div>
          </div>
        ))}
      </div>

      {/* LAB RESULTS */}
      <div style={s.sec}>Lab Results</div>
      <div style={s.card}>
        {seedLabResults.map(l => (
          <div key={l.name} style={s.labRow}>
            <div style={{ fontSize: 13, color: '#fff' }}>{l.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 10, color: TEXT3 }}>{l.range}</div>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: l.status === 'ok' ? GREEN : l.status === 'warn' ? '#ffb400' : TEXT3,
                ...(l.status === 'pend' ? { fontSize: 11, fontWeight: 400 } : {}),
              }}>
                {l.value ?? 'Pending'}
                {l.unit && l.value ? <span style={{ fontSize: 9, fontWeight: 400, color: TEXT3 }}> {l.unit}</span> : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RECOMMENDED NEXT LABS */}
      <div style={s.sec}>Recommended Next Labs</div>
      <div style={s.card}>
        {seedNextLabs.map(l => (
          <div key={l} style={s.nextLabRow}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: CARD3, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🧪</div>
            <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ height: 24 }} />
    </div>
  )
}

const s = {
  hdr: {
    padding: '16px', display: 'flex', alignItems: 'center', gap: 14,
    background: 'linear-gradient(160deg,#0d1200 0%,#000 70%)',
    borderBottom: `1px solid ${BORDER}`, position: 'relative', overflow: 'hidden',
  },
  avatar: {
    width: 54, height: 54, borderRadius: 14, background: GREEN,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Bebas Neue', sans-serif", fontSize: 25, color: '#000', flexShrink: 0,
  },
  pname:  { fontFamily: "'Bebas Neue', sans-serif", fontSize: 27, letterSpacing: 1, color: '#fff' },
  psub:   { fontSize: 12, color: TEXT2, marginTop: 1 },
  ppro:   { display: 'inline-block', background: GREEN, color: '#000', fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, marginTop: 5 },
  sec:    { fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: '2px', color: '#fff', padding: '13px 16px 8px', textTransform: 'uppercase' },
  secSub: { fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: TEXT3, textTransform: 'none', letterSpacing: 0, fontWeight: 400, marginLeft: 8 },
  grid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px' },
  metric: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '13px 12px 11px' },
  mlbl:   { fontSize: 10, fontWeight: 600, color: TEXT2, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 },
  mval:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: '.5px', color: GREEN, lineHeight: 1 },
  munit:  { fontSize: 11, color: TEXT2, marginTop: 2 },
  mdelta: { display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, marginTop: 5, padding: '2px 8px', borderRadius: 20 },
  dPos:   { background: 'rgba(76,175,80,.12)', color: '#66bb6a' },
  dOk:    { background: 'rgba(255,255,255,.07)', color: TEXT2 },
  dWarn:  { background: 'rgba(255,180,0,.1)', color: '#ffb400' },
  card:   { background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden', margin: '0 16px' },
  labRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderBottom: `1px solid ${BORDER}` },
  nextLabRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: `1px solid ${BORDER}` },
}
