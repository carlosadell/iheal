const s = {
  page: { maxWidth:1020, margin:'0 auto', padding:'22px 24px 40px', width:'100%' },
  tc: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  sl: { fontSize:10, fontWeight:500, letterSpacing:'0.9px', textTransform:'uppercase', color:'#3d5068', margin:'20px 0 8px' },
  card: { background:'#1a2438', borderRadius:13, border:'1px solid rgba(255,255,255,0.07)', padding:'11px 14px' },
  sr: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' },
}

export default function Settings({ goals, setGoals, goCoach, profileData }) {
  const personal = [
    ['Full name', profileData?.full_name || 'Carlos Adell Carceller'],
    ['Date of birth', '22 August 1980'],
    ['Age', '45'],
    ['Sex', 'Male'],
    ['Location', 'Saint Petersburg, Russia'],
    ['Dietary approach', 'Animal-based + evening carbs'],
  ]

  const goalItems = [
    ['Target weight', '75 kg'],
    ['Target body fat', '<20%'],
    ['Daily calories', `${goals.calories} kcal`],
    ['Daily protein', `${goals.protein_g}g`],
    ['Daily carbs', `${goals.carbs_g}g`],
    ['Daily fat', `${goals.fat_g}g`],
  ]

  const prefs = [
    ['Scale mode', 'Standard (not athlete)'],
    ['Weight unit', 'kg'],
    ['Oura sync', 'Manual (auto later)'],
    ['Language', 'English'],
  ]

  const doctor = [
    ['Name', 'Dr. Anton'],
    ['Diagnosis', 'F40.2'],
    ['Next appointment', '~5 Apr 2026'],
    ['Contact', 'Telegram'],
  ]

  return (
    <div style={s.page}>
      <div style={s.tc}>
        <div>
          <div style={{...s.sl, marginTop:0}}>Personal data</div>
          <div style={s.card}>
            {personal.map(([l,v],i) => (
              <div key={l} style={{...s.sr, borderBottom: i===personal.length-1?'none':undefined}}>
                <span style={{fontSize:13}}>{l}</span>
                <div style={{display:'flex',alignItems:'center',gap:9}}>
                  <span style={{fontSize:12,color:'#6b7f96'}}>{v}</span>
                  <span style={{fontSize:11,color:'#00d4b8',cursor:'pointer'}} onClick={() => goCoach(`Update my ${l.toLowerCase()} in iHeal`)}>Edit</span>
                </div>
              </div>
            ))}
          </div>

          <div style={s.sl}>Health goals</div>
          <div style={s.card}>
            {goalItems.map(([l,v],i) => (
              <div key={l} style={{...s.sr, borderBottom: i===goalItems.length-1?'none':undefined}}>
                <span style={{fontSize:13}}>{l}</span>
                <div style={{display:'flex',alignItems:'center',gap:9}}>
                  <span style={{fontSize:12,color:'#6b7f96'}}>{v}</span>
                  <span style={{fontSize:11,color:'#00d4b8',cursor:'pointer'}} onClick={() => goCoach(`Update my ${l.toLowerCase()} goal in iHeal`)}>Edit</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{...s.sl, marginTop:0}}>App preferences</div>
          <div style={s.card}>
            {prefs.map(([l,v],i) => (
              <div key={l} style={{...s.sr, borderBottom: i===prefs.length-1?'none':undefined}}>
                <span style={{fontSize:13}}>{l}</span>
                <div style={{display:'flex',alignItems:'center',gap:9}}>
                  <span style={{fontSize:12,color:'#6b7f96'}}>{v}</span>
                  <span style={{fontSize:11,color:'#00d4b8',cursor:'pointer'}}>Edit</span>
                </div>
              </div>
            ))}
          </div>

          <div style={s.sl}>Psychiatrist</div>
          <div style={s.card}>
            {doctor.map(([l,v],i) => (
              <div key={l} style={{...s.sr, borderBottom: i===doctor.length-1?'none':undefined}}>
                <span style={{fontSize:13}}>{l}</span>
                <span style={{fontSize:12,color:'#6b7f96'}}>{v}</span>
              </div>
            ))}
          </div>

          <div style={s.sl}>Data</div>
          <div style={s.card}>
            <div style={{...s.sr, borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
              <span style={{fontSize:13}}>Export all data</span>
              <span style={{fontSize:11,color:'#00d4b8',cursor:'pointer'}} onClick={() => goCoach('Export all my iHeal health data as JSON')}>Export ↗</span>
            </div>
            <div style={{...s.sr, borderBottom:'none'}}>
              <span style={{fontSize:13}}>Sync profile with Coach</span>
              <span style={{fontSize:11,color:'#00d4b8',cursor:'pointer'}} onClick={() => goCoach('Sync my iHeal profile with the AI coach')}>Sync ↗</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
