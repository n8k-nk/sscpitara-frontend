import Link from "next/link";
import Pay from "../../components/Pay";
import CheckStatus from "../../components/CheckStatus";
import AuthShell from "../../components/AuthShell";
import { call, day, money } from "../../lib/server";

export const metadata = { title: "Base plan", robots: { index: false } };

export default async function Plan() {
  const { data: d } = await call("billing/plan");
  if (!d.enabled) return <AuthShell title={d.heading} sub={d.detail} icon="✓"><Link className="button block" href="/study/practice/">Open practice</Link></AuthShell>;
  const stamp = (value) => new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
  return <>
    <div className="page-head"><span className="eyebrow">CGL Tier I</span><h1>CGL Tier I Base</h1><p>₹299 for three months. Pay once for practice, timed mocks, personal study plans and revision.</p></div>
    <div className="plan">
      <article className="card"><h2>Reviewed collection</h2>
        <ul className="stats"><li><strong>{d.coverage.diagnostic}</strong><span>diagnostic questions</span></li><li><strong>{d.coverage.mocks}</strong><span>complete mocks</span></li><li><strong>{d.coverage.practice}</strong><span>practice questions</span></li></ul>
        <ul className="rows">
          {Object.entries(d.coverage.subjects ?? {}).map(([name, count]) => <li key={name}><span>{name}</span><span className="muted">{count} practice questions</span></li>)}
          {Object.entries(d.coverage.languages ?? {}).map(([code, count]) => <li key={code}><span>{code === "bilingual" ? "English and Hindi" : code === "en" ? "English" : code}</span><span className="muted">{count} reviewed questions</span></li>)}
        </ul>
        {d.coverage.topics?.length > 0 && <p className="muted" style={{ marginTop: "1rem" }}>Practice topics · {d.coverage.topics.join(", ")}</p>}
      </article>
      <aside className="card">
        {d.active ? <><span className="badge ok">Active</span><h2>Your Base pass</h2><p>{day(d.active.starts_at)} through {stamp(d.active.expires_at)}</p></> : <>
          <p className="price">{money(299)} <small>/ 3 months</small></p>
          {d.available ? <>
            <p className="muted">A pass activated today expires on {day(d.estimated_end)}.</p>
            {d.authenticated ? <Pay price={money(299)} /> : <Link className="button block" href="/signin/?next=/billing/">Sign in to buy Base</Link>}
          </> : <p className="muted">Sales open after content review and payment setup.</p>}
          {d.pending && <CheckStatus orderId={d.pending.order_id} />}
          {d.terms && <><h3 style={{ marginTop: "1.25rem" }}>Refund terms</h3><p className="muted">{d.terms}</p></>}
        </>}
      </aside>
    </div>
    {d.history.length > 0 && <section style={{ marginTop: "2rem" }}><article className="card"><h2>Purchase history</h2>
      <ul className="rows">{d.history.map((o) => <li key={o.order_id}><span>{day(o.created_at)} · {o.state}</span><span className="muted">{o.order_id}</span></li>)}</ul></article></section>}
  </>;
}
