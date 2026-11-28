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

/** One attempt section with instant 0ms client-side question switching and non-blocking background autosave. */
export default function Runner({ data, renderedByPos, stem, passage, options }) {
  const router = useRouter();
  const { id } = data;
  const itemsList = Array.isArray(data.items) && data.items.length ? data.items : null;

  const [activePos, setActivePos] = useState(data.position);
  const [isHi, setIsHi] = useState(Boolean(data.hi));
  const [answers, setAnswers] = useState(() => {
    const map = {};
    if (itemsList) {
      for (const item of itemsList) {
        map[item.position] = { selected: item.selected, flagged: Boolean(item.flagged) };
      }
    } else {
      map[data.position] = { selected: data.selected, flagged: Boolean(data.flagged) };
    }
    return map;
  });
  const [visited, setVisited] = useState(() => {
    const set = new Set();
    if (itemsList) {
      for (const item of itemsList) {
        if (item.visited || item.position === data.position) set.add(item.position);
      }
    } else {
      set.add(data.position);
    }
    return set;
  });
  const [status, setStatus] = useState(data.saved ? "Saved" : "");
  const [left, setLeft] = useState(data.remaining);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const palette = useRef(null), paletteToggle = useRef(null);
  const latestByPos = useRef({ ...answers });
  const revisionByPos = useRef((() => {
    const rev = {};
    if (itemsList) {
      for (const item of itemsList) rev[item.position] = item.revision;
    } else {
      rev[data.position] = data.revision;
    }
    return rev;
  })());
  const dirtySet = useRef(new Set());
  const generationByPos = useRef({});
  const savingByPos = useRef({});
  const flushTimers = useRef({});

  const activeItem = itemsList ? itemsList.find((item) => item.position === activePos) || itemsList[0] : null;
  const position = activeItem ? activeItem.position : data.position;
  const choice = answers[position] ?? { selected: null, flagged: false };
  const richText = data.pyq || data.rich_text;
  const nextBlock = data.mixed_mock && data.section < data.section_count;

  const canHindi = activeItem ? Boolean(activeItem.can_hindi) : Boolean(data.can_hindi);
  const hi = isHi && canHindi;
  const variant = activeItem ? (hi && activeItem.hi ? activeItem.hi : activeItem.en) : null;
  const rendered = renderedByPos?.[position] ? (hi && renderedByPos[position].hi ? renderedByPos[position].hi : renderedByPos[position].en) : null;

  const currentStem = rendered ? rendered.stem : stem ?? (variant ? variant.question : data.question);
  const currentPassage = rendered ? rendered.passage : passage ?? (variant ? variant.passage : data.passage);
  const currentOptions = rendered ? rendered.options : options;
  const rawOptions = variant ? variant.options : data.options;
  const currentMedia = activeItem ? activeItem.media : data.media;
  const currentDiagram = activeItem ? activeItem.diagram_url : data.diagram_url;
  const currentMarksCorrect = activeItem?.marks_correct ?? data.marks_correct;
  const currentMarksWrong = activeItem?.marks_wrong ?? data.marks_wrong;
  const currentSectionName = activeItem?.section_name ?? data.section_name;
  const currentPracticePhase = activeItem?.practice_phase ?? data.practice_phase;

  // A past paper can interleave sections (Q1 Reasoning, Q2 Quant, Q4 Reasoning), so a test steps through one section at a time.
  const sectionNames = data.mock ? data.positions.map((p) => p.section_name) : [];
  const order = [...data.positions]
    .sort((a, b) => sectionNames.indexOf(a.section_name) - sectionNames.indexOf(b.section_name))
    .map((p) => p.position);
  const at = order.indexOf(position);
  const nextPos = order[at + 1] ?? null;
  const prevPos = order[at - 1] ?? null;
  const draftKey = (pos) => `ssc-answer:${id}/${pos}`;
  const remember = (pos, value) => {
    try { value ? sessionStorage.setItem(draftKey(pos), JSON.stringify(value)) : sessionStorage.removeItem(draftKey(pos)); } catch { /* storage may be disabled */ }
  };
  const langParam = (code) => `&lang=${code}`;
  const href = (q, language = data.mock ? (isHi ? "hi" : "en") : isHi ? "hi" : "") =>
    `/study/attempt/${id}/?q=${q}${language ? langParam(language) : ""}`;

  function flushPos(pos) {
    if (flushTimers.current[pos]) {
      clearTimeout(flushTimers.current[pos]);
      delete flushTimers.current[pos];
    }
    if (savingByPos.current[pos]) return savingByPos.current[pos];
    if (!dirtySet.current.has(pos)) return Promise.resolve(true);

    setStatus("Saving…");
    const promise = (async () => {
      while (dirtySet.current.has(pos)) {
        const sent = generationByPos.current[pos] || 0;
        const payload = latestByPos.current[pos] ?? { selected: null, flagged: false };
        const rev = revisionByPos.current[pos] ?? 0;
        const { ok, status: code, data: result } = await send(
          `study/attempts/${id}/${pos}/save`,
          { ...payload, revision: rev },
          "POST",
          { keepalive: true },
        );
        if (!ok) {
          setStatus(code === 409 ? result.error ?? "Answer conflict. Reload to check your saved answer." : "Save failed. Check your connection and retry.");
          return false;
        }
        revisionByPos.current[pos] = result.revision;
        if (sent === (generationByPos.current[pos] || 0)) {
          dirtySet.current.delete(pos);
          remember(pos, null);
        } else {
          remember(pos, { ...latestByPos.current[pos], revision: result.revision });
        }
      }
      if (dirtySet.current.size === 0) setStatus("Saved");
      return true;
    })().finally(() => { delete savingByPos.current[pos]; });

    savingByPos.current[pos] = promise;
    return promise;
  }

  async function flushAll() {
    const positionsToFlush = new Set([
      ...dirtySet.current,
      ...Object.keys(flushTimers.current).map(Number),
      ...Object.keys(savingByPos.current).map(Number),
    ]);
    if (positionsToFlush.size === 0) return true;
    const results = await Promise.all([...positionsToFlush].map((pos) => flushPos(pos)));
    return results.every(Boolean);
  }

  function change(patch, targetPos = position) {
    const nextChoice = { ...(latestByPos.current[targetPos] ?? { selected: null, flagged: false }), ...patch };
    latestByPos.current[targetPos] = nextChoice;
    setAnswers((prev) => ({ ...prev, [targetPos]: nextChoice }));
    dirtySet.current.add(targetPos);
    generationByPos.current[targetPos] = (generationByPos.current[targetPos] || 0) + 1;
    remember(targetPos, { ...nextChoice, revision: revisionByPos.current[targetPos] });
    setStatus("Saving…");

    if (flushTimers.current[targetPos]) clearTimeout(flushTimers.current[targetPos]);
    flushTimers.current[targetPos] = setTimeout(() => {
      delete flushTimers.current[targetPos];
      flushPos(targetPos);
    }, 200);
  }

  // Re-apply any un-persisted drafts from sessionStorage on mount.
  useEffect(() => {
    const positions = itemsList ? itemsList.map((i) => i.position) : [data.position];
    for (const pos of positions) {
      try {
        const saved = JSON.parse(sessionStorage.getItem(draftKey(pos)));
        if (saved && saved.revision === revisionByPos.current[pos]) {
          change({ selected: saved.selected, flagged: saved.flagged }, pos);
        } else if (saved) {
          remember(pos, null);
        }
      } catch { /* ignore invalid drafts */ }
    }
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
    const retry = () => { if (dirtySet.current.size > 0) flushAll(); };
    const warn = (event) => { if (dirtySet.current.size > 0) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("online", retry);
    window.addEventListener("beforeunload", warn);
    return () => {
      for (const t of Object.values(flushTimers.current)) clearTimeout(t);
      window.removeEventListener("online", retry);
      window.removeEventListener("beforeunload", warn);
    };
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
      if (seconds <= 0) { clearInterval(timer); flushAll().finally(() => router.refresh()); }
    };
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  async function go(event, to, targetPos) {
    event.preventDefault();
    if (itemsList && targetPos != null) {
      // Flush any pending edit on the current question in the background without blocking navigation.
      if (dirtySet.current.has(position)) flushPos(position);
      setVisited((prev) => {
        if (prev.has(targetPos)) return prev;
        const nextSet = new Set(prev);
        nextSet.add(targetPos);
        return nextSet;
      });
      setActivePos(targetPos);
      window.history.replaceState(null, "", to);
      return;
    }
    if (dirtySet.current.size > 0 && !(await flushAll())) return;
    router.push(to);
  }

  function toggleLang(event) {
    event.preventDefault();
    const nextHi = !isHi;
    if (itemsList) {
      setIsHi(nextHi);
      window.history.replaceState(null, "", href(position, nextHi ? "hi" : "en"));
      return;
    }
    go(event, href(position, nextHi ? "hi" : "en"));
  }

  async function finish(event) {
    event.preventDefault();
    if (submitting) return;
    if (data.mock && !confirming) {
      setConfirming(true);
      return;
    }
    if (!data.mock && !window.confirm("Submit this attempt and view the results?")) return;
    for (const t of Object.values(flushTimers.current)) clearTimeout(t);
    flushTimers.current = {};
    const pendingPositions = [...dirtySet.current];
    const pendingAnswers = pendingPositions.map((pos) => ({
      position: pos,
      ...(latestByPos.current[pos] ?? { selected: null, flagged: false }),
    }));
    setSubmitting(true);
    const endpoint = nextBlock ? "next-section" : "submit";
    const { ok, data: result } = await send(
      `study/attempts/${id}/${endpoint}`,
      { section: data.section, ...(pendingAnswers.length ? { answers: pendingAnswers } : {}) },
      "POST",
      { keepalive: true },
    );
    if (ok) {
      for (const pos of pendingPositions) {
        dirtySet.current.delete(pos);
        remember(pos, null);
      }
      if ((nextBlock || result.data_entry) && !result.finished) router.refresh();
      else router.push(`/study/attempt/${id}/results/`);
    } else {
      setSubmitting(false);
      setStatus(result.error ?? "Could not submit. Try again.");
    }
  }

  const answered = (p) => (answers[p.position]?.selected ?? null) != null;
  const isFlagged = (p) => Boolean(answers[p.position]?.flagged);

  const question = <article className="question-card" tabIndex={data.mock ? 0 : undefined} aria-labelledby={data.mock ? "mock-question-title" : undefined}>
      <div className="q-top"><h2 id={data.mock ? "mock-question-title" : undefined}>Question {position}{data.mock ? ` of ${data.question_count ?? data.positions.length}` : currentPracticePhase && <small> · {currentPracticePhase}</small>}</h2>
        {canHindi && <a className="button ghost" href={href(position, hi ? "en" : "hi")} onClick={toggleLang}>{hi ? "English" : "हिन्दी"}</a>}</div>
      {data.mock && <div className={styles.marks} role="group" aria-label="Marks">
        <span aria-label={`Correct: ${Number(currentMarksCorrect)} marks`}>+{Number(currentMarksCorrect)}</span>
        <span aria-label={`Incorrect: ${Number(currentMarksWrong)} marks`}>{Number(currentMarksWrong)}</span>
      </div>}
      <form id="answer" lang={hi ? "hi" : undefined} onSubmit={(e) => { e.preventDefault(); flushAll(); }}>
        {currentPassage && (richText ? <div className="passage rich" lang={hi ? "hi" : undefined}>{currentPassage}</div>
          : <p className="passage lesson">{currentPassage}</p>)}
        <Figures figures={currentMedia.passage} />
        <fieldset><legend>{currentStem}</legend>
          <Figures figures={currentMedia.prompt} />
          {currentDiagram && <img className="diagram" src={currentDiagram} alt={`Diagram for question ${position}`} />}
          <div className="options">
            {rawOptions.map((option, index) => <label className="option" key={index}>
              <input type="radio" name="selected" value={index} checked={choice.selected === index} onChange={() => change({ selected: index })} />
              {richText ? <span><strong>{activeItem?.option_labels?.[index] ?? data.option_labels[index]}. </strong>{currentOptions[index]}</span> : option.label}
              <Figures figures={option.images} />
            </label>)}
            {!data.mock && <label className="option skip-option"><input type="radio" name="selected" value="" checked={choice.selected == null} onChange={() => change({ selected: null })} /> Skip this question</label>}
          </div>
        </fieldset>
        {!data.mock && <div className="question-tools">
          <label><input type="checkbox" name="flagged" checked={choice.flagged} onChange={(e) => change({ flagged: e.target.checked })} /> Flag for review</label>
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
    const section = sections.get(currentSectionName) || [];
    const stateOf = (p) => {
      if (isFlagged(p)) return "review";
      if (answered(p)) return "answered";
      return visited.has(p.position) || p.visited ? "unanswered" : "unseen";
    };
    const counts = { answered: 0, unanswered: 0, review: 0, unseen: 0 };
    section.forEach((p) => { counts[stateOf(p)] += 1; });
    const [exam, tier, ...sitting] = data.title.split(" · ");
    const next = nextPos && href(nextPos);
    return <div className={styles.shell}>
      <header className={styles.header}>
        <div><h1>{[exam, tier].filter(Boolean).join(" · ")}</h1>
          <p>{[...sitting, data.mixed_mock ? `Block ${data.section} of ${data.section_count}` : "Exam mode"].join(" · ")}</p></div>
        {left != null && <div className={styles.time} role="timer" aria-label="Time remaining">
          <span>Time remaining</span><strong><span aria-hidden="true">◷</span> {clock(left)}</strong>
        </div>}
        <span className={styles.progress}>{data.positions.filter(answered).length} / {data.positions.length} answered</span>
        <form id="finish" className={styles.submit} onSubmit={finish}>
          <button type="submit" disabled={submitting}>{submitting ? (nextBlock ? "Continuing…" : "Submitting…")
            : confirming ? (nextBlock ? "Confirm and continue" : "Confirm submission")
            : nextBlock ? "Finish block" : data.data_entry_required ? "Submit Session I" : "Submit test"}</button>
          {confirming && <button type="button" disabled={submitting} className={styles.cancel} onClick={() => setConfirming(false)}>Keep working</button>}
        </form>
      </header>
      <nav className={styles.sections} aria-label="Test sections" style={{ "--section-count": sections.size }}>
        {[...sections].map(([name, questions]) => <a key={name} href={href(questions[0].position)}
          aria-current={name === currentSectionName ? "true" : undefined} onClick={(event) => go(event, href(questions[0].position), questions[0].position)}>
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
          <nav className={styles.numbers} aria-label={`${currentSectionName} questions`}>
            {section.map((p) => <a key={p.position} href={href(p.position)} data-state={stateOf(p)}
              aria-current={p.position === position ? "page" : undefined} onClick={(event) => {
                if (paletteOpen && p.position === position) {
                  setPaletteOpen(false);
                  paletteToggle.current?.focus();
                }
                go(event, href(p.position), p.position);
              }}
              aria-label={`Question ${p.position}, ${paletteLabels[stateOf(p)].toLowerCase()}`}>{p.position}</a>)}
          </nav>
          <p>{sectionLabels[currentSectionName] ?? currentSectionName} · {section.length} questions</p>
        </aside>
      </div>
      <footer className={styles.actions}>
        {prevPos ? <a className={styles.previous} href={href(prevPos)} onClick={(event) => go(event, href(prevPos), prevPos)}>‹ Previous</a>
          : <button className={styles.previous} type="button" disabled>‹ Previous</button>}
        <button className={styles.clear} type="button" disabled={choice.selected == null} onClick={() => change({ selected: null })}>Clear response</button>
        <button className={styles.review} type="button" onClick={(event) => {
          change({ flagged: !choice.flagged });
          if (next) go(event, next, nextPos);
        }}>{choice.flagged ? "Unmark review" : "Mark for review"}{next ? " & next" : ""}</button>
        <button className={styles.paletteToggle} ref={paletteToggle} type="button" aria-label="Question palette" aria-controls="question-palette" aria-expanded={paletteOpen}
          onClick={() => setPaletteOpen((open) => !open)}><span aria-hidden="true">▦</span></button>
        {next ? <a className={styles.primary} href={next} onClick={(event) => go(event, next, nextPos)}>Next ›</a>
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
      const flagged = isFlagged(p);
      return <a key={p.position} href={href(p.position)} onClick={(e) => go(e, href(p.position), p.position)}
        className={`${answered(p) ? "answered" : ""} ${flagged ? "flagged" : ""}`} aria-current={p.position === position ? "page" : undefined}
        aria-label={`Question ${p.position}${answered(p) ? ", answered" : ""}${flagged ? ", flagged" : ""}`}>{p.position}{flagged ? " ⚑" : ""}</a>;
    })}</nav>
    {question}
    <div className="runner-nav">
      <form id="finish" onSubmit={finish}>
        <button className="secondary">Finish and see results</button>
      </form>
      {nextPos && <a className="button arrow" href={href(nextPos)} onClick={(e) => go(e, href(nextPos), nextPos)}>Next question</a>}
    </div>
  </>;
}
