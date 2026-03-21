import { useState, useRef, useEffect } from 'react'
import { insertSleepLog, insertMacroLog, insertBodyComposition, insertBpLog, upsertLabResult, insertReport } from '../lib/supabase'

const G='#c5f135', CARD='#1e2128', BORDER='#2a2e38'

const INITIAL_MSG = { role:'ai', text:"I'm your iHeal AI Coach. I have your full health context and can log data directly to your app. Share anything — Oura screenshots, RENPHO scans, lab results, food photos, or ask me anything." }

const SYSTEM = `You are Carlos's personal AI health coach inside iHeal. Carlos is Spanish, 45 years old, entrepreneur based in Saint Petersburg, Russia. Wife: Katya (born 14 April 1994). Daughter: Mira (6 months old, sleeping in parents' room).

CURRENT PROTOCOL:
- Retatrutide 1mg subQ weekly (Monday, after food). Triple GLP-1/GIP/glucagon agonist. Fat loss primary. Dose fixed at 1mg — do not escalate. Glucagon component causes mild chronotropic HR elevation — structural and dose-dependent.
- Epitalon 2mg subQ nightly, 30–60 min before bed.
- Trazodone (Триттико) titrating: wk1 50mg (Mar 17–23), wk2 100mg (from Mar 24), wk3 150mg. At 21:00. Watch avg sleep HR — if consistently above 78–80 bpm, flag to Dr. Anton before 150mg.
- Etifoxine (Стрезам) 50mg × 3 daily: 09:00, 14:00, 17:00.

SUPPLEMENTS: Vitamin C 900–1800mg waking | Magnesium Citrate 400mg morning | B-Complex Methylated morning | K2 MK-7 2 caps daily | D3 10,000 IU 4×/wk | DHEA 100mg daily | Magnesium Bisglycinate + B6 evening.

DIET: Carnivore-based + one potato at dinner. Targets: 1,950 kcal, 150–170g protein, 110–120g fat, 50–70g carbs.

SLEEP LOG:
Mar 9: 6%/70 | Mar 10: 10%/76 | Mar 11: 7%/73 | Mar 12: 13%/78 | Mar 13: 7%/72
Mar 17 (Traz night 1): 3%/76 | Mar 18: 2%/75 | Mar 19: 11%/74
Mar 20 (night 4): deep 40min 10%, REM 1h40m 25%, HR 68/76avg, HRV 21ms, score 81 GOOD
Mar 21 (night 5): deep 9min 2%, REM 1h23m 23%, HR 71/78avg, HRV 16ms, score 72. Late bedtime + heavy meal.

HEART RATE: Avg sleep HR trending up (night 4: 76, night 5: 78 bpm). Primary driver: Retatrutide glucagon chronotropy. Daytime resting HR Mar 21: 70 bpm (normal). Strategy: monitor as Trazodone titrates. If daytime HR >80 consistently, discuss bisoprolol 2.5mg with Dr. Anton Apr 5.

BLOOD PRESSURE Mar 21 morning: 118/75 mmHg, pulse 70 bpm — WHO optimal.

BODY COMPOSITION Mar 16: 78.7kg, 26% BF, muscle 55.3kg, visceral fat 8. Goal: sub-20% BF, 75–76kg.

LABS: ApoB 82 ok | fasting insulin 4.2 ok | homocysteine 11.2 elevated (B-complex addresses) | GGT 22 ok | D3 114.7 high (K2 protective). Pending: CRP, HbA1c, transferrin saturation.

MACROS: Mar 14: 1820/178g | Mar 15: 1955/182g | Mar 16: 1781/184g | Mar 17: 1955/182g | Mar 19: 1885/199g | Mar 21: 2596/179g (over target).

MORNING ERECTIONS: Returning and increasing — positive sign (NPT driven by REM + testosterone recovery).

PSYCHIATRIST: Dr. Anton, Домой Линник SPB, 8-952-244-18-27, F40.2. Next appt ~5 April 2026. Telegram.

INTELLECTUAL FRAMEWORK: Mechanism-first. Inflammation + insulin resistance are root causes. Priority biomarkers: ApoB, oxidised LDL, CRP, homocysteine, fasting insulin, HRV, deep sleep %.

DATA LOGGING: When Carlos shares health data you can log it. Respond naturally with your analysis, then at the very end of your response — and ONLY if there is specific data to log — add a JSON block in this exact format on its own line:
DATA_LOG:{"type":"sleep","date":"2026-03-22","deep_min":35,"deep_pct":9,"rem_pct":22,"rem_min":85,"resting_hr":69,"hrv_ms":20,"total_min":390,"score":75,"notes":"night 6"}
Valid types: "sleep", "macro", "body", "bp", "lab"
For sleep: date, deep_min, deep_pct, rem_pct, rem_min, resting_hr, hrv_ms, hrv_max_ms, total_min, score, notes
For macro: date, kcal, protein_g, carbs_g, fat_g
For body: date, weight_kg, body_fat_pct, muscle_mass_kg, visceral_fat
For bp: date, time_of_day, systolic, diastolic, pulse, notes
For lab: name, value, unit, range, status, date
Only include DATA_LOG if Carlos has shared specific numbers to log. Never fabricate data.

Respond naturally, with the same depth and warmth as a knowledgeable doctor friend. Use markdown formatting — headers, bold, bullets as appropriate. No artificial length limits. Analyse photos carefully when shared.

REPORTS AND PDFs: When Carlos asks for a PDF, clinical report, or document — generate the full report content right here in the chat in clean formatted markdown. The Download button on every response saves it as a text file. For reports saved permanently to his records, the Reports tab does that. Never say you cannot generate reports or PDFs.`

