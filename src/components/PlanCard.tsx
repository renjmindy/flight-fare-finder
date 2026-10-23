import { useState, type FormEvent } from "react";
import { BellRing, Check } from "lucide-react";
import type { PlanName, Subscription } from "@/lib/flightApi";

type Props = {
  plan: { name: PlanName; label: string; placeholder: string };
  subscription: Subscription | undefined;
  saving: boolean;
  error: string | null;
  onSave: (plan: PlanName, targetPrice: number) => void;
};

export function PlanCard({ plan, subscription, saving, error, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const subscribed = subscription !== undefined;
  const showForm = !subscribed || editing;

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
        {subscribed && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-primary-glow">
            <Check className="h-3.5 w-3.5" /> 已訂閱
          </span>
        )}
      </div>

      {subscribed && !editing && (
        <p className="mt-4 text-sm text-muted-foreground">
          目標價 Target:{" "}
          <span className="text-base font-semibold text-foreground">
            NT${subscription.target_price.toLocaleString()}
          </span>
        </p>
      )}

      {showForm ? (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block space-y-1.5 text-sm">
            <span className="text-muted-foreground">目標價 (TWD) Target price</span>
            <input
              className="w-full rounded-lg border bg-input/30 px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
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
          <button
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary py-2.5 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            <BellRing className="h-4 w-4" />
            {saving ? "…" : subscribed ? "儲存 Save" : "開始追蹤"}
          </button>
        </form>
      ) : (
        <button
          onClick={() => {
            setValue(String(subscription?.target_price ?? ""));
            setEditing(true);
          }}
          className="mt-4 w-full rounded-lg border px-3 py-2 text-sm transition hover:bg-accent"
        >
          更新目標價 Update
        </button>
      )}

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
