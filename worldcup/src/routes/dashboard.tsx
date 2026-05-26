import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell, Eyebrow, Flag } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { generateAIPredictionsForMatches } from "@/lib/openrouter";
import { TEAM_GROUPS, ALL_GROUPS, STAGE_LABELS } from "@/lib/groups";
import { getFlag } from "@/lib/flags";
import { AuthModal } from "@/components/AuthModal";
import { Brain, Lock, Plus, Minus, TrendingUp, Target, CheckCircle2, Clock, ChevronRight, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Matches — ScoreBattle" },
      { name: "description", content: "Predict the next World Cup 2026 fixtures and track your form." },
    ],
  }),
  component: Dashboard,
});

type Match = {
  id: string;
  stage: string;
  date: string;
  time: string;
  venue: string;
  home: { code: string; name: string; abbr: string };
  away: { code: string; name: string; abbr: string };
  ai: [number, number];
  conf: number;
  status: "open" | "locked" | "live" | "final";
  liveMin?: string;
  finalScore?: [number, number];
  yourScore?: [number, number];
  pts?: number;
  dbId?: string;
};

type DBMatch = {
  id: string;
  home_team_code: string;
  home_team_name: string;
  away_team_code: string;
  away_team_name: string;
  match_date: string;
  venue: string;
  stage: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  minute: number | null;
};

type DBPrediction = {
  id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  points_earned: number;
  beat_ai: boolean;
};

type FilterMode = 'all' | 'date' | 'group' | 'stage';

