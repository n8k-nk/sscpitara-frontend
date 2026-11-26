import Onboarding from "../../components/Onboarding";
import { need } from "../../lib/server";

export const metadata = { title: "SSC profile", robots: { index: false } };

const steps = ["education", "age", "preparation", "exams", "details"];

export default async function Page({ searchParams }) {
  const { edit } = await searchParams;
  const profile = await need("profile", "/onboarding/");
  const editStep = profile.exists ? steps.indexOf(edit) : -1;
  return <Onboarding key={editStep} editStep={editStep} initial={profile.values} options={profile.options} exists={profile.exists} />;
}
