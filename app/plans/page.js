import { metadata as pageMetadata, readCoverage } from "../../lib/public";

export const metadata = pageMetadata("Free CGL Tier I preparation", "See published diagnostic, practice and mock coverage.", "/plans/");

export default async function Plans() {
  const coverage = await readCoverage();
  return <>
    <div className="page-head"><span className="eyebrow">Free</span><h1>Free SSC CGL preparation</h1>
      <p>Access all published preparation materials for free.</p></div>
    <ul className="stats">
      <li><strong>{coverage.diagnostic}</strong><span>free diagnostic questions</span></li>
      <li><strong>{coverage.practice}</strong><span>practice questions</span></li>
      <li><strong>{coverage.mocks}</strong><span>complete mocks</span></li>
    </ul>
    {!!coverage.topics.length && <p className="muted">Practice topics include {coverage.topics.join(", ")}.</p>}
    <div className="actions"><a className="button lg arrow" href="/study/practice/">Open free practice</a></div>
  </>;
}
