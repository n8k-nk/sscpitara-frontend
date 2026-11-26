import Link from "next/link";
import SignOut from "../../components/SignOut";
import styles from "./account.module.css";
import { need, session, money } from "../../lib/server";

export const metadata = { title: "My SSC profile", robots: { index: false } };

const BADGE = { match: ["ok", "Likely match"], review: ["warn", "Check conditions"] };

function Details({ data }) {
  return <details className="disclosure">
    <summary>Timeline, stages and jobs</summary>
    <div>
      <dl className="facts">
        <dt>Education</dt><dd>{data.qualification}</dd>
        <dt>General age bands</dt><dd>{data.ages.map(([min, max]) => `${min}–${max}`).join(", ") || "See vacancy notice"}</dd>
      </dl>
      <p>{data.checks}</p>
      <h3>Timeline</h3><p>{data.timeline}</p>
      <div className="actions"><a href={data.notice_url}>SSC notice</a><a href={data.calendar_url}>SSC calendar</a>{data.schedule_url && <a href={data.schedule_url}>Schedule update</a>}</div>
      <h3>Selection stages</h3>
      <ol className="steps">{data.stages.map((stage) => <li key={stage}>{stage}</li>)}</ol>
      <h3>Example jobs</h3>
      <p className="muted">Starting basic pay per month under the 7th Central Pay Commission (CPC).</p>
      <ul className="job-list">{data.posts.map((post, i) => <li key={i}><strong>{post.title}</strong>
        <span>{post.department}{post.group !== "Varies" && ` · Group ${post.group}`}</span>
        <span>{post.level ? `Pay Level ${post.level} · ${money(post.basic_pay)}` : "Pay varies by vacancy. See SSC notice."}</span></li>)}</ul>
    </div>
  </details>;
}

const FIT = new Set(["match", "review", "age_review"]);

function ExamCard({ row, target }) {
  const [tone, label] = BADGE[row.status] ?? ["off", "Not a match right now"];
  return <section id={`exam-${row.id}`} className={`match-card ${row.status}`}>
    <div className="card-top"><h2>{row.code} <small>{row.title}</small></h2><span className={`badge ${tone}`}>{label}</span></div>
    <p className="reason">{row.reason}</p>
    {row.history && <p className="muted">{row.history.outcome_label}{row.history.stage && ` · ${row.history.stage}`}</p>}
    {(row.recommended || row.history) && <p className="next">{row.next_step}</p>}
    {(target || FIT.has(row.status)) && <Details data={row.guidance} />}
  </section>;
}

export default async function Account() {
  const [profile, user] = await Promise.all([need("profile", "/account/"), session()]);
  const { values, options } = profile;
  const label = field => options[field].find(option => option.value === values[field])?.label;
  const targets = options.exams.filter(exam => values.target_exams.includes(exam.id));
  const edit = section => user.profileComplete ? `/onboarding/?edit=${section}` : "/onboarding/";
  const name = values.display_name || user.username;
  return <div className={styles.account}>
    <header className={styles.hero}>
      <div className={styles.avatar} aria-hidden="true">{name?.trim().slice(0, 1).toUpperCase() || "?"}</div>
      <div><h1>My SSC profile</h1><p>{name}</p></div>
      {!user.profileComplete && <Link className="button" href="/onboarding/">Complete your profile</Link>}
    </header>

    <div className={styles.grid}>
      <section className={styles.card} aria-labelledby="details-title">
        <h2 id="details-title">Profile details</h2>
        <dl>
          <div><dt>Display name</dt><dd>{name}</dd></div>
          <div><dt>Age</dt><dd>{values.age ? `${values.age} years` : "—"}</dd></div>
          <div><dt>Education</dt><dd>{label("education") || "—"}</dd></div>
          <div><dt>Age relaxation</dt><dd>{label("age_relaxation") || "—"}</dd></div>
        </dl>
        <div className={styles.links}>
          <Link href={edit("details")}>Edit details and results</Link>
          <Link href={edit("age")}>Edit age</Link>
          <Link href={edit("education")}>Edit education</Link>
        </div>
      </section>

      <section className={styles.card} aria-labelledby="exam-title">
        <h2 id="exam-title">Exams and preparation</h2>
        <dl>
          <div><dt>Target exams</dt><dd>{targets.length ? targets.map(exam => exam.code).join(", ") : "No exam selected"}</dd></div>
          <div><dt>Study language</dt><dd>{label("language") || "—"}</dd></div>
          <div><dt>Daily study time</dt><dd>{values.daily_minutes ? `${values.daily_minutes} minutes` : "—"}</dd></div>
        </dl>
        <div className={styles.links}>
          <Link href={edit("exams")}>Edit exams and language</Link>
          <Link href={edit("preparation")}>Edit study preferences</Link>
        </div>
      </section>

      <section className={`${styles.card} ${styles.security}`} aria-labelledby="security-title">
        <h2 id="security-title">Account settings</h2>
        <div className={styles.links}><Link href="/account/recovery/">Recovery email</Link><SignOut /></div>
      </section>
    </div>
    {user.profileComplete && <Matches />}
  </div>;
}

async function Matches() {
  const { rows, targets, suggestion, suggest_practice: practice } = await need("matches", "/account/");
  const picked = rows.filter((row) => targets.includes(row.id));
  const others = rows.filter((row) => !targets.includes(row.id));
  const fit = others.filter((row) => FIT.has(row.status));
  const unfit = others.filter((row) => !FIT.has(row.status));
  return <>
    <div className="section-head"><h2>Exam matches</h2></div>
    <section className="match-summary">
      <h2>What to prepare for next</h2>
      {suggestion ? <>
        <h3><a href={`#exam-${suggestion.id}`}>{suggestion.code} · {suggestion.title}</a></h3>
        <p>{suggestion.next_step}</p>
        {practice && <Link className="primary-link arrow" href="/study/practice/">Browse free SSC CGL mock tests</Link>}
      </> : <p>No next exam stands out from the current profile. Review the requirements below or update your profile.</p>}
    </section>
    <div className="notice"><p>Matches are an initial screen. Check the current SSC notice for the exact vacancy, nationality, proof of qualifications, age cutoff and application window.</p></div>

    {picked.length > 0 && <section className="match-group">
      <div className="section-head"><h2>Your target exams</h2><Link href="/onboarding/?edit=exams">Change</Link></div>
      <div className="match-list">{picked.map((row) => <ExamCard key={row.id} row={row} target />)}</div>
    </section>}

    {fit.length > 0 && (picked.length > 0
      ? <details className="panel match-more"><summary>Other exams you may qualify for ({fit.length})</summary>
          <div className="panel-body"><div className="match-list">{fit.map((row) => <ExamCard key={row.id} row={row} />)}</div></div></details>
      : <section className="match-group"><div className="section-head"><h2>Exams you may qualify for</h2></div>
          <div className="match-list">{fit.map((row) => <ExamCard key={row.id} row={row} />)}</div></section>)}

    {picked.length === 0 && fit.length === 0 && <p className="empty">None of the listed exams fit your current profile. Check your age and education in <Link href="/onboarding/">your profile</Link>.</p>}

    {unfit.length > 0 && <details className="disclosure"><summary>Not a match right now ({unfit.length})</summary>
      <ul className="rows">{unfit.map((row) => <li key={row.id}><span><strong>{row.code}</strong> · {row.title}</span><span className="muted">{row.reason}</span></li>)}</ul></details>}
  </>;
}
