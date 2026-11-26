"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { Arrow } from "../HomeQuestion";
import LearnPreview from "./LearnPreview";
import PracticePreview from "./PracticePreview";
import TutorPreview from "./TutorPreview";
import css from "../home.module.css";

const TABS = [
  { id: "learn", title: "Learn", lines: ["176 lessons", "41 hours"] },
  { id: "practice", title: "Practice", lines: ["18,500+ questions", "Timed mocks"] },
  { id: "tutor", title: "AI Tutor", lines: ["Hints and explanations", "Diagrams"] },
];

function tabFromHash(hash) {
  const id = hash.replace("#", "");
  if (id === "practice-report") return "practice";
  return TABS.some((tab) => tab.id === id) ? id : null;
}

export default function StudySwitcher() {
  const [tab, setTab] = useState("learn");
  const [stuck, setStuck] = useState(false);
  const sentinel = useRef(null);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      setStuck(entry.boundingClientRect.top < 74);
    }, { threshold: [0, 1] });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-study-stuck", stuck);
    return () => document.documentElement.removeAttribute("data-study-stuck");
  }, [stuck]);

  useEffect(() => {
    const apply = () => {
      const next = tabFromHash(window.location.hash);
      if (next) setTab(next);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  function choose(id) {
    setTab(id);
    const url = `${window.location.pathname}${window.location.search}#${id}`;
    window.history.replaceState(null, "", url);
    requestAnimationFrame(() => {
      const panel = document.getElementById(`${id}-panel`);
      const bar = document.getElementById(id)?.parentElement;
      if (!panel || !bar) return;
      const stickyTop = Number.parseFloat(getComputedStyle(bar).top) || 0;
      const top = panel.getBoundingClientRect().top + window.scrollY - stickyTop - bar.getBoundingClientRect().height;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
  }

  function onKey(event) {
    const index = TABS.findIndex((item) => item.id === tab);
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = event.key === "ArrowRight" ? (index + 1) % TABS.length : (index + TABS.length - 1) % TABS.length;
    choose(TABS[next].id);
    event.currentTarget.querySelector(`#${TABS[next].id}`)?.focus();
  }

  return <section id="study" className={`${css.section} ${css.sectionAlt} ${css.studySwitch}`} aria-label="Learn, practice and AI Tutor">
    <div className={css.wrap}>
      <div ref={sentinel} className={css.studySentinel} aria-hidden="true" />
      <div className={`${css.studyIndex} ${stuck ? css.studyStuck : ""}`} role="tablist" aria-label="Explore SSC Pitara" onKeyDown={onKey}>
        {TABS.map((item, index) => <Fragment key={item.id}>
          {index > 0 && <span className={css.studyJoin} aria-hidden="true"><Arrow /></span>}
          <button type="button" role="tab" id={item.id} aria-selected={tab === item.id} aria-controls={`${item.id}-panel`} onClick={() => choose(item.id)}>
            <span><strong>{item.title}</strong><small>{item.lines[0]}<span className={css.studyDot} aria-hidden="true"> · </span>{item.lines[1]}</small></span>
            <Arrow />
          </button>
        </Fragment>)}
      </div>

      <div role="tabpanel" id="learn-panel" aria-labelledby="learn" hidden={tab !== "learn"}>
        <div className={`${css.sectionSplitHead} ${css.learnTitleHead}`}>
          <div>
            <span className={css.eyebrow}>Learn &amp; Revise</span>
            <div className={css.learnTitleRow}>
              <h2 className={css.editorialHeading}>Learn one topic at a time</h2>
              <Link href="/learn/cgl/" className={css.primaryCta}>Explore CGL lessons <Arrow /></Link>
            </div>
          </div>
        </div>
        <LearnPreview />
      </div>

      <div role="tabpanel" id="practice-panel" aria-labelledby="practice" hidden={tab !== "practice"}>
        <div className={css.sectionSplitHead}>
          <div>
            <span className={css.eyebrow}>PYQs &amp; Timed Mocks</span>
            <h2 className={css.editorialHeading}>Where did you lose marks?</h2>
            <p>A sample of the timed test, then the score and coaching.</p>
          </div>
          <div className={css.sectionCtas}>
            <Link href="/pyq/" className={css.primaryCta}>Browse past papers <Arrow /></Link>
            <Link href="/study/practice/" className={css.secondaryCta}>Explore mock tests</Link>
          </div>
        </div>
        <PracticePreview />
      </div>

      <div role="tabpanel" id="tutor-panel" aria-labelledby="tutor" hidden={tab !== "tutor"}>
        <div className={css.sectionSplitHead}>
          <div>
            <span className={css.eyebrow}>AI Tutor</span>
            <h2 className={css.editorialHeading}>Ask anything</h2>
            <p>A sample answer, with the diagram the tutor draws.</p>
          </div>
          <div className={css.sectionCtas}>
            <Link href="/tutor/" className={css.primaryCta}>Open AI Tutor <Arrow /></Link>
          </div>
        </div>
        <TutorPreview />
      </div>
    </div>
  </section>;
}
