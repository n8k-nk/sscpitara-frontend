import { cache } from "react";
import Link from "../../../../components/NavigationLink";
import { notFound } from "next/navigation";
import OpenTopic from "../../../../components/learn/OpenTopic";
import { STATE, chanceByYear, lessonDate, minutes, shiftChance } from "../../../../components/learn/bits";
import { call } from "../../../../lib/server";
import { metadata as pageMetadata } from "../../../../lib/public";

const loadSubject = cache(async (subject, stageQuery) =>
  call(`learn/cgl/${subject}`, stageQuery)
);

export async function generateMetadata({ params, searchParams }) {
  const { subject } = await params;
  const query = await searchParams;
  const { ok, data } = await loadSubject(subject, query.from === "tier-ii" ? "stage=Tier+II" : "");
  const stage = data?.subject?.stage === "Tier II" ? "Tier II" : "Tier I";
  return ok ? pageMetadata(`SSC CGL ${data.subject.title}: ${stage} Lessons`,
    `SSC CGL ${stage} ${data.subject.title} topics and skills, with lessons, how often each is asked in previous year papers, and practice questions.`,
    `/learn/cgl/${subject}/`) : { title: "Learn" };
}

const byFrequency = (a, b) => b.probability - a.probability || b.perShift - a.perShift || a.title.localeCompare(b.title);

