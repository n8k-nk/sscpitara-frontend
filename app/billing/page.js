import { Suspense } from "react";
import RouteSkeleton from "../../components/RouteSkeleton";
import Link from "next/link";
import { redirect } from "next/navigation";
import Pay from "../../components/Pay";
import { money, session } from "../../lib/server";
import { call } from "../../lib/server";
import styles from "./billing.module.css";

export const metadata = { title: "Billing", robots: { index: false } };

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
  if (!user.premium) redirect("/plans/");
  return <div className={styles.billing}>
    <div className="page-head">
      <span className="eyebrow">Premium</span>
      <h1>Billing</h1>
      <p>When your Premium access ends, and the credits left on this account.</p>
    </div>
    <Suspense fallback={<RouteSkeleton label="billing" inline />}>
      <BillingDetails />
    </Suspense>
  </div>;
}

async function BillingDetails() {
  const { data } = await call("billing/plan").catch(() => ({ data: null }));
  if (data && !data.premium) redirect("/plans/");

  const active = data?.active;
  const credits = data?.credits ?? 0;
  const history = (data?.history ?? []).filter((item) => item.state && item.state !== "Pending");
  const topupPrice = money(100);
  const left = active ? daysLeft(active.expires_at) : null;

  return (
    <>
      <section className={styles.card} aria-labelledby="expiry-title">
        <div className={styles.cardHead}>
          <h2 id="expiry-title">Premium expires</h2>
          <span className="badge ok">Premium</span>
        </div>
        {active ? (
          <>
            <p className={styles.expiry}>
              <strong>{formatDate(active.expires_at)}</strong>
              <span>{left === 0 ? "Ends today" : `${left} day${left === 1 ? "" : "s"} left`}</span>
            </p>
            <p className={styles.note}>Started {formatDate(active.starts_at)}.</p>
          </>
        ) : (
          <p className={styles.expiry}>
            <strong>Complimentary access</strong>
            <span>No expiry date on this account.</span>
          </p>
        )}
        <dl className={styles.facts}>
          <div>
            <dt>AI credits left</dt>
            <dd>{credits}</dd>
          </div>
        </dl>
        <div className={styles.cardFoot}>
          {data?.enabled && data?.available ? (
            <Pay price={topupPrice} kind="topup" label={`Top up +150 credits · ${topupPrice}`} />
          ) : (
            <Link className="button secondary" href="/plans/#topup">Top up +150 credits · {topupPrice}</Link>
          )}
        </div>
      </section>

      {history.length > 0 && (
        <section className={styles.history} aria-labelledby="history-title">
          <h2 id="history-title">Payments</h2>
          <ul className={styles.historyList}>
            {history.map((item) => (
              <li key={item.order_id}>
                <span>
                  <strong>{formatDate(item.created_at)}</strong> · {item.kind || "Premium"}
                </span>
                <span>
                  {money((item.amount ?? 0) / 100)} · <span className="badge">{item.state}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
