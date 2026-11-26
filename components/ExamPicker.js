"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { arenaQuery } from "../app/games/catalog";
import { STUDY_SCOPE_COOKIE, scopeKey, scopedAnalytics, scopedPyqs } from "../lib/study-scope-paths";

function pageScope(path, query, scopes) {
  const [section, examSlug, part, stageSlug] = path.split("/").filter(Boolean);
  if (section === "analytics" || (section === "learn" && examSlug === "exam")) {
    return scopes.find((scope) => scope.exam === query.get("exam") && scope.stage === query.get("stage"));
  }
  if (section === "pyq" && examSlug) {
    return scopes.find((scope) => scope.exam_slug === examSlug
      && (query.get("stage") === scope.stage || stageSlug === scope.stage_slug));
  }
  if (section === "learn" && examSlug === "cgl" && part !== "review") {
    const tierTwo = ["tier-ii", "computer-knowledge", "statistics"].includes(part)
      || stageSlug === "statistics-and-probability" || query.get("from") === "tier-ii";
    return scopes.find((scope) => scope.exam_slug === "cgl" && scope.stage_slug === (tierTwo ? "tier-ii" : "tier-i"));
  }
}

function remember(scope) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${STUDY_SCOPE_COOKIE}=${scopeKey(scope)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

function closeDuration() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--dropdown-close-dur")) || 150;
}

export default function ExamPicker({ scopes, selected }) {
  const path = usePathname();
  const query = useSearchParams();
  const explicit = pageScope(path, query, scopes);
  const [remembered, setRemembered] = useState(null);
  const [phase, setPhase] = useState("closed");
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const closeTimer = useRef(0);
  const current = explicit ?? remembered ?? selected;

  useEffect(() => {
    if (explicit) {
      remember(explicit);
      setRemembered(explicit);
    }
  }, [explicit]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  function openMenu() {
    window.clearTimeout(closeTimer.current);
    setPhase("open");
  }

  function closeMenu() {
    setPhase((value) => {
      if (value !== "open") return value;
      closeTimer.current = window.setTimeout(() => setPhase("closed"), closeDuration());
      return "closing";
    });
  }

  useEffect(() => {
    if (phase !== "open") return undefined;
    menuRef.current?.querySelector("[aria-selected='true']")?.focus();
    function onPointer(event) {
      if (!rootRef.current?.contains(event.target)) closeMenu();
    }
    function onKey(event) {
      if (event.key !== "Escape") return;
      closeMenu();
      triggerRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [phase]);

  if (!current) return null;

  function choose(scope) {
    closeMenu();
    if (scopeKey(scope) === scopeKey(current)) {
      triggerRef.current?.focus();
      return;
    }
    remember(scope);
    if (path.startsWith("/learn/")) location.assign(scope.learn_href ?? "/learn/");
    else if (path.startsWith("/pyq/")) location.assign(scope.has_pyq ? scopedPyqs(scope, path.includes("/topics/")) : "/pyq/");
    else if (path.startsWith("/games/")) location.assign(`/games/${arenaQuery(scope.exam, scope.stage)}`);
    else if (path.startsWith("/analytics/")) location.assign(scopedAnalytics(scope, path.split("/")[2]));
    else location.reload();
  }

  function onMenuKey(event) {
    const options = [...menuRef.current.querySelectorAll("[role='option']")];
    const index = options.indexOf(document.activeElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      options[Math.min(index + 1, options.length - 1)]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      options[index <= 0 ? 0 : index - 1]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      options[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      options.at(-1)?.focus();
    }
  }

  const open = phase === "open";

  return <div className="site-exam" ref={rootRef}>
    <span id="exam-label">Exam</span>
    <div className="exam-menu">
      <button
        ref={triggerRef}
        id="exam-switch"
        type="button"
        className="exam-trigger"
        aria-labelledby="exam-label exam-switch"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="exam-menu"
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          openMenu();
        }}
      >{current.exam} · {current.stage}</button>
      <div
        ref={menuRef}
        id="exam-menu"
        className={`t-dropdown${open ? " is-open" : ""}${phase === "closing" ? " is-closing" : ""}`}
        data-origin="top-right"
        role="listbox"
        aria-labelledby="exam-label"
        inert={open ? undefined : true}
        onKeyDown={onMenuKey}
      >
        {scopes.map((scope) => {
          const selectedScope = scopeKey(scope) === scopeKey(current);
          return <button
            key={scopeKey(scope)}
            type="button"
            role="option"
            aria-selected={selectedScope}
            onClick={() => choose(scope)}
          >
            <span>{scope.exam} · {scope.stage}</span>
            {selectedScope && <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m3 8 3 3 7-7" />
            </svg>}
          </button>;
        })}
      </div>
    </div>
  </div>;
}