// ── Markdown renderer matching Claude app style ───────────────────────────────
function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // H2
    if (line.startsWith('## ')) {
      elements.push(<div key={i} style={{fontWeight:700,fontSize:16,color:'#fff',marginTop:16,marginBottom:4}}>{renderInline(line.slice(3))}</div>)
      i++; continue
    }
    // H3
    if (line.startsWith('### ')) {
      elements.push(<div key={i} style={{fontWeight:600,fontSize:15,color:'#fff',marginTop:12,marginBottom:3}}>{renderInline(line.slice(4))}</div>)
      i++; continue
    }
    // H1
    if (line.startsWith('# ')) {
      elements.push(<div key={i} style={{fontWeight:700,fontSize:18,color:'#fff',marginTop:16,marginBottom:6}}>{renderInline(line.slice(2))}</div>)
      i++; continue
    }
    // Horizontal rule
    if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
      elements.push(<div key={i} style={{borderTop:`1px solid ${BORDER}`,margin:'10px 0'}}/>)
      i++; continue
    }
    // Bullet
    if (line.match(/^[-•*]\s/)) {
      elements.push(
        <div key={i} style={{display:'flex',gap:8,marginTop:4,paddingLeft:4}}>
          <span style={{color:G,flexShrink:0,marginTop:1}}>•</span>
          <span>{renderInline(line.replace(/^[-•*]\s/,''))}</span>
        </div>
      )
      i++; continue
    }
    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\./)[1]
      elements.push(
        <div key={i} style={{display:'flex',gap:8,marginTop:4,paddingLeft:4}}>
          <span style={{color:G,flexShrink:0,minWidth:18,fontWeight:600}}>{num}.</span>
          <span>{renderInline(line.replace(/^\d+\.\s/,''))}</span>
        </div>
      )
      i++; continue
    }
    // Code block
    if (line.startsWith('```')) {
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <pre key={i} style={{background:'#0d0d0d',border:`1px solid ${BORDER}`,borderRadius:8,padding:'10px 12px',fontSize:12,color:'#c8ccd8',overflowX:'auto',margin:'8px 0',fontFamily:'monospace',lineHeight:1.5}}>
          {codeLines.join('\n')}
        </pre>
      )
      i++; continue
    }
    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={i} style={{height:8}}/>)
      i++; continue
    }
    // Normal paragraph line
    elements.push(<div key={i} style={{marginTop:i===0?0:2,lineHeight:1.65}}>{renderInline(line)}</div>)
    i++
  }
  return elements
}

