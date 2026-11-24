/** Circular progress. `value` is 0 to 1. Purely visual; the numbers beside it carry the meaning. */
export default function Ring({ value, size = 84, label }) {
  const r = 34, c = 2 * Math.PI * r, pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return <svg className="ring" width={size} height={size} viewBox="0 0 80 80" role="img" aria-label={`${label ?? "Progress"}: ${pct}%`}>
    <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" className="ring-track" />
    <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" strokeLinecap="round" className="ring-fill" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 40 40)" />
    <text x="40" y="45" textAnchor="middle" className="ring-text">{pct}%</text>
  </svg>;
}
