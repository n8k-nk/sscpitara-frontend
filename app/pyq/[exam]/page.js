import { notFound } from "next/navigation";
import { metadata as pageMetadata } from "../../../lib/public";
import { getArchiveExam } from "../../../lib/pyq";
import { Crumbs, ExamLanding } from "../_ui";

export async function generateMetadata({ params }) {
  const { exam } = await getArchiveExam((await params).exam);
  if (!exam) return {};
  const years = exam.years.map((y) => y.year).join(", ");
  return pageMetadata(`SSC ${exam.code} previous year question papers with answers (${years})`,
    `Free SSC ${exam.code} previous year papers: ${exam.years.reduce((s, y) => s + y.papers.length, 0)} shifts and ${exam.questions.toLocaleString("en-IN")} questions with answers, by year, date and shift.`, `/pyq/${exam.slug}/`);
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
