import Link from "next/link";
import { metadata as pageMetadata, readExams, readPyqOverview } from "../lib/public";
import { n, papersOf, rankTopics } from "../lib/pyq";
import { session } from "../lib/server";
import css from "./home.module.css";

export const metadata = pageMetadata("SSC exam preparation and previous year papers",
  "Practise SSC papers by year or topic, check which exams fit your profile, and plan your next study session.", "/");

const Arrow = () => <span aria-hidden="true">→</span>;

function Archive({ exam }) {
  const path = `/pyq/${exam.slug}/`;
  const topics = rankTopics(exam.topic_stats).slice(0, 3);
  return <section className={css.section} aria-labelledby="archive-heading">
    <div className={css.heading}><h2 id="archive-heading">Practise SSC {exam.code}</h2>
      <Link href="/pyq/?all=1">All PYQ exams <Arrow /></Link></div>
    <div className={css.routes}>
      <div className={css.route}>
        <h3>Papers by year</h3><p>Choose a year, then pick your tier and shift.</p>
        <ul>{exam.years.slice(0, 3).map(({ year, papers }) => <li key={year}>
          <Link href={`${path}${year}/`}><strong>{year}</strong><small>{n(papers.length)} papers</small><Arrow /></Link>
        </li>)}</ul>
        <Link className={css.textLink} href={path}>Browse all years <Arrow /></Link>
      </div>
      <div className={css.route}>
        <h3>Practice by topic</h3><p>Start with the most frequently asked topics.</p>
        <ul>{topics.map((t) => <li key={t.topic}><Link href={`${path}topics/${t.subject}/${t.topic_slug}/`}>
          <strong>{t.topic_name}</strong><small>{n(t.questions)} questions</small><Arrow /></Link></li>)}</ul>
        <Link className={css.textLink} href={path + "topics/"}>Browse all topics <Arrow /></Link>
      </div>
    </div>
  </section>;
}

export default async function Home() {
  const [directory, archive, user] = await Promise.all([readExams(), readPyqOverview(), session()]);
  const featured = archive.exams.find((exam) => exam.code === "CGL") ?? archive.exams[0];
  const questions = archive.exams.reduce((sum, exam) => sum + exam.questions, 0);
  const papers = archive.exams.reduce((sum, exam) => sum + papersOf(exam).length, 0);
  const guided = directory.filter((exam) => exam.guidance?.qualification);
  const preferred = ["CGL", "CHSL", "MTS", "GD"];
  const exams = [...preferred.flatMap((code) => guided.filter((exam) => exam.code === code)),
    ...guided.filter((exam) => !preferred.includes(exam.code))].slice(0, 4);
  return <div className={css.home}>
    <section className={css.cover} aria-labelledby="home-title">
      <div className={css.spread}>
        <div className={css.intro}>
          <h1 id="home-title">Practise with <em>real SSC papers.</em></h1>
          <p>Work through a past shift, focus on one topic, or find the SSC exams that fit your profile.</p>
          <div className={css.actions}>
            <Link className={css.primary} href="/pyq/">Explore past papers <Arrow /></Link>
            <Link className={css.secondary} href={user.authenticated ? "/account/" : "/signup/"}>Find my exam matches</Link>
          </div>
        </div>
        <div className={css.portrait}><img src="/images/landing-aspirant.webp" width="1120" height="747" fetchPriority="high" alt="A learner working through a question paper" /></div>
      </div>
      <dl className={css.figures}>
        <div><dt>Previous year questions</dt><dd>{n(questions)}</dd></div>
        <div><dt>Published papers</dt><dd>{n(papers)}</dd></div>
        <div><dt>Exams in the directory</dt><dd>{n(directory.length)}</dd></div>
      </dl>
    </section>

    {featured && <Archive exam={featured} />}

    <section className={css.section} aria-labelledby="directory-heading">
      <div className={css.heading}><h2 id="directory-heading">Find your exam</h2>
        <Link href="/exams/">View directory <Arrow /></Link></div>
      <div className={css.directory}>{exams.map((exam) =>
        <Link key={exam.slug} href={`/exams/${exam.slug}/`}><strong>SSC {exam.code}</strong><span>{exam.title}</span><Arrow /></Link>
      )}</div>
    </section>

    <section className={css.planner} aria-labelledby="plan-heading">
      <img src="/images/landing-planner.webp" alt="" loading="lazy" width="720" height="480" />
      <div><h2 id="plan-heading">Plan your CGL study day.</h2>
        <p>Set your daily study time, practise a topic and return to questions you missed.</p>
        <div className={css.actions}><Link className={css.primary} href="/study/">Open my study plan <Arrow /></Link>
          <Link className={css.secondary} href="/plans/">See study coverage</Link></div>
      </div>
    </section>
  </div>;
}
