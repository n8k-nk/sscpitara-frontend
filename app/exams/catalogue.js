const salary = new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
});

export default function Catalogue({ data }) {
  return <>
    <section>
      <h2>Eligibility and timeline</h2>
      <dl className="facts">
        <dt>Education</dt><dd>{data.qualification}</dd>
        <dt>General age bands</dt><dd>{data.ages.map(([min, max]) => `${min}–${max}`).join(", ") || "See vacancy notice"}</dd>
      </dl>
      <p>{data.checks}</p>
      <p>{data.timeline}</p>
      <div className="actions">
        <a className="button secondary" href={data.notice_url}>SSC notice</a>
        <a className="button secondary" href={data.calendar_url}>SSC calendar</a>
        {data.schedule_url && <a className="button secondary" href={data.schedule_url}>Schedule update</a>}
      </div>
      <p><a className="button arrow" href="/account/">Check this exam against my profile</a></p>
    </section>
    <section>
      <h2>Selection stages</h2>
      <ol className="steps">{data.stages.map((stage) => <li key={stage}>{stage}</li>)}</ol>
    </section>
    <section>
      <h2>Example jobs</h2>
      <p>Starting basic monthly pay under the 7th CPC. Check post availability in the recruitment notice.</p>
      <div className="grid">{data.posts.map((post, i) => <article className="card" key={i}>
        <h3>{post.title}</h3>
        <p>{post.department}{post.group !== "Varies" && ` · Group ${post.group}`}</p>
        <p>{post.level ? `Pay Level ${post.level} · ${salary.format(post.basic_pay)}` : "Pay varies by vacancy. See SSC notice."}</p>
      </article>)}</div>
    </section>
  </>;
}
