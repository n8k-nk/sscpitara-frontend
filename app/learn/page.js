import { metadata as pageMetadata, readLessons } from "../../lib/public";

export const metadata = pageMetadata("Free SSC CGL lessons", "Study SSC CGL topics with reviewed explanations and curated videos.", "/learn/");

export default async function Learn() {
  const lessons = await readLessons();
  return <>
    <div className="page-head"><span className="eyebrow">CGL Tier I</span><h1>Free SSC CGL lessons</h1>
      <p>Reviewed explanations and curated videos, organised by topic.</p></div>
    <div className="lessons">{lessons.length ? lessons.map((lesson) =>
      <article className="lesson-card" key={lesson.id} lang={lesson.language}>
        <header><span className="badge">{lesson.subject}</span></header>
        <h2>{lesson.title}</h2>
        <p className="lesson">{lesson.body}</p>
        {lesson.source_url && <p><a href={lesson.source_url}>Lesson reference</a></p>}
        {lesson.video_id && /^[A-Za-z0-9_-]{11}$/.test(lesson.video_id) &&
          <iframe title={lesson.title} loading="lazy" src={`https://www.youtube-nocookie.com/embed/${lesson.video_id}`} allowFullScreen />}
      </article>) : <p className="empty">Lessons are awaiting publication.</p>}</div>
  </>;
}
