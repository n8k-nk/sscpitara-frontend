import Link from "next/link";
import Rich from "../../components/Rich";
import { metadata as pageMetadata, readPyqs } from "../../lib/public";

export const metadata = pageMetadata("Free SSC previous year questions", "SSC previous year questions by exam, year, shift, subject, topic and sub-topic, with answers and solutions. Free, no sign-up.", "/pyq/");

const KEYS = ["exam", "year", "paper", "subject", "topic", "subtopic", "difficulty"];
const SOURCE = { official: "Official answer key", expert: "Expert reviewed", ai: "AI generated" };
const TYPE = { multiple: "More than one correct", numeric: "Numerical answer", text: "Short answer", descriptive: "Descriptive" };

function href(filters, page) {
  const q = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
  if (page > 1) q.set("page", page);
  const s = q.toString();
  return `/pyq/${s ? `?${s}` : ""}`;
}

function Answer({ q }) {
  if (q.dropped) return <p><span className="badge warn">Dropped by SSC</span> This question was cancelled in the final answer key.</p>;
  if (q.options.length) {
    const right = q.options.filter((o) => o.correct);
    return <p><span className="badge ok">Answer: {right.map((o) => o.label).join(", ")}</span>{" "}
      {right.length === 1 && <Rich inline>{right[0].text}</Rich>}</p>;
  }
  if (!q.answer) return null;
  if (q.answer.number != null) return <p><span className="badge ok">Answer: {q.answer.number}{q.answer.unit && ` ${q.answer.unit}`}</span>
    {q.answer.tolerance !== "0" && <span className="muted"> (±{q.answer.tolerance} accepted)</span>}</p>;
  return <div><span className="badge ok">{q.type === "descriptive" ? "Model answer" : "Answer"}</span>
    <div className="rich"><Rich>{q.answer.text}</Rich></div>
    {q.answer.accepted?.length > 0 && <p className="muted">Also accepted: {q.answer.accepted.join(", ")}</p>}</div>;
}

function Question({ q }) {
  const p = q.paper;
  const hindi = q.text_hi && (!q.options.length || q.options.every((o) => o.text_hi));
  const optionNotes = q.options.filter((o) => o.explanation);
  return <article className="pyq" id={`q${q.id}`}>
    <header className="pyq-meta">
      <Link className="code" href={href({ paper: p.slug })}>{p.title}</Link>
      <span className="badge">{q.subject}</span>
      <span className="muted">{q.topic}{q.subtopic && ` › ${q.subtopic}`}</span>
      {q.difficulty && <span className="badge">{q.difficulty}</span>}
      {TYPE[q.type] && <span className="badge">{TYPE[q.type]}</span>}
    </header>
    {q.passage && <div className="passage rich"><Rich>{q.passage.text}</Rich></div>}
    <div className="pyq-q rich"><strong>Q{q.number}.</strong> <Rich>{q.text}</Rich></div>
    {q.options.length > 0 && <ol className="pyq-options" type="A">{q.options.map((o) => <li key={o.label}><Rich inline>{o.text}</Rich></li>)}</ol>}
    <details className="pyq-answer">
      <summary>Show answer and solution</summary>
      <Answer q={q} />
      {q.explanation && <div className="rich"><Rich>{q.explanation}</Rich></div>}
      {optionNotes.length > 0 && <ul className="pyq-option-notes">{optionNotes.map((o) =>
        <li key={o.label}><strong>{o.label}.</strong> <Rich inline>{o.explanation}</Rich></li>)}</ul>}
      <p className="pyq-source">Answer: {SOURCE[q.answer_source]}{q.explanation_source && ` · Solution: ${SOURCE[q.explanation_source]}`}
        {q.section.marks_correct && ` · +${q.section.marks_correct}${q.section.marks_wrong ? ` / −${q.section.marks_wrong}` : ""} marks`}</p>
      {hindi && <details lang="hi"><summary>हिन्दी में देखें</summary>
        {q.passage?.text_hi && <div className="passage rich"><Rich>{q.passage.text_hi}</Rich></div>}
        <div className="rich"><Rich>{q.text_hi}</Rich></div>
        {q.options.length > 0 && <ol type="A">{q.options.map((o) => <li key={o.label}><Rich inline>{o.text_hi}</Rich></li>)}</ol>}
        {q.answer?.text_hi && <div className="rich"><Rich>{q.answer.text_hi}</Rich></div>}
        {q.explanation_hi && <div className="rich"><Rich>{q.explanation_hi}</Rich></div>}
      </details>}
    </details>
  </article>;
}

export default async function Pyq({ searchParams }) {
  const params = await searchParams;
  const one = (k) => (typeof params[k] === "string" ? params[k] : "");
  const filters = Object.fromEntries(KEYS.map((k) => [k, one(k)]));
  const page = Math.max(1, parseInt(one("page"), 10) || 1);
  const data = await readPyqs({ ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), page });
  const f = data.facets;
  const select = (name, label, options) => <label>{label}
    <select name={name} defaultValue={filters[name]}><option value="">All</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label} ({o.count})</option>)}</select></label>;
  return <>
    <div className="page-head"><span className="eyebrow">Free · no sign-up</span><h1>SSC previous year questions</h1>
      <p>Browse by exam, year, shift, subject, topic and sub-topic. Every question comes with its answer and a worked solution. Timed tests and analysis are coming later.</p></div>
    <form className="pyq-filters" method="get" action="/pyq/">
      {select("exam", "Exam", f.exams)}
      {select("year", "Year", f.years)}
      {select("paper", "Paper / shift", f.papers)}
      {select("subject", "Subject", f.subjects)}
      {select("topic", "Topic", f.topics)}
      {f.subtopics.length > 0 && select("subtopic", "Sub-topic", f.subtopics)}
      {f.difficulties.length > 0 && select("difficulty", "Level", f.difficulties)}
      <button type="submit">Filter</button>
      {KEYS.some((k) => filters[k]) && <Link className="button ghost" href="/pyq/">Clear</Link>}
    </form>
    {data.questions.length ? <>
      <p className="muted">{data.total} question{data.total === 1 ? "" : "s"} · page {data.page} of {data.pages}</p>
      <div className="pyq-list">{data.questions.map((q) => <Question key={q.id} q={q} />)}</div>
      <nav className="actions" aria-label="Pages">
        {data.page > 1 && <Link className="button secondary" href={href(filters, data.page - 1)}>← Previous</Link>}
        {data.page < data.pages && <Link className="button secondary" href={href(filters, data.page + 1)}>Next →</Link>}
      </nav></> : <p className="empty">No published questions match these filters.</p>}
  </>;
}
