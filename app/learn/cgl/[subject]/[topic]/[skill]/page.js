import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import GoToPlans from "../../../../../../components/learn/GoToPlans";
import Companion from "../../../../../../components/learn/Companion";
import LessonPlayer from "../../../../../../components/learn/LessonPlayer";
import ReportButton from "../../../../../../components/learn/ReportButton";
import { screensOf } from "../../../../../../components/learn/screens";
import { QuestionFeed } from "../../../../../pyq/_ui";
import { getQuestions, pageOf } from "../../../../../../lib/pyq";
import { lessonDate, shiftChance } from "../../../../../../components/learn/bits";
import { call } from "../../../../../../lib/server";

export async function generateMetadata({ params }) {
  const { subject, topic, skill } = await params;
  const { ok, data: d } = await call(`learn/cgl/${subject}/${topic}/${skill}`);
  if (!ok) return { title: "Learn" };
  const stage = d.stage === "Tier II" ? "Tier II" : "Tier I";
  return { title: `${d.title}: ${d.topic}, SSC CGL ${stage}`, description: `The idea, the rule and a worked example for ${d.title}, then fresh previous-year questions.`,
    alternates: { canonical: `/learn/cgl/${subject}/${topic}/${skill}/` }, robots: d.lesson?.status === "approved" ? undefined : { index: false } };
}

export default async function Skill({ params, searchParams }) {
  const { subject, topic, skill } = await params;
  const query = await searchParams;
  const page = pageOf(query.page);
  const base = `/learn/cgl/${subject}/${topic}/${skill}/`;
  const { status, data: d } = await call(`learn/cgl/${subject}/${topic}/${skill}`, query.from === "tier-ii" ? "stage=Tier+II" : "");
  if (status === 404) notFound();
  if (d.locked) return <GoToPlans />;
  const tierTwo = d.stage === "Tier II" || query.from === "tier-ii";
  const total = d.practice.eligible;
  const tierQuery = tierTwo ? "?from=tier-ii" : "";
  const chapterHref = `/learn/cgl/${subject}/${tierQuery}#t-${topic}`;
  const practicePage = (number) => number > 1 ? `${base}${tierQuery ? `${tierQuery}&` : "?"}page=${number}` : base + tierQuery;
  const feed = total ? await getQuestions(new URLSearchParams({ skill: d.id, stage: d.stage, page: String(page) }).toString()) : null;
  if (feed && page > feed.pages) redirect(practicePage(feed.pages));
  const practice = <div className="lp-pyq">
    {feed && feed.total ? <>
      <p className="muted">{total} previous year question{total === 1 ? "" : "s"} on this skill{d.practice.thirdParty > 0 && ", including memory-based papers"}</p>
      <QuestionFeed data={feed} skillPractice pageHref={practicePage} />
    </> : <div className="notice lp-fallback">
      <strong>Practise the chapter</strong>
      <p>This skill has no linked past-paper questions yet.</p>
      {d.practice.chapterHref
        ? <Link className="button secondary" href={d.practice.chapterHref}>Practise {d.topic} PYQs</Link>
        : <Link className="button secondary" href={chapterHref}>Browse skills in {d.topic}</Link>}
    </div>}</div>;
  return <div className={d.lesson ? "lesson-shell with-companion" : "lesson-shell"}>
    <Link className="back" href={chapterHref}>{d.subjectTitle} · {d.topic}</Link>
    <div className="page-head"><h1>{d.title}</h1>
      <p className="badges">{tierTwo && <span className="badge">Tier II</span>}{d.lessonCompletedAt && <span className="badge ok">Completed {lessonDate(d.lessonCompletedAt)}</span>}
        {!tierTwo && d.probability > 0 && <span className="badge">{shiftChance(d.probability, true)}</span>}
        {total > 0 && <span className="badge">{total} real questions available</span>}
        {d.games.length > 0 && d.games.includes("math-sprint") && <Link className="badge" href="/games/math-sprint/">Play Math Sprint</Link>}</p></div>
    {d.lesson ? <div className="lesson-grid"><div className="lesson-main">
      <LessonPlayer skill={{ id: d.id }} lesson={d.lesson} screens={screensOf(d.lesson.blocks)} practice={practice} signedIn={d.signedIn}
        prerequisites={d.prerequisiteSkills.map((item) => ({ ...item, href: item.href + tierQuery }))}
        next={d.next && { ...d.next, href: d.next.href + tierQuery }} hasPractice={Boolean(total)} startOnPractice={page > 1}
        completedAt={d.lessonCompletedAt} chapterHref={chapterHref} />
      <ReportButton lessonId={d.lesson.lessonId} version={d.lesson.version} /></div>
      <Companion key={`${d.id}:${d.lesson.version}`} approvedVersion={d.lesson.status === "approved" ? d.lesson.version : null} path={`${subject}/${topic}/${skill}`} signedIn={d.signedIn} /></div>
      : <section><div className="notice"><p><strong>The lesson for this skill is being prepared.</strong> Lessons are published only after a review.</p></div>{practice}</section>}
  </div>;
}
