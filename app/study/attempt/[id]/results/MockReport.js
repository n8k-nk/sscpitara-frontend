import Link from "next/link";
import Figures from "../../../../../components/Figures";
import PyqFollowup from "../../../../../components/PyqFollowup";
import ResultTools from "../../../../../components/ResultTools";
import QuestionTutor from "../../../../../components/QuestionTutor";
import Rich from "../../../../../components/Rich";
import MockCoach from "./MockCoach";
import Benchmarks from "./Benchmarks";
import s from "./report.module.css";

const finishReasons = {
  tab_switch: "Submitted after switching tabs",
  fullscreen_exit: "Submitted after leaving full screen",
  page_exit: "Submitted after leaving the test",
  time_expired: "Time expired",
};
const marks = (value) => Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const percent = (value) => value == null ? "—" : `${marks(value)}%`;
function duration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes ? `${minutes}m${rest ? ` ${rest}s` : ""}` : `${rest}s`;
}

function reviewUrl(base, filter = {}, anchor = "answers") {
  const q = new URLSearchParams({ view: "review" });
  for (const [key, value] of Object.entries(filter)) {
    if (value && value !== "all") q.set(key, String(value));
  }
  return `${base}?${q}#${anchor}`;
}

function Scorecard({ d }) {
  const o = d.analysis.overall;
  return <header className={s.scorecard}>
    <div className={s.scoreTitle}>
      <p>{d.title}</p><h1>Mock results</h1>
      {d.rules.source?.path ? <Link href={`/pyq/${d.rules.source.path}/`}>View original paper <span aria-hidden="true">↗</span></Link>
        : <Link href={`/study/practice/?tier=${d.rules.stage === "Tier II" ? 2 : 1}${d.kind === "cgl-sectional" ? "&view=sectional" : ""}`}>
          {d.kind === "cgl-sectional" ? "Back to sectional tests" : "Back to mock tests"}</Link>}
    </div>
    <div className={s.scoreBoard}>
      <div className={s.scoreNumber}><span>Net score</span><strong>{marks(d.score)} <small>/ {marks(o.max_marks)}</small></strong></div>
      <dl className={s.headStats}>
        <div><dt>Accuracy</dt><dd>{percent(o.accuracy)}</dd></div>
        <div><dt>Attempted</dt><dd>{o.answered}<small> / {o.total}</small></dd></div>
        <div><dt>Time used</dt><dd>{duration(d.analysis.elapsed_seconds)}</dd></div>
      </dl>
    </div>
    <div className={s.scoreFoot}><span>{marks(o.positive_marks)} marks earned <b aria-hidden="true">·</b> {marks(o.penalty_marks)} deducted</span>
      <span>{finishReasons[d.rules.finish_reason] || "Submitted"} <b aria-hidden="true">·</b> {duration(d.analysis.limit_seconds)} limit</span></div>
  </header>;
}

const outcomes = [["correct", "Correct"], ["incorrect", "Incorrect"], ["skipped", "Skipped"]];

function OutcomeBar({ stats }) {
  return <div className={s.outcomeBar} aria-hidden="true">
    {outcomes.filter(([key]) => stats[key] > 0).map(([key]) => <span key={key} className={s[key]} style={{ flex: stats[key] }} />)}
  </div>;
}

function Sections({ analysis, base }) {
  return <section className={s.panel}>
    <header className={s.panelTitle}><h2>Section breakdown</h2><span>{analysis.sections.length} sections</span></header>
    <div className={s.legend}>{outcomes.map(([key, label]) => <span key={key}><i className={s[key]} />{label}</span>)}</div>
    <div className={s.sections}>{analysis.sections.map((r) => <Link key={r.name} href={reviewUrl(base, { section: r.name })} prefetch={false} className={s.sectionRow}>
      <div className={s.sectionHead}><strong>{r.name}</strong><span>{marks(r.score)} <small>/ {marks(r.max_marks)}</small></span></div>
      <OutcomeBar stats={r} />
      <div className={s.sectionMeta}><span>{r.correct} correct · {r.incorrect} incorrect · {r.skipped} skipped</span>
        <span>{duration(r.seconds)} observed</span></div>
    </Link>)}</div>
  </section>;
}

function NextPractice({ data: d, base }) {
  const { overall, topics } = d.analysis;
  const leading = topics.find((topic) => topic.incorrect || topic.skipped);
  if (!leading) return d.pyq_followup ? <PyqFollowup plan={d.pyq_followup} /> : null;
  const gap = marks(Number(overall.max_marks) - Number(overall.score));
  const topicGap = marks(Number(leading.max_marks) - Number(leading.score));
  const filter = { section: leading.section_name, topic: leading.name, outcome: leading.incorrect ? "incorrect" : "skipped" };
  return <section className={s.panel} aria-labelledby="mock-next-practice">
    <header className={s.panelTitle}><h2 id="mock-next-practice">What to practise next</h2></header>
    <p>You scored <strong>{gap} marks below the maximum</strong>. The largest gap was in <Link href={reviewUrl(base, filter)}>{leading.name}</Link>, where you lost {topicGap} marks with {leading.incorrect} incorrect and {leading.skipped} skipped.</p>
    <p className={s.note}>Incorrect answers incurred {marks(overall.penalty_marks)} marks in penalties.
      {overall.incorrect_seconds > 0 && ` You spent ${duration(overall.incorrect_seconds)} viewing questions you ultimately answered incorrectly.`}
    </p>
    {d.pyq_followup ? <PyqFollowup plan={d.pyq_followup} /> : d.coach_practice &&
      <Link className="button" href={d.coach_practice.href}>Practise unanswered {d.coach_practice.topic} PYQs</Link>}
    {d.coach_available && <MockCoach attempt={d.id} />}
  </section>;
}

