import Link from "next/link";
import { redirect } from "next/navigation";
import { session } from "../../lib/server";
import Auth from "../../components/Auth";
import AuthShell from "../../components/AuthShell";

export const metadata = { title: "Sign in", robots: { index: false } };

export default async function SignIn({ searchParams }) {
  const { next } = await searchParams;
  if ((await session()).authenticated) redirect(next?.startsWith("/") && !next.startsWith("//") ? next : "/account/");
  return <AuthShell title="Sign in" sub="Welcome back. Pick up your study plan where you left it." aside="Your SSC plan is waiting."
    switchTo={<>New to SSC Pitara? <Link href="/signup/">Create a free account</Link></>}>
    <Auth mode="signin" next={next} />
  </AuthShell>;
}
