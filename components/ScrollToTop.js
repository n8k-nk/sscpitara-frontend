"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Open every new page at the top. Next.js otherwise keeps the old scroll position whenever the new page
 * already covers the screen. Back, forward, #anchors and filter changes keep their own position.
 */
export default function ScrollToTop() {
  const page = `${usePathname()}?${useSearchParams().get("page") ?? ""}`;
  const shown = useRef(page);
  const history = useRef(false);

  useEffect(() => {
    const back = () => { history.current = true; };
    const click = () => { history.current = false; };
    window.addEventListener("popstate", back);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("popstate", back);
      document.removeEventListener("click", click, true);
    };
  }, []);

  useLayoutEffect(() => {
    if (shown.current === page) return;
    shown.current = page;
    if (!history.current && !window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    history.current = false;
  }, [page]);

  return null;
}
