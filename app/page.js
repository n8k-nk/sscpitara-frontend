import Link from "next/link";
import { metadata as pageMetadata, readExams, readCoverage } from "../lib/public";

export const metadata = pageMetadata(
  "SSC exam preparation", "Find SSC exams that fit your profile and start preparing for free.", "/"
);

export default async function Home() {
  const [exams, coverage] = await Promise.all([readExams(), readCoverage()]);
  return <>
    <section className="hero">
      <div>
        <span className="eyebrow">Free SSC preparation</span>
        <h1>Find your SSC exam. Know what to <em>prepare next.</em></h1>
        <p className="lead">Check which exams fit your education and age, compare the jobs they lead to, and use your past results to plan your next step.</p>
        <div className="actions">
          <a className="button lg arrow" href="/signup/">Find my exam matches</a>
          <Link className="button lg secondary" href="/exams/">Browse SSC exams</Link>
        </div>
        <ul className="trust"><li>Free to start</li><li>Built on official SSC notices</li><li>English and Hindi</li></ul>
      </div>
      <aside className="hero-card">
        <h2>CGL preparation</h2>
        <ul className="stats">
          <li><strong>{coverage.diagnostic}</strong><span>diagnostic questions</span></li>
          <li><strong>{coverage.practice}</strong><span>practice questions</span></li>
          <li><strong>{coverage.mocks}</strong><span>full mocks</span></li>
        </ul>
        <Link className="button secondary block" href="/plans/">See free study coverage</Link>
      </aside>
    </section>

    <section>
      <div className="section-head"><h2>How it works</h2></div>
      <ol className="how">
        <li><strong>Tell us about you</strong><p>Share your education, date of birth and where you are in your preparation.</p></li>
        <li><strong>See your matches</strong><p>We screen SSC exams against your profile and suggest what to prepare next.</p></li>
        <li><strong>Study every day</strong><p>Take a diagnostic, practise topics and revise the questions you missed.</p></li>
      </ol>
    </section>

    <section>
      <div className="section-head"><h2>Find your SSC exam</h2><Link href="/exams/">View all listed SSC exams</Link></div>
      <div className="grid">{exams.filter((exam) => exam.guidance?.qualification).map((exam) =>
        <article className="card link-card" key={exam.slug}>
          <span className="code">{exam.code}</span>
          <h3><Link href={`/exams/${exam.slug}/`}>{exam.title}</Link></h3>
          <span className="go">View details</span>
        </article>
      )}</div>
    </section>

    <section className="cta-band">
      <div><h2>Ready to see where you stand?</h2><p>Create a free account and get your exam matches in a couple of minutes.</p></div>
      <a className="button lg arrow" href="/signup/">Get started</a>
    </section>
  </>;
}
