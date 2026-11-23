import { metadata as pageMetadata, readLessons } from "../../lib/public";

export const metadata = pageMetadata("Free SSC CGL lessons", "Study SSC CGL topics with reviewed explanations and curated videos.", "/learn/");

export default async function Learn() {
  const lessons = await readLessons();
  return <><h1>Free SSC CGL lessons</h1>{lessons.length ? lessons.map((lesson) =>
    <article key={lesson.id} lang={lesson.language}><p className="track">{lesson.subject}</p><h2>{lesson.title}</h2>
      <p className="lesson">{lesson.body}</p>
      {lesson.source_url && <p><a href={lesson.source_url}>Lesson reference</a></p>}
      {lesson.video_id && /^[A-Za-z0-9_-]{11}$/.test(lesson.video_id) &&
        <iframe title={lesson.title} loading="lazy" src={`https://www.youtube-nocookie.com/embed/${lesson.video_id}`} allowFullScreen />}
    </article>) : <p>Lessons are awaiting publication.</p>}</>;
}
