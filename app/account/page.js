import Link from "next/link";
import SignOut from "../../components/SignOut";
import AccountProfile from "./AccountProfile";
import styles from "./account.module.css";
import { need, session } from "../../lib/server";

export const metadata = { title: "My account", robots: { index: false } };

export default async function Account() {
  const [profile, user] = await Promise.all([need("profile", "/account/"), session()]);
  const credits = user.credits ?? 0;
  const securityCard = (
    <section className={`${styles.card} ${styles.security}`} aria-labelledby="security-title">
      <div>
        <h2 id="security-title">Account settings</h2>
        <p className="muted" style={{ margin: ".25rem 0 0" }}>
          AI Credits: <strong>{credits}</strong> · <Link href="/billing/">Billing &amp; Plan</Link>
        </p>
      </div>
      <SignOut className={styles.action}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7m-3-8h12m-4-4 4 4-4 4" />
        </svg>
        Sign out
      </SignOut>
    </section>
  );

  return (
    <div className={styles.account}>
      <AccountProfile
        initialValues={profile.values}
        options={profile.options}
        username={user.username}
        profileComplete={user.profileComplete}
        securityCard={securityCard}
      />
    </div>
  );
}
