import Link from "next/link";
import { metadata as pageMetadata, readExams } from "../../lib/public";

export const metadata = pageMetadata("SSC exam directory", "Browse SSC exam families and official references.", "/exams/");

export default async function Directory() {
  const exams = await readExams();
  return <><h1>SSC exam directory</h1>{[...new Set(exams.map((exam) => exam.category))].map((category) =>
    <section key={category}><h2>{category}</h2><div className="grid">{exams.filter((exam) => exam.category === category).map((exam) =>
      <article key={exam.slug}><h3><Link href={`/exams/${exam.slug}/`}>{exam.code}</Link></h3><p>{exam.title}</p></article>
    )}</div></section>)}</>;
}
