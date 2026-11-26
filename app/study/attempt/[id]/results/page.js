import Link from "next/link";
import { notFound } from "next/navigation";
import Figures from "../../../../../components/Figures";
import MockReport from "./MockReport";
import ResultTools from "../../../../../components/ResultTools";
import Rich from "../../../../../components/Rich";
import { need } from "../../../../../lib/server";

export const metadata = { title: "Results", robots: { index: false } };

const TONE = { Correct: "ok", Incorrect: "bad", Skipped: "off" };
export default async function Results({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const review = query.view === "review" || typeof query.q === "string";
  const options = new URLSearchParams({ view: review ? "review" : "overview" });
  if (review) {
    for (const key of ["page", "outcome", "section", "topic", "q"]) {
      if (typeof query[key] === "string" && query[key]) options.set(key, query[key]);
    }
  }
  const base = `/study/attempt/${id}/results/`;
  const d = await need(`study/attempts/${id}/results`, base, options.toString());
  if (!d) notFound();
  if (d.analysis && d.review) return <MockReport data={d} base={base} review={review} />;
  const pyq = d.kind === "pyq-followup";
  return <>
    <h1>{d.title} results</h1>
    <div className="score"><div><strong>{d.score} marks</strong>
      {!pyq && <p>+{d.rules.correct} correct, {d.rules.wrong} incorrect, 0 skipped.</p>}
      {d.changed_key && <p>Score after published answer-key corrections: <strong>{d.adjusted_score}</strong>.</p>}</div>
      <Link className="button arrow" href="/analytics/plan/">See your next study task</Link></div>
    {d.practice_breakdown && <section className="card"><h2>First-choice accuracy</h2>
      <p className="muted">Your first saved choice counts here. The marks above use your final answers.</p>
      {d.rules.recommendation.answered > 0 && <p>In the original mock, you got {d.rules.recommendation.correct} of {d.rules.recommendation.answered} answered {d.rules.recommendation.topic} questions right.</p>}
      <ul className="rows">{["fresh", "review"].map((key) => {
        const g = d.practice_breakdown[key];
        if (!g.total) return null;
        return <li key={key}><strong>{key === "fresh" ? "Fresh PYQs" : "Reviewed questions"}</strong>
          <span>{g.answered ? `${g.correct}/${g.answered} correct (${Math.round(100 * g.correct / g.answered)}%)` : "No answers"}
            {g.total > g.answered && ` · ${g.total - g.answered} unanswered`}</span></li>;
      })}</ul>
      <Link href={`/study/attempt/${d.rules.recommendation.mock}/results/`}>View original mock</Link>
    </section>}
    {d.rows.map((row) => <article className="result-card" id={`q${row.position}`} key={row.position}>
      <div className="q-meta"><small>{row.subject} · {row.topic}</small><span className={`badge ${TONE[row.outcome]}`}>{row.outcome}</span></div>
      <h2>{row.number ?? row.position}. {pyq ? <Rich inline>{row.prompt}</Rich> : row.prompt}</h2>
      {row.passage && (pyq ? <div className="passage rich"><Rich>{row.passage}</Rich></div> : <p className="passage lesson">{row.passage}</p>)}
      <Figures figures={row.media.passage} /><Figures figures={row.media.prompt} />
      {row.diagram_url && <img className="diagram" src={row.diagram_url} alt="Question diagram" />}
      {row.options.filter((o) => o.images.length).map((o) => <div key={o.label}>{o.label} <Figures figures={o.images} /></div>)}
      <div className="answer-box">{row.selected && <p>Your answer: {pyq ? <Rich inline>{row.selected}</Rich> : row.selected}</p>}
        <p><strong>Answer: {pyq ? <Rich inline>{row.correct}</Rich> : row.correct}</strong></p></div>
      {pyq ? <div className="explanation rich"><Rich>{row.explanation}</Rich></div> : <p className="explanation lesson">{row.explanation}</p>}
      {row.updated ? <details className="disclosure"><summary>Editorial update · version {row.updated.version}</summary>
        <p>{row.updated.prompt}</p><p>Current answer: {row.updated.answer}</p><p className="lesson">{row.updated.explanation}</p></details>
        : row.withdrawn && <p className="notice">This item has been withdrawn. Your result uses the version you attempted.</p>}
      {row.explanation_hi && <details className="disclosure"><summary>हिन्दी</summary>
        {pyq ? <div className="rich" lang="hi"><Rich>{row.explanation_hi}</Rich></div> : <p className="lesson">{row.explanation_hi}</p>}</details>}
      <ResultTools id={d.id} position={row.position} bookmarked={row.bookmarked} />
    </article>)}
  </>;
}
