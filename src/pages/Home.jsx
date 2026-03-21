import { seedSleepLog, seedMacroLogs, seedGoals } from '../data/seed.js'

const GREEN  = '#c5f135'
const CARD   = '#1e2128'
const BORDER = '#2a2e38'
const TEXT2  = '#c8ccd8'
const TEXT3  = '#888a96'

export default function Home({ setPage, doneProt, totalProt, macroTab, setMacroTab, time }) {
  const sleep  = seedSleepLog
  const macros = seedMacroLogs
  const goals  = seedGoals

  const maxDs  = Math.max(...sleep.map(s => s.deep_pct))
  const isKcal = macroTab === 'kcal'
  const goal   = isKcal ? goals.calories : goals.protein_g
  const maxVal = Math.max(...macros.map(d => isKcal ? d.kcal : d.protein_g), goal, 1)

  return (
    <div>
      {/* HERO */}
      <div style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroGlow} />
        <div style={s.heroContent}>
          <div style={s.eyebrow}>Day {dayNum} · Retatrutide Protocol</div>
          <div style={s.heroTitle}>CARLOS</div>
          <div style={s.heroSub}>
            {todayStr}
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

      {/* LAST NIGHT */}
      <div style={s.secRow}><div style={s.sec}>Last Night</div></div>
      <div style={s.metricsGrid}>
        {[
          { lbl: 'Deep Sleep', val: '40', unit: 'm',   sub: '10% of total', delta: '↑ from 9m',   dc: 'good' },
          { lbl: 'Sleep Score',val: '81', unit: '',    sub: 'Best this period', delta: '↑ GOOD',  dc: 'good' },
          { lbl: 'HRV Avg',    val: '21', unit: 'ms',  sub: 'Max 40ms',     delta: 'stable',      dc: 'ok'   },
          { lbl: 'Resting HR', val: '68', unit: 'bpm', sub: 'Avg 76 bpm',   delta: 'normal',      dc: 'ok'   },
        ].map(m => (
          <div key={m.lbl} style={s.metric}>
            <div style={s.mlbl}>{m.lbl}</div>
            <div style={s.mval}>{m.val}<span style={{ fontSize: 15, color: TEXT2 }}> {m.unit}</span></div>
            {m.sub && <div style={s.munit}>{m.sub}</div>}
            <div style={{ ...s.mdelta, ...(m.dc === 'good' ? s.dGood : s.dOk) }}>{m.delta}</div>
          </div>
        ))}
      </div>

      {/* DEEP SLEEP TREND */}
      <div style={s.secRow}><div style={s.sec}>Deep Sleep Trend <span style={s.secSub}>Target 15%+</span></div></div>
      <div style={s.card}>
        <div style={s.chartWrap}>
          <div style={s.barVals}>
            {sleep.map((d, i) => (
              <div key={d.date} style={{ ...s.barValCell, color: i === sleep.length - 1 ? GREEN : TEXT2 }}>
                {d.deep_pct}%
              </div>
            ))}
          </div>
          <div style={s.barsZone}>
            {sleep.map((d, i) => {
              const h   = Math.max(4, Math.round((d.deep_pct / maxDs) * 72))
              const bg  = d.deep_pct <= 4 ? '#ff5555' : d.deep_pct <= 8 ? '#ffb400' : GREEN
              const last = i === sleep.length - 1
              return (
                <div key={d.date} style={s.bwrap}>
                  <div style={{ width: '100%', height: h, background: bg, borderRadius: '4px 4px 0 0', boxShadow: last ? '0 0 8px rgba(197,241,53,.4)' : 'none' }} />
                </div>
              )
            })}
          </div>
          <div style={s.barLabels}>
            {sleep.map(d => <div key={d.date} style={s.barLblCell}>{parseInt(d.date.slice(8))}M</div>)}
          </div>
        </div>
      </div>

      {/* NUTRITION TREND */}
      <div style={{ ...s.secRow, paddingBottom: 8 }}>
        <div style={s.sec}>Nutrition Trend <span style={s.secSub}>Target: {isKcal ? '1,950 kcal' : '170g protein'}</span></div>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '0 16px', marginBottom: 8 }}>
        {['kcal', 'prot'].map(t => (
          <button key={t} onClick={() => setMacroTab(t)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            background: macroTab === t ? GREEN : CARD,
            border: `1px solid ${macroTab === t ? GREEN : BORDER}`,
            color: macroTab === t ? '#000' : TEXT2,
          }}>
            {t === 'kcal' ? 'Calories' : 'Protein'}
          </button>
        ))}
      </div>
      <div style={s.card}>
        <div style={s.chartWrap}>
          <div style={s.barVals}>
            {macros.map((d, i) => {
              const val  = isKcal ? d.kcal : d.protein_g
              const last = i === macros.length - 1
              // Full numbers, no K abbreviation
              const lbl  = val === 0 ? '—' : isKcal ? val : val + 'g'
              return (
                <div key={d.date} style={{ ...s.barValCell, color: val === 0 ? TEXT3 : last ? GREEN : TEXT2, fontSize: 8 }}>
                  {lbl}
                </div>
              )
            })}
          </div>
          <div style={s.barsZone}>
            {macros.map((d, i) => {
              const val  = isKcal ? d.kcal : d.protein_g
              const h    = val > 0 ? Math.max(4, Math.round((val / maxVal) * 72)) : 4
              const pct  = val > 0 ? Math.round((val / goal) * 100) : 0
              const bg   = val === 0 ? '#2e3240' : pct >= 95 ? GREEN : pct >= 80 ? '#ffb400' : '#ff5555'
              const last = i === macros.length - 1
              return (
                <div key={d.date} style={s.bwrap}>
                  <div style={{ width: '100%', height: h, background: bg, borderRadius: '4px 4px 0 0', boxShadow: last && val > 0 ? '0 0 8px rgba(197,241,53,.4)' : 'none' }} />
                </div>
              )
            })}
          </div>
          <div style={s.barLabels}>
            {macros.map(d => <div key={d.date} style={s.barLblCell}>{parseInt(d.date.slice(8))}M</div>)}
          </div>
        </div>
      </div>

      {/* TODAY'S PROTOCOL */}
      <div style={s.secRow}>
        <div style={s.sec}>Today's Protocol <span style={s.secSub}>{doneProt}/{totalProt} done</span></div>
      </div>
      <div style={{ ...s.card, cursor: 'pointer' }} onClick={() => setPage('protocol')}>
        <div style={s.linkRow}>
          <div>
            <div style={s.linkTitle}>Check your daily peptides &amp; supplements</div>
            <div style={{ fontSize: 13, color: TEXT2, marginTop: 3 }}>{doneProt} of {totalProt} items marked done today</div>
          </div>
          <div style={{ fontSize: 20, color: TEXT3 }}>›</div>
        </div>
      </div>

      <div style={{ height: 28 }} />
    </div>
  )
}

