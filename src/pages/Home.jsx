import { seedSleepLog, seedMacroLog, seedGoals } from '../data/seed.js'

const GREEN  = '#c5f135'
const CARD   = '#1e2128'
const BORDER = '#2a2e38'
const TEXT2  = '#b0b4c0'
const TEXT3  = '#6a6e7a'

const MOOD_OPTS = [
  { v: 'great', i: '😄' },
  { v: 'good',  i: '🙂' },
  { v: 'ok',    i: '😐' },
  { v: 'tired', i: '😴' },
  { v: 'low',   i: '😞' },
]

function currentPeriod() {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'midday'
  return 'evening'
}

export default function Home({ setPage, doneProt, totalProt, moods, setMood, macroTab, setMacroTab, time }) {
  const cp     = currentPeriod()
  const sleep  = seedSleepLog
  const macros = seedMacroLog
  const goals  = seedGoals

  const maxDs  = Math.max(...sleep.map(s => s.deep_pct))
  const isKcal = macroTab === 'kcal'
  const goal   = isKcal ? goals.calories : goals.protein_g
  const maxVal = Math.max(...macros.map(d => isKcal ? d.kcal : d.prot), goal, 1)

  // Last night
  const last = sleep[sleep.length - 1]

  return (
    <div>
      {/* HERO */}
      <div style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroGlow} />
        <div style={s.heroContent}>
          <div style={s.eyebrow}>Day 12 · Retatrutide Protocol</div>
          <div style={s.heroTitle}>CARLOS</div>
          <div style={s.heroSub}>
            Saint Petersburg · March 20, 2026
            {time ? <span style={{ color: GREEN }}> · {time}</span> : null}
          </div>
        </div>
      </div>

      {/* ALERT */}
      <div style={s.alert}>
        <div style={s.alertDot} />
        <div style={s.alertText}>
          <strong style={{ color: GREEN }}>Night 4 on Trazodone — score 81.</strong>{' '}
          Deep sleep 40min (10%), REM 1h40m (25%). Architecture stabilising. Week 2 dose (100mg) starts March 24.
        </div>
      </div>

      {/* LAST NIGHT METRICS */}
      <div style={s.secRow}>
        <div style={s.sec}>Last Night</div>
      </div>
      <div style={s.metricsGrid}>
        {[
          { lbl: 'Deep Sleep', val: '40', unit: 'm', sub: '10% of total', delta: '↑ from 9m', dc: 'good' },
          { lbl: 'Sleep Score', val: '81', unit: '',  sub: 'Best this period', delta: '↑ GOOD',   dc: 'good' },
          { lbl: 'HRV Avg',    val: '21', unit: 'ms',sub: 'Max 40ms',       delta: 'stable',    dc: 'ok' },
          { lbl: 'Resting HR', val: '68', unit: 'bpm',sub: 'Avg 76 bpm',    delta: 'normal',    dc: 'ok' },
        ].map(m => (
          <div key={m.lbl} style={s.metric}>
            <div style={s.mlbl}>{m.lbl}</div>
            <div style={s.mval}>
              {m.val}
              {m.unit && <span style={{ fontSize: 14, color: TEXT2 }}> {m.unit}</span>}
            </div>
            {m.sub && <div style={s.munit}>{m.sub}</div>}
            <div style={{ ...s.mdelta, ...(m.dc === 'good' ? s.dGood : s.dOk) }}>{m.delta}</div>
          </div>
        ))}
      </div>

      {/* DEEP SLEEP TREND */}
      <div style={s.secRow}><div style={s.sec}>Deep Sleep Trend <span style={s.secSub}>Target 15%+</span></div></div>
      <div style={s.card}>
        <div style={s.chartWrap}>
          {/* Value labels */}
          <div style={s.barVals}>
            {sleep.map((d, i) => {
              const last = i === sleep.length - 1
              return (
                <div key={d.date} style={{ ...s.barValCell, color: last ? GREEN : TEXT3 }}>
                  {d.deep_pct}%
                </div>
              )
            })}
          </div>
          {/* Bars */}
          <div style={s.barsZone}>
            {sleep.map((d, i) => {
              const h   = Math.max(4, Math.round((d.deep_pct / maxDs) * 72))
              const bg  = d.deep_pct <= 4 ? '#ff5555' : d.deep_pct <= 8 ? '#ffb400' : GREEN
              const last = i === sleep.length - 1
              return (
                <div key={d.date} style={s.bwrap}>
                  <div style={{
                    width: '100%', height: h,
                    background: bg, borderRadius: '4px 4px 0 0',
                    boxShadow: last ? '0 0 8px rgba(197,241,53,.4)' : 'none',
                  }} />
                </div>
              )
            })}
          </div>
          {/* Date labels */}
          <div style={s.barLabels}>
            {sleep.map(d => {
              const label = d.date.slice(5, 10).replace('-', '/').replace(/^0/, '').replace('/0', '/').split('/').map((n,i) => i===0 ? n : n).join('/')
              // Short label: day + M
              const day = parseInt(d.date.slice(8))
              return <div key={d.date} style={s.barLblCell}>{day}M</div>
            })}
          </div>
        </div>
      </div>

      {/* NUTRITION TREND */}
      <div style={{ ...s.secRow, paddingBottom: 8 }}>
        <div style={s.sec}>Nutrition Trend <span style={s.secSub}>Target: {isKcal ? '1,950 kcal' : '170g protein'}</span></div>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '0 16px', marginBottom: 8 }}>
        {['kcal', 'prot'].map(t => (
          <button
            key={t}
            onClick={() => setMacroTab(t)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', transition: '.15s', fontFamily: "'DM Sans', sans-serif",
              background: macroTab === t ? GREEN : CARD,
              border: `1px solid ${macroTab === t ? GREEN : BORDER}`,
              color: macroTab === t ? '#000' : TEXT2,
            }}
          >{t === 'kcal' ? 'Calories' : 'Protein'}</button>
        ))}
      </div>
      <div style={s.card}>
        <div style={s.chartWrap}>
          {/* Value labels */}
          <div style={s.barVals}>
            {macros.map((d, i) => {
              const val  = isKcal ? d.kcal : d.prot
              const last = i === macros.length - 1
              const lbl  = val === 0 ? '—' : isKcal ? (val >= 1000 ? (val/1000).toFixed(1)+'k' : val) : val+'g'
              return (
                <div key={d.date} style={{ ...s.barValCell, color: val === 0 ? TEXT3 : last ? GREEN : TEXT2 }}>
                  {lbl}
                </div>
              )
            })}
          </div>
          {/* Bars */}
          <div style={s.barsZone}>
            {macros.map((d, i) => {
              const val  = isKcal ? d.kcal : d.prot
              const h    = val > 0 ? Math.max(4, Math.round((val / maxVal) * 72)) : 4
              const pct  = val > 0 ? Math.round((val / goal) * 100) : 0
              const bg   = val === 0 ? '#2e3240' : pct >= 95 ? GREEN : pct >= 80 ? '#ffb400' : '#ff5555'
              const last = i === macros.length - 1
              return (
                <div key={d.date} style={s.bwrap}>
                  <div style={{
                    width: '100%', height: h,
                    background: bg, borderRadius: '4px 4px 0 0',
                    boxShadow: last && val > 0 ? '0 0 8px rgba(197,241,53,.4)' : 'none',
                  }} />
                </div>
              )
            })}
          </div>
          {/* Date labels */}
          <div style={s.barLabels}>
            {macros.map(d => {
              const day = parseInt(d.date.slice(8))
              return <div key={d.date} style={s.barLblCell}>{day}M</div>
            })}
          </div>
        </div>
      </div>

      {/* TODAY'S PROTOCOL tap-through */}
      <div style={s.secRow}>
        <div style={s.sec}>Today's Protocol <span style={s.secSub}>{doneProt}/{totalProt} done</span></div>
      </div>
      <div
        style={{ ...s.card, cursor: 'pointer' }}
        onClick={() => setPage('protocol')}
      >
        <div style={s.linkRow}>
          <div>
            <div style={s.linkTitle}>Check your daily peptides &amp; supplements</div>
            <div style={{ fontSize: 11, color: TEXT2, marginTop: 2 }}>{doneProt} of {totalProt} items marked done today</div>
          </div>
          <div style={{ fontSize: 18, color: TEXT3 }}>›</div>
        </div>
      </div>

      {/* MOOD CHECK-IN */}
      <div style={s.secRow}><div style={s.sec}>How Are You Feeling?</div></div>
      <div style={s.card}>
        {['morning', 'midday', 'evening'].map((period, pi) => {
          const active = period === cp
          return (
            <div key={period} style={{
              ...s.moodRow,
              borderBottom: pi < 2 ? `1px solid ${BORDER}` : 'none',
            }}>
              <div style={{ ...s.moodPeriod, color: active ? GREEN : TEXT2 }}>
                {active ? '▸ ' : ''}{period.charAt(0).toUpperCase() + period.slice(1)}
              </div>
              <div style={{ display: 'flex', gap: 7 }}>
                {MOOD_OPTS.map(m => (
                  <div
                    key={m.v}
                    onClick={() => setMood(period, m.v)}
                    style={{
                      fontSize: 22, cursor: 'pointer', padding: 3,
                      borderRadius: 8, transition: '.15s',
                      border: `2px solid ${moods[period] === m.v ? GREEN : 'transparent'}`,
                      background: moods[period] === m.v ? 'rgba(197,241,53,.1)' : 'transparent',
                    }}
                  >{m.i}</div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ height: 24 }} />
    </div>
  )
}

const s = {
  hero: { position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg,#0d1200 0%,#000 55%)', flexShrink: 0 },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 10%,#000 100%)' },
  heroGlow:    { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 30%,rgba(197,241,53,.08) 0%,transparent 65%)' },
  heroContent: { position: 'relative', padding: '16px 18px 14px' },
  eyebrow:     { fontSize: 11, fontWeight: 600, color: GREEN, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 3 },
  heroTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: 1, lineHeight: 1, color: '#fff' },
  heroSub:     { fontSize: 13, color: TEXT2, marginTop: 4 },
  alert: {
    margin: '10px 16px 0',
    background: 'rgba(197,241,53,.05)', border: '1px solid rgba(197,241,53,.2)',
    borderRadius: 14, padding: '11px 14px',
    display: 'flex', gap: 10, alignItems: 'flex-start',
  },
  alertDot:  { width: 7, height: 7, borderRadius: '50%', background: GREEN, flexShrink: 0, marginTop: 5 },
  alertText: { fontSize: 13, lineHeight: 1.5, color: '#fff' },
  secRow:    { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '13px 16px 8px' },
  sec:       { fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: '2px', color: '#fff', textTransform: 'uppercase' },
  secSub:    { fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: TEXT3, textTransform: 'none', letterSpacing: 0, fontWeight: 400, marginLeft: 8 },
  metricsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px' },
  metric:    { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '13px 12px 11px' },
  mlbl:      { fontSize: 10, fontWeight: 600, color: TEXT2, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 },
  mval:      { fontFamily: "'Bebas Neue', sans-serif", fontSize: 33, letterSpacing: '.5px', color: GREEN, lineHeight: 1 },
  munit:     { fontSize: 12, color: TEXT2, marginTop: 2 },
  mdelta:    { display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, marginTop: 5, padding: '2px 8px', borderRadius: 20 },
  dGood:     { background: 'rgba(197,241,53,.1)', color: GREEN },
  dOk:       { background: 'rgba(255,255,255,.07)', color: TEXT2 },
  card:      { background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden', margin: '0 16px' },
  chartWrap: { padding: '16px 14px 14px' },
  barVals:   { display: 'flex', gap: 5, marginBottom: 6 },
  barValCell:{ flex: 1, textAlign: 'center', fontSize: 9, color: TEXT2, whiteSpace: 'nowrap', overflow: 'hidden' },
  barsZone:  { display: 'flex', alignItems: 'flex-end', gap: 5, height: 72 },
  bwrap:     { flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%' },
  barLabels: { display: 'flex', gap: 5, marginTop: 5 },
  barLblCell:{ flex: 1, textAlign: 'center', fontSize: 8, color: TEXT3 },
  linkRow:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' },
  linkTitle: { fontSize: 14, fontWeight: 500, color: '#fff' },
  moodRow:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px' },
  moodPeriod:{ fontSize: 12, fontWeight: 600, width: 72, flexShrink: 0 },
}
