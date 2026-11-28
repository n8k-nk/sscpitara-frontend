import { Suspense } from "react";
import RouteSkeleton from "../../components/RouteSkeleton";
import Link from "next/link";
import { metadata as pageMetadata, readExams } from "../../lib/public";

export const metadata = pageMetadata("SSC Exams List: Eligibility and Posts",
  "SSC exams in one list, including CGL, CHSL, MTS, GD, CPO, JE and Stenographer, with eligibility, stages, posts and official SSC references.", "/exams/");

export default function Directory() {
  return <>
    <div className="page-head"><span className="eyebrow">Directory</span><h1>SSC exam directory</h1>
      <p>Browse SSC exam families and open the official references.</p></div>
    <Suspense fallback={<RouteSkeleton label="exam directory" variant="overview" inline />}>
      <ExamGroups />
    </Suspense>
  </>;
}

async function ExamGroups() {
  const exams = await readExams();
  return <>
    {[...new Set(exams.map((exam) => exam.category))].map((category) =>
      <section key={category}><div className="section-head"><h2>{category}</h2></div>
        <div className="grid">{exams.filter((exam) => exam.category === category).map((exam) =>
          <article className="card link-card" key={exam.slug}>
            <span className="code">{exam.code}</span>
            <h3><Link href={`/exams/${exam.slug}/`}>{exam.title}</Link></h3>
            <span className="go">View details</span>
          </article>
        )}</div></section>)}
  </>;
}