function Dashboard() {
  const { user } = useAuth();
  const supabase = createClient();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, DBPrediction>>({});
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [filterValue, setFilterValue] = useState<string>('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, [user?.id]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true });

      if (matchesError) throw matchesError;

      let predictionsMap: Record<string, DBPrediction> = {};
      if (user) {
        const { data: predictionsData, error: predictionsError } = await supabase
          .from('predictions')
          .select('*')
          .eq('user_id', user.id);

        if (!predictionsError) {
          predictionsData?.forEach((p: DBPrediction) => {
            predictionsMap[p.match_id] = p;
          });
        }
      }

      setPredictions(predictionsMap);

      // Fetch AI predictions
      const { data: aiPredictionsData } = await supabase
        .from('ai_predictions')
        .select('*');

      const aiPredictionsMap: Record<string, { scores: [number, number]; conf: number }> = {};
      aiPredictionsData?.forEach((ai: any) => {
        aiPredictionsMap[ai.match_id] = {
          scores: [ai.home_score, ai.away_score],
          conf: ai.confidence,
        };
      });

      // AI predictions are generated on-demand via the "Generate AI" button
      // and stored in the database to be shared with all users.

      const formattedMatches: Match[] = matchesData?.map((m: DBMatch) => {
        const date = new Date(m.match_date);
        const prediction = predictionsMap[m.id];
        const aiPred = aiPredictionsMap[m.id] || { scores: [1, 1], conf: 50 };
        
        return {
          id: m.id,
          dbId: m.id,
          stage: m.stage,
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          venue: m.venue,
          home: { code: getFlag(m.home_team_code), name: m.home_team_name, abbr: m.home_team_code },
          away: { code: getFlag(m.away_team_code), name: m.away_team_name, abbr: m.away_team_code },
          ai: aiPred.scores as [number, number],
          conf: aiPred.conf,
          status: m.status === 'scheduled' ? 'open' : m.status === 'live' ? 'live' : 'final',
          liveMin: m.minute ? `${m.minute}'` : undefined,
          finalScore: m.home_score !== null && m.away_score !== null ? [m.home_score, m.away_score] : undefined,
          yourScore: prediction ? [prediction.home_score, prediction.away_score] : undefined,
          pts: prediction?.points_earned,
        };
      }) || [];

      setMatches(formattedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrediction = async (matchId: string, homeScore: number, awayScore: number) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('predictions')
        .upsert({
          user_id: user.id,
          match_id: matchId,
          home_score: homeScore,
          away_score: awayScore,
          locked_at: new Date().toISOString(),
        }, { onConflict: 'user_id,match_id' })
        .select()
        .single();

      if (error) throw error;

      setPredictions(prev => ({
        ...prev,
        [matchId]: data,
      }));

      setMatches(prev => prev.map(m =>
        m.id === matchId
          ? { ...m, yourScore: [homeScore, awayScore] as [number, number] }
          : m
      ));
    } catch (error) {
      console.error('Error saving prediction:', error);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </PageShell>
    );
  }

  const userPredictions = Object.values(predictions);
  const totalPoints = userPredictions.reduce((sum, p) => sum + (p.points_earned || 0), 0);
  const finishedPredictions = userPredictions.filter((p) => p.points_earned !== null && p.points_earned !== undefined);
  const exactScores = finishedPredictions.filter((p) => p.points_earned >= 3).length;
  const beatAICount = userPredictions.filter((p) => p.beat_ai).length;
  const totalFinals = matches.filter((m) => m.status === 'final').length;
  const accuracy = finishedPredictions.length > 0
    ? Math.round((finishedPredictions.reduce((s, p) => s + (p.points_earned || 0), 0) / (finishedPredictions.length * 3)) * 100)
    : 0;

  const stats = [
    { l: "Total points", v: String(totalPoints), h: userPredictions.length > 0 ? `${userPredictions.length} picks` : "Start predicting", icon: TrendingUp },
    { l: "Accuracy", v: `${accuracy}%`, h: `${finishedPredictions.length} graded`, icon: Target },
    { l: "Exact scores", v: String(exactScores), h: `of ${totalFinals} finals`, icon: CheckCircle2 },
    { l: "Beat the AI", v: `${beatAICount}×`, h: `from ${userPredictions.length} picks`, icon: Brain },
  ];

  return (
    <PageShell>
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-4 border-b-2 border-ink/10 pb-8">
          <div>
            <Eyebrow tone="tomato">Matchday Dashboard</Eyebrow>
            <h1 className="mt-3 font-display font-black text-5xl lg:text-6xl leading-[0.95]">
              Good evening, <span className="italic">Tipster.</span>
            </h1>
            <p className="mt-3 text-muted-foreground">
              {matches.filter(m => m.status === 'open').length} fixtures open for predictions. Lock them before kick-off.
            </p>
          </div>
        </div>

        {/* Stat strip */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.l} className="bg-chalk border-2 border-ink rounded-md p-5 relative overflow-hidden">
              <s.icon className="absolute right-4 top-4 w-5 h-5 text-muted-foreground" />
              <div className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground">{s.l}</div>
              <div className="mt-1 font-score text-5xl text-foreground">{s.v}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.h}</div>
            </div>
          ))}
        </div>

        {/* Live */}
        {matches.filter(m => m.status === 'live').length > 0 && (
          <div className="mt-12">
            <SectionHeader eyebrow="Now playing" title="Live" tone="tomato" />
            <div className="mt-5 space-y-4">
              {matches.filter(m => m.status === 'live').map((m) => (
                <LiveMatchCard key={m.id} m={m} />
              ))}
            </div>
          </div>
        )}

        {/* Open predictions */}
        <div className="mt-12">
          <SectionHeader eyebrow="Open for predictions" title="Up next" />

          {/* Filter Tabs */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-b-2 border-ink/10 pb-4">
            <FilterTab active={filterMode === 'all'} onClick={() => { setFilterMode('all'); setFilterValue(''); }}>
              All matches
            </FilterTab>
            <FilterTab active={filterMode === 'date'} onClick={() => { setFilterMode('date'); setFilterValue(''); }}>
              By date
            </FilterTab>
            <FilterTab active={filterMode === 'group'} onClick={() => { setFilterMode('group'); setFilterValue(''); }}>
              By group
            </FilterTab>
            <FilterTab active={filterMode === 'stage'} onClick={() => { setFilterMode('stage'); setFilterValue(''); }}>
              By stage
            </FilterTab>
          </div>

          {/* Filter sub-options */}
          {filterMode === 'group' && (
            <div className="mt-4 flex flex-wrap gap-2">
              {ALL_GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterValue(filterValue === g ? '' : g)}
                  className={`px-4 h-9 rounded-full text-sm font-medium border-2 transition ${
                    filterValue === g ? 'bg-ink text-paper border-ink' : 'border-ink/20 hover:border-ink'
                  }`}
                >
                  Group {g}
                </button>
              ))}
            </div>
          )}

          {filterMode === 'stage' && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(STAGE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterValue(filterValue === key ? '' : key)}
                  className={`px-4 h-9 rounded-full text-sm font-medium border-2 transition ${
                    filterValue === key ? 'bg-ink text-paper border-ink' : 'border-ink/20 hover:border-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {filterMode === 'date' && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from(new Set(matches.filter(m => m.status === 'open').map(m => m.date))).map((date) => (
                <button
                  key={date}
                  onClick={() => setFilterValue(filterValue === date ? '' : date)}
                  className={`px-4 h-9 rounded-full text-sm font-medium border-2 transition ${
                    filterValue === date ? 'bg-ink text-paper border-ink' : 'border-ink/20 hover:border-ink'
                  }`}
                >
                  {date}
                </button>
              ))}
            </div>
          )}

          {/* Filtered matches */}
          <div className="mt-5 space-y-4">
            {(() => {
              const openMatches = matches.filter(m => m.status === 'open');
              let filtered = openMatches;

              if (filterMode === 'group' && filterValue) {
                filtered = openMatches.filter(m => 
                  TEAM_GROUPS[m.home.abbr] === filterValue || TEAM_GROUPS[m.away.abbr] === filterValue
                );
              } else if (filterMode === 'stage' && filterValue) {
                filtered = openMatches.filter(m => m.stage === filterValue);
              } else if (filterMode === 'date' && filterValue) {
                filtered = openMatches.filter(m => m.date === filterValue);
              }

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-12 text-muted-foreground">
                    {openMatches.length === 0
                      ? 'No matches available for prediction. Use the admin panel to add matches.'
                      : 'No matches match the selected filter.'}
                  </div>
                );
              }

              // When filtering by group, show group-style grid output; default uses PredictRow
              return filtered.map((m) => (
                <PredictRow key={m.id} m={m} onSave={handlePrediction} />
              ));
            })()}
          </div>
        </div>

        {/* Recent results */}
        <div className="mt-12">
          <SectionHeader eyebrow="Closed book" title="Your recent picks" />
          <div className="mt-5 space-y-3">
            {matches.filter(m => m.status === 'final').length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No finished matches yet.
              </div>
            ) : (
              matches.filter(m => m.status === 'final').map((m) => (
                <ResultRow key={m.id} m={m} />
              ))
            )}
          </div>
        </div>
      </div>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign in to predict"
        description="Create a free account to lock in predictions and earn points."
      />
    </PageShell>
  );
}

function FilterTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium transition ${
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
      {active && <span className="absolute left-3 right-3 -bottom-[18px] h-0.5 bg-tomato" />}
    </button>
  );
}

function SectionHeader({ eyebrow, title, tone }: { eyebrow: string; title: string; tone?: "tomato" | "pitch" }) {
  return (
    <div className="flex items-end justify-between border-b border-ink/15 pb-3">
      <div>
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        <h2 className="mt-1 font-display font-black text-3xl">{title}</h2>
      </div>
    </div>
  );
}

function LiveMatchCard({ m }: { m: Match }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 translate-x-2 translate-y-2 bg-tomato rounded-md" />
      <div className="relative pitch-bg border-2 border-ink rounded-md p-8 text-paper">
        <div className="flex items-center justify-between text-[11px] font-mono-num uppercase tracking-[0.2em]">
          <span>{m.stage}</span>
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sunshine animate-pulse" /> {m.liveMin}
          </span>
        </div>
        <div className="mt-6 grid grid-cols-3 items-center">
          <div className="text-center">
            <Flag code={m.home.code} size="lg" />
            <div className="mt-3 font-display font-bold text-2xl">{m.home.name}</div>
          </div>
          <div className="text-center">
            <div className="font-score text-8xl leading-none">
              {m.finalScore ? `${m.finalScore[0]}—${m.finalScore[1]}` : '—'}
            </div>
            {m.yourScore && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper/15 border border-paper/30 text-xs">
                <span className="opacity-70">Your pick:</span>
                <span className="font-score text-base">{m.yourScore[0]}—{m.yourScore[1]}</span>
              </div>
            )}
          </div>
          <div className="text-center">
            <Flag code={m.away.code} size="lg" />
            <div className="mt-3 font-display font-bold text-2xl">{m.away.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PredictRow({ m, onSave }: { m: Match; onSave: (matchId: string, homeScore: number, awayScore: number) => void }) {
  const { user } = useAuth();
  const [h, setH] = useState(m.yourScore?.[0] ?? m.ai[0]);
  const [a, setA] = useState(m.yourScore?.[1] ?? m.ai[1]);
  const [locked, setLocked] = useState(!!m.yourScore);

  useEffect(() => {
    if (m.yourScore) {
      setH(m.yourScore[0]);
      setA(m.yourScore[1]);
      setLocked(true);
    } else {
      setH(m.ai[0]);
      setA(m.ai[1]);
      setLocked(false);
    }
  }, [m.id, m.yourScore?.[0], m.yourScore?.[1]]);

  const handleLock = () => {
    if (!user) {
      onSave(m.dbId || m.id, h, a); // delegates to parent which opens modal
      return;
    }
    if (!locked && m.dbId) {
      onSave(m.dbId, h, a);
      setLocked(true);
    }
  };

  return (
    <div className={`bg-chalk border-2 ${locked ? "border-pitch-deep" : "border-ink"} rounded-md overflow-hidden transition`}>
      <div className="px-5 py-2 bg-secondary/60 flex items-center justify-between text-[11px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground border-b border-ink/10">
        <span>{m.stage}</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="w-3 h-3" /> {m.date} · {m.time} · {m.venue}</span>
      </div>
      <div className="grid lg:grid-cols-12 items-center gap-4 p-5">
        <div className="lg:col-span-4 flex items-center gap-3 justify-end text-right">
          <div>
            <div className="font-display font-bold text-lg">{m.home.name}</div>
            <div className="text-[11px] font-mono-num uppercase tracking-widest text-muted-foreground">{m.home.abbr}</div>
          </div>
          <Flag code={m.home.code} />
        </div>
        <div className="lg:col-span-4 flex items-center justify-center gap-2">
          <NumPicker v={h} on={setH} disabled={locked} />
          <span className="font-score text-3xl text-muted-foreground">—</span>
          <NumPicker v={a} on={setA} disabled={locked} />
        </div>
        <div className="lg:col-span-4 flex items-center gap-3">
          <Flag code={m.away.code} />
          <div>
            <div className="font-display font-bold text-lg">{m.away.name}</div>
            <div className="text-[11px] font-mono-num uppercase tracking-widest text-muted-foreground">{m.away.abbr}</div>
          </div>
        </div>
      </div>
      <div className="px-5 py-3 bg-secondary/30 border-t border-ink/10 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Brain className="w-4 h-4 text-tomato" />
          <span className="text-muted-foreground">AI:</span>
          <span className="font-score text-lg">{m.ai[0]} — {m.ai[1]}</span>
          <span className="text-xs font-mono-num text-tomato">{m.conf}%</span>
        </div>
        <button
          onClick={handleLock}
          disabled={locked}
          className={`inline-flex items-center gap-1.5 px-4 h-9 rounded-full text-sm font-medium transition stamp ${locked ? "bg-pitch-deep text-paper" : "bg-ink text-paper hover:bg-pitch-deep"} disabled:opacity-50`}
        >
          {locked ? <><CheckCircle2 className="w-3.5 h-3.5" /> Locked</> : <><Lock className="w-3.5 h-3.5" /> Lock prediction</>}
        </button>
      </div>
    </div>
  );
}

function NumPicker({ v, on, disabled }: { v: number; on: (n: number) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        disabled={disabled}
        onClick={() => on(v + 1)}
        className="w-7 h-7 rounded-full border-2 border-ink hover:bg-sunshine disabled:opacity-30 transition flex items-center justify-center"
      >
        <Plus className="w-3 h-3" />
      </button>
      <div className={`font-score text-5xl leading-none w-12 text-center ${disabled ? "text-muted-foreground" : "text-pitch-deep"}`}>{v}</div>
      <button
        disabled={disabled}
        onClick={() => on(Math.max(0, v - 1))}
        className="w-7 h-7 rounded-full border-2 border-ink hover:bg-sunshine disabled:opacity-30 transition flex items-center justify-center"
      >
        <Minus className="w-3 h-3" />
      </button>
    </div>
  );
}

function ResultRow({ m }: { m: Match }) {
  const won = (m.pts ?? 0) >= 3;
  return (
    <div className="bg-chalk border border-ink/20 rounded-md p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <Flag code={m.home.code} size="sm" />
        <div className="font-medium truncate">{m.home.name} <span className="text-muted-foreground">vs</span> {m.away.name}</div>
        <Flag code={m.away.code} size="sm" />
      </div>
      <div className="hidden sm:flex items-center gap-6 text-xs font-mono-num uppercase tracking-widest text-muted-foreground">
        <span>You <span className="font-score text-base text-foreground">{m.yourScore![0]}-{m.yourScore![1]}</span></span>
        <span>Final <span className="font-score text-base text-foreground">{m.finalScore![0]}-{m.finalScore![1]}</span></span>
      </div>
      <div className={`px-3 h-9 inline-flex items-center rounded-full font-score text-2xl ${won ? "bg-pitch-deep text-paper" : "bg-secondary text-foreground"}`}>
        +{m.pts}
      </div>
    </div>
  );
}
