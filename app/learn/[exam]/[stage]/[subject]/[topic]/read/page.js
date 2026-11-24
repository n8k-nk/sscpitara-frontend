import Link from "next/link";
import { notFound } from "next/navigation";
import Rich from "../../../../../../../components/Rich";
import LessonSection from "../../../../../../../components/LessonSection";
import TopicBar from "../../../../../../../components/TopicBar";
import { Block } from "../../../../../../../components/ArticleBlocks";
import { TopicMark } from "../../../../../../../components/LearnMark";
import { call } from "../../../../../../../lib/server";

export async function generateMetadata({ params }) {
  const { exam, stage, subject, topic } = await params;
  const { ok, data: d } = await call(`learn/${exam}/${stage}/${subject}/${topic}/article`);
  if (!ok) return { title: "Learn" };
  const title = d.article ? `${d.article.title} | SSC ${d.exam} ${d.stage}` : `${d.name}: notes for SSC ${d.exam} ${d.stage}`;
  return { title, description: d.article?.subtitle || `Read ${d.name} for SSC ${d.exam} ${d.stage}: ideas, worked examples, shortcuts and practice.`,
    alternates: { canonical: `/learn/${exam}/${stage}/${subject}/${topic}/read/` } };
}

const finished = (st) => st === "done" || st === "known";

export default async function Read({ params }) {
  const { exam, stage, subject, topic } = await params;
  const { status, data: d } = await call(`learn/${exam}/${stage}/${subject}/${topic}/article`);
  if (status === 404) notFound();
  const base = `/learn/${exam}/${stage}/${subject}/${topic}/`, a = d.article;
  const bar = <TopicBar base={base} stage={stage} name={d.name} current="Read" modes={{ read: { available: Boolean(a) } }} />;

  if (!a) return <>{bar}
    <div className="page-head"><span className="eyebrow">Read · SSC {d.exam} {d.stage} · {d.subject}</span><h1>{d.name}</h1>
      <p>{d.legacy_notes.length ? "The full article for this topic is being written. Here are the short notes in the meantime." : "The full article for this topic is being written."}</p></div>
    {d.legacy_notes.map((n) => <article className="part" key={n.subtopic_id}><h2>{n.title}</h2><LessonSection section={n} /></article>)}
    <p className="actions"><Link className="button" href={`${base}watch/`}>Watch the videos instead</Link>{d.practice_url && <Link className="button secondary" href={d.practice_url}>Practise {d.name} PYQs</Link>}</p></>;

  const secs = a.sections, first = secs.find((s) => !finished(s.status)) ?? secs[0];
  const doneCount = secs.filter((s) => finished(s.status)).length;
  const quick = secs.reduce((n, s) => n + s.quick_minutes, 0), full = secs.reduce((n, s) => n + s.full_minutes, 0);
  const real = secs.reduce((n, s) => n + (s.pyq?.questions ?? 0), 0);
  return <>{bar}
    <header className="page-head read-head"><span className="eyebrow">Read · SSC {d.exam} {d.stage} · {d.subject}</span>
      <h1>{a.title}</h1>{a.subtitle && <p className="lead">{a.subtitle}</p>}
      <p className="badges"><span className="badge ok">Quick path about {quick} min</span><span className="badge">Everything about {Math.round(full / 5) * 5} min</span>
        <span className="badge">{secs.length} short parts</span>{real > 0 && <span className="badge">{real} real exam questions</span>}
        {d.signed_in && <span className="badge ok">{doneCount} of {secs.length} done</span>}</p>
      <p className="actions"><Link className="button lg" href={`${base}read/${first.slug}/`}>{doneCount ? `Continue: ${first.name}` : "Start with part 1"}</Link>
        <TopicMark id={d.id} done={d.done} total={d.total} signedIn={d.signed_in} />
        <Link className="button secondary" href={`${base}watch/`}>Watch instead</Link></p></header>

    {a.goals.length > 0 && <section className="goals"><h2>By the end you will be able to</h2><ul className="checks">{a.goals.map((g, i) => <li key={i}><Rich inline>{g}</Rich></li>)}</ul></section>}

    <section aria-labelledby="parts"><h2 id="parts">The parts</h2>
      <p className="muted">Each part is short. Read the quick path, and open the folded sections when you want more.</p>
      <ol className="part-cards">{secs.map((s, n) => <li key={s.slug} className={finished(s.status) ? "is-done" : ""}>
        <span className={`num${finished(s.status) ? " ok" : ""}`} aria-hidden="true">{finished(s.status) ? "✓" : n + 1}</span>
        <div className="part-card-main"><h3><Link href={`${base}read/${s.slug}/`}>{s.name}</Link></h3>
          {s.outcome && <p className="muted small">{s.outcome}</p>}
          <p className="small muted">Quick path about {s.quick_minutes} min · Everything about {s.full_minutes} min{s.pyq?.questions > 0 ? ` · ${s.pyq.questions} real exam questions` : ""}</p></div>
        <Link className={finished(s.status) ? "button ghost" : "button secondary"} href={`${base}read/${s.slug}/`}>{finished(s.status) ? "Review" : "Open"}</Link></li>)}</ol></section>

    {a.cheatsheet.length > 0 && <section className="cheatsheet" id="cheatsheet" aria-labelledby="h-cheat"><h2 id="h-cheat">Revision card</h2>
      <p className="muted small">Everything to remember, on one screen. Read this the night before.</p>{a.cheatsheet.map((b, i) => <Block key={i} b={{ ...b, pace: "core" }} />)}</section>}
    {a.faq.length > 0 && <section id="faq" aria-labelledby="h-faq"><h2 id="h-faq">Common questions</h2>
      {a.faq.map((f, i) => <details className="panel faq" key={i}><summary><Rich inline>{f.question}</Rich></summary><div className="faq-a"><Rich>{f.answer}</Rich></div></details>)}</section>}
    {a.sources.length > 0 && <section id="sources"><h2>Sources</h2><ul className="resources">{a.sources.map((x) => <li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></li>)}</ul></section>}
    <div className="callout"><div><strong>Test yourself</strong><p>Practise this topic on real previous year questions.</p></div>
      {d.practice_url && <Link className="button" href={d.practice_url}>Practise {d.name} PYQs</Link>}</div>
  </>;
}
