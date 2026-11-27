import { notFound } from "next/navigation";
import { metadata as pageMetadata } from "../../../../../../lib/public";
import { getQuestions, pageOf, paperLabel } from "../../../../../../lib/pyq";
import { Crumbs, QuestionFeed, withQuery } from "../../../../_ui";

async function load(params, page) {
  const { exam: slug, year, stage, paper } = await params;
  const paperPath = `${slug}/${year}/${stage}/${paper}`;
  try {
    const data = await getQuestions(new URLSearchParams({ paper_path: paperPath, page, facets: "0" }).toString());
    if (!data?.paper_info) return {};
    return { data, paper: data.paper_info, base: `/pyq/${data.paper_info.path}/` };
  } catch {
    return {};
  }
}

export async function generateMetadata({ params, searchParams }) {
  const page = pageOf((await searchParams).page);
  const { data, paper, base } = await load(params, page);
  if (!paper) return {};
  const meta = pageMetadata(`SSC ${paper.exam} ${paper.stage} ${paperLabel(paper)} question paper with answers`,
    `Free SSC ${paper.exam} ${paper.stage} question paper held on ${paperLabel(paper)}: ${paper.questions} questions with answers. Sign up to attempt them.`,
    page > 1 ? withQuery(base, { page }) : base);
  // Locked papers and later pages show visitors placeholders, so keep them out of search results.
  return data.paper_locked || page > 1 ? { ...meta, robots: { index: false, follow: true } } : meta;
}

export default async function PaperPage({ params, searchParams }) {
  const page = pageOf((await searchParams).page);
  const { data, paper, base } = await load(params, page);
  if (!paper) notFound();
  const year = String(paper.year);
  return <>
    <Crumbs trail={[{ name: "PYQs", href: "/pyq/" }, { name: `SSC ${paper.exam}`, href: `/pyq/${paper.exam_slug}/` }, { name: year, href: `/pyq/${paper.exam_slug}/${year}/` },
      { name: `${paper.stage} ${paperLabel(paper)}`, href: base }]} />
    <div className="page-head"><span className="eyebrow">SSC {paper.exam} {year} · {paper.stage}</span><h1>SSC {paper.exam} {paper.stage} question paper, {paperLabel(paper)}</h1>
      <p>{paper.questions} questions{paper.shift_time ? ` · ${paper.shift_time}` : ""}, with answers.</p></div>
    <QuestionFeed data={data} pageHref={(p) => withQuery(base, { page: p > 1 ? p : "" })} />
  </>;
}
