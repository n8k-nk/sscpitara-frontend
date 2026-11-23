import Link from "next/link";
import { metadata as pageMetadata, readExams, readCoverage } from "../lib/public";

export const metadata = pageMetadata(
  "SSC exam preparation", "Find SSC exams that fit your profile and start preparing for free.", "/"
);

export default async function Home() {
  const [exams, coverage] = await Promise.all([readExams(), readCoverage()]);
  return <>
    <section className="hero"><div><h1>Find your SSC exam. Know what to prepare next.</h1>
      <p>Check which exams fit your education and age, compare the jobs they lead to, and use your past results to plan your next step.</p>
      <div className="actions"><a className="button" href="/account/">Find my exam matches</a><Link href="/exams/">Browse SSC exams</Link></div>
    </div><aside><h2>CGL preparation</h2><p>{coverage.diagnostic} diagnostic questions<br />{coverage.practice} published practice questions<br />{coverage.mocks} published full mocks</p><Link href="/plans/">See free study coverage</Link></aside></section>
    <section><h2>Find your SSC exam</h2><div className="grid">{exams.filter((exam) => exam.guidance?.qualification).map((exam) =>
      <article key={exam.slug}><h3><Link href={`/exams/${exam.slug}/`}>{exam.code}</Link></h3><p>{exam.title}</p></article>
    )}</div><p><Link href="/exams/">View all listed SSC exams</Link></p></section>
  </>;
}
