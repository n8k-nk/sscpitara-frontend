"use client";
import { useEffect } from "react";

/** Topics are collapsed by default; open the one a #t-slug link points at (search results, the lesson's back link, the topic list). */
export default function OpenTopic() {
  useEffect(() => {
    function open(hash) {
      const block = hash.startsWith("#t-") && document.getElementById(decodeURIComponent(hash.slice(1)));
      if (block && !block.open) { block.open = true; block.scrollIntoView(); }
    }
    const onHash = () => open(window.location.hash);
    // A repeat click on the same topic leaves the hash unchanged, so listen for the click too.
    const onClick = (event) => { const link = event.target.closest?.('a[href^="#t-"]'); if (link) open(link.getAttribute("href")); };
    onHash();
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick);
    return () => { window.removeEventListener("hashchange", onHash); document.removeEventListener("click", onClick); };
  }, []);
  return null;
}
