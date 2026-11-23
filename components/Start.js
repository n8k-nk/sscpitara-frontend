"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { send } from "../lib/client";

/** Start a practice set. Optional `select` renders a labelled dropdown whose value is sent as `topic` or `subject`. */
export default function Start({ kind, label, secondary, topic = "", subject = "", limit = 10, token, select, mock }) {
  const router = useRouter();
  const [picked, setPicked] = useState(select?.options[0] ?? "");
  const [extended, setExtended] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function go(event) {
    event.preventDefault();
    setBusy(true); setError("");
    const { ok, data } = await send("study/start", { kind, key: token, topic, subject, limit, extended, ...(select ? { [select.field]: picked } : {}) });
    if (ok) return router.push(`/study/attempt/${data.attempt}/`);
    setBusy(false);
    setError(data.error ?? "Could not start this set.");
  }
  return <form className={select ? "select-start" : "start-form"} onSubmit={go}>
    {select && <label>{select.label} <select value={picked} onChange={(e) => setPicked(e.target.value)}>{select.options.map((o) => <option key={o}>{o}</option>)}</select></label>}
    {mock && <label><input type="checkbox" checked={extended} onChange={(e) => setExtended(e.target.checked)} /> Use extended sectional time</label>}
    <button className={secondary ? "secondary" : undefined} disabled={busy}>{label}</button>
    {error && <p className="errorlist" role="alert">{error}</p>}
  </form>;
}
