const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const TONE = { match: "ok", review: "warn", age_review: "warn" };
const LABEL = { match: "Likely match", review: "Check conditions", age_review: "Check age relaxation", age: "Outside age range", education: "Needs higher education" };

const pay = (range) => (!range ? "Varies" : range[0] === range[1] ? rupees.format(range[0]) : `${rupees.format(range[0])} – ${rupees.format(range[1])}`);

/** What one exam leads to: money, role and authority per post, and what clearing each stage gives. */
export default function ExamBrief({ exam, status }) {
  const g = exam.guidance ?? {};
  const d = exam.payoff ?? {};
  const posts = [...(d.posts ?? [])].sort((a, b) => (b.pay?.[0] ?? 0) - (a.pay?.[0] ?? 0));
  const best = posts.find((p) => p.pay);
  const notice = g.notice_url || exam.source_url;
  return <article className="brief">
    <div className="brief-head">
      <div><h3>{exam.title}</h3><span className="code">{exam.code}</span></div>
      {status && <span className={`badge ${TONE[status.status] ?? "off"}`}>{LABEL[status.status]}</span>}
    </div>
    {d.summary && <p className="brief-summary">{d.summary}</p>}
    {status?.reason && <p className="brief-note">{status.reason}</p>}
    {best && <div className="brief-pay"><span>Clear it and you start at</span><strong>{posts.length > 1 && posts.at(-1).pay ? `${pay([posts.at(-1).pay[0], best.pay[1]])} a month` : `${pay(best.pay)} a month`}</strong></div>}

    {posts.length > 0 && <section className="brief-sec">
      <h4>The job you get</h4>
      <ul className="post-list">{posts.map((post, i) => <li key={i}>
        <div className="post-top">
          <div><strong>{post.title}</strong><small>{post.department}{post.group && ` · ${post.group}`}</small></div>
          <div className="post-pay"><b>{pay(post.pay)}</b><small>{post.level ? `Pay level ${post.level}` : "Level varies"}</small></div>
        </div>
        <p className="post-role">{post.role}</p>
        <p className="post-needs"><span>To get here</span>{post.needs}</p>
      </li>)}</ul>
    </section>}

    {d.milestones?.length > 0 && <section className="brief-sec">
      <h4>What each stage unlocks</h4>
      <ol className="milestones">{d.milestones.map((m) => <li key={m.stage}><strong>{m.stage}</strong><span>{m.gives}</span></li>)}</ol>
    </section>}

    {g.qualification && <dl className="brief-facts">
      <div><dt>Education</dt><dd>{g.qualification}</dd></div>
      <div><dt>Age</dt><dd>{g.ages?.length ? g.ages.map(([a, b]) => `${a}–${b}`).join(", ") : "See vacancy notice"}</dd></div>
    </dl>}
    {!d.posts && <p className="muted">Details for this exam are in the official SSC notice.</p>}
    <p className="brief-foot muted">{d.allowances} {g.timeline} {notice && <a href={notice}>SSC notice</a>}</p>
  </article>;
}
