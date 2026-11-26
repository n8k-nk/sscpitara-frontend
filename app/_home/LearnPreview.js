"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Rich from "../../components/Rich";
import { LEARN_SAMPLE as lesson } from "./learnSample";
import css from "../home.module.css";

export default function LearnPreview() {
  const [stepIndex, setStepIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState(null);
  const [companionTab, setCompanionTab] = useState("match");
  const [pickedLeft, setPickedLeft] = useState(null);
  const [matched, setMatched] = useState([]);
  const [matchMsg, setMatchMsg] = useState(null);
  const scroller = useRef(null);
  const noteScroller = useRef(null);

  const last = lesson.steps.length - 1;
  const step = lesson.steps[stepIndex];

  function go(index) {
    setStepIndex(index);
    setRevealed(false);
    setPicked(null);
    if (scroller.current) scroller.current.scrollTop = 0;
  }

  function showNotes() {
    setCompanionTab("notes");
    if (noteScroller.current) noteScroller.current.scrollTop = 0;
  }

  function matchRight(pairIndex) {
    if (pickedLeft === null || matched.includes(pairIndex)) return;
    if (pairIndex === pickedLeft) {
      const next = [...matched, pairIndex];
      setMatched(next);
      setMatchMsg({ ok: true, text: lesson.match.pairs[pairIndex].why });
      setPickedLeft(null);
    } else {
      setMatchMsg({ ok: false, text: "Try another match." });
    }
  }

  return (
    <div className={css.learnSplit}>
      <div className={css.lessonCard}>
        <div className={css.lessonHead}>
          <div>
            <span className={css.appTag}>{lesson.subject} · {lesson.topic}</span>
            <h3>{lesson.title}</h3>
          </div>
          <div className={css.lessonBadges}>
            <span className={css.appBadgeOk}>Approved · Tier I</span>
            <span className={css.appBadgeMuted}>About {lesson.minutes} min · {lesson.questions} real questions</span>
          </div>
        </div>

        <ol className={css.stepRail} aria-label="Lesson steps">
          {lesson.steps.map((item, index) => (
            <li key={item.id} className={index < stepIndex ? css.stepDone : undefined}>
              <button
                type="button"
                aria-current={index === stepIndex ? "step" : undefined}
                aria-label={`Step ${index + 1}: ${item.title}`}
                onClick={() => go(index)}
              >
                <b>{index < stepIndex ? "✓" : index + 1}</b>
                <span className={css.stepLabel}>{item.short}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className={css.lessonScroll} ref={scroller} tabIndex={0}>
          <h4 className={css.lessonScreenTitle}>{step.title}</h4>
          {step.items?.map((item) => (
            <section key={item.type + (item.label ?? "")} className={css.lessonItem} data-type={item.type}>
              {item.type === "goal" && <p className={css.itemEyebrow}>{item.label}</p>}
              {item.label && item.type !== "goal" && item.type !== "concept" && item.type !== "checkpoint" && <h5>{item.label}</h5>}
              {item.text && <Rich>{item.text}</Rich>}
              {item.type === "checkpoint" && (
                <>
                  <p className={css.lessonPrompt}><Rich>{item.prompt}</Rich></p>
                  {revealed ? (
                    <p className={css.lessonFeedback} role="status">
                      <strong>Answer: </strong><Rich inline>{item.answer}</Rich>
                      {" "}<Rich inline>{item.explanation}</Rich>
                    </p>
                  ) : (
                    <button type="button" className={css.secondaryCta} onClick={() => setRevealed(true)}>Show the answer</button>
                  )}
                </>
              )}
            </section>
          ))}
          {step.id === "practice" && (
            <section className={css.lessonItem}>
              <p className={css.sourceLine}>
                <Link href={step.sourceHref}>{step.source}</Link>
              </p>
              <p className={css.lessonPrompt}><Rich>{step.prompt}</Rich></p>
              <div className={css.miniMcq}>
                {step.options.map((option, index) => {
                  const chosen = picked === index;
                  const state = picked === null ? undefined : index === step.answer ? "ok" : chosen ? "bad" : undefined;
                  return (
                    <button key={option} type="button" aria-pressed={chosen} data-state={state} onClick={() => setPicked(index)}>
                      <span className={css.mcqLetter}>{"ABCD"[index]}</span>
                      <Rich inline>{option}</Rich>
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <p className={css.lessonFeedback} role="status">
                  <strong>{picked === step.answer ? "Correct. " : "The answer is A. "}</strong>
                  <Rich inline>{step.explanation}</Rich>
                </p>
              )}
            </section>
          )}
        </div>

        <div className={css.lessonNav}>
          <button type="button" className={css.secondaryCta} disabled={stepIndex === 0} onClick={() => go(stepIndex - 1)}>Back</button>
          {stepIndex < last
            ? <button type="button" className={css.primaryCta} onClick={() => go(stepIndex + 1)}>{stepIndex === last - 1 ? "On to practice" : "Continue"}</button>
            : <Link className={css.primaryCta} href={`/signin/?next=${encodeURIComponent(lesson.href)}`}>Sign in to explore</Link>}
        </div>
      </div>

      <aside className={css.companionCard} aria-label="Study companion">
        <div className={css.companionHead}>
          <div>
            <h4>{companionTab === "match" ? lesson.match.title : "Sticky notes"}</h4>
            <small>Saved with this lesson</small>
          </div>
          <span className={css.appBadgeMuted}>Interactive mode</span>
        </div>
        <div className={css.companionTabs} role="tablist" aria-label="Companion">
          <button type="button" role="tab" aria-selected={companionTab === "match"} onClick={() => setCompanionTab("match")}>Try it</button>
          <button type="button" role="tab" aria-selected={companionTab === "notes"} onClick={showNotes}>Notes ({lesson.notes.length})</button>
        </div>

        <div className={css.companionScroll} ref={noteScroller} tabIndex={0}>
          {companionTab === "match" && (
            <div className={css.matchBox}>
              <p className={css.companionHint}>{lesson.match.how}</p>
              {matched.length === lesson.match.pairs.length ? (
                <>
                  <p className={css.companionVerdict} role="status">All {matched.length} matched.</p>
                  <dl className={css.matchResults}>
                    {lesson.match.pairs.map((pair) => (
                      <div key={pair.left}>
                        <dt>{pair.left}</dt>
                        <dd>{pair.right}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              ) : (
                <>
                  <div className={css.matchGrid}>
                    <div className={css.matchCol}>
                      {lesson.match.pairs.map((pair, index) => (
                        <button
                          key={pair.left}
                          type="button"
                          disabled={matched.includes(index)}
                          aria-pressed={pickedLeft === index}
                          data-done={matched.includes(index) ? "true" : undefined}
                          onClick={() => { setPickedLeft(index); setMatchMsg(null); }}
                        >
                          {pair.left}
                        </button>
                      ))}
                    </div>
                    <div className={css.matchCol}>
                      {lesson.match.rightOrder.map((pairIndex) => (
                        <button
                          key={lesson.match.pairs[pairIndex].right}
                          type="button"
                          disabled={matched.includes(pairIndex) || pickedLeft === null}
                          data-done={matched.includes(pairIndex) ? "true" : undefined}
                          onClick={() => matchRight(pairIndex)}
                        >
                          {lesson.match.pairs[pairIndex].right}
                        </button>
                      ))}
                    </div>
                  </div>
                  {matchMsg && (
                    <p className={css.companionVerdict} data-ok={matchMsg.ok ? "true" : undefined} role="status">
                      <strong>{matchMsg.ok ? "Yes. " : "Not that one. "}</strong>{matchMsg.text}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {companionTab === "notes" && (
            <ul className={css.stickyGrid}>
              {lesson.notes.map((note) => (
                <li key={note.title} data-kind={note.kind}>
                  <small>{note.tag}</small>
                  <strong>{note.title}</strong>
                  {note.points.map((point) => <p key={point}>{point}</p>)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
