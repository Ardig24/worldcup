import { jwtDecode } from 'jwt-decode'

const ADMIN_EMAILS = ['dendritech.io@gmail.com']
const API_BASE_URL = 'https://api.football-data.org/v4'
const PROVIDER = 'football-data'
const FINAL_STATUSES = new Set(['FINISHED', 'AWARDED'])
const LIVE_STATUSES = new Set(['IN_PLAY', 'PAUSED'])

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is missing`)
  return value
}

function dbConfig() {
  return {
    url: requireEnv('VITE_SUPABASE_URL').replace(/\/$/, ''),
    key: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  }
}

async function dbRequest(method, table, { query = '', body, prefer } = {}) {
  const { url, key } = dbConfig()
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
  if (prefer) headers.Prefer = prefer

  const response = await fetch(`${url}/rest/v1/${table}${query ? `?${query}` : ''}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Supabase ${method} ${table} failed: ${response.status} ${text}`)
  }
  return text ? JSON.parse(text) : null
}

const db = {
  select: (table, query) => dbRequest('GET', table, { query }),
  insert: (table, rows) =>
    dbRequest('POST', table, { body: rows, prefer: 'return=representation' }),
  update: (table, query, body) =>
    dbRequest('PATCH', table, { query, body, prefer: 'return=representation' }),
  upsert: (table, rows, onConflict) =>
    dbRequest('POST', table, {
      query: onConflict ? `on_conflict=${onConflict}` : '',
      body: rows,
      prefer: 'resolution=merge-duplicates,return=representation',
    }),
}

async function requireAdmin(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) throw new Error('Missing authorization token')

  try {
    const decoded = jwtDecode(token)
    if (!decoded.email) throw new Error('Invalid token: no email')
    if (!ADMIN_EMAILS.includes(decoded.email)) throw new Error('Admin access required')
    return decoded
  } catch (error) {
    throw new Error('Invalid authorization token')
  }
}

async function fetchFootballData(path, params = {}) {
  const apiKey = requireEnv('FOOTBALL_DATA_KEY')
  const url = new URL(`${API_BASE_URL}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  const response = await fetch(url, {
    headers: {
      'X-Auth-Token': apiKey,
    },
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`football-data request failed: ${response.status} ${text}`)
  }

  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(`football-data returned non-JSON response: ${text.slice(0, 200)}`)
  }

  if (data.message || data.errorCode) {
    throw new Error(`football-data error ${data.errorCode || ''}: ${data.message || 'unknown'}`)
  }

  return data.matches || []
}

function teamCode(team) {
  if (team?.tla) return String(team.tla).toUpperCase().slice(0, 3).padEnd(3, 'X')
  const cleaned = String(team?.name || 'TBD').replace(/[^a-z]/gi, '').toUpperCase()
  return (cleaned || 'TBD').slice(0, 3).padEnd(3, 'X')
}

const TEAM_ALIASES = {
  'turkiye': 'turkey',
  'bosnia and herzegovina': 'bosnia-herzegovina',
  'cabo verde': 'cape verde islands',
  'cape verde': 'cape verde islands',
  'south korea': 'south korea',
  'korea republic': 'south korea',
  'czech republic': 'czechia',
  'usa': 'united states',
  'ir iran': 'iran',
}

function normalizeTeamName(name) {
  const base = String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
  const aliased = TEAM_ALIASES[base] || base
  return aliased.replace(/[^a-z0-9]/g, '')
}

function pairKey(homeName, awayName) {
  return `${normalizeTeamName(homeName)}-${normalizeTeamName(awayName)}`
}

function mapStage(stage) {
  const value = String(stage || '').toUpperCase()
  if (value === 'LAST_32') return 'round_of_32'
  if (value === 'LAST_16') return 'round_of_16'
  if (value === 'QUARTER_FINALS') return 'quarterfinal'
  if (value === 'SEMI_FINALS') return 'semifinal'
  if (value === 'THIRD_PLACE') return 'third_place'
  if (value === 'FINAL') return 'final'
  return 'group'
}

function mapStatus(status) {
  if (FINAL_STATUSES.has(status)) return 'final'
  if (LIVE_STATUSES.has(status)) return 'live'
  return 'scheduled'
}

function normalizeFixture(item) {
  const home = item.homeTeam || {}
  const away = item.awayTeam || {}
  const score = item.score || {}
  const fullTime = score.fullTime || {}
  const competition = item.competition || {}
  const season = item.season || {}
  const homeName = home.name || 'TBD'
  const awayName = away.name || 'TBD'
  const seasonYear = season.startDate ? season.startDate.slice(0, 4) : (process.env.FOOTBALL_DATA_SEASON || '2026')

  return {
    external_provider: PROVIDER,
    external_id: String(item.id),
    external_league_id: String(competition.code || competition.id || process.env.FOOTBALL_DATA_COMPETITION || 'WC'),
    external_season: String(seasonYear),
    home_team_code: teamCode(home),
    home_team_name: homeName,
    away_team_code: teamCode(away),
    away_team_name: awayName,
    match_date: item.utcDate,
    venue: item.venue || 'TBD',
    stage: mapStage(item.stage),
    status: mapStatus(item.status),
    home_score: fullTime.home ?? null,
    away_score: fullTime.away ?? null,
    minute: item.minute ?? null,
    last_synced_at: new Date().toISOString(),
  }
}

