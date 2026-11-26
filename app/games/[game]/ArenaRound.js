"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { send } from "../../../lib/client";
import { levelHref, nextPlayableLevel, rememberGuestLevel, withGuestProgress } from "../progress";
import styles from "../arena.module.css";

function longestStreak(items) {
  let streak = 0;
  let best = 0;
  for (const item of items) {
    streak = item.correct ? streak + 1 : 0;
    best = Math.max(best, streak);
  }
  return best;
}

function deviceBest(key, result) {
  try {
    const prior = window.localStorage.getItem(key);
    const best = Math.max(Number(prior) || 0, result.score);
    window.localStorage.setItem(key, String(best));
    return { best, record: prior !== null && result.score > Number(prior) };
  } catch {
    return {};
  }
}

function resultLabel(result) {
  if (!result.level) return result.record ? "New personal best" : "Round complete";
  if (result.passed && result.complete) return "All 30 levels cleared";
  if (result.passed) return "Level cleared";
  return "Not cleared yet";
}

export default function ArenaRound({ game, back, practice, level }) {
  const [timed, setTimed] = useState(true);
  const [numeric, setNumeric] = useState(false);
  const [round, setRound] = useState(null);
  const [result, setResult] = useState(null);
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(0);
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState("ready");
  const [error, setError] = useState("");
  const [gate, setGate] = useState(level ? "checking" : "open");
  const [levels, setLevels] = useState(null);
  const answers = useRef([]);
  const startsPart = useRef(false);
  const locked = useRef(false);
  const deadline = useRef(0);
  const question = useRef(null);
  const numberInput = useRef(null);
  const resultHeading = useRef(null);
  const nextAction = useRef(null);

  async function start() {
    if (gate === "locked") return;
    setPhase("loading");
    setError("");
    try {
      const mode = numeric ? "numeric" : "mcq";
      const params = new URLSearchParams({ mode });
      if (level) params.set("level", String(level));
      else params.set("format", "quick");
      const response = await fetch(`/api/learn/games/${game.id}/new/?${params}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.token || !data.items?.length) throw new Error(data.error || "fail");
      answers.current = [];
      locked.current = false;
      deadline.current = performance.now() + data.seconds * 1000;
      setIndex(0);
      setLeft(data.seconds);
      setValue("");
      setResult(null);
      setRound(data);
      setPhase("playing");
    } catch (err) {
      setError(err?.message && err.message !== "fail" ? err.message : "Couldn’t start the round. Try again.");
      setPhase(result ? "finished" : round ? "expired" : "ready");
    }
  }

  const finish = useCallback(async () => {
    if (locked.current) return;
    locked.current = true;
    setPhase("scoring");
    setError("");
    const { data, ok, status } = await send(`learn/games/${game.id}/submit`, { token: round.token, timed, answers: answers.current });
    if (!ok) {
      setError(data.error ?? "Couldn’t score the round. Try again.");
      locked.current = false;
      setPhase(status === 400 ? "expired" : "retry");
      return;
    }
    if (data.level && !data.recorded) {
      const cleared = rememberGuestLevel(game.id, data.level, data, startsPart.current);
      if (cleared.length === 30) data.complete = true;
    }
    const personal = data.recorded ? {} : deviceBest(`ssc-arena:${game.id}:${level || timed}:${round.mode}`, data);
    setResult({ ...data, ...personal });
    setRound(null);
    setPhase("finished");
  }, [game.id, level, round, timed]);

  const answer = useCallback((choice) => {
    if (phase !== "playing" || locked.current || answers.current.length !== index) return;
    if (timed && performance.now() >= deadline.current) {
      finish();
      return;
    }
    answers.current.push({ i: index, value: choice });
    if (answers.current.length >= round.items.length) {
      finish();
      return;
    }
    setIndex(index + 1);
    setValue("");
  }, [finish, index, phase, round, timed]);

  const item = round?.items[index];

  useEffect(() => {
    if (!timed || phase !== "playing") return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline.current - performance.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) finish();
    };
    const id = window.setInterval(tick, 200);
    tick();
    return () => window.clearInterval(id);
  }, [finish, phase, timed]);

  useEffect(() => {
    if (phase !== "playing") return;
    (numberInput.current ?? question.current)?.focus({ preventScroll: true });
  }, [index, phase]);

  useEffect(() => {
    if (phase !== "finished") return;
    resultHeading.current?.focus({ preventScroll: true });
    nextAction.current?.scrollIntoView({ block: "nearest" });
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || item?.kind !== "mcq") return;
    function onKey(event) {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target.matches("input, select, textarea, [contenteditable]")) return;
      const option = item.options[Number(event.key) - 1];
      if (option !== undefined) {
        event.preventDefault();
        answer(option);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, item, phase]);

  useEffect(() => {
    if (!level) return;
    let live = true;
    fetch(`/api/learn/games/${game.id}/levels/`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!live) return;
        const view = withGuestProgress(data);
        const row = view?.levels?.find((item) => item.level === level);
        const previous = view?.levels?.find((item) => item.level === level - 1);
        startsPart.current = Boolean(row) && (!previous || previous.band !== row.band);
        setLevels(view?.levels ?? null);
        setGate(row?.status === "locked" ? "locked" : "open");
      })
      .catch(() => { if (live) setGate("open"); });
    return () => { live = false; };
  }, [game.id, level]);

  const levelInfo = levels?.find((row) => row.level === level);
  const misses = result?.results.filter((item) => !item.correct) ?? [];
  const canContinue = level && result?.passed && !result.complete;
  const nextLevel = canContinue ? nextPlayableLevel(levels, level) : null;
  const retryLabel = level ? (result?.passed ? "Replay level" : "Try again") : "Play again";

  return <div className={styles.round} data-tone={game.color}>
    <Link className={styles.back} href={back}>{level ? "All levels" : "Game library"}</Link>
    <header className={styles.roundHeader}>
      <span className={styles.gameMark} aria-hidden="true">{game.mark}</span>
      <div><h1>{game.name}</h1><p>{level ? `Level ${level}` : game.subject}</p></div>
    </header>

    <div className={styles.console}>
      {gate === "checking" && <div className={styles.pending}><p role="status">Loading this level…</p></div>}
      {gate === "locked" && <div className={styles.roundSetup}>
        <div>
          <span className={styles.roundFormat}>Locked</span>
          <h2>Clear the previous level first</h2>
          <p>Six correct answers out of eight open the next level.</p>
          <div className={styles.roundActions}><Link className={styles.primary} href={back}>Back to levels</Link></div>
        </div>
      </div>}
      {gate === "open" && !round && !result && <>
        <div className={styles.roundSetup}>
          <h2>{levelInfo?.name ?? game.play}</h2>
          <p>{levelInfo?.blurb ?? game.trains}</p>
          <span className={styles.roundFormat}>{levelInfo ? `8 questions · ${timed ? `${levelInfo.seconds}s` : "Untimed"} · 6 of 8 to clear` : `8 questions · ${timed ? "60 seconds" : "Untimed"}`}</span>
        </div>
        <div className={styles.settings}>
          <label><input type="checkbox" checked={timed} onChange={(event) => setTimed(event.target.checked)} disabled={phase === "loading"} /> Timer</label>
          {game.id === "math-sprint" && <label><input type="checkbox" checked={numeric} onChange={(event) => setNumeric(event.target.checked)} disabled={phase === "loading"} /> Type answers</label>}
          {!numeric && <span className={styles.keyHint}>Keys 1–4 also work</span>}
        </div>
        <div className={styles.roundActions}>
          <button className={styles.primary} type="button" disabled={phase === "loading"} onClick={start}>
            {phase === "loading" ? "Starting…" : level ? "Start level" : "Start round"}
          </button>
        </div>
      </>}

      {round && phase === "playing" && <>
        <div className={styles.hud}>
          <span>Question <strong>{index + 1}</strong> / {round.items.length}</span>
          {timed && <span className={styles.timer} data-low={left <= 10}>{left}s</span>}
        </div>
        <div className={styles.segments} aria-hidden="true">{round.items.map((entry) =>
          <span key={entry.i} data-done={entry.i < index} data-current={entry.i === index} />)}</div>
        <h2 className={styles.question} id="arena-question" tabIndex={-1} ref={question}>
          {game.id === "pattern-rush" ? <>
            <span className="sr-only">What comes next? {item.prompt.replaceAll(" · ", ", ")}</span>
            <span className={styles.series} aria-hidden="true">{item.prompt.split(" · ").map((part, i) =>
              <span key={i} data-missing={part === "?"}>{part}</span>)}</span>
          </> : item.prompt}
        </h2>
        {item.kind === "mcq" ? <div className={styles.answers} role="group" aria-labelledby="arena-question">
          {item.options.map((option, i) => <button type="button" onClick={() => answer(option)} key={option}>
            <span aria-hidden="true">{i + 1}</span>{option}
          </button>)}
        </div> : <form className={styles.numeric} onSubmit={(event) => { event.preventDefault(); if (value.trim()) answer(value); }}>
          <label className="sr-only" htmlFor="arena-answer">Your answer</label>
          <input id="arena-answer" ref={numberInput} aria-describedby="arena-question" type="text" autoComplete="off" maxLength={40} value={value} onChange={(event) => setValue(event.target.value)} />
          <button className={styles.primary} disabled={!value.trim()} type="submit">Next</button>
        </form>}
        <button className={styles.skip} onClick={() => answer("")} type="button">Skip</button>
      </>}

      {round && phase !== "playing" && <div className={styles.pending}>
        {phase === "scoring" && <p role="status">Scoring your round…</p>}
        {phase === "retry" && <button className={styles.primary} type="button" onClick={finish}>Retry scoring</button>}
        {phase === "expired" && <button className={styles.primary} type="button" onClick={start}>Start a new round</button>}
        {phase === "loading" && <p role="status">Starting…</p>}
      </div>}

      {result && <div className={styles.result}>
        <span className={styles.roundFormat}>{resultLabel(result)}</span>
        <h2 ref={resultHeading} tabIndex={-1}>{result.correct} <span>/ {result.total} correct</span></h2>
        {result.level && !result.passed && <p className={styles.levelOutcome}>{result.pass} of {result.total} correct clears this level.</p>}
        {canContinue ? <div className={styles.nextLevel} ref={nextAction}>
          <div><span>Up next</span>{nextLevel?.name && <strong>{nextLevel.name}</strong>}</div>
          <Link className={styles.primary} href={nextLevel ? levelHref(back, nextLevel.level) : back}>
            {nextLevel ? `Play level ${nextLevel.level}` : "Choose a level"}
          </Link>
        </div> : null}
        <div className={styles.resultStats}>
          <div><strong>{result.score}</strong><span>Points</span></div>
          <div><strong>{longestStreak(result.results)}</strong><span>Best streak</span></div>
          {result.best != null && <div><strong>{result.best}</strong><span>{result.recorded ? "Personal best" : "Best on this device"}</span></div>}
        </div>
        <div className={styles.roundActions}>
          <button className={canContinue ? styles.outline : styles.primary} type="button" onClick={start} disabled={phase === "loading"}>
            {phase === "loading" ? "Starting…" : retryLabel}
          </button>
          {level && <Link className={styles.outline} href={back}>All levels</Link>}
          {practice && <Link className={styles.outline} href={practice.href}>{practice.label}</Link>}
        </div>
        <details className={styles.review}>
          <summary>{misses.length ? `Review misses · ${misses.length}` : "Review answers"}</summary>
          <ol>
            {(misses.length ? misses : result.results).map((item) => <li key={item.i}>
              <strong>{item.prompt}</strong>
              {item.correct ? <span>Answer: {item.answer}</span> : <span>{item.choice ? `You chose ${item.choice}` : "Unanswered"} · Answer: {item.answer}</span>}
              <p>{item.solution}</p>
            </li>)}
          </ol>
        </details>
      </div>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  </div>;
}
