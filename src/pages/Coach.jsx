import { useState, useRef, useEffect } from 'react'
import { fetchCoachMessages, insertCoachMessage, insertReport, insertSleepLog, insertBpLog, insertBodyComposition, upsertLabResult } from '../lib/supabase'

const GREEN  = '#c5f135'
const CARD   = '#1e2128'
const BORDER = '#2a2e38'
const TEXT2  = '#b0b4c0'

const INITIAL_MSG = { role: 'ai', text: "I'm your iHeal AI Coach. I have your full health context loaded. Share Oura screenshots, RENPHO scans, lab results, or ask anything." }

const SYSTEM = `You are Carlos's personal AI health coach inside iHeal. Think and respond exactly as you would in a normal Claude conversation — use your full reasoning, knowledge, and analytical capabilities without restriction. Carlos is Spanish, 45 years old, entrepreneur, based in Saint Petersburg, Russia.

You have full context on Carlos's health below. When he asks questions beyond this context — about peptides, pharmacology, research, lifestyle, anything — reason from your training knowledge exactly as you would normally. Be direct and substantive. If you are uncertain about something, say so clearly and move on. Never invent numbers or data you don't have. Never collapse or over-apologise when corrected — just fix the error and continue.

Always prioritise data Carlos shares in the conversation over anything in this prompt.

CURRENT PROTOCOL:
- Retatrutide 1mg subQ weekly (Monday, after food). Started March 16, 2026. Week 2. Fat loss primary goal. Dose fixed at 1mg. Glucagon component causes mild chronotropic HR elevation — structural, dose-dependent, not a safety concern at this dose.
- Epitalon 2mg subQ nightly, 30–60 min before bed.
- Trazodone (Триттико) titrating: wk1 50mg (Mar 17–23), wk2 100mg (from Mar 24), wk3 150mg. At 21:00. Flag to Dr. Anton before escalating to 150mg if avg sleep HR consistently above 78–80 bpm.
- Etifoxine (Стрезам) 50mg × 3 daily: 09:00, 14:00, 17:00.

SUPPLEMENTS:
Vitamin C 900–1800mg on waking | Magnesium Citrate 400mg morning | B-Complex Methylated morning | Vitamin K2 MK-7 2 caps daily | Vitamin D3 10,000 IU 4×/week | DHEA 100mg daily | Magnesium Bisglycinate + B6 evening.

DIET: Carnivore-based + one potato at dinner. Targets: 1,950 kcal, 150–170g protein, 110–120g fat, 50–70g carbs.

SLEEP BASELINE (pre-Trazodone):
Resting HR during sleep: 58–62 bpm. HRV range: 24–34ms. Deep sleep ranged 6–13% across March 9–16.

SLEEP LOG (Trazodone nights):
- Night 1 (Mar 17): deep 14min / 3%, HR 66, HRV 28ms
- Night 2 (Mar 18): deep 9min / 2%, score 75, HR 69, HRV 22ms
- Night 3 (Mar 19): deep 41min / 11%, score 74, HR 66, HRV 22ms
- Night 4 (Mar 20): deep 40min / 10%, score 81, HR 68, HRV avg 21ms max 40ms
- Night 5 (Mar 21): deep 9min / 2%, score 75, HR 71, HRV avg 16ms max 26ms
- Night 6 (Mar 22): deep 27min / 7%, score 75, HR 68, HRV avg 25ms max 37ms
- Night 7 (Mar 23): deep 38min / 9%, score 81, HR lowest 68 avg 75, HRV avg 22ms max 42ms, REM 1h39m / 24%, total 6h53m, efficiency 94%

RESTING HR CONTEXT: Baseline 58–62 bpm. Currently 68–75 bpm. Primary driver: Retatrutide glucagon chronotropy.

BODY COMPOSITION (Mar 16): weight 78.7kg, body fat 26%, muscle 55.3kg, visceral fat 8. Goal: sub-20% BF, 75–76kg.

LABS: ApoB 82, fasting insulin 4.2, homocysteine 11.2 (elevated), GGT 22, Vitamin D3 114.7 (high). Pending: CRP, HbA1c, transferrin saturation.

PSYCHIATRIST: Dr. Anton, Домой Линник SPB, F40.2. Next appointment ~April 5, 2026.`

const EXTRACTION_SYSTEM = `You are a health data extractor. Your job is to extract structured health data from a conversation.

CRITICAL: Respond with ONLY a raw JSON object. No markdown. No code fences. No explanation. No preamble. The very first character of your response must be { and the very last must be }.

If no new health data was shared by the user, respond with exactly: {"none":true}

If health data was shared, extract it into this structure (only include fields that have actual data):

{"sleep":{"date":"YYYY-MM-DD","deep_min":0,"deep_pct":0,"score":0,"resting_hr":0,"hrv_ms":0,"hrv_max_ms":0,"total_min":0,"rem_min":0,"rem_pct":0,"efficiency_pct":0,"latency_min":0},"bp":{"date":"YYYY-MM-DD","systolic":0,"diastolic":0,"pulse":0},"body":{"date":"YYYY-MM-DD","weight_kg":0,"body_fat_pct":0,"muscle_mass_kg":0,"visceral_fat":0},"labs":[{"name":"","value":"","unit":"","status":"ok"}]}

Rules:
- Only extract data the USER explicitly shared. Never infer or estimate.
- Remove any fields where the value is 0 or unknown.
- Use today's date (${new Date().toISOString().slice(0,10)}) if no date was mentioned.
- For sleep: deep_pct is the percentage (e.g. 7 not 0.07).`

