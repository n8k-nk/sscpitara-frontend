"use client";
import Link from "next/link";
import { useState } from "react";
import { send } from "../../lib/client";
import Rich from "../Rich";

/** Retrieval first: the prompt is shown, the learner tries to recall, only then is the answer revealed. */
export default function ReviewSession({ cards, more }) {
  const [i, setI] = useState(0), [shown, setShown] = useState(false), [busy, setBusy] = useState(false), [done, setDone] = useState({ ok: 0, again: 0 });
  const c = cards[i];
  async function grade(correct) {
    setBusy(true);
    await send("learn/review/record", { skill: c.skill, correct });
    setBusy(false); setShown(false);
    setDone((d) => ({ ok: d.ok + correct, again: d.again + !correct }));
    setI((n) => n + 1);
  }
  if (!c) return <div className="notice ok"><p><strong>{cards.length ? "Review finished." : "Nothing is due."}</strong>{cards.length > 0 && ` ${done.ok} recalled, ${done.again} to see again tomorrow.`}</p>
    {more > 0 && <p>{more} more are waiting. We show a few at a time so a backlog never builds up.</p>}<p><Link className="button" href="/learn/cgl/">Back to Learn</Link></p></div>;
  return <article className="review-card"><p className="muted small">{i + 1} of {cards.length} · {c.title}</p>
    {c.prompt ? <><h2 className="rv-prompt"><Rich inline>{c.prompt}</Rich></h2>
      {!shown ? <><p className="muted">Try to answer in your head or on paper first.</p><button type="button" onClick={() => setShown(true)}>Show the answer</button></>
        : <><div className="cp-result ok"><p><strong>Answer:</strong> <Rich inline>{c.answer}</Rich></p>{c.explanation && c.explanation !== c.answer && <Rich>{c.explanation}</Rich>}</div>
          <p className="actions"><button type="button" disabled={busy} onClick={() => grade(true)}>I recalled it</button>
            <button type="button" className="secondary" disabled={busy} onClick={() => grade(false)}>Not yet</button></p></>}</>
      : <><p>This skill has no recall question yet. Open the lesson and try the practice questions.</p><p className="actions"><Link className="button" href={c.href}>Open the lesson</Link>
        <button type="button" className="secondary" disabled={busy} onClick={() => grade(true)}>Done</button></p></>}</article>;
}
