import { useState, useRef, useEffect } from 'react'
import { fetchCoachMessages, insertCoachMessage, clearCoachMessages } from '../lib/supabase'

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
- Night 2 (Mar 18): deep 9min / 2%, sleep score 75, resting HR 69 bpm, HRV 22ms. Subjective: quieter mind, fewer anxious thoughts.
- Night 3 (Mar 19): deep 41min / 11%, sleep score 74, resting HR 66 bpm, HRV 22ms, latency 7min. Woke rested at 5am.
- Night 4 (Mar 20): deep 40min / 10%, sleep score 81, total 6h45m, REM 1h40m (25%), resting HR 68 bpm (avg 76), HRV avg 21ms max 40ms, efficiency 91%.
- Night 5 (Mar 21): deep 9min / 2%, sleep score 75, total 6h3m, REM 1h23m (23%), resting HR 71 bpm (avg 78), HRV avg 16ms max 26ms, latency 16min. Late bedtime + heavy high-fat meal that night.
- Night 6 (Mar 22): deep 27min / 7%, sleep score 75, resting HR 68 bpm, HRV avg 25ms max 37ms. Oura readiness 65, activity 89.

RESTING HR CONTEXT: Carlos's pre-medication baseline is 58–62 bpm during sleep. Current readings at 68–71 bpm are elevated above his personal baseline. Primary driver is likely Retatrutide glucagon chronotropy. Monitor trend. If daytime HR consistently above 80 bpm, discuss bisoprolol 2.5mg with Dr. Anton at April 5 appointment.

BLOOD PRESSURE (Mar 21 morning): 118/75 mmHg, pulse 70 bpm — WHO optimal.

BODY COMPOSITION (Mar 16, standard mode): weight 78.7kg, body fat 26%, muscle mass 55.3kg, visceral fat 8. Goal: sub-20% BF, 75–76kg target weight.

LABS: ApoB 82 mg/dL (good), fasting insulin 4.2 µIU/mL (good), homocysteine 11.2 µmol/L (elevated — methylated B-complex is addressing this), GGT 22 U/L (good), Vitamin D3 114.7 ng/mL (supraphysiologic — K2 2 caps daily is protective). Pending: CRP, HbA1c, transferrin saturation.

PSYCHIATRIST: Dr. Anton, Домой Линник SPB, F40.2 diagnosis. Next appointment approximately April 5, 2026. Contact via Telegram.

INTELLECTUAL FRAMEWORK: Mechanism-first. LDL alone does not equal CVD. Inflammation and insulin resistance are root causes. Priority biomarkers: ApoB, oxidized LDL, CRP, homocysteine, fasting insulin, HRV, deep sleep %. Medication is last-line not first-line. Individual physiology overrides population epidemiology.`

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

export default function Coach() {
  const [msgs, setMsgs]             = useState([INITIAL_MSG])
  const [input, setInput]           = useState('')
  const [thinking, setThinking]     = useState(false)
  const [loading, setLoading]       = useState(true)
  const [images, setImages]         = useState([])
  const [lastFailed, setLastFailed] = useState(null)
  const bottomRef                   = useRef(null)
  const inputRef                    = useRef(null)
  const fileRef                     = useRef(null)

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
      setMsgs(prev => [...prev, { role: 'ai', text: aiText }])
      await insertCoachMessage('ai', aiText)
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

  const handleClearHistory = async () => {
    await clearCoachMessages()
    setMsgs([INITIAL_MSG])
  }

  const copyMsg = (text) => {
    navigator.clipboard.writeText(text).catch(() => {})
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
            {m.role === 'ai' && !m.isError && (
              <div style={s.msgActions}>
                <button onClick={() => copyMsg(m.text)} style={s.actionBtn}>Copy</button>
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
  msgActions: { display: 'flex', gap: 8, marginTop: 4, paddingLeft: 4 },
  actionBtn:  { background: 'none', border: 'none', color: '#4a5568', fontSize: 11, cursor: 'pointer', padding: '2px 6px', borderRadius: 6 },
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
