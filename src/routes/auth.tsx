import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — HashTag Admin" },
      { name: "description", content: "Secure sign-in for restaurant owners." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: "/admin", replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        setNotice("Account created. If email confirmation is on, check your inbox, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await router.invalidate();
        navigate({ to: "/admin", replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/admin",
      });
      if (res.error) throw res.error;
      if (!res.redirected) {
        await router.invalidate();
        navigate({ to: "/admin", replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-5 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
          ← Back to site
        </Link>
        <div className="mt-6 glass rounded-3xl p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-gradient font-display text-lg font-bold text-primary-foreground">#</span>
            <div>
              <div className="font-display text-2xl">HashTag Admin</div>
              <div className="text-xs text-muted-foreground">{mode === "signin" ? "Sign in to manage your restaurant" : "Create the owner account"}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="mt-8 w-full rounded-full glass-soft px-5 py-3 text-sm font-medium hover-lift flex items-center justify-center gap-3 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="#EA4335" d="M12 11v2.8h6.4c-.3 1.6-2 4.7-6.4 4.7-3.9 0-7-3.2-7-7.1S8.1 4.3 12 4.3c2.2 0 3.7.9 4.6 1.8L19 3.7C17.3 2.1 14.9 1 12 1 6 1 1 6 1 12s5 11 11 11c6.3 0 10.5-4.5 10.5-10.8 0-.7-.1-1.3-.2-1.9H12z"/></svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" autoComplete="email"
                className="w-full rounded-xl bg-input/40 border border-border/60 px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)]" />
            </label>
            <label className="block">
              <span className="block text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Password</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className="w-full rounded-xl bg-input/40 border border-border/60 px-4 py-3 text-sm focus:outline-none focus:border-[var(--gold)]" />
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && <p className="text-sm text-[var(--gold)]">{notice}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] disabled:opacity-60"
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setNotice(null); }}
            className="mt-6 w-full text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "First time? Create the owner account →" : "Already have an account? Sign in →"}
          </button>
        </div>
        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          The first account created becomes the restaurant admin.
        </p>
      </div>
    </div>
  );
}