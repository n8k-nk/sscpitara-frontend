import { notFound } from "next/navigation";
import { metadata as pageMetadata } from "../../../../lib/public";
import { examBySlug, getOverview, n } from "../../../../lib/pyq";
import { Crumbs, Years } from "../../_ui";

async function load(params) {
  const { exam: slug, year } = await params;
  const exam = examBySlug(await getOverview(true), slug);
  const y = exam?.years.find((r) => String(r.year) === year);
  return y ? { exam, y } : {};
}

export async function generateMetadata({ params }) {
  const { exam, y } = await load(params);
  if (!exam) return {};
  const total = y.papers.reduce((s, p) => s + p.questions, 0);
  return pageMetadata(`SSC ${exam.code} ${y.year} question papers with answers: all shifts`,
    `All ${y.papers.length} SSC ${exam.code} ${y.year} papers (${n(total)} questions) by date and shift, with answers. Free.`, `/pyq/${exam.slug}/${y.year}/`);
}

export default async function YearPage({ params }) {
  const { exam, y } = await load(params);
  if (!exam) notFound();
  return <>
    <Crumbs trail={[{ name: "PYQs", href: "/pyq/" }, { name: `SSC ${exam.code}`, href: `/pyq/${exam.slug}/` }, { name: String(y.year), href: `/pyq/${exam.slug}/${y.year}/` }]} />
    <div className="page-head"><span className="eyebrow">Previous year questions</span><h1>SSC {exam.code} {y.year} question papers</h1>
      <p>Pick a date and shift.</p></div>
    <Years years={[y]} openFirst />
  </>;
}
