import { useState } from 'react'
import { seedProfile } from '../data/seed.js'

const G='#c5f135', CARD='#1e2128', BORDER='#2a2e38'
const T='#fff', T2='#b0b4c0', T3='#6a6e7a', FD="'Bebas Neue',sans-serif"
const card = {background:CARD,borderRadius:14,border:`1px solid ${BORDER}`,overflow:'hidden',margin:'0 16px'}

export default function Settings({setPage}) {
  const [goals, setGoals] = useState({
    weight: '75–76 kg', bodyFat: 'Sub-20%', deepSleep: '15%+',
    calories: '1,950 kcal', protein: '170g', fat: '110–120g', carbs: '50–70g',
  })
  const [editing, setEditing] = useState(null)
  const [tempVal, setTempVal] = useState('')

  const startEdit = (key, val) => { setEditing(key); setTempVal(val) }
  const saveEdit  = (key) => { setGoals(g => ({...g, [key]: tempVal})); setEditing(null) }

  const personal = [
    ['Full name',     'Carlos Adell Carceller'],
    ['Date of birth', '22 August 1980'],
    ['Age',           '45'],
    ['Sex',           'Male'],
    ['Location',      'Saint Petersburg, Russia'],
    ['Timezone',      'MSK (UTC+3)'],
  ]

  const goalFields = [
    ['weight',    'Target Weight'],
    ['bodyFat',   'Target Body Fat'],
    ['deepSleep', 'Deep Sleep Target'],
    ['calories',  'Calorie Target'],
    ['protein',   'Protein Target'],
    ['fat',       'Fat Target'],
    ['carbs',     'Carbs Target'],
  ]

  return (
    <div style={{background:'#000',minHeight:'100%'}}>
      <div style={{display:'flex',alignItems:'center',gap:6,padding:'14px 16px 6px',cursor:'pointer'}} onClick={()=>setPage('profile')}>
        <span style={{fontSize:22,color:G,lineHeight:1}}>‹</span>
        <span style={{fontSize:15,color:G,fontWeight:500}}>Profile</span>
      </div>

      <div style={{fontFamily:FD,fontSize:14,letterSpacing:2,color:T,padding:'8px 16px 9px',textTransform:'uppercase'}}>Personal</div>
      <div style={card}>
        {personal.map(([l,v])=>(
          <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:`1px solid ${BORDER}`}}>
            <span style={{fontSize:14,color:T}}>{l}</span>
            <span style={{fontSize:13,color:T2}}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{fontFamily:FD,fontSize:14,letterSpacing:2,color:T,padding:'13px 16px 9px',textTransform:'uppercase'}}>Health Goals</div>
      <div style={card}>
        {goalFields.map(([key,label])=>(
          <div key={key} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:`1px solid ${BORDER}`}}>
            <span style={{fontSize:14,color:T}}>{label}</span>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {editing===key ? (
                <>
                  <input value={tempVal} onChange={e=>setTempVal(e.target.value)}
                    onBlur={()=>saveEdit(key)} onKeyDown={e=>e.key==='Enter'&&saveEdit(key)}
                    autoFocus style={{background:'#2e3240',border:`1px solid ${BORDER}`,borderRadius:8,padding:'5px 10px',fontSize:13,color:T,fontFamily:"'DM Sans',sans-serif",outline:'none',width:100,textAlign:'right'}}/>
                  <span onClick={()=>saveEdit(key)} style={{fontSize:12,color:G,fontWeight:600,cursor:'pointer'}}>Save</span>
                </>
              ) : (
                <>
                  <span style={{fontSize:13,color:T2}}>{goals[key]}</span>
                  <span onClick={()=>startEdit(key,goals[key])} style={{fontSize:12,color:G,fontWeight:600,cursor:'pointer'}}>Edit</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{fontFamily:FD,fontSize:14,letterSpacing:2,color:T,padding:'13px 16px 9px',textTransform:'uppercase'}}>Doctor</div>
      <div style={card}>
        {[['Doctor','Dr. Anton'],['Clinic','Домой Линник, SPB'],['Diagnosis','F40.2'],['Next Appt','~5 Apr 2026'],['Contact','Telegram']].map(([l,v])=>(
          <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:`1px solid ${BORDER}`}}>
            <span style={{fontSize:14,color:T}}>{l}</span>
            <span style={{fontSize:13,color:T2}}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{fontFamily:FD,fontSize:14,letterSpacing:2,color:T,padding:'13px 16px 9px',textTransform:'uppercase'}}>Data</div>
      <div style={card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:`1px solid ${BORDER}`}}>
          <span style={{fontSize:14,color:T}}>Export all data</span>
          <span style={{fontSize:12,color:G,fontWeight:600,cursor:'pointer'}}>Export ↗</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px'}}>
          <span style={{fontSize:14,color:T}}>Sync with Supabase</span>
          <span style={{fontSize:12,color:G,fontWeight:600,cursor:'pointer'}}>Coming soon</span>
        </div>
      </div>
      <div style={{height:24}}/>
    </div>
  )
}
