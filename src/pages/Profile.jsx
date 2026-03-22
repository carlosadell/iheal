const G='#c5f135', CARD='#1e2128', CARD3='#2e3240', BORDER='#2a2e38'
const T='#fff', T2='#b0b4c0', T3='#6a6e7a', FD="'Bebas Neue',sans-serif"
const card = {background:CARD,borderRadius:14,border:`1px solid ${BORDER}`,overflow:'hidden',margin:'0 16px'}

function sec(label,sub) {
  return <div style={{fontFamily:FD,fontSize:14,letterSpacing:2,color:T,padding:'13px 16px 8px',textTransform:'uppercase',display:'flex',alignItems:'baseline',justifyContent:'space-between'}}>
    {label}{sub&&<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:T3,textTransform:'none',letterSpacing:0,fontWeight:400}}>{sub}</span>}
  </div>
}

function MetricCard({label,value,unit,sub,delta,deltaType}) {
  const colors = {pos:{bg:'rgba(76,175,80,.12)',c:'#66bb6a'}, ok:{bg:'rgba(255,255,255,.07)',c:T2}, warn:{bg:'rgba(255,180,0,.1)',c:'#ffb400'}}
  const dc = colors[deltaType]||colors.ok
  return (
    <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:14,padding:'13px 12px 11px'}}>
      <div style={{fontSize:10,fontWeight:600,color:T2,textTransform:'uppercase',letterSpacing:1.5,marginBottom:4}}>{label}</div>
      <div style={{fontFamily:FD,fontSize:33,letterSpacing:.5,color:G,lineHeight:1}}>
        {value}{unit&&<span style={{fontSize:14,color:T2}}> {unit}</span>}
      </div>
      {sub&&<div style={{fontSize:12,color:T2,marginTop:2}}>{sub}</div>}
      {delta&&<div style={{display:'inline-flex',fontSize:10,fontWeight:600,marginTop:5,padding:'2px 8px',borderRadius:20,background:dc.bg,color:dc.c}}>{delta}</div>}
    </div>
  )
}

export default function Profile({bodyComp, labResults, nextLabs, profile, setPage}) {
  const latest     = bodyComp[bodyComp.length-1] || {}
  const latestDate = latest?.date?.slice(0,10)

  return (
    <div>
      {/* Header */}
      <div style={{padding:'16px',display:'flex',alignItems:'center',gap:14,background:'linear-gradient(160deg,#0d1200 0%,#000 70%)',borderBottom:`1px solid ${BORDER}`,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 15% 50%,rgba(197,241,53,.07) 0%,transparent 60%)'}}/>
        <div style={{width:54,height:54,borderRadius:14,background:G,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:FD,fontSize:25,color:'#000',position:'relative',flexShrink:0}}>CA</div>
        <div style={{position:'relative'}}>
          <div style={{fontFamily:FD,fontSize:27,letterSpacing:1}}>{profile?.full_name?.split(' ').slice(0,2).join(' ').toUpperCase()}</div>
          <div style={{fontSize:12,color:T2,marginTop:1}}>{profile?.location} · {profile?.age}y</div>
          <div style={{display:'inline-block',background:G,color:'#000',fontSize:10,fontWeight:700,padding:'2px 9px',borderRadius:20,marginTop:5,letterSpacing:.5}}>PRO</div>
        </div>
      </div>

      {/* Body Composition */}
      {sec('Body Composition', latestDate)}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,padding:'0 16px'}}>
        <MetricCard label="Weight"       value={latest?.weight_kg}      unit="kg" delta="↓ trending"      deltaType="pos"/>
        <MetricCard label="Body Fat"     value={latest?.body_fat_pct}   unit="%"  sub={`Goal: sub-${profile?.target_body_fat_pct}%`} delta="↓ trending" deltaType="pos"/>
        <MetricCard label="Muscle Mass"  value={latest?.muscle_mass_kg} unit="kg" delta="stable"           deltaType="ok"/>
        <MetricCard label="Visceral Fat" value={latest?.visceral_fat}   sub="Target: <5" delta="↓ improving" deltaType="warn"/>
      </div>

      {/* Lab Results */}
      {sec('Lab Results')}
      <div style={card}>
        {(labResults||[]).map(l=>(
          <div key={l.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 16px',borderBottom:`1px solid ${BORDER}`}}>
            <span style={{fontSize:13,color:T}}>{l.name}</span>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:10,color:T3}}>{l.range}</span>
              <span style={{fontSize:13,fontWeight:600,color:l.status==='ok'?G:l.status==='warn'?'#ffb400':T3}}>
                {l.value}{l.unit&&l.value!=='Pending'&&<span style={{fontSize:9,fontWeight:400,color:T3}}> {l.unit}</span>}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Next Labs */}
      {sec('Recommended Next Labs')}
      <div style={card}>
        {(nextLabs||[]).map((l,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:11,padding:'11px 16px',borderBottom:`1px solid ${BORDER}`}}>
            <div style={{width:32,height:32,borderRadius:8,background:CARD3,border:`1px solid ${BORDER}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>🧪</div>
            <span style={{fontSize:13,color:T2,lineHeight:1.4}}>{l}</span>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div style={{padding:'13px 16px 8px',fontFamily:FD,fontSize:14,letterSpacing:2,color:T,textTransform:'uppercase'}}>Account</div>
      <div style={{...card,cursor:'pointer'}} onClick={()=>setPage('settings')}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:11}}>
            <div style={{width:32,height:32,borderRadius:8,background:CARD3,border:`1px solid ${BORDER}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>⚙️</div>
            <span style={{fontSize:14,fontWeight:500,color:T}}>Settings &amp; Goals</span>
          </div>
          <div style={{fontSize:20,color:T3}}>›</div>
        </div>
      </div>

      <div style={{height:24}}/>
    </div>
  )
}
