import Link from "next/link";
import Rich from "../../components/Rich";
import PyqQuestion from "../../components/PyqQuestion";
import PyqSignup from "../../components/PyqSignup";
import Unlock from "../../components/PyqUnlock";
import { site } from "../../lib/public";
import { getOverview, n, rankTopics } from "../../lib/pyq";

const SOURCE = { official: "Official answer key", expert: "Expert reviewed", ai: "AI generated" };
const when = (iso, opts) => new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", ...opts });
export const query = (p) => new URLSearchParams(Object.entries(p).filter(([, v]) => v)).toString();
export const withQuery = (path, p) => (query(p) ? `${path}?${query(p)}` : path);

/** Breadcrumb trail, plus the same trail as schema.org data so search results can show it. */
export function Crumbs({ trail }) {
  const data = { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: new URL(c.href, site).href })) };
  return <>
    <nav className="crumbs" aria-label="Breadcrumb"><ol>{trail.map((c, i) => <li key={c.href}>
      {i < trail.length - 1 ? <Link href={c.href}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}</li>)}</ol></nav>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
  </>;
}

/** Year wise / Topic wise switch for one exam. */
export function ExamTabs({ exam, active, stage = "" }) {
  return <nav className="pyq-seg" aria-label="Browse by">
    <Link href={withQuery(`/pyq/${exam.slug}/`, { stage })} aria-current={active === "year" ? "page" : undefined}>Year wise</Link>
    <Link href={withQuery(`/pyq/${exam.slug}/topics/`, { stage })} aria-current={active === "topic" ? "page" : undefined}>Topic wise</Link>
  </nav>;
}

function Days({ papers }) {
  const byDate = new Map();
  for (const p of papers) {
    const key = p.held_on ?? p.slug;
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(p);
  }
  const days = [...byDate.entries()].sort(([a], [b]) => (a < b ? 1 : -1));
  return <ul className="pyq-days">{days.map(([key, list]) => <li key={key}>
    <div className="pyq-day"><strong>{list[0].held_on ? when(list[0].held_on, { day: "numeric", month: "short" }) : list[0].stage}</strong>
      <span className="muted">{list[0].held_on ? when(list[0].held_on, { weekday: "long" }) : ""}</span></div>
    <div className="pyq-shifts">{list.map((p) => <Link key={p.slug} href={`/pyq/${p.path}/`} className="pyq-shift">
      <span>{p.shift ? `Shift ${p.shift}` : p.name || "Paper"}</span>
      <small>{p.done > 0 ? `${p.done}/${p.questions} done` : `${p.questions} Q`}</small>
    </Link>)}</div>
  </li>)}</ul>;
}

export function Years({ years, openFirst = false }) {
  return <div className="pyq-years">{years.map((y, i) => {
    const stages = [...new Set(y.papers.map((p) => p.stage))].sort();
    const total = y.papers.reduce((s, p) => s + p.questions, 0);
    return <details key={y.year} className="pyq-acc" open={openFirst && i === 0}>
      <summary className="pyq-year-heading">
        <span className="pyq-year-title"><strong className="pyq-acc-year">{y.year}</strong>
          <small>{y.papers.length} paper{y.papers.length === 1 ? "" : "s"} · {n(total)} questions</small></span>
        <span className="muted pyq-year-stages">{stages.join(" · ")}</span></summary>
      <div className="pyq-stagebox">
        {stages.length === 1 ? <Days papers={y.papers} /> : stages.map((stage) => {
          const papers = y.papers.filter((p) => p.stage === stage);
          return <details key={stage} className="pyq-acc pyq-stage">
            <summary><strong>{stage}</strong><span className="muted">{papers.length} paper{papers.length === 1 ? "" : "s"}</span></summary>
            <div className="pyq-stage-papers"><Days papers={papers} /></div>
          </details>;
        })}
      </div>
    </details>;
  })}</div>;
}


export function topicHref(exam, t, year, stage) {
  return withQuery(`/pyq/${exam.slug}/topics/${t.subject}/${t.topic_slug}/`, { year, stage });
}

