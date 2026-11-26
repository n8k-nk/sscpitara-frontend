import Link from "next/link";
import { notFound } from "next/navigation";
import { metadata as pageMetadata, readCurrentAffairs } from "../../lib/public";
import { call } from "../../lib/server";
import DigestStudy from "./DigestStudy";
import styles from "./current-affairs.module.css";

export const metadata = pageMetadata("Daily current affairs in Hindi and English for SSC exams",
  "One short digest of the day's current affairs for SSC CGL, CHSL and other exams, in Hindi and English, with the last month always available.", "/current-affairs/");

const LANGS = [["en", "English"], ["hi", "हिंदी"]];
const RECENT_DAYS = 6;
const long = (iso) => new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
const formatDate = (iso, options) => new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", {
  ...options, timeZone: "Asia/Kolkata",
});

export default async function CurrentAffairs({ searchParams }) {
  const { date, lang: wanted } = await searchParams;
  const data = await readCurrentAffairs(typeof date === "string" ? date : undefined);
  if (!data) notFound();
  const lang = wanted === "hi" ? "hi" : "en";
  const textField = lang === "hi" ? "hindi" : "english";
  const { days, digest } = data;
  const reading = digest ? await call("current-affairs/reading", new URLSearchParams({ date: digest.date })) : null;
  const latest = days[0]?.date;
  const recent = days.slice(0, RECENT_DAYS);
  const selected = days.find((day) => day.date === digest?.date);
  if (selected && !recent.includes(selected)) recent[RECENT_DAYS - 1] = selected;
  const older = days.filter((day) => !recent.includes(day));
  const href = (day, language) => {
    const query = new URLSearchParams();
    if (day && day !== latest) query.set("date", day);
    if (language === "hi") query.set("lang", language);
    return query.size ? `/current-affairs/?${query}` : "/current-affairs/";
  };
  const dateLink = ({ date: day }) => (
    <Link key={day} href={href(day, lang)} aria-label={long(day)}
      aria-current={day === digest.date ? "page" : undefined}>
      <time dateTime={day}>
        <span className={styles.dateLabel}>{formatDate(day, { day: "numeric", month: "short" })}</span>
        <span className={styles.dayTile} aria-hidden="true">
          <span>{formatDate(day, { weekday: "short" })}</span>
          <strong>{Number(day.slice(-2))}</strong>
        </span>
      </time>
    </Link>
  );
  const items = digest?.items?.filter((item) => item[textField]) ?? [];

  return <div className={styles.page}>
    <header className={styles.intro}>
      <div>
        <h1>Daily Current Affairs</h1>
        {digest ? <p><time dateTime={digest.date}>{long(digest.date)}</time></p>
          : <p>Key news for SSC exams in Hindi and English.</p>}
      </div>
      {digest && <nav className={styles.languages} aria-label="Reading language">
        {LANGS.map(([key, label]) => <Link key={key} href={href(digest.date, key)} lang={key}
          aria-current={key === lang ? "page" : undefined}>{label}</Link>)}
      </nav>}
    </header>
    {!digest ? <p className="empty">No digests yet. Check back shortly.</p> : <DigestStudy key={`${digest.date}-${lang}`} date={digest.date}
      lang={lang} quote={digest.quote} items={items.map((item) => ({ id: item.id, position: item.position, text: item[textField] }))}
      accountReads={reading?.ok ? reading.data.read : null}
      archive={
      <nav className={styles.archive} aria-label="Digest dates">
        <h2>
          <span className={styles.archiveTitle}>Browse digests</span>
          <span className={styles.monthTitle}>{formatDate(digest.date, { month: "long", year: "numeric" })}</span>
        </h2>
        <div className={`${styles.dates} ${styles.recent}`}>{recent.map(dateLink)}</div>
        {older.length > 0 && <details key={digest.date} className={styles.older}>
          <summary>Older digests</summary>
          <div className={styles.dates}>{older.map(dateLink)}</div>
        </details>}
      </nav>
      } />}
  </div>;
}
