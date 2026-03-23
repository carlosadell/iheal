const G='#c5f135', BG='#000', CARD='#1e2128', CARD3='#2e3240', BORDER='#2a2e38'
const T='#fff', T2='#b0b4c0', T3='#6a6e7a', FD="'Bebas Neue',sans-serif"

const sec = (label, sub) => (
  <div style={{fontFamily:FD,fontSize:14,letterSpacing:2,color:T,padding:'13px 16px 8px',textTransform:'uppercase',display:'flex',alignItems:'baseline',justifyContent:'space-between'}}>
    {label}
    {sub && <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:T3,textTransform:'none',letterSpacing:0,fontWeight:400}}>{sub}</span>}
  </div>
)

const card = {background:CARD,borderRadius:14,border:`1px solid ${BORDER}`,overflow:'hidden',margin:'0 16px'}

function MetricCard({label,value,unit,sub,delta,deltaType}) {
  const deltaColors = {good:{bg:'rgba(76,175,80,.12)',color:'#66bb6a'}, great:{bg:'rgba(197,241,53,.1)',color:G}, ok:{bg:'rgba(255,255,255,.07)',color:T2}, warn:{bg:'rgba(255,180,0,.1)',color:'#ffb400'}}
  const dc = deltaColors[deltaType]||deltaColors.ok
  return (
    <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:14,padding:'13px 12px 11px'}}>
      <div style={{fontSize:10,fontWeight:600,color:T2,textTransform:'uppercase',letterSpacing:1.5,marginBottom:4}}>{label}</div>
      <div style={{fontFamily:FD,fontSize:33,letterSpacing:.5,color:G,lineHeight:1}}>
        {value}{unit&&<span style={{fontSize:15,color:T2}}> {unit}</span>}
      </div>
      {sub && <div style={{fontSize:12,color:T2,marginTop:2}}>{sub}</div>}
      {delta && <div style={{display:'inline-flex',alignItems:'center',fontSize:10,fontWeight:600,marginTop:5,padding:'2px 8px',borderRadius:20,background:dc.bg,color:dc.color}}>{delta}</div>}
    </div>
  )
}

function BarChart({data, maxVal, colorFn, labelFn, subLabelKey, highlightLast}) {
  const max = maxVal || Math.max(...data.map(d=>d.v||0), 1)
  return (
    <div style={{padding:'14px 16px 14px'}}>
      <div style={{display:'flex',gap:5,marginBottom:5}}>
        {data.map((d,i) => {
          const last = highlightLast && i===data.length-1
          return <div key={i} style={{flex:1,textAlign:'center',fontSize:9,color:last?G:T2,whiteSpace:'nowrap',overflow:'hidden'}}>{labelFn(d,i)}</div>
        })}
      </div>
      <div style={{display:'flex',alignItems:'flex-end',gap:5,height:72}}>
        {data.map((d,i) => {
          const h = d.v>0 ? Math.max(4,Math.round((d.v/max)*72)) : 4
          const last = highlightLast && i===data.length-1
          const color = colorFn(d,i)
          return (
            <div key={i} style={{flex:1,height:'100%',display:'flex',alignItems:'flex-end'}}>
              <div style={{width:'100%',height:h,borderRadius:'4px 4px 0 0',background:color,boxShadow:last?`0 0 8px ${color}66`:undefined,transition:'height .3s'}}/>
            </div>
          )
        })}
      </div>
      <div style={{display:'flex',gap:5,marginTop:5}}>
        {data.map((d,i) => <div key={i} style={{flex:1,textAlign:'center',fontSize:8,color:T3}}>{d[subLabelKey]}</div>)}
      </div>
    </div>
  )
}