function Mistakes({ data: d, base }) {
  const { overall: o, topics, slowest_incorrect: slow } = d.analysis;
  const lost = topics.filter((topic) => topic.incorrect || topic.skipped);
  const row = (topic) => <li key={`${topic.section_name}/${topic.subject}/${topic.name}`}>
    <Link href={reviewUrl(base, { section: topic.section_name, topic: topic.name, outcome: topic.incorrect ? "incorrect" : "skipped" })} prefetch={false}>
      <div><strong>{topic.name}</strong><small>{topic.subject}</small></div>
      <span>{[topic.incorrect > 0 && `${topic.incorrect} incorrect`, topic.skipped > 0 && `${topic.skipped} skipped`].filter(Boolean).join(" · ")} <b aria-hidden="true">›</b></span>
    </Link>
  </li>;
  return <section className={s.panel}>
    <header className={s.panelTitle}><h2>Where you lost marks</h2></header>
    <div className={s.lossCounts}>
      <Link prefetch={false} href={reviewUrl(base, { outcome: "incorrect" })}><strong>{o.incorrect}</strong>Incorrect</Link>
      <Link prefetch={false} href={reviewUrl(base, { outcome: "skipped" })}><strong>{o.skipped}</strong>Skipped</Link>
      <Link prefetch={false} href={reviewUrl(base, { outcome: "flagged" })}><strong>{o.flagged}</strong>Flagged</Link>
    </div>
    {lost.length ? <><ul className={s.topicList}>{lost.slice(0, 4).map(row)}</ul>
      {lost.length > 4 && <details className={s.more}><summary>View {lost.length - 4} more topics</summary><ul className={s.topicList}>{lost.slice(4).map(row)}</ul></details>}
    </> : <p className={s.note}>You answered every question correctly.</p>}
    {slow?.length > 0 && <div className={s.slow}><h3>Time spent on incorrect answers</h3><ul>{slow.map((q) =>
      <li key={q.position}><Link prefetch={false} href={reviewUrl(base, { q: q.position }, `q${q.position}`)}>Q{q.number} · {q.topic}</Link><span>{duration(q.seconds)}</span></li>)}</ul></div>}
  </section>;
}

function PracticeRank({ rank }) {
  if (!rank) return null;
  return <section className={s.panel}><header className={s.panelTitle}><h2>SSC Pitara practice rank</h2></header>
    {rank.rank != null ? <><strong className={s.rankNumber}>#{rank.rank} <small>of {rank.participants} learners</small></strong>
      <p className={s.note}>{rank.is_first_attempt ? "Your rank" : "Your first attempt’s rank"} among learners who submitted this paper. Each learner’s first score counts. Ties share a rank.</p></>
      : <><strong className={s.rankNumber}>{rank.participants} <small>of 5 learners</small></strong>
        <p className={s.note}>Rank becomes available after five learners submit this paper for the first time.</p></>}
  </section>;
}

function Question({ row, attempt }) {
  const tone = row.outcome === "Correct" ? s.good : row.outcome === "Incorrect" ? s.bad : s.neutral;
  return <article id={`q${row.position}`} className={s.question}>
    <header className={s.questionMeta}><strong>Question {row.number ?? row.position}</strong><span className={tone}>{row.outcome}</span>
      {row.flagged && <span>Flagged</span>}<small>{marks(row.marks)} marks · {row.visited || row.seconds ? `${duration(row.seconds)} observed` : "Unvisited"}</small></header>
    <p className={s.subjectLine}>{row.section_name} · {row.topic}</p>
    {row.passage && <div className="passage rich"><Rich>{row.passage}</Rich></div>}
    <Figures figures={row.media.passage} />
    <div className={`rich ${s.questionPrompt}`}><Rich>{row.prompt}</Rich></div>
    <Figures figures={row.media.prompt} />
    {row.diagram_url && <img className="diagram" src={row.diagram_url} alt="Question diagram" />}
    <ol className={s.options}>{row.options.map((o, i) => {
      const correct = i === row.correct_index, selected = i === row.selected_index;
      return <li key={i} className={correct ? s.rightOption : selected ? s.wrongOption : ""}>
        <b>{row.option_labels?.[i] || String.fromCharCode(65 + i)}</b>
        <div className="rich"><Rich inline>{o.label}</Rich><Figures figures={o.images} /></div>
        {(correct || selected) && <small>{correct && selected ? "Your answer · correct" : correct ? "Correct answer" : "Your answer"}</small>}
      </li>;
    })}</ol>
    {row.prompt_hi && <details className={s.explanation} lang="hi"><summary>प्रश्न हिन्दी में देखें</summary>
      {row.passage_hi && <div className="rich"><Rich>{row.passage_hi}</Rich></div>}
      <div className="rich"><Rich>{row.prompt_hi}</Rich></div>
      {row.options_hi?.length > 0 && <ol type="A">{row.options_hi.map((text, i) => <li key={i}><Rich inline>{text}</Rich></li>)}</ol>}
    </details>}
    {row.explanation && <details className={s.explanation}><summary>Worked explanation</summary><div className="rich"><Rich>{row.explanation}</Rich></div></details>}
    {row.explanation_hi && <details className={s.explanation}><summary lang="hi">हिन्दी में समाधान</summary><div className="rich" lang="hi"><Rich>{row.explanation_hi}</Rich></div></details>}
    {row.tutor_available && <QuestionTutor mode="mistake" attempt={attempt} position={row.position} />}
    <ResultTools id={attempt} position={row.position} bookmarked={row.bookmarked} />
  </article>;
}