function predictionPoints(predictedHome, predictedAway, actualHome, actualAway) {
  if (predictedHome === actualHome && predictedAway === actualAway) return 3

  const predictedOutcome = Math.sign(predictedHome - predictedAway)
  const actualOutcome = Math.sign(actualHome - actualAway)
  return predictedOutcome === actualOutcome ? 1 : 0
}

async function gradeMatch(match) {
  if (match.status !== 'final' || match.home_score === null || match.away_score === null) {
    return { graded: 0 }
  }

  const predictions = await db.select(
    'predictions',
    `select=id,home_score,away_score&match_id=eq.${match.id}`
  )

  if (!predictions || predictions.length === 0) return { graded: 0 }

  const aiPredictions = await db.select(
    'ai_predictions',
    `select=home_score,away_score&match_id=eq.${match.id}&limit=1`
  )
  const aiPrediction = aiPredictions && aiPredictions[0]

  const aiPoints = aiPrediction
    ? predictionPoints(aiPrediction.home_score, aiPrediction.away_score, match.home_score, match.away_score)
    : null

  for (const prediction of predictions) {
    const basePoints = predictionPoints(prediction.home_score, prediction.away_score, match.home_score, match.away_score)
    const beatAi = aiPoints !== null && basePoints > aiPoints
    const points = basePoints + (beatAi ? 1 : 0)
    await db.update('predictions', `id=eq.${prediction.id}`, {
      points_earned: points,
      beat_ai: beatAi,
      updated_at: new Date().toISOString(),
    })
  }

  return { graded: predictions.length }
}

async function importFixtures() {
  const competition = process.env.FOOTBALL_DATA_COMPETITION || 'WC'
  const fixtures = await fetchFootballData(`/competitions/${competition}/matches`)
  const rows = fixtures.map(normalizeFixture)

  if (rows.length === 0) return { imported: 0, updated: 0, total: 0 }

  await db.upsert('matches', rows, 'external_provider,external_id')
  return { imported: rows.length, updated: rows.length, total: rows.length }
}

async function linkFixturesToExistingMatches() {
  const competition = process.env.FOOTBALL_DATA_COMPETITION || 'WC'
  const fixtures = await fetchFootballData(`/competitions/${competition}/matches`)

  // All existing matches: used to detect already-linked external_ids (idempotency)
  const allMatches = await db.select(
    'matches',
    'select=id,home_team_name,away_team_name,match_date,stage,external_provider,external_id'
  )

  const linkedExternalIds = new Set(
    (allMatches || [])
      .filter((m) => m.external_id)
      .map((m) => String(m.external_id))
  )

  // Unlinked GROUP-stage matches, keyed by normalized team-pair (date-agnostic)
  const groupPairMap = new Map()
  for (const match of allMatches || []) {
    if (match.external_provider) continue
    if (match.stage !== 'group') continue
    groupPairMap.set(pairKey(match.home_team_name, match.away_team_name), match)
  }

  let linked = 0
  let inserted = 0
  let skipped = 0
  let knockoutsPending = 0
  const toInsert = []

  for (const item of fixtures) {
    const normalized = normalizeFixture(item)

    // Already linked to a DB row → skip (idempotent)
    if (linkedExternalIds.has(String(normalized.external_id))) {
      skipped += 1
      continue
    }

    // Knockouts handled separately (link-knockouts action)
    if (normalized.stage !== 'group') {
      knockoutsPending += 1
      continue
    }

    const key = pairKey(normalized.home_team_name, normalized.away_team_name)
    const existing = groupPairMap.get(key)
    if (existing) {
      await db.update('matches', `id=eq.${existing.id}`, {
        external_provider: normalized.external_provider,
        external_id: normalized.external_id,
        external_league_id: normalized.external_league_id,
        external_season: normalized.external_season,
        venue: normalized.venue,
        last_synced_at: normalized.last_synced_at,
      })
      linked += 1
      groupPairMap.delete(key)
    } else {
      toInsert.push(normalized)
    }
  }

  if (toInsert.length > 0) {
    await db.insert('matches', toInsert)
    inserted = toInsert.length
  }

  return {
    linked,
    inserted,
    skipped,
    knockoutsPending,
    total: fixtures.length,
    remainingUnlinkedGroup: groupPairMap.size,
  }
}

