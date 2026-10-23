import { supabase } from "@/integrations/supabase/client";

export type PlanName = "tokyo" | "seoul" | "sanfrancisco";
export type SubscriptionStatus = "pending_payment" | "active" | "cancelled" | "expired";

export type Subscription = {
  route: string;
  plan_name: PlanName;
  target_price: number;
  currency: string;
  subscription_status: SubscriptionStatus;
  current_period_end_date?: string;
};

export const PLANS: { name: PlanName; route: string; label: string; placeholder: string }[] = [
  { name: "tokyo", route: "TPE-TYO", label: "台北 ✈ 東京", placeholder: "10000" },
  { name: "seoul", route: "TPE-SEL", label: "台北 ✈ 首爾", placeholder: "6000" },
  { name: "sanfrancisco", route: "TPE-SFO", label: "台北 ✈ 舊金山", placeholder: "30000" },
];

const API_URL = import.meta.env["VITE_FLIGHT_API_URL"] as string | undefined;

function apiUrl(path: string) {
  if (!API_URL) throw new Error("Missing VITE_FLIGHT_API_URL");
  return `${API_URL.replace(/\/+$/, "")}${path}`;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please sign in again");
  return { Authorization: `Bearer ${token}` };
}

async function failure(res: Response, fallback: string): Promise<Error> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return new Error(data.error ?? `${fallback} (${res.status})`);
}

export async function listSubscriptions(): Promise<Subscription[]> {
  const res = await fetch(apiUrl("/subscriptions"), { headers: await authHeaders() });
  if (!res.ok) throw await failure(res, "Failed to load subscriptions");
  const data = (await res.json()) as { subscriptions: Subscription[] };
  return data.subscriptions;
}

export type SaveResult = { kind: "checkout"; html: string } | { kind: "updated" };

export async function saveSubscription(input: {
  plan_name: PlanName;
  target_price: number;
}): Promise<SaveResult> {
  const res = await fetch(apiUrl("/subscribe"), {
    method: "POST",
    headers: { "content-type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await failure(res, "Request failed");
  // text/html = hand the browser to ECPay's cashier; JSON = in-place update (no payment)
  if ((res.headers.get("content-type") ?? "").includes("text/html")) {
    return { kind: "checkout", html: await res.text() };
  }
  return { kind: "updated" };
}

export async function cancelSubscription(route: string): Promise<void> {
  const res = await fetch(apiUrl("/cancel"), {
    method: "POST",
    headers: { "content-type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ route }),
  });
  if (!res.ok) throw await failure(res, "Cancel failed");
}
