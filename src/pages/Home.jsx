const moodOpts = [
  {v:'great',i:'😄',l:'Great'},
  {v:'good',i:'🙂',l:'Good'},
  {v:'ok',i:'😐',l:'OK'},
  {v:'tired',i:'😴',l:'Tired'},
  {v:'stressed',i:'😤',l:'Stressed'},
  {v:'unwell',i:'🤒',l:'Unwell'},
]

const s = {
  page: { maxWidth:1020, margin:'0 auto', padding:'22px 24px 40px', width:'100%' },
  alert: { padding:'11px 15px', borderRadius:10, fontSize:12, marginBottom:13, borderLeft:'3px solid #00d4b8', background:'rgba(0,212,184,0.09)', color:'#00d4b8', lineHeight:1.65 },
  mg: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:9, marginBottom:9 },
  mc: { background:'#161f30', borderRadius:11, border:'1px solid rgba(255,255,255,0.07)', padding:'12px 14px' },
  mcTop: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  mcL: { fontSize:10, color:'#6b7f96' },
  mv: { fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:600, letterSpacing:'-0.7px', lineHeight:1 },
  mu: { fontSize:11, color:'#6b7f96', fontWeight:400 },
  t31: { display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:12 },
  sl: { fontSize:10, fontWeight:500, letterSpacing:'0.9px', textTransform:'uppercase', color:'#3d5068', margin:'20px 0 8px' },
  card: { background:'#1a2438', borderRadius:13, border:'1px solid rgba(255,255,255,0.07)', padding:'15px 17px' },
  nr: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  dr: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  moodRow: { display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  mb: { padding:'5px 7px', borderRadius:7, border:'1px solid rgba(255,255,255,0.07)', background:'#161f30', cursor:'pointer', fontSize:11, color:'#6b7f96', display:'flex', alignItems:'center', gap:3 },
  mbSel: { borderColor:'#00d4b8', background:'rgba(0,212,184,0.09)', color:'#00d4b8' },
  mbCur: { borderColor:'rgba(0,212,184,0.22)' },
  btnS: { padding:'7px 13px', background:'transparent', color:'#00d4b8', border:'1px solid rgba(0,212,184,0.25)', borderRadius:7, fontSize:12, cursor:'pointer', fontFamily:'inherit', marginTop:9, width:'100%' },
}

