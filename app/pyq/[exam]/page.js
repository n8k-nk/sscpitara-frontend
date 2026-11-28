import { notFound } from "next/navigation";
import { metadata as pageMetadata } from "../../../lib/public";
import { getArchiveExam } from "../../../lib/pyq";
import { Crumbs, ExamLanding } from "../_ui";

export async function generateMetadata({ params }) {
  const { exam } = await getArchiveExam((await params).exam);
  if (!exam) return {};
  const years = exam.years.map((y) => y.year);
  const [first, latest] = [Math.min(...years), Math.max(...years)];
  const span = first === latest ? `${latest}` : `${first}–${latest}`;
  return pageMetadata(`SSC ${exam.code} Previous Year Papers ${span}`,
    `SSC ${exam.code} previous year question papers ${span}: ${exam.years.reduce((s, y) => s + y.papers.length, 0)} papers by year, date and shift, with free papers and topic-wise practice.`, `/pyq/${exam.slug}/`);
}

export default async function ExamPage({ params, searchParams }) {
  const { exam, switchExams } = await getArchiveExam((await params).exam);
  if (!exam) notFound();
  const { stage } = await searchParams;
  const chosen = exam.years.some((year) => year.papers.some((paper) => paper.stage === stage)) ? stage : "";
  return <>
    <Crumbs trail={[{ name: "PYQs", href: "/pyq/" }, { name: `SSC ${exam.code}`, href: `/pyq/${exam.slug}/` }]} />
    <ExamLanding exam={exam} stage={chosen} switchExams={switchExams} />
  </>;
}
