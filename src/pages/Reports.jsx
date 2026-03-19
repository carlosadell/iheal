import { useState } from 'react'

const s = {
  page: { maxWidth:1020, margin:'0 auto', padding:'22px 24px 40px', width:'100%' },
  tc: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  sl: { fontSize:10, fontWeight:500, letterSpacing:'0.9px', textTransform:'uppercase', color:'#3d5068', margin:'20px 0 8px' },
  card: { background:'#1a2438', borderRadius:13, border:'1px solid rgba(255,255,255,0.07)', padding:'15px 17px' },
  fg: { marginBottom:11 },
  fl: { fontSize:11, color:'#6b7f96', marginBottom:4, display:'block' },
  fi: { width:'100%', padding:'9px 11px', borderRadius:8, border:'1px solid rgba(255,255,255,0.07)', background:'#161f30', color:'#d8e8f5', fontSize:13, fontFamily:'inherit', outline:'none' },
  fr2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 },
  btnP: { width:'100%', padding:11, background:'#00d4b8', color:'#080d16', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' },
  ro: { padding:'11px 13px', background:'#161f30', borderRadius:9, border:'1px solid rgba(255,255,255,0.07)', marginBottom:6, cursor:'pointer' },
}

const prev = [
  { name:'Dr. Anton Petrov — Psychiatrist', desc:'Russian · 15 Mar 2026 · Sleep + HRV + medications' },
  { name:'Clinical Report', desc:'English · 15 Mar 2026 · Full clinical summary' },
  { name:'Sister — Psychologist', desc:'Spanish · 15 Mar 2026 · Full clinical summary' },
]

export default function Reports() {
  const [recipient, setRecipient] = useState('')
  const [lang, setLang] = useState('Russian')
  const [from, setFrom] = useState('2026-03-07')
  const [to, setTo] = useState('2026-03-19')
  const [focus, setFocus] = useState('')

  const generate = () => {
    const prompt = `Generate a medical report. Recipient: ${recipient||'Doctor'}. Language: ${lang}. Date range: ${from} to ${to}. Focus: ${focus||'sleep data, HRV, medications, body composition, peptide protocol'}.`
    window.sendPrompt?.(prompt)
  }

  return (
    <div style={s.page}>
      <div style={s.tc}>
        <div>
          <div style={{...s.sl, marginTop:0}}>Generate report</div>
          <div style={s.card}>
            <div style={s.fg}>
              <label style={s.fl}>Recipient name</label>
              <input style={s.fi} value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="e.g. Dr. Anton Petrov" />
            </div>
            <div style={s.fg}>
              <label style={s.fl}>Language</label>
              <select style={s.fi} value={lang} onChange={e=>setLang(e.target.value)}>
                <option>Russian</option>
                <option>English</option>
                <option>Spanish</option>
              </select>
            </div>
            <div style={{...s.fr2, marginBottom:11}}>
              <div>
                <label style={s.fl}>From</label>
                <input style={s.fi} type="date" value={from} onChange={e=>setFrom(e.target.value)} />
              </div>
              <div>
                <label style={s.fl}>To</label>
                <input style={s.fi} type="date" value={to} onChange={e=>setTo(e.target.value)} />
              </div>
            </div>
            <div style={s.fg}>
              <label style={s.fl}>What to focus on in this report</label>
              <textarea style={{...s.fi, resize:'none', lineHeight:1.5}} rows={3}
                value={focus} onChange={e=>setFocus(e.target.value)}
                placeholder="e.g. Focus on sleep and HRV. Include medications. Mention anxiety improvement since starting Etifoxine." />
            </div>
            <button style={s.btnP} onClick={generate}>Generate PDF ↗</button>
          </div>
        </div>

        <div>
          <div style={{...s.sl, marginTop:0}}>Previous reports</div>
          {prev.map(r => (
            <div key={r.name} style={s.ro}>
              <div style={{fontSize:12,fontWeight:500,marginBottom:2}}>{r.name}</div>
              <div style={{fontSize:11,color:'#6b7f96'}}>{r.desc}</div>
            </div>
          ))}

          <div style={s.sl}>Doctor</div>
          <div style={{...s.card, padding:'11px 13px'}}>
            <div style={{display:'flex',alignItems:'center',gap:9,padding:'7px 0'}}>
              <div style={{width:32,height:32,borderRadius:7,background:'linear-gradient(135deg,#4d9fff,#00d4b8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#080d16',flexShrink:0}}>DR</div>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>Dr. Anton</div>
                <div style={{fontSize:10,color:'#6b7f96'}}>Psychiatrist · Telegram · SPb · Next: ~5 Apr 2026</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
