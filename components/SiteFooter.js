import Link from "next/link";

const NAV_GROUPS = [
  {
    label: "Prepare",
    links: [
      { href: "/exams/", label: "Exam directory" },
      { href: "/pyq/", label: "Previous-year papers" },
      { href: "/learn/", label: "Free lessons" },
      { href: "/plans/", label: "Study plans" },
      { href: "/current-affairs/", label: "Current affairs" },
      { href: "/news/", label: "News digest" },
    ],
  },
  {
    label: "Practice",
    links: [
      { href: "/pyq/cgl/", label: "SSC CGL PYQs" },
      { href: "/games/", label: "Quiz games" },
      { href: "/analytics/", label: "My analytics", authOnly: true },
      { href: "/study/", label: "Study session", authOnly: true },
      { href: "/tutor/", label: "AI tutor", authOnly: true },
    ],
  },
  {
    label: "Account",
    links: [
      { href: "/signin/", label: "Sign in", guestOnly: true },
      { href: "/signup/", label: "Create account", guestOnly: true },
      { href: "/account/", label: "My account", authOnly: true },
      { href: "/billing/", label: "Billing", authOnly: true },
      { href: "/onboarding/", label: "Onboarding", authOnly: true },
      { href: "/support/", label: "Support" },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "/about/", label: "About" },
      { href: "/contact/", label: "Contact" },
      { href: "/privacy/", label: "Privacy policy" },
      { href: "/terms/", label: "Terms of use" },
      { href: "/refunds/", label: "Refund policy" },
    ],
  },
];

export default function SiteFooter({ authenticated }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">

        {/* Top: brand + nav grid */}
        <div className="footer-top">

          {/* Brand column */}
          <div className="footer-brand">
            <Link className="brand" href="/" aria-label="SSC Pitara home">
              <img src="/icon.svg" width="36" height="30" alt="" />
              <span className="brand-name">SSC Pitara</span>
            </Link>
            <p className="footer-tagline">Free, focused SSC preparation.<br />Learn, practice, and clear your exam.</p>
            <ul className="footer-badges" aria-label="Highlights">
              <li>✦ 10 000+ PYQs</li>
              <li>✦ AI tutor</li>
              <li>✦ Free forever</li>
            </ul>
          </div>

          {/* Nav columns */}
          <nav className="footer-nav" aria-label="Footer navigation">
            {NAV_GROUPS.map(({ label, links }) => (
              <div key={label} className="footer-col">
                <p className="footer-label">{label}</p>
                <ul>
                  {links
                    .filter(({ authOnly, guestOnly }) =>
                      authOnly ? authenticated : guestOnly ? !authenticated : true
                    )
                    .map(({ href, label: text }) => (
                      <li key={href}>
                        <Link href={href}>{text}</Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copy">© {new Date().getFullYear()} SSC Pitara. Confirm exam details with the official SSC notice.</p>
          <p className="footer-made">Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
