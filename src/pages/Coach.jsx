import { useState, useRef, useEffect } from 'react'

const GREEN  = '#c5f135'
const CARD   = '#1e2128'
const BORDER = '#2a2e38'
const TEXT3  = '#6a6e7a'

const SYSTEM = `You are Carlos's personal AI health coach inside iHeal. Carlos is Spanish, 45 years old, entrepreneur, based in Saint Petersburg, Russia.

CURRENT PROTOCOL: Retatrutide 1mg/wk (Monday, fat loss primary), Epitalon 2mg nightly subQ before bed, Trazodone titrating (wk1: 50mg, wk2: 100mg from Mar 24, wk3: 150mg — all at 21:00), Etifoxine 50mg 3×/day (09:00, 14:00, 17:00). AOD-9604 removed.

SUPPLEMENTS: Vitamin C 900–1800mg (waking), Magnesium Citrate 400mg (morning), B-Complex Methylated (morning), Vitamin K2 MK-7 2 caps (daily), Vitamin D3 10,000 IU (4×/wk), DHEA 100mg (daily), Magnesium Bisglycinate + B6 (evening).

DIET: Carnivore-based + one potato at dinner. Targets: 1,950 kcal, 150–170g protein, 110–120g fat, 50–70g carbs.

SLEEP HISTORY (Mar 9–20, deep sleep %): 6, 10, 7, 13, 7, 3, 2, 11, 10.
Night 4 Trazodone (Mar 20): total 6h45m, deep 40min (10%), REM 1h40m (25%), resting HR 68 bpm (avg 76), HRV avg 21ms max 40ms, efficiency 91%, score 81 GOOD.
Week 2 dose 100mg starts March 24.

BODY COMPOSITION (Mar 16, standard mode): 78.7kg, 26% BF, muscle 55.3kg, visceral fat 8. Goal: sub-20% BF, ~75–76kg target weight.

LABS: ApoB 82 mg/dL (ok), fasting insulin 4.2 µIU/mL (ok), homocysteine 11.2 µmol/L (elevated — methylated B-complex addresses), GGT 22 U/L (ok), Vitamin D3 114.7 ng/mL (high — supraphysiologic July 2025, K2 2 caps protective). Pending: CRP, HbA1c, transferrin saturation.

PSYCHIATRIST: Dr. Anton, Домой Линник SPB, phone 8-952-244-18-27, F40.2. Next appointment ~5 April 2026. Contact via Telegram.

INTELLECTUAL FRAMEWORK: Mechanism-first. LDL alone ≠ CVD. Inflammation + insulin resistance are root causes. Priority biomarkers: ApoB, oxidized LDL, CRP, homocysteine, fasting insulin, HRV, deep sleep %. Medication is last-line not first-line.

Be precise, mechanistic, and concise. No generic health advice. Max 150 words per response unless a detailed analysis is specifically requested.`

export default function Coach() {
  const [msgs, setMsgs]         = useState([
    { role: 'ai', text: "I'm your iHeal AI Coach. Share anything — Oura data, RENPHO scans, lab results, food photos, or questions. I have your full health context." }
  ])
  const [input, setInput]       = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, thinking])

  const send = async () => {
    const text = input.trim()
    if (!text || thinking) return
    setInput('')
    const newMsgs = [...msgs, { role: 'user', text }]
    setMsgs(newMsgs)
    setThinking(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM,
          messages: newMsgs.map(m => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.text,
          })),
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
      <div style={s.msgs}>
        {msgs.map((m, i) => (
          <div key={i} style={{ ...s.msg, ...(m.role === 'ai' ? s.msgAi : s.msgUser) }}>
            {m.text}
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
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => {
            setInput(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
          }}
          placeholder="Log data, ask questions, or generate a report..."
          rows={1}
          style={s.input}
        />
        <button onClick={send} style={s.sendBtn}>↑</button>
      </div>
    </div>
  )
}

const s = {
  wrap:    { display: 'flex', flexDirection: 'column', height: '100%', background: '#000' },
  msgs:    { flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 },
  msg:     { maxWidth: '84%', padding: '10px 13px', fontSize: 13, lineHeight: 1.55, borderRadius: 16 },
  msgAi:   { background: CARD, border: `1px solid ${BORDER}`, borderBottomLeftRadius: 3, color: '#fff', alignSelf: 'flex-start' },
  msgUser: { background: GREEN, borderBottomRightRadius: 3, color: '#000', fontWeight: 500, alignSelf: 'flex-end' },
  bar:     { padding: '10px 16px 14px', display: 'flex', gap: 8, alignItems: 'flex-end', borderTop: `1px solid ${BORDER}`, background: '#000', flexShrink: 0 },
  input:   {
    flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
    padding: '10px 14px', fontSize: 16, color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    resize: 'none', outline: 'none', maxHeight: 80, lineHeight: 1.4,
  },
  sendBtn: { width: 38, height: 38, borderRadius: 10, background: GREEN, border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 700, color: '#000', flexShrink: 0 },
  dot:     {
    display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
    background: GREEN, margin: '0 2px',
    animation: 'pulse 1.2s infinite',
  },
}