const s = {
  hero:        { position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg,#0d1200 0%,#000 55%)', flexShrink: 0 },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 10%,#000 100%)' },
  heroGlow:    { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 30%,rgba(197,241,53,.08) 0%,transparent 65%)' },
  heroContent: { position: 'relative', padding: '18px 18px 16px' },
  eyebrow:     { fontSize: 12, fontWeight: 600, color: GREEN, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 3 },
  heroTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, letterSpacing: 1, lineHeight: 1, color: '#fff' },
  heroSub:     { fontSize: 14, color: TEXT2, marginTop: 5 },
  alert:       { margin: '12px 16px 0', background: 'rgba(197,241,53,.05)', border: '1px solid rgba(197,241,53,.2)', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' },
  alertDot:    { width: 8, height: 8, borderRadius: '50%', background: GREEN, flexShrink: 0, marginTop: 5 },
  alertText:   { fontSize: 14, lineHeight: 1.5, color: '#fff' },
  secRow:      { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '14px 16px 9px' },
  sec:         { fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: '2px', color: '#fff', textTransform: 'uppercase' },
  secSub:      { fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: TEXT3, textTransform: 'none', letterSpacing: 0, fontWeight: 400, marginLeft: 8 },
  metricsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px' },
  metric:      { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 13px 12px' },
  mlbl:        { fontSize: 11, fontWeight: 600, color: TEXT2, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 5 },
  mval:        { fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: '.5px', color: GREEN, lineHeight: 1 },
  munit:       { fontSize: 13, color: TEXT2, marginTop: 3 },
  mdelta:      { display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600, marginTop: 6, padding: '2px 9px', borderRadius: 20 },
  dGood:       { background: 'rgba(197,241,53,.1)', color: GREEN },
  dOk:         { background: 'rgba(255,255,255,.07)', color: TEXT2 },
  card:        { background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden', margin: '0 16px' },
  chartWrap:   { padding: '16px 14px 14px' },
  barVals:     { display: 'flex', gap: 5, marginBottom: 6 },
  barValCell:  { flex: 1, textAlign: 'center', fontSize: 9, whiteSpace: 'nowrap', overflow: 'hidden' },
  barsZone:    { display: 'flex', alignItems: 'flex-end', gap: 5, height: 72 },
  bwrap:       { flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%' },
  barLabels:   { display: 'flex', gap: 5, marginTop: 6 },
  barLblCell:  { flex: 1, textAlign: 'center', fontSize: 9, color: TEXT3 },
  linkRow:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' },
  linkTitle:   { fontSize: 15, fontWeight: 500, color: '#fff' },
}
