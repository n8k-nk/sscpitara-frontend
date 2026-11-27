import { Suspense } from "react";
import Link from "next/link";
import ClaimPremium from "../../components/ClaimPremium";
import Pay from "../../components/Pay";
import SiteFooter from "../../components/SiteFooter";
import HomeHeader from "../_home/HomeHeader";
import { metadata as pageMetadata } from "../../lib/public";
import { call, money, session } from "../../lib/server";
import styles from "./plans.module.css";

export const metadata = pageMetadata(
  "Free and Premium",
  "Winter offer: get Premium for ₹0 (was ₹199/year) with 2,000 AI credits, plus ₹100 top-ups for +150 AI credits on SSC Pitara.",
  "/plans/",
);

const COMPARISON = [
  {
    feature: "Worked Explanations & Shortcuts",
    hint: "Detailed step-by-step solutions on PYQs",
    free: "— Locked",
    premium: "✓ All explanations unlocked",
    freeNo: true,
    premiumYes: true,
  },
  {
    feature: "Timed PYQ Paper Mocks",
    hint: "Attempt real past papers under original exam timer + AI coach",
    free: "— Locked",
    premium: "✓ All PYQ mocks unlocked",
    freeNo: true,
    premiumYes: true,
  },
  {
    feature: "Build a Custom Sectional Test",
    hint: "Create timed tests by subject, chapter & topic",
    free: "— Locked",
    premium: "✓ Unlimited custom tests",
    freeNo: true,
    premiumYes: true,
  },
  {
    feature: "Previous-Year Papers (PYQs)",
    hint: "Full shift-wise papers with official answers",
    free: "6 papers / year & tier (2× Shift 1, 2, 3)",
    premium: "All 53+ papers & every shift",
    premiumStrong: true,
  },
  {
    feature: "Full-Length Timed Mocks",
    hint: "SSC CGL Tier I & Tier II exam-pattern mocks",
    free: "First 2 mocks per tier",
    premium: "All 200+ Tier I & Tier II mocks",
    premiumStrong: true,
  },
  {
    feature: "Learn Lessons",
    hint: "Structured concept chapters for SSC CGL Tier I & Tier II",
    free: "First 2 lessons free",
    premium: "✓ All Tier I & Tier II lessons",
    premiumYes: true,
  },
  {
    feature: "AI Credits",
    hint: "Starter balance vs winter-offer Premium add-on",
    free: "5 starter credits",
    premium: "2,000 AI credits included",
    premiumStrong: true,
  },
  {
    feature: "AI Study Tools",
    hint: "AI Tutor Chat, PYQ Ask AI, Analytics AI Review & Lesson Ask AI",
    free: "1 credit / request (up to 5)",
    premium: "1 credit / request (2,000 included)",
  },
  {
    feature: "AI Credit Top-up",
    hint: "Recharge anytime on Free or Premium",
    free: "₹100 for +150 credits",
    premium: "₹100 for +150 credits",
  },
  {
    feature: "Topic-wise PYQ Practice",
    hint: "Filter & practise past questions by subject and topic",
    free: "✓ Included",
    premium: "✓ Included",
    freeYes: true,
    premiumYes: true,
  },
  {
    feature: "Quiz Games & Current Affairs",
    hint: "Daily GA digests, news & 6 speed-drill games",
    free: "✓ Included",
    premium: "✓ Included",
    freeYes: true,
    premiumYes: true,
  },
  {
    feature: "Validity",
    hint: "",
    free: "Free forever",
    premium: "1 year from purchase",
  },
];

async function PurchaseAction({ signedIn, topup = false, billingData }) {
  const offerPrice = money(0);
  const topupPrice = money(100);
  const billing = signedIn ? (await billingData)?.data : null;

  const buy = billing?.premium ? (
    <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", alignItems: "center" }}>
      <span className="badge ok">Premium active on this account</span>
      <Link className="button secondary" href="/billing/">
        Manage billing
      </Link>
    </div>
  ) : signedIn ? (
    <ClaimPremium label={`Get Premium · ${offerPrice}`} />
  ) : (
    <Link className="button" href="/signin/?next=/plans/">
      Sign in to get Premium ({offerPrice})
    </Link>
  );

  const buyTopup = billing?.enabled && billing?.available && billing?.authenticated ? (
    <Pay price={topupPrice} kind="topup" label={`Buy +150 AI Credits · ${topupPrice}`} />
  ) : signedIn && billing?.premium ? (
    <Link className="button secondary" href="/billing/">
      Billing ({topupPrice})
    </Link>
  ) : signedIn ? (
    <p className="muted">A top-up of {topupPrice} for +150 credits is available when checkout is on.</p>
  ) : (
    <Link className="button secondary" href="/signin/?next=/plans/">
      Sign in to top up
    </Link>
  );

  return topup ? buyTopup : buy;
}

async function FreeLessons() {
  const learn = await call("learn/cgl", "summary=1").catch(() => null);
  const preview = learn?.data?.preview ?? [];
  return preview.length
    ? preview.map((lesson) => `${lesson.title} (${lesson.subject})`).join(", ")
    : "the first two lessons in study order";
}

