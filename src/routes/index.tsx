import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell, Eyebrow, Flag } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/client";
import { getFlag } from "@/lib/flags";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/AuthModal";
import { ArrowRight, Brain, Lock, Trophy, Users, Globe2, Flame, Plus, Minus, Quote } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScoreBattle — The World Cup 2026 Predictor League" },
      { name: "description", content: "Predict every match of FIFA World Cup 2026. Compete globally, with your city, or with your group chat. Beat the AI, top the table." },
      { property: "og:title", content: "ScoreBattle — World Cup 2026 Predictor" },
      { property: "og:description", content: "Predict all 104 World Cup matches. Beat the AI. Top the table." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <PageShell>
      <Hero />
      <Ticker />
      <FeaturedFixture />
      <ScoringRules />
      <ThreeLeagues />
      <BeatTheAI />
      <Voices />
      <CTA />
    </PageShell>
  );
}

/* ───── HERO ───── */
function Hero() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  return (
    <section className="relative">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-16 md:pb-20">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <Eyebrow tone="tomato">Issue Nº 01 · Kick-off June 11, 2026</Eyebrow>
            <h1 className="mt-6 font-display font-black text-[12vw] sm:text-[80px] lg:text-[112px] leading-[0.9] tracking-[-0.04em]">
              Pick the<br />
              <span className="italic">score.</span> <span className="underline-marker">Top</span><br />
              the table.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              ScoreBattle is the prediction league for the
              <span className="text-foreground font-medium"> FIFA World Cup 2026</span>.
              Call all 104 fixtures across three host nations. Compete globally,
              with your city, or with the group chat.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-7 h-12 rounded-full bg-ink text-paper font-medium hover:bg-pitch-deep transition stamp"
                  >
                    Start predicting <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/groups"
                    className="inline-flex items-center gap-2 px-7 h-12 rounded-full bg-paper border-2 border-ink text-ink font-medium hover:bg-sunshine transition"
                  >
                    <Users className="w-4 h-4" /> Create a group
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="inline-flex items-center gap-2 px-7 h-12 rounded-full bg-ink text-paper font-medium hover:bg-pitch-deep transition stamp"
                  >
                    Start predicting <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="inline-flex items-center gap-2 px-7 h-12 rounded-full bg-paper border-2 border-ink text-ink font-medium hover:bg-sunshine transition"
                  >
                    <Users className="w-4 h-4" /> Create a group
                  </button>
                </>
              )}
            </div>

            {/* App store badges */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground w-full mb-1">
                App coming soon
              </div>
              {/* App Store */}
              <div className="inline-flex items-center gap-2.5 px-4 h-11 rounded-xl bg-ink text-paper border border-ink/20 opacity-70 cursor-not-allowed select-none">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="leading-tight text-left">
                  <div className="text-[9px] opacity-70">Coming soon on</div>
                  <div className="text-sm font-semibold -mt-0.5">App Store</div>
                </div>
              </div>
              {/* Google Play */}
              <div className="inline-flex items-center gap-2.5 px-4 h-11 rounded-xl bg-ink text-paper border border-ink/20 opacity-70 cursor-not-allowed select-none">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.18 23.76c.3.17.64.22.97.15l12.08-12.08L12.94 8.5 3.18 23.76zm17.44-10.4L17.5 11.7l-3.5 3.5 3.5 3.5 3.14-1.68c.9-.48.9-1.77-.02-2.66zM3.54.54C3.2.47 2.86.53 2.56.7L15.44 13.6l3.28-3.28L3.54.54z"/>
                </svg>
                <div className="leading-tight text-left">
                  <div className="text-[9px] opacity-70">Coming soon on</div>
                  <div className="text-sm font-semibold -mt-0.5">Google Play</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <Programme />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 border-t-2 border-ink/10 pt-8">
          {[
            { k: "104", v: "Matches" },
            { k: "48", v: "Nations" },
            { k: "3", v: "Host countries" },
            { k: "1", v: "Trophy" },
          ].map((s) => (
            <div key={s.v} className="px-4">
              <div className="font-score text-5xl text-foreground">{s.k}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono-num">{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign in to ScoreBattle"
        description="Create a free account to start predicting and join the league."
      />
    </section>
  );
}

function Programme() {
  const supabase = createClient();
  const { user } = useAuth();
  const [match, setMatch] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchOpeningMatch = async () => {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .neq('home_team_code', '???')
        .neq('away_team_code', '???')
        .order('match_date', { ascending: true })
        .limit(1)
        .single();
      setMatch(data);
    };
    fetchOpeningMatch();
  }, []);

  if (!match) {
    return (
      <div className="relative">
        <div className="absolute inset-0 translate-x-3 translate-y-3 bg-tomato rounded-md" />
        <div className="relative bg-chalk border-2 border-ink rounded-md p-6 shadow-paper min-h-[280px] flex items-center justify-center text-muted-foreground text-sm">
          Loading fixture...
        </div>
      </div>
    );
  }

  const date = new Date(match.match_date);
  const venue = (match.venue || '').split('(')[0].trim();

  return (
    <div className="relative">
      <div className="absolute inset-0 translate-x-3 translate-y-3 bg-tomato rounded-md" />
      <div className="relative bg-chalk border-2 border-ink rounded-md p-6 shadow-paper">
        <div className="flex items-center justify-between text-[10px] font-mono-num uppercase tracking-[0.25em] text-muted-foreground border-b border-ink/15 pb-3">
          <span>Opening Match</span>
          <span>{match.stage === 'group' ? 'Group Stage' : match.stage}</span>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="text-center space-y-2">
            <Flag code={getFlag(match.home_team_code)} size="lg" />
            <div className="font-display font-bold">{match.home_team_name}</div>
          </div>
          <div className="text-center">
            <div className="font-mono-num text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="font-score text-6xl mt-1 text-ink leading-none">VS</div>
            <div className="text-[10px] mt-2 text-muted-foreground uppercase tracking-widest">{venue}</div>
          </div>
          <div className="text-center space-y-2">
            <Flag code={getFlag(match.away_team_code)} size="lg" />
            <div className="font-display font-bold">{match.away_team_name}</div>
          </div>
        </div>
        <div className="perf-divider my-6" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground">Kick-off</div>
            <div className="font-mono-num text-base mt-0.5">
              {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          {user ? (
            <Link
              to="/dashboard"
              className="px-3 py-1 rounded-full bg-ink text-paper text-[10px] font-mono-num uppercase tracking-widest hover:bg-pitch-deep transition"
            >
              Predict
            </Link>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-3 py-1 rounded-full bg-ink text-paper text-[10px] font-mono-num uppercase tracking-widest hover:bg-pitch-deep transition"
            >
              Predict
            </button>
          )}
        </div>
      </div>
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign in to predict"
        description="Create a free account to lock in predictions and earn points."
      />
    </div>
  );
}

/* ───── TICKER ───── */
function Ticker() {
  const supabase = createClient();
  const [items, setItems] = useState<Array<{ l: string; r: string; s: string; t: string }>>([]);

  useEffect(() => {
    const fetchTickerMatches = async () => {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .neq('home_team_code', '???')
        .neq('away_team_code', '???')
        .order('match_date', { ascending: true })
        .limit(15);

      const formatted = (data || []).map((m: any) => {
        const date = new Date(m.match_date);
        let timeLabel = '';

        if (m.status === 'finished') {
          timeLabel = 'FT';
        } else if (m.status === 'live') {
          timeLabel = m.minute ? `${m.minute}'` : 'LIVE';
        } else {
          timeLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }

        const score =
          m.home_score !== null && m.away_score !== null
            ? `${m.home_score}-${m.away_score}`
            : 'vs';

        return {
          l: m.home_team_code,
          r: m.away_team_code,
          s: score,
          t: timeLabel,
        };
      });

      setItems(formatted);
    };

    fetchTickerMatches();
  }, []);

  if (items.length === 0) {
    return null;
  }

  const repeated = [...items, ...items, ...items];
  return (
    <div className="bg-ink text-paper py-3 overflow-hidden border-y-2 border-ink">
      <div className="flex gap-10 animate-ticker whitespace-nowrap font-mono-num text-sm">
        {repeated.map((m, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0">
            <span className="text-lg">{getFlag(m.l)}</span>
            <span className="text-sunshine font-bold">{m.s}</span>
            <span className="text-lg">{getFlag(m.r)}</span>
            <span className="text-paper/50 text-xs">[{m.t}]</span>
            <span className="text-paper/30">●</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───── FEATURED FIXTURE PREDICTION ───── */
function FeaturedFixture() {
  const supabase = createClient();
  const { user } = useAuth();
  const [match, setMatch] = useState<any>(null);
  const [aiPrediction, setAiPrediction] = useState<any>(null);
  const [h, setH] = useState(1);
  const [a, setA] = useState(1);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .neq('home_team_code', '???')
        .neq('away_team_code', '???')
        .eq('status', 'scheduled')
        .order('match_date', { ascending: true })
        .limit(1)
        .single();

      if (matchData) {
        setMatch(matchData);
        const { data: aiData } = await supabase
          .from('ai_predictions')
          .select('*')
          .eq('match_id', matchData.id)
          .single();
        if (aiData) {
          setAiPrediction(aiData);
          setH(aiData.home_score);
          setA(aiData.away_score);
        }
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section className="py-12 md:py-24 px-4 md:px-6">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-12 gap-8 md:gap-12 items-center">
        <div className="lg:col-span-5">
          <Eyebrow tone="pitch">How it works</Eyebrow>
          <h2 className="mt-4 font-display font-black text-3xl md:text-5xl lg:text-6xl leading-[0.95]">
            Two numbers.<br />
            <span className="italic">That's it.</span>
          </h2>
          <p className="mt-6 text-muted-foreground text-lg leading-relaxed max-w-md">
            Tap a score for every fixture. Predictions lock 5 minutes before kick-off.
            Points roll in the second the final whistle blows.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-sunshine border-2 border-ink flex items-center justify-center">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <span className="text-muted-foreground">Auto-locked 5 minutes before kick-off</span>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-chalk border-2 border-ink rounded-md shadow-paper overflow-hidden">
            <div className="bg-ink text-paper px-6 py-2 flex items-center justify-between text-[11px] font-mono-num uppercase tracking-[0.2em]">
              <span>{match ? `${match.stage === 'group' ? 'Group stage' : match.stage}` : 'Next fixture'}</span>
              <span className="text-sunshine">{match ? `● ${new Date(match.match_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : '● Coming soon'}</span>
            </div>
            <div className="p-8 grid grid-cols-3 items-center gap-4">
              <div className="text-center">
                <Flag code={match ? getFlag(match.home_team_code) : '🌍'} size="lg" />
                <div className="mt-3 font-display font-bold text-xl">{match?.home_team_name || 'TBD'}</div>
                <div className="text-xs text-muted-foreground font-mono-num uppercase tracking-widest mt-1">Home</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-3">
                  <Stepper value={h} onChange={setH} />
                  <span className="font-score text-5xl text-muted-foreground">—</span>
                  <Stepper value={a} onChange={setA} />
                </div>
                <div className="mt-3 text-[10px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground">Your prediction</div>
              </div>
              <div className="text-center">
                <Flag code={match ? getFlag(match.away_team_code) : '🌍'} size="lg" />
                <div className="mt-3 font-display font-bold text-xl">{match?.away_team_name || 'TBD'}</div>
                <div className="text-xs text-muted-foreground font-mono-num uppercase tracking-widest mt-1">Away</div>
              </div>
            </div>
            <div className="perf-divider mx-6" />
            <div className="px-6 py-4 flex items-center justify-between bg-secondary/40">
              <div className="flex items-center gap-2 text-sm">
                <Brain className="w-4 h-4 text-tomato" />
                <span className="text-muted-foreground">AI says</span>
                <span className="font-score text-xl">
                  {aiPrediction ? `${aiPrediction.home_score} — ${aiPrediction.away_score}` : '— — —'}
                </span>
                {aiPrediction && (
                  <span className="text-xs text-tomato font-mono-num">{aiPrediction.confidence}% conf.</span>
                )}
              </div>
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-ink text-paper text-sm font-medium hover:bg-pitch-deep transition"
                >
                  <Lock className="w-3.5 h-3.5" /> Lock it in
                </Link>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-ink text-paper text-sm font-medium hover:bg-pitch-deep transition"
                >
                  <Lock className="w-3.5 h-3.5" /> Lock it in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign in to lock your prediction"
        description="Create a free account to lock in predictions and earn points."
      />
    </section>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-full border-2 border-ink hover:bg-sunshine transition flex items-center justify-center"
        aria-label="increase"
      >
        <Plus className="w-3 h-3" />
      </button>
      <div className="font-score text-6xl leading-none w-12 text-center text-pitch-deep">{value}</div>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-7 h-7 rounded-full border-2 border-ink hover:bg-sunshine transition flex items-center justify-center"
        aria-label="decrease"
      >
        <Minus className="w-3 h-3" />
      </button>
    </div>
  );
}

/* ───── SCORING ───── */
function ScoringRules() {
  const rows = [
    { p: "+5", t: "Exact score", d: "Nail home and away — pure clairvoyance." },
    { p: "+3", t: "Goal difference", d: "Wrong score, but the exact goal margin is correct." },
    { p: "+2", t: "Right outcome", d: "Wrong score and margin, but right winner (or draw)." },
    { p: " 0", t: "Wrong outcome", d: "Better luck next match." },
    { p: "+1", t: "Beat the AI", d: "Outscore the model on a single match.", bonus: true },
  ];
  return (
    <section className="py-12 md:py-24 px-4 md:px-6 bg-pitch-deep text-paper">
      <div className="max-w-[1200px] mx-auto">
        <Eyebrow tone="ink"><span className="text-sunshine">Rulebook</span></Eyebrow>
        <h2 className="mt-4 font-display font-black text-3xl md:text-5xl lg:text-6xl leading-[0.95] text-paper">
          The maths<br />
          <span className="italic text-sunshine">behind the table.</span>
        </h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rows.map((r) => (
            <div
              key={r.t}
              className={`rounded-md p-6 border-2 ${r.bonus ? "bg-sunshine text-ink border-sunshine" : "bg-paper/5 text-paper border-paper/20"}`}
            >
              <div className={`font-score text-7xl ${r.bonus ? "text-tomato" : "text-sunshine"}`}>{r.p}</div>
              <div className="mt-3 font-display font-bold text-xl">{r.t}</div>
              <div className={`mt-1 text-sm ${r.bonus ? "text-ink/70" : "text-paper/60"}`}>{r.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── THREE LEAGUES ───── */
function ThreeLeagues() {
  const modes = [
    { icon: Globe2, t: "Global", d: "Battle every prediction tipster on Earth.", n: "Open league" },
    { icon: Users, t: "Private", d: "The group chat, the office, the family WhatsApp.", n: "6-letter code" },
    { icon: Flame, t: "Local", d: "Top your city, country, and continent.", n: "Auto-joined" },
  ];
  return (
    <section className="py-12 md:py-24 px-4 md:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div className="max-w-2xl">
            <Eyebrow tone="tomato">Three leagues</Eyebrow>
            <h2 className="mt-4 font-display font-black text-3xl md:text-5xl lg:text-6xl leading-[0.95]">Pick your battlefield.</h2>
          </div>
          <Link to="/leaderboard" className="text-sm font-medium underline underline-offset-4 hover:text-tomato">
            See the table →
          </Link>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {modes.map((m, i) => (
            <div key={m.t} className="group relative">
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-ink rounded-md" />
              <div className="relative bg-chalk border-2 border-ink rounded-md p-7 hover:-translate-x-0.5 hover:-translate-y-0.5 transition">
                <div className="flex items-center justify-between">
                  <m.icon className="w-7 h-7" strokeWidth={2} />
                  <span className="font-score text-4xl text-tomato">0{i + 1}</span>
                </div>
                <h3 className="mt-6 font-display font-black text-3xl">{m.t}</h3>
                <p className="mt-2 text-muted-foreground">{m.d}</p>
                <div className="mt-6 inline-flex items-center px-2.5 py-1 rounded bg-sunshine border border-ink text-[10px] font-mono-num uppercase tracking-widest">
                  {m.n}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── BEAT THE AI ───── */
function BeatTheAI() {
  return (
    <section className="py-12 md:py-24 px-4 md:px-6">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <Eyebrow tone="pitch">Beat the AI</Eyebrow>
          <h2 className="mt-4 font-display font-black text-3xl md:text-5xl lg:text-6xl leading-[0.95]">
            The machine has<br />
            <span className="italic">an opinion.</span><br />
            <span className="underline-marker">Prove it wrong.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-md">
            Every fixture comes with an AI prediction and confidence score.
            Outsmart it for a bonus point and bragging rights in your group chat.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Pre-tournament sims", "Per-match hint", "Group recap", "Win probability"].map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full text-xs border border-ink/30 bg-chalk">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 translate-x-2 translate-y-2 bg-tomato rounded-md" />
          <div className="relative bg-chalk border-2 border-ink rounded-md p-7">
            <div className="flex items-center justify-between text-[10px] font-mono-num uppercase tracking-[0.25em] text-muted-foreground">
              <span>AI Pick · QF</span>
              <span>Conf. 74%</span>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <div className="text-center">
                <Flag code="🇧🇷" size="lg" />
                <div className="mt-2 font-display font-bold">Brazil</div>
              </div>
              <div className="font-score text-7xl text-pitch-deep">2-1</div>
              <div className="text-center">
                <Flag code="🇳🇱" size="lg" />
                <div className="mt-2 font-display font-bold">Netherlands</div>
              </div>
            </div>
            <div className="mt-6 h-2 rounded-full bg-secondary overflow-hidden border border-ink/20">
              <div className="h-full w-[74%] bg-pitch hatch" />
            </div>
            <div className="mt-5 p-4 bg-secondary/60 rounded border-l-4 border-tomato text-sm leading-relaxed">
              <span className="font-display italic">"Brazil's midfield press has shut down possession-heavy
              opponents in 6 of the last 7 outings. Expect an early opener."</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───── VOICES ───── */
function Voices() {
  const quotes = [
    { q: "I beat the AI three matches in a row. Posted it in our group. Friendship destroyed.", n: "Lucia, Buenos Aires", c: "🇦🇷" },
    { q: "The cleanest predictor app I've used. The newspaper feel is brilliant.", n: "Kenji, Osaka", c: "🇯🇵" },
    { q: "Office league is on. Coffee is on the line.", n: "Amine, Casablanca", c: "🇲🇦" },
  ];
  return (
    <section className="py-12 md:py-24 px-4 md:px-6 bg-secondary/40 border-y-2 border-ink/10">
      <div className="max-w-[1200px] mx-auto">
        <Eyebrow tone="tomato">Field reports</Eyebrow>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {quotes.map((qq, i) => (
            <div key={i} className="bg-chalk border border-ink/15 rounded-md p-6">
              <Quote className="w-6 h-6 text-tomato" />
              <p className="mt-3 font-display text-lg leading-snug">"{qq.q}"</p>
              <div className="mt-5 flex items-center gap-3 pt-4 border-t border-ink/10">
                <Flag code={qq.c} size="sm" />
                <div className="text-sm font-medium">{qq.n}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── CTA ───── */
function CTA() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  return (
    <section className="py-16 md:py-28 px-4 md:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="relative">
          <div className="absolute inset-0 translate-x-2 translate-y-2 bg-ink rounded-md" />
          <div className="relative bg-sunshine border-2 border-ink rounded-md p-12 lg:p-16 text-center">
            <Trophy className="w-10 h-10 mx-auto" />
            <h2 className="mt-6 font-display font-black text-3xl md:text-5xl lg:text-7xl leading-[0.95]">
              The whistle blows<br />
              <span className="italic">June 11, 2026.</span>
            </h2>
            <p className="mt-5 text-ink/70 text-lg max-w-xl mx-auto">
              Lock your spot, set up your group, and be ready when the first ball drops.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {user ? (
                <>
                  <Link to="/dashboard" className="px-7 h-12 inline-flex items-center rounded-full bg-ink text-paper font-medium hover:bg-pitch-deep transition">
                    Open the dashboard
                  </Link>
                  <Link to="/groups" className="px-7 h-12 inline-flex items-center rounded-full bg-paper border-2 border-ink text-ink font-medium">
                    Create a group
                  </Link>
                </>
              ) : (
                <>
                  <button onClick={() => setAuthModalOpen(true)} className="px-7 h-12 inline-flex items-center rounded-full bg-ink text-paper font-medium hover:bg-pitch-deep transition">
                    Open the dashboard
                  </button>
                  <button onClick={() => setAuthModalOpen(true)} className="px-7 h-12 inline-flex items-center rounded-full bg-paper border-2 border-ink text-ink font-medium">
                    Create a group
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign in to ScoreBattle"
        description="Create a free account to start predicting and join the league."
      />
    </section>
  );
}
