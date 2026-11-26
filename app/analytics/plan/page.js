import Link from "next/link";
import { analyticsUrl, loadAnalytics } from "../data";
import { dateLabel } from "../format";
import styles from "../analytics.module.css";

export const metadata = { title: "Study plan", robots: { index: false } };

export default async function StudyPlan({ searchParams }) {
  const d = await loadAnalytics(searchParams, "plan");
  return <div className={styles.detailPage}>
    <header className={styles.detailHeader}>
      <Link className="back" href={analyticsUrl("", d.exam, d.stage)}>Analytics</Link>
      <h1>Study plan</h1>
      <p>{d.exam} · {d.stage} · {d.minutes} minutes available per day</p>
      {d.plan_days.length > 1 && <p>Upcoming blocks adjust as you study. Pick any block that fits your time.</p>}
    </header>
    <div className={styles.planTimeline}>
      {d.plan_days.map(({ date, tasks }, i) => <section key={date} className={styles.planDay} data-today={i === 0} aria-labelledby={`plan-${date}`}>
        <header className={styles.timelineDate}>
          <h2 id={`plan-${date}`}>{i === 0 ? "Today" : dateLabel(date, { weekday: "long" })}</h2>
          <time dateTime={date}>{dateLabel(date)}</time>
        </header>
        {tasks.length > 0 ? <ul className={styles.taskList}>{tasks.map((task) => <li key={task.practice_href ?? task.href}>
          <div><Link href={task.href}>{task.title}</Link><small>{task.reason}</small>
            {task.practice_href && <Link className={styles.taskPractice} href={task.practice_href}>Practise PYQs</Link>}</div>
          <span>{task.minutes} min</span>
        </li>)}</ul> : <p className={styles.noDay}>No study blocks suggested. <Link href={`/pyq/${d.exam_slug}/`}>Browse PYQs</Link></p>}
      </section>)}
    </div>
  </div>;
}
