import Start from "../../../components/Start";
import Resume from "../../../components/Resume";
import { need } from "../../../lib/server";

export const metadata = { title: "Practice", robots: { index: false } };

export default async function Practice() {
  const d = await need("study/practice", "/study/practice/");
  return <>
    <div className="page-head"><span className="eyebrow">CGL Tier I</span><h1>Practice</h1><p>Start with the diagnostic, drill a topic or section, or sit a full timed mock.</p></div>
    <Resume active={d.active} />
    <div className="grid two">
      {d.diagnostic_ready && <article className="card"><span className="badge ok">Free</span><h2>Free diagnostic</h2><p className="muted">20 questions across all four subjects to find your starting point.</p><Start kind="diagnostic" token={d.key} label="Start 20 questions" /></article>}
      <article className="card"><h2>Topic practice</h2><p className="muted">A short set on one topic.</p>
        {d.topics.length ? <Start kind="topic" token={d.key} label="Start topic practice" select={{ field: "topic", label: "Topic", options: d.topics }} /> : <p className="empty">Topic sets are awaiting publication.</p>}</article>
      <article className="card"><h2>Sectional practice</h2><p className="muted">A set from one CGL subject.</p>
        {d.subjects.length ? <Start kind="section" token={d.key} label="Start sectional practice" select={{ field: "subject", label: "Subject", options: d.subjects }} /> : <p className="empty">Section sets are awaiting publication.</p>}</article>
      <article className="card"><h2>Your sets</h2><p className="muted">Go back over mistakes and the questions you saved.</p>
        <div className="actions"><Start kind="revision" token={d.key} label="Review due mistakes" /><Start kind="bookmarks" token={d.key} label="Practise bookmarks" secondary /></div></article>
    </div>
    <section style={{ marginTop: "2.5rem" }}>
      <div className="section-head"><h2>Full mocks</h2><span className="muted">100 questions · 4 timed sections</span></div>
      {d.mocks.length ? <div className="grid">{d.mocks.map((mock) => <article className="card" key={mock}>
        <h3>{mock.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</h3><p className="muted">100 questions · 4 timed sections</p>
        <Start kind={mock} token={d.key} label="Start full mock" mock /></article>)}</div> : <p className="empty">Full mocks are awaiting publication.</p>}
    </section>
  </>;
}
