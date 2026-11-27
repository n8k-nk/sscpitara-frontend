import { Suspense } from "react";
import { call } from "../../lib/server";
import RouteSkeleton from "../RouteSkeleton";
import Overview, { LearnHeading, StudyPlanLink } from "./Overview";

const intro = "The first two lessons are open with or without an account. Every other lesson is part of Premium.";

async function CglData({ request, here }) {
  const { ok, data } = await request;
  if (!ok) throw new Error("Learn is unavailable.");
  return <Overview d={data} here={here} showHeading={false} />;
}

async function PlanLink({ request }) {
  const { ok, data } = await request;
  return ok ? <StudyPlanLink scope={data} /> : null;
}

export default function CglOverview({ tierTwo = false, children }) {
  const endpoint = tierTwo ? "learn/cgl/tier-ii" : "learn/cgl";
  const request = call(endpoint, tierTwo ? "" : "summary=1");
  return <div className="learn-overview">
    <LearnHeading exam="CGL" stage={tierTwo ? "Tier II" : "Tier I"} title="Learn" intro={intro}>
      <Suspense fallback={null}><PlanLink request={request} /></Suspense>
    </LearnHeading>
    <Suspense fallback={<RouteSkeleton label="Learn" />}>
      <CglData request={request} here={`/${endpoint}/`} />
    </Suspense>
    {children}
  </div>;
}
