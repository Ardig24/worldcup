import { Link, useRouterState } from "@tanstack/react-router";
import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Home, CalendarDays, Trophy, Users, CircleUserRound } from "lucide-react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Matches" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/groups", label: "Groups" },
] as const;

const bottomNavItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Matches", icon: CalendarDays },
  { to: "/leaderboard", label: "Board", icon: Trophy },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/profile", label: "Profile", icon: CircleUserRound },
] as const;

export function TopNav() {
  const { location } = useRouterState();
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Sign out error:', error);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur border-b-2 border-ink/10">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full pitch-bg stamp flex items-center justify-center shrink-0">
            <span className="text-chalk font-score text-lg md:text-xl leading-none">SB</span>
          </div>
          <div className="leading-tight">
            <div className="font-display font-black text-[15px] md:text-[17px] tracking-tight">ScoreBattle</div>
            <div className="text-[8px] md:text-[9px] font-mono-num tracking-[0.2em] uppercase text-muted-foreground -mt-0.5">
              World Cup · 2026
            </div>
          </div>
        </Link>

        {/* Desktop nav links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((n) => {
            const active = location.pathname === n.to || (n.to !== "/" && location.pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`relative px-4 py-2 text-sm font-medium transition ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {n.label}
                {active && <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-tomato" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 md:gap-3">
          {!loading && user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden md:inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-ink text-paper text-sm font-medium hover:bg-pitch-deep transition stamp"
              >
                Predict now
              </Link>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Link
                  to="/profile"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-sunshine border-2 border-ink flex items-center justify-center text-xs font-bold hover:bg-sunshine/60 transition"
                  title="Profile"
                >
                  {user.email?.[0].toUpperCase()}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 md:p-2 rounded-full hover:bg-sunshine/40 transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center px-3 h-8 rounded-full border-2 border-ink text-xs font-medium hover:bg-ink/5 transition"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center px-3 h-8 rounded-full bg-ink text-paper text-xs font-medium stamp"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { location } = useRouterState();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-ink/10">
      <div className="flex items-stretch">
        {bottomNavItems.map((n) => {
          const Icon = n.icon;
          const active = location.pathname === n.to || (n.to !== "/" && location.pathname.startsWith(n.to));
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                active ? "text-pitch-deep" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{n.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <SiteFooter />
      <BottomNav />
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t-2 border-ink/10 py-10">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full pitch-bg" />
          <div className="text-sm">
            <span className="font-display font-bold">ScoreBattle</span>
            <span className="text-muted-foreground"> — a fan project. Not affiliated with FIFA.</span>
          </div>
        </div>
        <div className="text-xs font-mono-num tracking-[0.2em] uppercase text-muted-foreground">Issue Nº 01 · MMXXVI</div>
      </div>
    </footer>
  );
}

/* ───── shared bits ───── */

export function Eyebrow({ children, tone = "ink" }: { children: ReactNode; tone?: "ink" | "tomato" | "pitch" }) {
  const c = tone === "tomato" ? "text-tomato" : tone === "pitch" ? "text-pitch-deep" : "text-ink";
  return (
    <div className={`inline-flex items-center gap-2 text-[11px] font-mono-num uppercase tracking-[0.25em] ${c}`}>
      <span className="w-6 h-px bg-current" />
      {children}
    </div>
  );
}

export function Flag({ code, size = "md" }: { code: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "text-4xl w-14 h-14" : size === "sm" ? "text-xl w-9 h-9" : "text-2xl w-11 h-11";
  return (
    <div className={`${s} rounded-md bg-paper border border-ink/15 flex items-center justify-center shrink-0`}>
      {code}
    </div>
  );
}
