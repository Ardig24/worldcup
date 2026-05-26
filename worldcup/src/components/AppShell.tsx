import { Link, useRouterState } from "@tanstack/react-router";
import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Home, CalendarDays, Trophy, Users, CircleUserRound } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Matches", icon: CalendarDays },
  { to: "/leaderboard", label: "Board", icon: Trophy },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/profile", label: "Profile", icon: CircleUserRound },
] as const;

export function TopNav() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-ink/10 px-4 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-full pitch-bg stamp flex items-center justify-center shrink-0">
          <span className="text-chalk font-score text-lg leading-none">SB</span>
        </div>
        <div className="leading-tight">
          <div className="font-display font-black text-[15px] tracking-tight">ScoreBattle</div>
          <div className="text-[8px] font-mono-num tracking-[0.2em] uppercase text-muted-foreground -mt-0.5">
            World Cup · 2026
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-1.5">
        {!loading && !user && (
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
        {!loading && user && (
          <Link
            to="/profile"
            className="w-8 h-8 rounded-full bg-sunshine border-2 border-ink flex items-center justify-center text-xs font-bold"
          >
            {user.email?.[0].toUpperCase()}
          </Link>
        )}
      </div>
    </header>
  );
}

export function BottomNav() {
  const { location } = useRouterState();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-ink/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch">
        {navItems.map((n) => {
          const Icon = n.icon;
          const active =
            location.pathname === n.to ||
            (n.to !== "/" && location.pathname.startsWith(n.to));
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
              {active && <span className="absolute bottom-0 w-1 h-1 rounded-full bg-pitch-deep" />}
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
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}

export function SiteFooter() {
  return null;
}

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

