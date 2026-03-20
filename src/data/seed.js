// iHeal seed data — all verified from conversation history

export const seedProfile = {
  full_name: 'Carlos Adell Carceller',
  date_of_birth: '1980-08-22',
  age: 45,
  sex: 'Male',
  nationality: 'Spanish',
  location: 'Saint Petersburg, Russia',
  timezone: 'MSK (UTC+3)',
  email: 'carlos@carlosadell.com',
  primary_goal: 'Fat loss · body recomposition',
  target_weight_kg: 75.5,
  target_body_fat_pct: 20,
  target_deep_sleep_pct: 15,
  calorie_target: 1950,
  protein_target_g: 170,
  fat_target_g: 110,
  carb_target_g: 70,
}

export const seedSleepLogs = [
  { date: '2026-03-09', deep_min: 25, deep_pct: 6,  rem_pct: 18, resting_hr: 65, hrv_ms: 24, total_min: 394, score: 70, notes: '' },
  { date: '2026-03-10', deep_min: 41, deep_pct: 10, rem_pct: 22, resting_hr: 63, hrv_ms: 26, total_min: 420, score: 76, notes: '' },
  { date: '2026-03-11', deep_min: 29, deep_pct: 7,  rem_pct: 20, resting_hr: 64, hrv_ms: 25, total_min: 420, score: 73, notes: '' },
  { date: '2026-03-12', deep_min: 55, deep_pct: 13, rem_pct: 21, resting_hr: 63, hrv_ms: 28, total_min: 432, score: 78, notes: 'Epitalon night 1' },
  { date: '2026-03-13', deep_min: 30, deep_pct: 7,  rem_pct: 19, resting_hr: 66, hrv_ms: 22, total_min: 420, score: 72, notes: '' },
  { date: '2026-03-17', deep_min: 14, deep_pct: 3,  rem_pct: 20, resting_hr: 66, hrv_ms: 28, total_min: 420, score: 76, notes: 'Trazodone night 1' },
  { date: '2026-03-18', deep_min: 9,  deep_pct: 2,  rem_pct: 24, resting_hr: 69, hrv_ms: 22, total_min: 401, score: 75, notes: 'Trazodone night 2 + Etifoxine day 1' },
  { date: '2026-03-19', deep_min: 41, deep_pct: 11, rem_pct: 18, resting_hr: 66, hrv_ms: 22, total_min: 380, score: 74, notes: 'Trazodone night 3. Deep sleep recovered.' },
  { date: '2026-03-20', deep_min: 40, deep_pct: 10, rem_pct: 25, resting_hr: 68, hrv_ms: 21, hrv_max_ms: 40, rem_min: 100, total_min: 405, score: 81, notes: 'Trazodone night 4. Score 81 GOOD. Best score of period. Avg HR 76.' },
]

export const seedBodyComposition = [
  { date: '2026-03-09', weight_kg: 79.10, body_fat_pct: 26.2, muscle_mass_kg: 55.45, visceral_fat: 8, bmr_kcal: 1635, notes: 'Standard mode true baseline' },
  { date: '2026-03-16', weight_kg: 78.70, body_fat_pct: 26.0, muscle_mass_kg: 55.33, visceral_fat: 8, bmr_kcal: 1627, notes: 'Week 1' },
  { date: '2026-03-16', weight_kg: 78.55, body_fat_pct: 26.0, muscle_mass_kg: 55.22, visceral_fat: 8, bmr_kcal: 1627, notes: 'Post toilet' },
]

export const seedLabResults = [
  { name: 'ApoB',                value: '82',      unit: 'mg/dL',    range: '<90',    status: 'ok',      date: '2025-07-01' },
  { name: 'Fasting Insulin',     value: '4.2',     unit: 'µIU/mL',   range: '<10',    status: 'ok',      date: '2025-07-01' },
  { name: 'Homocysteine',        value: '11.2',    unit: 'µmol/L',   range: '<10',    status: 'warn',    date: '2025-07-01' },
  { name: 'GGT',                 value: '22',      unit: 'U/L',      range: '<30',    status: 'ok',      date: '2025-07-01' },
  { name: 'Vitamin D3',          value: '114.7',   unit: 'ng/mL',    range: '40-80',  status: 'warn',    date: '2025-07-01' },
  { name: 'CRP',                 value: 'Pending', unit: '',         range: '<1',     status: 'pending', date: null },
  { name: 'HbA1c',               value: 'Pending', unit: '%',        range: '<5.4',   status: 'pending', date: null },
  { name: 'Transferrin Sat.',    value: 'Pending', unit: '%',        range: '20-50',  status: 'pending', date: null },
]

