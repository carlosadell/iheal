import { useState, useRef, useEffect } from 'react'
import { fetchCoachMessages, insertCoachMessage, insertReport, insertSleepLog, insertBpLog, insertBodyComposition, upsertLabResult, upsertProtocolItem, deactivateProtocolItem } from '../lib/supabase'

const GREEN  = '#c5f135'
const CARD   = '#1e2128'
const BORDER = '#2a2e38'
const TEXT2  = '#b0b4c0'

const INITIAL_MSG = { role: 'ai', text: "I'm your iHeal AI Coach. I have your full health context loaded. Share Oura screenshots, RENPHO scans, lab results, or ask anything." }

const SYSTEM = `You are Carlos's personal AI health coach inside iHeal. Think and respond exactly as you would in a normal Claude conversation — use your full reasoning, knowledge, and analytical capabilities without restriction. Carlos is Spanish, 45 years old, entrepreneur, based in Saint Petersburg, Russia.

You have full context on Carlos's health below. When he asks questions beyond this context — about peptides, pharmacology, research, lifestyle, anything — reason from your training knowledge exactly as you would normally. Be direct and substantive. If you are uncertain about something, say so clearly and move on. Never invent numbers or data you don't have. Never collapse or over-apologise when corrected — just fix the error and continue.

CRITICAL SAFETY RULE: Before mentioning any dosage, drug, or supplement in your response, cross-check it against the CURRENT PROTOCOL and SUPPLEMENTS sections below. Never contradict or undermine a dosage that is already established in the protocol. If you have concerns about a dose, flag them clearly but do not state incorrect doses as fact.

Always prioritise data Carlos shares in the conversation over anything in this prompt.

CURRENT PROTOCOL:
- Retatrutide 1mg subQ weekly (Monday, after food). Started March 16, 2026. Now week 3. Fat loss primary goal. Dose fixed at 1mg — do not suggest escalation until at least 6–8 weeks at 1mg. Glucagon component causes mild chronotropic HR elevation — structural, dose-dependent, not a safety concern at this dose.
- Epitalon: tapering off due to limited vial supply. Taper plan: 1.5mg → 1mg (2 nights) → 0.5mg (1 night) → stop. Do not suggest restarting unless Carlos explicitly asks.
- Trazodone (Триттико): wk1 50mg (Mar 17–23), wk2 trialled 100mg but caused fragmented sleep, morning headaches, and elevated HR — reverted to 50mg from Mar 25. Currently on 50mg. Do NOT suggest escalating to 100mg or 150mg without explicit instruction from Dr. Anton. 75mg may be worth trialling after sleep fully stabilises at 50mg.
- Etifoxine (Стрезам) 50mg × 3 daily: 09:00, 14:00, 17:00.

SUPPLEMENTS:
Vitamin C 900–1800mg on waking | Magnesium Citrate 400mg morning | B-Complex Methylated morning | Vitamin K2 MK-7 2 caps daily | Vitamin D3 10,000 IU 4×/week | DHEA 100mg daily | Magnesium Bisglycinate + B6 evening.

DIET: Carnivore-based + one potato at dinner. Targets: 1,950 kcal, 150–170g protein, 110–120g fat, 50–70g carbs.

SLEEP BASELINE (pre-Trazodone):
Resting HR during sleep: 58–62 bpm. HRV range: 24–34ms. Deep sleep ranged 6–13% across March 9–16.

COMPLETE SLEEP LOG (Trazodone nights):
- Night 1 (Mar 17): 50mg, deep 14min/3%, resting HR 66, HRV 28ms, score 76
- Night 2 (Mar 18): 50mg, deep 9min/2%, resting HR 69, HRV 22ms, score 75
- Night 3 (Mar 19): 50mg, deep 41min/11%, resting HR 66, HRV 22ms, score 74
- Night 4 (Mar 20): 50mg, deep 40min/10%, resting HR 68, HRV avg 21ms max 40ms, score 81
- Night 5 (Mar 21): 50mg, deep 9min/2%, resting HR 71, HRV avg 16ms max 26ms, score 75
- Night 6 (Mar 22): 50mg, deep 27min/7%, resting HR 68, HRV avg 25ms max 37ms, score 75
- Night 7 (Mar 23): 50mg, deep 38min/9%, resting HR 68, avg HR 75, HRV avg 22ms max 42ms, score 81
- Night 8 (Mar 24): 100mg, deep 38min/9%, resting HR 68, HRV 22ms, score 77
- Night 9 (Mar 25): deep 22min/5%, resting HR 69, avg HR 77, HRV avg 20ms max 40ms, score 76
- Night 10 (Mar 26): deep 74min/20%, resting HR 68, avg HR 74, HRV avg 26ms max 45ms, score 78
- Night 11 (Mar 28): late bedtime 23:52, deep 33min/10%, resting HR 69, avg HR 79, HRV avg 22ms max 44ms, score 68
- Night 12 (Mar 29): 25mg only, deep 64min/15%, resting HR 67, avg HR 74, HRV avg 30ms max 48ms, score 83 — best night of protocol
- Night 13 (Mar 30): deep 62min/15%, resting HR 66, avg HR 74, HRV avg 30ms max 57ms, score 79, bedtime 21:57
KEY PATTERNS: Early bedtime before 22:30 produces deep sleep 15%+ and resting HR closer to baseline 58-62 bpm. Lowest dose 25mg produced best night. Resting HR trending down toward baseline. HRV max 57ms on Night 13 is highest of entire protocol.

CLINICAL OBSERVATIONS:
- 100mg Trazodone clearly disrupted sleep — fragmented architecture, morning headaches, elevated HR. Reverted to 50mg.
- Night 10 at 50mg showed dramatic improvement: 20% deep sleep, best HRV since baseline. 50mg appears to be the effective dose for now.
- Resting HR elevated at 68–74 bpm vs baseline 58–62 bpm. Primary driver: Retatrutide glucagon chronotropy. This suppresses readiness scores. Without Retatrutide HR effect, readiness would likely be 80+.
- Early wake times (05:00–05:30) appearing consistently — may be emerging as natural rhythm.
- Morning headaches on 100mg Trazodone resolved on return to 50mg.

RESTING HR CONTEXT: Baseline 58–62 bpm. Currently 68–74 bpm. Primary driver: Retatrutide. Not a safety concern at 1mg dose.

BODY COMPOSITION: First measurement Mar 9 at 79.10kg. Current Mar 31 at 77.20kg. Loss 1.9kg over 22 days. Goal sub-20% BF. Retatrutide started March 2, 2026.

LABS: ApoB 82, fasting insulin 4.2, homocysteine 11.2 (elevated), GGT 22, Vitamin D3 114.7 (high). Pending: CRP, HbA1c, transferrin saturation.

PSYCHIATRIST: Dr. Anton, Домой Линник SPB, F40.2. Next appointment ~April 5, 2026.

iHEAL APP STRUCTURE:
You live inside the iHeal app. Understanding the app helps you guide Carlos to the right place and explain where his data goes.
- HOME: Dashboard showing last night's sleep score, deep sleep chart, an AI-generated daily summary (from your conversations), and a link to the Protocol page. Sleep data, body composition, labs, and BP all display here.
- PROTOCOL: A read-only reference list of Carlos's current peptides, medications, and supplements — with dosage, timing, and instructions. This page is powered by the protocol_items table in the database. When Carlos tells you he's starting, stopping, or changing a medication/supplement/peptide, you can update this page automatically through the extraction system. Tell him "I've updated your Protocol page" when you do.
- AI COACH (this chat): Where Carlos talks to you. You can extract and save sleep logs, body composition, blood pressure, lab results, and protocol updates from the conversation. Data you extract appears on the Home page and Protocol page.
- PROFILE: Carlos's personal info, health goals, doctor details, and recommended labs.
- SETTINGS: App preferences and goal configuration.

When Carlos shares health data (Oura screenshots, RENPHO scans, labs, BP readings), you extract it and it flows to the relevant pages automatically. If he asks "where can I see my sleep data?" point him to Home. If he asks about his medications, point him to Protocol. If he tells you about a dosage change, confirm you've updated Protocol.`

