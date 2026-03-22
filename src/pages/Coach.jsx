import { useState, useRef, useEffect } from 'react'
import { fetchCoachMessages, insertCoachMessage, insertReport, insertSleepLog, insertBpLog, insertBodyComposition, upsertLabResult } from '../lib/supabase'

const GREEN  = '#c5f135'
const CARD   = '#1e2128'
const BORDER = '#2a2e38'
const TEXT2  = '#b0b4c0'

const INITIAL_MSG = { role: 'ai', text: "I'm your iHeal AI Coach. I have your full health context loaded. Share Oura screenshots, RENPHO scans, lab results, or ask anything." }

const SYSTEM = `You are Carlos's personal AI health coach inside iHeal. Carlos is Spanish, 45 years old, entrepreneur, based in Saint Petersburg, Russia.

IDENTITY AND TONE:
- Be precise, mechanistic, and direct. No generic health advice. No alarmist language (never use words like critical, urgent, immediate, emergency unless there is a genuine life-threatening situation).
- Respond as long as needed. Do not truncate analysis.
- When you do not have a data point, say so. Never invent or estimate a number you were not given.
- Always use the most recent data provided in conversation over anything in this system prompt.

CURRENT PROTOCOL:
- Retatrutide 1mg subQ weekly (Monday, after food). Started March 16, 2026. Currently week 2 (Day 14 as of March 22). Fat loss primary goal. Dose fixed at 1mg — do not escalate. Glucagon component causes mild chronotropic HR elevation — structural and dose-dependent, not a safety concern at this dose.
- Epitalon 2mg subQ nightly, 30–60 min before bed.
- Trazodone (Триттико) titrating: wk1 50mg (Mar 17–23), wk2 100mg (from Mar 24), wk3 150mg. At 21:00. Watch avg sleep HR — flag to Dr. Anton before escalating to 150mg if avg sleep HR consistently above 78–80 bpm.
- Etifoxine (Стрезам) 50mg × 3 daily: 09:00, 14:00, 17:00.

SUPPLEMENTS:
Vitamin C 900–1800mg on waking | Magnesium Citrate 400mg morning | B-Complex Methylated morning | Vitamin K2 MK-7 2 caps daily | Vitamin D3 10,000 IU 4×/week | DHEA 100mg daily | Magnesium Bisglycinate + B6 evening.

DIET: Carnivore-based + one potato at dinner. Targets: 1,950 kcal, 150–170g protein, 110–120g fat, 50–70g carbs.

SLEEP BASELINE (pre-Trazodone):
Resting HR during sleep: 58–62 bpm. HRV range: 24–34ms. Deep sleep ranged 6–13% across March 9–16.

COMPLETE SLEEP LOG (Trazodone nights):
- Night 1 (Mar 17): deep 14min / 3%, resting HR 66 bpm, HRV 28ms
- Night 2 (Mar 18): deep 9min / 2%, sleep score 75, resting HR 69 bpm, HRV 22ms
- Night 3 (Mar 19): deep 41min / 11%, sleep score 74, resting HR 66 bpm, HRV 22ms
- Night 4 (Mar 20): deep 40min / 10%, sleep score 81, resting HR 68 bpm, HRV avg 21ms max 40ms
- Night 5 (Mar 21): deep 9min / 2%, sleep score 75, resting HR 71 bpm, HRV avg 16ms max 26ms
- Night 6 (Mar 22): deep 27min / 7%, sleep score 75, resting HR 68 bpm, HRV avg 25ms max 37ms

RESTING HR CONTEXT: Baseline 58–62 bpm. Current 68–71 bpm elevated. Primary driver: Retatrutide glucagon chronotropy.

BLOOD PRESSURE (Mar 21): 118/75 mmHg, pulse 70 bpm.

BODY COMPOSITION (Mar 16): weight 78.7kg, body fat 26%, muscle 55.3kg, visceral fat 8. Goal: sub-20% BF, 75–76kg.

LABS: ApoB 82, fasting insulin 4.2, homocysteine 11.2 (elevated), GGT 22, Vitamin D3 114.7 (high). Pending: CRP, HbA1c, transferrin saturation.

PSYCHIATRIST: Dr. Anton, Домой Линник SPB, F40.2. Next appointment ~April 5, 2026.

INTELLECTUAL FRAMEWORK: Mechanism-first. Priority biomarkers: ApoB, oxidized LDL, CRP, homocysteine, fasting insulin, HRV, deep sleep %.`

