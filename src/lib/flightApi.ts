export type PlanName = "tokyo" | "seoul" | "sanfrancisco";

export type Subscription = {
  email: string;
  route: string;
  plan_name: PlanName;
  target_price: number;
  currency: string;
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

export async function listSubscriptions(email: string): Promise<Subscription[]> {
  const res = await fetch(apiUrl(`/subscriptions?email=${encodeURIComponent(email)}`));
  if (!res.ok) throw new Error(`Failed to load subscriptions (${res.status})`);
  const data = (await res.json()) as { subscriptions: Subscription[] };
  return data.subscriptions;
}

export async function saveSubscription(input: {
  email: string;
  plan_name: PlanName;
  target_price: number;
}): Promise<void> {
  const res = await fetch(apiUrl("/subscribe"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
}