export const seedMacroLogs = [
  { date: '2026-03-14', kcal: 1820, protein_g: 178, carbs_g: 80, fat_g: 75 },
  { date: '2026-03-15', kcal: 1955, protein_g: 182, carbs_g: 83, fat_g: 93 },
  { date: '2026-03-16', kcal: 1781, protein_g: 184, carbs_g: 84, fat_g: 71 },
  { date: '2026-03-17', kcal: 1955, protein_g: 182, carbs_g: 83, fat_g: 93 },
  { date: '2026-03-19', kcal: 1885, protein_g: 199, carbs_g: 74, fat_g: 81 },
]

export const recommendedNextLabs = [
  'CRP (high sensitivity) — inflammation marker',
  'HbA1c — glycaemic control',
  'Transferrin saturation — iron overload risk',
  'Oxidized LDL — cardiovascular risk beyond ApoB',
  'Fasting glucose — metabolic baseline',
  'Testosterone total + free — DHEA metabolite check',
]

export const seedNextLabs = recommendedNextLabs
export const seedMacroLog = seedMacroLogs
export const seedSleepLog = seedSleepLogs
export const seedGoals = {
  calories: seedProfile.calorie_target,
  protein_g: seedProfile.protein_target_g,
  fat_g: seedProfile.fat_target_g,
  carbs_g: seedProfile.carb_target_g,
  target_weight_kg: seedProfile.target_weight_kg,
  target_body_fat_pct: seedProfile.target_body_fat_pct,
  deep_sleep_target_pct: seedProfile.target_deep_sleep_pct,
}
export const seedDoctor = {
  name: 'Dr. Anton',
  specialty: 'Psychiatrist',
  clinic: 'Домой Линник',
  city: 'Saint Petersburg',
  contact: 'Telegram',
  next_appointment: '~5 April 2026',
  diagnosis: 'F40.2',
}

export const seedNextLabs = recommendedNextLabs

export const seedSleepLog = seedSleepLogs
export const seedMacroLog = seedMacroLogs

export const seedGoals = {
  calories: seedProfile.calorie_target,
  protein_g: seedProfile.protein_target_g,
  fat_g: seedProfile.fat_target_g,
  carbs_g: seedProfile.carb_target_g,
  target_weight_kg: seedProfile.target_weight_kg,
  target_body_fat_pct: seedProfile.target_body_fat_pct,
  deep_sleep_target_pct: seedProfile.target_deep_sleep_pct,
}

export const seedDoctor = {
  name: 'Dr. Anton',
  specialty: 'Psychiatrist',
  clinic: 'Домой Линник',
  city: 'Saint Petersburg',
  contact: 'Telegram',
  next_appointment: '~5 April 2026',
  diagnosis: 'F40.2',
}

export const seedProtocol = [
  { key: 'ret',    icon: '💉', name: 'Retatrutide',                  sub: '1mg subcutaneous · after food',          group: 'peptide', monday_only: true  },
  { key: 'epi',    icon: '🧬', name: 'Epitalon',                     sub: '2mg subcutaneous · 30–60min before bed', group: 'peptide', monday_only: false },
  { key: 'tra',    icon: '💊', name: 'Trazodone (Триттико)',          sub: '50mg → 100mg wk2 → 150mg wk3 · 21:00',  group: 'med',     monday_only: false },
  { key: 'eti_am', icon: '💊', name: 'Etifoxine — Morning',          sub: '50mg · 09:00',                           group: 'med',     monday_only: false },
  { key: 'eti_md', icon: '💊', name: 'Etifoxine — Midday',           sub: '50mg · 14:00',                           group: 'med',     monday_only: false },
  { key: 'eti_ev', icon: '💊', name: 'Etifoxine — Evening',          sub: '50mg · 17:00',                           group: 'med',     monday_only: false },
]

export const seedSupplements = [
  { key: 'vitc',   icon: '🍊', name: 'Vitamin C',                   sub: '900–1800mg · on waking'  },
  { key: 'magcit', icon: '🌊', name: 'Magnesium Citrate 400mg',      sub: '1 capsule · morning'     },
  { key: 'bcomp',  icon: '🅱️', name: 'B-Complex Methylated',         sub: '1 tablet · morning'      },
  { key: 'k2',     icon: '🫙', name: 'Vitamin K2 MK-7',              sub: '2 capsules · daily'      },
  { key: 'd3',     icon: '☀️', name: 'Vitamin D3 10,000 IU',         sub: '1 capsule · 4× per week' },
  { key: 'dhea',   icon: '⚡', name: 'DHEA',                         sub: '100mg · daily'           },
  { key: 'magbis', icon: '🌙', name: 'Magnesium Bisglycinate + B6',  sub: 'As labelled · evening'   },
]
