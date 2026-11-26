import { notFound } from "next/navigation";
import { metadata as pageMetadata } from "../../../../../../lib/public";
import { examBySlug, getOverview, getQuestions, pageOf, paperLabel, papersOf } from "../../../../../../lib/pyq";
import { Crumbs, QuestionFeed, withQuery } from "../../../../_ui";

async function load(params) {
  const { exam: slug, year, stage, paper } = await params;
  const exam = examBySlug(await getOverview(true), slug);
  const found = exam && papersOf(exam).find((p) => p.path === `${slug}/${year}/${stage}/${paper}`);
  return found ? { exam, paper: found, base: `/pyq/${found.path}/` } : {};
}

export async function generateMetadata({ params, searchParams }) {
  const { exam, paper, base } = await load(params);
  if (!paper) return {};
  const page = pageOf((await searchParams).page);
  const data = await getQuestions(`paper=${paper.slug}&page=1`);
  const subjects = data.facets.subjects.map((s) => s.label).join(", ");
  return pageMetadata(`SSC ${exam.code} ${paper.stage} ${paperLabel(paper)} question paper with answers`,
    `Free SSC ${exam.code} ${paper.stage} question paper held on ${paperLabel(paper)}: ${paper.questions} questions with answers${subjects ? ` across ${subjects}` : ""}. Sign up to attempt them.`,
    page > 1 ? withQuery(base, { page }) : base);
}

export default async function PaperPage({ params, searchParams }) {
  const { exam, paper, base } = await load(params);
  if (!paper) notFound();
  const page = pageOf((await searchParams).page);
  const data = await getQuestions(`paper=${paper.slug}&page=${page}`);
  const year = String(paper.path.split("/")[1]);
  return <>
    <Crumbs trail={[{ name: "PYQs", href: "/pyq/" }, { name: `SSC ${exam.code}`, href: `/pyq/${exam.slug}/` }, { name: year, href: `/pyq/${exam.slug}/${year}/` },
      { name: `${paper.stage} ${paperLabel(paper)}`, href: base }]} />
    <div className="page-head"><span className="eyebrow">SSC {exam.code} {year} · {paper.stage}</span><h1>SSC {exam.code} {paper.stage} question paper, {paperLabel(paper)}</h1>
      <p>{paper.questions} questions{paper.shift_time ? ` · ${paper.shift_time}` : ""}, with answers.</p></div>
    <QuestionFeed data={data} pageHref={(p) => withQuery(base, { page: p > 1 ? p : "" })} />
  </>;
}
