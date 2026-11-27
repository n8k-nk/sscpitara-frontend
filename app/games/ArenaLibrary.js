"use client";

import Link from "../../components/NavigationLink";
import { useState } from "react";
import { games, gamesFor, gameHref, arenaQuery } from "./catalog";
import styles from "./arena.module.css";

const subjects = [...new Set(games.map(({ subject }) => subject))];

export default function ArenaLibrary({ options, selected, initialExam, initialStage }) {
  const [exam, setExam] = useState(initialExam);
  const [stage, setStage] = useState(initialStage);
  const [subject, setSubject] = useState("");
  const profile = options.find(({ code }) => code === exam);
  const available = gamesFor(exam, stage);
  const visible = available.filter((game) => !subject || game.subject === subject);
  const groups = [...new Set(options.map(({ category }) => category))];

  function filterExam(nextExam, nextStage = "") {
    setExam(nextExam);
    setStage(nextStage);
    setSubject("");
    window.history.replaceState(null, "", `/games/${arenaQuery(nextExam, nextStage)}`);
  }

  return <>
    <section id="arena-games" className={styles.shelf} aria-labelledby="arena-title">
      <div className={styles.shelfHead}>
        <div className={styles.subjects} role="group" aria-label="Filter by subject">
          <button type="button" aria-pressed={!subject} onClick={() => setSubject("")}>All games</button>
          {subjects.filter((item) => available.some((game) => game.subject === item)).map((item) =>
            <button key={item} type="button" aria-pressed={subject === item} onClick={() => setSubject(item)}>{item}</button>)}
        </div>
        <div className={styles.examFilters}>
          {selected && !exam && options.some(({ code }) => selected.exam === code) && <button className={styles.filterShortcut} type="button"
            onClick={() => filterExam(selected.exam, selected.stage)}>{selected.exam} · {selected.stage}</button>}
          <label className={styles.select}><span className="sr-only">Filter by exam</span>
            <select value={exam} onChange={(event) => filterExam(event.target.value)}>
              <option value="">All SSC exams</option>
              {groups.map((group) => <optgroup key={group} label={group}>
                {options.filter(({ category }) => category === group).map(({ code }) => <option key={code} value={code}>{code}</option>)}
              </optgroup>)}
            </select>
          </label>
          {!!profile?.stages.length && <label className={styles.select}><span className="sr-only">Filter by stage</span>
            <select value={stage} onChange={(event) => filterExam(exam, event.target.value)}>
              <option value="">All stages</option>
              {profile.stages.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>}
        </div>
      </div>
      <p className="sr-only" role="status">{visible.length} games shown</p>
      {visible.length ? <div className={styles.games}>
        {visible.map((game) => <article key={game.id} className={styles.tile} data-tone={game.color}>
          <Link className={styles.tileLink} href={gameHref(game, exam, stage)} prefetch={false} aria-labelledby={`game-${game.id}`}>
            <span className={styles.preview} aria-hidden="true">{game.sample}</span>
            <span className={styles.gameMark} aria-hidden="true">{game.mark}</span>
            <div className={styles.tileBody}>
              <h2 id={`game-${game.id}`}>{game.name}</h2>
              <p>{game.trains}</p>
              <p className={styles.tileMeta}>{game.subject} · 30 levels</p>
            </div>
            <span className={styles.tileAction} aria-hidden="true">Play</span>
          </Link>
        </article>)}
      </div> : <div className={styles.empty}>
        <h3>No matched drills for {exam}{stage && ` · ${stage}`}</h3>
        <p>Pick another stage or see the full game library.</p>
        <button className={styles.outline} type="button" onClick={() => filterExam("")}>Show all games</button>
      </div>}
    </section>
  </>;
}
