import Link from "next/link";
import { redirect } from "next/navigation";
import { call, session } from "../../lib/server";
import Auth from "../../components/Auth";
import AccountAccess from "../../components/AccountAccess";

export const metadata = { title: "Create an account", robots: { index: false } };

export default async function SignUp({ searchParams }) {
  const { google_error: googleError } = await searchParams;
  const [user, info] = await Promise.all([
    session(),
    call("session").catch(() => ({ data: {} })),
  ]);
  if (user.authenticated) redirect("/onboarding/");

  return <AccountAccess
    title="Create an account"
    intro="Save your exam matches, practice results and study progress."
    googleEnabled={Boolean(info?.data?.googleEnabled)}
    googleError={googleError}
    switchTo={<>Already have an account? <Link href="/signin/">Sign in</Link></>}
  >
    <Auth mode="signup" />
  </AccountAccess>;
}
