import { notFound, redirect } from "next/navigation";
import Runner from "../../../../components/Runner";
import MockFrame from "../../../../components/MockFrame";
import MockDataEntry from "../../../../components/MockDataEntry";
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
  if (data.data_entry) return <MockFrame id={id} proctored={false}>
    <MockDataEntry key={data.data_entry.deadline ?? "break"} id={id} title={data.title} session={data.data_entry} />
  </MockFrame>;
  const key = `${data.section}-${data.position}-${data.hi}`;
  if (data.pyq || data.rich_text) {
    const runner = <Runner key={key} data={data}
      stem={<Rich inline interactive={false}>{data.question}</Rich>}
      passage={data.passage && <Rich interactive={false}>{data.passage}</Rich>}
      options={data.options.map((option, i) => <Rich key={i} inline interactive={false}>{option.label}</Rich>)} />
    return data.mock ? <MockFrame id={id} proctored={!data.rich_text}>{runner}</MockFrame> : runner;
  }
  return <Runner key={key} data={data} />;
}
