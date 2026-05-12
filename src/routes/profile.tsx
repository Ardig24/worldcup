import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, Eyebrow, Flag } from "@/components/AppShell";
import { User, Mail, MapPin, Camera, Save, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ScoreBattle" },
      { name: "description", content: "Manage your profile and settings." },
    ],
  }),
  component: Profile,
});

const COUNTRIES = [
  { code: "🇦🇷", name: "Argentina" },
  { code: "🇦🇺", name: "Australia" },
  { code: "🇧🇷", name: "Brazil" },
  { code: "🇨🇦", name: "Canada" },
  { code: "🇨🇳", name: "China" },
  { code: "🇩🇪", name: "Germany" },
  { code: "🇪🇸", name: "Spain" },
  { code: "🇫🇷", name: "France" },
  { code: "🇬🇧", name: "United Kingdom" },
  { code: "🇮🇹", name: "Italy" },
  { code: "🇯🇵", name: "Japan" },
  { code: "🇲🇽", name: "Mexico" },
  { code: "🇳🇬", name: "Nigeria" },
  { code: "🇳🇱", name: "Netherlands" },
  { code: "🇵🇹", name: "Portugal" },
  { code: "🇸🇦", name: "Saudi Arabia" },
  { code: "🇰🇷", name: "South Korea" },
  { code: "🇺🇸", name: "United States" },
  { code: "🇿🇦", name: "South Africa" },
  { code: "🌍", name: "Other" },
];

function Profile() {
  const { user, signOut } = useAuth();
  const supabase = createClient();
  const [username, setUsername] = useState(user?.user_metadata?.username || "");
  const [country, setCountry] = useState(user?.user_metadata?.country_code || "🌍");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setSaved(false);

    try {
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          username: username.trim(),
          country_code: country,
        },
      });

      if (metadataError) throw metadataError;

      // Update users table
      const { error: dbError } = await supabase
        .from('users')
        .update({
          username: username.trim(),
          country_code: country,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Sign out error:', error);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <PageShell>
      <div className="max-w-[800px] mx-auto px-6 py-10">
        <div className="border-b-2 border-ink/10 pb-8">
          <Eyebrow tone="tomato">Account</Eyebrow>
          <h1 className="mt-3 font-display font-black text-5xl lg:text-6xl leading-[0.95]">
            Your <span className="italic">profile.</span>
          </h1>
        </div>

        <div className="mt-10 space-y-8">
          {/* Avatar section */}
          <div className="bg-chalk border-2 border-ink rounded-md p-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-sunshine border-2 border-ink flex items-center justify-center text-3xl font-bold">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center hover:bg-pitch-deep transition">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-xl">Profile photo</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload a photo to personalize your profile
                </p>
              </div>
            </div>
          </div>

          {/* Profile form */}
          <div className="bg-chalk border-2 border-ink rounded-md p-6 space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-mono-num uppercase tracking-[0.2em] text-muted-foreground mb-3">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 rounded-md border-2 border-ink bg-ink/5 text-muted-foreground font-mono-num text-sm"
              />
              <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-mono-num uppercase tracking-[0.2em] text-muted-foreground mb-3">
                <User className="w-4 h-4" /> Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40 font-mono-num text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-mono-num uppercase tracking-[0.2em] text-muted-foreground mb-3">
                <MapPin className="w-4 h-4" /> Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-md border-2 border-ink bg-paper focus:outline-none focus:bg-sunshine/40 font-mono-num text-sm"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-ink text-paper font-medium hover:bg-pitch-deep transition stamp disabled:opacity-50"
              >
                {saved ? "Saved!" : <><Save className="w-4 h-4" /> {loading ? "Saving..." : "Save changes"}</>}
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-chalk border-2 border-ink rounded-md p-6">
            <h3 className="font-display font-bold text-lg mb-4">Danger zone</h3>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 h-10 rounded-full border-2 border-ink text-sm font-medium hover:bg-sunshine/40 transition"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
