import Link from "next/link";
import { redirect } from "next/navigation";
import { session } from "../../lib/server";
import Auth from "../../components/Auth";
import AuthShell from "../../components/AuthShell";

export const metadata = { title: "Create an account", robots: { index: false } };

export default async function SignUp() {
  if ((await session()).authenticated) redirect("/onboarding/");
  return <AuthShell title="Create an account" sub="Create a free account to save your exam matches and practice." aside="Find the SSC exams that fit you."
    switchTo={<>Already have an account? <Link href="/signin/">Sign in</Link></>}>
    <Auth mode="signup" />
  </AuthShell>;
}
