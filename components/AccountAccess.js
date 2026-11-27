import Image from "next/image";
import Link from "next/link";
import InformationLinks from "./InformationLinks";
import styles from "./AccountAccess.module.css";

const GOOGLE_ERRORS = {
  not_configured: "Google sign-in is not configured yet.",
  cancelled: "Google sign-in was cancelled. You can try again or use your email ID.",
  invalid_state: "Google sign-in session expired. Please try again.",
  token_failed: "Could not complete Google sign-in. Please try again.",
  oauth_failed: "Could not reach Google sign-in. Please try again.",
  unverified_email: "Your Google account email must be verified to sign in.",
  account_disabled: "This account is disabled. Contact support if you think this is a mistake.",
};

export default function AccountAccess({
  title,
  intro,
  switchTo,
  next = "",
  googleEnabled = false,
  googleError = "",
  children,
}) {
  const startHref = `/api/auth/google/start/${next ? `?next=${encodeURIComponent(next)}` : ""}`;
  const errorText = GOOGLE_ERRORS[googleError] || "";

  return <main id="main" className={styles.page}>
    <section className={styles.access} aria-labelledby="access-title">
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <Image src="/icon.svg" width={38} height={32} alt="" />
          SSC Pitara
        </Link>
        <Link href="/" className={styles.home}><span aria-hidden="true">←</span> Home</Link>
      </header>
      <div className={styles.content}>
        <h1 id="access-title">{title}</h1>
        <p className={styles.intro}>{intro}</p>
        {googleEnabled ? (
          <a href={startHref} className={styles.google}>
            <Image src="/images/google-g.svg" width={19} height={19} alt="" />
            Continue with Google
          </a>
        ) : (
          <>
            <button type="button" className={styles.google} disabled aria-describedby="google-status">
              <Image src="/images/google-g.svg" width={19} height={19} alt="" />
              Continue with Google
            </button>
            <p id="google-status" className={styles.googleStatus}>Google sign-in is currently unavailable.</p>
          </>
        )}
        {errorText && <p role="alert" className="errorlist" style={{ marginTop: ".5rem", textAlign: "center" }}>{errorText}</p>}
        <div className={styles.divider}><span>Or use your email</span></div>
        {children}
        <p className={styles.switchAccount}>{switchTo}</p>
      </div>
      <footer><nav className={styles.footerLinks} aria-label="Site information"><InformationLinks /></nav></footer>
    </section>
    <aside className={styles.study}>
      <div className={styles.studyCopy}>
        <h2>Make the next study session count.</h2>
        <p>Practise with previous-year SSC questions and review the topics where you lost marks.</p>
      </div>
      <div className={styles.photo}>
        <Image src="/images/landing-aspirant.webp" alt="Student writing in a notebook beside a stack of books" fill
          sizes="42vw" className={styles.lightPhoto} />
        <Image src="/images/landing-planner.webp" alt="Open study planner with a pencil" fill
          sizes="42vw" className={styles.darkPhoto} />
      </div>
    </aside>
  </main>;
}
