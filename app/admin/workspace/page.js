import Link from "next/link";
import { getWorkspace } from "./server";

const COUNTS = {
  learners: "Learner accounts",
  profiles: "Learner profiles",
  active: "Learners who visited Study in the last 7 days",
};

const MANAGEMENT = [
  ["users", "/admin/auth/user/", "Manage users"],
  ["profiles", "/admin/exams/learnerprofile/", "View learner profiles"],
  ["activity", "/admin/exams/learnerday/", "View study activity"],
  ["support", "/admin/exams/supportrequest/", "Manage support requests"],
];

export default async function AdminOverview() {
  const { ok, data } = await getWorkspace();
  if (!ok) return null;
  const counts = Object.entries(data.counts);
  const management = MANAGEMENT.filter(([permission]) => data.modules[permission]);

  return <>
    <div className="page-head"><h1>Admin workspace</h1></div>
    {counts.length > 0 && <section aria-labelledby="admin-activity">
      <h2 id="admin-activity">Learner activity</h2>
      <ul className="stats">{counts.map(([key, count]) =>
        <li key={key}><strong>{count.toLocaleString("en-IN")}</strong><span>{COUNTS[key]}</span></li>
      )}</ul>
    </section>}
    {data.modules.pyq && <section className="card" aria-labelledby="admin-content">
      <h2 id="admin-content">Previous-year questions</h2>
      <p>Validate ZIP batches, import papers and manage what learners can see.</p>
      <Link className="button" href="/admin/workspace/pyq/">Manage PYQ papers</Link>
    </section>}
    {management.length > 0 && <section className="card" aria-labelledby="admin-users">
      <h2 id="admin-users">Users and support</h2>
      <ul className="rows">{management.map(([key, href, label]) =>
        <li key={key}><a href={href}>{label}</a></li>
      )}</ul>
    </section>}
  </>;
}
