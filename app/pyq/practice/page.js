import Link from "../../../components/NavigationLink";
import { redirect } from "next/navigation";
import { getQuestions, pageOf } from "../../../lib/pyq";
import { QuestionFeed, query, withQuery } from "../_ui";

// The filter tool. Real, indexable pages live at /pyq/<exam>/…; this one is for ad-hoc combinations.
export const metadata = { title: "Practice previous year questions", robots: { index: false, follow: true } };

const KEYS = ["exam", "year", "stage", "paper", "subject", "topic", "subtopic", "difficulty"];

export default async function Practice({ searchParams }) {
  const params = await searchParams;
  const one = (k) => (typeof params[k] === "string" ? params[k] : "");
  const filters = Object.fromEntries(KEYS.map((k) => [k, one(k)]));
  // Practice always works on one paper, subject or topic, never on the whole bank.
  if (!["paper", "subject", "topic", "subtopic"].some((k) => filters[k])) redirect("/pyq/");
  const data = await getQuestions(query({ ...filters, page: pageOf(params.page) }));
  const f = data.facets;
  const select = (name, label, options) => <label>{label}
    <select name={name} defaultValue={filters[name]}><option value="">All</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label} ({o.count})</option>)}</select></label>;
  const scope = f.papers.find((o) => o.value === filters.paper)?.label ?? f.topics.find((o) => String(o.value) === filters.topic)?.label
    ?? f.subjects.find((o) => o.value === filters.subject)?.label ?? "Practice";
  return <>
    <div className="page-head"><span className="eyebrow"><Link href="/pyq/">PYQs</Link> › Practice</span><h1>{scope}</h1></div>
    <details className="pyq-filter-box"><summary>Filters</summary>
    <form className="pyq-filters" method="get" action="/pyq/practice/">
      {filters.stage && <input type="hidden" name="stage" value={filters.stage} />}
      {f.exams.length > 1 && select("exam", "Exam", f.exams)}
      {select("year", "Year", f.years)}
      {select("paper", "Paper / shift", f.papers)}
      {select("subject", "Subject", f.subjects)}
      {select("topic", "Topic", f.topics)}
      {f.subtopics.length > 0 && select("subtopic", "Sub-topic", f.subtopics)}
      {f.difficulties.length > 0 && select("difficulty", "Level", f.difficulties)}
      <button type="submit">Filter</button>
      <Link className="button ghost" href="/pyq/">Back to PYQs</Link>
    </form></details>
    <QuestionFeed data={data} pageHref={(p) => withQuery("/pyq/practice/", { ...filters, page: p > 1 ? p : "" })} />
  </>;
}