function PlanContent({ signedIn }) {
  const price = money(199);
  const topupPrice = money(100);
  const billingData = signedIn ? call("billing/plan").catch(() => null) : null;

  return (
    <div className={styles.plansWrap}>
      <div className={styles.cards}>
        <article className={styles.card}>
          <div className={styles.cardTop}>
            <span className="eyebrow">Free</span>
            <span className="badge">Starter</span>
          </div>
          <p className={styles.priceRow}>
            <strong>{money(0)}</strong>
            <span>forever</span>
          </p>
          <p className={styles.cardDesc}>
            Start preparing right away with <Suspense fallback="the first two lessons in study order"><FreeLessons /></Suspense>, 6 PYQ papers per year, and 5 free AI credits.
          </p>
          <ul className={styles.highlights}>
            <li>5 free AI credits across AI Tutor, PYQ Ask AI &amp; Analytics</li>
            <li>6 free PYQ papers per year &amp; tier</li>
            <li>First 2 full mocks per tier + first 2 lessons</li>
            <li>Unlimited Topic Practice, Quiz Games &amp; Current Affairs</li>
          </ul>
          <div className={styles.cardCta}>
            <Link className="button secondary" href="/learn/">
              Open free lessons
            </Link>
          </div>
        </article>

        <article className={`${styles.card} ${styles.cardFeatured}`}>
          <div className={styles.cardTop}>
            <span className="eyebrow">Premium · Winter Offer</span>
            <span className="badge ok">2,000 AI Credits</span>
          </div>
          <p className={styles.priceRow}>
            <del className={styles.oldPrice} aria-label="Original price ₹199">{price}</del>
            <strong>{money(0)}</strong>
            <span>/ 1 year</span>
          </p>
          <p className={styles.cardDesc}>
            Unlock worked solutions, all PYQ shifts, every mock test &amp; lesson, plus 2,000 AI credits for 1 year — free with our Winter Offer.
          </p>
          <ul className={styles.highlights}>
            <li>Worked explanations &amp; shortcuts for every question</li>
            <li>All 53+ PYQ papers per year, PYQ mocks &amp; sectional builder</li>
            <li>All 200+ full mocks + every Tier I &amp; Tier II lesson</li>
            <li>2,000 AI credits included (worth {topupPrice}+)</li>
          </ul>
          <div className={styles.cardCta}><Suspense fallback={<span className="skeleton-line" role="status" aria-label="Loading Premium options" />}>
            <PurchaseAction signedIn={signedIn} billingData={billingData} />
          </Suspense></div>
        </article>
      </div>

      <section id="topup" className={styles.topupBand} aria-labelledby="topup-heading">
        <div className={styles.topupInfo}>
          <span className="eyebrow">Need more AI credits?</span>
          <h2 id="topup-heading">AI Credits Top-up — +150 AI Credits for {topupPrice}</h2>
          <p>Available anytime for both Free and Premium accounts. Credits never expire and stack on your existing balance.</p>
        </div>
        <div className={styles.topupAction}><Suspense fallback={<span className="skeleton-line" role="status" aria-label="Loading top-up options" />}>
          <PurchaseAction signedIn={signedIn} billingData={billingData} topup />
        </Suspense></div>
      </section>

      <section className={styles.tableSection} aria-labelledby="compare-heading">
        <h2 id="compare-heading">Compare Free vs Premium</h2>
        <p className={styles.tableSub}>Line-by-line breakdown of what is included in each plan.</p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col">Free ({money(0)})</th>
                <th scope="col">Premium (<del>{price}</del> {money(0)}/yr)</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature}>
                  <td>
                    <span className={styles.featureName}>{row.feature}</span>
                    {row.hint && <span className={styles.featureHint}>{row.hint}</span>}
                  </td>
                  <td className={row.freeYes ? styles.yes : row.freeNo ? styles.no : styles.cellFree}>
                    {row.free}
                  </td>
                  <td className={row.premiumYes ? styles.yes : styles.cellPremium}>
                    {row.premiumStrong ? <strong>{row.premium}</strong> : row.premium}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default async function Plans() {
  const signedIn = Boolean((await session()).authenticated);

  if (!signedIn) {
    return (
      <div className={styles.shell}>
        <HomeHeader authenticated={false} />
        <main id="main" className={styles.main}>
          <div className={styles.plansWrap}>
            <div className={styles.head}>
              <span className="eyebrow">SSC CGL · Tier I &amp; Tier II</span>
              <h1>Free, and Premium</h1>
              <p>Start free with 5 AI credits and 6 PYQ papers per year, or unlock everything + 200 AI credits for {money(199)} / year.</p>
            </div>
          </div>
          <PlanContent signedIn={signedIn} />
        </main>
        <SiteFooter authenticated={false} />
      </div>
    );
  }

  return (
    <>
      <div className={styles.plansWrap}>
        <div className={`page-head ${styles.head}`}>
          <span className="eyebrow">SSC CGL · Tier I &amp; Tier II</span>
          <h1>Free, and Premium</h1>
          <p>Compare every feature line-by-line. Premium is {money(199)} for 1 year with 200 AI credits, plus {money(100)} top-ups for +150 AI credits.</p>
        </div>
      </div>
      <PlanContent signedIn={signedIn} />
    </>
  );
}
