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

type TabKey = "Global" | "Country" | "My Groups";

type MyGroup = { id: string; name: string; memberIds: string[] };

function buildRows(data: LeaderboardUser[], userId?: string): Row[] {
  return data.map((u, index) => ({
    r: index + 1,
    n: u.username,
    c: u.country_code || '🌍',
    p: u.total_points,
    acc: u.total_predictions > 0 ? Math.round((u.total_points / (u.total_predictions * 3)) * 100) : 0,
    exact: u.exact_scores,
    trend: 'flat' as const,
    you: userId === u.id,
    id: u.id,
  }));
}

function Leaderboard() {
  const { user } = useAuth();
  const supabase = createClient();
  const [active, setActive] = useState<TabKey>("Global");
  const [allUsers, setAllUsers] = useState<LeaderboardUser[]>([]);
  const [myGroups, setMyGroups] = useState<MyGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [myCountry, setMyCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, [user?.id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`id, username, country_code, predictions(points_earned, beat_ai)`);
      if (error) throw error;

      const users: LeaderboardUser[] = (data || []).map((u: any) => {
        const preds = u.predictions || [];
        const totalPoints = preds.reduce((s: number, p: any) => s + (p.points_earned || 0), 0);
        return {
          id: u.id,
          username: u.username,
          country_code: u.country_code,
          total_points: totalPoints,
          total_predictions: preds.length,
          exact_scores: preds.filter((p: any) => p.points_earned >= 3).length,
        };
      }).sort((a, b) => b.total_points - a.total_points);

      setAllUsers(users);

      if (user) {
        const me = users.find(u => u.id === user.id);
        setMyCountry(me?.country_code ?? null);

        // Fetch all groups the user belongs to, with group name
        const { data: gmData } = await supabase
          .from('group_members')
          .select('group_id, groups(id, name)')
          .eq('user_id', user.id);

        if (gmData && gmData.length > 0) {
          const groups: MyGroup[] = await Promise.all(
            gmData.map(async (gm: any) => {
              const group = gm.groups;
              const { data: members } = await supabase
                .from('group_members')
                .select('user_id')
                .eq('group_id', group.id);
              return {
                id: group.id,
                name: group.name,
                memberIds: (members || []).map((m: any) => m.user_id as string),
              };
            })
          );
          setMyGroups(groups);
          setSelectedGroupId(groups[0]?.id ?? null);
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const visibleRows = (() => {
    if (active === 'Country' && myCountry) {
      const filtered = allUsers.filter(u => u.country_code === myCountry);
      return buildRows(filtered, user?.id);
    }
    if (active === 'My Groups') {
      const group = myGroups.find(g => g.id === selectedGroupId);
      if (group) {
        const filtered = allUsers.filter(u => group.memberIds.includes(u.id));
        return buildRows(filtered, user?.id);
      }
      return [];
    }
    return buildRows(allUsers, user?.id);
  })();

  const tabs: TabKey[] = ["Global", "Country", "My Groups"];

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
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="border-b-2 border-ink/10 pb-6">
          <Eyebrow tone="tomato">Live Standings</Eyebrow>
          <h1 className="mt-2 font-display font-black text-4xl lg:text-6xl leading-[0.95]">
            The table never <span className="italic">sleeps.</span>
          </h1>
        </div>

        {/* Podium */}
        <div className="mt-8 grid grid-cols-3 gap-3 items-end">
          {visibleRows.length >= 3 ? [visibleRows[1], visibleRows[0], visibleRows[2]].map((p, i) => {
            const place = [2, 1, 3][i];
            const heights = ["pt-8", "pt-0", "pt-12"];
            return (
              <div key={p.id} className={`${heights[i]}`}>
                <div className="relative">
                  <div className="absolute inset-0 translate-x-1 translate-y-1 bg-ink rounded-md" />
                  <div className={`relative rounded-md border-2 border-ink p-3 text-center ${place === 1 ? "bg-sunshine" : "bg-chalk"}`}>
                    <div className="font-score text-3xl text-tomato">#{place}</div>
                    <div className="mt-2 mx-auto w-fit"><Flag code={p.c} size="sm" /></div>
                    <div className="mt-2 font-display font-bold text-sm truncate">{p.n}</div>
                    <div className="mt-0.5 font-score text-2xl">{p.p}</div>
                    <div className="text-[9px] font-mono-num uppercase tracking-widest text-muted-foreground">pts</div>
                    {place === 1 && <Trophy className="w-4 h-4 mx-auto mt-1" />}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-3 text-center py-8 text-muted-foreground text-sm">
              {active === 'Country' && !myCountry
                ? 'Set your country in your profile to see country rankings.'
                : active === 'My Groups' && myGroups.length === 0
                ? 'Join a group first to see group rankings.'
                : 'No data yet. Be the first to predict!'}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-2 border-b border-ink/15 pb-3">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-3 h-8 rounded-full text-xs font-medium border-2 transition ${active === t ? "bg-ink text-paper border-ink" : "bg-paper border-ink/20 hover:border-ink"}`}
            >
              {t}
            </button>
          ))}
          <div className="ml-auto text-xs font-mono-num text-muted-foreground self-center">
            {visibleRows.length} tipsters
          </div>
        </div>

        {/* Group selector — only shown under My Groups */}
        {active === 'My Groups' && myGroups.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {myGroups.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGroupId(g.id)}
                className={`px-3 h-7 rounded-full text-xs font-medium border-2 transition ${
                  selectedGroupId === g.id ? 'bg-pitch-deep text-paper border-pitch-deep' : 'border-ink/20 hover:border-ink'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="mt-4 bg-chalk border-2 border-ink rounded-md overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2 bg-ink text-paper text-[10px] font-mono-num uppercase tracking-[0.2em]">
            <div className="col-span-1">Pos</div>
            <div className="col-span-7">Tipster</div>
            <div className="col-span-2 text-right hidden sm:block">Exact</div>
            <div className="col-span-2 text-right">Pts</div>
          </div>
          {visibleRows.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              {active === 'Country' && !myCountry
                ? 'Set your country in profile to enable this view.'
                : active === 'My Groups' && myGroups.length === 0
                ? 'Join or create a group to see group rankings.'
                : 'No predictions yet. Be the first!'}
            </div>
          ) : (
            visibleRows.map((row) => (
              <div
                key={row.id}
                className={`grid grid-cols-12 items-center px-4 py-3 border-b border-ink/10 last:border-0 ${row.you ? "bg-sunshine/40" : "hover:bg-secondary/40"}`}
              >
                <div className="col-span-1 flex items-center gap-1">
                  <span className={`font-score text-xl ${row.r <= 3 ? "text-tomato" : "text-foreground"}`}>{row.r}</span>
                  <Trend t={row.trend} />
                </div>
                <div className="col-span-7 flex items-center gap-2 min-w-0">
                  <Flag code={row.c} size="sm" />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-medium truncate">{row.n}</span>
                    {row.r === 1 && <Flame className="w-3 h-3 text-tomato shrink-0" />}
                    {row.you && <span className="px-1 py-0.5 rounded bg-ink text-paper text-[9px] font-mono-num uppercase tracking-widest shrink-0">you</span>}
                  </div>
                </div>
                <div className="col-span-2 text-right text-muted-foreground font-mono-num text-sm hidden sm:block">{row.exact}</div>
                <div className="col-span-2 text-right font-score text-xl">{row.p}</div>
              </div>
            ))
          )}
        </div>

        {user && visibleRows.length > 0 && (
          <div className="mt-3 text-xs text-muted-foreground font-mono-num text-center">
            {visibleRows.find(r => r.you)
              ? `You are ranked #${visibleRows.find(r => r.you)?.r} with ${visibleRows.find(r => r.you)?.p} points.`
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
