"use client";

import { useId, useState } from "react";
import { send, updateCredits } from "../../lib/client";
import Rich from "../Rich";

export default function LessonAsk({ path, version }) {
  const questionId = useId();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState({});

  async function ask(value) {
    const prompt = value.trim();
    if (!prompt || result.busy) return;
    setQuestion(prompt);
    setResult({ busy: true });
    updateCredits({ delta: -1 });
    const { ok, data } = await send(`learn/companion/${path}/ask`, { question: prompt, version });
    if (!ok) {
      updateCredits(typeof data?.credits === "number" ? { credits: data.credits } : { delta: 1 });
    }
    setResult(ok ? { text: data.text } : { error: data.error || "The tutor is temporarily unavailable." });
  }

  return <details className="lesson-ask">
    <summary>Ask about this lesson</summary>
    <form onSubmit={(event) => { event.preventDefault(); ask(question); }}>
      <label htmlFor={questionId}>Your question</label>
      <textarea id={questionId} value={question} onChange={(event) => setQuestion(event.target.value)}
        rows={2} maxLength={500} required disabled={result.busy} />
      <div className="lesson-ask-actions">
        <button type="submit" disabled={result.busy || !question.trim()}>Ask</button>
        <button type="button" className="secondary" disabled={result.busy}
          onClick={() => ask("Explain the main idea in simpler words.")}>Explain simply</button>
        <button type="button" className="secondary" disabled={result.busy}
          onClick={() => ask("Give me another worked example for this lesson.")}>Another example</button>
      </div>
    </form>
    <div aria-live="polite">
      {result.busy && <p className="muted small">Reading the lesson…</p>}
      {result.text && <div className="notice tutor-feedback"><strong className="tutor-feedback-label">AI tutor</strong>
        <div className="rich tutor-feedback-copy"><Rich interactive={false} images={false}>{result.text}</Rich></div>
      </div>}
    </div>
    {result.error && <p className="errorlist" role="alert">{result.error}</p>}
  </details>;
}
