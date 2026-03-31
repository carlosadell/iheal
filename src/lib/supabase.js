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

export async function patchMissingSleepHRV() {
  // One-time fix: patch rows where hrv_ms is null but data is known
  const patches = [
    { date: '2026-03-30', hrv_ms: 30, hrv_max_ms: 57 },
    { date: '2026-03-29', hrv_ms: 30, hrv_max_ms: 48 },
    { date: '2026-03-28', hrv_ms: 22, hrv_max_ms: 44 },
    { date: '2026-03-26', hrv_ms: 26, hrv_max_ms: 45 },
  ]
  for (const p of patches) {
    await supabase
      .from('sleep_logs')
      .update({ hrv_ms: p.hrv_ms, hrv_max_ms: p.hrv_max_ms })
      .eq('date', p.date)
      .is('hrv_ms', null)
  }
}

export async function patchCorruptedSleepData() {
  // Fix 1: March 30 Night 13 data was overwritten by date-confused Coach extraction
  const { data } = await supabase
    .from('sleep_logs')
    .select('deep_pct')
    .eq('date', '2026-03-30')
    .single()
  if (data && data.deep_pct !== 15) {
    await supabase
      .from('sleep_logs')
      .update({ deep_min: 62, deep_pct: 15, score: 79, resting_hr: 66, hrv_ms: 30, hrv_max_ms: 57 })
      .eq('date', '2026-03-30')
    console.log('[iHeal] patched corrupted March 30 sleep data')
  }

  // Fix 2: Delete any sleep records dated today or in the future
  // Sleep data is always for "last night" so the latest valid date is yesterday
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const { data: futureRows } = await supabase
    .from('sleep_logs')
    .select('date')
    .gt('date', yesterday)
  if (futureRows && futureRows.length > 0) {
    await supabase
      .from('sleep_logs')
      .delete()
      .gt('date', yesterday)
    console.log('[iHeal] deleted future-dated sleep records:', futureRows.map(r => r.date))
  }
}

export async function insertSleepLog(log) {
  // Guard: sleep data can never be for today or future — it's always last night or earlier
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (log.date > yesterday) {
    console.warn('[iHeal] blocked sleep log with future date:', log.date, '(latest valid:', yesterday + ')')
    log.date = yesterday
  }
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
export async function deleteReport(id) {
  const { error } = await supabase.from('reports').delete().eq('id', id)
  if (error) console.error('deleteReport:', error)
}
// ── Coach messages ────────────────────────────────────────────────────────────
export async function fetchCoachMessages() {
  try {
    // Fetch latest 200 messages (descending), then reverse for chronological order
    const { data, error } = await supabase
      .from('coach_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) { console.error('[iHeal] fetchCoachMessages FAILED:', error); return [] }
    const msgs = (data || []).reverse()
    console.log(`[iHeal] fetchCoachMessages OK: ${msgs.length} messages loaded`)
    return msgs
  } catch (err) {
    console.error('[iHeal] fetchCoachMessages EXCEPTION:', err)
    return []
  }
}

export async function insertCoachMessage(role, text) {
  try {
    const { error } = await supabase
      .from('coach_messages')
      .insert({ role, text })
    if (error) {
      console.error('[iHeal] insertCoachMessage FAILED:', error)
      return false
    }
    console.log('[iHeal] insertCoachMessage OK:', role, text.slice(0, 50))
    return true
  } catch (err) {
    console.error('[iHeal] insertCoachMessage EXCEPTION:', err)
    return false
  }
}

// ── Protocol items (Coach-editable) ────────────────────────────────────────
export async function fetchProtocolItems() {
  try {
    const { data, error } = await supabase
      .from('protocol_items')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
    if (error) { console.error('[iHeal] fetchProtocolItems FAILED:', error); return [] }
    return data || []
  } catch (err) {
    console.error('[iHeal] fetchProtocolItems EXCEPTION:', err)
    return []
  }
}

export async function upsertProtocolItem(item) {
  try {
    const { data, error } = await supabase
      .from('protocol_items')
      .upsert(item, { onConflict: 'key' })
      .select()
    if (error) { console.error('[iHeal] upsertProtocolItem FAILED:', error); return null }
    return data?.[0]
  } catch (err) {
    console.error('[iHeal] upsertProtocolItem EXCEPTION:', err)
    return null
  }
}

export async function deactivateProtocolItem(key) {
  try {
    const { error } = await supabase
      .from('protocol_items')
      .update({ active: false })
      .eq('key', key)
    if (error) console.error('[iHeal] deactivateProtocolItem FAILED:', error)
  } catch (err) {
    console.error('[iHeal] deactivateProtocolItem EXCEPTION:', err)
  }
}
