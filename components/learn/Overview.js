import Link from "../NavigationLink";
import TopicSearch from "./TopicSearch";
import { minutes, shiftChance } from "./bits";
import { scopedAnalytics } from "../../lib/study-scope-paths";

const percent = (n, of) => (of ? Math.round((100 * n) / of) : 0);

/** Done and in-progress share. The same numbers are always written next to it. */
function Progress({ done, started, total, label, words }) {
  return <div className="split-meter" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}
    aria-valuetext={`${done} of ${total} ${words.done}, ${started} ${words.started}`}>
    <span className="done" style={{ width: `${total ? (100 * done) / total : 0}%` }} />
    <span className="started" style={{ width: `${total ? (100 * started) / total : 0}%` }} />
  </div>;
}

export function LearnHeading({ exam, stage, title, intro, children }) {
  return <div className="learn-head">
    <div><span className="eyebrow">SSC {exam} · {stage}</span><h1>{title}</h1>{intro && <p className="muted">{intro}</p>}</div>
    {children}
  </div>;
}

export function StudyPlanLink({ scope }) {
  if (!scope.signedIn) return null;
  return <Link className="plan-cta" href={scopedAnalytics(scope)}>
    <span><strong>Study plan</strong><small>See your next steps in Analytics</small></span><span aria-hidden="true">→</span>
  </Link>;
}

/**
 * The Learn overview of every exam and stage: this learner's progress, search and subject cards.
 * `d.kind` is "lessons" (counts skills) or "questions" (no lessons yet, so counts topics practised).
 */
export default function Overview({ d, here, title, intro, children, showHeading = true }) {
  const lessons = d.kind === "lessons";
  const unit = lessons ? "skills" : "topics";
  const words = lessons ? { done: "done", started: "in progress" } : { done: "practised", started: "started" };
  const core = d.subjects.filter((s) => !s.note);
  const sum = (key) => core.reduce((n, s) => n + s[key], 0);
  const total = sum("skills"), done = d.signedIn ? sum("covered") : 0, started = d.signedIn ? sum("inProgress") : 0;
  return <div className="learn-overview">
    {showHeading && <LearnHeading exam={d.exam} stage={d.stage} title={title} intro={intro}>
      <StudyPlanLink scope={d} />
    </LearnHeading>}

    {lessons && (d.resume || d.start || d.reviewDue !== undefined) && <div className="learn-next">
      {(d.resume || d.start) && <Link className="next-card primary" href={(d.resume || d.start).href}>
        <span className="eyebrow">{d.resume ? "Continue where you left off" : done ? "Up next" : "Start here"}</span>
        <strong>{(d.resume || d.start).title}</strong>
        {!d.resume && <small>{[d.start.subject, d.start.topic, minutes(d.start.minutes), shiftChance(d.start.probability)].filter(Boolean).join(" · ")}</small>}
        <span className="go">{(d.resume || d.start).href === "/plans/" ? "See Premium" : d.resume ? "Resume lesson" : "Open lesson"} →</span>
      </Link>}
      {d.reviewDue !== undefined && <Link className={d.reviewDue ? "next-card due" : "next-card"} href="/learn/review/">
        <span className="eyebrow">Revision</span>
        <strong>{d.reviewDue ? `${d.reviewDue >= 50 ? "50+" : d.reviewDue} skill${d.reviewDue === 1 ? "" : "s"} due` : "Nothing due today"}</strong>
        <small>{d.reviewDue ? "Recall them before they fade." : "Finished lessons come back for review after 1, 3, 7, 14 and 30 days."}</small>
        <span className="go">Open review →</span>
      </Link>}
    </div>}

    {d.signedIn ? <section className="learn-progress" aria-labelledby="progress">
      <div className="learn-progress-top"><h2 id="progress">Your {d.stage} progress</h2><strong>{percent(done, total)}%</strong></div>
      <Progress done={done} started={started} total={total} label={`${d.stage} progress`} words={words} />
      <p className="legend"><span className="key done">{done} {words.done}</span><span className="key started">{started} {words.started}</span><span className="key">{total - done - started} not started</span><span>{total} {unit} in all</span></p>
      {!lessons && <p className="muted small">A topic counts as practised after {d.practisedAfter} different questions (or all of them, if it has fewer).</p>}
    </section> : <p className="notice"><Link href={`/signin/?next=${encodeURIComponent(here)}`}>Sign in</Link> to save your progress and get your next steps.{lessons && " Lessons can be read without an account."}</p>}

    <section aria-labelledby="subjects"><div className="section-head"><h2 id="subjects">Subjects</h2></div>
      <TopicSearch items={d.catalogue} />
      <div className="grid subject-grid">{d.subjects.map((s) => <article className="link-card subject-card" data-subject={s.slug} key={s.slug}>
        <h3><Link href={s.href}>{s.title}</Link></h3>
        {s.note && <p className="muted small">{s.note}</p>}
        {d.signedIn ? <>
          <p className="subject-count"><strong>{s.covered}</strong> of {s.skills} {unit} {words.done}</p>
          <Progress done={s.covered} started={s.inProgress} total={s.skills} label={`${s.title} progress`} words={words} />
          <p className="muted small">{s.inProgress} {words.started} · {s.skills - s.covered - s.inProgress} not started</p>
        </> : <p className="muted small">{lessons ? `${s.topics} topics · ${s.skills} skills` : `${s.topics} topics · ${s.questions} questions`}</p>}
        {s.mostAsked && <p className="subject-asked small"><span>Most asked</span> {s.mostAsked}</p>}
        {s.minutes > 0 && <p className="muted small">About {minutes(s.minutes)} of study</p>}
        {lessons && s.lessons < s.skills && <p className="muted small">{s.skills - s.lessons} lessons in preparation</p>}
        <span className="go">Open →</span></article>)}</div></section>
    {children}
  </div>;
}
