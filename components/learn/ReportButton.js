"use client";
import { useState } from "react";
import { send } from "../../lib/client";

const TYPES = [["wrong-answer", "A wrong answer"], ["unclear", "Unclear"], ["typo", "A typo"], ["factual", "A wrong fact"], ["broken", "Something is broken"], ["other", "Something else"]];

export default function ReportButton({ lessonId, version }) {
  const [open, setOpen] = useState(false), [type, setType] = useState("unclear"), [note, setNote] = useState(""), [state, setState] = useState("");
  async function submit(e) {
    e.preventDefault();
    const { ok } = await send("learn/report", { lessonId, version, errorType: type, note });
    setState(ok ? "sent" : "error");
  }
  if (state === "sent") return <p className="muted small">Thank you. We will check this lesson.</p>;
  return open ? <form className="report" onSubmit={submit}><label>What is wrong? <select value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
    <label>Tell us more (optional) <textarea maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} rows={3} /></label>
    <button>Send report</button> <button type="button" className="ghost" onClick={() => setOpen(false)}>Cancel</button>{state === "error" && <span className="errorlist" role="alert">Could not send.</span>}</form>
    : <button type="button" className="ghost small-btn" onClick={() => setOpen(true)}>Report a mistake in this lesson</button>;
}
