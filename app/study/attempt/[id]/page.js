import { notFound, redirect } from "next/navigation";
import Runner from "../../../../components/Runner";
import MockFrame from "../../../../components/MockFrame";
import Rich from "../../../../components/Rich";
import { need } from "../../../../lib/server";

export const metadata = { title: "Practice set", robots: { index: false } };

export default async function Attempt({ params, searchParams }) {
  const { id } = await params;
  const { q = "", lang = "" } = await searchParams;
  const query = new URLSearchParams({ ...(q && { q }), ...(lang && { lang }) }).toString();
  const data = await need(`study/attempts/${id}`, `/study/attempt/${id}/`, query);
  if (!data) notFound();
  if (data.finished) redirect(`/study/attempt/${id}/results/`);
  const key = `${data.section}-${data.position}-${data.hi}`;
  if (data.mock) return <MockFrame id={id}>
    <Runner key={key} data={data}
      stem={<Rich inline interactive={false}>{data.question}</Rich>}
      passage={data.passage && <Rich interactive={false}>{data.passage}</Rich>}
      options={data.options.map((option, i) => <Rich key={i} inline interactive={false}>{option.label}</Rich>)} />
  </MockFrame>;
  return <Runner key={key} data={data} />;
}
