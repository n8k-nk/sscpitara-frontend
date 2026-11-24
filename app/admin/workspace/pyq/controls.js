"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { send } from "../../../../lib/client";

export function UploadPapers({ maxBytes, maxPapers }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState("");
  const [feedback, setFeedback] = useState(null);

  useEffect(() => { setReady(true); }, []);

  async function submit(event) {
    event.preventDefault();
    const file = event.currentTarget.elements.namedItem("archive").files[0];
    const mode = event.nativeEvent.submitter?.value || "validate";
    if (!file || busy) return;
    if (file.size > maxBytes) {
      setFeedback({ error: `Choose a ZIP up to ${maxBytes / 1024 ** 2} MiB.` });
      return;
    }
    setBusy(mode);
    setFeedback(null);
    const { ok, data } = await send(`admin/pyq/upload/${mode}`, file);
    setBusy("");
    if (!ok) {
      setFeedback({ error: data.error || "Upload failed. Check the ZIP and try again." });
      return;
    }
    setFeedback({ mode, results: data.results });
    if (mode === "import") router.refresh();
  }

  const results = feedback?.results;
  const passed = results?.filter((row) => !row.errors).length;
  const validating = feedback?.mode === "validate";
  const disabled = !ready || Boolean(busy);
  return <section className="card" aria-labelledby="upload-papers">
    <h2 id="upload-papers">Upload a PYQ ZIP</h2>
    <p>Each paper needs a <code>paper.json</code> and its referenced images. New papers start as drafts. Re-importing replaces the paper’s contents and keeps its publication status.</p>
    <form method="post" onSubmit={submit}>
      <div className="profile-field">
        <label htmlFor="pyq-archive">Paper or batch ZIP</label>
        <input id="pyq-archive" name="archive" type="file" accept=".zip,application/zip" required
          disabled={disabled} onChange={() => setFeedback(null)} />
        <small>Up to {maxBytes / 1024 ** 2} MiB and {maxPapers} papers.</small>
      </div>
      <div className="actions">
        <button type="submit" value="validate" className="secondary" disabled={disabled}>
          {busy === "validate" ? "Validating…" : "Validate ZIP"}
        </button>
        <button type="submit" value="import" disabled={disabled}>
          {busy === "import" ? "Importing…" : "Import papers"}
        </button>
      </div>
    </form>
    {feedback?.error && <p className="errorlist" role="alert">{feedback.error}</p>}
    {results && <>
      <p role="status">{passed} {validating ? "validated" : "imported"}, {results.length - passed} failed.</p>
      <ul className="rows">{results.map((row) => <li key={row.source}>
        <div>
          <strong>{row.title ?? row.source}</strong>
          {row.errors ? <ul className="errorlist">{row.errors.map((error, index) => <li key={index}>{error}</li>)}</ul>
            : <p>{row.questions} questions, {row.images} images · {validating
              ? (row.created ? "Would create" : "Would update")
              : (row.created ? "Created" : "Updated")} · {row.status}</p>}
          {row.new_taxonomy?.length > 0 && <small>Topics or subtopics to review · {row.new_taxonomy.join(", ")}</small>}
        </div>
      </li>)}</ul>
    </>}
  </section>;
}

export function PaperStatus({ paper }) {
  const router = useRouter();
  const [status, setStatus] = useState(paper.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const publish = status !== "published";

  async function update() {
    setBusy(true);
    setError("");
    const { ok, data } = await send(`admin/pyq/papers/${paper.id}/status`, { status: publish ? "published" : "draft" });
    if (ok) {
      setStatus(data.status);
      router.refresh();
    } else {
      setError(data.error || "Could not update this paper.");
    }
    setBusy(false);
  }

  return <>
    <button type="button" className="secondary" disabled={busy} onClick={update}
      aria-label={`${publish ? "Publish" : "Unpublish"} ${paper.title}`}>
      {busy ? "Saving…" : publish ? "Publish" : "Unpublish"}
    </button>
    {error && <small className="errorlist" role="alert">{error}</small>}
  </>;
}
