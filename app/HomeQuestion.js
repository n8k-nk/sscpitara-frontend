"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import css from "./home.module.css";

const OPTIONS = [200, 450, 300, 600];
const CORRECT_ANSWER = 450;

export default function HomeQuestion({ source, practice, hasPercentage }) {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const optionRefs = useRef([]);

  function selectOption(amount) {
    setSelected(amount);
    if (checked) setChecked(false);
  }

  function moveOption(event, index) {
    const direction = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!direction) return;
    event.preventDefault();
    const next = (index + direction + OPTIONS.length) % OPTIONS.length;
    selectOption(OPTIONS[next]);
    optionRefs.current[next]?.focus();
  }

  function checkAnswer() {
    if (selected === null) return;
    setChecked(true);
  }

  const isCorrect = checked && selected === CORRECT_ANSWER;

  return (
    <div className={css.question} id="try-question" tabIndex={-1}>
      <div className={css.questionTop}>
        <span className={css.questionBadge}>SSC CGL · Tier I</span>
        <span className={css.questionTopic}>Quantitative Aptitude · Percentage</span>
      </div>

      <div className={css.questionBody}>
        <p className={css.source}>
          {source ? "27 Oct 2026 · Shift 2 · Question 2" : "Sample CGL Tier I question"}
        </p>
        <h2 id="sample-question">
          A person spends 40% of his salary on rent, 25% on food, and saves ₹600. If his salary is ₹3,000, how much does he spend on other expenses?
        </h2>

        <div className={css.options} role="radiogroup" aria-labelledby="sample-question">
          {OPTIONS.map((amount, index) => {
            const isPicked = selected === amount;
            let resultState;
            if (checked) {
              if (amount === CORRECT_ANSWER) resultState = "correct";
              else if (isPicked) resultState = "incorrect";
            }
            return (
              <button
                key={amount}
                type="button"
                role="radio"
                ref={(node) => { optionRefs.current[index] = node; }}
                tabIndex={isPicked || (selected === null && index === 0) ? 0 : -1}
                onKeyDown={(event) => moveOption(event, index)}
                aria-checked={isPicked}
                data-selected={isPicked && !checked ? "true" : undefined}
                data-result={resultState}
                onClick={() => selectOption(amount)}
              >
                <span className={css.optionLetter} aria-hidden="true">{"ABCD"[index]}</span>
                <span>₹{amount}</span>
              </button>
            );
          })}
        </div>

        <div className={css.checkRow}>
          <button
            type="button"
            className={css.checkBtn}
            disabled={selected === null || checked}
            onClick={checkAnswer}
          >
            Check answer
          </button>
          {!checked && (
            <span className={css.checkHint}>
              {selected === null ? "Select an option to check." : `Option ${"ABCD"[OPTIONS.indexOf(selected)]} selected`}
            </span>
          )}
        </div>

        <div aria-live="polite" aria-atomic="true">
          {checked && (
            <div className={css.answer} data-tone={isCorrect ? "ok" : "bad"}>
              <strong>
                {isCorrect ? "Correct — ₹450." : "Not quite — the correct answer is ₹450."}
              </strong>
              <p>
                Rent and food take 40% + 25% = 65% of ₹3,000. The remaining 35% is ₹1,050. Subtract ₹600 in savings to get ₹450 on other expenses.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className={css.questionFoot}>
        {checked ? (
          <>
            <Link href={practice} className={css.questionNext}>
              {hasPercentage ? "Practise more questions" : "Browse past questions"} <Arrow />
            </Link>
            {source ? (
              <Link href={source} className={css.sourceLink}>
                View source question ↗
              </Link>
            ) : (
              <Link href="/pyq/" className={css.sourceLink}>
                Browse paper archive ↗
              </Link>
            )}
          </>
        ) : (
          <span className={css.footMuted}>No sign-up needed · Working and source appear after checking</span>
        )}
      </div>
    </div>
  );
}

export function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </svg>
  );
}
