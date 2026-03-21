import { useState, useRef, useEffect } from 'react'

const G='#c5f135', CARD='#1e2128', BORDER='#2a2e38'

const INITIAL_MSG = { role:'ai', text:"I'm your iHeal AI Coach. Share anything — Oura data, RENPHO scans, lab results, food photos, or questions. I have your full health context." }

const SYSTEM = `You are Carlos's personal AI health coach inside iHeal. Carlos is Spanish, 45 years old, entrepreneur based in Saint Petersburg, Russia. Wife: Katya (born 14 April 1994). Daughter: Mira (6 months old, sleeping in parents' room — contributed to sleep disruption over past 6+ months).

CURRENT PROTOCOL:
- Retatrutide 1mg subQ weekly (Monday, after food). Triple GLP-1/GIP/glucagon agonist. Fat loss + appetite suppression primary. Strong effect at 1mg — dose fixed, do not escalate. Glucagon component causes mild chronotropic effect (raises HR) — structural and dose-dependent.
- Epitalon 2mg subQ nightly, 30–60 min before bed. Pineal peptide, supports natural melatonin.
- Trazodone (Триттико) titrating: wk1 50mg (Mar 17–23), wk2 100mg (from Mar 24), wk3 150mg. All at 21:00. Prescribed by Dr. Anton for F40.2. Watch avg sleep HR as dose increases — if consistently above 78–80 bpm, flag to Dr. Anton before moving to 150mg.
- Etifoxine (Стрезам) 50mg × 3 daily: 09:00, 14:00, 17:00. Non-benzo GABA modulator.
- AOD-9604: removed.

SUPPLEMENTS:
- Vitamin C 900–1800mg on waking
- Magnesium Citrate 400mg morning (supports cardiac rhythm)
- B-Complex Methylated morning (addresses homocysteine 11.2)
- Vitamin K2 MK-7 2 caps daily (protective given high D3)
- Vitamin D3 10,000 IU 4×/wk
- DHEA 100mg daily
- Magnesium Bisglycinate + B6 evening (supports cardiac rhythm)

DIET: Carnivore-based + one potato at dinner. Targets: 1,950 kcal, 150–170g protein, 110–120g fat, 50–70g carbs. High dietary fat late at night suppresses deep sleep architecture.

SLEEP LOG (deep sleep % / score each night):
- Mar 9: 6% / 70 | Mar 10: 10% / 76 | Mar 11: 7% / 73 | Mar 12: 13% / 78 | Mar 13: 7% / 72
- Mar 17 Trazodone night 1: 3% / 76 | Mar 18 night 2: 2% / 75 | Mar 19 night 3: 11% / 74
- Mar 20 night 4: 10% / 81 — deep 40min, REM 1h40m (25%), resting HR 68, avg HR 76, HRV 21ms max 40ms, efficiency 91%. Best score of period.
- Mar 21 night 5: 2% / 72 — deep 9min, REM 1h23m (23%), resting HR 71, avg HR 78, HRV 16ms max 26ms, efficiency 90%. Suppression explained by later bedtime + heavy late meal (167g fat). Not regression. Subjective: woke feeling rested.

MORNING ERECTIONS: Returning and increasing in intensity since starting protocol — positive clinical sign (nocturnal penile tumescence driven by REM + testosterone recovery).

HEART RATE ANALYSIS:
- Avg sleep HR trending up: night 4 = 76 bpm, night 5 = 78 bpm
- Daytime resting HR (Mar 21 morning): 70 bpm — normal
- Primary driver: Retatrutide glucagon chronotropy (structural, dose-dependent)
- Secondary: Trazodone contributes to avg HR elevation during lighter sleep stages
- Strategy: keep Retatrutide at 1mg, monitor HR through Trazodone titration. If daytime resting HR consistently >80 bpm, discuss bisoprolol 2.5mg with Dr. Anton at Apr 5 appointment.

BLOOD PRESSURE (Mar 21 morning): 118/75 mmHg, pulse 70 bpm — WHO optimal green zone.

BODY COMPOSITION (Mar 16): 78.7kg, 26% BF, muscle 55.3kg, visceral fat 8. Goal: sub-20% BF, 75–76kg.

LABS: ApoB 82 (ok <90), fasting insulin 4.2 (ok <10), homocysteine 11.2 (elevated >10 — B-complex addresses), GGT 22 (ok <30), D3 114.7 ng/mL (high, range 40-80 — K2 2 caps protective). Pending: CRP, HbA1c, transferrin saturation.

MACROS LOG: Mar 14: 1820 kcal / 178g protein | Mar 15: 1955 / 182g | Mar 16: 1781 / 184g | Mar 17: 1955 / 182g | Mar 19: 1885 / 199g | Mar 21: 2596 / 179g (over target — late food order, high fat)

PSYCHIATRIST: Dr. Anton, Домой Линник SPB, 8-952-244-18-27, F40.2. Next appointment ~5 April 2026. Contact via Telegram.

INTELLECTUAL FRAMEWORK: Mechanism-first. LDL alone ≠ CVD. Inflammation + insulin resistance are root causes. Priority biomarkers: ApoB, oxidised LDL, CRP, homocysteine, fasting insulin, HRV, deep sleep %. Medication is last-line not first-line.

APP STRUCTURE: Home (sleep/nutrition trends, protocol tap-through), Protocol (peptides/meds/supplements checklist), AI Coach (this chat), Profile (body composition, labs, recommended next labs), Reports (generate clinical reports), Settings (personal data, goals, doctor info).

When the user shares a photo, analyze it carefully and extract all relevant health data visible. For Oura screenshots extract sleep scores, deep sleep %, REM %, HR, HRV. For RENPHO scans extract weight, body fat %, muscle mass, visceral fat. For food photos estimate calories, protein, fat, carbs. For lab results extract all values and flag anything out of range.

Be precise, mechanistic, warm and direct. No generic health advice. Max 150 words unless detailed analysis requested.`

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function renderText(text) {
  return text.split('\n').map((line, i) => {
    if (line.match(/^[-•*]\s/)) return (
      <div key={i} style={{display:'flex',gap:8,marginTop:5}}>
        <span style={{color:G,flexShrink:0}}>•</span>
        <span>{renderInline(line.replace(/^[-•*]\s/,''))}</span>
      </div>
    )
    if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\./)[1]
      return (
        <div key={i} style={{display:'flex',gap:8,marginTop:5}}>
          <span style={{color:G,flexShrink:0,minWidth:18}}>{num}.</span>
          <span>{renderInline(line.replace(/^\d+\.\s/,''))}</span>
        </div>
      )
    }
    if (line.trim()==='') return <div key={i} style={{height:8}}/>
    return <div key={i} style={{marginTop:i===0?0:3}}>{renderInline(line)}</div>
  })
}

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{color:'#fff',fontWeight:600}}>{part.slice(2,-2)}</strong>
    return <span key={i}>{part}</span>
  })
}

