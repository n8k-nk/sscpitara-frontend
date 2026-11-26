import Image from "next/image";
import Link from "next/link";
import InformationLinks from "./InformationLinks";
import styles from "./AccountAccess.module.css";

export default function AccountAccess({ title, intro, switchTo, children }) {
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
        <button type="button" className={styles.google} disabled aria-describedby="google-status">
          <Image src="/images/google-g.svg" width={19} height={19} alt="" />
          Continue with Google
        </button>
        <p id="google-status" className={styles.googleStatus}>Google sign-in is currently unavailable.</p>
        <div className={styles.divider}><span>Or use your username</span></div>
        {children}
        <p className={styles.switchAccount}>{switchTo}</p>
      </div>
      <footer><nav className="footer-policy-links" aria-label="Site information"><InformationLinks /></nav></footer>
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
