import Link from "next/link";
import { notFound } from "next/navigation";
import Figures from "../../../../../components/Figures";
import ResultTools from "../../../../../components/ResultTools";
import Rich from "../../../../../components/Rich";
import { need } from "../../../../../lib/server";

export const metadata = { title: "Results", robots: { index: false } };

const TONE = { Correct: "ok", Incorrect: "bad", Skipped: "off" };
const STOP = { tab_switch: "Submitted after switching tabs", fullscreen_exit: "Submitted after exiting fullscreen",
  page_exit: "Submitted after leaving the test", time_expired: "Time expired" };

function MockSummary({ rows, reason }) {
  const sections = new Map();
  for (const row of rows) {
    const s = sections.get(row.section_name) ?? { correct: 0, incorrect: 0, skipped: 0, seconds: 0 };
    s[row.outcome.toLowerCase()] += 1;
    s.seconds += row.seconds;
    sections.set(row.section_name, s);
  }
  return <section aria-label="Mock analysis">
    {STOP[reason] && <p className="notice">{STOP[reason]}</p>}
    <h2>Section breakdown</h2>
    <ul className="rows">{[...sections.entries()].map(([section, s]) => <li key={section}><strong>{section}</strong>
      <span className="muted">{s.correct} correct · {s.incorrect} incorrect · {s.skipped} skipped · {s.seconds}s observed</span>
    </li>)}</ul>
  </section>;
}

export default async function Results({ params }) {
  const { id } = await params;
  const d = await need(`study/attempts/${id}/results`, `/study/attempt/${id}/results/`);
  if (!d) notFound();
  const mock = d.kind === "pyq-mock";
  return <>
    <h1>{d.title}{mock ? " mock results" : " results"}</h1>
    <div className="score"><div><strong>{d.score} marks</strong>
      {!mock && <p>+{d.rules.correct} correct, {d.rules.wrong} incorrect, 0 skipped.</p>}
      {d.changed_key && <p>Score after published answer-key corrections: <strong>{d.adjusted_score}</strong>.</p>}</div>
      <Link className="button arrow" href={mock ? `/pyq/${d.rules.source.path}/` : "/study/"}>{mock ? "Back to paper" : "See your next study task"}</Link></div>
    {mock && <MockSummary rows={d.rows} reason={d.rules.finish_reason} />}
    {d.rows.map((row) => <article className="result-card" id={`q${row.position}`} key={row.position}>
      <div className="q-meta"><small>{row.subject} · {row.topic}</small><span className={`badge ${TONE[row.outcome]}`}>{row.outcome}</span>
        {mock && <small>{row.marks} marks · {row.seconds}s observed</small>}</div>
      <h2>{row.number ?? row.position}. {mock ? <Rich inline>{row.prompt}</Rich> : row.prompt}</h2>
      {row.passage && (mock ? <div className="passage rich"><Rich>{row.passage}</Rich></div> : <p className="passage lesson">{row.passage}</p>)}
      <Figures figures={row.media.passage} /><Figures figures={row.media.prompt} />
      {row.diagram_url && <img className="diagram" src={row.diagram_url} alt="Question diagram" />}
      {row.options.filter((o) => o.images.length).map((o) => <div key={o.label}>{o.label} <Figures figures={o.images} /></div>)}
      <div className="answer-box">{row.selected && <p>Your answer: {mock ? <Rich inline>{row.selected}</Rich> : row.selected}</p>}
        <p><strong>Answer: {mock ? <Rich inline>{row.correct}</Rich> : row.correct}</strong></p></div>
      {mock ? <div className="explanation rich"><Rich>{row.explanation}</Rich></div> : <p className="explanation lesson">{row.explanation}</p>}
      {row.updated ? <details className="disclosure"><summary>Editorial update · version {row.updated.version}</summary>
        <p>{row.updated.prompt}</p><p>Current answer: {row.updated.answer}</p><p className="lesson">{row.updated.explanation}</p></details>
        : row.withdrawn && <p className="notice">This item has been withdrawn. Your result uses the version you attempted.</p>}
      {row.explanation_hi && <details className="disclosure"><summary>हिन्दी</summary>
        {mock ? <div className="rich" lang="hi"><Rich>{row.explanation_hi}</Rich></div> : <p className="lesson">{row.explanation_hi}</p>}</details>}
      <ResultTools id={d.id} position={row.position} bookmarked={row.bookmarked} />
    </article>)}
  </>;
}
