export const PRIORITY = { core: ["Core", "ok"], important: ["Important", ""], optional: ["Optional", "warn"] };

export function weightLabel(w) {
  if (!w || w.per_paper == null) return null;
  if (w.per_paper < 0.3) return "Rarely asked";
  return `~${w.per_paper.toFixed(1)} question${w.per_paper >= 1.5 ? "s" : ""} per paper`;
}

export const hours = (m) => (m >= 90 ? `${(m / 60).toFixed(m % 60 ? 1 : 0)} h` : `${m} min`);
