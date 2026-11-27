"use client";

import Link from "../../../components/NavigationLink";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { send } from "../../../lib/client";
import styles from "./mocks.module.css";

const PAGE = 20;
const label = (number) => `Mock ${String(number).padStart(2, "0")}`;
const stateOf = ({ attempt }) => (!attempt ? "new" : attempt.complete ? "done" : "active");
const FILTERS = [["all", "All"], ["new", "Not started"], ["active", "In progress"], ["done", "Completed"]];

/** First, last and the pages around the current one; null marks a gap. */
function pageNumbers(page, pages) {
  const wanted = [...new Set([1, page - 1, page, page + 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  return wanted.flatMap((n, i) => (i && n - wanted[i - 1] > 1 ? [null, n] : [n]));
}

export default function MockList({ mocks, stage, initialPage, timing }) {
  const router = useRouter();
  const keys = useRef(new Map());
  const starting = useRef(false);
  const top = useRef(null);
  const [extended, setExtended] = useState(false);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [wanted, setPage] = useState(initialPage);

  async function start(id) {
    if (starting.current) return;
    starting.current = true;
    setPending(id);
    setError(null);
    if (!keys.current.has(id)) keys.current.set(id, crypto.randomUUID());
    const { ok, data } = await send(`study/mocks/${id}/start`, { key: keys.current.get(id), extended });
    if (ok) {
      router.push(`/study/attempt/${data.attempt}/`);
    } else {
      starting.current = false;
      setPending(null);
      setError({ id, message: data.error ?? "Could not start the test." });
    }
  }

  function show(nextFilter, nextPage) {
    setFilter(nextFilter);
    setPage(nextPage);
    const url = new URL(window.location.href);
    if (nextPage > 1 && nextFilter === "all") url.searchParams.set("page", nextPage);
    else url.searchParams.delete("page");
    window.history.replaceState(null, "", url);
  }

  if (!mocks.length) return <p className="muted">No tests are available for this tier yet.</p>;
  // The newest unfinished attempt wins; otherwise the first mock never started.
  const resume = mocks.filter((mock) => stateOf(mock) === "active").sort((a, b) => b.attempt.id - a.attempt.id)[0];
  const next = resume ?? mocks.find((mock) => stateOf(mock) === "new" && !mock.locked);
  const counts = Object.fromEntries(FILTERS.map(([key]) => [key, key === "all" ? mocks.length : mocks.filter((m) => stateOf(m) === key).length]));
  const matching = filter === "all" ? mocks : mocks.filter((mock) => stateOf(mock) === filter);
  const pages = Math.max(1, Math.ceil(matching.length / PAGE));
  const page = Math.max(1, Math.min(pages, wanted));
  const turn = (number) => { show(filter, number); top.current?.scrollIntoView(); };

  return <>
    {next && <div className={styles.next}>
      <div><span>{resume ? "Unfinished test" : "Up next"}</span><strong>{label(next.number)}</strong></div>
      {resume ? <Link className="button" prefetch={false} href={`/study/attempt/${resume.attempt.id}/`}>Resume</Link>
        : <button type="button" disabled={pending !== null} onClick={() => start(next.id)}>{pending === next.id ? "Starting…" : `Start ${label(next.number)}`}</button>}
      {error?.id === next.id && <p className="errorlist" role="alert">{error.message}</p>}
    </div>}
    <header className={styles.listHead} ref={top}><h2>{stage} tests</h2><span>{mocks.length} tests</span></header>
    <label className={styles.extended}><input type="checkbox" checked={extended} disabled={pending !== null}
      onChange={(e) => setExtended(e.target.checked)} />
      <span>Use extended time<small>For candidates entitled to SSC compensatory (scribe) time: {timing.extended} minutes instead of {timing.standard}.</small></span></label>
    <div className={styles.chips} role="group" aria-label="Filter tests">{FILTERS.map(([key, name]) =>
      <button key={key} type="button" aria-pressed={filter === key} onClick={() => show(key, 1)}>{name} <small>{counts[key]}</small></button>)}</div>
    {!matching.length && <p className="muted">No tests in this group yet.</p>}
    <ol className={styles.cards}>
      {matching.slice((page - 1) * PAGE, page * PAGE).map((mock) => {
        const { id, number, attempt, locked } = mock, name = label(number), state = stateOf(mock);
        return <li key={id} data-state={state}>
          <strong>{name}</strong>
          <span className={styles.state}>{locked ? "Premium" : state === "done" ? `Score ${Number(attempt.score)}` : state === "active" ? "In progress" : "Not started"}</span>
          {error?.id === id && <p className="errorlist" role="alert">{error.message}</p>}
          <div className={styles.actions}>
            {attempt && <Link className="button secondary" prefetch={false} aria-label={`${attempt.complete ? "Results for" : "Resume"} ${name}`}
              href={`/study/attempt/${attempt.id}/${attempt.complete ? "results/" : ""}`}>{attempt.complete ? "Results" : "Resume"}</Link>}
            {state !== "active" && (locked
              ? <Link className="button ghost" prefetch={false} href="/plans/" aria-label={`${name} requires Premium`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                Premium</Link>
              : <button type="button" className={state === "done" ? "ghost" : "secondary"} disabled={pending !== null}
                aria-label={`${attempt ? "Retake" : "Start"} ${name}`} onClick={() => start(id)}>{id === pending ? "Starting…" : attempt ? "Retake" : "Start"}</button>)}
          </div>
        </li>;
      })}
    </ol>
    {pages > 1 && <nav className={styles.pager} aria-label="Mock test pages">
      <button type="button" disabled={page === 1} onClick={() => turn(page - 1)} aria-label="Previous page">‹</button>
      {pageNumbers(page, pages).map((n, i) => n === null ? <span key={`gap-${i}`}>…</span>
        : <button key={n} type="button" aria-current={n === page ? "page" : undefined} aria-label={`Page ${n}`} onClick={() => turn(n)}>{n}</button>)}
      <button type="button" disabled={page === pages} onClick={() => turn(page + 1)} aria-label="Next page">›</button>
    </nav>}
  </>;
}
