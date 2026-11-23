import Link from "next/link";
import Verify from "../../../../components/Verify";
import AuthShell from "../../../../components/AuthShell";
import { call } from "../../../../lib/server";
export const metadata = { title: "Confirm recovery email", robots: { index: false } };
export default async function Page({ params }) {
  const { token } = await params;
  const { ok, data } = await call(`account/recovery/${encodeURIComponent(token)}`);
  if (!ok) return <AuthShell title="Verification link expired" sub="Sign in to request a new verification link."><Link className="button block" href="/signin/">Sign in</Link></AuthShell>;
  return <Verify token={token} pending={data.pending_email} />;
}
