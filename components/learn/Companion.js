"use client";
import { useCallback, useEffect, useState } from "react";
import { send } from "../../lib/client";
import LessonAsk from "./LessonAsk";
import { WIDGETS } from "./widgets";

const NOTE = { rule: "Rule", example: "Example", trick: "Shortcut", trap: "Trap", fact: "Remember" };

/** The study companion beside a lesson: something to try, and sticky notes. Made by AI once per lesson, then reused. */
export default function Companion({ path, signedIn, approvedVersion }) {
  const [state, setState] = useState({ status: "loading" });
  const [tab, setTab] = useState("try");
  const url = `learn/companion/${path}`;

  const create = useCallback(async () => {
    setState({ status: "creating" });
    for (let attempt = 0; attempt < 32; attempt++) {
      const r = await send(url, {});
      if (r.status === 202) { await new Promise((done) => setTimeout(done, 5000)); continue; }  // someone else is making it
      return setState(r.ok ? r.data : { status: "error", message: r.data.error });
    }
    setState({ status: "error", message: "This is taking too long. Try again shortly." });
  }, [url]);

  useEffect(() => {
    let live = true;
    (async () => {
      const response = await fetch(`/api/${url}/`, { credentials: "same-origin" }).catch(() => null);
      const data = response?.ok ? await response.json() : { status: "unavailable" };
      if (!live) return;
      if (data.status === "none" && data.canGenerate) create(); else setState(data);
    })();
    return () => { live = false; };
  }, [url, create]);

  const canAsk = signedIn && approvedVersion != null;
  const hidden = state.status === "unavailable" || (state.status === "none" && signedIn);
  if (hidden && !canAsk) return null;
  const spec = state.spec, block = spec?.interactive, Widget = block && WIDGETS[block.type];
  const showing = Widget ? tab : "notes";

  return <aside className="companion" aria-label="Study companion">
    <div className="cw-head"><h2>{state.status === "ready" ? (showing === "try" ? block.title : "Sticky notes") : "Study companion"}</h2><span className="badge">Interactive mode</span></div>
    {state.status === "loading" && <p className="muted small">Loading…</p>}
    {state.status === "creating" && <div className="cw-loading" role="status"><span /><span /><span /><p className="muted small">Making an activity and notes for this skill. This happens once and takes up to a minute.</p></div>}
    {state.status === "error" && <><p className="errorlist" role="alert">{state.message}</p><button type="button" className="secondary" onClick={create}>Try again</button></>}
    {state.status === "none" && !signedIn && <p className="muted small">Sign in to create an activity and sticky notes for this skill.</p>}
    {state.status === "ready" && <>
      {Widget && <div className="tabs" role="tablist" aria-label="Companion">{[["try", "Try it"], ["notes", `Notes (${spec.flashcards.length})`]].map(([key, label]) =>
        <button key={key} type="button" role="tab" aria-selected={showing === key} className={showing === key ? "tab on" : "tab"} onClick={() => setTab(key)}>{label}</button>)}</div>}
      {Widget && <div role="tabpanel" hidden={showing !== "try"}><p className="muted small">{block.how}</p><Widget block={block} /></div>}
      <div role="tabpanel" hidden={showing !== "notes"}><ul className="stickies">{spec.flashcards.map((c) => <li key={c.title} data-kind={c.kind}>
        <small>{NOTE[c.kind]}</small><strong>{c.title}</strong>{c.points.map((p) => <p key={p}>{p}</p>)}</li>)}</ul></div>
    </>}
    {canAsk && <LessonAsk path={path} version={approvedVersion} />}
  </aside>;
}