/** Bar chart of how often each topic was asked, with year / stage / subject filters as plain links. */
export function Topics({ exam, year, subject, stage }) {
  const base = `/pyq/${exam.slug}/topics/`;
  const years = exam.years.map((y) => y.year);
  const stages = [...new Set(exam.topic_stats.map((t) => t.stage))].sort();
  const shifts = exam.years.filter((y) => !year || String(y.year) === year)
    .reduce((s, y) => s + y.papers.filter((p) => !stage || p.stage === stage).length, 0);
  const rows = exam.topic_stats.filter((t) => (!year || String(t.year) === year) && (!stage || t.stage === stage));
  const subjects = [...new Map(exam.topic_stats.map((t) => [t.subject, t.subject_name])).entries()];
  const availableSubjects = new Set(rows.map((t) => t.subject));
  const filters = { stage, year, subject };
  const groups = [
    { key: "stage", title: "Tier", all: "All tiers", options: stages.map((st) => [st, st]) },
    { key: "year", title: "Year", all: "All years", options: years.map((y) => [String(y), y]) },
    { key: "subject", title: "Subject", all: "All subjects", options: subjects.filter(([slug]) => availableSubjects.has(slug)) },
  ];
  function filterHref(key, value) {
    const next = { ...filters, [key]: value };
    if (next.subject && key !== "subject" && !exam.topic_stats.some((t) =>
      t.subject === next.subject && (!next.stage || t.stage === next.stage) && (!next.year || String(t.year) === next.year))) {
      next.subject = "";
    }
    return withQuery(base, next);
  }
  const list = rankTopics(rows.filter((t) => !subject || t.subject === subject));
  const total = list.reduce((s, r) => s + r.questions, 0);
  const max = list[0]?.questions ?? 1;
  const row = (r) => <li key={r.topic}><Link className="pyq-bar" aria-label={`Practise ${r.topic_name}, ${n(r.questions)} questions`} href={topicHref(exam, r, year, stage)}>
    <span className="pyq-bar-label"><span>{r.topic_name}</span>{!subject && <small>{r.subject_name}</small>}</span>
    <span className="pyq-bar-track" aria-hidden="true"><span style={{ width: `${Math.max(2, (r.questions / max) * 100)}%` }} /></span>
    <span className="pyq-bar-num"><strong>{n(r.questions)}</strong><small>{((r.questions / total) * 100).toFixed(1)}%</small></span>
    <span className="pyq-practise">Practise <span aria-hidden="true">→</span></span>
  </Link></li>;
  return <div className="pyq-analysis">
    <aside className="pyq-controls" aria-label="Topic filters">
      <div className="pyq-filter-heading"><h2>Filter topics</h2>
        {(subject || year || stage) && <Link href={base}>Clear all</Link>}
      </div>
      <div className="pyq-filter-groups">
        {groups.map(({ key, title, all, options }) => <div key={key} role="group" aria-label={title}>
          <strong>{title}</strong>
          <div className="pyq-filter-row">
            {[["", all], ...options].map(([value, label]) => <Link key={value} scroll={false}
              href={filterHref(key, value)} aria-current={value === filters[key] ? "true" : undefined}>{label}</Link>)}
          </div>
        </div>)}
      </div>
    </aside>
    {list.length ? <section className="pyq-chart" aria-label="Questions per topic">
      <h2>Choose a topic</h2>
      <p className="pyq-chart-head"><strong>{list[0].topic_name}</strong> is the most asked topic{year ? ` in ${year}` : ""} with {n(list[0].questions)} of {n(total)} questions
        {shifts > 0 && <span className="muted"> · across {shifts} paper{shifts === 1 ? "" : "s"}</span>}.</p>
      <ol className="pyq-bars">{list.map(row)}</ol>
    </section> : <p className="empty">No questions for this selection.</p>}
  </div>;
}

function Solution({ q }) {
  const notes = q.options.filter((o) => o.explanation);
  return <>
    {q.answer?.text && q.type === "descriptive" && <div className="rich"><Rich>{q.answer.text}</Rich></div>}
    {q.explanation && <div className="rich"><Rich>{q.explanation}</Rich></div>}
    {notes.length > 0 && <ul className="pyq-option-notes">{notes.map((o) => <li key={o.label}><strong>{o.label}.</strong> <Rich inline>{o.explanation}</Rich></li>)}</ul>}
    {q.explanation_hi && <details lang="hi"><summary>हिन्दी में समाधान</summary><div className="rich"><Rich>{q.explanation_hi}</Rich></div></details>}
    <p className="pyq-source">Answer: {q.paper.practice ? "Memory-based paper, key not from SSC" : SOURCE[q.answer_source]}{q.explanation_source && ` · Solution: ${SOURCE[q.explanation_source]}`}
      {q.section.marks_correct && ` · +${q.section.marks_correct}${q.section.marks_wrong ? ` / −${q.section.marks_wrong}` : ""} marks`}</p>
  </>;
}

