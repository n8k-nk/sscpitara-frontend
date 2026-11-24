import { notFound } from "next/navigation";
import { metadata as pageMetadata } from "../../../../../../lib/public";
import { examBySlug, getOverview, getQuestions, pageOf } from "../../../../../../lib/pyq";
import { Crumbs, QuestionFeed, query, withQuery } from "../../../../_ui";

async function load(params, q) {
  const { exam: slug, subject, topic: topicSlug } = await params;
  const exam = examBySlug(await getOverview(true), slug);
  const row = exam?.topic_stats.find((t) => t.subject === subject && t.topic_slug === topicSlug);
  if (!row) return {};
  const scope = { exam: exam.code, topic: row.topic, year: /^\d{4}$/.test(q?.year ?? "") ? q.year : "", stage: typeof q?.stage === "string" ? q.stage : "" };
  return { exam, row, scope, base: `/pyq/${exam.slug}/topics/${subject}/${topicSlug}/` };
}

export async function generateMetadata({ params, searchParams }) {
  const q = await searchParams;
  const { exam, row, scope, base } = await load(params, q);
  if (!row) return {};
  const data = await getQuestions(query({ exam: exam.code, topic: row.topic, page: 1 }));
  const meta = pageMetadata(`${row.topic_name} previous year questions: SSC ${exam.code} (${data.total} questions with answers)`,
    `${data.total} SSC ${exam.code} previous year ${row.topic_name} questions from ${row.subject_name}, with answers. Practise topic wise, free.`,
    pageOf(q?.page) > 1 ? withQuery(base, { page: pageOf(q.page) }) : base);
  return scope.year || scope.stage ? { ...meta, alternates: { canonical: base }, robots: { index: false, follow: true } } : meta;
}

export default async function TopicQuestions({ params, searchParams }) {
  const q = await searchParams;
  const { exam, row, scope, base } = await load(params, q);
  if (!row) notFound();
  const page = pageOf(q.page);
  const data = await getQuestions(query({ ...scope, page }));
  return <>
    <Crumbs trail={[{ name: "PYQs", href: "/pyq/" }, { name: `SSC ${exam.code}`, href: `/pyq/${exam.slug}/` }, { name: "Topic wise", href: `/pyq/${exam.slug}/topics/` },
      { name: row.topic_name, href: base }]} />
    <div className="page-head pyq-cover pyq-practice-cover"><span className="eyebrow">{row.subject_name} · SSC {exam.code}</span><h1>{row.topic_name} previous year questions</h1>
      <p>{data.total} questions{scope.year ? ` from ${scope.year}` : ""} with answers.</p></div>
    <div className="pyq-topic-feed"><QuestionFeed data={data} pageHref={(p) => withQuery(base, { year: scope.year, stage: scope.stage, page: p > 1 ? p : "" })} /></div>
  </>;
}
