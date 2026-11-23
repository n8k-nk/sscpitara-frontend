import { metadata as pageMetadata, readCoverage } from "../../lib/public";

export const metadata = pageMetadata("Free CGL Tier I preparation", "See published diagnostic, practice and mock coverage.", "/plans/");

export default async function Plans() {
  const coverage = await readCoverage();
  return <><h1>Free CGL Tier I preparation</h1><p>Access all published preparation materials for free.</p>
    <ul><li>{coverage.diagnostic} free diagnostic questions</li><li>{coverage.practice} practice questions</li><li>{coverage.mocks} complete mocks</li></ul>
    {!!coverage.topics.length && <p>Practice topics include {coverage.topics.join(", ")}.</p>}
    <p><a className="button" href="/study/practice/">Open free practice</a></p></>;
}
