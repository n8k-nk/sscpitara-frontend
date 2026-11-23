import Link from "next/link";
import AuthShell from "./AuthShell";

const mail = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg>;

/** Centred confirmation card with a single follow-up link. */
export default function Done({ title, detail, href = "/study/", label = "Back to today’s plan" }) {
  return <AuthShell title={title} sub={detail} icon={mail}><Link className="button block" href={href}>{label}</Link></AuthShell>;
}
