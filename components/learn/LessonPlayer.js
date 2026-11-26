"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { send } from "../../lib/client";
import { COMPONENTS } from "./Interactions";
import { lessonDate } from "./bits";

function Choice({ item, onResult, locked, simplerShown }) {
  const [picked, setPicked] = useState(null), [misses, setMisses] = useState(0), [done, setDone] = useState(false), [reveal, setReveal] = useState(false);
  const texts = item.options;
  function choose(i) {
    if (done) return;
    setPicked(i);
    const ok = texts[i] === item.answer;
    onResult(ok);
    if (ok) setDone(true); else setMisses((m) => m + 1);
  }
  if (!texts) {  // short-answer original checkpoint: think first, then check and judge yourself
    return <div className="checkpoint"><div className="cp-prompt">{item.prompt}</div>
      {!reveal ? <button type="button" onClick={() => setReveal(true)}>Show the answer</button>
        : <div className="cp-result ok"><p><strong>Answer:</strong> {item.answerNode}</p>{item.explanation}
          {!done && <p className="actions"><button type="button" onClick={() => { setDone(true); onResult(true); }}>I got it</button>
            <button type="button" className="secondary" onClick={() => { setDone(true); onResult(false); }}>Not yet</button></p>}</div>}</div>;
  }
  const right = done && picked !== null && texts[picked] === item.answer;
  return <div className="checkpoint"><div className="cp-prompt">{item.prompt}</div>
    <div className="mcq-options" role="radiogroup" aria-label="Choose one answer">{texts.map((t, i) => {
      const state = !done ? (picked === i ? " wrong" : "") : texts[i] === item.answer ? " right" : picked === i ? " wrong" : "";
      return <button key={i} type="button" role="radio" aria-checked={picked === i} disabled={done || (misses >= 2 && picked === i)} className={`mcq-opt${state}`} onClick={() => choose(i)}>
        <span className="mcq-letter">{"ABCD"[i]}</span><span>{item.optionNodes[i]}</span></button>;
    })}</div>
    {misses >= 1 && !done && item.hint && <div className="cp-hint" role="note"><strong>Hint.</strong> {item.hint}</div>}
    {misses >= 2 && !done && <div className="cp-hint" role="note">{item.simpler && <><strong>Try this simpler case first.</strong> {item.simpler}</>}{item.onSecondMiss && <p className="muted">{item.onSecondMiss}</p>}</div>}
    {done && <div className={`cp-result ${right ? "ok" : "bad"}`} aria-live="polite"><strong>{right ? "Correct." : "That is the answer."}</strong>{item.explanation}</div>}</div>;
}

function Item({ item, onCheckpoint }) {
  if (item.type === "checkpoint" || item.type === "recall") return <section className={`lp-item t-${item.type}`}>{item.type === "recall" && <h3>Quick recall</h3>}<Choice item={item} onResult={item.type === "checkpoint" ? onCheckpoint : () => {}} /></section>;
  const Comp = item.component && COMPONENTS[item.component];
  return <section className={`lp-item t-${item.type}`}>{item.label && item.type !== "goal" && <h3>{item.label}</h3>}{item.type === "goal" && <p className="eyebrow">{item.label}</p>}
    {item.node}{Comp && item.data && <Comp data={item.data} />}</section>;
}

/** The guide's lesson player: one idea at a time, no auto-advance, an estimate (never a countdown), and a way to skip ahead. */
export default function LessonPlayer({ skill, lesson, screens, practice, signedIn, prerequisites, next, hasPractice, completedAt, chapterHref, startOnPractice = false }) {
  const last = screens.length;  // the practice screen is one past the lesson screens
  const [step, setStep] = useState(startOnPractice ? last : 0), [finished, setFinished] = useState(false), [error, setError] = useState("");
  const [saved, setSaved] = useState(null), [saving, setSaving] = useState(false);
  const head = useRef(null);
  useEffect(() => { if (signedIn) send("learn/progress", { skill: skill.id, action: "start" }); }, [skill.id, signedIn]);
  const moved = useRef(false);
  useEffect(() => { if (moved.current) head.current?.focus(); moved.current = true; }, [step]);  // move focus to the new step, but not on first load
  const go = (n) => setStep(Math.max(0, Math.min(last, n)));
  async function checkpoint(correct) { if (signedIn) await send("learn/progress", { skill: skill.id, action: "checkpoint", correct }); }
  async function finish() {
    if (!signedIn) return setFinished(true);
    setSaving(true);
    setError("");
    const { ok, data } = await send("learn/progress", { skill: skill.id, action: "complete" });
    setSaving(false);
    if (!ok) return setError(data.error ?? "Could not save. Try again.");
    setSaved(data);
  }
  const completion = saved?.completedAt ?? completedAt;
  const onPractice = step === last, title = onPractice ? (hasPractice ? "Real exam questions" : "Chapter practice") : screens[step].title;
  return <div className="lp" data-step={step + 1}>
    <div className="lp-top"><span className="muted">About {lesson.estimatedMinutes} min</span>
      {!onPractice && <button type="button" className="ghost" onClick={() => go(last)}>I know this. Skip to practice</button>}</div>
    <ol className="lp-steps" aria-label="Lesson steps">{[...screens, { title: "Practice", short: "Practice" }].map((s, i) => <li key={i} className={i === step ? "on" : i < step ? "done" : ""}>
      <button type="button" onClick={() => go(i)} aria-current={i === step ? "step" : undefined} aria-label={`Step ${i + 1}: ${s.title}`}><b aria-hidden="true">{i < step ? "✓" : i + 1}</b><span className="lp-step-label">{s.short}</span></button></li>)}</ol>
    <h2 ref={head} tabIndex={-1} className="lp-title">{title}</h2>
    {!onPractice && screens[step].items.map((it, i) => <Item key={`${step}-${i}`} item={it} onCheckpoint={checkpoint} />)}
    {onPractice && <div className="lp-practice">{practice}
      {finished || completion ? <div className="notice ok lp-finished">
        <p role="status"><strong>{completion ? `Completed ${lessonDate(completion)}` : "Lesson finished"}</strong>
          {saved?.reviewDueAt && <> · <Link href="/learn/review/">Recall review</Link> due {lessonDate(saved.reviewDueAt)}</>}
          {finished && <> · Sign in to save progress.</>}</p>
        <div className="actions">
          <Link className="button secondary" href={chapterHref}>Back to skills</Link>
          {next && <Link className="button" href={next.href}>Next skill: {next.title}</Link>}
        </div>
      </div> : <p className="actions">
        {error && <span className="errorlist" role="alert">{error}</span>}
        <button type="button" disabled={saving} onClick={finish}>{saving ? "Saving…" : "Finish this lesson"}</button>
      </p>}</div>}
    <nav className="lp-nav" aria-label="Lesson navigation"><button type="button" className="secondary" disabled={step === 0} onClick={() => go(step - 1)}>Back</button>
      {!onPractice && <button type="button" onClick={() => go(step + 1)}>{step === last - 1 ? "On to practice" : "Continue"}</button>}</nav>
    {prerequisites.length > 0 && step === 0 && <p className="muted small">Best after: {prerequisites.map((p, i) => <span key={p.id}>{i > 0 && ", "}<Link href={p.href}>{p.title}</Link></span>)}.</p>}
  </div>;
}
