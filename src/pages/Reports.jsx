import { useState, useEffect } from 'react'
import { insertReport, fetchReports } from '../lib/supabase'

const G='#c5f135', CARD='#1e2128', BORDER='#2a2e38'
const T='#fff', T2='#b0b4c0', T3='#6a6e7a', FD="'Bebas Neue',sans-serif"
const card = {background:CARD,borderRadius:14,border:`1px solid ${BORDER}`,overflow:'hidden',margin:'0 16px'}

const SYSTEM = `You are a clinical health report writer for Carlos Adell Carceller, 45 years old, Saint Petersburg Russia.
Current protocol: Retatrutide 1mg weekly, Epitalon 2mg nightly, Trazodone titrating (50mg wk1, 100mg wk2 from Mar 24, 150mg wk3), Etifoxine 50mg 3x daily.
Sleep data (Trazodone nights): Night 1 (Mar 17): 3%/76. Night 2 (Mar 18): 2%/75. Night 3 (Mar 19): 11%/74. Night 4 (Mar 20): 10%/81. Night 5 (Mar 21): 2%/72.
Body composition Mar 16: 78.7kg, 26% BF, muscle 55.3kg, visceral fat 8. Goal: sub-20% BF, 75-76kg.
Labs: ApoB 82 (ok), fasting insulin 4.2 (ok), homocysteine 11.2 (elevated), GGT 22 (ok), D3 114.7 (high). Pending: CRP, HbA1c, transferrin saturation.
Blood pressure Mar 21 morning: 118/75 mmHg, pulse 70 bpm.
Write a professional clinical report in the requested language. Be precise and concise. Include only relevant data.`

