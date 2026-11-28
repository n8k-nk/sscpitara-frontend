import { Suspense } from "react";
import RouteSkeleton from "../../../../../../components/RouteSkeleton";
import { notFound } from "next/navigation";
import { metadata as pageMetadata } from "../../../../../../lib/public";
import { examBySlug, getOverview, getQuestions, pageOf } from "../../../../../../lib/pyq";
import { Crumbs, QuestionFeed, query, withQuery } from "../../../../_ui";

async function load(params, q) {
  const { exam: slug, subject, topic: topicSlug } = await params;
  const exam = examBySlug(await getOverview(true), slug);
  const row = exam?.topic_stats.find((t) => t.subject === subject && t.topic_slug === topicSlug);
  if (!row) return {};
  const scope = { exam: exam.code, topic: row.topic, year: /^\d{4}$/.test(q?.year ?? "") ? q.year : "",
    stage: typeof q?.stage === "string" ? q.stage : "", unanswered: q?.unanswered === "1" ? "1" : "" };
  return { exam, row, scope, base: `/pyq/${exam.slug}/topics/${subject}/${topicSlug}/` };
}

export async function generateMetadata({ params, searchParams }) {
  const q = await searchParams;
  const { exam, row, scope, base } = await load(params, q);
  if (!row) return {};
  const total = exam.topic_stats.reduce((sum, topic) => sum + (topic.topic === row.topic ? topic.questions : 0), 0);
  const meta = pageMetadata(`SSC ${exam.code} ${row.topic_name} Previous Year Questions`,
    `${total} SSC ${exam.code} previous year ${row.topic_name} questions in ${row.subject_name} from published papers. Try free questions with answers.`,
    pageOf(q?.page) > 1 ? withQuery(base, { page: pageOf(q.page) }) : base);
  return scope.year || scope.stage || scope.unanswered ? { ...meta, alternates: { canonical: base }, robots: { index: false, follow: true } } : meta;
}

export default async function TopicQuestions({ params, searchParams }) {
  const q = await searchParams;
  const { exam, row, scope, base } = await load(params, q);
  if (!row) notFound();
  const page = pageOf(q.page);
  const filters = query({ ...scope, page, facets: "0" });
  return <>
    <Crumbs trail={[{ name: "PYQs", href: "/pyq/" }, { name: `SSC ${exam.code}`, href: `/pyq/${exam.slug}/` }, { name: "Topic wise", href: `/pyq/${exam.slug}/topics/` },
      { name: row.topic_name, href: base }]} />
    <div className="page-head pyq-cover pyq-practice-cover"><span className="eyebrow">{row.subject_name} · SSC {exam.code}</span><h1>{row.topic_name} previous year questions</h1></div>
    <Suspense key={filters} fallback={<RouteSkeleton label="topic questions" inline />}>
      <TopicFeed filters={filters} scope={scope} base={base} />
    </Suspense>
  </>;
}

async function TopicFeed({ filters, scope, base }) {
  const data = await getQuestions(filters);
  return <div className="pyq-topic-feed">
    <QuestionFeed data={data} pageHref={(p) => withQuery(base, {
      year: scope.year, stage: scope.stage, unanswered: scope.unanswered, page: p > 1 ? p : "",
    })} />
  </div>;
}
