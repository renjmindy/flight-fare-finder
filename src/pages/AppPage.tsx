import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { useAuthUser } from "@/components/ProtectedRoute";
import { PlanCard } from "@/components/PlanCard";
import { PLANS, listSubscriptions, saveSubscription, type PlanName } from "@/lib/flightApi";
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

  const email = user.email ?? "";
  const subs = useQuery({
    queryKey: ["subscriptions", email],
    queryFn: () => listSubscriptions(email),
    enabled: email !== "",
  });
  const save = useMutation({
    mutationFn: (v: { plan: PlanName; target: number }) =>
      saveSubscription({ email, plan_name: v.plan, target_price: v.target }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subscriptions", email] }),
  });

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
        <p className="mt-3 text-muted-foreground">
          選擇航線並設定目標價，降價就寄 email 通知你。 Pick a route and a target price — we email
          you when the fare drops.
        </p>
        {subs.isError && (
          <p className="mt-6 text-sm text-destructive">
            無法載入訂閱 Couldn't load your subscriptions. Please refresh.
          </p>
        )}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              subscription={subs.data?.find((s) => s.route === plan.route)}
              saving={save.isPending && save.variables?.plan === plan.name}
              error={save.isError && save.variables?.plan === plan.name ? save.error.message : null}
              onSave={(p, target) => save.mutate({ plan: p, target })}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
