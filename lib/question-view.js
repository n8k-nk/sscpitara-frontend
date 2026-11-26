"use client";

import { useEffect, useRef } from "react";
import { send } from "./client";

const queued = new Set();
let flushTimer;

function queue(id) {
  queued.add(id);
  clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, 250);
}

async function flush() {
  const ids = [...queued];
  queued.clear();
  for (let start = 0; start < ids.length; start += 40) {
    const questions = ids.slice(start, start + 40);
    const result = await send("pyq/views", { questions }, "POST", { keepalive: true });
    if (!result.ok && (result.status === 0 || result.status >= 500)) {
      setTimeout(() => send("pyq/views", { questions }, "POST", { keepalive: true }), 1500);
    }
  }
}

export function useQuestionView(id) {
  const ref = useRef(null);
  useEffect(() => {
    if (!id || !ref.current || !("IntersectionObserver" in window)) return;
    let timer;
    let visible = false;
    const begin = () => {
      clearTimeout(timer);
      if (!visible || document.visibilityState !== "visible") return;
      timer = setTimeout(() => {
        queue(id);
        observer.disconnect();
        document.removeEventListener("visibilitychange", begin);
      }, 2000);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      begin();
    });
    observer.observe(ref.current);
    document.addEventListener("visibilitychange", begin);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", begin);
    };
  }, [id]);
  return ref;
}
