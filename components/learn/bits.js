export const STATE = {
  unseen: ["Not started", ""], learning: ["Learning", "warn"], practising: ["Practising", "warn"], proficient: ["Secure", "ok"], review_due: ["Review due", "bad"],
};
export const minutes = (m) => (m >= 90 ? `${(m / 60).toFixed(m % 60 ? 1 : 0)} h` : `${m} min`);
export const lessonDate = (value) => new Intl.DateTimeFormat("en-IN", {
  day: "numeric", month: "short", timeZone: "Asia/Kolkata",
}).format(new Date(value));
export function shiftChance(p, about = false) {
  if (!(p > 0)) return "";
  const pct = Math.round(p * 100);
  if (pct >= 100) return about ? "Asked in about every paper" : "Asked in every paper";
  if (pct < 1) return "Asked in under 1% of papers";
  return about ? `Asked in about ${pct}% of papers` : `Asked in ${pct}% of papers`;
}
export const chanceByYear = (byYear) => Object.entries(byYear ?? {}).sort().map(([y, n]) => `${y}: ${Math.round(n * 100)}%`).join(" · ");
