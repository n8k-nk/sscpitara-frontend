import Link from "next/link";
import { site, indexable } from "../lib/public";
import "./style.css";

export const metadata = {
  metadataBase: site,
  title: { default: "SSC Pitara", template: "%s | SSC Pitara" },
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
};

export default function Layout({ children }) {
  return <html lang="en"><body>
    <a className="skip" href="#main">Skip to content</a>
    <header><Link className="brand" href="/">SSC Pitara</Link>
      <nav aria-label="Main"><Link href="/exams/">Exams</Link><Link href="/learn/">Learn</Link>
        <a href="/account/">My matches</a><a href="/study/">My study</a></nav>
    </header>
    <main id="main">{children}</main>
    <footer><Link href="/exams/">Exam directory</Link><Link href="/learn/">Free lessons</Link><a href="/signin/">Sign in</a></footer>
  </body></html>;
}