function Hindi({ q }) {
  if (!q.text_hi || !q.options.every((o) => o.text_hi)) return null;
  return <details lang="hi" className="pyq-hindi"><summary>हिन्दी में देखें</summary>
    {q.passage?.text_hi && <div className="passage rich"><Rich>{q.passage.text_hi}</Rich></div>}
    <div className="rich"><Rich>{q.text_hi}</Rich></div>
    {q.options.length > 0 && <ol type="A">{q.options.map((o) => <li key={o.label}><Rich inline>{o.text_hi}</Rich></li>)}</ol>}
  </details>;
}

function Item({ q, viewer, skillPractice }) {
  if (q.locked) return <PyqQuestion q={q} viewer={viewer} />;
  return <PyqQuestion q={q} viewer={viewer} skillPractice={skillPractice}
    stem={<Rich>{q.text}</Rich>}
    options={q.options.map((o) => <Rich inline key={o.label}>{o.text}</Rich>)}
    passage={q.passage && <div className="passage rich"><Rich>{q.passage.text}</Rich></div>}
    solution={viewer === "premium" ? <Solution q={q} /> : null}
    hindi={<Hindi q={q} />} />;
}

/** The question list with the sign-up wall, notices and previous / next links. `pageHref(n)` builds the link to page n. */
export function QuestionFeed({ data, pageHref, skillPractice = false }) {
  const anon = data.viewer === "anonymous";
  const hidden = anon ? Math.max(0, data.total - data.free_preview) : 0;
  return <>
    {anon && hidden > 0 && <Unlock free={data.free_preview} hidden={hidden} />}
    {data.viewer === "member" && <p className="notice">Worked explanations are part of Premium. <Link href="/plans/">See Premium</Link></p>}
    {data.questions.length ? <>
      <p className="muted">{data.total} question{data.total === 1 ? "" : "s"} · page {data.page} of {data.pages}</p>
      <div className="pyq-list">{data.questions.map((q) => <Item key={q.id} q={q} viewer={data.viewer} skillPractice={skillPractice} />)}</div>
      <nav className="actions" aria-label="Pages">
        {data.page > 1 && <Link className="button secondary" rel="prev" href={pageHref(data.page - 1)}>← Previous</Link>}
        {data.page < data.pages && <Link className="button secondary" rel="next" href={pageHref(data.page + 1)}>Next →</Link>}
      </nav></> : <p className="empty">No published questions match.</p>}
    <PyqSignup />
  </>;
}

/** Buttons to move between a learner's own exams. Renders nothing when they have only one (or are signed out and only one exists). */
export async function ExamSwitch({ current }) {
  const { exams } = await getOverview();
  if (exams.length < 2) return null;
  return <nav className="pyq-exams" aria-label="Exam">{exams.map((e) =>
    <Link key={e.code} href={`/pyq/${e.slug}/`} aria-current={e.slug === current ? "page" : undefined}>
      <strong>{e.code}</strong><small>{n(e.questions)} Q</small></Link>)}</nav>;
}

/** An exam's landing content: papers by year, with a link to the topic view. */
export async function ExamLanding({ exam, stage }) {
  const years = stage ? exam.years.map((year) => ({ ...year, papers: year.papers.filter((paper) => paper.stage === stage) }))
    .filter((year) => year.papers.length) : exam.years;
  const papers = years.flatMap((year) => year.papers);
  return <>
    <div className="page-head pyq-cover"><span className="eyebrow">SSC {exam.code} · {stage || "Paper archive"}</span><h1>Previous year papers</h1>
      <p>{n(papers.length)} papers · {n(papers.reduce((sum, paper) => sum + paper.questions, 0))} questions · {years.length} exam years</p></div>
    <ExamSwitch current={exam.slug} />
    <ExamTabs exam={exam} active="year" stage={stage} />
    <Years years={years} />
  </>;
}
