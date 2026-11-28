import { Suspense } from "react";
import RouteSkeleton from "../../components/RouteSkeleton";
import Link from "../../components/NavigationLink";
import { redirect } from "next/navigation";
import { metadata as pageMetadata } from "../../lib/public";
import { getOverview, n } from "../../lib/pyq";
import { studyContext } from "../../lib/study-scope";
import { cookies } from "next/headers";
import { scopedPyqs, STUDY_SCOPE_COOKIE } from "../../lib/study-scope-paths";

export const metadata = pageMetadata("SSC Previous Year Question Papers",
  "Browse SSC previous year question papers by exam, year, shift and topic. Read free papers with answers, see the most asked topics and practise them.", "/pyq/");

/** The PYQ front door. Learners who already chose an exam go straight to it; everyone else picks one. */
export default async function Pyq({ searchParams }) {
  const all = (await searchParams).all === "1";
  if (!all) {
    const [{ selected }, jar] = await Promise.all([studyContext(), cookies()]);
    // First-time visitors (and search engines) see every exam. Only skip ahead for someone who is
    // signed in or has picked an exam, not for the default selection.
    const chose = jar.has("sessionid") || jar.has(STUDY_SCOPE_COOKIE);
    if (chose && selected?.has_pyq) redirect(scopedPyqs(selected));
    if (chose && selected) return <div className="page-head">
      <h1>{selected.exam} · {selected.stage} previous year questions</h1>
      <p>Papers for this selection are in preparation.</p>
      <p><Link href="/pyq/?all=1">Browse available papers</Link></p>
    </div>;
  }
  return <>
    <div className="page-head"><span className="eyebrow">Previous year questions</span><h1>SSC previous year question papers</h1>
      <p>Real exam questions with answers. Choose your exam to browse by year, date and shift, or by topic.</p></div>
    <Suspense fallback={<RouteSkeleton label="previous year papers" variant="overview" inline />}>
      <ExamPapers all={all} />
    </Suspense>
  </>;
}

async function ExamPapers({ all }) {
  const data = await getOverview(all);
  if (data.narrowed && data.exams.length === 1) redirect(`/pyq/${data.exams[0].slug}/`);
  return <>
    {data.exams.length ? <div className="grid">{data.exams.map((e) => <Link key={e.code} className="pyq-paper" href={`/pyq/${e.slug}/`}>
      <strong>SSC {e.code}</strong><span className="muted">{e.title}</span><small>{n(e.questions)} questions</small></Link>)}</div>
      : <div className="empty"><p>{data.narrowed ? `PYQs for ${data.my_exams.join(", ")} are coming soon.` : "No papers are published yet."}</p>
        {data.narrowed && data.other_exams > 0 && <Link className="button secondary" href="/pyq/?all=1">Browse PYQs for other exams</Link>}</div>}
  </>;
}
