import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { useAuthUser } from "@/components/ProtectedRoute";
import { PlanCard } from "@/components/PlanCard";
import {
  PLANS,
  cancelSubscription,
  listSubscriptions,
  saveSubscription,
  type PlanName,
  type Subscription,
} from "@/lib/flightApi";
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
  const [params] = useSearchParams();
  const purchase = params.get("purchase");
  const hasActive = (d: Subscription[] | undefined) =>
    !!d?.some((s) => s.subscription_status === "active");

  const subs = useQuery({
    queryKey: ["subscriptions", email],
    queryFn: listSubscriptions,
    enabled: email !== "",
    // right after paying, the ECPay callback may land a few seconds late: poll until it does
    refetchInterval: (q) =>
      purchase === "success" && q.state.dataUpdateCount < 12 && !hasActive(q.state.data)
        ? 3000
        : false,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["subscriptions", email] });
  const save = useMutation({
    mutationFn: (v: { plan: PlanName; target: number }) =>
      saveSubscription({ plan_name: v.plan, target_price: v.target }),
    onSuccess: (result) => {
      if (result.kind === "checkout") {
        // hand the browser to ECPay's cashier (the returned form auto-submits)
        document.open();
        document.write(result.html);
        document.close();
        return;
      }
      refresh();
    },
  });
  const cancel = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: refresh,
  });
  const busyPlan = (name: PlanName, route: string) =>
    (save.isPending && save.variables?.plan === name) ||
    (cancel.isPending && cancel.variables === route);
  const errorFor = (name: PlanName, route: string) =>
    save.isError && save.variables?.plan === name
      ? save.error.message
      : cancel.isError && cancel.variables === route
        ? cancel.error.message
        : null;

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
        {purchase === "success" && (
          <p className="mt-6 rounded-lg border border-primary/40 bg-accent px-4 py-3 text-sm">
            付款完成！訂閱啟用中… Payment received — activating your subscription.
          </p>
        )}
        {purchase === "failed" && (
          <p className="mt-6 text-sm text-destructive">
            付款未完成 Payment didn't go through. You can try again below.
          </p>
        )}
        {subs.data?.some((s) => s.subscription_status === "pending_payment") && (
          <p className="mt-6 text-sm text-muted-foreground">
            尚未付款的航線不會收到通知，請按「完成付款」。 Routes awaiting payment get no alerts
            until you pay.
          </p>
        )}
        {subs.isError && (
          <p className="mt-6 text-sm text-destructive">
            無法載入訂閱 Couldn't load your subscriptions. Please refresh.
          </p>
        )}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {PLANS.map((plan) => {
            const sub = subs.data?.find((s) => s.route === plan.route);
            return (
              <PlanCard
                key={`${plan.name}-${sub?.subscription_status}-${sub?.target_price}`}
                plan={plan}
                subscription={sub}
                busy={busyPlan(plan.name, plan.route)}
                error={errorFor(plan.name, plan.route)}
                onSave={(p, target) => save.mutate({ plan: p, target })}
                onCancel={(route) => cancel.mutate(route)}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
