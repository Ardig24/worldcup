import { jwtDecode } from 'jwt-decode'

const ADMIN_EMAILS = ['dendritech.io@gmail.com']
const API_BASE_URL = 'https://v3.football.api-sports.io'
const PROVIDER = 'api-football'
const FINAL_STATUSES = new Set(['FT', 'AET', 'PEN'])
const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P'])

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

async function fetchApiFootball(path, params = {}) {
  const apiKey = requireEnv('API_FOOTBALL_KEY')
  const url = new URL(`${API_BASE_URL}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  const response = await fetch(url, {
    headers: {
      'x-apisports-key': apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`API-Football request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football error: ${JSON.stringify(data.errors)}`)
  }
  return data.response || []
}

function teamCode(name) {
  const cleaned = String(name || 'TBD').replace(/[^a-z]/gi, '').toUpperCase()
  return (cleaned || 'TBD').slice(0, 3).padEnd(3, 'X')
}

function mapStage(round) {
  const value = String(round || '').toLowerCase()
  if (value.includes('round of 16')) return 'round16'
  if (value.includes('quarter')) return 'quarter'
  if (value.includes('semi')) return 'semi'
  if (value.includes('third')) return 'third'
  if (value.includes('final')) return 'final'
  return 'group'
}

function mapStatus(shortStatus) {
  if (FINAL_STATUSES.has(shortStatus)) return 'final'
  if (LIVE_STATUSES.has(shortStatus)) return 'live'
  return 'scheduled'
}

function normalizeFixture(item) {
  const fixture = item.fixture || {}
  const teams = item.teams || {}
  const goals = item.goals || {}
  const league = item.league || {}
  const status = fixture.status || {}
  const homeName = teams.home?.name || 'TBD'
  const awayName = teams.away?.name || 'TBD'

  return {
    external_provider: PROVIDER,
    external_id: String(fixture.id),
    external_league_id: String(league.id || process.env.API_FOOTBALL_LEAGUE_ID || '1217'),
    external_season: String(league.season || process.env.API_FOOTBALL_SEASON || '2026'),
    home_team_code: teamCode(homeName),
    home_team_name: homeName,
    away_team_code: teamCode(awayName),
    away_team_name: awayName,
    match_date: fixture.date,
    venue: fixture.venue?.name || 'TBD',
    stage: mapStage(league.round),
    status: mapStatus(status.short),
    home_score: goals.home ?? null,
    away_score: goals.away ?? null,
    minute: status.elapsed ?? null,
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
    const points = predictionPoints(prediction.home_score, prediction.away_score, match.home_score, match.away_score)
    await db.update('predictions', `id=eq.${prediction.id}`, {
      points_earned: points,
      beat_ai: aiPoints === null ? false : points > aiPoints,
      updated_at: new Date().toISOString(),
    })
  }

  return { graded: predictions.length }
}

async function importFixtures() {
  const league = process.env.API_FOOTBALL_LEAGUE_ID || '1217'
  const season = process.env.API_FOOTBALL_SEASON || '2026'
  const fixtures = await fetchApiFootball('/fixtures', { league, season })
  const rows = fixtures.map(normalizeFixture)

  if (rows.length === 0) return { imported: 0, updated: 0, total: 0 }

  await db.upsert('matches', rows, 'external_provider,external_id')
  return { imported: rows.length, updated: rows.length, total: rows.length }
}

async function linkFixturesToExistingMatches() {
  const league = process.env.API_FOOTBALL_LEAGUE_ID || '1217'
  const season = process.env.API_FOOTBALL_SEASON || '2026'
  const fixtures = await fetchApiFootball('/fixtures', { league, season })

  const existingMatches = await db.select(
    'matches',
    'select=id,home_team_name,away_team_name,match_date,external_provider,external_id&external_provider=is.null'
  )

  if (!existingMatches || existingMatches.length === 0) {
    return { linked: 0, inserted: 0, total: fixtures.length, message: 'No existing matches to link' }
  }

  const existingMap = new Map()
  for (const match of existingMatches) {
    const key = `${match.home_team_name.toLowerCase()}-${match.away_team_name.toLowerCase()}-${match.match_date.slice(0, 10)}`
    existingMap.set(key, match)
  }

  let linked = 0
  let inserted = 0
  const toInsert = []

  for (const item of fixtures) {
    const normalized = normalizeFixture(item)
    const homeName = normalized.home_team_name.toLowerCase()
    const awayName = normalized.away_team_name.toLowerCase()
    const dateKey = normalized.match_date.slice(0, 10)
    const key = `${homeName}-${awayName}-${dateKey}`

    const existing = existingMap.get(key)
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
      existingMap.delete(key)
    } else {
      toInsert.push(normalized)
    }
  }

  if (toInsert.length > 0) {
    await db.insert('matches', toInsert)
    inserted = toInsert.length
  }

  return { linked, inserted, total: fixtures.length, remainingManual: existingMap.size }
}

async function syncResults(date) {
  const league = process.env.API_FOOTBALL_LEAGUE_ID || '1217'
  const season = process.env.API_FOOTBALL_SEASON || '2026'
  const fixtures = await fetchApiFootball('/fixtures', { league, season, date })
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
