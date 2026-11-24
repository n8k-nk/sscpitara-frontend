import { redirect } from "next/navigation";
import LearnSetup from "../../../components/LearnSetup";
import { call } from "../../../lib/server";

export const metadata = { title: "Set up your CGL path", robots: { index: false } };

export default async function Setup({ searchParams }) {
  const { edit } = await searchParams;
  const { data: d } = await call("learn", "exam=CGL");
  if (!d.signed_in) redirect("/signin/?next=/learn/setup/");
  if (!d.stages?.length) redirect("/learn/");
  if (d.setup && !edit) redirect("/learn/");
  return <>
    <div className="page-head"><span className="eyebrow">SSC CGL · Combined Graduate Level</span>
      <h1>{edit ? "Update your setup" : "Let’s build your path"}</h1>
      <p>{edit ? "Change your stage or what you have finished." : "Two quick questions so we do not teach you what you already know. You will not be asked again."}</p></div>
    <LearnSetup stages={d.stages.map((s) => ({ name: s.name, slug: s.slug, totals: s.totals,
      subjects: s.subjects.map((x) => ({ name: x.name, slug: x.slug, topics: x.topics.map((t) => ({ id: t.id, name: t.name, minutes: t.minutes, done: t.done, total: t.total })) })) }))}
      current={d.setup} editing={Boolean(edit)} />
  </>;
}
