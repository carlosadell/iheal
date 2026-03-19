export const seedProfile = {
  id: 'carlos',
  name: 'Carlos',
  full_name: 'Carlos Adell Carceller',
  date_of_birth: '1980-08-22',
  age: 45,
  sex: 'male',
  location: 'Saint Petersburg, Russia',
  weight_kg: 78.55,
  target_weight_kg: 75,
  target_body_fat_pct: 20,
  bmr_kcal: 1627,
  metabolic_age: 45,
}

export const seedGoals = {
  calories: 1950,
  protein_g: 170,
  carbs_g: 70,
  fat_g: 110,
}

export const seedProtocol = [
  { key: 'etif_m', name: 'Etifoxine 50mg', time: '09:00', category: 'Medication' },
  { key: 'vitC', name: 'Vitamin C 900-1800mg', time: 'Morning', category: 'Supplement' },
  { key: 'magCit', name: 'Magnesium Citrate 400mg', time: 'Morning', category: 'Supplement' },
  { key: 'bComp', name: 'B-Complex methylated', time: 'Morning', category: 'Supplement' },
  { key: 'vitK2', name: 'Vitamin K2 MK-7 (2 caps)', time: 'Morning', category: 'Supplement' },
  { key: 'vitD3', name: 'Vitamin D3 10,000 IU', time: 'With K2 (4x/week)', category: 'Supplement' },
  { key: 'dhea', name: 'DHEA 100mg', time: 'Morning', category: 'Supplement' },
  { key: 'etif_mid', name: 'Etifoxine 50mg', time: '14:00', category: 'Medication' },
  { key: 'etif_e', name: 'Etifoxine 50mg', time: '17:00', category: 'Medication' },
  { key: 'magGlyc', name: 'Magnesium Bisglycinate + B6', time: 'Evening', category: 'Supplement' },
  { key: 'trazodone', name: 'Trazodone 50mg', time: '21:00', category: 'Medication' },
  { key: 'epitalon', name: 'Epitalon 2mg', time: 'Before bed', category: 'Peptide' },
]

export const seedPeptides = [
  { name: 'Retatrutide', dose: '1mg weekly', timing: 'Monday after food', status: 'active', detail: 'Triple agonist GLP-1+GIP+Glucagon. Weeks 1-8 at 1mg. Escalate to 2mg when resting HR 65 consistently.' },
  { name: 'Epitalon', dose: '2mg nightly', timing: '30-60 min before bed', status: 'active', detail: '10mg + 2ml BAC water = 5mg/ml. 4 units on syringe. Cycle 10-20 days on then break.' },
  { name: 'CJC-1295 + Ipamorelin', dose: '5mg vial', timing: 'Before bed', status: 'pending', detail: 'Start after Epitalon cycle ends. GH pulse restoration and overnight recovery.' },
  { name: 'AOD-9604', dose: '5mg vial', timing: 'Fasted morning', status: 'paused', detail: 'Set aside. Revisit in muscle building phase in 3-4 months.' },
]

export const seedMedications = [
  { name: 'Trazodone (Trittico)', dose: '50mg', timing: '21:00 nightly', status: 'active', detail: 'Week 1: 50mg. Week 2: 100mg. Week 3: 150mg. Prescribed by Dr. Anton.' },
  { name: 'Etifoxine (Strezam)', dose: '50mg x3', timing: '09:00 / 14:00 / 17:00', status: 'active', detail: 'GABA modulator. Non-benzodiazepine. Builds over 3-5 days. Started 18 Mar.' },
]

export const seedSupplements = [
  { name: 'Vitamin K2 MK-7', dose: '2 caps', timing: 'Daily' },
  { name: 'Vitamin D3 10,000 IU', dose: '1 cap', timing: '4x per week' },
  { name: 'B-Complex methylated', dose: '1 tab', timing: 'Morning' },
  { name: 'Vitamin C 900-1800mg', dose: '1-2 tabs', timing: 'Morning' },
  { name: 'Magnesium Citrate 400mg', dose: '1 cap', timing: 'Morning' },
  { name: 'Magnesium Bisglycinate + B6', dose: 'As labelled', timing: 'Evening' },
  { name: 'DHEA 100mg', dose: '1 cap', timing: 'Daily' },
]

