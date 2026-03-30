const GREEN  = '#c5f135'
const CARD   = '#1e2128'
const BORDER = '#2a2e38'
const TEXT2  = '#c8ccd8'
const TEXT3  = '#888a96'

export default function Protocol({ protocolItems }) {
  const peptides = protocolItems.filter(p => p.category === 'peptide')
  const meds     = protocolItems.filter(p => p.category === 'medication')
  const supps    = protocolItems.filter(p => p.category === 'supplement')

  return (
    <div>
      <div style={s.hero}>
        <div style={s.heroOverlay} /><div style={s.heroGlow} />
        <div style={s.heroContent}>
          <div style={s.eyebrow}>Active stack</div>
          <div style={s.heroTitle}>PROTOCOL</div>
          <div style={{fontSize:12, color:TEXT3, marginTop:4}}>Updated by AI Coach · tap Coach to make changes</div>
        </div>
      </div>

      {peptides.length > 0 && (
        <>
          <div style={s.sec}>Peptides</div>
          <div style={s.card}>
            {peptides.map(p => (
              <div key={p.key} style={s.row}>
                <div style={s.rowL}>
                  <div style={s.ricon}>{p.icon || '💉'}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={s.rtitle}>{p.name}</div>
                    <div style={s.rsub}>{p.dosage}</div>
                  </div>
                </div>
                {p.timing && <div style={s.timing}>{p.timing}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {meds.length > 0 && (
        <>
          <div style={s.sec}>Medications</div>
          <div style={s.card}>
            {meds.map(p => (
              <div key={p.key} style={s.row}>
                <div style={s.rowL}>
                  <div style={s.ricon}>{p.icon || '💊'}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={s.rtitle}>{p.name}</div>
                    <div style={s.rsub}>{p.dosage}</div>
                    {p.instructions && <div style={s.instr}>{p.instructions}</div>}
                  </div>
                </div>
                {p.timing && <div style={s.timing}>{p.timing}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {supps.length > 0 && (
        <>
          <div style={s.sec}>Supplements</div>
          <div style={s.card}>
            {supps.map(p => (
              <div key={p.key} style={s.row}>
                <div style={s.rowL}>
                  <div style={s.ricon}>{p.icon || '💊'}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={s.rtitle}>{p.name}</div>
                    <div style={s.rsub}>{p.dosage}</div>
                  </div>
                </div>
                {p.timing && <div style={s.timing}>{p.timing}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {protocolItems.length === 0 && (
        <div style={{padding:'40px 16px',textAlign:'center'}}>
          <div style={{fontSize:15,color:TEXT3,marginBottom:8}}>No protocol items yet</div>
          <div style={{fontSize:13,color:TEXT3}}>Tell the AI Coach what you're taking and it will build your protocol here.</div>
        </div>
      )}

      <div style={{height:28}}/>
    </div>
  )
}

const s = {
  hero:        { position:'relative', overflow:'hidden', background:'linear-gradient(160deg,#0d1200 0%,#000 55%)' },
  heroOverlay: { position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 10%,#000 100%)' },
  heroGlow:    { position:'absolute', inset:0, background:'radial-gradient(ellipse at 70% 30%,rgba(197,241,53,.08) 0%,transparent 65%)' },
  heroContent: { position:'relative', padding:'16px 18px 14px' },
  eyebrow:     { fontSize:12, fontWeight:600, color:GREEN, letterSpacing:'2.5px', textTransform:'uppercase', marginBottom:3 },
  heroTitle:   { fontFamily:"'Bebas Neue', sans-serif", fontSize:42, letterSpacing:1, lineHeight:1, color:'#fff' },
  sec:         { fontFamily:"'Bebas Neue', sans-serif", fontSize:15, letterSpacing:'2px', color:'#fff', padding:'14px 16px 9px', textTransform:'uppercase' },
  card:        { background:CARD, borderRadius:14, border:`1px solid ${BORDER}`, overflow:'hidden', margin:'0 16px' },
  row:         { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:`1px solid ${BORDER}` },
  rowL:        { display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 },
  ricon:       { width:38, height:38, borderRadius:10, background:'#2e3240', border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 },
  rtitle:      { fontSize:15, fontWeight:500, color:'#fff', lineHeight:1.2 },
  rsub:        { fontSize:13, color:TEXT2, marginTop:3 },
  instr:       { fontSize:12, color:GREEN, marginTop:4, fontStyle:'italic' },
  timing:      { fontSize:12, fontWeight:600, color:GREEN, background:'rgba(197,241,53,.1)', padding:'4px 10px', borderRadius:20, flexShrink:0 },
}
