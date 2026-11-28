"use client";

import { useId, useState } from "react";
import { send, updateCredits } from "../lib/client";
import Rich from "./Rich";

export default function QuestionTutor({ mode, question, attempt, position, anon = false, onRequireAuth }) {
  const [state, setState] = useState({});
  const [expanded, setExpanded] = useState(false);
  const feedbackId = useId();
  const label = mode === "hint" ? "Ask AI" : "Explain my mistake";
  const noun = mode === "hint" ? "explanation" : "feedback";

  async function ask() {
    if (anon) {
      onRequireAuth?.();
      return;
    }
    if (state.text) {
      setExpanded((visible) => !visible);
      return;
    }

    setState({ busy: true });
    updateCredits({ delta: -1 });
    const { ok, data } = await send("study/question-tutor", { mode, question, attempt, position });
    if (ok) {
      setExpanded(true);
    } else {
      updateCredits(typeof data?.credits === "number" ? { credits: data.credits } : { delta: 1 });
    }
    setState(ok ? { text: data.text } : { error: data.error ?? "The tutor is temporarily unavailable." });
  }

  return <div className="pyq-explain">
    <div className="pyq-ask">
      <button type="button" className="secondary" disabled={state.busy} onClick={ask}
        aria-expanded={state.text ? expanded : undefined} aria-controls={state.text ? feedbackId : undefined}>
        {state.busy ? (mode === "hint" ? "Explaining…" : "Getting feedback…") : state.text ? `${expanded ? "Hide" : "Show"} AI ${noun}` : label}
      </button>
    </div>
    {state.text && <div id={feedbackId} className="notice tutor-feedback" role="status" hidden={!expanded}>
      <strong className="tutor-feedback-label">AI tutor</strong>
      <div className="rich tutor-feedback-copy"><Rich interactive={false} images={false}>{state.text}</Rich></div>
    </div>}
    {state.error && <p className="errorlist" role="alert">{state.error}</p>}
  </div>;
}
