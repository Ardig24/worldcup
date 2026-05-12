import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import heroPitch from "@/assets/hero-pitch.jpg";
import {
  Trophy, Sparkles, Users, Globe2, Zap, ChevronRight,
  Bell, Brain, Target, Flame, Lock, Plus, Minus, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScoreBattle AI — Predict Every Match. Beat the World." },
      { name: "description", content: "The score-prediction league for FIFA World Cup 2026. Compete globally, regionally, and with your friends. Beat the AI, climb the table, win bragging rights." },
      { property: "og:title", content: "ScoreBattle AI — World Cup 2026 Predictor" },
      { property: "og:description", content: "Predict all 104 World Cup matches. Global, local & private leaderboards. Beat the AI." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Nav />
      <Hero />
      <LiveStrip />
      <PredictDemo />
      <Modes />
      <AISection />
      <Leaderboard />
      <CTA />
      <Footer />
    </main>
  );
}

/* ───────────────────── NAV ───────────────────── */
function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-gold shadow-gold flex items-center justify-center">
            <Trophy className="w-5 h-5 text-background" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <div className="font-display font-bold text-lg tracking-tight">ScoreBattle</div>
            <div className="text-[10px] text-primary font-mono-num tracking-widest uppercase">AI · WC26</div>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#predict" className="hover:text-foreground transition">Predict</a>
          <a href="#modes" className="hover:text-foreground transition">Modes</a>
          <a href="#ai" className="hover:text-foreground transition">AI</a>
          <a href="#leaderboard" className="hover:text-foreground transition">Leaderboard</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition">
            Sign in
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-glow">
            Join free <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ───────────────────── HERO ───────────────────── */
