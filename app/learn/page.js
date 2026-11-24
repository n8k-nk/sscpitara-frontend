import Link from "next/link";
import { redirect } from "next/navigation";
import { TopicMark } from "../../components/LearnMark";
import Ring from "../../components/Ring";
import { PRIORITY, weightLabel, hours } from "../../components/learnbits";
import { metadata as pageMetadata } from "../../lib/public";
import { call } from "../../lib/server";

export const metadata = pageMetadata("Free SSC CGL course: topic-wise videos and lessons",
  "A free, step-by-step SSC CGL study path: every topic in order, with free video lessons from several teachers, written notes and PYQ practice. Tick off what you already know.", "/learn/");

const STATE = { done: ["Done", "ok"], started: ["In progress", "warn"], todo: ["", ""] };

function Row({ t, signedIn }) {
  const [plabel, ptone] = PRIORITY[t.priority] ?? PRIORITY.important, wl = weightLabel(t.weight);
  return <li className={`path-row is-${signedIn ? t.state : "todo"}`}>
    <span className={`dot ${signedIn ? t.state : "todo"}`} aria-hidden="true" />
    <div className="row-main">
      <Link className="row-title" href={t.path}>{t.name}</Link>
      <span className="row-meta">
        <span className={`badge ${ptone}`}>{plabel}</span>{wl && <span className="badge">{wl}</span>}
        <span>{t.total} parts · {hours(t.minutes)}</span>
        {signedIn && t.state === "started" && <span className="badge warn">{t.done} of {t.total} done</span>}
        {signedIn && t.state === "done" && <span className="badge ok">Done</span>}
        {signedIn && t.waiting_for.length > 0 && t.state !== "done" && <span className="muted">Best after {t.waiting_for.join(", ")}</span>}
      </span>
    </div>
    <div className="row-act">
      <Link className={t.state === "todo" || !signedIn ? "button secondary" : "button ghost"} href={t.path}>{!signedIn || t.state === "todo" ? "Open" : t.state === "done" ? "Review" : "Continue"}</Link>
      {signedIn && <TopicMark id={t.id} done={t.done} total={t.total} signedIn compact />}
    </div>
  </li>;
}

export default async function Learn({ searchParams }) {
  const { stage: wanted = "" } = await searchParams;
  const { data: d } = await call("learn", "exam=CGL");
  const stages = d.stages ?? [];
  if (d.signed_in && stages.length && !d.setup) redirect("/learn/setup/");
  const stage = stages.find((s) => s.slug === wanted) ?? stages.find((s) => s.slug === d.setup?.stage) ?? stages[0];
  if (!stage) return <>
    <div className="page-head"><span className="eyebrow">SSC CGL · Combined Graduate Level</span><h1>Learn SSC CGL</h1></div>
    <p className="empty">The course is being prepared. Practise with free <Link href="/pyq/">previous year questions</Link> in the meantime.</p></>;

  const tot = stage.totals, signedIn = d.signed_in;
  const nextUp = stage.next_up ?? [];
  const lead = nextUp[0];
  return <>
    <div className="lp-head">
      <div>
        <h1>{signedIn ? `Your CGL ${stage.name} path` : "Learn SSC CGL, step by step"}</h1>
        <p className="lead">Learn prerequisites first, then focus on the most-asked topics.</p></div>
      {signedIn && <Link className="button secondary" href="/learn/setup/?edit=1">Edit setup</Link>}
    </div>

    {stages.length > 1 && <nav className="tabs stage-tabs" aria-label="Exam stage">{stages.map((x) =>
      <Link key={x.slug} href={`/learn/?stage=${x.slug}`} className={x.slug === stage.slug ? "tab on" : "tab"} aria-current={x.slug === stage.slug ? "page" : undefined}>CGL {x.name}</Link>)}</nav>}

    {!signedIn && <div className="callout"><div><strong>Make it yours</strong><p>Tell us what you have already finished and we will skip it, rank the rest and remember where you stopped. Free, and every question is optional.</p></div>
      <Link className="button" href="/signup/">Create a free account</Link><Link className="button secondary" href="/signin/?next=/learn/">Sign in</Link></div>}

    {signedIn && <section className="lp-summary" aria-label="Your progress">
      <Ring value={tot.parts ? tot.done / tot.parts : 0} size={64} label="Course progress" />
      <dl className="summary-stats">
        <div><dt>Parts done</dt><dd>{tot.done} <small>/ {tot.parts}</small></dd></div>
        <div><dt>Topics done</dt><dd>{tot.topics_done} <small>of {tot.topics}</small></dd></div>
        <div><dt>Time left</dt><dd>{hours(tot.minutes_left)}</dd></div>
        {tot.days_left > 0 && <div><dt>{tot.daily_minutes} min/day</dt><dd>{tot.days_left} <small>days left</small></dd></div>}
      </dl></section>}

    {signedIn && lead && <section className="lp-next" aria-labelledby="next">
      <h2 id="next">Up next</h2>
      <div className="next-grid">
        <article className="next-lead">
          <div><h3>{lead.name}</h3><p className="muted small">{lead.subject} · {hours(lead.minutes_left)} left
            {lead.done ? ` · ${lead.done} of ${lead.total} parts done` : ""}</p></div>
          <Link className="button" href={lead.path} aria-label={`${lead.done ? "Continue" : "Start"} ${lead.name}`}>{lead.done ? "Continue" : "Start topic"}</Link>
        </article>
        {nextUp.length > 1 && <><h3 className="next-after">Then in your path</h3>
          <ol className="next-stack">{nextUp.slice(1).map((t) => {
            const after = t.waiting_for ?? [];
            const detail = weightLabel(t.weight) ?? hours(t.minutes_left);
            return <li key={t.id}>{after.length
              ? <div className="next-small"><span><strong>{t.name}</strong> <small>{detail}</small><small className="next-prerequisite">After {after.join(", ")}</small></span></div>
              : <Link className="next-small" href={t.path}><span><strong>{t.name}</strong> <small>{detail}</small></span><span aria-hidden="true">→</span></Link>}
            </li>;
          })}</ol></>}
      </div></section>}
    {signedIn && !lead && (tot.topics_done === tot.topics
      ? <p className="notice">You have finished every topic in this stage. Practise with <Link href="/pyq/">previous year questions</Link> to stay sharp.</p>
      : <p className="notice">Some topics are still waiting on prerequisites.</p>)}

    {stage.subjects.length > 1 && <nav className="subject-jump" aria-label="Subjects">{stage.subjects.map((sub) => {
      const parts = sub.topics.reduce((n, t) => n + t.total, 0), fin = sub.topics.reduce((n, t) => n + t.done, 0);
      return <a key={sub.slug} href={`#${sub.slug}`}><strong>{sub.name}</strong><span>{sub.topics.length} topics{signedIn ? ` · ${fin} of ${parts} done` : ""}</span>
        {signedIn && <span className="meter" aria-hidden="true"><span style={{ width: `${parts ? (100 * fin) / parts : 0}%` }} /></span>}</a>;
    })}</nav>}

    {stage.subjects.map((sub) => <section key={sub.slug} id={sub.slug} aria-labelledby={`h-${sub.slug}`}>
      <div className="section-head"><h2 id={`h-${sub.slug}`}>{sub.name}</h2><span className="muted">{sub.topics.length} topics · {hours(sub.topics.reduce((n, t) => n + t.minutes, 0))}</span></div>
      <ol className="path-list">{sub.topics.map((t) => <Row key={t.id} t={t} signedIn={signedIn} />)}</ol>
    </section>)}
  </>;
}