export default function Coach() {
  const [msgs, setMsgs] = useState(() => {
    try { const s = localStorage.getItem('iheal_chat'); return s ? JSON.parse(s) : [INITIAL_MSG] }
    catch { return [INITIAL_MSG] }
  })
  const [input, setInput]           = useState('')
  const [thinking, setThinking]     = useState(false)
  const [pendingImage, setPendingImage] = useState(null) // {base64, mimeType, previewUrl}
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
      const previewUrl = URL.createObjectURL(file)
      setPendingImage({ base64, mimeType: file.type, previewUrl })
    } catch {}
    e.target.value = '' // allow re-selecting same file
  }

  const removePendingImage = () => {
    if (pendingImage?.previewUrl) URL.revokeObjectURL(pendingImage.previewUrl)
    setPendingImage(null)
  }

  const send = async () => {
    const text = input.trim()
    if (!text && !pendingImage) return
    if (thinking) return

    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'

    // Display message for the UI (stores preview URL for display only)
    const displayMsg = {
      role: 'user',
      text: text || '(photo)',
      imagePreview: pendingImage?.previewUrl || null,
    }

    // Build the content for this specific message to send to the API.
    // For image messages: array with image block + text block.
    // For text-only messages: plain string.
    let currentMsgApiContent
    if (pendingImage) {
      currentMsgApiContent = [
        {
          type: 'image',
          source: { type: 'base64', media_type: pendingImage.mimeType, data: pendingImage.base64 },
        },
        {
          type: 'text',
          text: text || 'Please analyze this image and extract all relevant health data.',
        },
      ]
    } else {
      currentMsgApiContent = text
    }

    // Capture image ref before clearing state, so we can revoke after send
    const imageToRevoke = pendingImage?.previewUrl
    setPendingImage(null)

    // Add user message to display history
    const newDisplayMsgs = [...msgs, displayMsg]
    setMsgs(newDisplayMsgs)
    setThinking(true)

    try {
      // Build API messages array:
      // - All previous messages: sent as plain text (images already consumed by API in prior turn)
      // - Current message (last in newDisplayMsgs): sent with full image content
      const apiMessages = newDisplayMsgs.map((m, idx) => {
        const isCurrentMsg = idx === newDisplayMsgs.length - 1
        if (isCurrentMsg && m.role === 'user') {
          // Use the full content including image for the current message
          return { role: 'user', content: currentMsgApiContent }
        }
        // For all prior messages, send text only
        const textContent = m.imagePreview
          ? (m.text === '(photo)' ? 'I shared a photo.' : m.text + ' (photo shared)')
          : m.text
        return { role: m.role === 'ai' ? 'assistant' : 'user', content: textContent }
      })

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM,
          messages: apiMessages,
        }),
      })
      const data = await res.json()
      setMsgs(prev => [...prev, { role:'ai', text: data.content?.[0]?.text || 'Error — try again.' }])
    } catch {
      setMsgs(prev => [...prev, { role:'ai', text: 'Connection error. Try again.' }])
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
        <button onClick={clearHistory} style={{fontSize:12,color:'#555',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
          Clear history
        </button>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px',display:'flex',flexDirection:'column',gap:12,minHeight:0}}>
        {msgs.map((m,i) => (
          <div key={i} style={{
            maxWidth:'88%', padding:'13px 15px', fontSize:15, lineHeight:1.65, borderRadius:16,
            ...(m.role==='ai'
              ? {background:CARD, border:`1px solid ${BORDER}`, borderBottomLeftRadius:3, color:'#d8dce8', alignSelf:'flex-start'}
              : {background:'#2a3048', border:'1px solid #3a4060', borderBottomRightRadius:3, color:'#fff', fontWeight:500, alignSelf:'flex-end'})
          }}>
            {m.imagePreview && (
              <img src={m.imagePreview} alt="uploaded"
                style={{width:'100%',borderRadius:8,marginBottom: m.text && m.text!=='(photo)' ? 8 : 0,display:'block'}}
                onError={e=>{e.target.style.display='none'}}
              />
            )}
            {m.role==='ai'
              ? renderText(m.text)
              : m.text !== '(photo)' ? m.text : null
            }
          </div>
        ))}
        {thinking && (
          <div style={{maxWidth:'88%',padding:'13px 15px',borderRadius:16,background:CARD,border:`1px solid ${BORDER}`,borderBottomLeftRadius:3,alignSelf:'flex-start'}}>
            {[0,.2,.4].map((d,i) => (
              <span key={i} style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:G,margin:'0 2px',animation:'pulse 1.2s infinite',animationDelay:`${d}s`}}/>
            ))}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Pending image preview — shown above input bar */}
      {pendingImage && (
        <div style={{padding:'8px 16px 0',flexShrink:0}}>
          <div style={{position:'relative',display:'inline-block'}}>
            <img src={pendingImage.previewUrl} alt="pending"
              style={{height:72,borderRadius:10,border:`1px solid ${BORDER}`,display:'block'}}
            />
            <button onClick={removePendingImage} style={{
              position:'absolute',top:-6,right:-6,
              width:20,height:20,borderRadius:'50%',
              background:'#ff5555',border:'none',cursor:'pointer',
              color:'#fff',fontSize:14,fontWeight:700,lineHeight:'20px',textAlign:'center',
            }}>×</button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div style={{padding:'10px 16px 14px',display:'flex',gap:8,alignItems:'flex-end',borderTop:`1px solid ${BORDER}`,background:'#000',flexShrink:0}}>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} style={{display:'none'}}/>

        {/* Camera/photo button */}
        <button onClick={()=>fileRef.current?.click()} style={{
          width:42,height:42,borderRadius:10,background:CARD,border:`1px solid ${pendingImage?G:BORDER}`,
          cursor:'pointer',fontSize:19,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
        }}>
          📷
        </button>

        <textarea ref={inputRef} value={input}
          onChange={e=>{
            setInput(e.target.value)
            e.target.style.height='auto'
            e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'
          }}
          onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()} }}
          placeholder="Ask anything or log data..." rows={1}
          style={{flex:1,background:CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:'10px 14px',fontSize:16,color:'#fff',fontFamily:"'DM Sans',sans-serif",resize:'none',outline:'none',maxHeight:120,lineHeight:1.5,minWidth:0}}
        />

        <button onClick={send} style={{width:42,height:42,borderRadius:10,background:G,border:'none',cursor:'pointer',fontSize:18,fontWeight:700,color:'#000',flexShrink:0}}>
          ↑
        </button>
      </div>
    </div>
  )
}
