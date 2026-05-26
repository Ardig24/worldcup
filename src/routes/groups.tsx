import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell, Eyebrow, Flag } from "@/components/AppShell";
import { Plus, Copy, Share2, Crown, Users, Hash, Sparkles, Check, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/AuthModal";

export const Route = createFileRoute("/groups")({
  head: () => ({
    meta: [
      { title: "Groups — ScoreBattle" },
      { name: "description", content: "Create a private group, invite friends, and battle through the World Cup together." },
    ],
  }),
  component: Groups,
});

type Group = {
  id: string;
  name: string;
  code: string;
  created_by: string;
  created_at: string;
  member_count: number;
  is_leader: boolean;
  your_rank: number;
  your_points: number;
};

type GroupMember = {
  id: string;
  username: string;
  country_code: string | null;
  total_points: number;
  is_you: boolean;
};

type CreateGroupModalProps = {
  onClose: () => void;
  onCreate: (name: string) => void;
};

function Groups() {
  const { user } = useAuth();
  const supabase = createClient();
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [standings, setStandings] = useState<GroupMember[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchGroups();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (active) {
      fetchGroupStandings(active.id);
    }
  }, [active]);

  const fetchGroups = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: groupMembers, error: membersError } = await supabase
        .from('group_members')
        .select('*, groups(*)')
        .eq('user_id', user.id);

      if (membersError) throw membersError;

      const groupsData: Group[] = await Promise.all(
        (groupMembers || []).map(async (gm: any) => {
          const group = gm.groups;
          
          // Get member count
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          // Get user's points and rank in this group
          const { data: userPredictions } = await supabase
            .from('predictions')
            .select('points_earned')
            .eq('user_id', user.id);

          const userPoints = userPredictions?.reduce((sum: number, p: any) => sum + (p.points_earned || 0), 0) || 0;

          // Get all users' points in this group to calculate rank
          const { data: membersData } = await supabase
            .from('group_members')
            .select('user_id')
            .eq('group_id', group.id);

          const memberIds = membersData?.map((m: any) => m.user_id) || [];
          
          const { data: allPredictions } = await supabase
            .from('predictions')
            .select('user_id, points_earned')
            .in('user_id', memberIds.length > 0 ? memberIds : ['00000000-0000-0000-0000-000000000000']);

          const pointsByUser: Record<string, number> = {};
          allPredictions?.forEach((p: any) => {
            pointsByUser[p.user_id] = (pointsByUser[p.user_id] || 0) + (p.points_earned || 0);
          });

          const sortedUsers = Object.entries(pointsByUser).sort((a, b) => b[1] - a[1]);
          const userRank = sortedUsers.findIndex(([id]) => id === user.id) + 1;

          return {
            id: group.id,
            name: group.name,
            code: group.code,
            created_by: group.created_by,
            created_at: group.created_at,
            member_count: count || 0,
            is_leader: group.created_by === user.id,
            your_rank: userRank || 0,
            your_points: userPoints,
          };
        })
      );

      setGroups(groupsData);
      if (groupsData.length > 0) {
        setActive(groupsData[0]);
      }
    } catch (err: any) {
      console.error('Error fetching groups:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupStandings = async (groupId: string) => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      const memberIds = membersData?.map((m: any) => m.user_id) || [];
      
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', memberIds.length > 0 ? memberIds : ['00000000-0000-0000-0000-000000000000']);

      if (usersError) throw usersError;

      const { data: predictionsData } = await supabase
        .from('predictions')
        .select('user_id, points_earned')
        .in('user_id', memberIds.length > 0 ? memberIds : ['00000000-0000-0000-0000-000000000000']);

      const pointsByUser: Record<string, number> = {};
      predictionsData?.forEach((p: any) => {
        pointsByUser[p.user_id] = (pointsByUser[p.user_id] || 0) + (p.points_earned || 0);
      });

      const standings: GroupMember[] = (usersData || []).map((u: any) => ({
        id: u.id,
        username: u.username,
        country_code: u.country_code,
        total_points: pointsByUser[u.id] || 0,
        is_you: u.id === user?.id,
      })).sort((a, b) => b.total_points - a.total_points);

      setStandings(standings);
    } catch (err: any) {
      console.error('Error fetching group standings:', err);
    }
  };

  const ensureUserProfile = async () => {
    if (!user) return;
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();
    if (!existing) {
      await supabase.from('users').insert({
        id: user.id,
        email: user.email ?? '',
        username: user.email?.split('@')[0] ?? `user_${user.id.slice(0, 6)}`,
        auth_provider: 'email',
      });
    }
  };

  const handleCreateGroup = async () => {
    if (!user || !newGroupName.trim()) return;
    setCreateLoading(true);
    setError("");
    try {
      // Ensure public.users row exists (FK requirement)
      await ensureUserProfile();

      // Generate a random group code
      const code = generateGroupCode();

      const { error: groupError } = await supabase
        .from('groups')
        .insert({
          name: newGroupName.trim(),
          code: code,
          created_by: user.id,
        });

      if (groupError) throw groupError;

      // Add the creator as a member
      const { data: groupData } = await supabase
        .from('groups')
        .select('id')
        .eq('code', code)
        .single();

      if (groupData) {
        await supabase.from('group_members').insert({
          group_id: groupData.id,
          user_id: user.id,
        });
      }

      setNewGroupName("");
      setShowCreateModal(false);
      await fetchGroups();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!joinCode.trim()) return;
    setJoinLoading(true);
    setError("");
    try {
      // Find group by code
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('code', joinCode.trim().toUpperCase())
        .single();

      if (groupError || !groupData) {
        setError('Invalid group code');
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupData.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        setError('You are already a member of this group');
        return;
      }

      // Join the group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
        });

      if (joinError) throw joinError;

      setJoinCode("");
      await fetchGroups();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Delete this group? This cannot be undone.')) return;
    try {
      await supabase.from('group_members').delete().eq('group_id', groupId);
      const { error } = await supabase.from('groups').delete().eq('id', groupId);
      if (error) throw error;
      setActive(null);
      await fetchGroups();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const generateGroupCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 3; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
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
        <div className="border-b-2 border-ink/10 pb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow tone="tomato">Private Leagues</Eyebrow>
            <h1 className="mt-3 font-display font-black text-3xl md:text-5xl lg:text-6xl leading-[0.95]">
              Your <span className="italic">crew.</span>
            </h1>
            <p className="mt-3 text-muted-foreground">Battle through the tournament with people you actually know.</p>
          </div>
          <button 
            onClick={() => user ? setShowCreateModal(true) : setAuthModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-ink text-paper font-medium hover:bg-pitch-deep transition stamp"
          >
            <Plus className="w-4 h-4" /> Create new group
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 grid lg:grid-cols-12 gap-6">
          {/* Group list */}
          <aside className="lg:col-span-4 space-y-3">
            <div className="text-[11px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground px-2">My groups · {groups.length}</div>
            {groups.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No groups yet. Create one to get started!
              </div>
            ) : (
              groups.map((g) => {
                const isActive = active?.id === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setActive(g)}
                    className={`w-full text-left p-4 rounded-md border-2 transition ${isActive ? "border-ink bg-sunshine/40" : "border-ink/20 bg-chalk hover:border-ink"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-display font-bold text-lg">{g.name}</div>
                      {g.is_leader && <Crown className="w-4 h-4 text-tomato" />}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground font-mono-num flex items-center gap-3">
                      <span className="inline-flex items-center gap-1"><Hash className="w-3 h-3" />{g.code}</span>
                      <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{g.member_count}</span>
                      <span>· You're #{g.your_rank}</span>
                    </div>
                  </button>
                );
              })
            )}

            {/* Join */}
            <div className="mt-6 p-5 border-2 border-dashed border-ink/30 rounded-md">
              <div className="text-[11px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground">Got a code?</div>
              <div className="mt-3 flex gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="ABC-1234"
                  className="flex-1 px-3 h-10 rounded-md border-2 border-ink bg-paper font-mono-num text-sm focus:outline-none focus:bg-sunshine/40"
                />
                <button 
                  onClick={handleJoinGroup}
                  disabled={joinLoading}
                  className="px-4 h-10 rounded-md bg-ink text-paper text-sm font-medium hover:bg-pitch-deep transition disabled:opacity-50"
                >
                  {joinLoading ? 'Joining...' : 'Join'}
                </button>
              </div>
            </div>
          </aside>

          {/* Active group detail */}
          <section className="lg:col-span-8 space-y-6">
            {!active ? (
              <div className="p-12 text-center text-muted-foreground">
                Select a group or create one to get started
              </div>
            ) : (
              <>
                {/* Header card */}
                <div className="relative">
                  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-tomato rounded-md" />
                  <div className="relative bg-chalk border-2 border-ink rounded-md p-7">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div>
                        <div className="text-[11px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground">Group</div>
                        <h2 className="mt-1 font-display font-black text-3xl">{active.name}</h2>
                        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" />{active.member_count} members</span>
                          <span>·</span>
                          <span>Started {new Date(active.created_at).toLocaleDateString()}</span>
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
                        <button
                          onClick={async () => {
                            const text = `Join my ScoreBattle group "${active.name}"!\nUse code: ${active.code}`;
                            if (navigator.share) {
                              try { await navigator.share({ title: 'ScoreBattle', text }); } catch {}
                            } else {
                              await navigator.clipboard?.writeText(text);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1500);
                            }
                          }}
                          className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-ink text-paper text-sm font-medium hover:bg-pitch-deep transition"
                        >
                          <Share2 className="w-4 h-4" /> Invite
                        </button>
                        {active.is_leader && (
                          <button
                            onClick={() => handleDeleteGroup(active.id)}
                            className="inline-flex items-center gap-2 px-4 h-10 rounded-full border-2 border-red-500 text-red-500 text-sm font-medium hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="perf-divider my-6" />

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground">Your points</div>
                        <div className="mt-1 font-display font-bold text-2xl">{active.your_points}</div>
                        <div className="text-xs text-muted-foreground">total earned</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground">Your rank</div>
                        <div className="mt-1 font-display font-bold text-2xl">#{active.your_rank}</div>
                        <div className="text-xs text-muted-foreground">of {active.member_count} members</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-muted-foreground">Role</div>
                        <div className="mt-1 font-display font-bold text-2xl">{active.is_leader ? 'Leader' : 'Member'}</div>
                        <div className="text-xs text-muted-foreground">{active.is_leader ? 'Can manage group' : 'Standard access'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Standings */}
                <div className="bg-chalk border-2 border-ink rounded-md overflow-hidden">
                  <div className="px-5 py-3 bg-ink text-paper flex items-center justify-between text-[11px] font-mono-num uppercase tracking-[0.2em]">
                    <span>Group standings</span>
                    <span className="text-sunshine">Live</span>
                  </div>
                  {standings.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      No standings yet. Make predictions to appear here!
                    </div>
                  ) : (
                    standings.map((s, i) => (
                      <div
                        key={s.id}
                        className={`grid grid-cols-12 items-center px-5 py-3 border-b border-ink/10 last:border-0 ${s.is_you ? "bg-sunshine/40" : ""}`}
                      >
                        <div className="col-span-1 font-score text-2xl text-tomato">{i + 1}</div>
                        <div className="col-span-7 flex items-center gap-3">
                          <Flag code={s.country_code || '🌍'} size="sm" />
                          <span className="font-medium">{s.username}</span>
                          {s.is_you && <span className="px-1.5 py-0.5 rounded bg-ink text-paper text-[9px] font-mono-num uppercase tracking-widest">you</span>}
                        </div>
                        <div className="col-span-4 text-right font-score text-2xl">{s.total_points}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* AI recap */}
                <div className="p-6 bg-pitch-deep text-paper rounded-md border-2 border-ink relative overflow-hidden">
                  <Sparkles className="absolute top-4 right-4 w-5 h-5 text-sunshine" />
                  <div className="text-[11px] font-mono-num uppercase tracking-[0.2em] text-sunshine">AI · Group recap</div>
                  <p className="mt-3 font-display text-xl italic leading-snug max-w-2xl">
                    {standings.length > 0 
                      ? `"${standings[0].username} is leading with ${standings[0].total_points} points. You're ${active.your_points} points behind. Keep predicting to climb the leaderboard!"`
                      : "Make some predictions to get an AI recap of your group performance."
                    }
                  </p>
                </div>
              </>
            )}
          </section>
        </div>

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-paper border-2 border-ink rounded-md p-6 w-full max-w-md">
              <h3 className="font-display font-bold text-2xl mb-4">Create new group</h3>
              <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 h-10 rounded-full border-2 border-ink font-medium hover:bg-sunshine transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={createLoading || !newGroupName.trim()}
                  className="flex-1 px-4 h-10 rounded-full bg-ink text-paper font-medium hover:bg-pitch-deep transition disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign in to join groups"
        description="Create a free account to create or join private leagues with your friends."
      />
    </PageShell>
  );
}
