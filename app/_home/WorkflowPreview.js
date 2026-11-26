"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import css from "../home.module.css";

const TABS = [
  { id: "answer", label: "Answer", eyebrow: "Step 1 · Real PYQ" },
  { id: "review", label: "Review", eyebrow: "Step 2 · Mock Report" },
  { id: "next", label: "Practise next", eyebrow: "Step 3 · Targeted Follow-up" },
];

export default function WorkflowPreview({ practiceHref, sourceHref }) {
  const [active, setActive] = useState("answer");
  const tabRefs = useRef([]);

  function onKeyDown(event, index) {
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = TABS.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    setActive(TABS[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className={css.workflowShell}>
      <div className={css.workflowControls} role="tablist" aria-label="Study workflow stages">
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[i] = el; }}
            type="button"
            role="tab"
            id={`wf-tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`wf-panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            className={css.workflowTab}
            onClick={() => setActive(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <small>{tab.eyebrow}</small>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className={css.workflowStage}>
        {active === "answer" && (
          <div role="tabpanel" id="wf-panel-answer" aria-labelledby="wf-tab-answer" className={css.wfPanel}>
            <div className={css.appFrameHead}>
              <div className={css.appFrameMeta}>
                <span className={css.appTag}>PYQ Practice</span>
                <span>SSC CGL 2026 · Tier I · 27 Oct 2026 · Shift 2</span>
              </div>
              <span className={css.appBadgeOk}>Official answer key</span>
            </div>

            <div className={css.wfGrid}>
              <div className={css.wfMain}>
                <p className={css.wfTopic}>Quantitative Aptitude · Percentage</p>
                <p className={css.wfStem}>
                  A person spends 40% of his salary on rent, 25% on food, and saves ₹600. If his salary is ₹3,000, how much does he spend on other expenses?
                </p>
                <div className={css.wfMiniOptions}>
                  <div className={css.wfOpt}><b>A</b><span>₹200</span></div>
                  <div className={`${css.wfOpt} ${css.wfOptRight}`}><b>B</b><span>₹450</span><small>Your answer · Correct</small></div>
                  <div className={css.wfOpt}><b>C</b><span>₹300</span></div>
                  <div className={css.wfOpt}><b>D</b><span>₹600</span></div>
                </div>
              </div>
              <aside className={css.wfAside}>
                <span className={css.wfAsideLabel}>Recorded evidence</span>
                <h3>Every first attempt counts</h3>
                <p>Signed-in answers are saved against the source question and topic so weak areas surface across papers.</p>
                <div className={css.wfLinks}>
                  <Link href={sourceHref || "/pyq/cgl/"}>Open in PYQ archive ↗</Link>
                  <Link href={practiceHref}>Practise Percentage PYQs →</Link>
                </div>
              </aside>
            </div>
          </div>
        )}

        {active === "review" && (
          <div role="tabpanel" id="wf-panel-review" aria-labelledby="wf-tab-review" className={css.wfPanel}>
            <div className={css.appFrameHead}>
              <div className={css.appFrameMeta}>
                <span className={css.appTag}>Mock results</span>
                <span>SSC CGL Tier I · Full Mock #04</span>
              </div>
              <span className={css.exampleBadge}>Example report</span>
            </div>

            <div className={css.wfScorecard}>
              <div>
                <span className={css.scoreCaption}>Net score</span>
                <strong className={css.scoreValue}>118.5 <small>/ 200</small></strong>
              </div>
              <dl className={css.scoreStats}>
                <div><dt>Accuracy</dt><dd>71.4%</dd></div>
                <div><dt>Attempted</dt><dd>84 / 100</dd></div>
                <div><dt>Penalties</dt><dd>−16.5</dd></div>
              </dl>
            </div>

            <div className={css.wfLossBox}>
              <div className={css.wfLossHead}>
                <strong>Where you lost marks</strong>
                <span>4 incorrect · 2 skipped in Percentage</span>
              </div>
              <div className={css.wfLossRow}>
                <div>
                  <strong>Percentage</strong>
                  <small>Quantitative Aptitude · 11m 20s observed on incorrect answers</small>
                </div>
                <span className={css.lossPill}>−10.0 marks gap</span>
              </div>
              <div className={css.wfLinks}>
                <Link href="/study/practice/">Explore timed mock tests →</Link>
              </div>
            </div>
          </div>
        )}

        {active === "next" && (
          <div role="tabpanel" id="wf-panel-next" aria-labelledby="wf-tab-next" className={css.wfPanel}>
            <div className={css.appFrameHead}>
              <div className={css.appFrameMeta}>
                <span className={css.appTag}>Next step</span>
                <span>Connected to your Analytics plan</span>
              </div>
              <span className={css.exampleBadge}>Example report</span>
            </div>

            <div className={css.wfGrid}>
              <div className={css.wfFollowupCard}>
                <span className={css.wfEyebrow}>From your CGL Tier I mock</span>
                <h3>Percentage follow-up set</h3>
                <p>You answered 2 of 6 correctly on this topic in your mock. Revisit missed items alongside unseen PYQs from other papers.</p>
                <div className={css.wfChipRow}>
                  <span>2 to review</span>
                  <span>6 fresh from other papers</span>
                  <span>Untimed</span>
                </div>
                <div className={css.wfLinks}>
                  <Link href="/learn/cgl/quantitative-aptitude/percentage/successive-changes/" className={css.inlineBtn}>
                    Revise Successive changes lesson
                  </Link>
                  <Link href={practiceHref}>Practise Percentage PYQs →</Link>
                </div>
              </div>

              <aside className={css.wfAside}>
                <span className={css.wfAsideLabel}>Today in Analytics</span>
                <h3>45 min study budget</h3>
                <ul className={css.wfPlanList}>
                  <li><strong>Successive changes</strong><span>15 min</span></li>
                  <li><strong>Percentage PYQs (8 Qs)</strong><span>18 min</span></li>
                  <li><strong>Spaced recall due</strong><span>12 min</span></li>
                </ul>
                <div className={css.wfLinks}>
                  <Link href="/analytics/plan/">View 7-day study plan ↗</Link>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
