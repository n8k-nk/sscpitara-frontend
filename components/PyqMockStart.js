"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { send } from "../lib/client";

export default function PyqMockStart({ paper }) {
  const router = useRouter();
  const key = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setBusy(true);
    setError("");
    try {
      if (document.fullscreenEnabled && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setError("Allow fullscreen in your browser, then try again.");
      setBusy(false);
      return;
    }
    key.current ??= crypto.randomUUID();
    const { ok, data } = await send("study/start-pyq-mock", { paper: paper.slug, key: key.current });
    if (ok) {
      router.push(`/study/attempt/${data.attempt}/`);
      return;
    }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setError(data.error ?? "Could not start this mock.");
    setBusy(false);
  }

  return <details className="pyq-mock-start">
    <summary>Attempt as a mock <span className="badge">Premium</span></summary>
    <p>{paper.duration_minutes} minutes · {paper.questions} questions</p>
    <p>Stay on this tab and keep fullscreen open. Leaving the tab or fullscreen submits your saved answers. If you already have a mock in progress, you’ll resume it.</p>
    <button type="button" disabled={busy} onClick={start}>{busy ? "Opening mock…" : "Start timed mock"}</button>
    {error && <p className="errorlist" role="alert">{error}</p>}
  </details>;
}
