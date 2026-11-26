"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { send } from "../../lib/client";
import styles from "./current-affairs.module.css";

const storageKey = "sscpitara.current-affairs";
const emptySnapshot = "{}";
const snapshot = () => localStorage.getItem(storageKey) ?? emptySnapshot;
const subscribe = (callback) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

function save(value) {
  localStorage.setItem(storageKey, JSON.stringify(value));
  window.dispatchEvent(new Event("storage"));
}

function Marked({ text }) {
  return text.split("**").map((part, index) => index % 2 ? <strong key={index}>{part}</strong> : part);
}

export default function DigestStudy({ date, lang, quote, items, archive, accountReads }) {
  const all = JSON.parse(useSyncExternalStore(subscribe, snapshot, () => emptySnapshot));
  const [readIds, setReadIds] = useState(accountReads);
  const learned = readIds === null ? (all[date]?.learned ?? [])
    : items.filter(item => readIds.includes(item.id)).map(item => item.position);
  const saved = all[date]?.saved ?? [];
  const read = items.filter(item => learned.includes(item.position));
  const bookmarks = items.filter(item => saved.includes(item.position));
  const [cursor, setCursor] = useState(null);
  const resumed = items.findIndex(item => !learned.includes(item.position));
  const index = cursor ?? (resumed < 0 ? items.length : resumed);
  const card = items[index];
  const alreadyRead = card && learned.includes(card.position);
  const [view, setView] = useState("feed");
  const [lastRead, setLastRead] = useState(null);
  const previousSheet = useRef(null);
  const currentSheet = useRef(null);
  const motion = useRef(null);
  const gesture = useRef(null);
  const pending = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setFlag(field, position, enabled) {
    const current = JSON.parse(snapshot());
    const day = current[date] ?? {};
    const other = (day[field] ?? []).filter(value => value !== position);
    save({ ...current, [date]: { ...day, [field]: enabled ? [...other, position] : other } });
  }

  async function changeRead(item, enabled) {
    if (readIds === null) {
      setFlag("learned", item.position, enabled);
      return true;
    }
    pending.current = true;
    setSaving(true);
    setError("");
    const result = await send("current-affairs/reading", { item: item.id, read: enabled }, "POST", { keepalive: true });
    pending.current = false;
    setSaving(false);
    if (!result.ok) {
      setError(result.data.error ?? "Could not save your reading progress.");
      return false;
    }
    setReadIds(ids => enabled ? [...new Set([...ids, item.id])] : ids.filter(id => id !== item.id));
    return true;
  }

  async function advance() {
    if (!card) return;
    if (!alreadyRead) {
      if (!await changeRead(card, true)) {
        if (currentSheet.current) currentSheet.current.style.transform = "";
        return;
      }
      setLastRead(card.position);
    }
    setCursor(index + 1);
  }

  function previous() {
    setCursor(Math.max(0, index - 1));
  }

  function canMove(direction) {
    return direction > 0 ? Boolean(card) : index > 0;
  }

  function settle(sheet, distance, step) {
    gesture.current = null;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 210;
    const returning = step < 0 || (step === 0 && distance > 0);
    const moving = returning ? previousSheet.current : sheet;
    const width = sheet.offsetWidth;
    const from = returning ? Math.min(distance, width) - width : distance;
    const end = returning ? (step < 0 ? 0 : -width) : -step * width;
    const animation = moving.animate([
      { transform: `translateX(${from}px)` },
      { transform: `translateX(${end}px)` },
    ], { duration, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" });
    motion.current = animation;
    animation.onfinish = () => {
      motion.current = null;
      if (sheet.isConnected) {
        if (step > 0) advance();
        if (step < 0) previous();
      }
      // Hold the exit position until React mounts the destination.
      moving.style.transform = `translateX(${end}px)`;
      animation.cancel();
    };
  }

  function navigate(step) {
    if (!pending.current && !motion.current && !gesture.current) settle(currentSheet.current, 0, step);
  }

  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0 || event.target.closest("button") || motion.current || pending.current) return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, distance: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
    const start = gesture.current;
    if (start?.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const step = -Math.sign(dx);
    start.distance = canMove(step) ? dx : 0;
    const sheet = event.currentTarget;
    sheet.style.transform = `translateX(${Math.min(0, start.distance)}px)`;
    if (previousSheet.current) {
      const offset = Math.min(sheet.offsetWidth, Math.max(0, start.distance));
      previousSheet.current.style.transform = `translateX(calc(-100% + ${offset}px))`;
    }
  }

  function finishDrag(event) {
    const start = gesture.current;
    if (start?.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const step = -Math.sign(dx);
    const commit = event.type === "pointerup" && Math.abs(dx) >= 55
      && Math.abs(dx) > Math.abs(event.clientY - start.y) * 1.4 && canMove(step);
    if (commit || start.distance) settle(event.currentTarget, start.distance, commit ? step : 0);
    else gesture.current = null;
  }

  function bookmark(position) {
    const active = saved.includes(position);
    return <button type="button" className={styles.save} aria-label={`Save fact ${position}`}
      aria-pressed={active} onClick={() => setFlag("saved", position, !active)}>
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4h12v16l-6-4-6 4z" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </button>;
  }

  function contents(at, preview = false) {
    const item = items[at];
    if (!item) return <>
      <h2>{items.length ? "You’re caught up." : "No facts in this language yet."}</h2>
      {items.length > 0 && <small className={styles.hint}>Swipe right for the previous fact →</small>}
    </>;
    return <>
      <div className={styles.cardTop}>
        <span>Fact {String(at + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
        {preview ? <span className={styles.bookmarkSpace} /> : bookmark(item.position)}
      </div>
      <p className={styles.lead} lang={lang}><Marked text={item.text} /></p>
      <small className={styles.hint}>{learned.includes(item.position) ? "← Swipe left for next" : "← Swipe left to mark as read"}{at > 0 && " · Swipe right for previous"}</small>
    </>;
  }

  return <div className={styles.layout}>
    <section className={styles.reader} aria-label="Daily briefing">
      <div className={styles.filters} role="group" aria-label="Reading view">
        {[["feed", "Briefing"], ["saved", `Saved · ${bookmarks.length}`]].map(([key, label]) =>
          <button key={key} type="button" aria-pressed={view === key} onClick={() => setView(key)}>{label}</button>)}
      </div>
      {view === "feed" ? <>
        <div className={styles.stack} key={index}>
          {card && <div className={`${styles.sheet} ${styles.under}`} aria-hidden="true">
            {contents(index + 1, true)}
          </div>}
          {index > 0 && <div ref={previousSheet} className={`${styles.sheet} ${styles.previousSheet}`} aria-hidden="true">
            {contents(index - 1, true)}
          </div>}
          <div aria-live="polite" aria-atomic="true">
            <article ref={currentSheet} className={styles.sheet}
              onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={finishDrag}
              onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}>
              {contents(index)}
            </article>
          </div>
        </div>
        <div className={styles.controls}>
          <span>{read.length} of {items.length} read</span>
          {lastRead !== null && learned.includes(lastRead) && <button type="button" disabled={saving} onClick={async () => {
            const undo = items.findIndex(item => item.position === lastRead);
            if (!await changeRead(items[undo], false)) return;
            setCursor(undo);
            setLastRead(null);
          }}>Undo</button>}
          {index > 0 && <button type="button" disabled={saving} onClick={() => navigate(-1)}><span aria-hidden="true">←</span> Previous</button>}
          {card && <button className={styles.primary} type="button" disabled={saving} onClick={() => navigate(1)}>{saving ? "Saving…" : alreadyRead ? "Next" : "Mark as read"} <span aria-hidden="true">→</span></button>}
        </div>
        {error && <p role="alert">{error}</p>}
        {items.length > 0 && <progress className={styles.progress} aria-label="Digest read" value={read.length} max={items.length} />}
      </> : <div className={styles.collection}>
        {bookmarks.map(item => <article key={item.position}>
          <div className={styles.cardTop}><span>Fact {items.indexOf(item) + 1}</span>{bookmark(item.position)}</div>
          <p lang={lang}><Marked text={item.text} /></p>
        </article>)}
        {!bookmarks.length && <p>Tap the bookmark on a fact to save it here.</p>}
      </div>}
    </section>
    <aside>{archive}{lang === "hi" && quote && <blockquote className={styles.quote} lang="hi">{quote}</blockquote>}</aside>
  </div>;
}
