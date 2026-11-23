import Link from "next/link";
import Catalogue from "../catalogue";
import { notFound } from "next/navigation";
import { metadata as pageMetadata, readExams, readCoverage } from "../../../lib/public";

async function getExam(params) {
  const { slug } = await params;
  const exam = (await readExams()).find((row) => row.slug === slug);
  if (!exam) notFound();
  return exam;
}

export async function generateMetadata({ params }) {
  const exam = await getExam(params);
  return pageMetadata(`SSC ${exam.code} exam`, `${exam.title}. See the official SSC reference and current preparation coverage.`, `/exams/${exam.slug}/`);
}

export default async function Exam({ params }) {
  const exam = await getExam(params);
  const cgl = exam.code === "CGL";
  const coverage = cgl ? await readCoverage() : null;
  return <><p><Link href="/exams/">All SSC exams</Link></p><p className="track">{exam.category}</p>
    <h1>{exam.title}</h1>
    {exam.guidance?.qualification ? <Catalogue data={exam.guidance} /> : <section><h2>Official exam information</h2><p>Use the official SSC notices to check the current cycle, eligibility, dates and paper format.</p>
      {exam.source_url && <p><a href={exam.source_url}>Open SSC reference</a></p>}</section>}
    <section><h2>Preparation on SSC Pitara</h2>{cgl ? <>
      <p>Tier I covers Reasoning, General Awareness, Quantitative Aptitude and English Comprehension.</p>
      <p>{coverage.diagnostic} diagnostic questions · {coverage.practice} practice questions · {coverage.mocks} full mocks published</p>
      <div className="actions"><a className="button" href="/study/practice/">Open CGL practice</a><Link href="/learn/">Browse lessons</Link></div>
    </> : <p>This exam currently has an official reference in the directory. Guided preparation currently covers CGL Tier I.</p>}</section>
  </>;
}
