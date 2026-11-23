import Onboarding from "../../components/Onboarding";
import { need } from "../../lib/server";

export const metadata = { title: "SSC profile", robots: { index: false } };

export default async function Page() {
  const profile = await need("profile", "/onboarding/");
  return <Onboarding initial={profile.values} options={profile.options} exists={profile.exists} />;
}
