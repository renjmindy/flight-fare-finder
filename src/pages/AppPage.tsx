import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { useAuthUser } from "@/components/ProtectedRoute";
import { usePageMeta } from "@/lib/page-meta";

export default function AppPage() {
  usePageMeta({
    title: "Dashboard — Flight Price Notifier",
    description: "Your Flight Price Notifier dashboard.",
    ogDescription: "你的航線追蹤儀表板。",
    robots: "noindex",
  });
  const user = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate("/signin", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition hover:bg-accent"
          >
            <LogOut className="h-4 w-4" /> Sign out / 登出
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold tracking-tight break-all sm:text-4xl">Hi {user.email}</h1>
        <div className="mt-8 rounded-2xl border bg-card p-8">
          <p className="text-lg">你的航線追蹤儀表板即將上線 — 下一個里程碑會加上訂閱航線的功能。</p>
          <p className="mt-3 text-muted-foreground">
            Your dashboard is coming soon. Route-subscription will be added in the next milestone.
          </p>
        </div>
      </main>
    </div>
  );
}