export default function Home({ protocol, moods, goals, sleepLog, bodyComp, toggleProto, setMood, goCoach, currentPeriod }) {
  const cp = currentPeriod()
  const done = protocol.filter(p => p.done).length
  const total = protocol.length
  const pct = Math.round((done/total)*100)
  const latest = bodyComp[bodyComp.length-1]
  const latestSleep = sleepLog[sleepLog.length-1]

  return (
    <div style={s.page}>
      <div style={s.alert}>
        Night 3 on Trazodone: deep sleep recovered to 41 min, up from 9 min on night 2. Adaptation working as expected. Etifoxine on day 2 — anxiety relief building. Both medications should compound positively by day 5-7.
      </div>

      <div style={s.mg}>
        <div style={s.mc}>
          <div style={s.mcTop}><span style={s.mcL}>Weight</span><span style={{width:5,height:5,borderRadius:'50%',background:'#00d4b8',boxShadow:'0 0 5px #00d4b8'}}></span></div>
          <div style={s.mv}>{latest?.weight_kg}<span style={s.mu}> kg</span></div>
          <div style={{fontSize:10,marginTop:5,color:'#00d4b8'}}>↓ 0.5 kg this week</div>
        </div>
        <div style={s.mc}>
          <div style={s.mcTop}><span style={s.mcL}>Body Fat</span><span style={{width:5,height:5,borderRadius:'50%',background:'#4d9fff',boxShadow:'0 0 4px #4d9fff'}}></span></div>
          <div style={s.mv}>{latest?.body_fat_pct}<span style={s.mu}> %</span></div>
          <div style={{fontSize:10,marginTop:5,color:'#6b7f96'}}>Target &lt;20%</div>
        </div>
        <div style={s.mc}>
          <div style={s.mcTop}><span style={s.mcL}>Deep Sleep</span><span style={{width:5,height:5,borderRadius:'50%',background:'#00d4b8',boxShadow:'0 0 5px #00d4b8'}}></span></div>
          <div style={s.mv}>{latestSleep?.deep_min}<span style={s.mu}> min</span></div>
          <div style={{fontSize:10,marginTop:5,color:'#00d4b8'}}>↑ from 9 min</div>
        </div>
        <div style={s.mc}>
          <div style={s.mcTop}><span style={s.mcL}>HRV</span><span style={{width:5,height:5,borderRadius:'50%',background:'#ffb347'}}></span></div>
          <div style={s.mv}>{latestSleep?.hrv_ms}<span style={s.mu}> ms</span></div>
          <div style={{fontSize:10,marginTop:5,color:'#ff5c6a'}}>Target 40+ ms</div>
        </div>
      </div>

      <div style={s.t31}>
        <div>
          <div style={s.sl}>Deep sleep trend (% of total sleep)</div>
          <div style={s.card}>
            <div style={{display:'flex',alignItems:'flex-end',gap:4,height:70}}>
              {sleepLog.map(b => (
                <div key={b.date} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,height:'100%',justifyContent:'flex-end'}}>
                  <div style={{fontSize:8,color:'#00d4b8'}}>{b.deep_pct}</div>
                  <div style={{width:'100%',height:Math.max(Math.round((b.deep_pct/20)*60),3),background:'#00d4b8',opacity:b.deep_pct>=10?1:0.38,borderRadius:'3px 3px 0 0'}}></div>
                  <div style={{fontSize:8,color:'#3d5068'}}>{b.date.slice(5).replace('-','/')}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:9,color:'#3d5068',marginTop:8}}>Target 20%+ · Trazodone from 17 Mar</div>
          </div>

          <div style={{...s.sl, marginTop:20}}>Nutrition goals</div>
          <div style={s.card}>
            {[
              {l:'Calories',g:goals.calories,u:'kcal',c:'#d8e8f5'},
              {l:'Protein',g:goals.protein_g,u:'g',c:'#00d4b8'},
              {l:'Carbs',g:goals.carbs_g,u:'g',c:'#4d9fff'},
              {l:'Fat',g:goals.fat_g,u:'g',c:'#ffb347'},
            ].map((n,i) => (
              <div key={n.l} style={{...s.nr, borderBottom: i===3?'none':undefined}}>
                <span style={{fontSize:12,color:'#6b7f96'}}>{n.l}</span>
                <span style={{fontSize:12,fontWeight:500,color:n.c}}>— <span style={{fontSize:10,color:'#3d5068'}}>/ {n.g}{n.u}</span></span>
              </div>
            ))}
            <button style={s.btnS} onClick={() => goCoach('I want to log my nutrition for today')}>Log today's food ↗</button>
          </div>
        </div>

        <div>
          <div style={s.sl}>Upcoming doses</div>
          <div style={s.card}>
            {[
              {n:'Retatrutide 1mg',s:'Weekly · after food',wm:'Mon 23 Mar',ws:'in 4 days'},
              {n:'Trazodone → 100mg',s:'Dose increase week 2',wm:'Mon 24 Mar',ws:'in 5 days'},
              {n:'Epitalon 2mg',s:'Nightly · before bed',wm:'Tonight',ws:'~21:30'},
              {n:'Trazodone 50mg',s:'Nightly · 21:00',wm:'Tonight',ws:'21:00'},
            ].map((d,i) => (
              <div key={d.n} style={{...s.dr, borderBottom: i===3?'none':undefined}}>
                <div>
                  <div style={{fontSize:12,fontWeight:500}}>{d.n}</div>
                  <div style={{fontSize:10,color:'#6b7f96',marginTop:1}}>{d.s}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:11,fontWeight:500,color:'#00d4b8'}}>{d.wm}</div>
                  <div style={{fontSize:10,color:'#3d5068'}}>{d.ws}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{...s.sl, marginTop:20}}>How are you feeling today?</div>
          <div style={{...s.card, padding:'11px 14px'}}>
            {['morning','midday','evening'].map((period, pi) => (
              <div key={period} style={{...s.moodRow, borderBottom: pi===2?'none':undefined}}>
                <span style={{fontSize:11,color:period===cp?'#00d4b8':'#6b7f96',width:60,flexShrink:0,fontWeight:500}}>
                  {period===cp?'▸ ':''}{period.charAt(0).toUpperCase()+period.slice(1)}
                </span>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                  {moodOpts.map(m => (
                    <div key={m.v} onClick={() => setMood(period, m.v)}
                      style={{...s.mb, ...(moods[period]===m.v?s.mbSel:{}), ...(period===cp&&!moods[period]?s.mbCur:{})}}>
                      <span style={{fontSize:13}}>{m.i}</span>
                      <span style={{fontSize:10}}>{m.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .home-t31 { grid-template-columns: 1fr !important; }
          .home-mg { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}
