"use client";

import { useEffect, useRef, useState } from "react";
import css from "../home.module.css";

const steps = ["Learn", "Revision", "Practice", "AI Tutor"];
const lesson = "Statements and conclusions";
const statements = "All pens are books. Some books are pages.";
const conclusion = "Some pens are pages.";

export default function HeroPreview() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const body = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(true);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const scroll = window.setTimeout(() => {
      body.current?.scrollTo({ top: body.current.scrollHeight, behavior: "smooth" });
    }, 1600);
    const next = window.setTimeout(() => {
      if (step === steps.length - 1) setPlaying(false);
      else {
        setStep(step + 1);
        setRevealed(step === 0 || step === 2);
        setAnswer(step === 1 ? false : null);
      }
    }, 5500);
    return () => {
      window.clearTimeout(scroll);
      window.clearTimeout(next);
    };
  }, [playing, step]);

  function select(index) {
    setPlaying(false);
    setStep(index);
    setAnswer(null);
    setRevealed(false);
  }

  return <section className={css.productPreview} aria-label="SSC Pitara product preview">
    <div className={css.previewHeader}>
      <span>SSC Pitara <small>· Product preview</small></span>
      <button type="button" onClick={() => {
        if (!playing && step === steps.length - 1) setStep(0);
        setPlaying(!playing);
      }}>{playing ? "Pause" : "Play"}</button>
    </div>
    <div className={css.previewSteps} aria-label="Preview sections">
      {steps.map((label, index) => <button type="button" key={label} aria-pressed={index === step}
        onClick={() => select(index)}>{label}</button>)}
    </div>
    <div key={step} ref={body} className={css.previewBody} data-playing={playing || undefined}
      tabIndex={0} aria-label={`${steps[step]} example`} onWheel={() => setPlaying(false)} onTouchStart={() => setPlaying(false)}>
      {step === 0 && <>
        <small>Learn / General Intelligence &amp; Reasoning</small>
        <h2>{lesson}</h2>
        <div className={css.previewMeter} aria-label="Lesson progress"><span /></div>
        <div className={css.previewRow}><strong>Rule &amp; example</strong></div>
        <p>A conclusion follows only if it must be true in every arrangement allowed by the statements.</p>
        <div className={css.previewRow}><strong>Worked example</strong></div>
        <p>{statements} The books that are pages could be entirely separate from the pens.</p>
        <div className={`${css.previewRow} ${css.previewComplete}`}><strong>Lesson completed</strong><span>✓</span></div>
      </>}
      {step === 1 && <>
        <small>Revision / Due today</small>
        <h2>{lesson}</h2>
        <p>When does a conclusion follow from the statements?</p>
        <button className={css.previewOption} type="button" aria-expanded={revealed}
          onClick={() => { setPlaying(false); setRevealed(!revealed); }}>{revealed ? "Hide answer" : "Reveal answer"}</button>
        {revealed && <p>When the statements make the conclusion true in every possible arrangement.</p>}
      </>}
      {step === 2 && <>
        <small>Practice / Reasoning / Syllogism</small>
        <h2>Does the conclusion follow?</h2>
        <p>{statements}</p>
        <p><strong>Conclusion</strong> {conclusion}</p>
        {[true, false].map((choice) => <button key={String(choice)} type="button" className={css.previewOption}
          aria-pressed={answer === choice} onClick={() => { setPlaying(false); setAnswer(choice); }}>
          {choice ? "Follows" : "Does not follow"}
        </button>)}
        {answer !== null && <p role="status">{answer ? "Try again. " : "Correct. "}The books that are pages may contain no pens.</p>}
      </>}
      {step === 3 && <>
        <small>AI Tutor / Example conversation</small>
        <h2>Get a first-step hint</h2>
        <p className={css.previewPrompt}>How can I tell whether some pens are pages?</p>
        <button className={css.previewOption} type="button" aria-expanded={revealed}
          onClick={() => { setPlaying(false); setRevealed(!revealed); }}>{revealed ? "Hide hint" : "Show hint"}</button>
        {revealed && <p>Draw a circle for books. Put all pens inside it, then place the pages that are books outside the pens. Do both statements still hold?</p>}
      </>}
    </div>
  </section>;
}