export default async function Subject({ params, searchParams }) {
  const { subject } = await params;
  const query = await searchParams;
  const { ok, status, data: d } = await loadSubject(subject, query.from === "tier-ii" ? "stage=Tier+II" : "");
  if (status === 404) notFound();
  if (!ok || !d?.subject) throw new Error("Could not load this subject. Please refresh.");
  const tierTwo = d.subject.stage === "Tier II" || query.from === "tier-ii";
  const skillQuery = tierTwo ? "?from=tier-ii" : "";
  const topics = d.topics.map((t) => ({ ...t, skills: [...t.skills] }));
  // New learners get study order, so prerequisites come first; anyone with progress gets the most-asked topics first.
  const begun = topics.some((t) => t.skills.some((s) => s.secure || s.lessonCompleted || s.state !== "unseen"));
  const sort = ["freq", "order"].includes(query.sort) ? query.sort : begun ? "freq" : "order";
  if (sort === "freq") {
    topics.sort(byFrequency);
    for (const t of topics) t.skills.sort(byFrequency);
  }
  const skills = topics.flatMap((t) => t.skills);
  const done = skills.filter((s) => s.secure || s.lessonCompleted).length;
  const started = skills.filter((s) => !(s.secure || s.lessonCompleted) && s.state !== "unseen").length;
  const total = skills.length;
  const pct = total ? Math.round((100 * done) / total) : 0;
  const finished = (t) => t.skills.every((s) => s.secure || s.lessonCompleted);
  const openSlug = (topics.find((t) => !finished(t)) ?? topics[0])?.slug;
  const sortHref = (key) => `?sort=${key}${skillQuery ? "&from=tier-ii" : ""}`;
  return <>
    <Link className="back" href={tierTwo ? "/learn/cgl/tier-ii/" : "/learn/cgl/"}>{tierTwo ? "Tier II" : "All subjects"}</Link>
    <div className="page-head"><span className="eyebrow">SSC CGL · {tierTwo ? "Tier II" : "Tier I"}</span><h1>{d.subject.title}</h1>
      {d.subject.note && <p className="muted">{d.subject.note}</p>}
      {tierTwo && d.subject.stage !== "Tier II" && <p className="muted">These are the same lessons as Tier I. Tier II asks the same ideas in longer questions. Computer Knowledge, Statistics, and Finance and Economics have their own lessons.</p>}
      {d.signedIn && <div className="subject-progress">
        <div className="subject-progress-top"><p><strong>{done}</strong> of {total} skills done <span>· {started} in progress</span></p><span className="pct">{pct}%</span></div>
        <div className="split-meter" role="progressbar" aria-label={`${d.subject.title} progress`} aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}
          aria-valuetext={`${done} of ${total} skills done, ${started} in progress`}>
          <span className="done" style={{ width: `${total ? (100 * done) / total : 0}%` }} />
          <span className="started" style={{ width: `${total ? (100 * started) / total : 0}%` }} />
        </div>
      </div>}
    </div>
    <nav className="tabs" aria-label="Sort topics">{[["order", "Study order"], ["freq", "Most asked first"]].map(([key, label]) =>
      <Link key={key} className={sort === key ? "tab on" : "tab"} aria-current={sort === key ? "page" : undefined} href={sortHref(key)}>{label}</Link>)}</nav>
    {skills.some((s) => s.open === false) && <p className="muted">The first two lessons are free. The others open with Premium.</p>}
    <OpenTopic />
    <div className="subject-layout">
    <nav className="topic-index" aria-label="Topics"><ol>{topics.map((t) => <li key={t.slug}>
      <a href={`#t-${t.slug}`}><span>{t.title}</span><small>{d.signedIn ? `${t.skills.filter((s) => s.secure || s.lessonCompleted).length}/` : ""}{t.skills.length}</small></a></li>)}</ol></nav>
    <div className="topic-stack">{topics.map((t) => {
      const needs = (s) => (s.waitingFor?.length ? `${s.waitingFor[0]}${s.waitingFor.length > 1 ? ` +${s.waitingFor.length - 1}` : ""}` : "");
      // When every skill in a topic waits on the same thing, say it once under the heading instead of on every row.
      const shared = t.skills.length > 1 && t.skills.every((s) => needs(s) && needs(s) === needs(t.skills[0])) ? needs(t.skills[0]) : "";
      return <details className="topic-block" key={`${sort}-${t.slug}`} id={`t-${t.slug}`} open={t.slug === openSlug}>
      <summary><h2 className="learn-topic-heading">{t.title}</h2>
        <span className="muted small">{t.skills.length} skills · {minutes(t.minutes)} · {t.questions} real questions{!tierTwo && t.probability > 0 ? ` · ${shiftChance(t.probability).toLowerCase()}` : ""}</span>
        {shared && <span className="muted small">Best after: {shared}</span>}</summary>
      <ol className="path-list skill-list">{t.skills.map((s) => {
        const [label, tone] = STATE[s.state] ?? STATE.unseen, byYear = chanceByYear(s.probabilityByYear);
        return <li className="path-row" key={s.id}>
          <span className={`dot ${s.lessonCompleted || s.state === "proficient" ? "done" : s.state === "unseen" ? "todo" : "started"}`} aria-hidden="true" />
          <div className="row-main"><Link className="row-title" href={s.open === false ? "/plans/" : `/learn/cgl/${subject}/${t.slug}/${s.slug}/${skillQuery}`}>{s.title}</Link>
            <span className="row-meta">
              {s.lessonCompleted && <span className="badge ok">Completed <time dateTime={s.lessonCompletedAt}>{lessonDate(s.lessonCompletedAt)}</time></span>}
              {s.state !== "unseen" && !(s.lessonCompleted && s.state === "learning") && <span className={`badge ${tone}`}>{label}</span>}
              <span>{s.minutes} min</span>
              {tierTwo && Number.isInteger(s.practiceCount) && <span>{s.practiceCount === 0 ? "No linked PYQs" : `${s.practiceCount} PYQ${s.practiceCount === 1 ? "" : "s"}`}</span>}
              {!tierTwo && s.probability > 0 && <span className="badge" title={byYear}>{shiftChance(s.probability)}</span>}
              {!s.hasLesson && <span className="muted">Lesson in preparation</span>}
              {s.evidence && <span className="muted">{s.evidence.correct} of {s.evidence.attempted} right first time</span>}
              {!shared && needs(s) && <span className="muted">Best after: {needs(s)}</span>}</span></div>
          <div className="row-act"><Link className="button secondary" href={s.open === false ? "/plans/" : `/learn/cgl/${subject}/${t.slug}/${s.slug}/${skillQuery}`}>{s.open === false ? "Premium" : s.lessonCompleted ? "Revisit" : "Open"}</Link></div></li>;
      })}</ol></details>;
    })}</div>
    </div>
    {tierTwo
      ? <p className="muted small">Question counts on a skill are published CGL Tier II papers. The topic-to-skill link follows the archive’s topic label and has not been checked one question at a time.</p>
      : <p className="muted small">The percentage is the share of complete 100-question papers (one per exam shift) in which that skill appeared, weighted across years ({Object.entries(d.frequency.shifts_by_year).map(([y, n]) => `${n} shifts in ${y}`).join(", ")}). A second question in the same paper does not raise it. Low frequency never hides a skill: the syllabus is wider than past papers.</p>}
  </>;
}
