import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, Eyebrow, Flag } from "@/components/AppShell";
import { Plus, Copy, Share2, Crown, Users, Hash, Sparkles, Check } from "lucide-react";

export const Route = createFileRoute("/groups")({
  head: () => ({
    meta: [
      { title: "Groups — ScoreBattle" },
      { name: "description", content: "Create a private group, invite friends, and battle through the World Cup together." },
    ],
  }),
  component: Groups,
});

const myGroups = [
  { name: "The Office League", code: "OFC-2026", members: 14, rank: 4, leader: "lucia.f", c: "🇦🇷" },
  { name: "Family Cup", code: "FAM-7421", members: 6, rank: 1, leader: "you", c: "🌍" },
  { name: "Casablanca Crew", code: "CSB-9930", members: 22, rank: 9, leader: "amine.b", c: "🇲🇦" },
];

const sampleStandings = [
  { n: "lucia.f", c: "🇦🇷", p: 184, you: false },
  { n: "you",     c: "🌍", p: 168, you: true },
  { n: "marco.t", c: "🇮🇹", p: 161, you: false },
  { n: "ines.s",  c: "🇵🇹", p: 154, you: false },
  { n: "wei.l",   c: "🇨🇳", p: 142, you: false },
];

function Groups() {
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState(myGroups[0]);

  return (
    <PageShell>
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="border-b-2 border-ink/10 pb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow tone="tomato">Private Leagues</Eyebrow>
            <h1 className="mt-3 font-display font-black text-5xl lg:text-6xl leading-[0.95]">
              Your <span className="italic">crew.</span>
            </h1>
            <p className="mt-3 text-muted-foreground">Battle through the tournament with people you actually know.</p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-ink text-paper font-medium hover:bg-pitch-deep transition stamp">
            <Plus className="w-4 h-4" /> Create new group
          </button>
        </div>

        <div className="mt-10 grid lg:grid-cols-12 gap-8">
          {/* Group list */}
          <aside className="lg:col-span-4 space-y-3">
            <div className="text-[11px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground px-2">My groups · {myGroups.length}</div>
            {myGroups.map((g) => {
              const isActive = g.code === active.code;
              return (
                <button
                  key={g.code}
                  onClick={() => setActive(g)}
                  className={`w-full text-left p-4 rounded-md border-2 transition ${isActive ? "border-ink bg-sunshine/40" : "border-ink/20 bg-chalk hover:border-ink"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-display font-bold text-lg">{g.name}</div>
                    {g.rank === 1 && <Crown className="w-4 h-4 text-tomato" />}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground font-mono-num flex items-center gap-3">
                    <span className="inline-flex items-center gap-1"><Hash className="w-3 h-3" />{g.code}</span>
                    <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{g.members}</span>
                    <span>· You're #{g.rank}</span>
                  </div>
                </button>
              );
            })}

            {/* Join */}
            <div className="mt-6 p-5 border-2 border-dashed border-ink/30 rounded-md">
              <div className="text-[11px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground">Got a code?</div>
              <div className="mt-3 flex gap-2">
                <input
                  placeholder="ABC-1234"
                  className="flex-1 px-3 h-10 rounded-md border-2 border-ink bg-paper font-mono-num text-sm focus:outline-none focus:bg-sunshine/40"
                />
                <button className="px-4 h-10 rounded-md bg-ink text-paper text-sm font-medium hover:bg-pitch-deep transition">Join</button>
              </div>
            </div>
          </aside>

          {/* Active group detail */}
          <section className="lg:col-span-8 space-y-6">
            {/* Header card */}
            <div className="relative">
              <div className="absolute inset-0 translate-x-2 translate-y-2 bg-tomato rounded-md" />
              <div className="relative bg-chalk border-2 border-ink rounded-md p-7">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-[11px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground">Group</div>
                    <h2 className="mt-1 font-display font-black text-3xl">{active.name}</h2>
                    <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" />{active.members} members</span>
                      <span>·</span>
                      <span>Started Jun 1</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { navigator.clipboard?.writeText(active.code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                      className="inline-flex items-center gap-2 px-4 h-10 rounded-full border-2 border-ink bg-paper text-sm font-medium hover:bg-sunshine transition"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied" : active.code}
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-ink text-paper text-sm font-medium hover:bg-pitch-deep transition">
                      <Share2 className="w-4 h-4" /> Invite
                    </button>
                  </div>
                </div>

                <div className="perf-divider my-6" />

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { l: "Group MVP", v: active.leader, sub: "184 pts" },
                    { l: "Your rank", v: `#${active.rank}`, sub: "of " + active.members },
                    { l: "Matches in", v: "12", sub: "of 64 group stage" },
                  ].map((s) => (
                    <div key={s.l}>
                      <div className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground">{s.l}</div>
                      <div className="mt-1 font-display font-bold text-2xl">{s.v}</div>
                      <div className="text-xs text-muted-foreground">{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Standings */}
            <div className="bg-chalk border-2 border-ink rounded-md overflow-hidden">
              <div className="px-5 py-3 bg-ink text-paper flex items-center justify-between text-[11px] font-mono-num uppercase tracking-[0.2em]">
                <span>Group standings</span>
                <span className="text-sunshine">Live</span>
              </div>
              {sampleStandings.map((s, i) => (
                <div
                  key={s.n}
                  className={`grid grid-cols-12 items-center px-5 py-3 border-b border-ink/10 last:border-0 ${s.you ? "bg-sunshine/40" : ""}`}
                >
                  <div className="col-span-1 font-score text-2xl text-tomato">{i + 1}</div>
                  <div className="col-span-7 flex items-center gap-3">
                    <Flag code={s.c} size="sm" />
                    <span className="font-medium">{s.n}</span>
                    {s.you && <span className="px-1.5 py-0.5 rounded bg-ink text-paper text-[9px] font-mono-num uppercase tracking-widest">you</span>}
                  </div>
                  <div className="col-span-4 text-right font-score text-2xl">{s.p}</div>
                </div>
              ))}
            </div>

            {/* AI recap */}
            <div className="p-6 bg-pitch-deep text-paper rounded-md border-2 border-ink relative overflow-hidden">
              <Sparkles className="absolute top-4 right-4 w-5 h-5 text-sunshine" />
              <div className="text-[11px] font-mono-num uppercase tracking-[0.2em] text-sunshine">AI · Group recap</div>
              <p className="mt-3 font-display text-xl italic leading-snug max-w-2xl">
                "Lucia is on a 4-match exact-score streak. You closed the gap by 9 points
                this matchday — keep backing the underdogs and you'll be on the podium by MD3."
              </p>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
