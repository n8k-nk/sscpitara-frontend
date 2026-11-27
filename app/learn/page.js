import Link from "../../components/NavigationLink";
import { redirect } from "next/navigation";
import { studyContext } from "../../lib/study-scope";
import { scopedPyqs } from "../../lib/study-scope-paths";

export const metadata = { title: "Learn", robots: { index: false } };

export default async function Learn() {
  const { selected } = await studyContext();
  if (selected?.learn_href) redirect(selected.learn_href);
  return <div className="page-head">
    <h1>{selected ? `Learn ${selected.exam} · ${selected.stage}` : "Learn"}</h1>
    <p>Lessons for this selection are in preparation.</p>
    {selected?.has_pyq && <p><Link href={scopedPyqs(selected)} className="button secondary">Browse previous year questions</Link></p>}
  </div>;
}
