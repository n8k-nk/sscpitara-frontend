import { notFound, redirect } from "next/navigation";
import Runner from "../../../../components/Runner";
import { need } from "../../../../lib/server";

export const metadata = { title: "Practice set", robots: { index: false } };

export default async function Attempt({ params, searchParams }) {
  const { id } = await params;
  const { q = "", lang = "" } = await searchParams;
  const query = new URLSearchParams({ ...(q && { q }), ...(lang && { lang }) }).toString();
  const data = await need(`study/attempts/${id}`, `/study/attempt/${id}/`, query);
  if (!data) notFound();
  if (data.finished) redirect(`/study/attempt/${id}/results/`);
  return <Runner key={`${data.section}-${data.position}-${data.hi}`} data={data} />;
}
