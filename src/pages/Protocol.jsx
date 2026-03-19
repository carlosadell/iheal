const s = {
  page: { maxWidth:1020, margin:'0 auto', padding:'22px 24px 40px', width:'100%' },
  tc: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  sl: { fontSize:10, fontWeight:500, letterSpacing:'0.9px', textTransform:'uppercase', color:'#3d5068', margin:'20px 0 8px' },
  pi: { padding:'11px 13px', background:'#161f30', borderRadius:10, border:'1px solid rgba(255,255,255,0.07)', marginBottom:7 },
  piH: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 },
  piN: { fontSize:13, fontWeight:500 },
  piD: { fontSize:11, color:'#6b7f96', lineHeight:1.55 },
  card: { background:'#1a2438', borderRadius:13, border:'1px solid rgba(255,255,255,0.07)', padding:'11px 13px' },
  pci: { display:'flex', alignItems:'center', gap:9, padding:'8px 11px', borderRadius:9, border:'1px solid rgba(255,255,255,0.07)', cursor:'pointer', marginBottom:5, background:'#161f30' },
  pciDone: { background:'rgba(0,212,184,0.06)', borderColor:'rgba(0,212,184,0.18)' },
  lr: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  btnP: { width:'100%', padding:11, background:'#00d4b8', color:'#080d16', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginTop:8 },
}

const badge = (status) => {
  const styles = {
    active: { background:'rgba(0,212,184,0.09)', color:'#00d4b8', border:'1px solid rgba(0,212,184,0.15)' },
    pending: { background:'rgba(255,179,71,0.09)', color:'#ffb347' },
    paused: { background:'rgba(255,255,255,0.05)', color:'#6b7f96' },
  }
  return { fontSize:10, fontWeight:500, padding:'2px 7px', borderRadius:18, ...styles[status] }
}

export default function Protocol({ protocol, peptides, medications, supplements, toggleProto, goCoach }) {
  const done = protocol.filter(p => p.done).length
  const total = protocol.length
  const pct = Math.round((done/total)*100)

  return (
    <div style={s.page}>
      <div style={s.tc}>
        <div>
          <div style={{...s.sl, marginTop:0}}>Peptide stack</div>
          {peptides.map(p => (
            <div key={p.name} style={s.pi}>
              <div style={s.piH}>
                <span style={s.piN}>{p.name}</span>
                <span style={badge(p.status)}>{p.status}</span>
              </div>
              <div style={s.piD}><strong style={{color:'#d8e8f5'}}>{p.dose}</strong> · {p.timing}<br/>{p.detail}</div>
            </div>
          ))}

          <div style={s.sl}>Medications</div>
          {medications.map(m => (
            <div key={m.name} style={s.pi}>
              <div style={s.piH}>
                <span style={s.piN}>{m.name}</span>
                <span style={badge(m.status)}>{m.status}</span>
              </div>
              <div style={s.piD}><strong style={{color:'#d8e8f5'}}>{m.dose}</strong> · {m.timing}<br/>{m.detail}</div>
            </div>
          ))}

          <button style={s.btnP} onClick={() => goCoach('I want to add a new supplement, medication or peptide to my protocol')}>+ Add to protocol ↗</button>
        </div>

        <div>
          <div style={{...s.sl, marginTop:0}}>Today's checklist — {done}/{total}</div>
          <div style={s.card}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
              <span style={{fontSize:11,color:'#6b7f96'}}>{done===total?'All done today ✓':'Tap to mark as taken'}</span>
              <span style={{fontSize:11,color:'#00d4b8',fontWeight:600}}>{pct}%</span>
            </div>
            <div style={{height:3,background:'#161f30',borderRadius:2,overflow:'hidden',marginBottom:9}}>
              <div style={{height:'100%',width:`${pct}%`,background:'#00d4b8',borderRadius:2,transition:'width 0.3s'}}></div>
            </div>
            {protocol.map(p => (
              <div key={p.key} onClick={() => toggleProto(p.key)}
                style={{...s.pci, ...(p.done?s.pciDone:{})}}>
                <div style={{width:18,height:18,borderRadius:'50%',border:`1.5px solid ${p.done?'#00d4b8':'rgba(255,255,255,0.13)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:p.done?'#00d4b8':'transparent'}}>
                  {p.done && <span style={{color:'#080d16',fontSize:9,fontWeight:800}}>✓</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:500,color:p.done?'#6b7f96':'#d8e8f5'}}>{p.name}</div>
                  <div style={{fontSize:10,color:'#3d5068'}}>{p.time}</div>
                </div>
                <span style={{fontSize:9,padding:'2px 6px',borderRadius:7,
                  background:p.category==='Peptide'?'rgba(255,179,71,0.09)':p.category==='Medication'?'rgba(77,159,255,0.09)':'rgba(0,212,184,0.09)',
                  color:p.category==='Peptide'?'#ffb347':p.category==='Medication'?'#4d9fff':'#00d4b8'}}>
                  {p.category}
                </span>
              </div>
            ))}
          </div>

          <div style={s.sl}>Supplements</div>
          <div style={s.card}>
            {supplements.map((s2, i) => (
              <div key={s2.name} style={{...s.lr, borderBottom: i===supplements.length-1?'none':undefined}}>
                <span style={{fontSize:12}}>{s2.name}</span>
                <div style={{display:'flex',gap:8}}>
                  <span style={{fontSize:11,color:'#6b7f96'}}>{s2.dose}</span>
                  <span style={{fontSize:10,color:'#3d5068'}}>{s2.timing}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
