import { notFound, redirect } from "next/navigation";
import { call, session } from "../../../lib/server";
import TutorChat from "../TutorChat";

export const metadata = { title: "AI Tutor", robots: { index: false } };

export default async function TutorThreadPage({ params }) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id)) notFound();
  const user = await session();
  if (!user.authenticated) redirect(`/signin/?next=${encodeURIComponent(`/tutor/${id}/`)}`);
  const res = await call(`tutor/threads/${id}`);
  if (!res.ok || !res.data?.id) redirect("/tutor/");
  return <TutorChat initialThread={res.data} userName={user.name?.trim() || user.username} />;
}