function renderInline(text) {
  // Handle bold+italic, bold, italic, inline code
  const parts = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('***') && part.endsWith('***'))
      return <strong key={i} style={{fontStyle:'italic',color:'#fff'}}>{part.slice(3,-3)}</strong>
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{color:'#fff',fontWeight:600}}>{part.slice(2,-2)}</strong>
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2)
      return <em key={i} style={{color:'#c8ccd8'}}>{part.slice(1,-1)}</em>
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2)
      return <code key={i} style={{background:'#0d0d0d',border:`1px solid ${BORDER}`,borderRadius:4,padding:'1px 5px',fontSize:12,fontFamily:'monospace',color:G}}>{part.slice(1,-1)}</code>
    return <span key={i}>{part}</span>
  })
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Parse and execute DATA_LOG commands from Coach response
async function executeDataLog(text, callbacks) {
  const match = text.match(/DATA_LOG:(\{.*\})/)
  if (!match) return null
  try {
    const data = JSON.parse(match[1])
    const { type, ...payload } = data
    switch (type) {
      case 'sleep':  await insertSleepLog(payload);        callbacks.refreshSleep?.();  break
      case 'macro':  await insertMacroLog(payload);        callbacks.refreshMacros?.(); break
      case 'body':   await insertBodyComposition(payload); callbacks.refreshBody?.();   break
      case 'bp':     await insertBpLog(payload);           callbacks.refreshBp?.();     break
      case 'lab':    await upsertLabResult(payload);       callbacks.refreshLabs?.();   break
    }
    return type
  } catch (e) {
    console.error('DATA_LOG parse error:', e)
    return null
  }
}

// Remove DATA_LOG line from displayed text
function cleanText(text) {
  return text.replace(/\nDATA_LOG:\{.*\}/g, '').replace(/DATA_LOG:\{.*\}\n?/g, '').trim()
}

