import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, Eyebrow, Flag } from "@/components/AppShell";
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
  return (
    <section className="relative">
      <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-20">
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
    </section>
  );
}

function Programme() {
  return (
    <div className="relative">
      <div className="absolute inset-0 translate-x-3 translate-y-3 bg-tomato rounded-md" />
      <div className="relative bg-chalk border-2 border-ink rounded-md p-6 shadow-paper">
        <div className="flex items-center justify-between text-[10px] font-mono-num uppercase tracking-[0.25em] text-muted-foreground border-b border-ink/15 pb-3">
          <span>Official Programme</span>
          <span>Group A · MD1</span>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="text-center space-y-2">
            <Flag code="🇲🇽" size="lg" />
            <div className="font-display font-bold">Mexico</div>
          </div>
          <div className="text-center">
            <div className="font-mono-num text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Jun 11</div>
            <div className="font-score text-6xl mt-1 text-ink leading-none">VS</div>
            <div className="text-[10px] mt-2 text-muted-foreground uppercase tracking-widest">Estadio Azteca</div>
          </div>
          <div className="text-center space-y-2">
            <Flag code="🌍" size="lg" />
            <div className="font-display font-bold">TBD</div>
          </div>
        </div>
        <div className="perf-divider my-6" />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground">Your call</div>
            <div className="font-score text-3xl mt-0.5">2 — 1</div>
          </div>
          <div className="px-3 py-1 rounded-full bg-ink text-paper text-[10px] font-mono-num uppercase tracking-widest">
            Locked
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───── TICKER ───── */
function Ticker() {
  const items = [
    { l: "ARG", r: "FRA", s: "3-3", t: "FT" },
    { l: "BRA", r: "GER", s: "1-1", t: "67'" },
    { l: "ESP", r: "ENG", s: "vs", t: "20:00" },
    { l: "JPN", r: "USA", s: "vs", t: "23:30" },
    { l: "MAR", r: "POR", s: "2-1", t: "FT" },
    { l: "NED", r: "ITA", s: "0-0", t: "FT" },
    { l: "MEX", r: "CAN", s: "vs", t: "TMRW" },
  ];
  const repeated = [...items, ...items, ...items];
  return (
    <div className="bg-ink text-paper py-3 overflow-hidden border-y-2 border-ink">
      <div className="flex gap-10 animate-ticker whitespace-nowrap font-mono-num text-sm">
        {repeated.map((m, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0">
            <span>{m.l}</span>
            <span className="text-sunshine font-bold">{m.s}</span>
            <span>{m.r}</span>
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
  const [h, setH] = useState(2);
  const [a, setA] = useState(1);
  return (
    <section className="py-24 px-6">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <Eyebrow tone="pitch">How it works</Eyebrow>
          <h2 className="mt-4 font-display font-black text-5xl lg:text-6xl leading-[0.95]">
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
            <span className="text-muted-foreground">Auto-locked at <span className="text-foreground font-medium">19:55 CDMX</span></span>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-chalk border-2 border-ink rounded-md shadow-paper overflow-hidden">
            <div className="bg-ink text-paper px-6 py-2 flex items-center justify-between text-[11px] font-mono-num uppercase tracking-[0.2em]">
              <span>Match 01 · Group A</span>
              <span className="text-sunshine">● Live in 4d 12h</span>
            </div>
            <div className="p-8 grid grid-cols-3 items-center gap-4">
              <div className="text-center">
                <Flag code="🇲🇽" size="lg" />
                <div className="mt-3 font-display font-bold text-xl">Mexico</div>
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
                <Flag code="🇨🇦" size="lg" />
                <div className="mt-3 font-display font-bold text-xl">Canada</div>
                <div className="text-xs text-muted-foreground font-mono-num uppercase tracking-widest mt-1">Away</div>
              </div>
            </div>
            <div className="perf-divider mx-6" />
            <div className="px-6 py-4 flex items-center justify-between bg-secondary/40">
              <div className="flex items-center gap-2 text-sm">
                <Brain className="w-4 h-4 text-tomato" />
                <span className="text-muted-foreground">AI says</span>
                <span className="font-score text-xl">2 — 0</span>
                <span className="text-xs text-tomato font-mono-num">71% conf.</span>
              </div>
              <button className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-ink text-paper text-sm font-medium hover:bg-pitch-deep transition">
                <Lock className="w-3.5 h-3.5" /> Lock it in
              </button>
            </div>
          </div>
        </div>
      </div>
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
    { p: "+3", t: "Exact score", d: "Nail home and away — pure clairvoyance." },
    { p: "+1", t: "Right outcome", d: "Wrong score, right winner (or draw)." },
    { p: " 0", t: "Wrong outcome", d: "Better luck next match." },
    { p: "+1", t: "Beat the AI", d: "Outscore the model on a single match.", bonus: true },
  ];
  return (
    <section className="py-24 px-6 bg-pitch-deep text-paper">
      <div className="max-w-[1200px] mx-auto">
        <Eyebrow tone="ink"><span className="text-sunshine">Rulebook</span></Eyebrow>
        <h2 className="mt-4 font-display font-black text-5xl lg:text-6xl leading-[0.95] text-paper">
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
    <section className="py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div className="max-w-2xl">
            <Eyebrow tone="tomato">Three leagues</Eyebrow>
            <h2 className="mt-4 font-display font-black text-5xl lg:text-6xl leading-[0.95]">Pick your battlefield.</h2>
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
    <section className="py-24 px-6">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Eyebrow tone="pitch">Beat the AI</Eyebrow>
          <h2 className="mt-4 font-display font-black text-5xl lg:text-6xl leading-[0.95]">
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
    <section className="py-24 px-6 bg-secondary/40 border-y-2 border-ink/10">
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
  return (
    <section className="py-28 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="relative">
          <div className="absolute inset-0 translate-x-2 translate-y-2 bg-ink rounded-md" />
          <div className="relative bg-sunshine border-2 border-ink rounded-md p-12 lg:p-16 text-center">
            <Trophy className="w-10 h-10 mx-auto" />
            <h2 className="mt-6 font-display font-black text-5xl lg:text-7xl leading-[0.95]">
              The whistle blows<br />
              <span className="italic">June 11, 2026.</span>
            </h2>
            <p className="mt-5 text-ink/70 text-lg max-w-xl mx-auto">
              Lock your spot, set up your group, and be ready when the first ball drops.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/dashboard" className="px-7 h-12 inline-flex items-center rounded-full bg-ink text-paper font-medium hover:bg-pitch-deep transition">
                Open the dashboard
              </Link>
              <Link to="/groups" className="px-7 h-12 inline-flex items-center rounded-full bg-paper border-2 border-ink text-ink font-medium">
                Create a group
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