const EXTRACTION_SYSTEM = `You are a health data extractor. Your job is to extract structured health data from a conversation.

CRITICAL: Respond with ONLY a raw JSON object. No markdown. No code fences. No explanation. No preamble. The very first character of your response must be { and the very last must be }.

If no new health data was shared by the user, respond with exactly: {"none":true}

If health data was shared, extract it into this structure (only include fields that have actual data):

{"sleep":{"date":"YYYY-MM-DD","deep_min":0,"deep_pct":0,"score":0,"resting_hr":0,"hrv_ms":0,"hrv_max_ms":0,"total_min":0,"rem_min":0,"rem_pct":0,"efficiency_pct":0,"latency_min":0},"bp":{"date":"YYYY-MM-DD","systolic":0,"diastolic":0,"pulse":0},"body":{"date":"YYYY-MM-DD","weight_kg":0,"body_fat_pct":0,"muscle_mass_kg":0,"visceral_fat":0},"labs":[{"name":"","value":"","unit":"","status":"ok"}],"protocol_updates":[{"action":"add|update|remove","key":"unique_key","category":"peptide|medication|supplement","name":"Name","dosage":"dose info","timing":"when to take","instructions":"how to take","icon":"emoji"}]}

Rules:
- Only extract data the USER explicitly shared. Never infer or estimate.
- Remove any fields where the value is 0 or unknown.
- Use today's date (${new Date().toISOString().slice(0,10)}) if no date was mentioned.
- For sleep: deep_pct is the percentage (e.g. 7 not 0.07).
- For protocol updates: "add" creates a new item, "update" modifies an existing one, "remove" deactivates it. Only extract protocol changes when the user explicitly says they're starting, stopping, or changing a medication/supplement/peptide.
- IMPORTANT for "update" actions: include ALL fields with their complete values, not just the changed field. Preserve the full name (including translations like "Триттико"), detailed instructions, timing, etc. Only change the field the user actually modified. If the user says "I now take 25mg Trazodone", the update should still include the full name "Trazodone (Триттико)", the existing timing "Before bed", and the existing detailed instructions — only changing dosage to "25mg".`

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

