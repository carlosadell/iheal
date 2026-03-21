import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://frntqmewojcdibwqucxz.supabase.co'
const SUPABASE_KEY = 'sb_publishable_0Z8Vr2QrFMMTqnjGDYvF9Q_cYqhtDdA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Sleep logs ────────────────────────────────────────────────────────────────
export async function fetchSleepLogs() {
  const { data, error } = await supabase
    .from('sleep_logs')
    .select('*')
    .order('date', { ascending: true })
  if (error) { console.error('fetchSleepLogs:', error); return [] }
  return data
}

export async function insertSleepLog(log) {
  const { data, error } = await supabase
    .from('sleep_logs')
    .upsert(log, { onConflict: 'date' })
    .select()
  if (error) { console.error('insertSleepLog:', error); return null }
  return data?.[0]
}

// ── Body composition ──────────────────────────────────────────────────────────
export async function fetchBodyComposition() {
  const { data, error } = await supabase
    .from('body_composition')
    .select('*')
    .order('date', { ascending: true })
  if (error) { console.error('fetchBodyComposition:', error); return [] }
  return data
}

export async function insertBodyComposition(entry) {
  const { data, error } = await supabase
    .from('body_composition')
    .insert(entry)
    .select()
  if (error) { console.error('insertBodyComposition:', error); return null }
  return data?.[0]
}

// ── Macro logs ────────────────────────────────────────────────────────────────
export async function fetchMacroLogs() {
  const { data, error } = await supabase
    .from('macro_logs')
    .select('*')
    .order('date', { ascending: true })
  if (error) { console.error('fetchMacroLogs:', error); return [] }
  return data
}

export async function insertMacroLog(log) {
  const { data, error } = await supabase
    .from('macro_logs')
    .upsert(log, { onConflict: 'date' })
    .select()
  if (error) { console.error('insertMacroLog:', error); return null }
  return data?.[0]
}

// ── Lab results ───────────────────────────────────────────────────────────────
export async function fetchLabResults() {
  const { data, error } = await supabase
    .from('lab_results')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) { console.error('fetchLabResults:', error); return [] }
  return data
}

export async function upsertLabResult(lab) {
  const { data, error } = await supabase
    .from('lab_results')
    .upsert(lab, { onConflict: 'name' })
    .select()
  if (error) { console.error('upsertLabResult:', error); return null }
  return data?.[0]
}

// ── Blood pressure logs ───────────────────────────────────────────────────────
export async function fetchBpLogs() {
  const { data, error } = await supabase
    .from('bp_logs')
    .select('*')
    .order('date', { ascending: false })
  if (error) { console.error('fetchBpLogs:', error); return [] }
  return data
}

export async function insertBpLog(log) {
  const { data, error } = await supabase
    .from('bp_logs')
    .insert(log)
    .select()
  if (error) { console.error('insertBpLog:', error); return null }
  return data?.[0]
}

// ── Protocol checks ───────────────────────────────────────────────────────────
export async function fetchProtocolChecks(date) {
  const { data, error } = await supabase
    .from('protocol_checks')
    .select('*')
    .eq('date', date)
  if (error) { console.error('fetchProtocolChecks:', error); return [] }
  return data
}

export async function upsertProtocolCheck(date, key, done) {
  const { error } = await supabase
    .from('protocol_checks')
    .upsert({ date, key, done }, { onConflict: 'date,key' })
  if (error) console.error('upsertProtocolCheck:', error)
}

// ── Reports ───────────────────────────────────────────────────────────────────
export async function fetchReports() {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('date', { ascending: false })
  if (error) { console.error('fetchReports:', error); return [] }
  return data
}

export async function insertReport(report) {
  const { data, error } = await supabase
    .from('reports')
    .insert(report)
    .select()
  if (error) { console.error('insertReport:', error); return null }
  return data?.[0]
}
