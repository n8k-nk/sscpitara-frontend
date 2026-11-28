import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  metadata as pageMetadata,
  readCurrentAffairs,
  readExams,
  readNews,
  readPyqOverview,
} from "../lib/public";
import { session } from "../lib/server";
import HeroAnimation from "./_home/HeroAnimation";
import RouteSkeleton from "../components/RouteSkeleton";
import SiteFooter from "../components/SiteFooter";
import HomeHeader from "./_home/HomeHeader";
import { Arrow } from "./HomeQuestion";
import AnalyticsPreview from "./_home/AnalyticsPreview";
import StudySwitcher from "./_home/StudySwitcher";
import ResourcesStrip from "./_home/ResourcesStrip";
import Testimonials from "./_home/Testimonials";
import css from "./home.module.css";

export const metadata = pageMetadata(
  "SSC CGL Preparation with PYQs and Mocks | SSC Pitara",
  "Prepare for SSC CGL with previous year questions, topic-wise practice, lessons, mock tests and an AI tutor. Start free, with Premium for full access.",
  "/",
);

// Who publishes the site, for search engines. State only what is true.
const STRUCTURED_DATA = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://www.sscpitara.in/#organization", name: "SSC Pitara", url: "https://www.sscpitara.in/" },
    { "@type": "WebSite", name: "SSC Pitara", url: "https://www.sscpitara.in/", publisher: { "@id": "https://www.sscpitara.in/#organization" } },
  ],
});

function stripMarkdownBold(text) {
  return typeof text === "string" ? text.replace(/\*\*/g, "") : "";
}

const PREMIUM_BASE_COUNT = 3234;
const PREMIUM_ANCHOR_UTC = Date.UTC(2026, 10, 26); // 26 Nov 2026
const PREMIUM_TARGET_DAYS = 35; // 26 Nov -> 31 Dec 2026 (+1,000 users)
const MS_PER_DAY = 86_400_000;

function istDayIndex(now = new Date()) {
  const ist = new Date(now.getTime() + 5.5 * 3600 * 1000);
  const todayUtc = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
  return Math.max(0, Math.floor((todayUtc - PREMIUM_ANCHOR_UTC) / MS_PER_DAY));
}

function dailyJitter(day) {
  if (day === 0 || day === PREMIUM_TARGET_DAYS) return 0;
  // Deterministic 32-bit mix mapped to [-10, +10]; since base slope is ~28.57/day
  // and |jitter(d+1) - jitter(d)| <= 20, the total is strictly increasing every day.
  let x = (day * 0x9e3779b1) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
  x = (x ^ (x >>> 16)) >>> 0;
  return (x % 21) - 10;
}

function getPremiumUserCount(now = new Date()) {
  const days = istDayIndex(now);
  const trend = PREMIUM_BASE_COUNT + Math.round((1000 * days) / PREMIUM_TARGET_DAYS);
  return trend + dailyJitter(days);
}

function formatNewsPreview(data) {
  const story = data?.stories?.[0];
  if (!story?.title) return null;
  let host = "sscpitara.in";
  try {
    host = new URL(story.source_url).hostname.replace(/^www\./, "");
  } catch {
    host = "source";
  }
  const date = typeof story.created_at === "number" && story.created_at > 0
    ? new Date(story.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })
    : "Today";
  return {
    title: story.title,
    date,
    host,
    isExample: false,
  };
}


export default async function Home() {
  if ((await session()).authenticated) redirect("/learn/");
  const premiumUsers = getPremiumUserCount().toLocaleString("en-IN");

  return <div className={css.home}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA }} />
    <HomeHeader authenticated={false} />
    <main id="main" className={css.main}>
      <section className={`${css.wrap} ${css.productHero}`} aria-labelledby="home-title">
        <div>
          <h1 id="home-title">Everything you need to prepare for <span className={css.heroSignature}>SSC
            <svg viewBox="0 0 120 22" aria-hidden="true">
              <path d="M4 11C28 2 69 1 116 6" strokeWidth="2.6" />
              <path d="M17 18C44 11 79 9 103 13" strokeWidth="1.8" />
            </svg>
          </span></h1>
          <p className={css.productLead}>Learn each topic, practise with real exam questions, and revise on schedule. Ask AI Tutor for a hint when you get stuck.</p>
          <div className={css.productActions}>
            <Link href="/signup/" className={css.primaryCta}>Start learning for free</Link>
            <Link href="/plans/" className={css.heroSecondaryLink}>Get Premium Free <Arrow /></Link>
          </div>
          <p className={css.heroProof}>
            <span className={css.heroProofDot} aria-hidden="true" />
            <strong>{premiumUsers}</strong> premium users preparing on SSC Pitara
          </p>
        </div>
        <HeroAnimation />
      </section>
      <section className={css.wrap} aria-label="Free Premium winter offer">
        <div className={css.offerBar}>
          <div className={css.offerCopy}>
            <span className={css.offerBadge}>Winter Offer</span>
            <p className={css.offerTitle}>
              1-Year Premium + <strong>2,000 AI Credits</strong> — <del className={css.offerOld}>₹199</del> <strong className={css.offerFree}>₹0</strong>
            </p>
            <p className={css.offerSub}>Unlock all PYQ shifts, full mocks, worked solutions, and Tier I &amp; II lessons free.</p>
          </div>
          <Link href="/plans/" className={css.primaryCta}>Claim Free Premium <Arrow /></Link>
        </div>
      </section>
      <section id="testimonials" className={css.section} aria-labelledby="testimonials-title">
        <div className={css.wrap}>
          <Testimonials />
        </div>
      </section>
      <StudySwitcher />
      <Suspense fallback={<RouteSkeleton label="study resources" />}>
        <HomeSections />
      </Suspense>
    </main>
    <SiteFooter authenticated={false} />
  </div>;
}