function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-6">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroPitch}
          alt=""
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8 animate-float-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-mono-num tracking-widest uppercase text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            Kick-off · June 11, 2026
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
            Predict every match.
            <br />
            <span className="text-gradient-hero">Beat the world.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            ScoreBattle AI is the score-prediction league for the
            <span className="text-foreground"> FIFA World Cup 2026</span>.
            Call all 104 fixtures, climb global &amp; private leaderboards,
            and out-think the AI for bonus points.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button className="group inline-flex items-center gap-2 px-6 h-12 rounded-full bg-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] transition">
              Start predicting
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </button>
            <button className="inline-flex items-center gap-2 px-6 h-12 rounded-full border border-border bg-card/50 backdrop-blur text-foreground font-medium hover:bg-card transition">
              <Users className="w-4 h-4" /> Create a private group
            </button>
          </div>

          <dl className="grid grid-cols-3 max-w-md gap-6 pt-4">
            {[
              { k: "104", v: "Matches" },
              { k: "48", v: "Nations" },
              { k: "3×", v: "Leagues" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-3xl font-bold text-foreground font-mono-num">{s.k}</dt>
                <dd className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5 animate-float-up" style={{ animationDelay: "120ms" }}>
          <NextMatchCard />
        </div>
      </div>
    </section>
  );
}

function NextMatchCard() {
  return (
    <div className="relative rounded-3xl bg-gradient-card border border-border shadow-card p-6 backdrop-blur-xl">
      <div className="absolute inset-0 rounded-3xl pitch-lines opacity-40 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono-num uppercase tracking-widest text-primary">Opening Match</span>
          <span className="font-mono-num text-muted-foreground">JUN 11 · 20:00 CDMX</span>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Team flag="🇲🇽" name="Mexico" />
          <div className="text-center">
            <div className="font-mono-num text-4xl font-bold tracking-tight">VS</div>
            <div className="mt-1 text-[10px] tracking-widest text-muted-foreground uppercase">Estadio Azteca</div>
          </div>
          <Team flag="🌍" name="TBD" align="right" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <ScorePicker label="Mexico" initial={2} />
          <ScorePicker label="Opponent" initial={1} />
        </div>

        <div className="mt-5 flex items-center justify-between p-3 rounded-xl bg-accent/10 border border-accent/30">
          <div className="flex items-center gap-2 text-sm">
            <Brain className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">AI suggests</span>
            <span className="font-semibold text-foreground font-mono-num">2 – 0</span>
            <span className="text-xs text-accent font-mono-num">71%</span>
          </div>
          <button className="text-xs font-medium text-accent hover:underline">Beat AI →</button>
        </div>

        <button className="mt-5 w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition shadow-glow inline-flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5" /> Lock prediction
        </button>
      </div>
    </div>
  );
}

function Team({ flag, name, align = "left" }: { flag: string; name: string; align?: "left" | "right" }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${align === "right" ? "" : ""}`}>
      <div className="w-14 h-14 rounded-2xl bg-secondary/60 border border-border flex items-center justify-center text-3xl">
        {flag}
      </div>
      <div className="font-display font-semibold">{name}</div>
    </div>
  );
}

function ScorePicker({ label, initial }: { label: string; initial: number }) {
  const [n, setN] = useState(initial);
  return (
    <div className="rounded-2xl bg-secondary/40 border border-border p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground text-center">{label}</div>
      <div className="mt-2 flex items-center justify-between">
        <button
          onClick={() => setN(Math.max(0, n - 1))}
          className="w-8 h-8 rounded-lg bg-background/60 hover:bg-background transition flex items-center justify-center"
          aria-label="decrease"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="font-display font-bold text-3xl font-mono-num text-primary">{n}</div>
        <button
          onClick={() => setN(n + 1)}
          className="w-8 h-8 rounded-lg bg-background/60 hover:bg-background transition flex items-center justify-center"
          aria-label="increase"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ───────────────────── LIVE STRIP ───────────────────── */
function LiveStrip() {
  const items = [
    { l: "Argentina", r: "France", t: "FT", s: "3 – 3" },
    { l: "Brazil", r: "Germany", t: "LIVE 67'", s: "1 – 1" },
    { l: "Spain", r: "England", t: "20:00", s: "vs" },
    { l: "Japan", r: "USA", t: "23:30", s: "vs" },
    { l: "Morocco", r: "Portugal", t: "FT", s: "2 – 1" },
  ];
  return (
    <div className="border-y border-border/60 bg-card/30 backdrop-blur overflow-hidden">
      <div className="flex gap-8 py-4 px-6 overflow-x-auto scrollbar-none text-sm">
        {items.map((m, i) => (
          <div key={i} className="flex items-center gap-3 whitespace-nowrap font-mono-num">
            <span className="text-foreground">{m.l}</span>
            <span className="text-primary font-bold">{m.s}</span>
            <span className="text-foreground">{m.r}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${m.t.includes("LIVE") ? "bg-destructive/20 text-destructive animate-pulse-glow" : "text-muted-foreground"}`}>
              {m.t}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────── PREDICT / SCORING ───────────────────── */
function PredictDemo() {
  return (
    <section id="predict" className="relative py-28 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionTag icon={Target} label="Scoring" />
          <h2 className="mt-4 font-display text-4xl sm:text-5xl font-bold leading-tight">
            Simple rules.
            <br />
            <span className="text-primary">Ruthless math.</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg max-w-md">
            One prediction per match. Predictions lock 5 minutes before kickoff.
            Points roll in the moment the final whistle blows.
          </p>

          <div className="mt-8 space-y-3">
            <Rule pts="+3" label="Exact score" tone="primary" />
            <Rule pts="+1" label="Right outcome, wrong score" tone="muted" />
            <Rule pts="0" label="Wrong outcome" tone="dim" />
            <Rule pts="+1" label="Bonus — beat the AI" tone="gold" />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-hero opacity-20 blur-3xl rounded-full" />
          <div className="relative grid gap-3">
            {[
              { h: "🇧🇷 Brazil", a: "🇦🇷 Argentina", you: "2 – 1", ai: "1 – 1", res: "2 – 1", pts: 4 },
              { h: "🇪🇸 Spain", a: "🇩🇪 Germany", you: "1 – 0", ai: "1 – 1", res: "1 – 0", pts: 4 },
              { h: "🇫🇷 France", a: "🇮🇹 Italy", you: "2 – 2", ai: "2 – 1", res: "1 – 1", pts: 1 },
            ].map((m, i) => (
              <div key={i} className="rounded-2xl bg-gradient-card border border-border p-5 shadow-card flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="font-medium">{m.h} <span className="text-muted-foreground">vs</span> {m.a}</div>
                  <div className="text-xs text-muted-foreground font-mono-num">
                    You {m.you} · AI {m.ai} · Final {m.res}
                  </div>
                </div>
                <div className={`font-mono-num font-bold text-2xl ${m.pts >= 3 ? "text-primary" : "text-muted-foreground"}`}>
                  +{m.pts}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Rule({ pts, label, tone }: { pts: string; label: string; tone: "primary" | "gold" | "muted" | "dim" }) {
  const styles = {
    primary: "bg-primary text-primary-foreground shadow-glow",
    gold: "bg-gradient-gold text-background shadow-gold",
    muted: "bg-secondary text-foreground border border-border",
    dim: "bg-background text-muted-foreground border border-border",
  }[tone];
  return (
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-lg font-mono-num ${styles}`}>
        {pts}
      </div>
      <div className="text-foreground">{label}</div>
    </div>
  );
}

/* ───────────────────── MODES ───────────────────── */
function Modes() {
  const modes = [
    { icon: Globe2, title: "Global", desc: "Battle every fan on Earth on the master leaderboard.", tag: "millions", tone: "primary" },
    { icon: Users, title: "Private Groups", desc: "Family. Office. Group chat. Invite via link or 6-char code.", tag: "your crew", tone: "gold" },
    { icon: Flame, title: "Local & Regional", desc: "Top your city, your country, and your continent.", tag: "near you", tone: "azure" },
  ];
  return (
    <section id="modes" className="py-28 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <SectionTag icon={Zap} label="Three leagues, one prediction" />
          <h2 className="mt-4 font-display text-4xl sm:text-5xl font-bold">Pick your battlefield.</h2>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {modes.map((m, i) => (
            <div key={i} className="group relative rounded-3xl bg-gradient-card border border-border p-7 overflow-hidden hover:border-primary/40 transition">
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition" />
              <m.icon className="w-7 h-7 text-primary" />
              <h3 className="mt-5 font-display text-2xl font-bold">{m.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{m.desc}</p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-mono-num uppercase tracking-widest text-primary">
                <span className="w-1 h-1 rounded-full bg-primary" /> {m.tag}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── AI ───────────────────── */
function AISection() {
  return (
    <section id="ai" className="py-28 px-6 relative">
      <div className="max-w-7xl mx-auto rounded-[2rem] bg-gradient-card border border-border shadow-card p-10 lg:p-16 overflow-hidden relative">
        <div className="absolute inset-0 pitch-lines opacity-30" />
        <div className="relative grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionTag icon={Sparkles} label="Beat the AI" tone="gold" />
            <h2 className="mt-4 font-display text-4xl sm:text-5xl font-bold leading-tight">
              The machine has an opinion.
              <br />
              <span className="text-accent">Prove it wrong.</span>
            </h2>
            <p className="mt-5 text-muted-foreground text-lg max-w-md">
              Every match comes with an AI-generated prediction and confidence
              score. Outsmart it for bonus points and bragging rights.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Pre-tournament sims", "Per-match hint", "Group recap", "Confidence %"].map((t) => (
                <span key={t} className="px-3 py-1.5 rounded-full text-xs border border-border bg-background/40 text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl bg-background/60 border border-accent/30 p-6 shadow-gold backdrop-blur">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono-num uppercase tracking-widest text-accent">AI Pick · Quarter Final</span>
                <span className="text-muted-foreground font-mono-num">Confidence 74%</span>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <div className="text-center">
                  <div className="text-3xl">🇧🇷</div>
                  <div className="mt-1 font-display font-semibold">Brazil</div>
                </div>
                <div className="font-display text-5xl font-bold font-mono-num text-accent">2 – 1</div>
                <div className="text-center">
                  <div className="text-3xl">🇳🇱</div>
                  <div className="mt-1 font-display font-semibold">Netherlands</div>
                </div>
              </div>
              <div className="mt-6 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full w-[74%] bg-gradient-gold" />
              </div>
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
                "Brazil's midfield press has neutralised possession-heavy
                opponents in the last 6 outings. Expect an early goal."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── LEADERBOARD ───────────────────── */
function Leaderboard() {
  const rows = [
    { r: 1, n: "lucia.f", c: "🇦🇷", p: 184, acc: 68, hot: true },
    { r: 2, n: "kenji_07", c: "🇯🇵", p: 179, acc: 65 },
    { r: 3, n: "amine.b", c: "🇲🇦", p: 175, acc: 64 },
    { r: 4, n: "you", c: "🌍", p: 168, acc: 61, you: true },
    { r: 5, n: "sara.l", c: "🇩🇪", p: 162, acc: 59 },
  ];
  return (
    <section id="leaderboard" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <SectionTag icon={Trophy} label="Live leaderboard" />
            <h2 className="mt-4 font-display text-4xl sm:text-5xl font-bold">The table never sleeps.</h2>
          </div>
          <div className="flex gap-2 text-xs font-mono-num">
            {["Global", "Country", "Group"].map((t, i) => (
              <button key={t} className={`px-4 h-9 rounded-full border ${i === 0 ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-gradient-card border border-border shadow-card overflow-hidden">
          <div className="grid grid-cols-12 px-6 py-3 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border font-mono-num">
            <div className="col-span-1">#</div>
            <div className="col-span-6">Player</div>
            <div className="col-span-2 text-right">Acc.</div>
            <div className="col-span-3 text-right">Points</div>
          </div>
          {rows.map((row) => (
            <div
              key={row.r}
              className={`grid grid-cols-12 items-center px-6 py-4 border-b border-border/50 last:border-0 transition ${row.you ? "bg-primary/10" : "hover:bg-secondary/30"}`}
            >
              <div className={`col-span-1 font-display font-bold font-mono-num ${row.r === 1 ? "text-accent" : "text-muted-foreground"}`}>
                {row.r}
              </div>
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-base">
                  {row.c}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{row.n}</span>
                  {row.hot && <Flame className="w-3.5 h-3.5 text-destructive" />}
                  {row.you && <span className="text-[10px] uppercase tracking-widest text-primary">you</span>}
                </div>
              </div>
              <div className="col-span-2 text-right text-muted-foreground font-mono-num text-sm">{row.acc}%</div>
              <div className="col-span-3 text-right font-display font-bold font-mono-num text-xl text-foreground">{row.p}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── CTA ───────────────────── */
function CTA() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-4xl mx-auto text-center relative">
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-20 blur-3xl rounded-full" />
        <Bell className="w-8 h-8 text-primary mx-auto" />
        <h2 className="mt-6 font-display text-4xl sm:text-6xl font-bold leading-tight">
          The whistle blows in
          <br />
          <span className="text-gradient-hero">June 2026.</span>
        </h2>
        <p className="mt-5 text-muted-foreground text-lg max-w-xl mx-auto">
          Lock your spot, set up your group, and be ready when the first ball
          drops in Mexico City.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button className="px-7 h-12 rounded-full bg-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] transition">
            Create your account
          </button>
          <button className="px-7 h-12 rounded-full border border-border text-foreground hover:bg-card transition">
            Browse fixtures
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="font-display font-semibold text-foreground">ScoreBattle AI</span>
          <span>· Independent fan project. Not affiliated with FIFA.</span>
        </div>
        <div className="font-mono-num tracking-widest uppercase">© 2026</div>
      </div>
    </footer>
  );
}

function SectionTag({ icon: Icon, label, tone = "primary" }: { icon: any; label: string; tone?: "primary" | "gold" }) {
  const c = tone === "gold" ? "text-accent border-accent/30 bg-accent/10" : "text-primary border-primary/30 bg-primary/10";
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono-num uppercase tracking-widest ${c}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </div>
  );
}
