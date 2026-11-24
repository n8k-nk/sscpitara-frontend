import Link from "next/link";
import { redirect } from "next/navigation";
import { metadata as pageMetadata } from "../../lib/public";
import { getOverview, n } from "../../lib/pyq";

export const metadata = pageMetadata("SSC previous year question papers with answers",
  "Free SSC previous year question papers by exam, year, date and shift, and by topic. See which topics are asked most and practise them.", "/pyq/");

/** The PYQ front door. Learners who already chose an exam go straight to it; everyone else picks one. */
export default async function Pyq({ searchParams }) {
  const all = (await searchParams).all === "1";
  const data = await getOverview(all);
  if (data.narrowed && data.exams.length === 1) redirect(`/pyq/${data.exams[0].slug}/`);
  return <>
    <div className="page-head"><span className="eyebrow">Previous year questions</span><h1>SSC previous year question papers</h1>
      <p>Real exam questions with answers. Choose your exam to browse by year, date and shift, or by topic.</p></div>
    {data.exams.length ? <div className="grid">{data.exams.map((e) => <Link key={e.code} className="pyq-paper" href={`/pyq/${e.slug}/`}>
      <strong>SSC {e.code}</strong><span className="muted">{e.title}</span><small>{n(e.questions)} questions</small></Link>)}</div>
      : <div className="empty"><p>{data.narrowed ? `PYQs for ${data.my_exams.join(", ")} are coming soon.` : "No papers are published yet."}</p>
        {data.narrowed && data.other_exams > 0 && <Link className="button secondary" href="/pyq/?all=1">Browse PYQs for other exams</Link>}</div>}
  </>;
}
