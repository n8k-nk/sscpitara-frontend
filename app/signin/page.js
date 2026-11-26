import Link from "next/link";
import { redirect } from "next/navigation";
import { session } from "../../lib/server";
import Auth from "../../components/Auth";
import AccountAccess from "../../components/AccountAccess";

export const metadata = { title: "Sign in", robots: { index: false } };

export default async function SignIn({ searchParams }) {
  const { next } = await searchParams;
  if ((await session()).authenticated) redirect(next?.startsWith("/") && !next.startsWith("//") ? next : "/account/");

  return <AccountAccess title="Sign in" intro="Pick up your SSC preparation where you left off."
    switchTo={<>Don’t have an account? <Link href="/signup/">Create a new account</Link></>}>
    <Auth mode="signin" next={next} />
  </AccountAccess>;
}
