import Link from "next/link";
import { redirect } from "next/navigation";
import SignOut from "../../../components/SignOut";
import { getWorkspace } from "./server";

export const metadata = { title: "Admin workspace", robots: { index: false, follow: false } };

const LOGIN = "/admin/login/?next=/admin/workspace/";

export default async function AdminLayout({ children }) {
  const workspace = await getWorkspace();
  if (workspace.status === 401) redirect(LOGIN);
  if (workspace.status === 403) {
    return <section className="card">
      <h1>Staff access required</h1>
      <p>Sign in with an authorised staff account to open the admin workspace.</p>
      <a className="button" href={LOGIN}>Staff sign in</a>
    </section>;
  }
  if (!workspace.ok) throw new Error("Could not load the admin workspace.");

  return <>
    <nav className="actions" aria-label="Admin workspace">
      <Link href="/admin/workspace/">Overview</Link>
      {workspace.data.modules.pyq && <Link href="/admin/workspace/pyq/">PYQ papers</Link>}
      <a href="/admin/">Django admin</a>
      <SignOut />
    </nav>
    {children}
  </>;
}
