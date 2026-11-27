import Link from "../../../components/NavigationLink";
import { analyticsUrl, loadAnalytics } from "../data";
import { dateLabel } from "../format";
import styles from "../analytics.module.css";

export const metadata = { title: "Activity history", robots: { index: false } };

export default async function ActivityHistory({ searchParams }) {
  const d = await loadAnalytics(searchParams, "activity");
  const linkFor = (date, page) => analyticsUrl("activity", d.exam, d.stage, { date, ...(page > 1 ? { page } : {}) });
  return <div className={styles.detailPage}>
    <header className={styles.detailHeader}>
      <Link className="back" href={analyticsUrl("", d.exam, d.stage)}>Analytics</Link>
      <h1>Activity history</h1>
      <p>{d.exam} · {d.stage} · Last 30 days</p>
    </header>
    {d.activity_days.length > 0 && <nav className={styles.dateStrip} aria-label="Days with recorded activity">
      {d.activity_days.map((date) => <Link key={date} href={linkFor(date, 1)} aria-current={date === d.date ? "page" : undefined}>
        <time dateTime={date}>{dateLabel(date)}</time>
      </Link>)}
    </nav>}
    <section className={styles.panel} aria-labelledby="activity-day">
      <h2 id="activity-day">{dateLabel(d.date, { weekday: "long", day: "numeric", month: "long" })}</h2>
      {d.history.length > 0 ? <ol className={styles.history}>{d.history.map((event, i) => <li key={`${event.time}-${i}`}>
        <div><small>{event.label}</small><Link href={event.href}>{event.title}</Link>
          {(event.subject || event.detail) && <small>{[event.subject, event.detail].filter(Boolean).join(" · ")}</small>}</div>
        <time dateTime={event.time}>{dateLabel(event.time, { hour: "numeric", minute: "2-digit" })}</time>
      </li>)}</ol> : <p>No study activity recorded for this day.</p>}
      {d.pages > 1 && <nav className={styles.pagination} aria-label="Activity pages">
        {d.page > 1 && <Link href={linkFor(d.date, d.page - 1)}>← Newer</Link>}
        <span>Page {d.page} of {d.pages}</span>
        {d.page < d.pages && <Link href={linkFor(d.date, d.page + 1)}>Older →</Link>}
      </nav>}
    </section>
  </div>;
}
