import Recovery from "../../../components/Recovery";
import { need } from "../../../lib/server";
export const metadata = { title: "Recovery email", robots: { index: false } };
export default async function Page() { const { verified_email } = await need("account/recovery", "/account/recovery/"); return <Recovery verified={verified_email} />; }
