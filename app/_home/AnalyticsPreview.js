"use client";

import Link from "next/link";
import { useState } from "react";
import css from "../home.module.css";

const ACTIVITY_14 = [
  { day: "13 Nov", total: 6, answers: 4, lessons: 1, facts: 1 },
  { day: "14 Nov", total: 11, answers: 8, lessons: 2, facts: 1 },
  { day: "15 Nov", total: 4, answers: 4, lessons: 0, facts: 0 },
  { day: "16 Nov", total: 9, answers: 5, lessons: 1, facts: 3 },
  { day: "17 Nov", total: 14, answers: 10, lessons: 2, facts: 2 },
  { day: "18 Nov", total: 7, answers: 4, lessons: 1, facts: 2 },
  { day: "19 Nov", total: 16, answers: 11, lessons: 2, facts: 3 },
  { day: "20 Nov", total: 12, answers: 8, lessons: 1, facts: 3 },
  { day: "21 Nov", total: 18, answers: 12, lessons: 2, facts: 4 },
  { day: "22 Nov", total: 5, answers: 3, lessons: 0, facts: 2 },
  { day: "23 Nov", total: 15, answers: 9, lessons: 2, facts: 4 },
  { day: "24 Nov", total: 19, answers: 13, lessons: 2, facts: 4 },
  { day: "25 Nov", total: 13, answers: 9, lessons: 1, facts: 3 },
  { day: "26 Nov", total: 17, answers: 11, lessons: 2, facts: 4 },
];

const MOCK_SCORES = [
  { id: "m1", title: "CGL Tier I · Mock #01", score: 86.5, max: 200, answered: 68 },
  { id: "m2", title: "CGL Tier I · Mock #02", score: 94.0, max: 200, answered: 74 },
  { id: "m3", title: "CGL Tier I · Mock #03", score: 108.0, max: 200, answered: 79 },
  { id: "m4", title: "CGL Tier I · Mock #04", score: 118.5, max: 200, answered: 84 },
];

