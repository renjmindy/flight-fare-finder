import { useState, type FormEvent } from "react";
import { BellRing, Check, Clock } from "lucide-react";
import type { PlanName, Subscription } from "@/lib/flightApi";

type Props = {
  plan: { name: PlanName; label: string; placeholder: string };
  subscription: Subscription | undefined;
  busy: boolean;
  error: string | null;
  onSave: (plan: PlanName, targetPrice: number) => void;
  onCancel: (route: string) => void;
};

const inputClass =
  "w-full rounded-lg border bg-input/30 px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30";

export function PlanCard({ plan, subscription, busy, error, onSave, onCancel }: Props) {
  const status = subscription?.subscription_status;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(subscription ? String(subscription.target_price) : "");
  const needsPayment = status === undefined || status === "pending_payment" || status === "expired";
  const showForm = needsPayment || editing;

  const submitLabel =
    status === "pending_payment"
      ? "完成付款 Pay"
      : status === "expired"
        ? "重新訂閱 Resubscribe"
        : status === undefined
          ? "開始追蹤"
          : "儲存 Save";

  function submit(e: FormEvent) {
    e.preventDefault();
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return;
    onSave(plan.name, n);
    setEditing(false);
  }

  return (
    <div className="rounded-2xl border bg-card p-6 transition hover:border-primary/50">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{plan.label}</h2>
        {status === "active" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-primary-glow">
            <Check className="h-3.5 w-3.5" /> 已訂閱 (有效)
          </span>
        )}
        {status === "pending_payment" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> 未完成付款
          </span>
        )}
        {status === "cancelled" && (
          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-muted-foreground">
            已取消 · 有效至 {subscription?.current_period_end_date ?? "—"}
          </span>
        )}
        {status === "expired" && (
          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-muted-foreground">
            已結束
          </span>
        )}
      </div>

      {subscription && !editing && !needsPayment && (
        <p className="mt-4 text-sm text-muted-foreground">
          目標價 Target:{" "}
          <span className="text-base font-semibold text-foreground">
            NT${subscription.target_price.toLocaleString()}
          </span>
        </p>
      )}
      {status === "cancelled" && (
        <p className="mt-2 text-xs text-muted-foreground">
          仍會通知到有效日為止 Alerts continue until then.
        </p>
      )}

      {showForm ? (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block space-y-1.5 text-sm">
            <span className="text-muted-foreground">目標價 (TWD) Target price</span>
            <input
              className={inputClass}
              type="number"
              min={1}
              max={1000000}
              step={1}
              required
              inputMode="numeric"
              placeholder={plan.placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          {needsPayment && (
            <p className="text-xs text-muted-foreground">
              月訂閱制，付款後才會收到降價通知。 Monthly plan — alerts start after payment.
            </p>
          )}
          <button
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary py-2.5 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            <BellRing className="h-4 w-4" />
            {busy ? "…" : submitLabel}
          </button>
        </form>
      ) : (
        <div className="mt-4 space-y-2">
          <button
            onClick={() => {
              setValue(String(subscription?.target_price ?? ""));
              setEditing(true);
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm transition hover:bg-accent"
          >
            更新目標價 Update
          </button>
          {status === "active" && (
            <button
              disabled={busy}
              onClick={() => {
                if (
                  window.confirm(
                    "確定要取消訂閱嗎？有效期間內仍會收到通知。\nCancel your subscription?",
                  )
                ) {
                  onCancel(subscription!.route);
                }
              }}
              className="w-full rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:text-destructive disabled:opacity-60"
            >
              取消訂閱 Cancel
            </button>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
