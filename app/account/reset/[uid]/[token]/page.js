import ResetConfirm from "../../../../../components/ResetConfirm";
export const metadata = { title: "Choose a new password", robots: { index: false } };
export default async function Confirm({ params }) { const { uid, token } = await params; return <ResetConfirm uid={uid} token={token} />; }
