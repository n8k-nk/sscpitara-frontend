import Link from "next/link";
import { notFound } from "next/navigation";
import Overview from "../../../components/learn/Overview";
import { call } from "../../../lib/server";
import { scopedPyqs } from "../../../lib/study-scope-paths";

export const metadata = { title: "Learn", robots: { index: false } };

/** Any exam that has papers but no lessons yet. A new exam appears here without new code. */
export default async function ExamLearn({ searchParams }) {
  const query = await searchParams;
  const params = new URLSearchParams({ exam: query.exam ?? "", stage: query.stage ?? "" });
  const { ok, status, data: d } = await call("learn/overview", params.toString());
  if (status === 404) notFound();
  if (!ok) throw new Error("Learn is unavailable.");
  const scope = { exam_slug: d.exam.toLowerCase().replaceAll(" ", "-"), stage: d.stage };
  return <Overview d={d} here={`/learn/exam/?${params}`} title="Practise and track your topics"
    intro="Lessons for this exam are in preparation. Practise its previous year questions topic by topic.">
    <p><Link className="button secondary" href={scopedPyqs(scope)}>Browse previous year papers</Link></p>
  </Overview>;
}
