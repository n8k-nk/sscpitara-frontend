import { redirect } from "next/navigation";
import { session } from "../../lib/server";
import TutorChat from "./TutorChat";

export const metadata = { title: "AI Tutor", robots: { index: false } };

export default async function TutorPage() {
  const user = await session();
  if (!user.authenticated) redirect("/signin/?next=/tutor/");
  return <TutorChat userName={user.name?.trim() || user.username} />;
}
