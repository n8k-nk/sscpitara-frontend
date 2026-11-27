import Link from "../../../components/NavigationLink";
import PyqMockStart from "../../../components/PyqMockStart";
import { getOverview, papersOf } from "../../../lib/pyq";
import AutoFilters from "./AutoFilters";
import styles from "./mocks.module.css";

const PAGE_SIZE = 10;  // dates, each with all its shifts

const day = (iso) => new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric" });

/** Papers sat on one date, for one stage, share a card. Undated papers keep their own. */
function byDate(papers) {
  const groups = new Map();
  for (const paper of papers) {
    const key = paper.held_on ? `${paper.stage}|${paper.held_on}` : paper.slug;
    if (!groups.has(key)) groups.set(key, { key, title: paper.held_on ? `${day(paper.held_on)} · ${paper.stage}` : paper.title, papers: [] });
    groups.get(key).papers.push(paper);
  }
  return [...groups.values()];
}

export default async function PaperMocks({ tier, query }) {
  const overview = await getOverview(true);
  const exams = overview.exams.map((exam) => ({ code: exam.code, papers: papersOf(exam).filter((paper) => paper.mock_available) }))
    .filter((exam) => exam.papers.length);
  const exam = exams.find((item) => item.code === query.exam) ?? exams.find((item) => item.code === "CGL") ?? exams[0];
  if (!exam) return <p className="muted">No timed papers are available yet.</p>;

  const stages = [...new Set(exam.papers.map((paper) => paper.stage))];
  const defaultStage = tier === 2 ? "Tier II" : "Tier I";
  const stage = query.stage === "" || stages.includes(query.stage) ? query.stage : stages.includes(defaultStage) ? defaultStage : "";
  const inStage = exam.papers.filter((paper) => !stage || paper.stage === stage);
  const years = [...new Set(inStage.map((paper) => paper.path.split("/")[1]))];
  const year = years.includes(query.year) ? query.year : "";
  const papers = inStage.filter((paper) => !year || paper.path.split("/")[1] === year);
  const groups = byDate(papers);
  const pages = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  const requested = typeof query.page === "string" ? Number(query.page) : 1;
  const page = Number.isInteger(requested) ? Math.min(Math.max(requested, 1), pages) : 1;
  const href = (number) => `/study/practice/?${new URLSearchParams({ view: "papers", tier, exam: exam.code, stage, year, page: number })}`;

  const upgrade = overview.viewer === "anonymous" ? `/signin/?next=${encodeURIComponent(href(page))}` : "/plans/";

  return <section className={styles.list} aria-labelledby="paper-mocks">
    <div className={styles.listHead}><h2 id="paper-mocks">Previous-year paper mocks</h2><span>{papers.length} papers</span></div>
    <p className="muted">{overview.viewer === "premium"
      ? "Timed mocks use the paper’s original time limit. Leaving the tab or fullscreen submits the test. Starting while a paper mock is in progress resumes that attempt."
      : <>Every paper is free to practise untimed. Timed whole-paper mocks need Premium. <Link href={upgrade}>{overview.viewer === "anonymous" ? "Sign in" : "View plans"}</Link></>}</p>
    <AutoFilters key={`${exam.code}-${stage}-${year}`} action="/study/practice/" className={styles.filters}>
      <input type="hidden" name="view" value="papers" />
      <input type="hidden" name="tier" value={tier} />
      {exams.length > 1 && <div><label htmlFor="paper-exam">Exam</label><select id="paper-exam" name="exam" defaultValue={exam.code}>
        {exams.map((item) => <option key={item.code}>{item.code}</option>)}</select></div>}
      <div><label htmlFor="paper-stage">Stage</label><select id="paper-stage" name="stage" defaultValue={stage}><option value="">All stages</option>
        {stages.map((value) => <option key={value}>{value}</option>)}</select></div>
      <div><label htmlFor="paper-year">Year</label><select id="paper-year" name="year" defaultValue={year}><option value="">All years</option>
        {years.map((value) => <option key={value}>{value}</option>)}</select></div>
      <noscript><button type="submit" className="secondary">Apply filters</button></noscript>
    </AutoFilters>
    <ul className={styles.dates}>{groups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((group) =>
      <li key={group.key}>
        <h3>{group.title}</h3>
        <ul>{group.papers.map((paper) => {
          const name = paper.held_on ? [paper.shift && `Shift ${paper.shift}`, paper.name].filter(Boolean).join(" · ") || "Paper" : "Paper";
          return <li key={paper.slug}>
            <div><strong>{name}</strong><span className={styles.state}>{paper.questions} questions · {paper.duration_minutes} min
              {paper.practice && " · Third-party practice"}</span></div>
            <div className={styles.actions}>
              <Link className="button secondary" prefetch={false} href={`/pyq/${paper.path}/`} aria-label={`Practise ${paper.title} untimed`}>Untimed</Link>
              {overview.viewer === "premium" ? <PyqMockStart paper={paper} />
                : <Link className="button ghost" prefetch={false} href={upgrade} aria-label={`Timed mock for ${paper.title} needs Premium`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                  Timed · Premium</Link>}
            </div>
          </li>;
        })}</ul>
      </li>)}</ul>
    {pages > 1 && <nav className={styles.pager} aria-label="Paper mock pages">
      {page > 1 && <Link href={href(page - 1)} prefetch={false}>Previous</Link>}
      <span>Page {page} of {pages}</span>
      {page < pages && <Link href={href(page + 1)} prefetch={false}>Next</Link>}
    </nav>}
  </section>;
}
