import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageShell, Eyebrow } from '@/components/AppShell'
import { Plus, Loader2, Trash2, Upload, Brain } from 'lucide-react'
import { generateAIPredictionsForMatches } from '@/lib/openrouter'
import { useAuth } from '@/hooks/use-auth'

const ADMIN_EMAILS = ['dendritech.io@gmail.com']

export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [
      { title: 'Admin — ScoreBattle' },
      { name: 'description', content: 'Admin panel for managing match schedule' },
    ],
  }),
  component: Admin,
})

interface Match {
  home_team_code: string
  home_team_name: string
  away_team_code: string
  away_team_name: string
  match_date: string
  venue: string
  stage: string
}

function Admin() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [match, setMatch] = useState<Match>({
    home_team_code: '',
    home_team_name: '',
    away_team_code: '',
    away_team_name: '',
    match_date: '',
    venue: '',
    stage: 'group',
  })
  const [matches, setMatches] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && (!user || !ADMIN_EMAILS.includes(user.email ?? ''))) {
      navigate({ to: '/' })
    }
  }, [user, authLoading])

  if (authLoading || !user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return (
      <PageShell>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </PageShell>
    )
  }

  const stages = [
    { value: 'group', label: 'Group Stage' },
    { value: 'round16', label: 'Round of 16' },
    { value: 'quarter', label: 'Quarter-finals' },
    { value: 'semi', label: 'Semi-finals' },
    { value: 'third', label: 'Third-place' },
    { value: 'final', label: 'Final' },
  ]

  const venues = [
    'MetLife Stadium (New York)',
    'SoFi Stadium (Los Angeles)',
    'AT&T Stadium (Dallas)',
    'Arrowhead Stadium (Kansas City)',
    'Hard Rock Stadium (Miami)',
    'Lincoln Financial Field (Philadelphia)',
    'Mercedes-Benz Stadium (Atlanta)',
    'NRG Stadium (Houston)',
    'Allegiant Stadium (Las Vegas)',
    'Levi\'s Stadium (San Francisco)',
    'BC Place (Vancouver)',
    'BMO Field (Toronto)',
    'Estadio Azteca (Mexico City)',
    'Estadio Monterrey (Monterrey)',
    'Estadio Guadalajara (Guadalajara)',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.from('matches').insert({
        home_team_code: match.home_team_code.toUpperCase(),
        home_team_name: match.home_team_name,
        away_team_code: match.away_team_code.toUpperCase(),
        away_team_name: match.away_team_name,
        match_date: new Date(match.match_date).toISOString(),
        venue: match.venue,
        stage: match.stage,
        status: 'scheduled',
      })

      if (error) throw error

      setMatches([...matches, { ...match, id: crypto.randomUUID() }])
      setMatch({
        home_team_code: '',
        home_team_name: '',
        away_team_code: '',
        away_team_name: '',
        match_date: '',
        venue: '',
        stage: 'group',
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (index: number) => {
    setMatches(matches.filter((_, i) => i !== index))
  }

  const handleBulkInsert = async () => {
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.from('matches').insert(
        matches.map((m) => ({
          home_team_code: m.home_team_code.toUpperCase(),
          home_team_name: m.home_team_name,
          away_team_code: m.away_team_code.toUpperCase(),
          away_team_name: m.away_team_name,
          match_date: new Date(m.match_date).toISOString(),
          venue: m.venue,
          stage: m.stage,
          status: 'scheduled',
        }))
      )

      if (error) throw error

      alert('Matches inserted successfully!')
      setMatches([])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        let parsedData: any[] = []

        if (file.name.endsWith('.json')) {
          parsedData = JSON.parse(content)
        } else if (file.name.endsWith('.csv')) {
          parsedData = parseCSV(content)
        } else {
          setError('Unsupported file format. Use JSON or CSV.')
          return
        }

        // Validate and transform data
        const validMatches = parsedData.map((m: any) => ({
          home_team_code: m.home_team_code || m.homeCode,
          home_team_name: m.home_team_name || m.homeName,
          away_team_code: m.away_team_code || m.awayCode,
          away_team_name: m.away_team_name || m.awayName,
          match_date: m.match_date || m.date,
          venue: m.venue,
          stage: m.stage || 'group',
        })).filter((m: Match) => 
          m.home_team_code && m.home_team_name && 
          m.away_team_code && m.away_team_name && 
          m.match_date && m.venue
        )

        setMatches(validMatches)
        setError('')
      } catch (err: any) {
        setError('Failed to parse file: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  const handleGenerateAIPredictions = async () => {
    setError('')
    setLoading(true)

    try {
      // Fetch all matches that need AI predictions
      const { data: allMatches, error: matchesError } = await supabase
        .from('matches')
        .select('id, home_team_name, away_team_name, home_team_code, away_team_code, stage')
        .neq('home_team_code', '???')
        .neq('away_team_code', '???')

      if (matchesError) throw matchesError

      // Fetch existing AI predictions
      const { data: existingPredictions } = await supabase
        .from('ai_predictions')
        .select('match_id')

      const existingIds = new Set((existingPredictions || []).map((p: any) => p.match_id))
      const matchesWithoutAI = (allMatches || []).filter((m: any) => !existingIds.has(m.id))

      if (matchesWithoutAI.length === 0) {
        alert('All matches already have AI predictions!')
        setLoading(false)
        return
      }

      const confirmed = confirm(
        `Generate AI predictions for ${matchesWithoutAI.length} matches? This will use API tokens.`
      )
      if (!confirmed) {
        setLoading(false)
        return
      }

      const newPredictions = await generateAIPredictionsForMatches(matchesWithoutAI)

      let insertedCount = 0
      for (const [matchId, prediction] of newPredictions) {
        const { error: insertError } = await supabase.from('ai_predictions').insert({
          match_id: matchId,
          home_score: prediction.home_score,
          away_score: prediction.away_score,
          confidence: prediction.confidence,
          explanation: prediction.explanation,
          model_used: import.meta.env.VITE_OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
        })
        if (!insertError) insertedCount++
      }

      alert(`Generated ${insertedCount} AI predictions successfully!`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const parseCSV = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const obj: any = {}
      headers.forEach((h, i) => {
        obj[h] = values[i]
      })
      return obj
    })
  }

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Eyebrow tone="tomato">Admin Panel</Eyebrow>
          <h1 className="mt-4 font-display font-black text-5xl">
            Match Schedule
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter World Cup 2026 matches manually
          </p>

          <div className="mt-6">
            <button
              onClick={handleGenerateAIPredictions}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-pitch-deep text-paper font-medium hover:bg-ink transition stamp disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              Generate AI Predictions
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              Generates AI predictions for all matches that don't have one yet. Skips matches with placeholder teams.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-paper border-2 border-ink rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Home Team Code</label>
                <input
                  type="text"
                  value={match.home_team_code}
                  onChange={(e) => setMatch({ ...match, home_team_code: e.target.value })}
                  className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40"
                  placeholder="BRA"
                  required
                  maxLength={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Home Team Name</label>
                <input
                  type="text"
                  value={match.home_team_name}
                  onChange={(e) => setMatch({ ...match, home_team_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40"
                  placeholder="Brazil"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Away Team Code</label>
                <input
                  type="text"
                  value={match.away_team_code}
                  onChange={(e) => setMatch({ ...match, away_team_code: e.target.value })}
                  className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40"
                  placeholder="ARG"
                  required
                  maxLength={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Away Team Name</label>
                <input
                  type="text"
                  value={match.away_team_name}
                  onChange={(e) => setMatch({ ...match, away_team_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40"
                  placeholder="Argentina"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Match Date</label>
                <input
                  type="datetime-local"
                  value={match.match_date}
                  onChange={(e) => setMatch({ ...match, match_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stage</label>
                <select
                  value={match.stage}
                  onChange={(e) => setMatch({ ...match, stage: e.target.value })}
                  className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40"
                  required
                >
                  {stages.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Venue</label>
              <select
                value={match.venue}
                onChange={(e) => setMatch({ ...match, venue: e.target.value })}
                className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40"
                required
              >
                <option value="">Select venue</option>
                {venues.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 h-12 rounded-full bg-ink text-paper font-medium hover:bg-pitch-deep transition flex items-center justify-center gap-2 stamp disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Match to Queue
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-paper border-2 border-ink rounded-lg p-6 mb-8">
          <h2 className="font-display font-bold text-xl mb-4">
            Bulk Upload
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a JSON or CSV file with match data. Supported formats:
          </p>
          <pre className="text-xs bg-sunshine/20 p-3 rounded-md mb-4 overflow-x-auto">
            {`JSON: [{"home_team_code":"BRA","home_team_name":"Brazil","away_team_code":"ARG","away_team_name":"Argentina","match_date":"2026-06-11T18:00:00Z","venue":"MetLife Stadium (New York)","stage":"group"}]

CSV:
home_team_code,home_team_name,away_team_code,away_team_name,match_date,venue,stage
BRA,Brazil,ARG,Argentina,2026-06-11T18:00:00Z,MetLife Stadium (New York),group`}
          </pre>
          <div className="flex items-center gap-4">
            <label className="flex-1">
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="px-6 h-12 rounded-full border-2 border-dashed border-ink bg-paper hover:bg-sunshine/40 transition flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Choose JSON or CSV file
              </div>
            </label>
          </div>
        </div>

        {matches.length > 0 && (
          <div className="bg-paper border-2 border-ink rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl">
                Queue ({matches.length} matches)
              </h2>
              <button
                onClick={handleBulkInsert}
                disabled={loading}
                className="px-6 h-10 rounded-full bg-pitch text-paper font-medium hover:bg-pitch-deep transition stamp disabled:opacity-50"
              >
                {loading ? 'Inserting...' : 'Insert All'}
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {matches.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-sunshine/20 rounded-md"
                >
                  <div className="text-sm">
                    <span className="font-medium">{m.home_team_name}</span>
                    <span className="mx-2">vs</span>
                    <span className="font-medium">{m.away_team_name}</span>
                    <span className="ml-2 text-muted-foreground">({m.stage})</span>
                    <span className="ml-2 text-muted-foreground text-xs">{new Date(m.match_date).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(i)}
                    className="p-2 rounded-full hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate({ to: '/' })}
            className="px-6 h-10 rounded-full border-2 border-ink text-ink font-medium hover:bg-sunshine/40 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </PageShell>
  )
}
