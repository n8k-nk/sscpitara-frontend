"use client";
import Link from "next/link";
import { useState } from "react";
import { send } from "../lib/client";
import QuestionTutor from "./QuestionTutor";
import { openSignup } from "./PyqSignup";
import { useQuestionView } from "../lib/question-view";

const TYPE = { multiple: "More than one correct", numeric: "Numerical answer", text: "Short answer", descriptive: "Descriptive" };

function Locked({ q }) {
  const p = q.paper;
  return <article className="pyq locked" id={`q${q.id}`}>
    <header className="pyq-meta"><span className="code">{p.title}</span><span className="badge">{q.subject}</span><span className="muted">{q.topic}</span></header>
    <div className="pyq-blur" aria-hidden="true">
      <p><strong>Q{q.number}.</strong> Sign up to read this question. The text shown here is only a placeholder.</p>
      <ul className="pyq-options">{Array.from({ length: q.option_count || 4 }, (_, i) => <li key={i}><span className="pyq-opt"><b>{"ABCDEFGH"[i]}</b> Placeholder option text</span></li>)}</ul>
    </div>
    <button type="button" className="pyq-unlock" onClick={openSignup}>Sign up free to unlock</button>
  </article>;
}

/**
 * One question. Server-rendered Markdown arrives as slots (stem, options, passage, solution, hindi) so the
 * math renderer stays out of the browser bundle. This component only handles who may do what.
 */
export default function PyqQuestion(props) {
  return props.q.locked ? <Locked q={props.q} /> : <Live {...props} />;
}

function Live({ q, viewer, stem, options, passage, solution, hindi, skillPractice = false }) {
  const questionView = useQuestionView(viewer !== "anonymous" && !q.viewed ? q.id : null);
  const premium = viewer === "premium";
  const [result, setResult] = useState(q.attempt && {
    correct: q.attempt.correct, response: q.attempt.response, answer: q.answer,
    labels: q.options.filter((o) => o.correct).map((o) => o.label),
  });
  const [picked, setPicked] = useState([]);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [explain, setExplain] = useState(Boolean(skillPractice && q.attempt && !q.attempt.correct));
  const anon = viewer === "anonymous";
  const labels = result ? result.labels : q.options.filter((o) => o.correct).map((o) => o.label);
  const chosen = result && Array.isArray(result.response) ? result.response : picked;
  const objective = q.options.length > 0;
  const multiple = q.type === "multiple";
  const showMarked = anon || result;   // is the right answer on display?

  async function submit(body) {
    setBusy(true); setError("");
    const { ok, status, data } = await send("pyq/attempt", { question: q.id, ...body });
    setBusy(false);
    if (status === 401) return openSignup();
    if (!ok) return setError(data.error ?? "Could not save your answer.");
    setResult({ correct: data.correct, response: data.response, answer: data.answer, labels: data.correct_labels });
    if (skillPractice && !data.correct) setExplain(true);
  }

  function choose(label) {
    if (anon) return openSignup();
    if (result || busy || !q.attemptable) return;
    if (multiple) return setPicked((now) => now.includes(label) ? now.filter((x) => x !== label) : [...now, label]);
    setPicked([label]);
    submit({ selected: [label] });
  }

  const state = (label) => {
    const right = showMarked && labels.includes(label);
    const wrong = result && chosen.includes(label) && !labels.includes(label);
    return `pyq-opt${right ? " right" : ""}${wrong ? " wrong" : ""}${!result && chosen.includes(label) ? " picked" : ""}`;
  };

  const answerLine = (a) => a && (a.number != null ? `${a.number}${a.unit ? ` ${a.unit}` : ""}` : a.text);
  const shownAnswer = result ? result.answer : q.answer;

  return <article className="pyq" id={`q${q.id}`}>
    <header className="pyq-meta">
      <Link className="code" href={`/pyq/${q.paper.path}/`}>{q.paper.title}</Link>
      <span className="badge">{q.subject}</span>
      <span className="muted">{q.topic}{q.subtopic && ` › ${q.subtopic}`}</span>
      {q.difficulty && <span className="badge">{q.difficulty}</span>}
      {TYPE[q.type] && <span className="badge">{TYPE[q.type]}</span>}
    </header>
    {passage}
    <div className="pyq-q rich" ref={questionView}><strong>Q{q.number}.</strong> {stem}</div>

    {q.dropped && <p><span className="badge warn">Dropped by SSC</span> This question was cancelled in the final answer key.</p>}

    {objective && <ol className="pyq-options" type="A">{q.options.map((o, i) => <li key={o.label}>
      <button type="button" className={state(o.label)} onClick={() => choose(o.label)} disabled={!anon && (!!result || busy || !q.attemptable)}
        aria-pressed={chosen.includes(o.label)}>
        <b>{o.label}</b><span>{options[i]}</span>
        {showMarked && labels.includes(o.label) && <em className="pyq-tick">✓ Correct</em>}
      </button></li>)}</ol>}

    {!objective && q.attemptable && !anon && !result && <form className="pyq-typed" onSubmit={(e) => { e.preventDefault(); submit({ value: typed }); }}>
      <label>Your answer<input value={typed} onChange={(e) => setTyped(e.target.value)} inputMode={q.type === "numeric" ? "decimal" : "text"} required /></label>
      <button type="submit" disabled={busy}>Check answer</button></form>}
    {!objective && anon && !q.dropped && q.type !== "descriptive" && <button type="button" className="secondary" onClick={openSignup}>Sign up to answer</button>}

    {multiple && !result && !anon && <button type="button" disabled={busy || !picked.length} onClick={() => submit({ selected: picked })}>Check answer</button>}

    {error && <p className="errorlist" role="alert">{error}</p>}

    {result && <p className={`pyq-verdict ${result.correct ? "ok" : "bad"}`} role="status">
      <strong>{result.correct ? "Correct!" : "Not quite."}</strong>{" "}
      {!result.correct && (objective ? `The correct answer is ${labels.join(", ")}.` : shownAnswer && `The answer is ${answerLine(shownAnswer)}.`)}
      {!(skillPractice && !result.correct) && <>{" "}
        <button type="button" className="ghost" onClick={() => { setResult(null); setPicked([]); setTyped(""); setExplain(false); }}>Try again</button></>}</p>}
    {result && q.skill && !skillPractice && <p className="pyq-learn"><Link href={q.skill.href}>Learn this skill: {q.skill.title} →</Link></p>}
    {!objective && !result && shownAnswer && anon && <p><span className="badge ok">Answer: {answerLine(shownAnswer)}</span></p>}

    {(!q.dropped || (q.tutor_available && !result?.correct)) && <div className="pyq-foot">
      {!q.dropped && <button type="button" className="secondary" aria-expanded={explain} onClick={() => setExplain((x) => !x)}>{explain ? "Hide explanation" : "View explanation"}</button>}
      {q.tutor_available && !result?.correct && <QuestionTutor key={result ? "mistake" : "hint"}
        mode={result ? "mistake" : "hint"} question={q.id} anon={anon} onRequireAuth={openSignup} />}
      {!q.dropped && explain && (premium ? <div className="pyq-solution">{solution}</div> :
        <div className="pyq-upsell" role="note">
          <strong>Explanations are a Premium feature.</strong>
          <p>Get step-by-step worked solutions and short-cut methods for every question, right or wrong.</p>
          <Link className="button" href="/plans/">Get Premium</Link></div>)}
    </div>}
    {hindi}
  </article>;
}