async function compressAndEncode(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 800
      const scale = Math.min(1, MAX / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1])
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
    if (parsed.protocol_updates?.length > 0) {
      for (const update of parsed.protocol_updates) {
        if (update.action === 'remove') {
          await deactivateProtocolItem(update.key)
        } else {
          // Merge with existing item so partial updates don't blank out fields
          const existing = (protocolItems || []).find(p => p.key === update.key) || {}
          await upsertProtocolItem({
            key: update.key,
            category: update.category || existing.category || 'supplement',
            name: update.name || existing.name || '',
            dosage: update.dosage || existing.dosage || '',
            timing: update.timing || existing.timing || '',
            instructions: update.instructions || existing.instructions || '',
            icon: update.icon || existing.icon || '💊',
            active: true,
            sort_order: existing.sort_order || (update.category === 'peptide' ? 10 : update.category === 'medication' ? 20 : 30),
          })
        }
        console.log('[iHeal] protocol update:', update.action, update.key)
      }
      saved.push('protocol')
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

function buildLiveDataContext(sleepLogs, bodyComp, labResults, bpLogs) {
  const parts = []

  if (sleepLogs?.length > 0) {
    const recent = sleepLogs.slice(-14)
    parts.push('LIVE SLEEP DATA (from Supabase, last ' + recent.length + ' nights):')
    recent.forEach(s => {
      const fields = [`date: ${s.date}`, `deep: ${s.deep_min}min/${s.deep_pct}%`]
      if (s.rem_min != null || s.rem_pct != null) fields.push(`REM: ${s.rem_min ?? '?'}min/${s.rem_pct ?? '?'}%`)
      if (s.score != null) fields.push(`score: ${s.score}`)
      if (s.resting_hr != null) fields.push(`HR: ${s.resting_hr}bpm`)
      if (s.hrv_ms != null) fields.push(`HRV: ${s.hrv_ms}ms`)
      if (s.hrv_max_ms != null) fields.push(`HRV max: ${s.hrv_max_ms}ms`)
      if (s.total_min != null) fields.push(`total: ${s.total_min}min`)
      if (s.efficiency_pct != null) fields.push(`eff: ${s.efficiency_pct}%`)
      if (s.notes) fields.push(`notes: ${s.notes}`)
      parts.push('  ' + fields.join(' | '))
    })
  }

  if (bodyComp?.length > 0) {
    const latest = bodyComp[bodyComp.length - 1]
    parts.push(`\nLATEST BODY COMPOSITION (${latest.date}): weight ${latest.weight_kg}kg, body fat ${latest.body_fat_pct}%, muscle ${latest.muscle_mass_kg}kg, visceral fat ${latest.visceral_fat}`)
  }

  if (labResults?.length > 0) {
    parts.push('\nLAB RESULTS:')
    labResults.forEach(l => {
      parts.push(`  ${l.name}: ${l.value} ${l.unit || ''} (${l.status || 'ok'})`)
    })
  }

  if (bpLogs?.length > 0) {
    const recent = bpLogs.slice(0, 5)
    parts.push('\nRECENT BP:')
    recent.forEach(b => {
      parts.push(`  ${b.date}: ${b.systolic}/${b.diastolic} pulse ${b.pulse}`)
    })
  }

  return parts.length > 0 ? '\n\n--- LIVE DATABASE (auto-updated) ---\n' + parts.join('\n') : ''
}

export default function Coach({ refreshSleep, refreshBody, refreshBp, refreshLabs, refreshProtocolItems, protocolItems, sleepLogs, bodyComp, labResults, bpLogs }) {
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
    const processed = await Promise.all(selected.map(async (file) => ({
      base64: await compressAndEncode(file),
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
      // Only send last 20 messages to API to stay within context limits
      const recentHistory = msgHistory.slice(-20)
      const apiMessages = recentHistory.map((m, i) => {
        if (i === recentHistory.length - 1 && m.role === 'user' && attachedImages?.length > 0) {
          return { role: 'user', content: buildContent(m.text, attachedImages) }
        }
        return { role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }
      })
      // Ensure first message is always from 'user' (API requirement)
      while (apiMessages.length > 0 && apiMessages[0].role === 'assistant') {
        apiMessages.shift()
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          stream: false,
          system: SYSTEM + buildLiveDataContext(sleepLogs, bodyComp, labResults, bpLogs),
          messages: apiMessages,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const errMsg = data?.error?.message || data?.error || `API error (${res.status})`
        console.error('[iHeal] API error:', res.status, data)
        throw new Error(errMsg)
      }
      const aiText = data.content?.[0]?.text || 'Error — try again.'
      const newMsgIdx = msgHistory.length

      setMsgs(prev => [...prev, { role: 'ai', text: aiText }])
      await insertCoachMessage('ai', aiText)

      extractAndSave(msgHistory, attachedImages).then(saved => {
        if (saved) {
          setSavedData({ idx: newMsgIdx, labels: saved })
          setTimeout(() => setSavedData(null), 4000)
          // Refresh parent state so Home picks up new data
          if (saved.includes('sleep data') && refreshSleep) refreshSleep()
          if (saved.includes('body composition') && refreshBody) refreshBody()
          if (saved.includes('blood pressure') && refreshBp) refreshBp()
          if (saved.includes('lab results') && refreshLabs) refreshLabs()
          if (saved.includes('protocol') && refreshProtocolItems) refreshProtocolItems()
          // Invalidate Home alert cache so it regenerates with new data
          const today = new Date().toISOString().slice(0, 10)
          localStorage.removeItem(`iheal_alert_${today}`)
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
    const thumbs = attachedImages.length > 0 ? attachedImages.map(img => `data:${img.mediaType};base64,${img.base64}`) : null
    const newMsgs = [...msgs, { role: 'user', text: displayText, images: thumbs }]
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
                <>
                  {m.images && m.images.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: m.text && !m.text.startsWith('[') ? 8 : 0 }}>
                      {m.images.map((src, j) => (
                        <img key={j} src={src} alt="" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 10, border: `1px solid ${BORDER}` }} />
                      ))}
                    </div>
                  )}
                  {m.role === 'ai' ? renderText(m.text) : (m.text && !m.text.startsWith('[') ? m.text : (!m.images ? m.text : null))}
                </>
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
