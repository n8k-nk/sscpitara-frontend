import Link from "next/link";
import { need, money } from "../../lib/server";

export const metadata = { title: "My SSC matches", robots: { index: false } };

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
      <p className="muted">Starting basic pay per month under the 7th CPC.</p>
      <ul className="job-list">{data.posts.map((post, i) => <li key={i}><strong>{post.title}</strong>
        <span>{post.department}{post.group !== "Varies" && ` · Group ${post.group}`}</span>
        <span>{post.level ? `Pay Level ${post.level} · ${money(post.basic_pay)}` : "Pay varies by vacancy. See SSC notice."}</span></li>)}</ul>
    </div>
  </details>;
}

export default async function Matches() {
  const { learner, rows, suggestion, suggest_practice: practice } = await need("matches", "/account/");
  return <>
    <div className="profile-head">
      <div>
        <span className="eyebrow">Your exam matches</span>
        <h1>{learner.name}’s exam matches</h1>
        <ul className="chips" aria-label="Profile summary"><li>{learner.education}</li><li>{learner.experience}</li><li>{learner.daily_minutes} min/day</li></ul>
      </div>
      <div className="actions"><Link className="button secondary" href="/onboarding/">Edit profile and results</Link><Link className="button" href="/study/">Open study plan</Link></div>
    </div>
    <section className="match-summary">
      <h2>What to prepare for next</h2>
      {suggestion ? <>
        <h3><a href={`#exam-${suggestion.id}`}>{suggestion.code} · {suggestion.title}</a></h3>
        <p>{suggestion.next_step}</p>
        {practice && <Link className="primary-link arrow" href="/study/practice/">Open free CGL Tier I practice</Link>}
      </> : <p>No next exam stands out from the current profile. Review the requirements below or update your profile.</p>}
    </section>
    <div className="notice"><p>Matches are an initial screen. Check the current SSC notice for the exact vacancy, nationality, proof of qualifications, age cutoff and application window.</p></div>
    <div className="match-list">{rows.map((row) => {
      const [tone, label] = BADGE[row.status] ?? ["off", "Outside initial screen"];
      return <section key={row.id} id={`exam-${row.id}`} className={`match-card ${row.status}`}>
        <div className="card-top"><h2>{row.code} <small>{row.title}</small></h2><span className={`badge ${tone}`}>{label}</span></div>
        <p className="reason">{row.reason}</p>
        {row.history && <p className="muted">{row.history.outcome_label}{row.history.stage && ` · ${row.history.stage}`}</p>}
        {(row.recommended || row.history) && <p className="next">{row.next_step}</p>}
        <Details data={row.guidance} />
      </section>;
    })}</div>
  </>;
}
