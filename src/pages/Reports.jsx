import { useState, useEffect } from 'react'
import { insertReport, fetchReports, deleteReport } from '../lib/supabase'

const G='#c5f135', CARD='#1e2128', CARD3='#2e3240', BORDER='#2a2e38'
const T='#fff', T2='#b0b4c0', T3='#6a6e7a', FD="'Bebas Neue',sans-serif"
const card = {background:CARD,borderRadius:14,border:`1px solid ${BORDER}`,overflow:'hidden',margin:'0 16px'}
const inputStyle = {width:'100%',background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:'11px 14px',fontSize:16,color:T,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}

const SYSTEM = `You are a clinical health report writer for Carlos Adell Carceller, 45 years old, Saint Petersburg Russia.
Current protocol: Retatrutide 1mg weekly, Epitalon 2mg nightly, Trazodone titrating (50mg wk1, 100mg wk2 from Mar 24, 150mg wk3), Etifoxine 50mg 3x daily.
Sleep data (Trazodone nights): Night 1 (Mar 17): 3%/76. Night 2 (Mar 18): 2%/75. Night 3 (Mar 19): 11%/74. Night 4 (Mar 20): 10%/81. Night 5 (Mar 21): 2%/72.
Body composition Mar 16: 78.7kg, 26% BF, muscle 55.3kg, visceral fat 8. Goal: sub-20% BF, 75-76kg.
Labs: ApoB 82 (ok), fasting insulin 4.2 (ok), homocysteine 11.2 (elevated), GGT 22 (ok), D3 114.7 (high). Pending: CRP, HbA1c, transferrin saturation.
Blood pressure Mar 21 morning: 118/75 mmHg, pulse 70 bpm.
Write a professional clinical report in the requested language. Be precise and concise.`

