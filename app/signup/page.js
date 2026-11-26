import Link from "next/link";
import { redirect } from "next/navigation";
import { session } from "../../lib/server";
import Auth from "../../components/Auth";
import AccountAccess from "../../components/AccountAccess";

export const metadata = { title: "Create an account", robots: { index: false } };

export default async function SignUp() {
  if ((await session()).authenticated) redirect("/onboarding/");
  return <AccountAccess title="Create an account" intro="Save your exam matches, practice results and study progress."
    switchTo={<>Already have an account? <Link href="/signin/">Sign in</Link></>}>
    <Auth mode="signup" />
  </AccountAccess>;
}