function parseJSON(raw) {
  if (!raw) return null
  // Strip markdown code fences if present
  let cleaned = raw.trim()
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
  // Find first { and last }
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  cleaned = cleaned.slice(start, end + 1)
  return JSON.parse(cleaned)
}

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

function compressImage(file, maxDim = 1120, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round(height * maxDim / width); width = maxDim }
        else { width = Math.round(width * maxDim / height); height = maxDim }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      const base64 = canvas.toDataURL('image/jpeg', quality).split(',')[1]
      resolve({ base64, mediaType: 'image/jpeg', name: file.name })
    }
    img.onerror = reject
    img.src = url
  })
}

async function extractAndSave(conversationMessages, attachedImages) {
  try {
    const recentMsgs = conversationMessages.slice(-4)
    const extractMessages = recentMsgs.map((m, i) => {
      const isLast = i === recentMsgs.length - 1
      if (isLast && m.role === 'user' && attachedImages?.length > 0) {
        const parts = attachedImages.map(img => ({
          type: 'image',
          source: { type: 'base64', media_type: img.mediaType, data: img.base64 }
        }))
        parts.push({ type: 'text', text: m.text || 'See attached images' })
        return { role: 'user', content: parts }
      }
      return { role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }
    })

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        stream: false,
        system: EXTRACTION_SYSTEM,
        messages: extractMessages,
      }),
    })

    const data = await res.json()
    const raw = data.content?.[0]?.text
    console.log('[iHeal extraction raw]', raw)

    const parsed = parseJSON(raw)
    console.log('[iHeal extraction parsed]', parsed)

    if (!parsed || parsed.none) return null

    const saved = []

    if (parsed.sleep?.date) {
      // Remove zero/null fields before saving
      const sleep = Object.fromEntries(Object.entries(parsed.sleep).filter(([, v]) => v !== 0 && v !== null))
      console.log('[iHeal] saving sleep:', sleep)
      await insertSleepLog(sleep)
      saved.push('sleep data')
    }
    if (parsed.bp?.date && parsed.bp?.systolic) {
      console.log('[iHeal] saving BP:', parsed.bp)
      await insertBpLog(parsed.bp)
      saved.push('blood pressure')
    }
    if (parsed.body?.date && parsed.body?.weight_kg) {
      console.log('[iHeal] saving body comp:', parsed.body)
      await insertBodyComposition(parsed.body)
      saved.push('body composition')
    }
    if (parsed.labs?.length > 0) {
      for (const lab of parsed.labs) {
        console.log('[iHeal] saving lab:', lab)
        await upsertLabResult(lab)
      }
      saved.push('lab results')
    }

    return saved.length > 0 ? saved : null
  } catch (err) {
    console.error('[iHeal extraction error]', err)
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
  const [savedData, setSavedData]     = useState(null)
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
    const processed = await Promise.all(selected.map(file => compressImage(file)))
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

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'API error')
      }

      const newMsgIdx = msgHistory.length
      setMsgs(prev => [...prev, { role: 'ai', text: '' }])
      setThinking(false)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.delta?.text || ''
            if (delta) {
              fullText += delta
              setMsgs(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'ai', text: fullText }
                return updated
              })
            }
          } catch {}
        }
      }

      if (fullText) {
        await insertCoachMessage('ai', fullText)
        extractAndSave(msgHistory, attachedImages).then(saved => {
          if (saved) {
            setSavedData({ idx: newMsgIdx, labels: saved })
            setTimeout(() => setSavedData(null), 4000)
          }
        })
      }

    } catch {
      setThinking(false)
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
    const newMsgs = [...msgs, { role: 'user', text: displayText, images: attachedImages }]
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
              ) : m.role === 'user' ? (
                <div>
                  {m.images && m.images.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                      {m.images.map((img, ii) => (
                        <img key={ii} src={`data:${img.mediaType};base64,${img.base64}`}
                          style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} alt="" />
                      ))}
                    </div>
                  )}
                  {m.text && !m.text.startsWith('[') && <div>{m.text}</div>}
                </div>
              ) : (
                renderText(m.text)
              )}
            </div>

            {m.role === 'ai' && savedData?.idx === i && (
              <div style={s.savedBadge}>
                ✓ {savedData.labels.join(' + ')} saved to your records
              </div>
            )}

            {m.role === 'ai' && !m.isError && (
              <div style={s.msgActions}>
                <button onClick={() => copyMsg(m.text, i)} style={s.actionBtn}>
                  <IconCopy />
                  <span>{copiedMsgId === i ? 'Copied' : 'Copy'}</span>
                </button>
                <button onClick={() => shareMsg(m.text)} style={s.actionBtn}>
                  <IconShare />
                  <span>Share</span>
                </button>
                <button onClick={() => saveAsReport(m.text, i)} style={s.actionBtn}>
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
