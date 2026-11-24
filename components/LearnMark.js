"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { send } from "../lib/client";

async function mark(body, router, setBusy, setError) {
  setBusy(true); setError("");
  const { ok, data } = await send("learn/progress", body);
  setBusy(false);
  if (!ok) return setError(data.error ?? "Could not save. Try again.");
  router.refresh();
}

const signin = (path) => `/signin/?next=${encodeURIComponent(path)}`;

/** Per-subtopic progress: not started, I already know this, in progress, finished. */
export function SubtopicMark({ id, status, signedIn, compact }) {
  const router = useRouter(), path = usePathname();
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  if (!signedIn) return compact ? null : <p className="mark-row"><Link className="button secondary" href={signin(path)}>Sign in to track your progress</Link></p>;
  const set = (next) => mark({ subtopic: id, status: next }, router, setBusy, setError);
  if (compact) return <div className="mark-row">{status === "done" || status === "known"
    ? <><span className="badge ok">{status === "known" ? "Known" : "Done"}</span><button type="button" className="ghost small-btn" disabled={busy} onClick={() => set(null)}>Undo</button></>
    : <button type="button" className="secondary small-btn" disabled={busy} onClick={() => set("done")}>Mark finished</button>}{error && <span className="errorlist" role="alert">{error}</span>}</div>;
  return <div className="mark-row">
    {status === "done" || status === "known"
      ? <><span className="badge ok">{status === "known" ? "You already know this" : "Finished"}</span><button type="button" className="ghost" disabled={busy} onClick={() => set(null)}>Undo</button></>
      : <><button type="button" disabled={busy} onClick={() => set("done")}>Mark finished</button>
        <button type="button" className="secondary" disabled={busy} onClick={() => set("known")}>I already know this</button>
        {status !== "learning" && <button type="button" className="ghost" disabled={busy} onClick={() => set("learning")}>I'm studying this</button>}
        {status === "learning" && <span className="badge warn">In progress</span>}</>}
    {error && <span className="errorlist" role="alert">{error}</span>}
  </div>;
}

/** Whole-topic shortcut for someone who already finished it before coming here. */
export function TopicMark({ id, done, total, signedIn, compact }) {
  const router = useRouter(), path = usePathname();
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  if (!signedIn) return compact ? null : <Link className="button secondary" href={signin(path)}>Sign in to track this topic</Link>;
  const all = done === total;
  return <span className="topic-mark">
    <button type="button" className={compact ? "ghost" : "secondary"} disabled={busy}
      onClick={() => mark({ topic: id, status: all ? null : "known" }, router, setBusy, setError)}>
      {all ? (compact ? "Undo" : "Reset this topic") : compact ? "I know this" : "I already know this whole topic"}</button>
    {error && <span className="errorlist" role="alert">{error}</span>}
  </span>;
}
