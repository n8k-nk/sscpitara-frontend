"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { send } from "../lib/client";

export default function MockFrame({ id, children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");
  const frame = useRef(null);
  const active = useRef(false);
  const reason = useRef(null);
  const sending = useRef(false);
  const exitTimer = useRef(null);
  const key = `ssc-mock-submit:${id}`;

  async function submit(why) {
    if (sending.current) return;
    reason.current ??= why;
    try { sessionStorage.setItem(key, reason.current); } catch { /* optional recovery */ }
    sending.current = true;
    setEnding(true);
    setError("");
    const { ok, data } = await send(`study/attempts/${id}/submit`, { reason: reason.current }, "POST", { keepalive: true });
    sending.current = false;
    if (ok) {
      try { sessionStorage.removeItem(key); } catch { /* optional recovery */ }
      router.replace(`/study/attempt/${id}/results/`);
    } else {
      setError(data.error ?? "Unable to submit. Reconnect and retry.");
    }
  }

  useEffect(() => {
    clearTimeout(exitTimer.current);
    try { reason.current = sessionStorage.getItem(key); } catch { /* optional recovery */ }
    active.current = !document.fullscreenEnabled || Boolean(document.fullscreenElement);
    setReady(active.current);
    frame.current?.focus({ preventScroll: true });
    const chrome = [...document.querySelectorAll(".site-header, .site-footer, .skip")].filter((node) => !node.inert);
    chrome.forEach((node) => { node.inert = true; });
    if (reason.current) submit(reason.current);
    else if (document.hidden) submit("tab_switch");

    function visibility() {
      if (document.hidden) submit("tab_switch");
      else if (reason.current) submit(reason.current);
    }
    function fullscreen() {
      if (document.fullscreenElement) {
        active.current = true;
        setReady(true);
      } else if (active.current) {
        submit("fullscreen_exit");
      }
    }
    const pageExit = () => submit("page_exit");
    const online = () => { if (reason.current) submit(reason.current); };
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("fullscreenchange", fullscreen);
    window.addEventListener("pagehide", pageExit);
    window.addEventListener("online", online);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("fullscreenchange", fullscreen);
      window.removeEventListener("pagehide", pageExit);
      window.removeEventListener("online", online);
      chrome.forEach((node) => { node.inert = false; });
      exitTimer.current = setTimeout(() => {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      }, 0);
    };
  }, [id]);

  return <div className="mock-frame" ref={frame} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Timed PYQ mock"><div className="mock-inner">
    {ending ? <div className="notice" role="status">
      <p>{error || "Submitting your saved answers…"}</p>
      {error && <button type="button" onClick={() => submit(reason.current)}>Retry submission</button>}
    </div> : ready ? children : <div className="notice">
      <h1>Enter fullscreen to resume</h1>
      <p>The test timer continues while you’re away.</p>
      <button type="button" onClick={() => document.documentElement.requestFullscreen()
        .catch(() => setError("Allow fullscreen in your browser, then try again."))}>Resume in fullscreen</button>
      {error && <p className="errorlist" role="alert">{error}</p>}
    </div>}
  </div></div>;
}
