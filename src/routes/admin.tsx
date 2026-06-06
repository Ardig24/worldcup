import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageShell, Eyebrow } from '@/components/AppShell'
import { Plus, Loader2, Trash2, Upload, Brain, Megaphone, RefreshCw, Trophy } from 'lucide-react'
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

interface Announcement {
  id: string
  title: string
  body: string
  active: boolean
  created_at: string
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
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementBody, setAnnouncementBody] = useState('')
  const [announcementLoading, setAnnouncementLoading] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [footballSyncLoading, setFootballSyncLoading] = useState<string | null>(null)
  const [footballSyncResult, setFootballSyncResult] = useState('')

  useEffect(() => {
    if (!authLoading && (!user || !ADMIN_EMAILS.includes(user.email ?? ''))) {
      navigate({ to: '/' })
    }
  }, [user, authLoading])

  useEffect(() => {
    if (user && ADMIN_EMAILS.includes(user.email ?? '')) {
      fetchAnnouncements()
    }
  }, [user?.id])

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

  const handleFootballSync = async (action: 'import-fixtures' | 'sync-results' | 'grade-finals') => {
    setError('')
    setFootballSyncResult('')
    setFootballSyncLoading(action)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error('Admin session is missing. Please sign in again.')

      const response = await fetch('/.netlify/functions/api-football-sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Football sync failed')

      setFootballSyncResult(JSON.stringify(result, null, 2))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFootballSyncLoading(null)
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

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setAnnouncementLoading(true)

    try {
      const { error } = await supabase.from('announcements').insert({
        title: announcementTitle.trim(),
        body: announcementBody.trim(),
        active: true,
        created_by: user.id,
      })

      if (error) throw error

      setAnnouncementTitle('')
      setAnnouncementBody('')
      await fetchAnnouncements()
      alert('Announcement posted successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAnnouncementLoading(false)
    }
  }

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, body, active, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      setError(error.message)
      return
    }

    setAnnouncements(data || [])
  }

  const handleToggleAnnouncement = async (announcement: Announcement) => {
    setError('')

    const { error } = await supabase
      .from('announcements')
      .update({ active: !announcement.active })
      .eq('id', announcement.id)

    if (error) {
      setError(error.message)
      return
    }

    setAnnouncements(prev => prev.map(item =>
      item.id === announcement.id ? { ...item, active: !item.active } : item
    ))
  }

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Delete this announcement? This cannot be undone.')) return
    setError('')

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId)

    if (error) {
      setError(error.message)
      return
    }

    setAnnouncements(prev => prev.filter(item => item.id !== announcementId))
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
            <div className="flex flex-wrap gap-3">
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
              <button
                onClick={() => handleFootballSync('import-fixtures')}
                disabled={!!footballSyncLoading}
                className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-ink text-paper font-medium hover:bg-pitch-deep transition stamp disabled:opacity-50"
              >
                {footballSyncLoading === 'import-fixtures' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Import API Fixtures
              </button>
              <button
                onClick={() => handleFootballSync('sync-results')}
                disabled={!!footballSyncLoading}
                className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-tomato text-paper font-medium hover:bg-ink transition stamp disabled:opacity-50"
              >
                {footballSyncLoading === 'sync-results' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Sync Today's Results
              </button>
              <button
                onClick={() => handleFootballSync('grade-finals')}
                disabled={!!footballSyncLoading}
                className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-sunshine text-ink border-2 border-ink font-medium hover:bg-paper transition stamp disabled:opacity-50"
              >
                {footballSyncLoading === 'grade-finals' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                Grade Finals
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Import fixtures once, sync final results after matches, then grade predictions for leaderboard points.
            </p>
            {footballSyncResult && (
              <pre className="mt-3 text-xs bg-sunshine/20 p-3 rounded-md overflow-x-auto">
                {footballSyncResult}
              </pre>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-paper border-2 border-ink rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-sunshine border-2 border-ink flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">News notification</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Post a message users will see once in a modal after logging in.
              </p>
            </div>
          </div>

          <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40"
                placeholder="New feature is live"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={announcementBody}
                onChange={(e) => setAnnouncementBody(e.target.value)}
                className="w-full min-h-32 px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40"
                placeholder="Write the news you want users to see..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={announcementLoading}
              className="w-full px-6 h-12 rounded-full bg-tomato text-paper font-medium hover:bg-ink transition flex items-center justify-center gap-2 stamp disabled:opacity-50"
            >
              {announcementLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Megaphone className="w-4 h-4" />
                  Post notification
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t-2 border-ink/10 pt-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-display font-bold text-lg">Recent announcements</h3>
              <button
                onClick={fetchAnnouncements}
                className="px-3 h-8 rounded-full border-2 border-ink/20 text-xs font-medium hover:border-ink transition"
              >
                Refresh
              </button>
            </div>

            {announcements.length === 0 ? (
              <div className="text-sm text-muted-foreground bg-sunshine/20 rounded-md p-4">
                No announcements yet.
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="rounded-md border-2 border-ink/10 bg-chalk p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-bold text-lg">{announcement.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono-num uppercase tracking-widest ${
                            announcement.active ? 'bg-pitch-deep text-paper' : 'bg-ink/10 text-muted-foreground'
                          }`}>
                            {announcement.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(announcement.created_at).toLocaleString()}
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
                          {announcement.body}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleAnnouncement(announcement)}
                          className={`px-3 h-8 rounded-full text-xs font-medium transition ${
                            announcement.active
                              ? 'border-2 border-ink/20 hover:border-ink'
                              : 'bg-pitch-deep text-paper hover:bg-ink'
                          }`}
                        >
                          {announcement.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          className="px-3 h-8 rounded-full bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
