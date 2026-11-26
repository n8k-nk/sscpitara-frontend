"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { send } from "../lib/client";
import styles from "./mock-data-entry.module.css";

function clock(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function MockDataEntry({ id, title, session }) {
  const router = useRouter();
  const [typed, setTyped] = useState(session.typed);
  const [remaining, setRemaining] = useState(session.remaining);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inflight = useRef(null);
  const latest = useRef(session.typed);
  const saved = useRef(session.typed);
  const finishing = useRef(false);
  const route = `study/attempts/${id}/data-entry`;
  const results = `/study/attempt/${id}/results/`;
  const [saveState, setSaveState] = useState("saved");
  const [confirming, setConfirming] = useState(false);
  const [size, setSize] = useState(1);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!session.deadline) return;
    const end = performance.now() + session.remaining * 1000;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((end - performance.now()) / 1000));
      setRemaining(left);
      if (!left) {
        clearInterval(timer);
        router.replace(results);
      }
    }, 250);
    const autosave = setInterval(() => {
      if (finishing.current || inflight.current || latest.current === saved.current) return;
      const text = latest.current;
      setSaveState("saving");
      inflight.current = send(route, { action: "save", typed: text }).then(({ ok, data }) => {
        if (ok && data.finished) router.replace(results);
        else if (ok) { saved.current = text; setError(""); setSaveState(latest.current === text ? "saved" : "pending"); }
        else { setError(data.error ?? "Could not save your response. Retrying."); setSaveState("error"); }
      }).finally(() => { inflight.current = null; });
    }, 1000);
    return () => { clearInterval(timer); clearInterval(autosave); };
  }, [results, route, router, session.deadline, session.remaining]);

  async function act(action) {
    if (finishing.current) return;
    finishing.current = true;
    setBusy(true);
    setError("");
    await inflight.current;
    const { ok, data } = await send(route, { action, typed: latest.current });
    if (ok) {
      if (data.finished) router.replace(results);
      else router.refresh();
    } else {
      finishing.current = false;
      setBusy(false);
      setError(data.error ?? "Could not update this session. Try again.");
    }
  }

  // Typing practice: text has to be typed, not pasted or dragged in.
  const refuse = (event) => { event.preventDefault(); setNotice("Pasting is turned off in the typing test."); };

  if (!session.deadline) return <article className={`${styles.session} ${styles.intro}`}>
    <p className={styles.title}>{title}</p>
    <h1>Data Entry Speed Test</h1>
    <p>Session I is complete. Take a break, then start the qualifying typing session when you are ready.</p>
    <ul>
      <li><strong>{session.seconds / 60} minutes</strong>, counted from the moment you press Start.</li>
      <li>Type the passage exactly as shown, including capitals and punctuation.</li>
      <li>Your response saves automatically. Pasting is turned off.</li>
    </ul>
    <button type="button" disabled={busy} onClick={() => act("start")}>{busy ? "Starting…" : "Start Session II"}</button>
    {error && <p role="alert" className="errorlist">{error}</p>}
  </article>;

  const words = (text) => text.split(/\s+/).filter(Boolean).length;
  const goal = session.passage.length;
  const done = Math.min(100, Math.round((100 * typed.length) / Math.max(1, goal)));
  const over = remaining === 0;
  const number = (value) => value.toLocaleString("en-IN");

  return <article className={`${styles.session} ${styles.typing}`}>
    <header className={styles.bar}>
      <div><p className={styles.title}>{title}</p><h1>Data Entry Speed Test</h1></div>
      {remaining !== null && <div className={styles.timer} data-level={remaining <= 60 ? "last" : remaining <= 180 ? "low" : "ok"}>
        <small>Time left</small><strong role="timer" aria-label="Time remaining">{clock(remaining)}</strong></div>}
    </header>
    <div className={styles.work}>
      <section className={styles.pane} aria-labelledby="passage-title">
        <div className={styles.paneHead}><h2 id="passage-title">Passage</h2>
          <div className={styles.zoom} role="group" aria-label="Text size">
            <button type="button" disabled={size <= 0.9} onClick={() => setSize((value) => Math.round((value - 0.1) * 10) / 10)} aria-label="Smaller text">A−</button>
            <button type="button" disabled={size >= 1.5} onClick={() => setSize((value) => Math.round((value + 0.1) * 10) / 10)} aria-label="Larger text">A+</button>
          </div></div>
        <div className={styles.passage} style={{ fontSize: `${size}rem` }} aria-label="Passage to type" tabIndex={0}>{session.passage}</div>
      </section>
      <section className={styles.pane}>
        <div className={styles.paneHead}><label htmlFor="dest-response">Your response</label>
          <span className={styles.save} data-state={saveState} role="status">{{ saved: "Saved", pending: "Typing…", saving: "Saving…", error: "Not saved. Retrying" }[saveState]}</span></div>
        <textarea id="dest-response" style={{ fontSize: `${size}rem` }} aria-describedby="typing-guide" placeholder="Start typing here…" autoFocus
          spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" maxLength={6000} disabled={busy || over} value={typed}
          onPaste={refuse} onDrop={refuse}
          onChange={(event) => { latest.current = event.target.value; setTyped(event.target.value); setSaveState("pending"); setNotice(""); setConfirming(false); }} />
      </section>
    </div>
    <footer className={styles.footer}>
      <div className={styles.stats}>
        <div className={styles.meter} role="progressbar" aria-label="Characters typed compared with the passage" aria-valuemin={0} aria-valuemax={100} aria-valuenow={done}><span style={{ width: `${done}%` }} /></div>
        <p id="typing-guide"><strong>{number(typed.length)}</strong> / {number(goal)} characters · <strong>{number(words(typed))}</strong> / {number(words(session.passage))} words</p>
        {notice && <p role="alert" className={styles.notice}>{notice}</p>}
        {error && <p role="alert" className="errorlist">{error}</p>}
      </div>
      {confirming ? <div className={styles.confirm} role="group" aria-label="Confirm submission">
        <span>Submit now? You can’t edit afterwards.</span>
        <button type="button" className="secondary" disabled={busy} onClick={() => setConfirming(false)}>Keep typing</button>
        <button type="button" disabled={busy || over} onClick={() => act("finish")}>{busy ? "Submitting…" : "Yes, submit"}</button>
      </div> : <button type="button" disabled={busy || over} onClick={() => setConfirming(true)}>Submit typing test</button>}
    </footer>
  </article>;
}
