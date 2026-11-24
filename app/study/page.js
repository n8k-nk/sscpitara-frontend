import Link from "next/link";
import Start from "../../components/Start";
import Resume from "../../components/Resume";
import { need } from "../../lib/server";

export const metadata = { title: "Today", robots: { index: false } };

const Task = ({ icon, accent, title, children, action }) => <article className={`task${accent ? " accent" : ""}`}>
  <div><h2>{title}</h2><p>{children}</p></div>{action}</article>;

export default async function Today() {
  const d = await need("study/today", "/study/");
  return <>
    <div className="profile-head">
      <div>
        <span className="eyebrow">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })}</span>
        <h1>Today</h1>
        {!d.other_target && <p className="muted">{d.minutes} minutes a day for SSC CGL (Combined Graduate Level) practice. <Link href="/onboarding/">Change time</Link></p>}
      </div>
      <div className="actions"><Link className="button secondary" href="/account/">See my exam matches and next steps</Link></div>
    </div>
    <Resume active={d.active} />
    <div className="task-list">
      {!d.profile && <Task accent icon="✦" title="Set up your profile" action={<Link className="button" href="/onboarding/">Choose your exams and daily study time</Link>}>Tell us your education, age and daily study time to get exam matches.</Task>}
      {d.other_target ? <Task icon="◎" title="Your selected exams" action={<Link className="button secondary" href="/exams/">Browse your exams</Link>}>Your selected exams are in the directory. Guided practice currently covers CGL Tier I.</Task> : <>
        {!d.completed && d.diagnostic_ready && <Task accent icon="◎" title="Find your starting point" action={<Start kind="diagnostic" token={d.key} label="Start free diagnostic" />}>Sample five questions from each CGL subject. You can pause and return.</Task>}
        {d.review_limit > 0 && <Task icon="↺" title="Due for revision" action={<Start kind="revision" token={d.key} limit={d.review_limit} label="Start revision" />}>Revisit up to {d.review_limit} previously missed questions.</Task>}
        {d.topic && <Task icon="✎" title={d.topic} action={<Start kind="topic" token={d.key} topic={d.topic} limit={d.limit} label="Practise this topic" />}>{d.weak ? "Your first-attempt results suggest practising this topic." : "Start here to build your topic history."} Practise up to {d.limit} questions within your time budget.</Task>}
      </>}
      <Task icon="▤" title="Lessons" action={<Link className="button secondary" href="/learn/">Open the CGL course</Link>}>Follow the CGL path: free videos from several teachers and notes, topic by topic. Tick off what you already know.</Task>
    </div>
  </>;
}
