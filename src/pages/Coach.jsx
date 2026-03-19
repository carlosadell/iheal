import { useEffect, useRef } from 'react'

export default function Coach({ chatMsgs, setChatMsgs }) {
  const msgsRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [chatMsgs])

  const send = () => {
    const val = inputRef.current?.value?.trim()
    if (!val) return
    setChatMsgs(prev => [...prev, { role: 'user', text: val }])
    inputRef.current.value = ''
    inputRef.current.style.height = '22px'
    setTimeout(() => {
      setChatMsgs(prev => [...prev, { role: 'ai', text: "Got it — I've noted that. In the full version I'll parse your data and update your health profile automatically. For now, keep logging and I'll track everything." }])
    }, 700)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const handleInput = (e) => {
    e.target.style.height = '22px'
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
  }

  return (
    <div style={{
      display:'flex', flexDirection:'column',
      height:'calc(100vh - 57px)',
      maxWidth:1020, margin:'0 auto', padding:'16px 24px', width:'100%'
    }} className="coach-wrap">
      <div ref={msgsRef} style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, paddingBottom:8, minHeight:0 }}>
        {chatMsgs.map((m, i) => (
          <div key={i} style={{
            maxWidth:'84%', padding:'10px 14px', borderRadius:12, fontSize:13, lineHeight:1.6,
            alignSelf: m.role==='user'?'flex-end':'flex-start',
            background: m.role==='user'?'#00d4b8':'#161f30',
            color: m.role==='user'?'#080d16':'#d8e8f5',
            border: m.role==='ai'?'1px solid rgba(255,255,255,0.07)':'none',
            fontWeight: m.role==='user'?500:400,
            borderRadius: m.role==='user'?'12px 4px 12px 12px':'4px 12px 12px 12px',
          }}>
            {m.text}
          </div>
        ))}
      </div>

      <div style={{ background:'#161f30', border:'1px solid rgba(255,255,255,0.13)', borderRadius:12, padding:'10px 12px', display:'flex', alignItems:'flex-end', gap:8, flexShrink:0, marginTop:8 }}>
        <textarea
          ref={inputRef}
          onKeyDown={handleKey}
          onInput={handleInput}
          placeholder="Share results, ask health questions, upload data…"
          rows={1}
          style={{ flex:1, background:'transparent', border:'none', color:'#d8e8f5', fontSize:13, fontFamily:'inherit', resize:'none', outline:'none', minHeight:22, maxHeight:100 }}
        />
        <button onClick={send} style={{ padding:'8px 16px', background:'#00d4b8', color:'#080d16', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
          Send
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .coach-wrap {
            height: auto !important;
            position: fixed !important;
            top: 48px !important;
            bottom: 58px !important;
            left: 0 !important;
            right: 0 !important;
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  )
}
