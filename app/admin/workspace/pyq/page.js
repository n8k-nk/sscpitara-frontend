import Link from "next/link";
import { call } from "../../../../lib/server";
import { PaperStatus, UploadPapers } from "./controls";

export const metadata = { title: "Manage PYQ papers" };
const PATH = "/admin/workspace/pyq/";

export default async function PyqWorkspace({ searchParams }) {
  const { page } = await searchParams;
  const result = await call("admin/pyq/papers", new URLSearchParams({ page: page ?? "1" }).toString());
  if (result.status === 401 || result.status === 403) return <p>PYQ staff access is required.</p>;
  if (!result.ok) throw new Error("Could not load PYQ papers.");
  const data = result.data;

  return <>
    <div className="page-head">
      <h1>Manage PYQ papers</h1>
    </div>
    {data.can_import && <UploadPapers maxBytes={data.max_upload_bytes} maxPapers={data.max_papers} />}
    <section className="card" aria-labelledby="paper-list">
      <h2 id="paper-list">Papers ({data.total})</h2>
      {data.papers.length ? <ul className="rows">{data.papers.map((paper) =>
        <li key={paper.id}>
          <div>
            <strong>{paper.title}</strong><br />
            <small>{paper.questions} questions · {paper.status === "published" ? "Published" : "Draft"}</small>
          </div>
          <div className="actions">
            <a href={`/admin/pyq/paper/${paper.id}/change/`}>Open paper</a>
            {data.can_change && <PaperStatus paper={paper} />}
          </div>
        </li>
      )}</ul> : <p>No papers have been imported.</p>}
      {data.pages > 1 && <nav className="actions" aria-label="Paper pages">
        {data.page > 1 && <Link href={`${PATH}?page=${data.page - 1}`}>Previous</Link>}
        <span>Page {data.page} of {data.pages}</span>
        {data.page < data.pages && <Link href={`${PATH}?page=${data.page + 1}`}>Next</Link>}
      </nav>}
    </section>
  </>;
}
