import Overview from "../../../../components/learn/Overview";
import { metadata as pageMetadata } from "../../../../lib/public";
import { call } from "../../../../lib/server";

export const metadata = pageMetadata(
  "SSC CGL Tier II: learn and practise",
  "Tier II lessons for the modules that Tier I does not already cover, and the same subject map where the syllabus overlaps.",
  "/learn/cgl/tier-ii/",
);

export default async function TierTwo() {
  const { data: d } = await call("learn/cgl/tier-ii");
  return <Overview d={d} here="/learn/cgl/tier-ii/" title="Learn" intro="The first two lessons are open with or without an account. Every other lesson is part of Premium." />;
}
