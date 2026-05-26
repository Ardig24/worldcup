import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell, Eyebrow, Flag } from "@/components/AppShell";
import { Trophy, Flame, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — ScoreBattle" },
      { name: "description", content: "Live rankings across the world, your country, and your private groups." },
    ],
  }),
  component: Leaderboard,
});

type Row = { r: number; n: string; c: string; p: number; acc: number; exact: number; trend: "up" | "down" | "flat"; you?: boolean; id: string };

type LeaderboardUser = {
  id: string;
  username: string;
  country_code: string | null;
  total_points: number;
  total_predictions: number;
  exact_scores: number;
};

const tabs = ["Global", "Country", "Group: Office", "Friends"] as const;

function Leaderboard() {
  const { user } = useAuth();
  const supabase = createClient();
  const [active, setActive] = useState<typeof tabs[number]>("Global");
  const [leaderboard, setLeaderboard] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [user?.id]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch users with their prediction stats
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          username,
          country_code,
          predictions (
            points_earned,
            beat_ai
          )
        `);

      if (error) throw error;

      const leaderboardData: LeaderboardUser[] = (data || []).map((u: any) => {
        const predictions = u.predictions || [];
        const totalPoints = predictions.reduce((sum: number, p: any) => sum + (p.points_earned || 0), 0);
        const exactScores = predictions.filter((p: any) => p.points_earned >= 3).length;
        
        return {
          id: u.id,
          username: u.username,
          country_code: u.country_code,
          total_points: totalPoints,
          total_predictions: predictions.length,
          exact_scores: exactScores,
        };
      }).sort((a, b) => b.total_points - a.total_points);

      const rows: Row[] = leaderboardData.map((u, index) => ({
        r: index + 1,
        n: u.username,
        c: u.country_code || '🌍',
        p: u.total_points,
        acc: u.total_predictions > 0 ? Math.round((u.total_points / (u.total_predictions * 3)) * 100) : 0,
        exact: u.exact_scores,
        trend: 'flat',
        you: user?.id === u.id,
        id: u.id,
      }));

      setLeaderboard(rows);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
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

  return (
    <PageShell>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="border-b-2 border-ink/10 pb-8">
          <Eyebrow tone="tomato">Live Standings · Refreshed 12s ago</Eyebrow>
          <h1 className="mt-3 font-display font-black text-3xl md:text-5xl lg:text-6xl leading-[0.95]">
            The table never <span className="italic">sleeps.</span>
          </h1>
        </div>

        {/* Podium */}
        <div className="mt-10 grid sm:grid-cols-3 gap-4 items-end">
          {leaderboard.length >= 3 ? [leaderboard[1], leaderboard[0], leaderboard[2]].map((p, i) => {
            const place = [2, 1, 3][i];
            const heights = ["pt-10", "pt-4", "pt-14"];
            return (
              <div key={p.id} className={`${heights[i]}`}>
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
          }) : (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              No data yet. Make predictions to appear on the leaderboard.
            </div>
          )}
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
            Showing <span className="text-foreground">{leaderboard.length}</span> tipsters
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
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No predictions yet. Be the first to predict!
            </div>
          ) : (
            leaderboard.map((row) => (
              <div
                key={row.id}
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
            ))
          )}
        </div>

        {user && leaderboard.length > 0 && (
          <div className="mt-3 text-xs text-muted-foreground font-mono-num text-center">
            {leaderboard.find(r => r.you) 
              ? `You are ranked #${leaderboard.find(r => r.you)?.r} with ${leaderboard.find(r => r.you)?.p} points.`
              : 'Make predictions to appear on the leaderboard.'
            }
          </div>
        )}
      </div>
    </PageShell>
  );
}

function Trend({ t }: { t: "up" | "down" | "flat" }) {
  if (t === "up") return <TrendingUp className="w-3 h-3 text-pitch-deep" />;
  if (t === "down") return <TrendingDown className="w-3 h-3 text-tomato" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}
