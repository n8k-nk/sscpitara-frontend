"use client";

import Link from "next/link";
import { useState } from "react";
import { amount, dateLabel } from "./format";
import styles from "./analytics.module.css";

const series = [
  ["answers", "PYQ answers", "PYQ answer"], ["views", "PYQ views", "PYQ view"],
  ["sets", "Practice sets", "practice set"], ["lessons", "Lessons", "lesson"],
  ["mocks", "Timed mocks", "timed mock"], ["facts", "Current affairs", "fact"],
  ["games", "Games", "game"],
];
const emptyActions = [
  ["answers", "Answer a PYQ", "Get started with a question from your exam."],
  ["sets", "Complete a practice set", "Finish a short set to add it to your activity."],
  ["facts", "Read current affairs", "Mark facts as read to see them here."],
];

function total(row) {
  return series.reduce((sum, [key]) => sum + row[key], 0);
}

function ChartDates({ rows, dates }) {
  const mid = Math.floor((rows.length - 1) / 2);
  return <div className={styles.axisDates} aria-hidden="true">
    <span>{dateLabel(dates(rows[0]))}</span>
    {rows.length >= 5 && <span>{dateLabel(dates(rows[mid]))}</span>}
    {rows.length > 1 && <span>{dateLabel(dates(rows.at(-1)))}</span>}
  </div>;
}

export function ActivityChart({ daily, historyHref, actionLinks }) {
  const [range, setRange] = useState(30);
  const [metric, setMetric] = useState("all");
  const [chosen, setChosen] = useState(null);
  const rows = daily.slice(-range);
  const activeDays = daily.filter(total).length;
  const activeSeries = series.filter(([key]) => daily.some((row) => row[key]));
  const value = metric === "all" ? total : (row) => row[metric];
  const selected = rows.find((row) => row.date === chosen) ?? rows.findLast((row) => value(row)) ?? rows.at(-1);
  const metricLabel = activeSeries.find(([key]) => key === metric)?.[1] ?? "Recorded actions";
  const step = Math.max(1, Math.ceil(Math.max(...rows.map(value)) / 3));
  const max = 3 * step;
  const missing = emptyActions.filter(([key]) => actionLinks[key] && !activeSeries.some(([active]) => key === active));

  return <section className={styles.panel} aria-labelledby="activity-title">
    <header className={styles.panelHead}>
      <div><h2 id="activity-title">Study activity</h2>
        <p>{activeDays ? `${activeDays} active ${activeDays === 1 ? "day" : "days"} in the last 30 days` : "Your last 30 days of study"}</p></div>
      <Link className={styles.textLink} href={historyHref}>View activity history <span aria-hidden="true">↗</span></Link>
    </header>
    {activeDays > 0 ? <>
      <div className={styles.chartControls}>
        <label className={styles.metricPicker}><span>Show</span>
          <select aria-label="Activity type" value={metric} onChange={(event) => { setMetric(event.target.value); setChosen(null); }}>
            <option value="all">All activity</option>
            {activeSeries.map(([key, label]) => <option value={key} key={key}>{label}</option>)}
          </select>
        </label>
        <div className={styles.segmented} role="group" aria-label="Activity date range">
          {[7, 30].map((days) => <button type="button" key={days} aria-pressed={range === days} onClick={() => { setRange(days); setChosen(null); }}>{days} days</button>)}
        </div>
      </div>
      <figure className={styles.figure} aria-label={`${metricLabel} over ${range} days`}>
        <div className={styles.chart} style={{ "--columns": rows.length }}>
          <div className={styles.gridLines} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => <div key={i} style={{ bottom: `${i / 3 * 100}%` }}><span>{amount(i * step)}</span></div>)}
          </div>
          {rows.map((row) => <button key={row.date} className={styles.barTarget} type="button"
            aria-pressed={row.date === selected.date}
            aria-label={`${dateLabel(row.date)} · ${amount(value(row))} ${metricLabel.toLowerCase()}`}
            onClick={() => setChosen(row.date)}>
            <span className={styles.activityBar} style={{ height: `${value(row) / max * 100}%` }} />
          </button>)}
        </div>
        <ChartDates rows={rows} dates={(row) => row.date} />
        <figcaption className={styles.chartCaption} aria-live="polite">
          <strong>{dateLabel(selected.date, { weekday: "short", day: "numeric", month: "short" })}</strong>
          <span>{value(selected) ? `${amount(value(selected))} ${metric === "all" && value(selected) === 1 ? "recorded action" : metricLabel.toLowerCase()}` : "No recorded activity for this selection"}</span>
          {metric === "all" && series.filter(([key]) => selected[key]).map(([key, , singular]) =>
            <span className={styles.countChip} key={key}>{amount(selected[key])} {singular}{selected[key] === 1 ? "" : "s"}</span>)}
          {total(selected) > 0 && <Link className={styles.textLink} href={`${historyHref}&date=${selected.date}`}>View day <span aria-hidden="true">↗</span></Link>}
        </figcaption>
      </figure>
    </> : <div className={styles.emptyChart}>
      <div className={styles.emptyBars} aria-hidden="true">{Array.from({ length: 15 }, (_, i) => <span key={i} />)}</div>
      <strong>Your study activity will appear here</strong>
      <p>Start with a PYQ or read a current-affairs fact to put your first day on the chart.</p>
    </div>}
    {missing.length > 0 && <ul className={styles.activityActions}>{missing.map(([key, label, hint]) => <li key={key}>
      <Link href={actionLinks[key]}>{label} <span aria-hidden="true">→</span></Link><small>{hint}</small>
    </li>)}</ul>}
  </section>;
}

