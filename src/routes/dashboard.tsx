import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, Eyebrow, Flag } from "@/components/AppShell";
import { Brain, Lock, Plus, Minus, TrendingUp, Target, CheckCircle2, Clock, ChevronRight } from "lucide-react";

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
};

const upcoming: Match[] = [
  {
    id: "m1",
    stage: "Group A · MD1",
    date: "Jun 11", time: "20:00",
    venue: "Estadio Azteca, CDMX",
    home: { code: "🇲🇽", name: "Mexico", abbr: "MEX" },
    away: { code: "🇨🇦", name: "Canada", abbr: "CAN" },
    ai: [2, 0], conf: 71, status: "open",
  },
  {
    id: "m2",
    stage: "Group B · MD1",
    date: "Jun 12", time: "15:00",
    venue: "MetLife Stadium, NJ",
    home: { code: "🇺🇸", name: "USA", abbr: "USA" },
    away: { code: "🇯🇵", name: "Japan", abbr: "JPN" },
    ai: [1, 1], conf: 58, status: "open",
  },
  {
    id: "m3",
    stage: "Group C · MD1",
    date: "Jun 12", time: "18:00",
    venue: "BMO Field, Toronto",
    home: { code: "🇦🇷", name: "Argentina", abbr: "ARG" },
    away: { code: "🇲🇦", name: "Morocco", abbr: "MAR" },
    ai: [2, 1], conf: 64, status: "open",
  },
];

const live: Match = {
  id: "live",
  stage: "Group D · MD1 · LIVE",
  date: "Now", time: "67'",
  venue: "SoFi Stadium, LA",
  home: { code: "🇧🇷", name: "Brazil", abbr: "BRA" },
  away: { code: "🇩🇪", name: "Germany", abbr: "GER" },
  ai: [1, 1], conf: 55, status: "live", liveMin: "67'",
  finalScore: [1, 1],
  yourScore: [2, 1],
};

const finished: Match[] = [
  {
    id: "f1", stage: "Friendly", date: "Jun 8", time: "FT",
    venue: "Wembley", home: { code: "🇪🇸", name: "Spain", abbr: "ESP" },
    away: { code: "🇮🇹", name: "Italy", abbr: "ITA" },
    ai: [1, 1], conf: 50, status: "final",
    finalScore: [2, 1], yourScore: [2, 1], pts: 4,
  },
  {
    id: "f2", stage: "Friendly", date: "Jun 7", time: "FT",
    venue: "Old Trafford", home: { code: "🇫🇷", name: "France", abbr: "FRA" },
    away: { code: "🇧🇪", name: "Belgium", abbr: "BEL" },
    ai: [2, 0], conf: 60, status: "final",
    finalScore: [1, 1], yourScore: [1, 0], pts: 1,
  },
];

function Dashboard() {
  const stats = [
    { l: "Total points", v: "168", h: "+8 this week", icon: TrendingUp },
    { l: "Accuracy", v: "61%", h: "104 picks", icon: Target },
    { l: "Exact scores", v: "12", h: "of 47 finals", icon: CheckCircle2 },
    { l: "Beat the AI", v: "9×", h: "streak: 3", icon: Brain },
  ];

  return (
    <PageShell>
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-4 border-b-2 border-ink/10 pb-8">
          <div>
            <Eyebrow tone="tomato">Matchday Dashboard · Jun 11</Eyebrow>
            <h1 className="mt-3 font-display font-black text-5xl lg:text-6xl leading-[0.95]">
              Good evening, <span className="italic">Tipster.</span>
            </h1>
            <p className="mt-3 text-muted-foreground">3 fixtures open for predictions. Lock them before kick-off.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 h-10 rounded-full bg-ink text-paper inline-flex items-center gap-2 font-mono-num text-sm">
              <span className="w-2 h-2 rounded-full bg-sunshine animate-pulse" />
              Rank <span className="font-bold">#1,284</span>
            </div>
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
        <div className="mt-12">
          <SectionHeader eyebrow="Now playing" title="Live" tone="tomato" />
          <div className="mt-5">
            <LiveMatchCard m={live} />
          </div>
        </div>

        {/* Open predictions */}
        <div className="mt-12">
          <SectionHeader eyebrow="Open for predictions" title="Up next" />
          <div className="mt-5 space-y-4">
            {upcoming.map((m) => (
              <PredictRow key={m.id} m={m} />
            ))}
          </div>
        </div>

        {/* Recent results */}
        <div className="mt-12">
          <SectionHeader eyebrow="Closed book" title="Your recent picks" />
          <div className="mt-5 space-y-3">
            {finished.map((m) => (
              <ResultRow key={m.id} m={m} />
            ))}
          </div>
        </div>
      </div>
    </PageShell>
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
            <div className="font-score text-8xl leading-none">{m.finalScore![0]}—{m.finalScore![1]}</div>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper/15 border border-paper/30 text-xs">
              <span className="opacity-70">Your pick:</span>
              <span className="font-score text-base">{m.yourScore![0]}—{m.yourScore![1]}</span>
            </div>
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

function PredictRow({ m }: { m: Match }) {
  const [h, setH] = useState(m.ai[0]);
  const [a, setA] = useState(m.ai[1]);
  const [locked, setLocked] = useState(false);

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
          <button className="ml-2 text-xs underline text-muted-foreground hover:text-foreground">why?</button>
        </div>
        <button
          onClick={() => setLocked(!locked)}
          className={`inline-flex items-center gap-1.5 px-4 h-9 rounded-full text-sm font-medium transition stamp ${locked ? "bg-pitch-deep text-paper" : "bg-ink text-paper hover:bg-pitch-deep"}`}
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
