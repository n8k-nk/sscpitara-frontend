"use client";

import Link from "../../../components/NavigationLink";
import { useEffect, useState } from "react";
import { levelHref, withGuestProgress } from "../progress";
import styles from "../arena.module.css";

function bandsOf(levels) {
  const bands = [];
  for (const level of levels) {
    const last = bands.at(-1);
    if (!last || last.name !== level.band) bands.push({ name: level.band, levels: [level] });
    else last.levels.push(level);
  }
  return bands;
}

export default function ArenaLevels({ game, back, mapHref, signedIn }) {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    fetch(`/api/learn/games/${game.id}/levels/`, { cache: "no-store" })
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!live) return;
        if (!ok || !data.levels?.length) throw new Error();
        setProgress(withGuestProgress(data));
      })
      .catch(() => { if (live) setError("Couldn’t load the levels. Try again."); });
    return () => { live = false; };
  }, [game.id]);

  const authed = progress ? progress.authenticated : signedIn;
  const current = progress?.levels.find((level) => level.level === progress.current);
  const signIn = `/signin/?next=${encodeURIComponent(mapHref || `/games/${game.id}/`)}`;

  return <div className={`${styles.round} ${styles.levelMap}`} data-tone={game.color}>
    <div className={styles.levelSide}>
    <Link className={styles.back} href={back}>Game library</Link>
    <header className={styles.roundHeader}>
      <span className={styles.gameMark} aria-hidden="true">{game.mark}</span>
      <div><h1>{game.name}</h1><p>{game.subject} · 30 levels</p></div>
    </header>

    {!progress && !error && <div className={styles.console}><div className={styles.pending}><p role="status">Loading levels…</p></div></div>}
    {error && <div className={styles.console}><p className={styles.error} role="alert">{error}</p>
      <button className={styles.primary} type="button" onClick={() => window.location.reload()}>Try again</button></div>}

    {progress && <section className={styles.console} aria-labelledby="level-now">
        <div className={styles.levelHero}>
          <div>
            <span className={styles.roundFormat}>{progress.complete ? "All 30 levels cleared" : `Level ${progress.current} of 30`}</span>
            <h2 id="level-now">{current?.name}</h2>
            <p>{progress.complete ? "You can replay any level." : current?.blurb}</p>
          </div>
          <Link className={styles.primary} href={levelHref(mapHref, progress.current)}>
            {progress.complete ? "Replay level 30" : "Continue"}
          </Link>
        </div>
        <div className={styles.levelProgress}>
          <div className={styles.meter} role="progressbar" aria-valuemin={0} aria-valuemax={30} aria-valuenow={progress.cleared} aria-label="Levels cleared">
            <span style={{ width: `${(progress.cleared / 30) * 100}%` }} />
          </div>
          <p>{progress.cleared} of 30 cleared · 6 of 8 correct unlocks the next level in each part</p>
        </div>
      </section>}
    </div>

    {progress && <div className={styles.levelMain}>
      <div className={styles.levelBoard}>
        {bandsOf(progress.levels).map((band) => <section key={band.name} className={styles.levelBand} aria-labelledby={`band-${band.name.replaceAll(" ", "-")}`}>
          <div className={styles.bandHead}>
            <h2 id={`band-${band.name.replaceAll(" ", "-")}`}>{band.name}</h2>
            <span>{band.levels.filter((level) => level.status === "cleared").length} / {band.levels.length}</span>
          </div>
          <div className={styles.levelGrid}>
            {band.levels.map((level) => {
              const body = <>
                <span className={styles.levelNum}>{level.level}</span>
                <span className={styles.levelMark}>{level.status === "cleared" ? "Cleared" : level.status === "current" ? (level.level === progress.current ? "Now" : "Open") : "Locked"}</span>
                <span className={styles.levelName}>{level.name}</span>
              </>;
              return level.status === "locked"
                ? <span key={level.level} className={styles.levelNode} data-status="locked" aria-disabled="true">{body}</span>
                : <Link key={level.level} className={styles.levelNode} data-status={level.status} href={levelHref(mapHref, level.level)}
                  aria-current={level.level === progress.current && level.status === "current" ? "step" : undefined} prefetch={false}>{body}</Link>;
            })}
          </div>
        </section>)}
      </div>
      {!authed && <p className={styles.levelNote}>Guest progress is saved in this browser. <Link href={signIn}>Sign in</Link> to save future rounds to your account.</p>}
    </div>}
  </div>;
}
