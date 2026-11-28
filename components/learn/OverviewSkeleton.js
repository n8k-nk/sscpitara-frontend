export default function OverviewSkeleton({ subjects = 4, resources = true, showHeading = true }) {
  return <div className="learn-overview learn-placeholder">
    <span className="sr-only" role="status">Loading Learn…</span>
    <div aria-hidden="true">
      {showHeading && <div className="learn-head">
        <div><span className="skeleton-line" /><span className="skeleton-title" style={{ width: "9rem", marginBottom: 0 }} /></div>
        <div className="plan-cta"><span className="skeleton-line" style={{ width: "12rem" }} /></div>
      </div>}
      <div className="learn-next">
        {[0, 1].map((card) => <div className={card === 0 ? "next-card primary" : "next-card"} key={card}>
          <span className="skeleton-line" /><span className="skeleton-line" /><span className="skeleton-line" />
        </div>)}
      </div>
      <div className="learn-progress">
        <span className="skeleton-line" /><div className="split-meter" /><span className="skeleton-line" />
      </div>
      <div className="section-head"><span className="skeleton-line" /></div>
      <div className="topic-search"><div className="topic-search-row">
        <span className="skeleton-line" />
      </div></div>
      <div className="grid subject-grid">
        {Array.from({ length: subjects }, (_, index) => <div className="link-card subject-card" data-subject="" key={index}>
          <span className="skeleton-line" /><span className="skeleton-line" />
          <div className="split-meter" /><span className="skeleton-line" /><span className="skeleton-line" />
        </div>)}
      </div>
      {resources && <section><div className="grid two">
        {[0, 1].map((card) => <div className="card" key={card}>
          <span className="skeleton-line" /><span className="skeleton-line" /><span className="skeleton-line" />
        </div>)}
      </div></section>}
    </div>
  </div>;
}
