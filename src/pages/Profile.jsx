const s = {
  page: { maxWidth:1020, margin:'0 auto', padding:'22px 24px 40px', width:'100%' },
  tc: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  sl: { fontSize:10, fontWeight:500, letterSpacing:'0.9px', textTransform:'uppercase', color:'#3d5068', margin:'20px 0 8px' },
  card: { background:'#1a2438', borderRadius:13, border:'1px solid rgba(255,255,255,0.07)', padding:'15px 17px' },
  mc: { background:'#161f30', borderRadius:11, border:'1px solid rgba(255,255,255,0.07)', padding:'12px 14px' },
  lr: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  btnP: { width:'100%', padding:11, background:'#00d4b8', color:'#080d16', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginTop:8 },
}

const statusStyle = (st) => {
  if (st==='high') return { background:'rgba(255,92,106,0.09)', color:'#ff5c6a' }
  if (st==='normal') return { background:'rgba(0,212,184,0.09)', color:'#00d4b8' }
  if (st==='elevated') return { background:'rgba(255,179,71,0.09)', color:'#ffb347' }
  return { background:'rgba(255,255,255,0.04)', color:'#6b7f96' }
}

export default function Profile({ bodyComp, labResults, pendingTests, sleepLog, goCoach }) {
  const latest = bodyComp[bodyComp.length-1]
  const hrv = sleepLog.map(s => ({ d: s.date.slice(5), v: s.hrv_ms }))

  return (
    <div style={s.page}>
      <div style={s.tc}>
        <div>
          <div style={{...s.sl, marginTop:0}}>Body composition — {latest?.date}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:9}}>
            {[
              {l:'Weight',v:latest?.weight_kg,u:' kg',c:'#00d4b8'},
              {l:'Body Fat',v:latest?.body_fat_pct,u:' %',c:'#4d9fff'},
              {l:'Muscle',v:latest?.muscle_mass_kg,u:' kg',c:'#00d4b8'},
              {l:'Visceral Fat',v:latest?.visceral_fat,u:' /12',c:'#ffb347'},
            ].map(m => (
              <div key={m.l} style={s.mc}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <span style={{fontSize:10,color:'#6b7f96'}}>{m.l}</span>
                  <span style={{width:5,height:5,borderRadius:'50%',background:m.c}}></span>
                </div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:600,letterSpacing:'-0.7px',lineHeight:1}}>
                  {m.v}<span style={{fontSize:11,color:'#6b7f96',fontWeight:400}}>{m.u}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={s.sl}>HRV trend (nightly ms)</div>
          <div style={{...s.card, padding:'12px 14px'}}>
            {hrv.map((r,i) => (
              <div key={r.d} style={{display:'flex',alignItems:'center',gap:7,marginBottom:i===hrv.length-1?0:4}}>
                <span style={{fontSize:10,color:'#3d5068',width:42,flexShrink:0}}>{r.d}</span>
                <div style={{flex:1,height:4,background:'#161f30',borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${Math.round((r.v/50)*100)}%`,background:'#4d9fff',borderRadius:2}}></div>
                </div>
                <span style={{fontSize:10,fontWeight:500,width:22,textAlign:'right',color:'#4d9fff'}}>{r.v}</span>
              </div>
            ))}
            <div style={{fontSize:9,color:'#3d5068',marginTop:7}}>Healthy 40-80 ms · current avg 24 ms</div>
          </div>
        </div>

        <div>
          <div style={{...s.sl, marginTop:0}}>Lab results — Jul 2025</div>
          <div style={{...s.card, padding:'10px 13px'}}>
            {labResults.map((l,i) => (
              <div key={l.name} style={{...s.lr, borderBottom: i===labResults.length-1?'none':undefined}}>
                <span style={{fontSize:12}}>{l.name}</span>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:12,fontWeight:500}}>{l.value}</span>
                  <span style={{fontSize:9,padding:'2px 6px',borderRadius:6,fontWeight:500,...statusStyle(l.status)}}>{l.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={s.sl}>Pending tests</div>
          <div style={{...s.card, padding:'10px 13px'}}>
            {pendingTests.map((t,i) => (
              <div key={t} style={{...s.lr, borderBottom: i===pendingTests.length-1?'none':undefined}}>
                <span style={{fontSize:12}}>{t}</span>
                <span style={{fontSize:9,padding:'2px 6px',borderRadius:6,fontWeight:500,background:'rgba(255,255,255,0.04)',color:'#6b7f96'}}>pending</span>
              </div>
            ))}
          </div>

          <button style={s.btnP} onClick={() => goCoach('I want to upload new lab results and add them to my health profile')}>
            Upload lab results ↗
          </button>
        </div>
      </div>
    </div>
  )
}
