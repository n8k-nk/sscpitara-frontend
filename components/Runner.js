"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Figures from "./Figures";
import { send } from "../lib/client";
import styles from "./mock-runner.module.css";

const clock = (left) => `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
const sectionLabels = {
  "General Intelligence and Reasoning": "Reasoning",
  "Reasoning and General Intelligence": "Reasoning",
  "English Comprehension": "English",
  "English Language and Comprehension": "English",
};
const paletteLabels = { answered: "Answered", unanswered: "Unanswered", review: "Review", unseen: "Not visited" };

/** One question with autosave, section timer and question navigator. Remounted per question by the page. */
export default function Runner({ data, stem, passage, options }) {
  const router = useRouter();
  const { id, position, hi } = data;
  const [choice, setChoice] = useState({ selected: data.selected, flagged: data.flagged });
  const [status, setStatus] = useState(data.saved ? "Saved" : "");
  const [left, setLeft] = useState(data.remaining);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const palette = useRef(null), paletteToggle = useRef(null);
  const latest = useRef(choice), revision = useRef(data.revision);
  const dirty = useRef(false), generation = useRef(0), saving = useRef(null);
  const draftKey = `ssc-answer:${id}/${position}`;
  const nextBlock = data.mixed_mock && data.section < data.section_count;
  const richText = data.pyq || data.rich_text;
  const remember = (value) => {
    try { value ? sessionStorage.setItem(draftKey, JSON.stringify(value)) : sessionStorage.removeItem(draftKey); } catch { /* storage may be disabled */ }
  };
  const lang = (code) => `&lang=${code}`;
  const href = (q, language = data.mock ? data.language : hi ? "hi" : "") =>
    `/study/attempt/${id}/?q=${q}${language ? lang(language) : ""}`;

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
      else if (live && ok && data.mixed_mock && result.section !== data.section) router.refresh();
    }, 10000);
    return () => { live = false; clearInterval(timer); };
  }, [data.mock, data.mixed_mock, data.section, id, position, router]);

  useEffect(() => {
    const retry = () => dirty.current && flush();
    const warn = (event) => { if (dirty.current) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("online", retry);
    window.addEventListener("beforeunload", warn);
    return () => { window.removeEventListener("online", retry); window.removeEventListener("beforeunload", warn); };
  }, []);

  useEffect(() => {
    if (paletteOpen) palette.current?.querySelector('[aria-current="page"]')?.focus();
  }, [paletteOpen]);

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
    if (submitting) return;
    if (data.mock && !confirming) {
      setConfirming(true);
      return;
    }
    if (!data.mock && !window.confirm("Submit this attempt and view the results?")) return;
    if (dirty.current && !(await flush())) return;
    setSubmitting(true);
    const endpoint = nextBlock ? "next-section" : "submit";
    const { ok, data: result } = await send(`study/attempts/${id}/${endpoint}`, { section: data.section });
    if (ok && (nextBlock || result.data_entry) && !result.finished) router.refresh();
    else if (ok) router.push(`/study/attempt/${id}/results/`);
    else { setSubmitting(false); setStatus(result.error ?? "Could not submit. Try again."); }
  }

  const answered = (p) => (p.position === position ? choice.selected != null : p.selected != null);
  const question = <article className="question-card" tabIndex={data.mock ? 0 : undefined} aria-labelledby={data.mock ? "mock-question-title" : undefined}>
      <div className="q-top"><h2 id={data.mock ? "mock-question-title" : undefined}>Question {position}{data.mock ? ` of ${data.question_count ?? data.positions.length}` : data.practice_phase && <small> · {data.practice_phase}</small>}</h2>
        {data.can_hindi && <a className="button ghost" href={href(position, hi ? "en" : "hi")} onClick={(e) => go(e, href(position, hi ? "en" : "hi"))}>{hi ? "English" : "हिन्दी"}</a>}</div>
      {data.mock && <div className={styles.marks} role="group" aria-label="Marks">
        <span aria-label={`Correct: ${Number(data.marks_correct)} marks`}>+{Number(data.marks_correct)}</span>
        <span aria-label={`Incorrect: ${Number(data.marks_wrong)} marks`}>{Number(data.marks_wrong)}</span>
      </div>}
      <form id="answer" lang={hi ? "hi" : undefined} onSubmit={(e) => { e.preventDefault(); if (dirty.current) flush(); }}>
        {data.passage && (richText ? <div className="passage rich" lang={hi ? "hi" : undefined}>{passage}</div>
          : <p className="passage lesson">{data.passage}</p>)}
        <Figures figures={data.media.passage} />
        <fieldset><legend>{stem ?? data.question}</legend>
          <Figures figures={data.media.prompt} />
          {data.diagram_url && <img className="diagram" src={data.diagram_url} alt={`Diagram for question ${position}`} />}
          <div className="options">
            {data.options.map((option, index) => <label className="option" key={index}>
              <input type="radio" name="selected" value={index} checked={choice.selected === index} onChange={() => change({ selected: index })} />
              {richText ? <span><strong>{data.option_labels[index]}. </strong>{options[index]}</span> : option.label}
              <Figures figures={option.images} />
            </label>)}
            {!data.mock && <label className="option skip-option"><input type="radio" name="selected" value="" checked={choice.selected == null} onChange={() => change({ selected: null })} /> Skip this question</label>}
          </div>
        </fieldset>
        {!data.mock && <div className="question-tools">
          <label><input type="checkbox" name="flagged" checked={choice.flagged} onChange={(e) => change({ flagged: e.target.checked })} /> Flag for review</label>
          <button type="submit" className="secondary">Save answer</button>
          <span id="saved" role="status">{status}</span>
        </div>}
      </form>
    </article>;

  if (data.mock) {
    const sections = new Map();
    for (const item of data.positions) {
      const name = item.section_name;
      if (!sections.has(name)) sections.set(name, []);
      sections.get(name).push(item);
    }
    const section = sections.get(data.section_name);
    const stateOf = (p) => {
      if (p.position === position ? choice.flagged : p.flagged) return "review";
      if (answered(p)) return "answered";
      return p.visited ? "unanswered" : "unseen";
    };
    const counts = { answered: 0, unanswered: 0, review: 0, unseen: 0 };
    section.forEach((p) => { counts[stateOf(p)] += 1; });
    const [exam, tier, ...sitting] = data.title.split(" · ");
    const next = data.next_position && href(data.next_position);
    const previous = data.positions.some((p) => p.position === position - 1);
    return <div className={styles.shell}>
      <header className={styles.header}>
        <div><h1>{[exam, tier].filter(Boolean).join(" · ")}</h1>
          <p>{[...sitting, data.mixed_mock ? `Block ${data.section} of ${data.section_count}` : "Exam mode"].join(" · ")}</p></div>
        {left != null && <div className={styles.time} role="timer" aria-label="Time remaining">
          <span>Time remaining</span><strong><span aria-hidden="true">◷</span> {clock(left)}</strong>
        </div>}
        <span className={styles.progress}>{data.positions.filter(answered).length} / {data.positions.length} answered</span>
        <form id="finish" className={styles.submit} onSubmit={finish}>
          <button type="submit" disabled={submitting}>{confirming ? (nextBlock ? "Confirm and continue" : "Confirm submission")
            : nextBlock ? "Finish block" : data.data_entry_required ? "Submit Session I" : "Submit test"}</button>
          {confirming && <button type="button" disabled={submitting} className={styles.cancel} onClick={() => setConfirming(false)}>Keep working</button>}
        </form>
      </header>
      <nav className={styles.sections} aria-label="Test sections" style={{ "--section-count": sections.size }}>
        {[...sections].map(([name, questions]) => <a key={name} href={href(questions[0].position)}
          aria-current={name === data.section_name ? "true" : undefined} onClick={(event) => go(event, href(questions[0].position))}>
          <strong>{sectionLabels[name] ?? name}</strong>
          <span>{questions.filter(answered).length} / {questions.length}<span className={styles.answeredLabel}> answered</span></span>
        </a>)}
      </nav>
      <div className={styles.content}>
        {question}
        <aside id="question-palette" ref={palette} className={styles.palette} data-open={paletteOpen} aria-labelledby="palette-title"
          onKeyDown={(event) => {
            if (event.key === "Escape" && paletteOpen) {
              setPaletteOpen(false);
              paletteToggle.current?.focus();
            }
          }}>
          <h2 id="palette-title">Question palette</h2>
          <ul className={styles.legend}>{Object.entries(paletteLabels).map(([key, label]) =>
            <li key={key} data-state={key}>{counts[key]} {label}</li>)}</ul>
          <nav className={styles.numbers} aria-label={`${data.section_name} questions`}>
            {section.map((p) => <a key={p.position} href={href(p.position)} data-state={stateOf(p)}
              aria-current={p.position === position ? "page" : undefined} onClick={(event) => {
                if (paletteOpen && p.position === position) {
                  setPaletteOpen(false);
                  paletteToggle.current?.focus();
                }
                go(event, href(p.position));
              }}
              aria-label={`Question ${p.position}, ${paletteLabels[stateOf(p)].toLowerCase()}`}>{p.position}</a>)}
          </nav>
          <p>{sectionLabels[data.section_name] ?? data.section_name} · {section.length} questions</p>
        </aside>
      </div>
      <footer className={styles.actions}>
        {previous ? <a className={styles.previous} href={href(position - 1)} onClick={(event) => go(event, href(position - 1))}>‹ Previous</a>
          : <button className={styles.previous} type="button" disabled>‹ Previous</button>}
        <button className={styles.clear} type="button" disabled={choice.selected == null} onClick={() => change({ selected: null })}>Clear response</button>
        <button className={styles.review} type="button" onClick={(event) => {
          change({ flagged: !choice.flagged });
          if (next) go(event, next);
        }}>{choice.flagged ? "Unmark review" : "Mark for review"}{next ? " & next" : ""}</button>
        <button className={styles.paletteToggle} ref={paletteToggle} type="button" aria-label="Question palette" aria-controls="question-palette" aria-expanded={paletteOpen}
          onClick={() => setPaletteOpen((open) => !open)}><span aria-hidden="true">▦</span></button>
        {next ? <a className={styles.primary} href={next} onClick={(event) => go(event, next)}>Save & next ›</a>
          : <button type="button" className={styles.primary} onClick={() => { setConfirming(true); document.getElementById("finish")?.querySelector("button")?.focus(); }}>
            {nextBlock ? "Finish block" : "Review submission"}</button>}
        <span className={styles.saveStatus} role="status" data-error={Boolean(status && status !== "Saved" && status !== "Saving…")}>
          {!status || status === "Saved" ? "Responses autosaved" : status}
        </span>
      </footer>
    </div>;
  }

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
    {question}
    <div className="runner-nav">
      <form id="finish" onSubmit={finish}>
        <button className="secondary">Finish and see results</button>
      </form>
      {data.next_position && <a className="button arrow" href={href(data.next_position)} onClick={(e) => go(e, href(data.next_position))}>Next question</a>}
    </div>
  </>;
}
