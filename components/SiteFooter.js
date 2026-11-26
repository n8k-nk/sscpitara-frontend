import Link from "next/link";

export default function SiteFooter({ authenticated }) {
  return <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-top">
        <div className="footer-identity">
          <Link className="brand" href="/" aria-label="SSC Pitara home">
            <img src="/icon.svg" width="38" height="32" alt="" />
            <span className="brand-name">SSC Pitara</span>
          </Link>
          <p>Free SSC preparation.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          <div>
            <p className="footer-label">Study resources</p>
            <ul>
              <li><Link href="/exams/">Exam directory</Link></li>
              <li><Link href="/pyq/">Previous-year papers</Link></li>
              <li><Link href="/learn/">Free lessons</Link></li>
              <li><Link href="/plans/">Study coverage</Link></li>
            </ul>
          </div>
          <div>
            <p className="footer-label">Account</p>
            <ul>
              {authenticated ? <>
                <li><Link href="/account/recovery/">Recovery email</Link></li>
                <li><Link href="/support/">Support</Link></li>
              </> : <li><Link href="/signin/">Sign in</Link></li>}
            </ul>
          </div>
        </nav>
      </div>
      <p className="footer-note">Confirm exam details in the official SSC notice.</p>
    </div>
  </footer>;
}
