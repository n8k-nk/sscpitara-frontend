"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { send } from "../../../lib/client";
import styles from "./mocks.module.css";

const toggle = (values, id) => values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
const PRESETS = [["Quick", 10, 8], ["Standard", 25, 15], ["Long", 50, 30]];
const total = (items) => items.reduce((sum, item) => sum + item.count, 0);

function Choices({ label, hint, items, picked, onChange, disabled }) {
  return <details className={styles.choices}><summary>{label}<small>{picked.length ? `${picked.length} selected` : "All"}</small></summary>
    <p className={styles.state}>{hint}</p>
    <fieldset aria-label={label} disabled={disabled}>
      {items.map((item) => <label key={item.id}>
        <input type="checkbox" checked={picked.includes(item.id)} onChange={() => onChange(item.id)} />
        <span>{item.label ?? item.name}</span><small>{item.count}</small>
      </label>)}
    </fieldset>
  </details>;
}

export default function SectionalBuilder({ data }) {
  const router = useRouter();
  const [subjectId, setSubject] = useState(data.subjects[0]?.id ?? "");
  const [chapterIds, setChapters] = useState([]);
  const [topicIds, setTopics] = useState([]);
  const [requested, setRequested] = useState("15");
  const [minutes, setMinutes] = useState("15");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [subjectOpen, setSubjectOpen] = useState(false);
  const request = useRef(null);
  const subjectWrapRef = useRef(null);
  const subject = data.subjects.find(({ id }) => id === subjectId);

  useEffect(() => {
    if (!subjectOpen) return undefined;
    const onDown = (e) => {
      if (subjectWrapRef.current && !subjectWrapRef.current.contains(e.target)) setSubjectOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setSubjectOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [subjectOpen]);
  const chapters = subject?.chapters.filter(({ id }) => chapterIds.includes(id)) ?? [];
  const topics = chapters.flatMap((chapter) => chapter.topics.map((topic) => ({
    ...topic, label: chapters.length > 1 ? `${chapter.name} · ${topic.name}` : topic.name,
  })));
  const available = topicIds.length ? total(topics.filter(({ id }) => topicIds.includes(id))) :
    chapters.length ? total(chapters) : subject?.count ?? 0;
  const limit = Math.min(data.max_questions, available);
  const count = requested === "" ? "" : Math.min(Number(requested), limit);

  function changeChapter(id) {
    const next = toggle(chapterIds, id);
    const allowed = new Set(subject.chapters.filter((chapter) => next.includes(chapter.id)).flatMap((chapter) => chapter.topics.map((topic) => topic.id)));
    setChapters(next);
    setTopics(topicIds.filter((topic) => allowed.has(topic)));
  }

  async function start(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const payload = { stage: data.stage, subject: subjectId, chapters: chapterIds, topics: topicIds, count, minutes: Number(minutes) };
    const signature = JSON.stringify(payload);
    if (request.current?.signature !== signature) request.current = { signature, key: crypto.randomUUID() };
    const { ok, data: result } = await send("study/sectional/start", { ...payload, key: request.current.key });
    if (ok) router.push(`/study/attempt/${result.attempt}/`);
    else {
      setError(result.error ?? "Could not start the test.");
      setBusy(false);
    }
  }

  return <div className={styles.columns}>
    <section className={styles.list} aria-labelledby="sectional-title">
      <h2 id="sectional-title">Build a sectional test</h2>
      {!data.premium && (
        <div className="notice" role="note" style={{ marginBottom: "1rem" }}>
          <strong>Sectional tests are a Premium feature.</strong>{" "}
          Upgrade to build custom timed tests by subject, chapter, and topic.{" "}
          <Link href="/plans/">Get Premium</Link>
        </div>
      )}
      {!subject ? <p className="muted">No eligible questions are available for this tier yet.</p> :
        <form className={styles.builder} onSubmit={start}>
          <div className={styles.subjectField} ref={subjectWrapRef}>
            <label id="sectional-subject-label">Subject</label>
            <button
              type="button"
              id="sectional-subject"
              className={styles.subjectTrigger}
              aria-haspopup="listbox"
              aria-expanded={subjectOpen}
              aria-labelledby="sectional-subject-label sectional-subject"
              disabled={busy}
              onClick={() => setSubjectOpen((open) => !open)}
            >
              <span>{subject.paper && `${subject.paper} · `}{subject.name}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
            {subjectOpen && (
              <ul className={styles.subjectMenu} role="listbox" aria-labelledby="sectional-subject-label">
                {data.subjects.map((item) => {
                  const selected = item.id === subjectId;
                  return (
                    <li key={item.id} role="option" aria-selected={selected}>
                      <button
                        type="button"
                        className={selected ? styles.subjectOptionActive : styles.subjectOption}
                        onClick={() => {
                          setSubject(item.id);
                          setChapters([]);
                          setTopics([]);
                          setError("");
                          setSubjectOpen(false);
                        }}
                      >
                        <span>{item.paper && `${item.paper} · `}{item.name}</span>
                        <small>{item.count}</small>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <Choices key={subjectId} label="Chapters" hint="Leave unchecked to use every chapter in this subject." items={subject.chapters} picked={chapterIds} onChange={changeChapter} disabled={busy} />
          {topics.length > 0 && <Choices label="Topics" hint="Leave unchecked to use all questions in the selected chapters." items={topics}
            picked={topicIds} onChange={(id) => setTopics(toggle(topicIds, id))} disabled={busy} />}
          <div className={styles.chips} role="group" aria-label="Presets">{PRESETS.map(([name, questions, time]) =>
            <button key={name} type="button" disabled={busy || time > data.max_minutes} aria-pressed={requested === String(questions) && minutes === String(time)}
              onClick={() => { setRequested(String(questions)); setMinutes(String(time)); }}>{name} <small>{questions} Qs · {time} min</small></button>)}</div>
          <div className={styles.duration}>
            <label>Questions<input type="number" required value={count} min={1} max={Math.max(1, limit)} disabled={busy}
              onChange={(e) => setRequested(e.target.value)} /></label>
            <label>Time (minutes)<input type="number" required value={minutes} min={1} max={data.max_minutes} disabled={busy}
              onChange={(e) => setMinutes(e.target.value)} /></label>
          </div>
          <p className={styles.state} role="status">{available.toLocaleString("en-IN")} questions in this selection. Choose up to {limit}.</p>
          <div>{data.premium
            ? <button type="submit" disabled={!limit || busy}>{busy ? "Building test…" : "Start sectional test"}</button>
            : <Link className="button" href="/plans/">Get Premium to start</Link>}</div>
          {error && <p role="alert" className="errorlist">{error}</p>}
        </form>}
    </section>
    <aside className={styles.recent}>
      <h2>Recent sectional tests</h2>
      {data.recent.length ? <ul className={styles.rows}>{data.recent.map((row) => <li key={row.id}>
        <div><strong>{row.title.split(" · ").slice(2).join(" · ")}</strong><span className={styles.state}>{row.questions} questions · {row.minutes} min
          {row.finished && ` · ${Number(row.score)} marks`}</span></div>
        <Link href={`/study/attempt/${row.id}/${row.finished ? "results/" : ""}`} prefetch={false}>{row.finished ? "Results" : "Resume"}</Link>
      </li>)}</ul> : <p className="muted">Your tests will appear here after you start one.</p>}
    </aside>
  </div>;
}