// Extraction prompt — sent after every AI response to detect and extract health data
const EXTRACTION_PROMPT = `You are a health data extractor. Analyze the conversation and extract any NEW health data that was just shared by the user (in their most recent message or photo).

Return ONLY a JSON object. No explanation, no markdown, no code fences. Just raw JSON.

If no new health data was shared, return: {"none": true}

Otherwise return any combination of these fields that have new data:

{
  "sleep": {
    "date": "YYYY-MM-DD",
    "deep_min": number,
    "deep_pct": number,
    "score": number,
    "resting_hr": number,
    "hrv_ms": number,
    "hrv_max_ms": number,
    "total_min": number,
    "rem_min": number,
    "rem_pct": number,
    "efficiency_pct": number,
    "latency_min": number
  },
  "bp": {
    "date": "YYYY-MM-DD",
    "systolic": number,
    "diastolic": number,
    "pulse": number
  },
  "body": {
    "date": "YYYY-MM-DD",
    "weight_kg": number,
    "body_fat_pct": number,
    "muscle_mass_kg": number,
    "visceral_fat": number
  },
  "labs": [
    {"name": "string", "value": "string", "unit": "string", "status": "ok|warn|high|low"}
  ]
}

Only include fields where you have actual data from the conversation. Do not include fields you are guessing or inferring. Use today's date if no date is specified.`

function renderText(text) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    if (line.match(/^#{1,3}\s/)) {
      const content = line.replace(/^#{1,3}\s/, '')
      return <div key={i} style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginTop: 10, marginBottom: 2 }}>{renderInline(content)}</div>
    }
    if (line.match(/^[-•*]\s/)) {
      return (
        <div key={i} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <span style={{ color: GREEN, flexShrink: 0, marginTop: 1 }}>•</span>
          <span>{renderInline(line.replace(/^[-•*]\s/, ''))}</span>
        </div>
      )
    }
    if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\.\s/)[1]
      return (
        <div key={i} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <span style={{ color: GREEN, flexShrink: 0, minWidth: 16 }}>{num}.</span>
          <span>{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      )
    }
    if (line.trim() === '') return <div key={i} style={{ height: 6 }} />
    return <div key={i} style={{ marginTop: i === 0 ? 0 : 2 }}>{renderInline(line)}</div>
  })
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#fff', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function extractAndSave(conversationMessages, attachedImages) {
  try {
    // Build messages for extraction — include the last user message with images if any
    const lastUserMsg = conversationMessages[conversationMessages.length - 1]
    const extractMessages = []

    // Include last few messages for context
    const recentMsgs = conversationMessages.slice(-4)
    for (let i = 0; i < recentMsgs.length; i++) {
      const m = recentMsgs[i]
      const isLast = i === recentMsgs.length - 1
      if (isLast && m.role === 'user' && attachedImages?.length > 0) {
        const parts = attachedImages.map(img => ({
          type: 'image',
          source: { type: 'base64', media_type: img.mediaType, data: img.base64 }
        }))
        parts.push({ type: 'text', text: m.text || 'See attached images' })
        extractMessages.push({ role: 'user', content: parts })
      } else {
        extractMessages.push({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })
      }
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: EXTRACTION_PROMPT,
        messages: extractMessages,
      }),
    })
    const data = await res.json()
    const raw = data.content?.[0]?.text?.trim()
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (parsed.none) return null

    const saved = []

    if (parsed.sleep && parsed.sleep.date) {
      await insertSleepLog(parsed.sleep)
      saved.push('sleep data')
    }
    if (parsed.bp && parsed.bp.date) {
      await insertBpLog(parsed.bp)
      saved.push('blood pressure')
    }
    if (parsed.body && parsed.body.date) {
      await insertBodyComposition(parsed.body)
      saved.push('body composition')
    }
    if (parsed.labs && parsed.labs.length > 0) {
      for (const lab of parsed.labs) {
        await upsertLabResult(lab)
      }
      saved.push('lab results')
    }

    return saved.length > 0 ? saved : null
  } catch {
    return null
  }
}

const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
)
const IconShare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
)
const IconReport = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)

