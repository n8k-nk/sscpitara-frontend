import Link from "next/link";
import { notFound } from "next/navigation";
import TopicBar from "../../../../../../components/TopicBar";
import { SubtopicMark, TopicMark } from "../../../../../../components/LearnMark";
import { PRIORITY, weightLabel, hours } from "../../../../../../components/learnbits";
import { call } from "../../../../../../lib/server";

export async function generateMetadata({ params }) {
  const { exam, stage, subject, topic } = await params;
  const { ok, data: d } = await call(`learn/${exam}/${stage}/${subject}/${topic}`);
  if (!ok) return { title: "Learn" };
  const title = `${d.name} for SSC ${d.exam} ${d.stage}: free videos, article and practice`;
  const description = d.summary || `Learn ${d.name} for SSC ${d.exam} ${d.stage}: watch free video lessons or read the full article.`;
  return { title, description, alternates: { canonical: `/learn/${exam}/${stage}/${subject}/${topic}/` }, openGraph: { title, description, type: "article", siteName: "SSC Pitara" } };
}

const finished = (st) => st === "done" || st === "known";

export default async function Topic({ params }) {
  const { exam, stage, subject, topic } = await params;
  const { status, data: d } = await call(`learn/${exam}/${stage}/${subject}/${topic}`);
  if (status === 404) notFound();
  const base = `/learn/${exam}/${stage}/${subject}/${topic}/`;
  const [plabel, ptone] = PRIORITY[d.priority] ?? PRIORITY.important, wl = weightLabel(d.weight), m = d.modes;
  return <>
    <TopicBar base={base} stage={stage} name={d.name} current="Overview" modes={m} />
    <div className="page-head"><span className="eyebrow">SSC {d.exam} · {d.stage} · {d.subject}</span><h1>{d.name}</h1><p>{d.summary}</p>
      <p className="badges"><span className={`badge ${ptone}`}>{plabel}</span>{wl && <span className="badge">{wl}</span>}<span className="badge">{d.total} parts · about {hours(d.minutes)} of study</span>
        {d.signed_in && <span className="badge ok">{d.done} of {d.total} done</span>}</p>
      {d.priority_reason && <p className="muted">{d.priority_reason}</p>}
      {d.prerequisites.length > 0 && <p className="notice">Best studied after: {d.prerequisites.map((p, i) => <span key={p.path}>{i > 0 && ", "}<Link href={p.path}>{p.name}</Link></span>)}.</p>}</div>

    <section aria-labelledby="how"><h2 id="how">How do you want to learn this?</h2>
      <div className="modes">
        <article className="mode watch"><span className="tag">Watch</span><h3>Learn from videos</h3>
          <p className="muted">{m.watch.videos} free video{m.watch.videos === 1 ? "" : "s"}{m.watch.teachers > 1 ? ` from ${m.watch.teachers} teachers` : ""}, in English and Hindi where available. Pick the teacher you like.</p>
          <Link className="button lg" href={`${base}watch/`}>Start watching</Link></article>
        <article className="mode read"><span className="tag">Read</span><h3>Learn from a full article</h3>
          {m.read.available
            ? <><p className="muted">From zero to exam level in about {m.read.minutes} minutes: ideas, worked examples, shortcuts, common mistakes and a practice set. Take it slowly, or switch to Fast track.</p>
              <Link className="button lg" href={`${base}read/`}>Start reading</Link></>
            : <><p className="muted">The full article for this topic is being written. {m.read.legacy ? "Short notes are available for now." : ""}</p>
              {m.read.legacy ? <Link className="button secondary" href={`${base}read/`}>Read the short notes</Link> : <span className="badge">Coming soon</span>}</>}</article>
      </div>
      <p className="muted small">You can switch any time. Your progress is shared between Watch and Read.</p>
    </section>

    <section aria-labelledby="parts"><div className="section-head"><h2 id="parts">What you will cover</h2>
      <span className="actions"><TopicMark id={d.id} done={d.done} total={d.total} signedIn={d.signed_in} />
        {d.practice_url && <Link className="button secondary" href={d.practice_url}>Practise {d.name} PYQs</Link>}</span></div>
      <ol className="parts-list">{d.subtopics.map((s, n) => <li key={s.id} className={finished(s.status) ? "is-done" : ""}>
        <span className={`num${finished(s.status) ? " ok" : ""}`} aria-hidden="true">{finished(s.status) ? "✓" : n + 1}</span>
        <div className="parts-main"><strong>{s.name}</strong>{s.outcome && <p className="muted small">By the end: {s.outcome}</p>}
          <p className="muted small">{s.minutes ? `About ${hours(s.minutes)} of study · ` : ""}{s.videos.length} video{s.videos.length === 1 ? "" : "s"}
            {" · "}<Link href={`${base}watch/#part-${s.id}`}>Watch</Link>{" · "}<Link href={`${base}read/${s.slug}/`}>Read</Link>{s.pyq?.questions > 0 && <> · <strong>{s.pyq.questions}</strong> real exam question{s.pyq.questions === 1 ? "" : "s"}</>}</p></div>
        <div className="parts-act"><SubtopicMark id={s.id} status={s.status} signedIn={d.signed_in} compact /></div></li>)}</ol>
    </section>
    <nav className="pager" aria-label="Topics">
      {d.previous ? <Link className="button secondary" href={d.previous.path}>← {d.previous.name}</Link> : <span />}
      {d.next && <Link className="button" href={d.next.path}>Next: {d.next.name} →</Link>}</nav>
  </>;
}