export default function AnalyticsPreview() {
  const [range, setRange] = useState(14);
  const [selectedDay, setSelectedDay] = useState(ACTIVITY_14.length - 1);
  const [selectedMock, setSelectedMock] = useState(MOCK_SCORES.length - 1);
  const [coachNoteOpen, setCoachNoteOpen] = useState(false);

  const visibleDays = range === 7 ? ACTIVITY_14.slice(-7) : ACTIVITY_14;
  const activeDay = visibleDays[Math.min(selectedDay, visibleDays.length - 1)] ?? visibleDays[visibleDays.length - 1];
  const activeMock = MOCK_SCORES[selectedMock] ?? MOCK_SCORES[MOCK_SCORES.length - 1];

  return (
    <div className={css.analyticsBoard}>
      <div className={css.analyticsTop}>
        <div className={css.planCard}>
          <div className={css.analyticsPanelHead}>
            <div>
              <span className={css.appTag}>Study plan · 45 min/day budget</span>
              <h3>What to do next</h3>
            </div>
            <Link href="/analytics/plan/" className={css.textLink}>View full 7-day plan ↗</Link>
          </div>

          <div className={css.planColumns}>
            <div className={css.planDay} data-today="true">
              <div className={css.planDayHead}>
                <strong>Today</strong>
                <span>45 min</span>
              </div>
              <ul>
                <li>
                  <div>
                    <strong>Revise: Successive changes</strong>
                    <small>Unfinished lesson · Quantitative Aptitude</small>
                  </div>
                  <span>15 min</span>
                </li>
                <li>
                  <div>
                    <strong>Practise: Percentage PYQs</strong>
                    <small>Missed topic in Mock #04</small>
                  </div>
                  <span>20 min</span>
                </li>
                <li>
                  <div>
                    <strong>Due recall &amp; Current Affairs</strong>
                    <small>2 reviews due · 5 unread facts</small>
                  </div>
                  <span>10 min</span>
                </li>
              </ul>
            </div>

            <div className={css.planDay}>
              <div className={css.planDayHead}>
                <strong>Tomorrow</strong>
                <span>45 min</span>
              </div>
              <ul>
                <li>
                  <div>
                    <strong>Spaced review: Syllogism</strong>
                    <small>Scheduled recall</small>
                  </div>
                  <span>15 min</span>
                </li>
                <li>
                  <div>
                    <strong>Idioms &amp; Phrases PYQs</strong>
                    <small>Recent first answers</small>
                  </div>
                  <span>15 min</span>
                </li>
                <li>
                  <div>
                    <strong>Math Sprint · Tables</strong>
                    <small>Speed fluency</small>
                  </div>
                  <span>15 min</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={css.coachCard}>
          <div className={css.analyticsPanelHead}>
            <div>
              <span className={css.appTag}>On-demand</span>
              <h3>AI study coach</h3>
            </div>
            <span className={css.exampleBadge}>Example data</span>
          </div>
          <p className={css.coachSummary}>
            Get a three-day plan based on your recent practice.
          </p>
          <p className={css.coachConsent}>
            Your study summary is shared only when you request coaching.
          </p>
          <button
            type="button"
            className={css.coachBtn}
            aria-expanded={coachNoteOpen}
            onClick={() => setCoachNoteOpen((open) => !open)}
          >
            {coachNoteOpen ? "Hide sample coach note" : "Preview sample coach note"}
          </button>
          {coachNoteOpen && (
            <div className={css.coachSample} role="status">
              <strong>Sample 3-day focus (Illustrative)</strong>
              <p>Percentage accounts for your largest mock mark gap (−10 marks). Finish the Successive changes lesson before attempting the fresh 6-question PYQ set.</p>
            </div>
          )}
        </div>
      </div>

      <div className={css.chartsRow}>
        <div className={css.chartCard}>
          <div className={css.analyticsPanelHead}>
            <div>
              <h3>Study activity</h3>
              <p>Daily recorded answers, lessons, mocks and facts</p>
            </div>
            <div className={css.chartControls}>
              <span className={css.exampleBadge}>Example data</span>
              <div className={css.segGroup} role="group" aria-label="Activity window">
                <button type="button" aria-pressed={range === 7} onClick={() => { setRange(7); setSelectedDay(6); }}>7 days</button>
                <button type="button" aria-pressed={range === 14} onClick={() => { setRange(14); setSelectedDay(13); }}>14 days</button>
              </div>
            </div>
          </div>

          <div className={css.barGrid} style={{ "--cols": visibleDays.length }}>
            {visibleDays.map((row, idx) => (
              <button
                key={row.day}
                type="button"
                className={css.barCol}
                aria-pressed={activeDay.day === row.day}
                aria-label={`${row.day}: ${row.total} recorded actions`}
                onClick={() => setSelectedDay(idx)}
              >
                <span className={css.barFill} style={{ height: `${Math.round((row.total / 20) * 100)}%` }} />
              </button>
            ))}
          </div>

          <div className={css.chartCaption} aria-live="polite">
            <strong>{activeDay.day}</strong>
            <span>{activeDay.total} actions · {activeDay.answers} PYQ answers · {activeDay.lessons} lessons · {activeDay.facts} facts</span>
          </div>
        </div>

        <div className={css.chartCard}>
          <div className={css.analyticsPanelHead}>
            <div>
              <h3>Timed mock marks</h3>
              <p>Net marks across recent completed mocks</p>
            </div>
            <div className={css.mockReadout}>
              <strong>{activeMock.score}</strong>
              <span>/ {activeMock.max}</span>
            </div>
          </div>

          <div className={css.barGrid} style={{ "--cols": MOCK_SCORES.length }}>
            {MOCK_SCORES.map((row, idx) => (
              <button
                key={row.id}
                type="button"
                className={css.barCol}
                aria-pressed={selectedMock === idx}
                aria-label={`${row.title}: ${row.score} of ${row.max} marks`}
                onClick={() => setSelectedMock(idx)}
              >
                <span className={css.barFillAccent} style={{ height: `${Math.round((row.score / row.max) * 100)}%` }} />
              </button>
            ))}
          </div>

          <div className={css.chartCaption} aria-live="polite">
            <strong>{activeMock.title}</strong>
            <span>{activeMock.answered}/100 answered · Click bars to inspect</span>
          </div>
        </div>
      </div>
    </div>
  );
}
