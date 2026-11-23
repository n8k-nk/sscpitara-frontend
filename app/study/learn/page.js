import Link from "next/link";
import Start from "../../../components/Start";
import { call } from "../../../lib/server";

export const metadata = { title: "Learn", robots: { index: false } };

export default async function Learn({ searchParams }) {
  const { language = "" } = await searchParams;
  const { data: d } = await call("study/learn", `language=${encodeURIComponent(language)}`);
  const signedIn = (await call("session")).data.authenticated;
  return <>
    <div className="section-head page-head">
      <div><span className="eyebrow">SSC CGL · Combined Graduate Level</span><h1>Learn</h1></div>
      <form className="select-start" method="get"><label>Language <select name="language" defaultValue={d.language}><option value="">All languages</option><option value="en">English</option><option value="hi">Hindi</option></select></label><button className="secondary">Filter lessons</button></form>
    </div>
    <div className="lessons">{d.lessons.length ? d.lessons.map((lesson) => <article className="lesson-card" key={lesson.id} lang={lesson.language}>
      <header><span className="badge">{lesson.subject}</span><span className="badge">{lesson.language.toUpperCase()}</span></header>
      <h2>{lesson.title}</h2><p className="lesson">{lesson.body}</p>
      {lesson.source_url && <p><a href={lesson.source_url}>Lesson reference</a></p>}
      {lesson.video_id && /^[A-Za-z0-9_-]{11}$/.test(lesson.video_id) && <iframe title={lesson.title} loading="lazy" src={`https://www.youtube-nocookie.com/embed/${lesson.video_id}`} allowFullScreen />}
      {signedIn ? <Start kind="topic" token={`${d.key.slice(0, 24)}${String(lesson.id).padStart(12, "0")}`} topic={lesson.topic} label="Practise this topic" /> : <Link className="button secondary" href="/signin/?next=/study/learn/">Sign in to practise this topic</Link>}
    </article>) : <p className="empty">No lessons published in this language yet.</p>}</div>
  </>;
}
