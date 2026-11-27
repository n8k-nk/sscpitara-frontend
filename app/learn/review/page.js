import Link from "../../../components/NavigationLink";
import ReviewSession from "../../../components/learn/ReviewSession";
import { need } from "../../../lib/server";

export const metadata = { title: "Review", robots: { index: false } };

export default async function Review() {
  const d = await need("learn/review", "/learn/review/");
  return <>
    <Link className="back" href="/learn/cgl/">Learn</Link>
    <div className="page-head"><span className="eyebrow">Spaced review</span><h1>Recall what you learned</h1>
      <p>After a lesson we ask you again after 1, 3, 7, 14 and 30 days. Try to remember before you look. If you miss, it comes back tomorrow.</p></div>
    <ReviewSession cards={d.due} more={d.more} />
  </>;
}