export function MockChart({ mocks, startHref }) {
  const [chosen, setChosen] = useState(null);
  const rows = [...mocks].reverse();
  const selected = rows.find((row) => row.id === chosen) ?? rows.at(-1);
  if (!selected) return <section className={styles.panel} aria-labelledby="mock-title">
    <header className={styles.panelHead}><div><h2 id="mock-title">Timed mock marks</h2><p>See your net marks from each completed mock.</p></div></header>
    <div className={styles.mockEmpty}>
      <strong>Plot your first score</strong>
      <p>Finish a timed mock to add your marks to the chart.</p>
      <Link href={startHref} className={styles.textLink}>Explore mock papers <span aria-hidden="true">→</span></Link>
    </div>
  </section>;

  const scores = rows.map((row) => Number(row.score));
  const upper = Math.max(1, Math.ceil(Math.max(...scores)));
  const lower = Math.min(0, Math.floor(Math.min(...scores)));
  const y = (marks) => (marks - lower) / (upper - lower) * 100;
  const ticks = lower < 0 ? [lower, 0, upper] : [0, upper / 2, upper];
  return <section className={styles.panel} aria-labelledby="mock-title">
    <header className={styles.panelHead}>
      <div><h2 id="mock-title">Timed mock marks</h2><p>Net marks from your last {rows.length} completed {rows.length === 1 ? "mock" : "mocks"}</p></div>
      <div className={styles.score}><strong>{amount(selected.score)}</strong><span> / {amount(selected.max_marks)} marks</span></div>
    </header>
    <figure className={styles.figure} aria-label="Net marks for completed timed mocks">
      <div className={`${styles.chart} ${styles.mockChart}`} style={{ "--columns": rows.length }}>
        <div className={styles.gridLines} aria-hidden="true">
          {ticks.map((mark) => <div key={mark} style={{ bottom: `${y(mark)}%` }}><span>{amount(mark)}</span></div>)}
        </div>
        {rows.map((row) => {
          const score = Number(row.score);
          return <button key={row.id} type="button" className={styles.barTarget} aria-pressed={row.id === selected.id}
            aria-label={`${row.title} · ${amount(row.score)} of ${amount(row.max_marks)} marks`} onClick={() => setChosen(row.id)}>
            <span className={styles.markBar} data-negative={score < 0} style={{
              bottom: `${y(Math.min(score, 0))}%`, height: `${Math.abs(y(score) - y(0))}%`,
            }} />
          </button>;
        })}
      </div>
      {rows.length > 1 && <div className={styles.axisDates} aria-hidden="true"><span>Oldest</span><span>Latest</span></div>}
      <figcaption className={styles.chartCaption} aria-live="polite">
        <div><strong>{selected.title}</strong>
          <small>{dateLabel(selected.finished)} · {selected.answered}/{selected.questions} answered</small></div>
        <Link href={`/study/attempt/${selected.id}/results/`} className={styles.textLink}>View result <span aria-hidden="true">↗</span></Link>
      </figcaption>
    </figure>
  </section>;
}