function Review({ data: d, base }) {
  const r = d.review;
  const current = { outcome: r.outcome, section: r.section, topic: r.topic };
  const overall = d.analysis.overall;
  const filters = [["all", "All", overall.total], ["incorrect", "Incorrect", overall.incorrect], ["skipped", "Skipped", overall.skipped],
    ["correct", "Correct", overall.correct], ["flagged", "Flagged", overall.flagged]];
  return <section className={s.review} id="answers">
    <header className={s.panelTitle}><h2>Question review</h2>{r.total > 0 && <span>{r.start}–{r.end} of {r.total}</span>}</header>
    <nav className={s.filterBar} aria-label="Filter by outcome">
      {filters.map(([key, name, count]) => <Link key={key} prefetch={false} href={reviewUrl(base, { ...current, outcome: key })}
        aria-current={r.outcome === key ? "true" : undefined}>{name}{!r.section && !r.topic && <small>{count}</small>}</Link>)}
    </nav>
    <form action={`${base}#answers`} className={s.sectionFilter}>
      <input type="hidden" name="view" value="review" /><input type="hidden" name="outcome" value={r.outcome} />
      <label>Section <select name="section" defaultValue={r.section || ""}><option value="">All sections</option>
        {d.analysis.sections.map(({ name }) => <option key={name}>{name}</option>)}</select></label>
      <button className="secondary">Apply</button>
      {r.topic && <Link prefetch={false} href={reviewUrl(base, { ...current, topic: "" })}>Clear topic · {r.topic}</Link>}
    </form>
    {d.rows.length ? d.rows.map((row) => <Question key={row.position} row={row} attempt={d.id} />)
      : <div className={s.panel}><h3>No questions match these filters</h3><Link prefetch={false} href={reviewUrl(base)}>Show all answers</Link></div>}
    {r.pages > 1 && <nav aria-label="Question pages" className={s.pagination}>
      {r.page > 1 && <Link prefetch={false} className="button secondary" href={reviewUrl(base, { ...current, page: r.page - 1 })}>Previous</Link>}
      <span>Page {r.page} of {r.pages}</span>
      {r.page < r.pages && <Link prefetch={false} className="button secondary" href={reviewUrl(base, { ...current, page: r.page + 1 })}>Next</Link>}
    </nav>}
  </section>;
}

export default function MockReport({ data: d, base, review }) {
  return <div className={s.report}>
    <Scorecard d={d} />
    <nav className={s.tabs} aria-label="Mock report views">
      <Link href={base} prefetch={false} aria-current={!review ? "page" : undefined}>Overview</Link>
      <Link href={reviewUrl(base)} prefetch={false} aria-current={review ? "page" : undefined}>Review answers</Link>
    </nav>
    {review ? <Review data={d} base={base} /> : <>
      {d.data_entry && <section className={s.panel}><header className={s.panelTitle}><h2>Qualifying sections</h2></header>
        {d.analysis.computer && <p className={s.note}>Computer Knowledge: {marks(d.analysis.computer.score)} / {marks(d.analysis.computer.max_marks)} marks.</p>}
        {d.analysis.merit_maximum != null && <p className={s.note}>Merit sections: {marks(d.analysis.merit_score)} / {marks(d.analysis.merit_maximum)} marks.</p>}
        <p className={s.note}>Data entry: {d.data_entry.characters} characters typed · {d.data_entry.matching} of {d.data_entry.target_words} words matched in order.</p>
      </section>}
      <NextPractice data={d} base={base} />
      <div className={s.grid}>
        <Mistakes data={d} base={base} /><Sections analysis={d.analysis} base={base} />
      </div>
      {(d.benchmark || d.paper_rank) && <div className={s.grid}>
        <Benchmarks benchmark={d.benchmark} score={Number(d.score)} maximum={Number(d.analysis.overall.max_marks)} /><PracticeRank rank={d.paper_rank} />
      </div>}
    </>}
  </div>;
}
