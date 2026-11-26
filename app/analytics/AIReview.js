"use client";

import Link from "next/link";
import { useState } from "react";
import { send } from "../../lib/client";
import styles from "./analytics.module.css";

function Topics({ title, tone, rows }) {
  if (!rows.length) return null;
  return <div className={styles.aiGroup}><h3>{title}</h3><ul>{rows.map((t) => <li key={t.href} data-tone={tone}>
    <div><Link href={t.href}>{t.topic}</Link><span>{t.correct} of {t.answered} · {t.percent}%</span></div><p>{t.note}</p></li>)}</ul></div>;
}

export default function AIReview({ exam, stage }) {
  const [review, setReview] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setPending(true);
    setError("");
    const response = await send("study/analytics/review", { exam, stage, consent: true });
    setPending(false);
    if (response.ok) setReview(response.data);
    else setError(response.data.error ?? "Could not generate a review. Try again.");
  }

  const basis = review?.basis;
  return <section className={`${styles.panel} ${styles.aiPanel}`} aria-labelledby="ai-review-title">
    <header className={styles.panelHead}>
      <div>
        <h2 id="ai-review-title">AI study coach</h2>
        <p>Reads what you finished and answered, then plans your next three days.</p>
      </div>
      {!review && <button type="button" onClick={generate} disabled={pending} aria-describedby="ai-review-data">
        {pending ? "Reading your progress…" : "Review my progress"}
      </button>}
    </header>
    {!review && <small id="ai-review-data" className={styles.aiNotice}>
      Requesting a review shares your study summary (lessons, topic results and mock marks, not your name) with Coarena, which stores requests and responses.
    </small>}
    {pending && <p className={styles.aiNotice} role="status">This takes a few seconds…</p>}
    {error && <p className="errorlist" role="alert">{error}</p>}
    {review && <div className={styles.aiResult} role="status">
      <p className={styles.aiHeadline}>{review.headline}</p>
      {review.progress && <p>{review.progress}</p>}
      <p className={styles.aiBasis}>Based on {basis.lessonsFinished} finished lesson{basis.lessonsFinished === 1 ? "" : "s"}, {basis.firstAnswers} first answers and {basis.mocks} mock{basis.mocks === 1 ? "" : "s"}.
        Topics are judged only after {review.minAnswers} answers.</p>
      <div className={styles.aiColumns}>
        <Topics title="Going well" tone="ok" rows={review.strengths} />
        <Topics title="Needs work" tone="gap" rows={review.gaps} />
      </div>
      <div className={styles.aiDays}>{review.days.map((d) => <div key={d.day}>
        <h3>{d.day === 1 ? "Today" : d.day === 2 ? "Tomorrow" : "Day after"}</h3>
        <ul>{d.actions.map((a) => <li key={a.href}><Link href={a.href}><strong>{a.title}</strong><span>{a.minutes} min ›</span></Link><p>{a.reason}</p></li>)}</ul>
      </div>)}</div>
      {review.tip && <p className={styles.aiTip}><strong>This week:</strong> {review.tip}</p>}
      <p className={styles.aiBasis}>Written by AI from your study data. The counts and links come from the app.</p>
    </div>}
  </section>;
}
