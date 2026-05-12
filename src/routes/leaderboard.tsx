import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, Eyebrow, Flag } from "@/components/AppShell";
import { Trophy, Flame, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — ScoreBattle" },
      { name: "description", content: "Live rankings across the world, your country, and your private groups." },
    ],
  }),
  component: Leaderboard,
});

type Row = { r: number; n: string; c: string; p: number; acc: number; exact: number; trend: "up" | "down" | "flat"; you?: boolean };

const rows: Row[] = [
  { r: 1, n: "lucia.f",  c: "🇦🇷", p: 184, acc: 68, exact: 18, trend: "up" },
  { r: 2, n: "kenji_07", c: "🇯🇵", p: 179, acc: 65, exact: 16, trend: "flat" },
  { r: 3, n: "amine.b",  c: "🇲🇦", p: 175, acc: 64, exact: 15, trend: "up" },
  { r: 4, n: "you",      c: "🌍", p: 168, acc: 61, exact: 12, trend: "up", you: true },
  { r: 5, n: "sara.l",   c: "🇩🇪", p: 162, acc: 59, exact: 13, trend: "down" },
  { r: 6, n: "diego.a",  c: "🇧🇷", p: 158, acc: 58, exact: 11, trend: "up" },
  { r: 7, n: "olu.k",    c: "🇳🇬", p: 155, acc: 57, exact: 10, trend: "flat" },
  { r: 8, n: "mateo.c",  c: "🇨🇴", p: 151, acc: 56, exact: 11, trend: "down" },
  { r: 9, n: "noor.h",   c: "🇸🇦", p: 148, acc: 55, exact: 9,  trend: "up" },
  { r: 10, n: "anya.p",  c: "🇷🇺", p: 145, acc: 54, exact: 9,  trend: "flat" },
];

const tabs = ["Global", "Country", "Group: Office", "Friends"] as const;

function Leaderboard() {
  const [active, setActive] = useState<typeof tabs[number]>("Global");

  return (
    <PageShell>
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="border-b-2 border-ink/10 pb-8">
          <Eyebrow tone="tomato">Live Standings · Refreshed 12s ago</Eyebrow>
          <h1 className="mt-3 font-display font-black text-5xl lg:text-6xl leading-[0.95]">
            The table never <span className="italic">sleeps.</span>
          </h1>
        </div>

        {/* Podium */}
        <div className="mt-10 grid sm:grid-cols-3 gap-4 items-end">
          {[rows[1], rows[0], rows[2]].map((p, i) => {
            const place = [2, 1, 3][i];
            const heights = ["pt-10", "pt-4", "pt-14"];
            return (
              <div key={p.n} className={`${heights[i]}`}>
                <div className="relative">
                  <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-ink rounded-md" />
                  <div className={`relative rounded-md border-2 border-ink p-6 text-center ${place === 1 ? "bg-sunshine" : "bg-chalk"}`}>
                    <div className="font-score text-5xl text-tomato">#{place}</div>
                    <div className="mt-3 mx-auto w-fit"><Flag code={p.c} size="lg" /></div>
                    <div className="mt-3 font-display font-bold text-xl">{p.n}</div>
                    <div className="mt-1 font-score text-4xl">{p.p}</div>
                    <div className="mt-1 text-[10px] font-mono-num uppercase tracking-widest text-muted-foreground">points</div>
                    {place === 1 && <Trophy className="w-6 h-6 mx-auto mt-3" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="mt-12 flex flex-wrap gap-2 border-b border-ink/15 pb-4">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-4 h-9 rounded-full text-sm font-medium border-2 transition ${active === t ? "bg-ink text-paper border-ink" : "bg-paper border-ink/20 hover:border-ink"}`}
            >
              {t}
            </button>
          ))}
          <div className="ml-auto text-xs font-mono-num text-muted-foreground self-center">
            Showing <span className="text-foreground">10</span> of <span className="text-foreground">2.4M</span>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 bg-chalk border-2 border-ink rounded-md overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 bg-ink text-paper text-[10px] font-mono-num uppercase tracking-[0.2em]">
            <div className="col-span-1">Pos</div>
            <div className="col-span-5">Tipster</div>
            <div className="col-span-2 text-right hidden sm:block">Acc.</div>
            <div className="col-span-2 text-right hidden sm:block">Exact</div>
            <div className="col-span-2 text-right">Pts</div>
          </div>
          {rows.map((row) => (
            <div
              key={row.r}
              className={`grid grid-cols-12 items-center px-5 py-3 border-b border-ink/10 last:border-0 ${row.you ? "bg-sunshine/40" : "hover:bg-secondary/40"}`}
            >
              <div className="col-span-1 flex items-center gap-1.5">
                <span className={`font-score text-2xl ${row.r <= 3 ? "text-tomato" : "text-foreground"}`}>{row.r}</span>
                <Trend t={row.trend} />
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <Flag code={row.c} size="sm" />
                <div className="flex items-center gap-2">
                  <span className="font-medium">{row.n}</span>
                  {row.r === 1 && <Flame className="w-3.5 h-3.5 text-tomato" />}
                  {row.you && <span className="px-1.5 py-0.5 rounded bg-ink text-paper text-[9px] font-mono-num uppercase tracking-widest">you</span>}
                </div>
              </div>
              <div className="col-span-2 text-right text-muted-foreground font-mono-num text-sm hidden sm:block">{row.acc}%</div>
              <div className="col-span-2 text-right text-muted-foreground font-mono-num text-sm hidden sm:block">{row.exact}</div>
              <div className="col-span-2 text-right font-score text-2xl">{row.p}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 text-xs text-muted-foreground font-mono-num text-center">
          You are 16 points off the podium. Predict <span className="text-foreground">3 exact scores</span> to leapfrog.
        </div>
      </div>
    </PageShell>
  );
}

function Trend({ t }: { t: "up" | "down" | "flat" }) {
  if (t === "up") return <TrendingUp className="w-3 h-3 text-pitch-deep" />;
  if (t === "down") return <TrendingDown className="w-3 h-3 text-tomato" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}
