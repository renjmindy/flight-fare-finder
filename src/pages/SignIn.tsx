import { AuthForm } from "@/components/AuthForm";
import { usePageMeta } from "@/lib/page-meta";

export default function SignIn() {
  usePageMeta({
    title: "Sign in — Flight Price Notifier",
    description: "Sign in to Flight Price Notifier to manage your fare alerts.",
    ogDescription: "登入 Flight Price Notifier。",
  });
  return <AuthForm mode="signin" />;
}
