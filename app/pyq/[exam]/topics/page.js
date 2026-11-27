import { notFound } from "next/navigation";
import { metadata as pageMetadata } from "../../../../lib/public";
import { getArchiveExam } from "../../../../lib/pyq";
import { Crumbs, ExamSwitch, ExamTabs, Topics } from "../../_ui";

export async function generateMetadata({ params }) {
  const { exam } = await getArchiveExam((await params).exam);
  if (!exam) return {};
  return pageMetadata(`SSC ${exam.code} previous year questions topic wise: most asked topics`,
    `See which topics SSC ${exam.code} asks most, year by year, and practise previous year questions topic wise with answers.`, `/pyq/${exam.slug}/topics/`);
}

export default async function TopicsPage({ params, searchParams }) {
  const { exam, switchExams } = await getArchiveExam((await params).exam);
  if (!exam) notFound();
  const q = await searchParams;
  const one = (k) => (typeof q[k] === "string" ? q[k] : "");
  const year = exam.years.some((y) => String(y.year) === one("year")) ? one("year") : "";
  return <>
    <Crumbs trail={[{ name: "PYQs", href: "/pyq/" }, { name: `SSC ${exam.code}`, href: `/pyq/${exam.slug}/` }, { name: "Topic wise", href: `/pyq/${exam.slug}/topics/` }]} />
    <div className="page-head pyq-cover"><span className="eyebrow">SSC {exam.code} · Previous year questions</span><h1>Topic-wise practice</h1>
      <p>Choose a topic to practise previous year questions. The most frequently asked topics appear first.</p></div>
    <ExamSwitch current={exam.slug} exams={switchExams} />
    <ExamTabs exam={exam} active="topic" stage={one("stage")} />
    <Topics exam={exam} year={year} subject={one("subject")} stage={one("stage")} />
  </>;
}
