"use client";
import { useEffect, useState } from "react";

/** Multiple choice with instant feedback. Text arrives as server-rendered nodes so maths is rendered once, on the server. */
export function Mcq({ kind, difficulty, prompt, options, answer, explanation, label }) {
  const [picked, setPicked] = useState(null);
  const done = picked !== null, right = picked === answer;
  return <div className={`mcq ${kind}`}>
    <div className="mcq-top"><span className="badge">{label}</span>{difficulty && <span className={`badge diff-${difficulty}`}>{difficulty === "exam" ? "Exam-style" : difficulty}</span>}</div>
    <div className="mcq-prompt">{prompt}</div>
    <div className="mcq-options" role="radiogroup">{options.map((o, i) => {
      const state = !done ? "" : i === answer ? " right" : i === picked ? " wrong" : "";
      return <button key={i} type="button" role="radio" aria-checked={picked === i} disabled={done} className={`mcq-opt${state}`} onClick={() => setPicked(i)}>
        <span className="mcq-letter">{"ABCD"[i]}</span><span>{o}</span></button>;
    })}</div>
    {done && <div className={`mcq-result ${right ? "ok" : "bad"}`} aria-live="polite">
      <strong>{right ? "Correct." : `Not quite. The answer is ${"ABCD"[answer]}.`}</strong>
      <div>{explanation}</div>
      <button type="button" className="ghost small-btn" onClick={() => setPicked(null)}>Try again</button></div>}
  </div>;
}
