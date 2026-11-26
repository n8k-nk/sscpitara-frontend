"use client";

import Link from "next/link";
import { useState } from "react";
import css from "../home.module.css";

const FALLBACK_FACTS = [
  {
    en: "The Construction and Infrastructure Equipment (CIE) Manufacturing Ecosystem Scheme carries a financial outlay of ₹11,000 crore.",
    hi: "नवस्वीकृत निर्माण एवं अवसंरचना उपकरण (CIE) विनिर्माण पारिस्थितिकी तंत्र योजना का वित्तीय परिव्यय ₹11,000 करोड़ है।",
  },
  {
    en: "Article 17 of the Constitution of India abolishes untouchability and forbids its practice in any form.",
    hi: "भारतीय संविधान का अनुच्छेद 17 अस्पृश्यता का अंत करता है और किसी भी रूप में इसके आचरण का निषेध करता है।",
  },
];

const FALLBACK_NEWS = {
  en: {
    title: "SSC publishes updated examination calendar for CGL, CHSL and Stenographer cycles",
    date: "26 Nov 2026",
    host: "ssc.gov.in",
    isExample: true,
  },
  hi: {
    title: "एसएससी ने सीजीएल, सीएचएसएल और स्टेनोग्राफर परीक्षा चक्रों का अद्यतन कैलेंडर जारी किया",
    date: "26 नवम्बर 2026",
    host: "ssc.gov.in",
    isExample: true,
  },
};

const SPRINT_CHOICES = [116, 126, 134, 142];

export default function ResourcesStrip({ affairsItems, newsEn, newsHi }) {
  const [caLang, setCaLang] = useState("en");
  const [caIndex, setCaIndex] = useState(0);
  const [caSaved, setCaSaved] = useState([]);
  const [newsLang, setNewsLang] = useState("en");
  const [sprintChoice, setSprintChoice] = useState(null);

  const facts = affairsItems?.length ? affairsItems : FALLBACK_FACTS;
  const fact = facts[caIndex % facts.length];
  const factText = caLang === "hi" && fact.hi ? fact.hi : fact.en;
  const isBookmarked = caSaved.includes(caIndex);

  const story = newsLang === "hi"
    ? (newsHi || FALLBACK_NEWS.hi)
    : (newsEn || FALLBACK_NEWS.en);

  function toggleBookmark() {
    setCaSaved((prev) => (prev.includes(caIndex) ? prev.filter((x) => x !== caIndex) : [...prev, caIndex]));
  }

  return (
    <div className={css.resourcesGrid}>
      {/* 1. Current Affairs Study Card */}
      <article className={css.resCard}>
        <div className={css.resHead}>
          <div>
            <span className={css.appTag}>Fact study</span>
            <h3>Current Affairs</h3>
          </div>
          <div className={css.miniLang} role="group" aria-label="Current affairs language">
            <button type="button" aria-pressed={caLang === "en"} onClick={() => setCaLang("en")}>EN</button>
            <button type="button" aria-pressed={caLang === "hi"} onClick={() => setCaLang("hi")} lang="hi">हिन्दी</button>
          </div>
        </div>

        <div className={css.caSheet} lang={caLang}>
          <div className={css.caTop}>
            <span>Fact {(caIndex % facts.length) + 1} of {facts.length}</span>
            <button
              type="button"
              className={css.caBookmark}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this fact"}
              onClick={toggleBookmark}
            >
              {isBookmarked ? "★ Saved" : "☆ Save"}
            </button>
          </div>
          <p className={css.caText}>{factText}</p>
          <div className={css.caActions}>
            <button type="button" onClick={() => setCaIndex((i) => (i - 1 + facts.length) % facts.length)}>
              ← Review
            </button>
            <button type="button" onClick={() => setCaIndex((i) => (i + 1) % facts.length)}>
              Mark read &amp; next →
            </button>
          </div>
        </div>

        <div className={css.resFoot}>
          <small>One fact per card with reading progress &amp; bookmarks.</small>
          <Link href="/current-affairs/">Open Current Affairs →</Link>
        </div>
      </article>

      {/* 2. Newspaper-style News Lead Story */}
      <article className={css.resCard}>
        <div className={css.resHead}>
          <div>
            <span className={css.appTag}>Headlines</span>
            <h3>News</h3>
          </div>
          <div className={css.miniLang} role="group" aria-label="News language">
            <button type="button" aria-pressed={newsLang === "en"} onClick={() => setNewsLang("en")}>English</button>
            <button type="button" aria-pressed={newsLang === "hi"} onClick={() => setNewsLang("hi")} lang="hi">हिन्दी</button>
          </div>
        </div>

        <div className={css.newsPaper} lang={newsLang}>
          <div className={css.newsMasthead}>
            <span>SSC PITARA NEWS · TOP STORIES</span>
            {story.isExample && <small>Example edition</small>}
          </div>
          <h4>{story.title}</h4>
          <div className={css.newsMeta}>
            <span>{story.date}</span>
            <span>{story.host} ↗</span>
          </div>
        </div>

        <div className={css.resFoot}>
          <small>Read daily top stories in English or Hindi with direct publisher links.</small>
          <Link href="/news/">Open News →</Link>
        </div>
      </article>

      {/* 3. Games / Math Sprint Preview */}
      <article className={css.resCard}>
        <div className={css.resHead}>
          <div>
            <span className={css.appTag}>30-level drills</span>
            <h3>Games</h3>
          </div>
          <span className={css.appBadgeMuted}>6 games</span>
        </div>

        <div className={css.gameCard}>
          <div className={css.gameBanner}>
            <img
              src="/arena-art/math-sprint.webp"
              alt="Math Sprint game artwork"
              width="320"
              height="213"
              loading="lazy"
            />
            <div className={css.gameBannerText}>
              <span className={css.gameMark} aria-hidden="true">×</span>
              <div>
                <strong>Math Sprint</strong>
                <small>Maths · 30 levels</small>
              </div>
            </div>
          </div>

          <div className={css.sprintDrill}>
            <div className={css.sprintPrompt}>
              <span>Sample round</span>
              <strong>18 × 7 = ?</strong>
            </div>
            <div className={css.sprintOpts}>
              {SPRINT_CHOICES.map((val) => (
                <button
                  key={val}
                  type="button"
                  aria-pressed={sprintChoice === val}
                  data-state={sprintChoice === null ? undefined : val === 126 ? "ok" : sprintChoice === val ? "bad" : undefined}
                  onClick={() => setSprintChoice(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={css.resFoot}>
          <small>Timed speed drills for Maths, Reasoning, English, GK &amp; Computer.</small>
          <Link href="/games/">Open Games →</Link>
        </div>
      </article>
    </div>
  );
}
