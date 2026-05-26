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
  { code: "🇦�", name: "Afghanistan" },
  { code: "🇦🇱", name: "Albania" },
  { code: "🇩🇿", name: "Algeria" },
  { code: "🇦🇩", name: "Andorra" },
  { code: "🇦🇴", name: "Angola" },
  { code: "🇦🇬", name: "Antigua and Barbuda" },
  { code: "🇦�🇷", name: "Argentina" },
  { code: "🇦🇲", name: "Armenia" },
  { code: "🇦🇺", name: "Australia" },
  { code: "🇦🇹", name: "Austria" },
  { code: "🇦🇿", name: "Azerbaijan" },
  { code: "🇧🇸", name: "Bahamas" },
  { code: "🇧🇭", name: "Bahrain" },
  { code: "🇧🇩", name: "Bangladesh" },
  { code: "🇧🇧", name: "Barbados" },
  { code: "🇧🇾", name: "Belarus" },
  { code: "🇧🇪", name: "Belgium" },
  { code: "🇧🇿", name: "Belize" },
  { code: "🇧🇯", name: "Benin" },
  { code: "🇧🇹", name: "Bhutan" },
  { code: "🇧🇴", name: "Bolivia" },
  { code: "🇧�", name: "Bosnia and Herzegovina" },
  { code: "🇧🇼", name: "Botswana" },
  { code: "🇧�🇷", name: "Brazil" },
  { code: "🇧�", name: "Brunei" },
  { code: "🇧🇬", name: "Bulgaria" },
  { code: "🇧🇫", name: "Burkina Faso" },
  { code: "🇧🇮", name: "Burundi" },
  { code: "🇨🇻", name: "Cabo Verde" },
  { code: "🇰🇭", name: "Cambodia" },
  { code: "🇨🇲", name: "Cameroon" },
  { code: "�🇨🇦", name: "Canada" },
  { code: "🇨�", name: "Central African Republic" },
  { code: "🇹🇩", name: "Chad" },
  { code: "🇨🇱", name: "Chile" },
  { code: "🇨�🇳", name: "China" },
  { code: "🇨🇴", name: "Colombia" },
  { code: "🇰�", name: "Comoros" },
  { code: "🇨🇬", name: "Congo" },
  { code: "🇨🇷", name: "Costa Rica" },
  { code: "🇭🇷", name: "Croatia" },
  { code: "🇨🇺", name: "Cuba" },
  { code: "🇨🇾", name: "Cyprus" },
  { code: "🇨🇿", name: "Czech Republic" },
  { code: "🇩🇰", name: "Denmark" },
  { code: "🇩🇯", name: "Djibouti" },
  { code: "🇩🇲", name: "Dominica" },
  { code: "🇩🇴", name: "Dominican Republic" },
  { code: "🇨�🇩", name: "DR Congo" },
  { code: "🇪🇨", name: "Ecuador" },
  { code: "🇪🇬", name: "Egypt" },
  { code: "🇸🇻", name: "El Salvador" },
  { code: "🇬🇶", name: "Equatorial Guinea" },
  { code: "🇪�", name: "Eritrea" },
  { code: "🇪🇪", name: "Estonia" },
  { code: "�🇸🇿", name: "Eswatini" },
  { code: "🇪🇹", name: "Ethiopia" },
  { code: "🇫🇯", name: "Fiji" },
  { code: "🇫🇮", name: "Finland" },
  { code: "🇫🇷", name: "France" },
  { code: "🇬�", name: "Gabon" },
  { code: "🇬🇲", name: "Gambia" },
  { code: "🇬🇪", name: "Georgia" },
  { code: "🇩🇪", name: "Germany" },
  { code: "🇬🇭", name: "Ghana" },
  { code: "🇬🇷", name: "Greece" },
  { code: "🇬🇩", name: "Grenada" },
  { code: "🇬🇹", name: "Guatemala" },
  { code: "🇬🇳", name: "Guinea" },
  { code: "🇬🇼", name: "Guinea-Bissau" },
  { code: "🇬🇾", name: "Guyana" },
  { code: "🇭🇹", name: "Haiti" },
  { code: "🇭🇳", name: "Honduras" },
  { code: "🇭🇺", name: "Hungary" },
  { code: "🇮🇸", name: "Iceland" },
  { code: "🇮🇳", name: "India" },
  { code: "🇮🇩", name: "Indonesia" },
  { code: "🇮🇷", name: "Iran" },
  { code: "🇮🇶", name: "Iraq" },
  { code: "🇮🇪", name: "Ireland" },
  { code: "🇮🇱", name: "Israel" },
  { code: "🇮🇹", name: "Italy" },
  { code: "🇯🇲", name: "Jamaica" },
  { code: "🇯🇵", name: "Japan" },
  { code: "🇯🇴", name: "Jordan" },
  { code: "🇰🇿", name: "Kazakhstan" },
  { code: "🇰🇪", name: "Kenya" },
  { code: "🇰🇮", name: "Kiribati" },
  { code: "🇽🇰", name: "Kosovo" },
  { code: "🇰🇼", name: "Kuwait" },
  { code: "🇰🇬", name: "Kyrgyzstan" },
  { code: "🇱🇦", name: "Laos" },
  { code: "🇱🇻", name: "Latvia" },
  { code: "🇱🇧", name: "Lebanon" },
  { code: "🇱🇸", name: "Lesotho" },
  { code: "🇱🇷", name: "Liberia" },
  { code: "🇱🇾", name: "Libya" },
  { code: "🇱🇮", name: "Liechtenstein" },
  { code: "🇱�", name: "Lithuania" },
  { code: "🇱🇺", name: "Luxembourg" },
  { code: "🇲🇬", name: "Madagascar" },
  { code: "🇲🇼", name: "Malawi" },
  { code: "🇲🇾", name: "Malaysia" },
  { code: "🇲🇻", name: "Maldives" },
  { code: "🇲🇱", name: "Mali" },
  { code: "�🇲🇹", name: "Malta" },
  { code: "�🇭", name: "Marshall Islands" },
  { code: "🇲🇷", name: "Mauritania" },
  { code: "🇲🇺", name: "Mauritius" },
  { code: "🇲�🇽", name: "Mexico" },
  { code: "🇫🇲", name: "Micronesia" },
  { code: "🇲🇩", name: "Moldova" },
  { code: "🇲🇨", name: "Monaco" },
  { code: "🇲🇳", name: "Mongolia" },
  { code: "🇲🇪", name: "Montenegro" },
  { code: "🇲🇦", name: "Morocco" },
  { code: "🇲🇿", name: "Mozambique" },
  { code: "🇲🇲", name: "Myanmar" },
  { code: "🇳🇦", name: "Namibia" },
  { code: "🇳�", name: "Nauru" },
  { code: "🇳🇵", name: "Nepal" },
  { code: "🇳🇱", name: "Netherlands" },
  { code: "🇳🇿", name: "New Zealand" },
  { code: "🇳🇮", name: "Nicaragua" },
  { code: "🇳🇪", name: "Niger" },
  { code: "🇳�🇬", name: "Nigeria" },
  { code: "�🇰", name: "North Macedonia" },
  { code: "�🇳�", name: "Norway" },
  { code: "🇴🇲", name: "Oman" },
  { code: "🇵🇰", name: "Pakistan" },
  { code: "🇵🇼", name: "Palau" },
  { code: "🇵🇦", name: "Panama" },
  { code: "🇵🇬", name: "Papua New Guinea" },
  { code: "🇵🇾", name: "Paraguay" },
  { code: "🇵🇪", name: "Peru" },
  { code: "🇵🇭", name: "Philippines" },
  { code: "🇵🇱", name: "Poland" },
  { code: "🇵🇹", name: "Portugal" },
  { code: "🇶🇦", name: "Qatar" },
  { code: "🇷🇴", name: "Romania" },
  { code: "🇷🇺", name: "Russia" },
  { code: "🇷🇼", name: "Rwanda" },
  { code: "🇰🇳", name: "Saint Kitts and Nevis" },
  { code: "🇱🇨", name: "Saint Lucia" },
  { code: "🇻🇨", name: "Saint Vincent" },
  { code: "🇼🇸", name: "Samoa" },
  { code: "🇸�", name: "San Marino" },
  { code: "🇸🇹", name: "Sao Tome and Principe" },
  { code: "🇸�🇦", name: "Saudi Arabia" },
  { code: "🇸🇳", name: "Senegal" },
  { code: "🇷🇸", name: "Serbia" },
  { code: "🇸🇨", name: "Seychelles" },
  { code: "🇸🇱", name: "Sierra Leone" },
  { code: "�🇬", name: "Singapore" },
  { code: "🇸�🇰", name: "Slovakia" },
  { code: "🇸�", name: "Slovenia" },
  { code: "🇸🇧", name: "Solomon Islands" },
  { code: "🇸🇴", name: "Somalia" },
  { code: "🇿🇦", name: "South Africa" },
  { code: "🇸🇸", name: "South Sudan" },
  { code: "🇪🇸", name: "Spain" },
  { code: "🇱🇰", name: "Sri Lanka" },
  { code: "🇸🇩", name: "Sudan" },
  { code: "🇸�🇷", name: "Suriname" },
  { code: "🇸🇪", name: "Sweden" },
  { code: "🇨🇭", name: "Switzerland" },
  { code: "🇸🇾", name: "Syria" },
  { code: "🇹🇼", name: "Taiwan" },
  { code: "🇹🇯", name: "Tajikistan" },
  { code: "🇹🇿", name: "Tanzania" },
  { code: "🇹🇭", name: "Thailand" },
  { code: "🇹🇱", name: "Timor-Leste" },
  { code: "🇹🇬", name: "Togo" },
  { code: "🇹🇴", name: "Tonga" },
  { code: "🇹🇹", name: "Trinidad and Tobago" },
  { code: "🇹🇳", name: "Tunisia" },
  { code: "🇹🇷", name: "Turkey" },
  { code: "🇹🇲", name: "Turkmenistan" },
  { code: "🇹🇻", name: "Tuvalu" },
  { code: "🇺🇬", name: "Uganda" },
  { code: "🇺🇦", name: "Ukraine" },
  { code: "🇦🇪", name: "United Arab Emirates" },
  { code: "🇬🇧", name: "United Kingdom" },
  { code: "🇺🇸", name: "United States" },
  { code: "🇺🇾", name: "Uruguay" },
  { code: "🇺🇿", name: "Uzbekistan" },
  { code: "🇻🇺", name: "Vanuatu" },
  { code: "🇻🇦", name: "Vatican City" },
  { code: "🇻🇪", name: "Venezuela" },
  { code: "🇻🇳", name: "Vietnam" },
  { code: "🇾🇪", name: "Yemen" },
  { code: "🇿🇲", name: "Zambia" },
  { code: "🇿🇼", name: "Zimbabwe" },
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