// Convert markdown text to simple HTML for PDF printing
function markdownToHtml(text, title) {
  let html = text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^---+$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #111; line-height: 1.6; }
  h1 { font-size: 22px; border-bottom: 2px solid #111; padding-bottom: 8px; }
  h2 { font-size: 18px; margin-top: 24px; }
  h3 { font-size: 15px; margin-top: 16px; }
  li { margin: 4px 0; }
  hr { border: none; border-top: 1px solid #ccc; margin: 20px 0; }
  .title { font-size: 11px; color: #888; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
  .header { margin-bottom: 32px; }
</style>
</head>
<body>
<div class="header">
  <div class="title">iHeal Health Report</div>
  <h1>${title}</h1>
</div>
<p>${html}</p>
</body>
</html>`
}

export default function Reports() {
  const [recipient,   setRecipient]   = useState('')
  const [language,    setLanguage]    = useState('English')
  const [dateRange,   setDateRange]   = useState('March 1–21, 2026')
  const [focus,       setFocus]       = useState('')
  const [generating,  setGenerating]  = useState(false)
  const [reports,     setReports]     = useState([])
  const [selected,    setSelected]    = useState(null)
  const [loadingList, setLoadingList] = useState(true)
  const [confirmDel,  setConfirmDel]  = useState(null)
  const [editingTitle,setEditingTitle]= useState(false)
  const [titleVal,    setTitleVal]    = useState('')
  const [savingTitle, setSavingTitle] = useState(false)

  useEffect(() => {
    fetchReports().then(data => { setReports(data); setLoadingList(false) })
  }, [])

  const generate = async () => {
    if (generating) return
    setGenerating(true)
    try {
      const prompt = `Generate a professional clinical health report for ${recipient || 'Doctor'} in ${language}.
Date range: ${dateRange}.
${focus ? `Focus on: ${focus}` : 'Include: sleep architecture and Trazodone response, heart rate trends, body composition, medications and supplements, lab results, blood pressure.'}
Format it as a proper medical report with clear sections.`

      const res = await fetch('/api/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:2000, system:SYSTEM, messages:[{role:'user',content:prompt}] }),
      })
      const data = await res.json()
      const content = data.content?.[0]?.text || 'Error generating report.'
      const title = recipient ? `${recipient} — ${dateRange}` : `Clinical Report — ${dateRange}`

      const saved = await insertReport({ date:new Date().toISOString().slice(0,10), recipient:recipient||'Doctor', language, content, notes:focus })
      const newReport = saved || { id: Date.now(), date:new Date().toISOString().slice(0,10), recipient:recipient||'Doctor', language, content, notes:focus }
      newReport._title = title
      setReports(prev => [newReport, ...prev])
      setSelected(newReport)
    } catch(e) { console.error(e) }
    setGenerating(false)
  }

  const handleDelete = async (report) => {
    if (confirmDel?.id === report.id) {
      await deleteReport(report.id)
      setReports(prev => prev.filter(r => r.id !== report.id))
      setConfirmDel(null)
      if (selected?.id === report.id) setSelected(null)
    } else {
      setConfirmDel(report)
      setTimeout(() => setConfirmDel(null), 3000)
    }
  }

  const shareAsPdf = (report) => {
    const title = report._title || `${report.recipient} — ${report.date}`
    const html = markdownToHtml(report.content, title)
    const blob = new Blob([html], { type:'text/html' })
    const url = URL.createObjectURL(blob)
    // Open in new tab — user can Print → Save as PDF from browser
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }

  const downloadReport = (report) => {
    const title = report._title || `${report.recipient} — ${report.date}`
    const blob = new Blob([report.content], { type:'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi,'_')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareReport = (report) => {
    const title = report._title || `${report.recipient} — ${report.date}`
    if (navigator.share) {
      navigator.share({ title, text: report.content })
    } else {
      navigator.clipboard.writeText(report.content)
    }
  }

  // ── Report detail view ──────────────────────────────────────────────────────
  if (selected) {
    const title = selected._title || `${selected.recipient} — ${selected.date}`
    return (
      <div style={{background:'#000',minHeight:'100%'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px 8px'}}>
          <div style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer'}} onClick={()=>setSelected(null)}>
            <span style={{fontSize:22,color:G,lineHeight:1}}>‹</span>
            <span style={{fontSize:15,color:G,fontWeight:500}}>Reports</span>
          </div>
          <button onClick={()=>handleDelete(selected)} style={{fontSize:12,color:confirmDel?.id===selected.id?'#ff5555':'#555',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:confirmDel?.id===selected.id?700:400}}>
            {confirmDel?.id===selected.id ? 'Tap again to delete' : 'Delete'}
          </button>
        </div>

        {/* Editable title */}
        <div style={{padding:'0 16px 10px'}}>
          {editingTitle ? (
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <input value={titleVal} onChange={e=>setTitleVal(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'){ setSelected(s=>({...s,_title:titleVal})); setEditingTitle(false) }}}
                autoFocus style={{...inputStyle,padding:'8px 12px',fontSize:15,flex:1}}/>
              <button onClick={()=>{ setSelected(s=>({...s,_title:titleVal})); setEditingTitle(false) }}
                style={{padding:'8px 14px',borderRadius:8,background:G,border:'none',color:'#000',fontFamily:FD,fontSize:13,letterSpacing:1,cursor:'pointer'}}>
                SAVE
              </button>
            </div>
          ) : (
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div>
                <div style={{fontSize:15,fontWeight:600,color:T}}>{title}</div>
                <div style={{fontSize:12,color:T3,marginTop:2}}>{selected.date} · {selected.language}</div>
              </div>
              <button onClick={()=>{ setTitleVal(title); setEditingTitle(true) }}
                style={{fontSize:12,color:G,background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",marginLeft:4}}>
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{display:'flex',gap:6,padding:'0 16px 12px',flexWrap:'wrap'}}>
          {[
            {label:'⎘ Copy',     action:()=>navigator.clipboard.writeText(selected.content)},
            {label:'↗ Share',    action:()=>shareReport(selected)},
            {label:'↓ Download', action:()=>downloadReport(selected)},
            {label:'📄 PDF',     action:()=>shareAsPdf(selected)},
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} style={{display:'flex',alignItems:'center',gap:4,padding:'7px 12px',borderRadius:8,background:'rgba(255,255,255,.06)',border:'none',cursor:'pointer',color:'#aaa',fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>
              {btn.label}
            </button>
          ))}
        </div>

        {/* Report content */}
        <div style={{margin:'0 16px',background:CARD,border:`1px solid ${BORDER}`,borderRadius:14,padding:'16px',fontSize:14,lineHeight:1.7,color:T2,whiteSpace:'pre-wrap'}}>
          {selected.content}
        </div>
        <div style={{height:24}}/>
      </div>
    )
  }

  // ── Report list view ────────────────────────────────────────────────────────
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
          <div style={{fontSize:11,fontWeight:600,color:T2,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6}}>Recipient / Title</div>
          <input value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="e.g. Dr. Anton" style={inputStyle}/>
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:600,color:T2,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6}}>Language</div>
          <select value={language} onChange={e=>setLanguage(e.target.value)} style={{...inputStyle,cursor:'pointer'}}>
            <option>English</option><option>Russian</option><option>Spanish</option>
          </select>
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:600,color:T2,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6}}>Date Range</div>
          <input value={dateRange} onChange={e=>setDateRange(e.target.value)} style={inputStyle}/>
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:600,color:T2,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6}}>Focus (optional)</div>
          <textarea value={focus} onChange={e=>setFocus(e.target.value)} placeholder="e.g. Focus on sleep and Trazodone response" rows={2}
            style={{...inputStyle,resize:'none'}}/>
        </div>
        <button onClick={generate} disabled={generating} style={{padding:15,borderRadius:12,background:generating?'#1a2a00':G,border:'none',fontFamily:FD,fontSize:19,letterSpacing:1,color:generating?G:'#000',cursor:generating?'default':'pointer'}}>
          {generating ? 'GENERATING...' : 'GENERATE REPORT'}
        </button>
      </div>

      <div style={{fontFamily:FD,fontSize:14,letterSpacing:2,color:T,padding:'18px 16px 9px',textTransform:'uppercase',display:'flex',alignItems:'baseline',justifyContent:'space-between'}}>
        Previous Reports
        {!loadingList && reports.length > 0 && <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:T3,textTransform:'none',letterSpacing:0,fontWeight:400}}>{reports.length} saved</span>}
      </div>
      <div style={card}>
        {loadingList ? (
          <div style={{padding:'20px 16px',fontSize:13,color:T3,textAlign:'center'}}>Loading...</div>
        ) : reports.length === 0 ? (
          <div style={{padding:'20px 16px',fontSize:13,color:T3,textAlign:'center'}}>No reports yet.</div>
        ) : reports.map((r,i) => {
          const title = r._title || `${r.recipient} — ${r.date}`
          const isConfirm = confirmDel?.id === r.id
          return (
            <div key={r.id||i} style={{display:'flex',alignItems:'center',padding:'13px 16px',borderBottom:`1px solid ${BORDER}`,gap:12}}>
              <div style={{width:36,height:36,borderRadius:10,background:CARD3,border:`1px solid ${BORDER}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>📋</div>
              <div style={{flex:1,minWidth:0,cursor:'pointer'}} onClick={()=>setSelected(r)}>
                <div style={{fontSize:14,fontWeight:500,color:T,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{title}</div>
                <div style={{fontSize:12,color:T3,marginTop:2}}>{r.date} · {r.language}</div>
              </div>
              <button onClick={()=>handleDelete(r)} style={{fontSize:isConfirm?11:18,color:isConfirm?'#ff5555':T3,background:'none',border:'none',cursor:'pointer',flexShrink:0,padding:'4px 6px',fontFamily:"'DM Sans',sans-serif",fontWeight:isConfirm?700:400}}>
                {isConfirm ? 'Confirm?' : '×'}
              </button>
            </div>
          )
        })}
      </div>
      <div style={{height:24}}/>
    </div>
  )
}
