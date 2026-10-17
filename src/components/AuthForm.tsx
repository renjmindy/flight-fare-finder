import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isUp = mode === "signup";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const res = isUp
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/app` } })
      : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (res.error) return setError(res.error.message);
    if (res.data.session) navigate({ to: "/app", replace: true });
    else setInfo("請到信箱點擊確認連結 / Check your email to confirm your account.");
  }

  const input = "w-full rounded-lg border bg-input/30 px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30";

  return (
    <div className="relative grid min-h-screen place-items-center px-4">
      <div className="pointer-events-none absolute inset-0 bg-glow" />
      <div className="relative w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-2xl">
          <h1 className="text-xl font-semibold">{isUp ? "建立帳號 Sign up" : "登入 Sign in"}</h1>
          <label className="block space-y-1.5 text-sm">
            <span className="text-muted-foreground">Email</span>
            <input className={input} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="text-muted-foreground">Password</span>
            <input className={input} type="password" required minLength={6} autoComplete={isUp ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {info && <p className="text-sm text-primary-glow">{info}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-gradient-primary py-2.5 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
            {loading ? "…" : isUp ? "Sign up / 註冊" : "Sign in / 登入"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            {isUp ? "Already have an account? " : "No account yet? "}
            <Link to={isUp ? "/signin" : "/signup"} className="text-primary-glow hover:underline">
              {isUp ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
