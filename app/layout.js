import Link from "next/link";
import { site, indexable } from "../lib/public";
import { session } from "../lib/server";
import SignOut from "../components/SignOut";
import Capture from "../components/Capture";
import { NavLink } from "../components/Nav";
import "katex/dist/katex.min.css";
import "./style.css";

export const metadata = {
  metadataBase: site,
  title: { default: "SSC Pitara", template: "%s | SSC Pitara" },
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport = { themeColor: "#ffffff" };

const Mark = () => <span className="mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M3 10V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v3" /><path d="M10 10v3h4v-3" /></svg></span>;

export default async function Layout({ children }) {
  const user = await session();
  return <html lang="en"><body>
    <Capture />
    <a className="skip" href="#main">Skip to content</a>
    <header className="site-header"><div className="bar">
      <Link className="brand" href="/"><Mark />SSC Pitara</Link>
      <nav className="site-nav" aria-label="Main">
        <NavLink href="/exams/" match={["/exams"]}>Exams</NavLink>
        <NavLink href="/pyq/" match={["/pyq"]}>PYQs</NavLink>
        <NavLink href="/learn/" match={["/learn", "/study/learn"]}>Learn</NavLink>
        {user.authenticated ? <>
          <NavLink href="/study/">Today</NavLink>
          <NavLink href="/study/practice/" match={["/study/practice", "/study/attempt"]}>Practice</NavLink>
          <NavLink href="/study/progress/">Progress</NavLink>
          <span className="divider" aria-hidden="true" />
          <NavLink href="/account/" match={["/account", "/onboarding"]}>My SSC profile</NavLink>
          <SignOut />
        </> : <>
          <span className="divider" aria-hidden="true" />
          <NavLink href="/signin/">Sign in</NavLink><Link className="nav-cta" href="/signup/">Sign up</Link>
        </>}
      </nav>
    </div></header>
    <main id="main">{children}</main>
    <footer className="site-footer"><div className="bar">
      <nav aria-label="Footer"><Link href="/exams/">Exam directory</Link><Link href="/pyq/">Free PYQs</Link><Link href="/learn/">Free lessons</Link><Link href="/plans/">Free coverage</Link>
        {user.authenticated ? <><Link href="/account/recovery/">Recovery email</Link><Link href="/support/">Support</Link></> : <Link href="/signin/">Sign in</Link>}</nav>
      <p>Free SSC preparation. Always confirm details in the official SSC notice.</p>
    </div></footer>
  </body></html>;
}
