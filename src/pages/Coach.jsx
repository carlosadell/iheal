import { useState, useRef, useEffect } from 'react'

const GREEN  = '#c5f135'
const CARD   = '#1e2128'
const BORDER = '#2a2e38'

const INITIAL_MSG = { role: 'ai', text: "I'm your iHeal AI Coach. Share anything — Oura data, RENPHO scans, lab results, food photos, or questions. I have your full health context." }

const SYSTEM = `You are Carlos's personal AI health coach inside iHeal. Carlos is Spanish, 45 years old, entrepreneur, based in Saint Petersburg, Russia.

CURRENT PROTOCOL: Retatrutide 1mg/wk (Monday, fat loss primary), Epitalon 2mg nightly subQ before bed, Trazodone titrating (wk1: 50mg, wk2: 100mg from Mar 24, wk3: 150mg — all at 21:00), Etifoxine 50mg 3×/day (09:00, 14:00, 17:00). AOD-9604 removed.

SUPPLEMENTS: Vitamin C 900–1800mg (waking), Magnesium Citrate 400mg (morning), B-Complex Methylated (morning), Vitamin K2 MK-7 2 caps (daily), Vitamin D3 10,000 IU (4×/wk), DHEA 100mg (daily), Magnesium Bisglycinate + B6 (evening).

DIET: Carnivore-based + one potato at dinner. Targets: 1,950 kcal, 150–170g protein, 110–120g fat, 50–70g carbs.

SLEEP HISTORY (Mar 9–20, deep sleep %): 6, 10, 7, 13, 7, 3, 2, 11, 10.
Night 4 Trazodone (Mar 20): total 6h45m, deep 40min (10%), REM 1h40m (25%), resting HR 68 bpm (avg 76), HRV avg 21ms max 40ms, efficiency 91%, score 81 GOOD.
Week 2 dose 100mg starts March 24.

BODY COMPOSITION (Mar 16, standard mode): 78.7kg, 26% BF, muscle 55.3kg, visceral fat 8. Goal: sub-20% BF, ~75–76kg target weight.

LABS: ApoB 82 mg/dL (ok), fasting insulin 4.2 µIU/mL (ok), homocysteine 11.2 µmol/L (elevated — methylated B-complex addresses), GGT 22 U/L (ok), Vitamin D3 114.7 ng/mL (high — supraphysiologic July 2025, K2 2 caps protective). Pending: CRP, HbA1c, transferrin saturation.

PSYCHIATRIST: Dr. Anton, Домой Линник SPB, F40.2. Next appointment ~5 April 2026. Contact via Telegram.

INTELLECTUAL FRAMEWORK: Mechanism-first. LDL alone ≠ CVD. Inflammation + insulin resistance are root causes. Priority biomarkers: ApoB, oxidized LDL, CRP, homocysteine, fasting insulin, HRV, deep sleep %. Medication is last-line not first-line.

Be precise, mechanistic, and concise. No generic health advice. Max 150 words per response unless a detailed analysis is specifically requested.`

function renderText(text) {
  return text.split('\n').map((line, i) => {
    if (line.match(/^[-•*]\s/)) return (
      <div key={i} style={{ display: 'flex', gap: 8, marginTop: 5 }}>
        <span style={{ color: GREEN, flexShrink: 0 }}>•</span>
        <span>{renderInline(line.replace(/^[-•*]\s/, ''))}</span>
      </div>
    )
    if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\./)[1]
      return (
        <div key={i} style={{ display: 'flex', gap: 8, marginTop: 5 }}>
          <span style={{ color: GREEN, flexShrink: 0, minWidth: 18 }}>{num}.</span>
          <span>{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      )
    }
    if (line.trim() === '') return <div key={i} style={{ height: 8 }} />
    return <div key={i} style={{ marginTop: i === 0 ? 0 : 3 }}>{renderInline(line)}</div>
  })
}

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color: '#fff', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    return <span key={i}>{part}</span>
  })
}

export default function Coach() {
  const [msgs, setMsgs] = useState(() => {
    try {
      const saved = localStorage.getItem('iheal_chat')
      return saved ? JSON.parse(saved) : [INITIAL_MSG]
    } catch { return [INITIAL_MSG] }
  })
  const [input, setInput]       = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)

  useEffect(() => {
    try { localStorage.setItem('iheal_chat', JSON.stringify(msgs)) } catch {}
  }, [msgs])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, thinking])

  const send = async () => {
    const text = input.trim()
    if (!text || thinking) return
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    const newMsgs = [...msgs, { role: 'user', text }]
    setMsgs(newMsgs)
    setThinking(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM,
          messages: newMsgs.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
        }),
      })
      const data = await res.json()
      setMsgs(prev => [...prev, { role: 'ai', text: data.content?.[0]?.text || 'Error — try again.' }])
    } catch {
      setMsgs(prev => [...prev, { role: 'ai', text: 'Connection error. Try again.' }])
    }
    setThinking(false)
  }

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.headerTitle}>AI COACH</span>
        <button onClick={() => { const f=[INITIAL_MSG]; setMsgs(f); localStorage.setItem('iheal_chat',JSON.stringify(f)) }} style={s.clearBtn}>Clear history</button>
      </div>
      <div style={s.msgs}>
        {msgs.map((m, i) => (
          <div key={i} style={{ ...s.msg, ...(m.role === 'ai' ? s.msgAi : s.msgUser) }}>
            {m.role === 'ai' ? renderText(m.text) : m.text}
          </div>
        ))}
        {thinking && (
          <div style={{ ...s.msg, ...s.msgAi }}>
            <span style={s.dot} /><span style={{ ...s.dot, animationDelay: '.2s' }} /><span style={{ ...s.dot, animationDelay: '.4s' }} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={s.bar}>
        <textarea ref={inputRef} value={input}
          onChange={e => { setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,120)+'px' }}
          onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()} }}
          placeholder="Ask anything or log data..." rows={1} style={s.input} />
        <button onClick={send} style={s.sendBtn}>↑</button>
      </div>
    </div>
  )
}

const s = {
  wrap:        { display: 'flex', flexDirection: 'column', height: '100%', background: '#000' },
  header:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px 9px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 },
  headerTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, letterSpacing: '1.5px', color: '#fff' },
  clearBtn:    { fontSize: 12, color: '#555', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  msgs:        { flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 },
  msg:         { maxWidth: '88%', padding: '13px 15px', fontSize: 15, lineHeight: 1.65, borderRadius: 16 },
  // AI messages: dark card, bright text
  msgAi:       { background: CARD, border: `1px solid ${BORDER}`, borderBottomLeftRadius: 3, color: '#d8dce8', alignSelf: 'flex-start' },
  // User messages: subtle dark blue-grey, NOT the aggressive lime green
  msgUser:     { background: '#2a3048', border: '1px solid #3a4060', borderBottomRightRadius: 3, color: '#fff', fontWeight: 500, alignSelf: 'flex-end' },
  bar:         { padding: '10px 16px 14px', display: 'flex', gap: 8, alignItems: 'flex-end', borderTop: `1px solid ${BORDER}`, background: '#000', flexShrink: 0 },
  input:       { flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '10px 14px', fontSize: 16, color: '#fff', fontFamily: "'DM Sans', sans-serif", resize: 'none', outline: 'none', maxHeight: 120, lineHeight: 1.5, minWidth: 0 },
  sendBtn:     { width: 42, height: 42, borderRadius: 10, background: GREEN, border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 700, color: '#000', flexShrink: 0 },
  dot:         { display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: GREEN, margin: '0 2px', animation: 'pulse 1.2s infinite' },
}
