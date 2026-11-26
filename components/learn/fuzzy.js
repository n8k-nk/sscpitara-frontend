/** Typo-tolerant match for the learn catalogue. Higher is better; 0 is not a match. */

const FOLD = /[^a-z0-9]+/g;

export function fold(value) {
  return String(value ?? "").toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "").replace(FOLD, " ").trim();
}

function distance(a, b, limit) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let prev2 = null;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v;
      if (v < best) best = v;
    }
    if (best > limit) return limit + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length];
}

function tokenHit(token, text) {
  if (text.includes(` ${token} `) || text.startsWith(`${token} `) || text.endsWith(` ${token}`) || text === token) return 100;
  const words = text.split(" ");
  if (words.some((word) => word.startsWith(token))) return token.length < 2 ? 0 : 70;
  if (token.length < 4) return 0;
  const limit = token.length >= 7 ? 2 : 1;
  let best = 0;
  for (const word of words) {
    if (Math.abs(word.length - token.length) > limit) continue;
    const d = distance(token, word, limit);
    if (d <= limit) best = Math.max(best, 60 - d * 18);
  }
  return best;
}

export function fuzzyScore(query, text) {
  const q = fold(query);
  const t = fold(text);
  if (!q || !t) return 0;
  let score = 0;
  for (const token of q.split(" ")) {
    const hit = tokenHit(token, t);
    if (!hit) return 0;
    score += hit;
  }
  if (t === q) score += 40;
  else if (t.startsWith(q)) score += 20;
  return score;
}

/** Title hits outrank a skill that only sits inside a matching chapter. Catalogue order breaks ties. */
export function rankSearch(query, items, limit = 8) {
  const q = fold(query);
  if (q.length < 2) return [];
  const ranked = [];
  for (const item of items) {
    const title = fuzzyScore(q, item.title);
    const full = fuzzyScore(q, [item.title, item.topic, item.subject].filter(Boolean).join(" "));
    const score = title ? title + 200 : full;
    if (score) ranked.push({ item, score });
  }
  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit).map((row) => row.item);
}
