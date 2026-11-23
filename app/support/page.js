import { redirect } from "next/navigation";
import Support from "../../components/Support";
import { session } from "../../lib/server";
export const metadata = { title: "Contact support", robots: { index: false } };
export default async function Page() {
  if (!(await session()).authenticated) redirect("/signin/?next=/support/");
  return <Support />;
}
