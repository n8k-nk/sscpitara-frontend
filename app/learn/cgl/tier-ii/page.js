import CglOverview from "../../../../components/learn/CglOverview";
import { metadata as pageMetadata } from "../../../../lib/public";

export const metadata = pageMetadata(
  "SSC CGL Tier II: learn and practise",
  "Tier II lessons for the modules that Tier I does not already cover, and the same subject map where the syllabus overlaps.",
  "/learn/cgl/tier-ii/",
);

export default function TierTwo() {
  return <CglOverview tierTwo />;
}
