"use client";

import { useEffect, useState } from "react";
import css from "../home.module.css";

const SECTIONS = [
  { name: "Reasoning", done: 18, total: 25 },
  { name: "GA", done: 12, total: 25 },
  { name: "Quant", done: 6, total: 25, current: true },
  { name: "English", done: 0, total: 25 },
];

const QUESTIONS = [
  {
    n: 14,
    stem: "If the price of sugar increases by 25%, by what percent should consumption be reduced so expenditure stays the same?",
    options: ["20%", "25%", "16.67%", "30%"],
  },
  {
    n: 15,
    stem: "A 150 m train passes a pole in 15 seconds. What is its speed in km/h?",
    options: ["36", "45", "54", "60"],
  },
];

const PALETTE = [
  { n: 11, state: "answered" },
  { n: 12, state: "answered" },
  { n: 13, state: "review" },
  { n: 14, state: "current" },
  { n: 15, state: "unseen" },
  { n: 16, state: "unseen" },
  { n: 17, state: "unanswered" },
  { n: 18, state: "unseen" },
  { n: 19, state: "unseen" },
  { n: 20, state: "unseen" },
  { n: 21, state: "unseen" },
  { n: 22, state: "unseen" },
];

const LOSSES = [
  { topic: "Percentage", subject: "Quant", detail: "4 incorrect" },
  { topic: "Syllogism", subject: "Reasoning", detail: "2 incorrect · 1 skipped" },
];

export default function PracticePreview() {
  const [view, setView] = useState("cbt");
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState(null);
  const [marked, setMarked] = useState(false);

  useEffect(() => {
    const apply = () => {
      if (window.location.hash === "#practice-report") setView("result");
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const question = QUESTIONS[at];

  function open(next) {
    setView(next);
    if (next === "result" && window.location.hash !== "#practice-report") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#practice-report`);
    }
  }

  function jump(index) {
    setAt(index);
    setPicked(null);
    setMarked(false);
  }

  return (
    <div className={css.sampleSwitch}>
      <div className={css.sampleTabs} role="tablist" aria-label="Practice sample">
        <button type="button" role="tab" aria-selected={view === "cbt"} onClick={() => open("cbt")}>Test</button>
        <button type="button" role="tab" id="practice-report" aria-selected={view === "result"} onClick={() => open("result")}>Result and AI</button>
      </div>

      {view === "cbt" ? (
        <div className={css.cbt} role="tabpanel">
          <header className={css.cbtHead}>
            <div>
              <strong>SSC CGL · Tier I</strong>
              <small>Exam mode · Sample</small>
            </div>
            <div className={css.cbtTime}>
              <span>Time remaining</span>
              <b>42:18</b>
            </div>
            <span className={css.cbtSubmit}>Submit test</span>
          </header>
          <div className={css.cbtSections}>
            {SECTIONS.map((section) => (
              <div key={section.name} data-current={section.current ? "true" : undefined}>
                <strong>{section.name}</strong>
                <span>{section.done} / {section.total}</span>
              </div>
            ))}
          </div>
          <div className={css.cbtBody}>
            <div className={css.cbtQuestion}>
              <div className={css.cbtQtop}>
                <h3>Question {question.n} of 100</h3>
                <span className={css.cbtMarks}><b>+2</b><b>−0.50</b></span>
              </div>
              <p>{question.stem}</p>
              <div className={css.cbtOptions}>
                {question.options.map((option, index) => (
                  <button key={option} type="button" aria-pressed={picked === index} onClick={() => setPicked(index)}>
                    <span>{String.fromCharCode(65 + index)}</span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <aside className={css.cbtPalette} aria-label="Question palette">
              <strong>Question palette</strong>
              <ul>
                <li data-state="answered">Answered</li>
                <li data-state="unanswered">Unanswered</li>
                <li data-state="review">Review</li>
                <li data-state="unseen">Not visited</li>
              </ul>
              <div>
                {PALETTE.map((cell) => {
                  const on = cell.n === question.n;
                  const state = on ? (marked ? "review" : picked != null ? "answered" : "current") : cell.state === "current" ? "unseen" : cell.state;
                  const index = QUESTIONS.findIndex((item) => item.n === cell.n);
                  return (
                    <button key={cell.n} type="button" data-state={state} aria-current={on ? "page" : undefined} onClick={() => index >= 0 && jump(index)}>
                      {cell.n}
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>
          <footer className={css.cbtFoot}>
            <button type="button" disabled={at === 0} onClick={() => jump(at - 1)}>Previous</button>
            <button type="button" onClick={() => setPicked(null)}>Clear</button>
            <button type="button" aria-pressed={marked} onClick={() => setMarked((value) => !value)}>{marked ? "Unmark review" : "Mark for review"}</button>
            <button type="button" className={css.cbtNext} disabled={at === QUESTIONS.length - 1} onClick={() => jump(at + 1)}>Save & next</button>
          </footer>
        </div>
      ) : (
        <div className={css.afterMock} role="tabpanel">
          <header className={css.mockScore}>
            <div>
              <small>SSC CGL 2026 · Tier I · Sample</small>
              <h3>Mock results</h3>
            </div>
            <p><span>Net score</span><strong>118.5 <small>/ 200</small></strong></p>
            <dl>
              <div><dt>Accuracy</dt><dd>71%</dd></div>
              <div><dt>Attempted</dt><dd>84<small> / 100</small></dd></div>
              <div><dt>Time used</dt><dd>54m</dd></div>
            </dl>
            <footer>135 marks earned · 16.5 deducted · Submitted · 60 min limit</footer>
          </header>
          <div className={css.mockLower}>
            <section>
              <h4>Where you lost marks</h4>
              <ul>
                {LOSSES.map((row) => (
                  <li key={row.topic}>
                    <span><strong>{row.topic}</strong><small>{row.subject}</small></span>
                    <em>{row.detail}</em>
                  </li>
                ))}
              </ul>
            </section>
            <section className={css.mockCoach}>
              <h4>AI coaching</h4>
              <p>The largest gap is Percentage. A 25% price rise needs a 20% cut in quantity, not a 25% cut. Practise that next, then the syllogism mistakes.</p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
