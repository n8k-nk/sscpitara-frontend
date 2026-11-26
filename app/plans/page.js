import Link from "next/link";
import Pay from "../../components/Pay";
import HomeHeader from "../_home/HomeHeader";
import { metadata as pageMetadata } from "../../lib/public";
import { call, money, session } from "../../lib/server";
import css from "../home.module.css";

export const metadata = pageMetadata(
  "Free and Premium",
  "The first two lessons are free. Premium is ₹199 for one year and opens the rest of SSC CGL Tier I and Tier II.",
  "/plans/",
);

const PAID = [
  "Every other SSC CGL Tier I and Tier II lesson",
  "Worked explanations on past questions",
  "Timed whole-paper mocks",
  "Hints on questions, and coaching after a mock",
];

function Offers({ preview, billing, landing }) {
  const price = money(199);
  const freeLessons = preview.length
    ? preview.map((lesson) => `${lesson.title} (${lesson.subject})`).join(", ")
    : "the first two lessons in study order";
  const freePoints = [
    `${freeLessons} — open with or without an account`,
    "The Tier I and Tier II lesson lists",
    "Untimed past questions",
  ];
  const buy = billing?.premium
    ? <p>Premium is active on this account.</p>
    : billing?.enabled && billing?.available && billing?.authenticated
      ? <Pay price={price} />
      : billing?.authenticated
        ? <p className={landing ? css.planLead : "muted"}>Premium is {price} for one year. Checkout opens once payments are switched on.</p>
        : <Link className={landing ? css.primaryCta : "button"} href="/signin/?next=/plans/">Sign in to buy Premium</Link>;

  if (landing) {
    return <div className={css.planGrid}>
      <article className={css.planOffer}>
        <div><span className={css.eyebrow}>Free</span><p className={css.planPrice}>{money(0)}</p></div>
        <ul className={css.planPoints}>{freePoints.map((item) => <li key={item}>{item}</li>)}</ul>
        <Link className={css.secondaryCta} href="/learn/">Open the free lessons</Link>
      </article>
      <article className={`${css.planOffer} ${css.planOfferFeatured}`}>
        <div><span className={css.eyebrow}>Premium</span><p className={css.planPrice}>{price} <small>/ year</small></p></div>
        <ul className={css.planPoints}>{PAID.map((item) => <li key={item}>{item}</li>)}</ul>
        {buy}
      </article>
    </div>;
  }

  return <div className="plan-compare">
    <article className="card">
      <div><span className="eyebrow">Free</span><p className="price">{money(0)}</p></div>
      <ul>{freePoints.map((item) => <li key={item}>{item}</li>)}</ul>
      <Link className="button secondary" href="/learn/">Open the free lessons</Link>
    </article>
    <article className="card featured">
      <div><span className="eyebrow">Premium</span><p className="price">{price} <small>/ year</small></p></div>
      <ul>{PAID.map((item) => <li key={item}>{item}</li>)}</ul>
      {buy}
    </article>
  </div>;
}

export default async function Plans() {
  const [user, learn, billing] = await Promise.all([
    session(),
    call("learn/cgl").catch(() => ({ data: null })),
    call("billing/plan").catch(() => ({ data: null })),
  ]);
  const preview = learn.data?.preview ?? [];
  const signedIn = Boolean(user.authenticated);
  const offers = <Offers preview={preview} billing={billing.data} landing={!signedIn} />;

  if (!signedIn) {
    return <div className={css.home}>
      <HomeHeader authenticated={false} />
      <main id="main" className={css.main}>
        <section className={`${css.section} ${css.planPage}`}>
          <div className={css.wrap}>
            <span className={css.eyebrow}>SSC CGL</span>
            <h1 className={css.editorialHeading}>Free, and Premium</h1>
            <p className={css.planLead}>Tier I and Tier II are the lessons you can open. The first two are free. Premium is {money(199)} for one year and opens the rest.</p>
            {offers}
          </div>
        </section>
      </main>
      <footer className={css.footer}>
        <div className={`${css.wrap} ${css.footerTop}`}>
          <Link href="/" className={css.brand}><img src="/icon.svg" width="32" height="26" alt="" /><span>SSC Pitara</span></Link>
          <nav className={css.footerNav} aria-label="Footer">
            <Link href="/learn/">Lessons</Link>
            <Link href="/pyq/">Past papers</Link>
            <Link href="/signin/">Sign in</Link>
          </nav>
        </div>
      </footer>
    </div>;
  }

  return <>
    <div className="page-head">
      <span className="eyebrow">SSC CGL · Tier I and Tier II</span>
      <h1>Free, and Premium</h1>
      <p>The first two lessons are free with or without an account. Premium is {money(199)} for one year.</p>
    </div>
    {offers}
  </>;
}
