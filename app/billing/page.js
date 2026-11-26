import Link from "next/link";
import { redirect } from "next/navigation";
import Pay from "../../components/Pay";
import { money, session } from "../../lib/server";
import { call } from "../../lib/server";
import styles from "./billing.module.css";

export const metadata = { title: "Billing & Credits", robots: { index: false } };

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function daysLeft(expiresAt) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default async function Billing() {
  const user = await session();
  if (!user.authenticated) redirect("/signin/?next=/billing/");

  const { data } = await call("billing/plan").catch(() => ({ data: null }));
  const credits = data?.credits ?? user.credits ?? 0;
  const isPremium = Boolean(data?.premium);
  const active = data?.active;
  const history = data?.history ?? [];
  const creditEvents = data?.credit_events ?? [];
  const price = money(199);
  const topupPrice = money(100);

  return (
    <div className={styles.billing}>
      <div className="page-head">
        <span className="eyebrow">Account</span>
        <h1>Billing &amp; AI Credits</h1>
        <p>Check your active plan, validity period, remaining AI credits, and how credits are used.</p>
      </div>

      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="credits-title">
          <div className={styles.cardHead}>
            <h2 id="credits-title">AI Credits</h2>
            <span className={`badge ${credits > 0 ? "ok" : "warn"}`}>
              {credits > 0 ? "Available" : "Empty"}
            </span>
          </div>
          <div className={styles.creditsNum}>
            <strong>{credits}</strong>
            <span>credit{credits === 1 ? "" : "s"} remaining</span>
          </div>
          <p className={styles.note}>
            Every signed-in account starts with <strong>5 free credits</strong>. 1-year Premium adds <strong>200 credits</strong>, and you can top up <strong>+150 credits for {topupPrice}</strong> anytime.
          </p>
          <ul className={styles.usageRules}>
            <li><span>AI Tutor chat</span><strong>1 credit / message</strong></li>
            <li><span>PYQ Ask AI / mistake feedback</span><strong>1 credit / request</strong></li>
            <li><span>Analytics AI review</span><strong>1 credit / review</strong></li>
            <li><span>Lesson Ask AI</span><strong>1 credit / question</strong></li>
          </ul>
          <div className={styles.cardFoot}>
            <Link className="button secondary" href="/tutor/">Open AI Tutor</Link>
            {data?.enabled && data?.available ? (
              <Pay price={topupPrice} kind="topup" label={`Top up +150 credits · ${topupPrice}`} />
            ) : (
              <Link className="button" href="/plans/#topup">Top up +150 credits · {topupPrice}</Link>
            )}
          </div>
        </section>

        <section className={styles.card} aria-labelledby="plan-title">
          <div className={styles.cardHead}>
            <h2 id="plan-title">Active Plan</h2>
            <span className={`badge ${isPremium ? "ok" : ""}`}>
              {isPremium ? "Premium" : "Free"}
            </span>
          </div>

          <dl className={styles.facts}>
            <div>
              <dt>Plan</dt>
              <dd>{isPremium ? "Premium (1 year)" : "Free"}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>{isPremium ? `${price} / 1 year` : "₹0"}</dd>
            </div>
            <div>
              <dt>Validity</dt>
              <dd>
                {active
                  ? `${formatDate(active.starts_at)} – ${formatDate(active.expires_at)} (${daysLeft(active.expires_at)} days left)`
                  : isPremium
                    ? "Complimentary access"
                    : "Upgrade for 1 year of Premium + 200 AI credits"}
              </dd>
            </div>
          </dl>

          {!isPremium && (
            <div className={styles.cardFoot}>
              {data?.enabled && data?.available ? (
                <Pay price={price} />
              ) : (
                <Link className="button" href="/plans/">
                  View Premium ({price} / 1 year)
                </Link>
              )}
            </div>
          )}
        </section>
      </div>

      {creditEvents.length > 0 && (
        <section className={styles.history} aria-labelledby="credit-activity-title" style={{ marginBottom: history.length ? "1.25rem" : 0 }}>
          <h2 id="credit-activity-title">Recent AI credit activity</h2>
          <ul className={styles.historyList}>
            {creditEvents.map((ev, idx) => (
              <li key={`${ev.created_at}-${idx}`}>
                <span>
                  <strong>{ev.reason}</strong> · <span className="muted">{formatDate(ev.created_at)}</span>
                </span>
                <span className={`badge ${ev.delta > 0 ? "ok" : ""}`}>
                  {ev.delta > 0 ? `+${ev.delta}` : ev.delta} credit{Math.abs(ev.delta) === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {history.length > 0 && (
        <section className={styles.history} aria-labelledby="history-title">
          <h2 id="history-title">Payment history</h2>
          <ul className={styles.historyList}>
            {history.map((item) => (
              <li key={item.order_id}>
                <span>
                  <strong>{formatDate(item.created_at)}</strong> · Order {item.order_id}
                </span>
                <span>
                  {money((item.amount || 19900) / 100)} · <span className="badge">{item.state}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
