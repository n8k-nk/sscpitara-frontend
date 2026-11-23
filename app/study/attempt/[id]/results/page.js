import Link from "next/link";
import { notFound } from "next/navigation";
import Figures from "../../../../../components/Figures";
import ResultTools from "../../../../../components/ResultTools";
import { need } from "../../../../../lib/server";

export const metadata = { title: "Results", robots: { index: false } };

const TONE = { Correct: "ok", Incorrect: "bad", Skipped: "off" };

export default async function Results({ params }) {
  const { id } = await params;
  const d = await need(`study/attempts/${id}/results`, `/study/attempt/${id}/results/`);
  if (!d) notFound();
  return <>
    <h1>{d.title} results</h1>
    <div className="score"><div><strong>{d.score} marks</strong>
      <p>+{d.rules.correct} correct, {d.rules.wrong} incorrect, 0 skipped.</p>
      {d.changed_key && <p>Score after published answer-key corrections: <strong>{d.adjusted_score}</strong>.</p>}</div>
      <Link className="button arrow" href="/study/">See your next study task</Link></div>
    {d.rows.map((row) => <article className="result-card" id={`q${row.position}`} key={row.position}>
      <div className="q-meta"><small>{row.subject} · {row.topic}</small><span className={`badge ${TONE[row.outcome]}`}>{row.outcome}</span></div>
      <h2>{row.position}. {row.prompt}</h2>
      {row.passage && <p className="passage lesson">{row.passage}</p>}
      <Figures figures={row.media.passage} /><Figures figures={row.media.prompt} />
      {row.diagram_url && <img className="diagram" src={row.diagram_url} alt="Question diagram" />}
      {row.options.filter((o) => o.images.length).map((o) => <div key={o.label}>{o.label} <Figures figures={o.images} /></div>)}
      <div className="answer-box">{row.selected && <p>Your answer: {row.selected}</p>}<p><strong>Answer: {row.correct}</strong></p></div>
      <p className="explanation lesson">{row.explanation}</p>
      {row.updated ? <details className="disclosure"><summary>Editorial update · version {row.updated.version}</summary>
        <p>{row.updated.prompt}</p><p>Current answer: {row.updated.answer}</p><p className="lesson">{row.updated.explanation}</p></details>
        : row.withdrawn && <p className="notice">This item has been withdrawn. Your result uses the version you attempted.</p>}
      {row.explanation_hi && <details className="disclosure"><summary>हिन्दी</summary><p className="lesson">{row.explanation_hi}</p></details>}
      <ResultTools id={d.id} position={row.position} bookmarked={row.bookmarked} />
    </article>)}
  </>;
}
