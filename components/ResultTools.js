"use client";
import { useState } from "react";
import { send } from "../lib/client";

/** Bookmark toggle and issue report for one reviewed question. */
export default function ResultTools({ id, position, bookmarked }) {
  const [saved, setSaved] = useState(bookmarked);
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const base = `study/attempts/${id}/${position}/note`;
  return <div className="result-tools">
    <button type="button" className="secondary" onClick={async () => {
      const { ok, data } = await send(base, { action: "bookmark", enabled: !saved });
      if (ok) setSaved(data.bookmarked);
    }}>{saved ? "Remove bookmark" : "Bookmark"}</button>
    <details className="disclosure"><summary>Report a question issue</summary>
      <form onSubmit={async (e) => {
        e.preventDefault();
        const { ok, data } = await send(base, { message });
        setNote(ok ? "Your report is with the content team." : data.error ?? "Could not send your report.");
        if (ok) setMessage("");
      }}>
        <label>Describe the issue <textarea required maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} /></label>
        <button>Send report</button>
        {note && <p role="status" className="muted">{note}</p>}
      </form>
    </details>
  </div>;
}
