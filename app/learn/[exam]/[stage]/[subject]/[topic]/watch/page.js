import Link from "next/link";
import { notFound } from "next/navigation";
import Rich from "../../../../../../../components/Rich";
import TopicBar from "../../../../../../../components/TopicBar";
import VideoPlayer from "../../../../../../../components/VideoPlayer";
import { SubtopicMark, TopicMark } from "../../../../../../../components/LearnMark";
import { hours } from "../../../../../../../components/learnbits";
import { call } from "../../../../../../../lib/server";

export async function generateMetadata({ params }) {
  const { exam, stage, subject, topic } = await params;
  const { ok, data: d } = await call(`learn/${exam}/${stage}/${subject}/${topic}`);
  if (!ok) return { title: "Learn" };
  const title = `${d.name}: free video lessons for SSC ${d.exam} ${d.stage}`;
  return { title, description: `Watch free ${d.name} video lessons for SSC ${d.exam} ${d.stage} from several teachers, part by part.`,
    alternates: { canonical: `/learn/${exam}/${stage}/${subject}/${topic}/watch/` } };
}

const KIND = { notes: "Notes", pdf: "PDF", article: "Article", practice: "Practice", reference: "Reference" };
const finished = (st) => st === "done" || st === "known";

export default async function Watch({ params }) {
  const { exam, stage, subject, topic } = await params;
  const { status, data: d } = await call(`learn/${exam}/${stage}/${subject}/${topic}`);
  if (status === 404) notFound();
  const base = `/learn/${exam}/${stage}/${subject}/${topic}/`;
  return <>
    <TopicBar base={base} stage={stage} name={d.name} current="Watch" modes={d.modes} />
    <div className="topic-layout">
      <div className="topic-main">
        <div className="page-head"><span className="eyebrow">Watch · SSC {d.exam} {d.stage} · {d.subject}</span><h1>{d.name}</h1>
          <p>Free video lessons, part by part. Choose the teacher and language that suit you, then mark each part when you are done.</p></div>
        <ol className="parts">{d.subtopics.map((s, n) => <li key={s.id}><article className={`part${finished(s.status) ? " is-done" : ""}`} id={`part-${s.id}`}>
          <header className="part-head"><span className={`num${finished(s.status) ? " ok" : ""}`} aria-hidden="true">{finished(s.status) ? "✓" : n + 1}</span>
            <h2>{s.name}</h2></header>
          {s.outcome && <p className="outcome"><strong>By the end:</strong> {s.outcome}</p>}
          <VideoPlayer videos={s.videos} title={s.name} />
          {s.resources.length > 0 && <details className="disclosure"><summary>More free resources ({s.resources.length})</summary>
            <ul className="resources">{s.resources.map((r) => <li key={r.url}>
              <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a> <span className="muted">{r.publisher} · {KIND[r.kind]}{r.language === "hi" ? " · Hindi" : ""}</span>
              {r.body && <><Rich>{r.body}</Rich><p className="muted small">{r.attribution} ({r.license})</p></>}</li>)}</ul></details>}
          <footer className="part-foot"><SubtopicMark id={s.id} status={s.status} signedIn={d.signed_in} />
            <Link className="small" href={`${base}read/${s.slug}/`}>Prefer reading this part? →</Link></footer>
        </article></li>)}</ol>
        <nav className="pager" aria-label="Topics">
          {d.previous ? <Link className="button secondary" href={d.previous.path}>← {d.previous.name}</Link> : <span />}
          {d.next && <Link className="button" href={d.next.path}>Next: {d.next.name} →</Link>}</nav>
      </div>
      <aside className="topic-side" aria-label="In this topic"><div className="side-card"><h2>In this topic</h2>
        {d.signed_in && <><div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={d.total} aria-valuenow={d.done} aria-label="Topic progress"><span style={{ width: `${d.total ? (100 * d.done) / d.total : 0}%` }} /></div>
          <p className="muted small">{d.done} of {d.total} parts done · about {hours(d.minutes_left)} of study left</p></>}
        <ol className="outline">{d.subtopics.map((s, n) => <li key={s.id}><a href={`#part-${s.id}`}><span className={`num sm${finished(s.status) ? " ok" : ""}`} aria-hidden="true">{finished(s.status) ? "✓" : n + 1}</span>{s.name}</a></li>)}</ol>
        <div className="side-actions"><TopicMark id={d.id} done={d.done} total={d.total} signedIn={d.signed_in} />
          {d.practice_url && <Link className="button block" href={d.practice_url}>Practise {d.name} PYQs</Link>}</div></div></aside>
    </div>
  </>;
}
