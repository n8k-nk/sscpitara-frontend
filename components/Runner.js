"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Figures from "./Figures";
import { send } from "../lib/client";

const clock = (left) => `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;

/** One question with autosave, section timer and question navigator. Remounted per question by the page. */
export default function Runner({ data, stem, passage, options }) {
  const router = useRouter();
  const { id, position, hi } = data;
  const [choice, setChoice] = useState({ selected: data.selected, flagged: data.flagged });
  const [status, setStatus] = useState(data.saved ? "Saved" : "");
  const [left, setLeft] = useState(data.remaining);
  const [confirming, setConfirming] = useState(false);
  const latest = useRef(choice), revision = useRef(data.revision);
  const dirty = useRef(false), generation = useRef(0), saving = useRef(null);
  const draftKey = `ssc-answer:${id}/${position}`;
  const remember = (value) => {
    try { value ? sessionStorage.setItem(draftKey, JSON.stringify(value)) : sessionStorage.removeItem(draftKey); } catch { /* storage may be disabled */ }
  };
  const lang = (code) => `&lang=${code}`;
  const href = (q) => `/study/attempt/${id}/?q=${q}${hi ? lang("hi") : ""}`;

  function flush() {
    if (saving.current) return saving.current;
    saving.current = (async () => {
      while (dirty.current) {
        const sent = generation.current;
        const { ok, status: code, data: result } = await send(`study/attempts/${id}/${position}/save`,
          { ...latest.current, revision: revision.current });
        if (!ok) {
          setStatus(code === 409 ? result.error ?? "Answer conflict. Reload to check your saved answer." : "Save failed. Check your connection and retry.");
          return false;
        }
        revision.current = result.revision;
        dirty.current = sent !== generation.current;
        remember(dirty.current ? { ...latest.current, revision: revision.current } : null);
      }
      setStatus("Saved");
      return true;
    })().finally(() => { saving.current = null; });
    return saving.current;
  }

  function change(patch) {
    latest.current = { ...latest.current, ...patch };
    setChoice(latest.current);
    dirty.current = true;
    generation.current += 1;
    remember({ ...latest.current, revision: revision.current });
    setStatus("Saving…");
    flush();
  }

  useEffect(() => {
    try { // Re-apply an answer that was picked but never saved (offline, closed tab).
      const saved = JSON.parse(sessionStorage.getItem(draftKey));
      if (saved && saved.revision === data.revision) change({ selected: saved.selected, flagged: saved.flagged });
      else if (saved) remember(null);
    } catch { /* ignore invalid drafts */ }
  }, []);

  useEffect(() => {
    if (!data.mock) return;
    let live = true;
    let pending = false;
    const timer = setInterval(async () => {
      if (document.hidden || pending) return;
      pending = true;
      const { ok, data: result } = await send(`study/attempts/${id}/${position}/heartbeat`);
      pending = false;
      if (live && ok && result.finished) router.replace(`/study/attempt/${id}/results/`);
    }, 10000);
    return () => { live = false; clearInterval(timer); };
  }, [data.mock, id, position, router]);

  useEffect(() => {
    const retry = () => dirty.current && flush();
    const warn = (event) => { if (dirty.current) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("online", retry);
    window.addEventListener("beforeunload", warn);
    return () => { window.removeEventListener("online", retry); window.removeEventListener("beforeunload", warn); };
  }, []);

  useEffect(() => {
    if (data.remaining == null) return;
    const end = performance.now() + data.remaining * 1000;
    const tick = () => {
      const seconds = Math.ceil((end - performance.now()) / 1000);
      setLeft(Math.max(0, seconds));
      if (seconds <= 0) { clearInterval(timer); flush().finally(() => router.refresh()); }
    };
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  async function go(event, to) {
    event.preventDefault();
    if (dirty.current && !(await flush())) return;
    router.push(to);
  }

  async function finish(event) {
    event.preventDefault();
    if (data.mock && !confirming) {
      setConfirming(true);
      return;
    }
    if (!data.mock && !window.confirm("Submit this attempt and view the results?")) return;
    if (dirty.current && !(await flush())) return;
    const { ok, data: result } = await send(`study/attempts/${id}/submit`);
    if (ok) router.push(`/study/attempt/${id}/results/`);
    else setStatus(result.error ?? "Could not submit. Try again.");
  }

  const answered = (p) => (p.position === position ? choice.selected != null : p.selected != null);
  return <>
    <div className="question-head">
      <h1>{data.title}</h1>
      {left != null && <span className="timer">{data.mock ? "Time left" : `Section ${data.section}`} · <time id="deadline" dateTime={data.deadline}>{clock(Math.max(0, left))}</time></span>}
    </div>
    <nav aria-label="Questions" className="positions">{data.positions.map((p) => {
      const flagged = p.position === position ? choice.flagged : p.flagged;
      return <a key={p.position} href={href(p.position)} onClick={(e) => go(e, href(p.position))}
        className={`${answered(p) ? "answered" : ""} ${flagged ? "flagged" : ""}`} aria-current={p.position === position ? "page" : undefined}
        aria-label={`Question ${p.position}${answered(p) ? ", answered" : ""}${flagged ? ", flagged" : ""}`}>{p.position}{flagged ? " ⚑" : ""}</a>;
    })}</nav>
    <article className="question-card">
      <div className="q-top"><h2>Question {position}{data.mock && <small> · {data.section_name}</small>}</h2>
        {data.can_hindi && <a className="button ghost" href={`/study/attempt/${id}/?q=${position}${lang(hi ? "en" : "hi")}`} onClick={(e) => go(e, `/study/attempt/${id}/?q=${position}${lang(hi ? "en" : "hi")}`)}>{hi ? "English" : "हिन्दी"}</a>}</div>
      <form id="answer" onSubmit={(e) => { e.preventDefault(); if (dirty.current) flush(); }}>
        {data.passage && (data.mock ? <div className="passage rich" lang={hi ? "hi" : undefined}>{passage}</div>
          : <p className="passage lesson">{data.passage}</p>)}
        <Figures figures={data.media.passage} />
        <fieldset><legend>{stem ?? data.question}</legend>
          <Figures figures={data.media.prompt} />
          {data.diagram_url && <img className="diagram" src={data.diagram_url} alt={`Diagram for question ${position}`} />}
          <div className="options">
            {data.options.map((option, index) => <label className="option" key={index}>
              <input type="radio" name="selected" value={index} checked={choice.selected === index} onChange={() => change({ selected: index })} />
              {data.mock ? <span><strong>{data.option_labels[index]}. </strong>{options[index]}</span> : option.label}
              <Figures figures={option.images} />
            </label>)}
            <label className="option skip-option"><input type="radio" name="selected" value="" checked={choice.selected == null} onChange={() => change({ selected: null })} /> Skip this question</label>
          </div>
        </fieldset>
        <div className="question-tools">
          <label><input type="checkbox" name="flagged" checked={choice.flagged} onChange={(e) => change({ flagged: e.target.checked })} /> Flag for review</label>
          <button type="submit" className="secondary">Save answer</button>
          <span id="saved" role="status">{status}</span>
        </div>
      </form>
    </article>
    <div className="runner-nav">
      <form id="finish" onSubmit={finish}>
        <button className="secondary">{confirming ? "Confirm submission" : "Finish and see results"}</button>
        {confirming && <button type="button" className="ghost" onClick={() => setConfirming(false)}>Keep working</button>}
      </form>
      {data.mock && position > 1 && <a className="button secondary" href={href(position - 1)} onClick={(e) => go(e, href(position - 1))}>Previous</a>}
      {data.next_position && <a className="button arrow" href={href(data.next_position)} onClick={(e) => go(e, href(data.next_position))}>Next question</a>}
    </div>
  </>;
}
