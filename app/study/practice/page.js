import Link from "next/link";
import { need } from "../../../lib/server";
import { studyContext } from "../../../lib/study-scope";
import MockList from "./MockList";
import PaperMocks from "./PaperMocks";
import SectionalBuilder from "./SectionalBuilder";
import styles from "./mocks.module.css";

export const metadata = { title: "Practice", robots: { index: false } };
const MODES = [["mixed", "Full mocks", "Full"], ["papers", "PYQ paper mocks", "PYQ"], ["sectional", "Build a sectional test", "Sectional"]];

function catalogue(tier, mode, page = 1) {
  return `/study/practice/?tier=${tier}${mode === "mixed" ? "" : `&view=${mode}`}${page > 1 ? `&page=${page}` : ""}`;
}

export default async function Practice({ searchParams }) {
  const query = await searchParams;
  const { selected } = await studyContext();
  const tier = query.tier === "2" || (query.tier !== "1" && selected?.exam === "CGL" && selected.stage === "Tier II") ? 2 : 1;
  const mode = MODES.some(([key]) => key === query.view) ? query.view : "mixed";
  const params = new URLSearchParams({ stage: tier === 1 ? "Tier I" : "Tier II" }).toString();
  return <div className={styles.catalogue}>
    <header className={`page-head ${styles.head}`}><h1>Practice</h1><p>Take a full mock, sit a previous-year paper, or build a timed sectional test.</p></header>
    <div className={styles.switches}>
      <nav className={styles.segmented} aria-label="Practice mode">
        {MODES.map(([key, label, short]) => <Link key={key} aria-label={label} aria-current={mode === key ? "page" : undefined}
          href={catalogue(tier, key)} prefetch={false}><span className={styles.long}>{label}</span><span className={styles.short}>{short}</span></Link>)}
      </nav>
      {mode !== "papers" && <nav className={`${styles.segmented} ${styles.tier}`} aria-label="CGL tier">
        <Link aria-current={tier === 1 ? "page" : undefined} href={catalogue(1, mode)} prefetch={false}>Tier I</Link>
        <Link aria-current={tier === 2 ? "page" : undefined} href={catalogue(2, mode)} prefetch={false}>Tier II{mode === "mixed" && <span className={styles.long}> · Paper I</span>}</Link>
      </nav>}
    </div>
    {mode === "papers" ? <PaperMocks tier={tier} query={query} /> : mode === "sectional"
      ? <SectionalBuilder key={tier} data={await need("study/sectional", catalogue(tier, mode), params)} />
      : <FullMocks tier={tier} query={query} params={params} />}
  </div>;
}

function Format({ data, tier }) {
  return <>
    <ul>{data.sections.map((section) => <li key={section.name}>
      <strong>{section.name}</strong><span>{section.questions} questions · {section.minutes} min</span></li>)}
      {data.data_entry && <li><strong>Data Entry Speed Test</strong><span>Session II · 15 min</span></li>}
    </ul>
    <p>{tier === 1 ? "+2 correct · −0.5 incorrect" : "+3 correct · −1 incorrect. Computer Knowledge and data entry are qualifying sections."}</p>
  </>;
}

async function FullMocks({ tier, query, params }) {
  const data = await need("study/practice", catalogue(tier, "mixed"), params);
  const sum = (key) => data.sections.reduce((total, section) => total + section[key], 0);
  const questions = sum("questions"), minutes = sum("minutes");
  const page = /^\d+$/.test(query.page ?? "") ? Number(query.page) : 1;
  const { taken, best, last } = data.history;

  return <div className={styles.columns}>
    <section className={styles.list} aria-label={`${data.stage} tests`}>
      <MockList key={tier} mocks={data.mocks} stage={data.stage} initialPage={page}
        timing={{ standard: minutes, extended: sum("extended") }} />
    </section>
    <details className={styles.formatLine}>
      <summary>{questions} Qs · {minutes} min · {tier === 1 ? "+2 / −0.5" : "+3 / −1"}</summary>
      <Format data={data} tier={tier} />
    </details>
    <aside className={styles.side}>
      <section className={styles.pattern} aria-labelledby="mock-format">
        <h2 id="mock-format">Test format</h2>
        <p>{questions} questions · {minutes} minutes{data.data_entry && " + typing session"}</p>
        <Format data={data} tier={tier} />
      </section>
      <section className={styles.pattern} aria-labelledby="mock-history">
        <h2 id="mock-history">Your full mocks</h2>
        {taken ? <dl className={styles.history}>
          <div><dt>Finished</dt><dd>{taken}</dd></div>
          <div><dt>Best score</dt><dd>{Number(best)}</dd></div>
          <div><dt>Last score</dt><dd>{Number(last)}</dd></div>
        </dl> : <p>Your scores will appear here after your first finished mock.</p>}
      </section>
    </aside>
  </div>;
}
