import Link from "next/link";
import { notFound } from "next/navigation";
import PartView from "../../../../../../../../components/PartView";
import TopicBar from "../../../../../../../../components/TopicBar";
import { SubtopicMark } from "../../../../../../../../components/LearnMark";
import { hours } from "../../../../../../../../components/learnbits";
import { QuestionFeed } from "../../../../../../../pyq/_ui";
import { getQuestions } from "../../../../../../../../lib/pyq";
import { call } from "../../../../../../../../lib/server";

const SHOWN = 3;

export async function generateMetadata({ params }) {
  const { exam, stage, subject, topic, part } = await params;
  const { ok, data: d } = await call(`learn/${exam}/${stage}/${subject}/${topic}/article`);
  const s = ok && d.article?.sections.find((x) => x.slug === part);
  if (!s) return { title: "Learn" };
  const title = `${s.name}: ${d.name} for SSC ${d.exam} ${d.stage}`;
  return { title, description: s.outcome || `Learn ${s.name} for SSC ${d.exam} ${d.stage}: the rule, a worked example, shortcuts and real exam questions.`,
    alternates: { canonical: `/learn/${exam}/${stage}/${subject}/${topic}/read/${part}/` } };
}

export default async function Part({ params }) {
  const { exam, stage, subject, topic, part } = await params;
  const { status, data: d } = await call(`learn/${exam}/${stage}/${subject}/${topic}/article`);
  if (status === 404 || !d.article) notFound();
  const secs = d.article.sections, i = secs.findIndex((x) => x.slug === part);
  if (i < 0) notFound();
  const s = secs[i], base = `/learn/${exam}/${stage}/${subject}/${topic}/`, prev = secs[i - 1], next = secs[i + 1];
  const full = d.subtopics.find((x) => x.id === s.subtopic_id);
  const real = s.pyq?.questions ? await getQuestions(new URLSearchParams({ learn_part: s.subtopic_id, exam: d.exam, stage: d.stage }).toString()) : null;
  const fin = s.status === "done" || s.status === "known";

  const pyq = <section className="real" aria-labelledby="real-h">
    <h3 id="real-h" className="blk-head">Real exam questions</h3>
    {real ? <>
      <p className="muted">{s.pyq.questions} real question{s.pyq.questions === 1 ? "" : "s"} on this part, from {s.pyq.papers} CGL {d.stage} paper{s.pyq.papers === 1 ? "" : "s"}. Latest first. Try them before you read the answer.</p>
      <QuestionFeed data={{ ...real, questions: real.questions.slice(0, SHOWN), page: 1, pages: 1 }} pageHref={() => full.practice_url} />
      {s.pyq.questions > SHOWN && <p className="actions"><Link className="button" href={full.practice_url}>See all {s.pyq.questions} questions</Link></p>}
    </> : <p className="notice">We have no real exam questions tagged to this part yet. Use the extra practice below, or <Link href={d.practice_url}>practise the whole topic</Link>.</p>}
  </section>;

  return <>
    <TopicBar base={base} stage={stage} name={d.name} current="Read" modes={{ read: { available: true } }} />
    <article className="part-page">
      <header className="part-top">
        <nav className="part-steps" aria-label="Parts in this topic"><Link href={`${base}read/`} className="part-all">All parts</Link>
          {secs.map((x, k) => <Link key={x.slug} href={`${base}read/${x.slug}/`} className={`step${k === i ? " on" : ""}${x.status === "done" || x.status === "known" ? " ok" : ""}`}
            aria-current={k === i ? "step" : undefined} aria-label={`Part ${k + 1}: ${x.name}`}>{x.status === "done" || x.status === "known" ? "✓" : k + 1}</Link>)}</nav>
        <span className="eyebrow">{d.name} · Part {i + 1} of {secs.length}</span>
        <h1>{s.name}</h1>
        {s.outcome && <p className="lead">By the end: {s.outcome}</p>}
        <p className="badges"><span className="badge ok">Quick path about {s.quick_minutes} min</span><span className="badge">Everything about {s.full_minutes} min</span>
          {s.pyq?.questions > 0 && <span className="badge">{s.pyq.questions} real exam questions</span>}
          {d.signed_in && fin && <span className="badge ok">Finished</span>}</p>
        <p className="muted small">Start with the rule and the worked example. Open the folded sections whenever you want more.</p>
      </header>

      <PartView blocks={s.blocks} level={d.level} pyq={pyq} />

      <footer className="part-end">
        <SubtopicMark id={s.subtopic_id} status={s.status} signedIn={d.signed_in} />
        <div className="pager">
          {prev ? <Link className="button secondary" href={`${base}read/${prev.slug}/`}>← {prev.name}</Link> : <Link className="button secondary" href={`${base}read/`}>← All parts</Link>}
          {next ? <Link className="button" href={`${base}read/${next.slug}/`}>Next part: {next.name} →</Link> : <Link className="button" href={`${base}read/`}>Finish: revision card →</Link>}</div>
        <p className="small"><Link href={`${base}watch/#part-${s.subtopic_id}`}>Prefer a video for this part? Watch it →</Link></p>
      </footer>
    </article>
  </>;
}