export default function Coach({ refreshSleep, refreshMacros, refreshBody, refreshBp, refreshLabs }) {
  const [msgs, setMsgs] = useState(() => {
    try { const s = localStorage.getItem('iheal_chat'); return s ? JSON.parse(s) : [INITIAL_MSG] }
    catch { return [INITIAL_MSG] }
  })
  const [input,        setInput]        = useState('')
  const [thinking,     setThinking]     = useState(false)
  const [pendingImage, setPendingImage] = useState(null)
  const [copied,       setCopied]       = useState(null)
  const [savedReport,  setSavedReport]  = useState(null)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const fileRef   = useRef(null)

  useEffect(() => {
    try { localStorage.setItem('iheal_chat', JSON.stringify(msgs)) } catch {}
  }, [msgs])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [msgs, thinking])

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    try {
      const base64 = await fileToBase64(file)
      setPendingImage({ base64, mimeType: file.type, previewUrl: URL.createObjectURL(file) })
    } catch {}
    e.target.value = ''
  }

  const removePendingImage = () => {
    if (pendingImage?.previewUrl) URL.revokeObjectURL(pendingImage.previewUrl)
    setPendingImage(null)
  }

  const copyMsg = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const shareMsg = (text) => {
    if (navigator.share) {
      navigator.share({ title: 'iHeal Coach', text })
    } else {
      copyMsg(text)
    }
  }

  const saveAsReport = async (text) => {
    const date = new Date().toISOString().slice(0,10)
    await insertReport({ date, recipient: 'Personal Record', language: 'English', content: text, notes: 'Saved from Coach' })
    setSavedReport(text)
    setTimeout(() => setSavedReport(null), 3000)
  }

  const downloadMsg = (text) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `iheal-coach-${new Date().toISOString().slice(0,10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const send = async () => {
    const text = input.trim()
    if (!text && !pendingImage) return
    if (thinking) return

    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'

    const displayMsg = { role:'user', text: text || '(photo)', imagePreview: pendingImage?.previewUrl || null }

    let currentMsgApiContent
    if (pendingImage) {
      currentMsgApiContent = [
        { type:'image', source:{ type:'base64', media_type:pendingImage.mimeType, data:pendingImage.base64 } },
        { type:'text', text: text || 'Please analyze this image and extract all relevant health data.' },
      ]
    } else {
      currentMsgApiContent = text
    }

    const imageToRevoke = pendingImage?.previewUrl
    setPendingImage(null)

    const newDisplayMsgs = [...msgs, displayMsg]
    setMsgs(newDisplayMsgs)
    setThinking(true)

    try {
      const apiMessages = newDisplayMsgs.map((m, idx) => {
        if (idx === newDisplayMsgs.length - 1 && m.role === 'user') {
          return { role:'user', content: currentMsgApiContent }
        }
        const content = m.imagePreview
          ? (m.text === '(photo)' ? 'I shared a photo.' : m.text + ' (photo shared)')
          : m.text
        return { role: m.role === 'ai' ? 'assistant' : 'user', content }
      })

      const res = await fetch('/api/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:4000,
          system: SYSTEM,
          messages: apiMessages,
        }),
      })
      const data = await res.json()
      const rawText = data.content?.[0]?.text || 'Error — try again.'

      // Execute any data logging commands
      const logged = await executeDataLog(rawText, { refreshSleep, refreshMacros, refreshBody, refreshBp, refreshLabs })

      // Clean the DATA_LOG line from displayed text and add logged confirmation
      let displayText = cleanText(rawText)
      if (logged) displayText += `\n\n✓ *${logged} data saved to your records*`

      setMsgs(prev => [...prev, { role:'ai', text: displayText }])
    } catch {
      setMsgs(prev => [...prev, { role:'ai', text:'Connection error. Try again.' }])
    }

    if (imageToRevoke) URL.revokeObjectURL(imageToRevoke)
    setThinking(false)
  }

  const clearHistory = () => {
    const fresh = [INITIAL_MSG]
    setMsgs(fresh)
    try { localStorage.setItem('iheal_chat', JSON.stringify(fresh)) } catch {}
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#000'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 16px 9px',borderBottom:`1px solid ${BORDER}`,flexShrink:0}}>
        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,letterSpacing:'1.5px',color:'#fff'}}>AI COACH</span>
        <button onClick={clearHistory} style={{fontSize:12,color:'#555',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>Clear history</button>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px',display:'flex',flexDirection:'column',gap:14,minHeight:0}}>
        {msgs.map((m,i) => (
          <div key={i} style={{display:'flex',flexDirection:'column',alignItems:m.role==='ai'?'flex-start':'flex-end',maxWidth:'100%'}}>
            <div style={{
              maxWidth:'88%',padding:'13px 15px',fontSize:15,lineHeight:1.65,borderRadius:16,
              ...(m.role==='ai'
                ? {background:CARD,border:`1px solid ${BORDER}`,borderBottomLeftRadius:3,color:'#d0d4e0'}
                : {background:'#2a3048',border:'1px solid #3a4060',borderBottomRightRadius:3,color:'#fff',fontWeight:500})
            }}>
              {m.imagePreview && (
                <img src={m.imagePreview} alt="uploaded"
                  style={{width:'100%',borderRadius:8,marginBottom:m.text&&m.text!=='(photo)'?8:0,display:'block'}}
                  onError={e=>{e.target.style.display='none'}}
                />
              )}
              {m.role==='ai' ? renderMarkdown(m.text) : m.text !== '(photo)' ? m.text : null}
            </div>
            {/* Action buttons for AI messages */}
            {m.role==='ai' && i > 0 && (
              <div style={{display:'flex',gap:6,marginTop:6,paddingLeft:2}}>
                <button onClick={()=>copyMsg(m.text)} title={copied===m.text?'Copied!':'Copy'} style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:8,background:copied===m.text?'rgba(197,241,53,.15)':'rgba(255,255,255,.06)',border:'none',cursor:'pointer',color:copied===m.text?G:'#aaa',fontSize:13,fontFamily:"'DM Sans',sans-serif",transition:'.15s'}}>
                  <span style={{fontSize:14}}>{copied===m.text ? '✓' : '⎘'}</span>
                  <span>{copied===m.text ? 'Copied' : 'Copy'}</span>
                </button>
                <button onClick={()=>shareMsg(m.text)} title="Share" style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:8,background:'rgba(255,255,255,.06)',border:'none',cursor:'pointer',color:'#aaa',fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>
                  <span style={{fontSize:14}}>↗</span>
                  <span>Share</span>
                </button>
                {m.text.length > 300 && (
                  <button onClick={()=>downloadMsg(m.text)} title="Download as markdown" style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:8,background:'rgba(255,255,255,.06)',border:'none',cursor:'pointer',color:'#aaa',fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>
                    <span style={{fontSize:14}}>↓</span>
                    <span>Save</span>
                  </button>
                )}
                <button onClick={()=>saveAsReport(m.text)} style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:8,background:savedReport===m.text?'rgba(197,241,53,.15)':'rgba(255,255,255,.06)',border:'none',cursor:'pointer',color:savedReport===m.text?G:'#aaa',fontSize:13,fontFamily:"'DM Sans',sans-serif",transition:'.15s'}}>
                  <span style={{fontSize:14}}>{savedReport===m.text ? '✓' : '🗂'}</span>
                  <span>{savedReport===m.text ? 'Saved!' : 'Report'}</span>
                </button>
              </div>
            )}
          </div>
        ))}
        {thinking && (
          <div style={{maxWidth:'88%',padding:'13px 15px',borderRadius:16,background:CARD,border:`1px solid ${BORDER}`,borderBottomLeftRadius:3,alignSelf:'flex-start'}}>
            {[0,.2,.4].map((d,i) => (
              <span key={i} style={{display:'inline-block',width:7,height:7,borderRadius:'50%',background:G,margin:'0 2px',animation:'pulse 1.2s infinite',animationDelay:`${d}s`}}/>
            ))}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Pending image preview */}
      {pendingImage && (
        <div style={{padding:'8px 16px 0',flexShrink:0}}>
          <div style={{position:'relative',display:'inline-block'}}>
            <img src={pendingImage.previewUrl} alt="pending" style={{height:72,borderRadius:10,border:`1px solid ${BORDER}`,display:'block'}}/>
            <button onClick={removePendingImage} style={{position:'absolute',top:-6,right:-6,width:20,height:20,borderRadius:'50%',background:'#ff5555',border:'none',cursor:'pointer',color:'#fff',fontSize:14,fontWeight:700,lineHeight:'20px',textAlign:'center'}}>×</button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div style={{padding:'10px 16px 14px',display:'flex',gap:8,alignItems:'flex-end',borderTop:`1px solid ${BORDER}`,background:'#000',flexShrink:0}}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} style={{display:'none'}}/>
        <button onClick={()=>fileRef.current?.click()} style={{width:42,height:42,borderRadius:10,background:CARD,border:`1px solid ${pendingImage?G:BORDER}`,cursor:'pointer',fontSize:18,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',color:pendingImage?G:'#888'}}>
          📎
        </button>
        <textarea ref={inputRef} value={input}
          onChange={e=>{ setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,120)+'px' }}
          onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()} }}
          placeholder="Ask anything or log data..." rows={1}
          style={{flex:1,background:CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:'10px 14px',fontSize:16,color:'#fff',fontFamily:"'DM Sans',sans-serif",resize:'none',outline:'none',maxHeight:120,lineHeight:1.5,minWidth:0}}
        />
        <button onClick={send} style={{width:42,height:42,borderRadius:10,background:G,border:'none',cursor:'pointer',fontSize:18,fontWeight:700,color:'#000',flexShrink:0}}>↑</button>
      </div>
    </div>
  )
}
