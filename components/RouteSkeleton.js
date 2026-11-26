export default function RouteSkeleton({ label = "page", variant = "list" }) {
  return <div className="route-skeleton">
    <span className="sr-only" role="status">Loading {label}…</span>
    <div aria-hidden="true" className={`skeleton-layout skeleton-${variant}`}>
      <span className="skeleton-title" />
      <span className="skeleton-line" />
      <div className="skeleton-body">
        {[0, 1, 2, 3].map((row) => <div className="skeleton-row" key={row}>
          <span className="skeleton-line" />
          <span className="skeleton-line" />
        </div>)}
      </div>
    </div>
  </div>;
}