export default function Coach() {
  const [msgs, setMsgs]               = useState([INITIAL_MSG])
  const [input, setInput]             = useState('')
  const [thinking, setThinking]       = useState(false)
  const [loading, setLoading]         = useState(true)
  const [images, setImages]           = useState([])
  const [lastFailed, setLastFailed]   = useState(null)
  const [savedMsgId, setSavedMsgId]   = useState(null)
  const [copiedMsgId, setCopiedMsgId] = useState(null)
  const [savedData, setSavedData]     = useState(null) // {idx, labels}
  const bottomRef                     = useRef(null)
  const inputRef                      = useRef(null)
  const fileRef                       = useRef(null)

  useEffect(() => {
    fetchCoachMessages().then(rows => {
      if (rows.length > 0) {
        setMsgs(rows.map(r => ({ role: r.role, text: r.text })))
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, thinking])

  const handleFiles = async (files) => {
    const selected = Array.from(files).slice(0, 10)
    const processed = await Promise.all(selected.map(async (file) => ({
      base64: await fileToBase64(file),
      mediaType: file.type,
      name: file.name,
    })))
    setImages(prev => [...prev, ...processed])
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const buildContent = (text, imgs) => {
    if (!imgs || imgs.length === 0) return text
    const parts = imgs.map(img => ({
      type: 'image',
      source: { type: 'base64', media_type: img.mediaType, data: img.base64 }
    }))
    if (text) parts.push({ type: 'text', text })
    return parts
  }

  const sendPayload = async (msgHistory, attachedImages) => {
    setThinking(true)
    setLastFailed(null)
    try {
      const apiMessages = msgHistory.map((m, i) => {
        if (i === msgHistory.length - 1 && m.role === 'user' && attachedImages?.length > 0) {
          return { role: 'user', content: buildContent(m.text, attachedImages) }
        }
        return { role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }
      })

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: SYSTEM,
          messages: apiMessages,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'API error')
      const aiText = data.content?.[0]?.text || 'Error — try again.'
      const newMsgIdx = msgHistory.length // index of the AI response about to be added

      setMsgs(prev => [...prev, { role: 'ai', text: aiText }])
      await insertCoachMessage('ai', aiText)

      // Run data extraction in background — don't await, don't block UI
      extractAndSave(msgHistory, attachedImages).then(saved => {
        if (saved) {
          setSavedData({ idx: newMsgIdx, labels: saved })
          setTimeout(() => setSavedData(null), 4000)
        }
      })
    } catch {
      setMsgs(prev => [...prev, { role: 'ai', text: 'CONNECTION_ERROR', isError: true }])
      setLastFailed({ msgHistory, attachedImages })
    }
    setThinking(false)
  }

  const send = async (retryPayload) => {
    if (retryPayload) {
      setMsgs(prev => prev.filter(m => !m.isError))
      await sendPayload(retryPayload.msgHistory, retryPayload.attachedImages)
      return
    }
    const text = input.trim()
    if ((!text && images.length === 0) || thinking) return
    const attachedImages = [...images]
    setInput('')
    setImages([])
    if (inputRef.current) inputRef.current.style.height = 'auto'
    const displayText = text || `[${attachedImages.length} photo${attachedImages.length > 1 ? 's' : ''}]`
    const newMsgs = [...msgs, { role: 'user', text: displayText }]
    setMsgs(newMsgs)
    await insertCoachMessage('user', displayText)
    await sendPayload(newMsgs, attachedImages)
  }

  const copyMsg = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMsgId(idx)
      setTimeout(() => setCopiedMsgId(null), 2000)
    } catch {}
  }

  const shareMsg = (text) => {
    if (navigator.share) {
      navigator.share({ title: 'iHeal Coach', text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  const saveAsReport = async (text, idx) => {
    const date = new Date().toISOString().slice(0, 10)
    await insertReport({
      date,
      recipient: 'AI Coach',
      language: 'English',
      content: text,
      notes: 'Saved from AI Coach conversation',
    })
    setSavedMsgId(idx)
    setTimeout(() => setSavedMsgId(null), 2000)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#000' }}>
        <span style={{ color: TEXT2, fontSize: 13 }}>Loading conversation...</span>
      </div>
    )
  }

  return (
    <div style={s.wrap}>
      <div style={s.msgs}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'ai' ? 'flex-start' : 'flex-end', maxWidth: '88%' }}>
            <div style={{ ...s.msg, ...(m.role === 'ai' ? s.msgAi : s.msgUser) }}>
              {m.isError ? (
                <div>
                  <div style={{ marginBottom: 8, color: TEXT2 }}>Connection error. Try again.</div>
                  <button onClick={() => send(lastFailed)} style={s.retryBtn}>↺ Retry</button>
                </div>
              ) : (
                m.role === 'ai' ? renderText(m.text) : m.text
              )}
            </div>

            {/* Data saved confirmation — shows briefly after extraction */}
            {m.role === 'ai' && savedData?.idx === i && (
              <div style={s.savedBadge}>
                ✓ {savedData.labels.join(' + ')} saved to your records
              </div>
            )}

            {m.role === 'ai' && !m.isError && (
              <div style={s.msgActions}>
                <button onClick={() => copyMsg(m.text, i)} style={s.actionBtn} title="Copy">
                  <IconCopy />
                  <span>{copiedMsgId === i ? 'Copied' : 'Copy'}</span>
                </button>
                <button onClick={() => shareMsg(m.text)} style={s.actionBtn} title="Share">
                  <IconShare />
                  <span>Share</span>
                </button>
                <button onClick={() => saveAsReport(m.text, i)} style={s.actionBtn} title="Save as Report">
                  <IconReport />
                  <span>{savedMsgId === i ? 'Saved!' : 'Report'}</span>
                </button>
              </div>
            )}
          </div>
        ))}
        {thinking && (
          <div style={{ ...s.msg, ...s.msgAi, alignSelf: 'flex-start' }}>
            <span style={s.dot} />
            <span style={{ ...s.dot, animationDelay: '.2s' }} />
            <span style={{ ...s.dot, animationDelay: '.4s' }} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {images.length > 0 && (
        <div style={s.imageStrip}>
          {images.map((img, i) => (
            <div key={i} style={s.imageThumb}>
              <img
                src={`data:${img.mediaType};base64,${img.base64}`}
                alt={img.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
              />
              <button onClick={() => removeImage(i)} style={s.removeImg}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={s.bar}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        <button onClick={() => fileRef.current?.click()} style={s.attachBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => {
            setInput(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
          }}
          placeholder="Ask anything or log data..."
          rows={1}
          style={s.input}
        />
        <button
          onClick={() => send()}
          style={{ ...s.sendBtn, opacity: (input.trim() || images.length > 0) && !thinking ? 1 : 0.5 }}
        >↑</button>
      </div>
    </div>
  )
}

const s = {
  wrap:       { display: 'flex', flexDirection: 'column', height: '100%', background: '#000' },
  msgs:       { flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 },
  msg:        { padding: '12px 15px', fontSize: 15, lineHeight: 1.6, borderRadius: 16 },
  msgAi:      { background: CARD, border: `1px solid ${BORDER}`, borderBottomLeftRadius: 3, color: TEXT2 },
  msgUser:    { background: GREEN, borderBottomRightRadius: 3, color: '#000', fontWeight: 500 },
  msgActions: { display: 'flex', gap: 6, marginTop: 5, paddingLeft: 2 },
  actionBtn:  { display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#6a7080', fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', padding: '4px 9px', borderRadius: 7 },
  savedBadge: { fontSize: 11, color: GREEN, fontStyle: 'italic', paddingLeft: 4, marginTop: 4, marginBottom: 2 },
  retryBtn:   { background: 'rgba(197,241,53,0.1)', border: '1px solid rgba(197,241,53,0.3)', color: GREEN, fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8, cursor: 'pointer' },
  imageStrip: { display: 'flex', gap: 8, padding: '8px 16px', overflowX: 'auto', borderTop: `1px solid ${BORDER}` },
  imageThumb: { position: 'relative', width: 56, height: 56, flexShrink: 0, borderRadius: 8, overflow: 'hidden', border: `1px solid ${BORDER}` },
  removeImg:  { position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
  bar:        { padding: '10px 16px 14px', display: 'flex', gap: 8, alignItems: 'flex-end', borderTop: `1px solid ${BORDER}`, background: '#000', flexShrink: 0 },
  attachBtn:  { width: 40, height: 40, borderRadius: 10, background: CARD, border: `1px solid ${BORDER}`, cursor: 'pointer', color: TEXT2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  input:      { flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '10px 14px', fontSize: 16, color: '#fff', fontFamily: "'DM Sans', sans-serif", resize: 'none', outline: 'none', maxHeight: 120, lineHeight: 1.5 },
  sendBtn:    { width: 40, height: 40, borderRadius: 10, background: GREEN, border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 700, color: '#000', flexShrink: 0, transition: 'opacity 0.2s' },
  dot:        { display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: GREEN, margin: '0 2px', animation: 'pulse 1.2s infinite' },
}
