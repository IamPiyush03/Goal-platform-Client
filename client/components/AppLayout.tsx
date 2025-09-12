import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <header className="backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 dark:bg-black/40 sticky top-0 z-40 border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
            <span className="inline-block h-6 w-6 rounded bg-gradient-to-br from-indigo-500 to-violet-500" />
            <span>Stride</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <NavLink to="/dashboard" label="Dashboard" active={location.pathname.startsWith("/dashboard")} />
          </nav>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button variant="outline" onClick={logout}>Logout</Button>
            ) : (
              <Button asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Stride. Achieve your goals with clarity.
      </footer>
    </div>
  );
}

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "transition-colors hover:text-foreground/80",
        active ? "text-foreground" : "text-foreground/60",
      )}
    >
      {label}
    </Link>
  );
}