async function linkKnockoutFixtures() {
  const competition = process.env.FOOTBALL_DATA_COMPETITION || 'WC'
  const fixtures = await fetchFootballData(`/competitions/${competition}/matches`)

  const allMatches = await db.select(
    'matches',
    'select=id,home_team_name,away_team_name,match_date,stage,external_provider,external_id'
  )

  const linkedExternalIds = new Set(
    (allMatches || []).filter((m) => m.external_id).map((m) => String(m.external_id))
  )

  // App knockout stages mapped to API normalized stages (same names via mapStage)
  const knockoutStages = ['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']

  // Group unlinked CSV knockout rows by stage, ordered by date
  const csvByStage = {}
  for (const m of allMatches || []) {
    if (m.external_provider) continue
    if (!knockoutStages.includes(m.stage)) continue
    ;(csvByStage[m.stage] ||= []).push(m)
  }
  for (const stage of knockoutStages) {
    if (csvByStage[stage]) csvByStage[stage].sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
  }

  // Group API knockout fixtures by stage, ordered by date, excluding already-linked
  const apiByStage = {}
  for (const item of fixtures) {
    const normalized = normalizeFixture(item)
    if (linkedExternalIds.has(String(normalized.external_id))) continue
    if (!knockoutStages.includes(normalized.stage)) continue
    ;(apiByStage[normalized.stage] ||= []).push(normalized)
  }
  for (const stage of knockoutStages) {
    if (apiByStage[stage]) apiByStage[stage].sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
  }

  let linked = 0
  const perStage = {}
  for (const stage of knockoutStages) {
    const csvRows = csvByStage[stage] || []
    const apiRows = apiByStage[stage] || []
    const count = Math.min(csvRows.length, apiRows.length)
    for (let i = 0; i < count; i += 1) {
      const target = csvRows[i]
      const src = apiRows[i]
      await db.update('matches', `id=eq.${target.id}`, {
        external_provider: src.external_provider,
        external_id: src.external_id,
        external_league_id: src.external_league_id,
        external_season: src.external_season,
        venue: src.venue,
        last_synced_at: src.last_synced_at,
      })
      linked += 1
    }
    perStage[stage] = { csv: csvRows.length, api: apiRows.length, linked: count }
  }

  return { linked, perStage }
}

async function syncSchedule() {
  const competition = process.env.FOOTBALL_DATA_COMPETITION || 'WC'
  const fixtures = await fetchFootballData(`/competitions/${competition}/matches`)

  const allMatches = await db.select('matches', 'select=id,external_id,external_provider')
  const byExternalId = new Map()
  for (const m of allMatches || []) {
    if (m.external_id) byExternalId.set(String(m.external_id), m)
  }

  let updated = 0
  let unmatched = 0
  for (const item of fixtures) {
    const normalized = normalizeFixture(item)
    const target = byExternalId.get(String(normalized.external_id))
    if (!target) {
      unmatched += 1
      continue
    }

    const patch = {
      match_date: normalized.match_date,
      last_synced_at: normalized.last_synced_at,
    }
    if (normalized.venue && normalized.venue !== 'TBD') {
      patch.venue = normalized.venue
    }

    await db.update('matches', `id=eq.${target.id}`, patch)
    updated += 1
  }

  return { updated, unmatched, total: fixtures.length }
}

async function syncResults(date) {
  const competition = process.env.FOOTBALL_DATA_COMPETITION || 'WC'
  const fixtures = await fetchFootballData(`/competitions/${competition}/matches`, {
    dateFrom: date,
    dateTo: date,
  })
  const rows = fixtures.map(normalizeFixture)
  let updated = 0
  let finalized = 0
  let graded = 0

  for (const row of rows) {
    const result = await db.upsert('matches', row, 'external_provider,external_id')
    const saved = Array.isArray(result) ? result[0] : result
    updated += 1

    if (saved && saved.status === 'final') {
      finalized += 1
      const gradeResult = await gradeMatch(saved)
      graded += gradeResult.graded
    }
  }

  return { updated, finalized, graded, total: rows.length, date }
}

async function gradeFinalMatches() {
  const matches = await db.select(
    'matches',
    'select=id,status,home_score,away_score&status=eq.final'
  )

  let graded = 0
  for (const match of matches || []) {
    const result = await gradeMatch(match)
    graded += result.graded
  }

  return { finalMatches: matches?.length || 0, graded }
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  try {
    await requireAdmin(event)

    const body = event.body ? JSON.parse(event.body) : {}
    const action = body.action

    if (action === 'link-fixtures') {
      const result = await linkFixturesToExistingMatches()
      return json(200, { ok: true, action, ...result })
    }

    if (action === 'link-knockouts') {
      const result = await linkKnockoutFixtures()
      return json(200, { ok: true, action, ...result })
    }

    if (action === 'sync-schedule') {
      const result = await syncSchedule()
      return json(200, { ok: true, action, ...result })
    }

    if (action === 'import-fixtures') {
      const result = await importFixtures()
      return json(200, { ok: true, action, ...result })
    }

    if (action === 'sync-results') {
      const date = body.date || new Date().toISOString().slice(0, 10)
      const result = await syncResults(date)
      return json(200, { ok: true, action, ...result })
    }

    if (action === 'grade-finals') {
      const result = await gradeFinalMatches()
      return json(200, { ok: true, action, ...result })
    }

    return json(400, { error: 'Unknown action' })
  } catch (error) {
    return json(500, { error: error.message || 'Unexpected error' })
  }
}