export default function Reports() {
  const [recipient,  setRecipient]  = useState('')
  const [language,   setLanguage]   = useState('English')
  const [dateRange,  setDateRange]  = useState('March 1–21, 2026')
  const [focus,      setFocus]      = useState('')
  const [generating, setGenerating] = useState(false)
  const [reports,    setReports]    = useState([])
  const [selected,   setSelected]   = useState(null)
  const [loadingList,setLoadingList]= useState(true)

  useEffect(() => {
    fetchReports().then(data => { setReports(data); setLoadingList(false) })
  }, [])

  const generate = async () => {
    if (generating) return
    setGenerating(true)
    try {
      const prompt = `Generate a professional clinical health report for ${recipient || 'my doctor'} in ${language}.
Date range: ${dateRange}.
${focus ? `Focus on: ${focus}` : 'Include: sleep architecture and Trazodone response, heart rate trends, body composition progress, active medications and supplements, lab results, blood pressure.'}
Format it as a proper medical report with sections and clear data presentation.`

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: SYSTEM,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      const content = data.content?.[0]?.text || 'Error generating report.'

      // Save to Supabase
      const saved = await insertReport({
        date: new Date().toISOString().slice(0, 10),
        recipient: recipient || 'Doctor',
        language,
        content,
        notes: focus,
      })

      const newReport = saved || { date: new Date().toISOString().slice(0,10), recipient: recipient || 'Doctor', language, content, notes: focus }
      setReports(prev => [newReport, ...prev])
      setSelected(newReport)
    } catch (e) {
      console.error(e)
    }
    setGenerating(false)
  }

  // Show selected report
  if (selected) {
    return (
      <div style={{background:'#000',minHeight:'100%'}}>
        <div style={{display:'flex',alignItems:'center',gap:6,padding:'14px 16px 6px',cursor:'pointer'}} onClick={()=>setSelected(null)}>
          <span style={{fontSize:22,color:G,lineHeight:1}}>‹</span>
          <span style={{fontSize:15,color:G,fontWeight:500}}>Reports</span>
        </div>
        <div style={{padding:'12px 16px 8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:T}}>{selected.recipient}</div>
            <div style={{fontSize:12,color:T3}}>{selected.date} · {selected.language}</div>
          </div>
          <button onClick={()=>{
            const blob = new Blob([selected.content], {type:'text/plain'})
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = `report-${selected.date}.txt`; a.click()
            URL.revokeObjectURL(url)
          }} style={{padding:'8px 14px',borderRadius:10,background:G,border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:'#000'}}>
            Download
          </button>
        </div>
        <div style={{margin:'0 16px',background:CARD,border:`1px solid ${BORDER}`,borderRadius:14,padding:'16px',fontSize:13,lineHeight:1.7,color:T2,whiteSpace:'pre-wrap'}}>
          {selected.content}
        </div>
        <div style={{height:24}}/>
      </div>
    )
  }

  return (
    <div style={{background:'#000',minHeight:'100%'}}>
      <div style={{position:'relative',overflow:'hidden',background:'linear-gradient(160deg,#0d1200 0%,#000 55%)'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 10%,#000 100%)'}}/>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 70% 30%,rgba(197,241,53,.08) 0%,transparent 65%)'}}/>
        <div style={{position:'relative',padding:'16px 18px 14px'}}>
          <div style={{fontSize:11,fontWeight:600,color:G,letterSpacing:2.5,textTransform:'uppercase',marginBottom:3}}>Generate</div>
          <div style={{fontFamily:FD,fontSize:40,letterSpacing:1,lineHeight:1}}>REPORTS</div>
        </div>
      </div>

      <div style={{fontFamily:FD,fontSize:14,letterSpacing:2,color:T,padding:'13px 16px 9px',textTransform:'uppercase'}}>New Report</div>
      <div style={{padding:'0 16px',display:'flex',flexDirection:'column',gap:10}}>
        <div>
          <div style={{fontSize:11,fontWeight:600,color:T2,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6}}>Recipient</div>
          <input value={recipient} onChange={e=>setRecipient(e.target.value)}
            placeholder="e.g. Dr. Anton"
            style={{width:'100%',background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:'11px 14px',fontSize:16,color:T,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}}/>
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:600,color:T2,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6}}>Language</div>
          <select value={language} onChange={e=>setLanguage(e.target.value)}
            style={{width:'100%',background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:'11px 14px',fontSize:16,color:T,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}}>
            <option>English</option>
            <option>Russian</option>
            <option>Spanish</option>
          </select>
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:600,color:T2,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6}}>Date Range</div>
          <input value={dateRange} onChange={e=>setDateRange(e.target.value)}
            style={{width:'100%',background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:'11px 14px',fontSize:16,color:T,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}}/>
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:600,color:T2,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6}}>Focus (optional)</div>
          <textarea value={focus} onChange={e=>setFocus(e.target.value)}
            placeholder="e.g. Focus on sleep and Trazodone response"
            rows={2}
            style={{width:'100%',background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:'11px 14px',fontSize:16,color:T,fontFamily:"'DM Sans',sans-serif",outline:'none',resize:'none',boxSizing:'border-box'}}/>
        </div>
        <button onClick={generate} disabled={generating} style={{
          padding:15,borderRadius:12,background:generating?'#2a3a00':G,border:'none',
          fontFamily:FD,fontSize:19,letterSpacing:1,color:generating?G:'#000',cursor:generating?'default':'pointer',
          display:'flex',alignItems:'center',justifyContent:'center',gap:8,
        }}>
          {generating ? 'GENERATING...' : 'GENERATE REPORT'}
        </button>
      </div>

      <div style={{fontFamily:FD,fontSize:14,letterSpacing:2,color:T,padding:'18px 16px 9px',textTransform:'uppercase'}}>
        Previous Reports {!loadingList && reports.length > 0 && <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:T3,textTransform:'none',letterSpacing:0,fontWeight:400,marginLeft:8}}>{reports.length} saved</span>}
      </div>
      <div style={card}>
        {loadingList ? (
          <div style={{padding:'20px 16px',fontSize:13,color:T3,textAlign:'center'}}>Loading...</div>
        ) : reports.length === 0 ? (
          <div style={{padding:'20px 16px',fontSize:13,color:T3,textAlign:'center'}}>No reports yet. Generate your first one above.</div>
        ) : (
          reports.map((r, i) => (
            <div key={r.id || i} onClick={()=>setSelected(r)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 16px',borderBottom:`1px solid ${BORDER}`,cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:34,height:34,borderRadius:9,background:'#2e3240',border:`1px solid ${BORDER}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0}}>📋</div>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:T}}>{r.recipient}</div>
                  <div style={{fontSize:12,color:T3,marginTop:2}}>{r.date} · {r.language}</div>
                </div>
              </div>
              <div style={{fontSize:18,color:T3}}>›</div>
            </div>
          ))
        )}
      </div>
      <div style={{height:24}}/>
    </div>
  )
}