export const seedLabResults = [
  { name: 'Total Cholesterol', value: '7.60 mmol/L', status: 'high', date: '2025-07-20' },
  { name: 'LDL-C', value: '5.48 mmol/L', status: 'high', date: '2025-07-20' },
  { name: 'HDL-C', value: '1.64 mmol/L', status: 'normal', date: '2025-07-20' },
  { name: 'Triglycerides', value: '1.06 mmol/L', status: 'normal', date: '2025-07-20' },
  { name: 'ApoB', value: '1.52 g/L', status: 'high', date: '2025-07-20' },
  { name: 'Ferritin', value: '333 ug/L', status: 'elevated', date: '2025-07-20' },
  { name: 'Vitamin D', value: '114.7 ng/mL', status: 'elevated', date: '2025-07-20' },
  { name: 'CAC Score', value: '0', status: 'normal', date: '2025-07-20' },
]

export const seedPendingTests = [
  'CRP', 'Homocysteine', 'Transferrin saturation',
  'HbA1c', 'Fasting insulin', 'ALT / AST / GGT', 'Oxidized LDL'
]

export const seedSleepLog = [
  { date: '2026-03-07', deep_min: 28, deep_pct: 6, rem_pct: 27, resting_hr: 68, hrv_ms: 27, total_min: 436, score: 80, notes: 'Baseline' },
  { date: '2026-03-09', deep_min: 39, deep_pct: 10, rem_pct: 20, resting_hr: 63, hrv_ms: 34, total_min: 386, score: 82, notes: 'Epitalon night 1' },
  { date: '2026-03-10', deep_min: 46, deep_pct: 10, rem_pct: 22, resting_hr: 65, hrv_ms: 26, total_min: 444, score: 82, notes: 'Epitalon night 2' },
  { date: '2026-03-11', deep_min: 27, deep_pct: 7, rem_pct: 19, resting_hr: 66, hrv_ms: 28, total_min: 399, score: 75, notes: 'High stress day' },
  { date: '2026-03-12', deep_min: 51, deep_pct: 13, rem_pct: 22, resting_hr: 67, hrv_ms: 24, total_min: 404, score: 75, notes: 'Epitalon night 4' },
  { date: '2026-03-13', deep_min: 28, deep_pct: 7, rem_pct: 25, resting_hr: 71, hrv_ms: 21, total_min: 390, score: 75, notes: 'Late heavy dinner' },
  { date: '2026-03-17', deep_min: 14, deep_pct: 3, rem_pct: 20, resting_hr: 66, hrv_ms: 28, total_min: 420, score: 76, notes: 'Trazodone night 1' },
  { date: '2026-03-18', deep_min: 9, deep_pct: 2, rem_pct: 24, resting_hr: 69, hrv_ms: 22, total_min: 401, score: 75, notes: 'Trazodone night 2' },
  { date: '2026-03-19', deep_min: 41, deep_pct: 11, rem_pct: 18, resting_hr: 66, hrv_ms: 22, total_min: 380, score: 74, notes: 'Trazodone night 3' },
]

export const seedBodyComposition = [
  { date: '2026-03-09', weight_kg: 79.10, body_fat_pct: 26.2, muscle_mass_kg: 55.45, visceral_fat: 8, bmr_kcal: 1635, notes: 'True baseline standard mode' },
  { date: '2026-03-16', weight_kg: 78.70, body_fat_pct: 26.0, muscle_mass_kg: 55.33, visceral_fat: 8, bmr_kcal: 1627, notes: 'Week 1' },
  { date: '2026-03-19', weight_kg: 78.55, body_fat_pct: 26.0, muscle_mass_kg: 55.22, visceral_fat: 8, bmr_kcal: 1627, notes: 'Post toilet post shake' },
]
