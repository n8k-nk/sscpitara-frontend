import Link from "next/link";
import { need, day } from "../../../lib/server";

export const metadata = { title: "Progress", robots: { index: false } };

export default async function Progress() {
  const d = await need("study/progress", "/study/progress/");
  return <>
    <div className="page-head"><span className="eyebrow">SSC CGL · Combined Graduate Level</span><h1>Progress</h1></div>
    <div className="grid two">
      <article className="card"><h2>First-attempt accuracy</h2>
        {d.topics.length ? d.topics.map((row) => <div className="meter-row" key={row.topic}><strong>{row.topic}</strong><span>{row.accuracy}%</span>
          <div className="meter" role="img" aria-label={`${row.accuracy}% accuracy`}><span style={{ width: `${row.accuracy}%` }} /></div>
          <small>{row.correct} of {row.total} correct · {row.seconds} seconds observed</small></div>) : <p className="empty">Complete your first set to see topic accuracy.</p>}</article>
      <article className="card"><h2>Revision schedule</h2>
        {d.reviews.length ? <ul className="rows">{d.reviews.map((row, i) => <li key={i}><span>{row.topic}</span><span className="muted">Due {day(row.due)}</span></li>)}</ul> : <p className="empty">Your revision queue is clear.</p>}</article>
    </div>
    <section style={{ marginTop: "1.5rem" }}><article className="card"><h2>Completed attempts</h2>
      {d.attempts.length ? <ul className="rows">{d.attempts.map((a) => <li key={a.id}><Link href={`/study/attempt/${a.id}/results/`}>{a.title}</Link><span className="muted">{day(a.finished)} · <strong>{a.score} marks</strong></span></li>)}</ul> : <p className="empty">No completed attempts yet.</p>}</article></section>
  </>;
}
