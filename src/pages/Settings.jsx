import { useState } from 'react'
import { seedProfile, seedDoctor } from '../data/seed.js'

const GREEN  = '#c5f135'
const CARD   = '#1e2128'
const BORDER = '#2a2e38'
const TEXT2  = '#c8ccd8'
const TEXT3  = '#888a96'

export default function Settings({ goals, setGoals, setPage }) {
  const [editing, setEditing] = useState(null)
  const [tempVal, setTempVal] = useState('')

  const startEdit = (key, current) => { setEditing(key); setTempVal(String(current)) }
  const saveEdit  = (key) => {
    const num = parseFloat(tempVal)
    if (!isNaN(num)) setGoals(prev => ({ ...prev, [key]: num }))
    setEditing(null)
  }

  return (
    <div>
      {/* Back button */}
      <div style={s.backRow} onClick={() => setPage('profile')}>
        <span style={s.backArrow}>‹</span>
        <span style={s.backLabel}>Profile</span>
      </div>

      <div style={s.sec}>Personal</div>
      <div style={s.card}>
        {[
          ['Full Name',   seedProfile.full_name],
          ['Age',         '45'],
          ['DOB',         seedProfile.date_of_birth],
          ['Sex',         seedProfile.sex],
          ['Location',    seedProfile.location],
          ['Timezone',    seedProfile.timezone],
          ['Nationality', seedProfile.nationality],
        ].map(([l, v]) => (
          <div key={l} style={s.row}>
            <div style={s.slbl}>{l}</div>
            <div style={s.sval}>{v}</div>
          </div>
        ))}
      </div>

      <div style={s.sec}>Health Goals</div>
      <div style={s.card}>
        {[
          { key: 'target_weight_kg',     label: 'Target Weight',     suffix: 'kg'   },
          { key: 'target_body_fat_pct',  label: 'Target Body Fat',   suffix: '%'    },
          { key: 'deep_sleep_target_pct',label: 'Deep Sleep Target', suffix: '%'    },
          { key: 'calories',             label: 'Calorie Target',    suffix: 'kcal' },
          { key: 'protein_g',            label: 'Protein Target',    suffix: 'g'    },
          { key: 'fat_g',                label: 'Fat Target',        suffix: 'g'    },
          { key: 'carbs_g',              label: 'Carbs Target',      suffix: 'g'    },
        ].map(({ key, label, suffix }) => (
          <div key={key} style={s.row}>
            <div style={s.slbl}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {editing === key ? (
                <>
                  <input value={tempVal} onChange={e => setTempVal(e.target.value)}
                    onBlur={() => saveEdit(key)} onKeyDown={e => e.key === 'Enter' && saveEdit(key)}
                    autoFocus style={s.editInput} />
                  <span style={{ fontSize: 12, color: TEXT3 }}>{suffix}</span>
                  <span onClick={() => saveEdit(key)} style={s.sedit}>Save</span>
                </>
              ) : (
                <>
                  <div style={s.sval}>{goals[key]} {suffix}</div>
                  <div onClick={() => startEdit(key, goals[key])} style={s.sedit}>Edit</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={s.sec}>Prescribing Doctor</div>
      <div style={s.card}>
        {[
          ['Doctor',    seedDoctor.name],
          ['Clinic',    seedDoctor.clinic + ', SPB'],
          ['Diagnosis', seedDoctor.diagnosis],
          ['Next Appt', seedDoctor.next_appointment],
          ['Contact',   seedDoctor.contact],
        ].map(([l, v]) => (
          <div key={l} style={s.row}>
            <div style={s.slbl}>{l}</div>
            <div style={s.sval}>{v}</div>
          </div>
        ))}
      </div>

      <div style={s.sec}>Data</div>
      <div style={s.card}>
        <div style={s.row}><div style={s.slbl}>Export all data</div><div style={s.sedit}>Export ↗</div></div>
        <div style={s.row}><div style={s.slbl}>Sync with Supabase</div><div style={s.sedit}>Sync ↗</div></div>
      </div>

      <div style={{ height: 28 }} />
    </div>
  )
}

const s = {
  backRow:   { display: 'flex', alignItems: 'center', gap: 6, padding: '14px 16px 6px', cursor: 'pointer' },
  backArrow: { fontSize: 22, color: GREEN, lineHeight: 1 },
  backLabel: { fontSize: 15, color: GREEN, fontWeight: 500 },
  sec:       { fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: '2px', color: '#fff', padding: '12px 16px 8px', textTransform: 'uppercase' },
  card:      { background: CARD, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden', margin: '0 16px' },
  row:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: `1px solid ${BORDER}` },
  slbl:      { fontSize: 14, color: '#fff' },
  sval:      { fontSize: 14, color: TEXT2 },
  sedit:     { fontSize: 13, color: GREEN, fontWeight: 600, cursor: 'pointer' },
  editInput: { background: '#2e3240', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '6px 10px', fontSize: 14, color: '#fff', fontFamily: "'DM Sans', sans-serif", outline: 'none', width: 80, textAlign: 'right' },
}
