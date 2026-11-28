"use client";
import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { rankSearch } from "./fuzzy";

const KIND = { subject: "Subject", topic: "Topic", skill: "Skill" };

/** Fuzzy search over subjects, chapters and skills. Lives on the learn overview, above the subject cards. */
export default function TopicSearch({ items }) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const hits = useMemo(() => rankSearch(query, items), [query, items]);
  const index = hits.length ? Math.min(active, hits.length - 1) : 0;
  const typed = query.trim().length >= 2;

  function onSubmit(e) {
    e.preventDefault();
    if (hits[index]) router.push(hits[index].href);
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown" && hits.length) {
      e.preventDefault();
      setActive((index + 1) % hits.length);
    } else if (e.key === "ArrowUp" && hits.length) {
      e.preventDefault();
      setActive((index - 1 + hits.length) % hits.length);
    }
  }

  return <form className="topic-search" role="search" onSubmit={onSubmit}>
    <label className="topic-search-label" htmlFor="learn-search">Find a chapter or topic</label>
    <div className="topic-search-row">
      <input id="learn-search" type="search" value={query} autoComplete="off" placeholder="Percentage, coding, polygons…"
        aria-autocomplete="list" aria-controls={listId} aria-expanded={typed} aria-activedescendant={typed && hits[index] ? `${listId}-${index}` : undefined}
        onChange={(e) => { setQuery(e.target.value); setActive(0); }} onKeyDown={onKeyDown} />
      <button type="submit" aria-label="Search">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
      </button>
    </div>
    {typed && <div className="topic-hits" id={listId} role="listbox" aria-label="Matching chapters and topics">
      {hits.length ? <ul>{hits.map((hit, i) => <li key={hit.href} role="none">
        <Link id={`${listId}-${i}`} role="option" aria-selected={i === index} className={i === index ? "on" : undefined} href={hit.href}
          onMouseEnter={() => setActive(i)}>
          <span><strong>{hit.title}</strong>{(hit.topic || hit.subject) && <span className="where">{[hit.topic, hit.subject].filter(Boolean).join(" · ")}</span>}</span>
          <span className="kind">{KIND[hit.kind]}</span>
        </Link></li>)}</ul>
        : <p className="muted small">No chapter or topic matches “{query.trim()}”.</p>}
    </div>}
  </form>;
}