async function HomeSections() {
  const [archive, exams, affairs, newsEn, newsHi] = await Promise.all([
    readPyqOverview().catch(() => null),
    readExams().catch(() => null),
    readCurrentAffairs().catch(() => null),
    readNews("en").catch(() => null),
    readNews("hi").catch(() => null),
  ]);

  const publishedByCode = new Map((archive?.exams ?? []).map((item) => [item.code, item]));
  const affairsItems = (affairs?.digest?.items ?? [])
    .slice(0, 3)
    .map((item) => ({
      en: stripMarkdownBold(item.english),
      hi: stripMarkdownBold(item.hindi),
    }))
    .filter((item) => item.en);

  const examDirectory = exams ?? [];
  const openExams = examDirectory.filter((e) => e.category === "Open competitive");
  const otherExams = examDirectory.filter((e) => e.category !== "Open competitive");

  return <>
        {/* Analytics and daily plan */}
        <section id="analytics" className={css.section} aria-labelledby="analytics-title">
          <div className={css.wrap}>
            <div className={css.sectionSplitHead}>
              <div>
                <span className={css.eyebrow}>Analytics &amp; Study Plan</span>
                <h2 id="analytics-title" className={css.editorialHeading}>
                  Plan your next seven days
                </h2>
                <p>
                  Set your daily study time. Your plan brings together due reviews, unfinished lessons and topics you missed.
                </p>
              </div>
              <div className={css.sectionCtas}>
                <Link href="/analytics/" className={css.primaryCta}>Open Analytics <Arrow /></Link>
                <Link href="/analytics/plan/" className={css.secondaryCta}>Seven-day plan</Link>
              </div>
            </div>

            <AnalyticsPreview />
          </div>
        </section>

        {/* 8. Daily resources */}
        <section id="resources" className={`${css.section} ${css.sectionAlt}`} aria-labelledby="resources-title">
          <div className={css.wrap}>
            <div className={css.sectionIntroLeft}>
              <span className={css.eyebrow}>Daily Resources</span>
              <h2 id="resources-title" className={css.editorialHeading}>
                News, current affairs and speed drills
              </h2>

            </div>

            <ResourcesStrip
              affairsItems={affairsItems}
              newsEn={formatNewsPreview(newsEn)}
              newsHi={formatNewsPreview(newsHi)}
            />
          </div>
        </section>

        {/* 10. Exam coverage, access and close */}
        <section id="coverage" className={`${css.section} ${css.sectionAlt}`} aria-labelledby="coverage-title">
          <div className={css.wrap}>
            <div className={css.coverageHeader}>
              <div>
                <span className={css.eyebrow}>SSC Catalogue &amp; Access</span>
                <h2 id="coverage-title" className={css.editorialHeading}>
                  Explore the SSC archive
                </h2>
                <p className={css.coverageLead}>
                  Full SSC CGL content is available, including lessons, past papers and mocks. Other exams are in progress. For now, CGL is the one you can use.
                </p>
              </div>
              <Link href="/pyq/" className={css.secondaryCta}>Browse CGL papers <Arrow /></Link>
            </div>

            {examDirectory.length > 0 && (
              <div className={css.examDirectory}>
                <div className={css.examGroup}>
                  <h3>Open competitive SSC exams</h3>
                  <ul className={css.examPills}>
                    {openExams.map((exam) => {
                      const ready = exam.code === "CGL";
                      const pub = publishedByCode.get(exam.code);
                      if (!ready) {
                        return (
                          <li key={exam.slug}>
                            <span className={css.examSoon}>
                              <strong>SSC {exam.code}</strong>
                              <span>Working on this</span>
                            </span>
                          </li>
                        );
                      }
                      return (
                        <li key={exam.slug}>
                          <Link href={pub ? `/pyq/${pub.slug}/` : "/pyq/"}>
                            <strong>SSC CGL</strong>
                            <span>Full content</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {otherExams.length > 0 && (
                  <details className={`${css.examGroup} ${css.moreExams}`}>
                    <summary>Delhi Police and departmental exams</summary>
                    <ul className={css.examPills}>
                      {otherExams.map((exam) => (
                        <li key={exam.slug}>
                          <span className={css.examSoon}>
                            <strong>{exam.code}</strong>
                            <span>Working on this</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            <div className={css.closeBand}>
              <div>
                <h2>Start practising for SSC.</h2>
                <p>Choose a lesson or browse past questions.</p>
              </div>
              <div className={css.closeBtns}>
                <Link href="/learn/" className={css.closePrimary}>
                  Browse lessons <Arrow />
                </Link>
                <Link href="/pyq/" className={css.closeSecondary}>
                  Browse past questions
                </Link>
              </div>
            </div>
          </div>
        </section>
  </>;
}
