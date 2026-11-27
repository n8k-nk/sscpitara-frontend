import { cache, Suspense } from "react";
import RouteSkeleton from "../../components/RouteSkeleton";
import { gameById } from "../games/catalog";
import Image from "next/image";
import Link from "../../components/NavigationLink";
import planner from "../../public/images/landing-planner.webp";
import { ActivityChart, MockChart } from "./Charts";
import AIReview from "./AIReview";
import { analyticsUrl, loadAnalytics } from "./data";
import { amount, dateLabel } from "./format";
import styles from "./analytics.module.css";

export const metadata = { title: "Analytics", robots: { index: false } };

function Resume({ items, practiceHref }) {
  const [current, ...other] = items;
  return <section className={styles.resume} aria-labelledby="resume-title">
    <div className={styles.resumeBody}>
      <h2 id="resume-title">Pick up where you left off</h2>
      {current ? <>
        <p className={styles.resumeTask}>{current.title}</p>
        <Link className={styles.resumeButton} href={current.href}>{current.timed_seconds ? "Return to mock" : "Resume session"} <span aria-hidden="true">→</span></Link>
        {other.length > 0 && <details className={styles.otherSessions}>
          <summary>Other unfinished sessions</summary>
          <ul>{other.map((item) => <li key={item.href}><Link href={item.href}>{item.title}</Link></li>)}</ul>
        </details>}
      </> : <>
        <p>Start a lesson or practice set. Your unfinished work will be here when you return.</p>
        <Link className={styles.resumeButton} href={practiceHref}>Find something to practise <span aria-hidden="true">→</span></Link>
      </>}
    </div>
    <div className={styles.resumeImage}>
      <Image src={planner} alt="" fill sizes="(max-width: 600px) 25vw, 32vw" />
    </div>
  </section>;
}

function PlanPreview({ days, href }) {
  return <section className={styles.planPreview} aria-labelledby="plan-title">
    <header className={styles.panelHead}>
      <div><h2 id="plan-title">What to do next</h2><p>Your next study blocks</p></div>
      <Link className={styles.textLink} href={href}>View full plan <span aria-hidden="true">↗</span></Link>
    </header>
    <div className={styles.previewDays}>{days.slice(0, 3).map(({ date, tasks }, i) => (
      <div className={styles.previewDay} key={date} data-today={i === 0}>
        <div className={styles.previewDate}>
          <strong>{i === 0 ? "Today" : dateLabel(date, { weekday: "long" })}</strong>
          <time dateTime={date}>{dateLabel(date)}</time>
        </div>
        <ul>{tasks.map((task) => <li key={task.practice_href ?? task.href}>
          <Link href={task.href}><span>{task.title}</span><small>{task.minutes} min</small><span aria-hidden="true">›</span></Link>
        </li>)}</ul>
        {!tasks.length && <small>No study blocks suggested for this day.</small>}
      </div>
    ))}</div>
  </section>;
}

function GameResult({ game }) {
  return <section className={styles.panel} aria-labelledby="game-title">
    <header className={styles.panelHead}><div><h2 id="game-title">Games</h2><p>Practise speed and recall with short games.</p></div>
      <Link href="/games/" className={styles.textLink}>{game ? "Browse games" : "Try a game"} <span aria-hidden="true">→</span></Link>
    </header>
    {game && <div className={styles.gameScore}>
      <div><strong>{gameById(game.game_id)?.name ?? game.game_id.replaceAll("-", " ")}</strong>
        <small>{dateLabel(game.created)} · {game.correct}/{game.total} correct</small></div>
      <strong>{amount(game.score)} points</strong>
    </div>}
  </section>;
}

const analyticsData = cache(loadAnalytics);

export default function Analytics({ searchParams }) {
  return <div className={styles.page}>
    <header className={styles.titleBar}>
      <div><h1>Analytics</h1><p>Your study activity, marks and next steps.</p></div>
      <Suspense fallback={null}><AnalyticsScope searchParams={searchParams} /></Suspense>
    </header>
    <Suspense fallback={<RouteSkeleton label="study activity" variant="overview" inline />}>
      <AnalyticsData searchParams={searchParams} />
    </Suspense>
  </div>;
}

async function AnalyticsScope({ searchParams }) {
  const d = await analyticsData(searchParams);
  return <span className={styles.scope}>{d.exam} · {d.stage}</span>;
}

async function AnalyticsData({ searchParams }) {
  const d = await analyticsData(searchParams);
  const core = d.exam === "CGL" && d.stage === "Tier I";
  const practiceHref = `/pyq/${d.exam_slug}/topics/?${new URLSearchParams({ stage: d.stage })}`;
  const mockHref = d.exam === "CGL" ? `/study/practice/?tier=${d.stage === "Tier II" ? 2 : 1}` : `/pyq/${d.exam_slug}/`;
  const historyHref = analyticsUrl("activity", d.exam, d.stage);
  return <>
    <Resume items={d.active} practiceHref={practiceHref} />
    <PlanPreview days={d.plan_days} href={analyticsUrl("plan", d.exam, d.stage)} />
    {d.ai_review_available && <AIReview key={`review-${practiceHref}`} exam={d.exam} stage={d.stage} />}
    <ActivityChart key={`activity-${practiceHref}`} daily={d.daily} historyHref={historyHref}
      actionLinks={{ answers: practiceHref, facts: "/current-affairs/" }} />
    <MockChart key={`mock-${practiceHref}`} mocks={d.mocks} startHref={mockHref} />
    {core && <GameResult game={d.activities.games[0]} />}
  </>;
}