export default function Home({sleepLogs, protocol, supplements, togProto, togSupp, setPage, profile, time, todayStr, dayNum}) {
  const last = sleepLogs[sleepLogs.length-1] || {}
  const doneProt = protocol.filter(p=>p.done).length + supplements.filter(s=>s.done).length
  const totalProt = protocol.length + supplements.length

  const sleepChart = sleepLogs.map(s => ({v:s.deep_pct, d:parseInt(s.date.slice(8))+'M'}))

  const trazStart = new Date('2026-03-17')
  const today = new Date()
  const trazNight = Math.floor((today - trazStart) / (1000*60*60*24)) + 1
  const trazWeek = trazNight <= 7 ? 1 : trazNight <= 14 ? 2 : 3
  const nextDose = trazWeek === 1 ? '100mg' : trazWeek === 2 ? '150mg' : null
  const nextDoseDate = trazWeek === 1 ? 'March 24' : trazWeek === 2 ? 'March 31' : null

  const scoreLabel = last.score >= 80 ? 'GOOD' : last.score >= 70 ? 'OK' : 'LOW'
  const scoreType  = last.score >= 80 ? 'great' : last.score >= 70 ? 'ok' : 'warn'

  return (
    <div>
      {/* HERO */}
      <div style={{position:'relative',overflow:'hidden',background:'linear-gradient(160deg,#0d1200 0%,#000 55%)'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 10%,#000 100%)'}}/>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 70% 30%,rgba(197,241,53,.08) 0%,transparent 65%)'}}/>
        <div style={{position:'relative',padding:'16px 18px 14px'}}>
          <div style={{fontSize:11,fontWeight:600,color:G,letterSpacing:2.5,textTransform:'uppercase',marginBottom:3}}>Day {dayNum} · Retatrutide Protocol</div>
          <div style={{fontFamily:FD,fontSize:40,letterSpacing:1,lineHeight:1}}>CARLOS</div>
          <div style={{fontSize:13,color:T2,marginTop:4}}>{todayStr} · <span style={{color:G}}>{time}</span></div>
        </div>
      </div>

      {/* ALERT */}
      <div style={{margin:'10px 16px 0',background:'rgba(197,241,53,.05)',border:'1px solid rgba(197,241,53,.2)',borderRadius:14,padding:'11px 14px',display:'flex',gap:10,alignItems:'flex-start'}}>
        <div style={{width:7,height:7,borderRadius:'50%',background:G,flexShrink:0,marginTop:5}}/>
        <div style={{fontSize:13,lineHeight:1.5}}>
          <span style={{color:G,fontWeight:600}}>Night {trazNight} on Trazodone — score {last.score ?? ''}.</span>
          {' '}Deep sleep {last.deep_min ?? ''}min / {last.deep_pct ?? ''}%.
          {nextDose && ` Week ${trazWeek + 1} dose (${nextDose}) starts ${nextDoseDate}.`}
          {' '}Monitor avg sleep HR vs baseline 58–62 bpm.
        </div>
      </div>

      {/* LAST NIGHT */}
      {sec('Last Night')}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,padding:'0 16px'}}>
        <MetricCard label="Deep Sleep" value={last.deep_min} unit="m" sub={`${last.deep_pct}% of total`} delta={`Night ${trazNight}`} deltaType="ok"/>
        <MetricCard label="Sleep Score" value={last.score} sub={`Trazodone wk${trazWeek}`} delta={scoreLabel} deltaType={scoreType}/>
        <MetricCard label="HRV Avg" value={last.hrv_ms} unit="ms" sub={`Max ${last.hrv_max_ms || ''}ms`} delta="stable" deltaType="ok"/>
        <MetricCard label="Resting HR" value={last.resting_hr} unit="bpm" sub="Baseline 58–62 bpm" delta="watch trend" deltaType="warn"/>
      </div>

      {/* DEEP SLEEP TREND */}
      {sec('Deep Sleep Trend', 'Target 15%+')}
      <div style={card}>
        <BarChart
          data={sleepChart}
          colorFn={(d)=>d.v<=4?'#ff5555':d.v<=8?'#ffb400':G}
          labelFn={(d)=>`${d.v}%`}
          subLabelKey="d"
          highlightLast
        />
      </div>

      {/* TODAY'S PROTOCOL */}
      {sec("Today's Protocol", `${doneProt}/${totalProt} done`)}
      <div style={{...card,cursor:'pointer'}} onClick={()=>setPage('protocol')}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px'}}>
          <div>
            <div style={{fontSize:14,fontWeight:500,color:T}}>Check your daily peptides &amp; supplements</div>
            <div style={{fontSize:11,color:T2,marginTop:2}}>{doneProt} of {totalProt} items marked done today</div>
          </div>
          <div style={{fontSize:20,color:T3}}>›</div>
        </div>
      </div>

      <div style={{height:24}}/>
    </div>
  )
}
