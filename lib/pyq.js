import "server-only";
import { cache } from "react";
import { call } from "./server";

/** Hub data. `all` skips the "only the exams this learner chose" narrowing (used by pages that name one exam in their URL). */
export const getOverview = cache(async (all = false) => {
  const { ok, data } = await call("public/pyqs/overview", all ? "all=1" : "");
  if (!ok) throw new Error("PYQ API failed");
  return data;
});

/** One page of questions for a query string such as "paper=cgl-2026-tier-i-2026-10-28-s1&page=2". */
export const getQuestions = cache(async (query) => {
  const { ok, data } = await call("public/pyqs", query);
  if (!ok) throw new Error("PYQ API failed");
  return data;
});

export const pageOf = (value) => Math.max(1, parseInt(typeof value === "string" ? value : "1", 10) || 1);
export const n = (v) => v.toLocaleString("en-IN");
export const examBySlug = (data, slug) => data.exams.find((e) => e.slug === slug);
export const papersOf = (exam) => exam.years.flatMap((y) => y.papers);
export const paperLabel = (p) => `${p.held_on ? new Date(`${p.held_on}T00:00:00+05:30`).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric" }) : p.stage}${p.shift ? ` Shift ${p.shift}` : ""}${p.name ? ` ${p.name}` : ""}`;

export function rankTopics(rows) {
  const merged = new Map();
  for (const t of rows) {
    const row = merged.get(t.topic) ?? { ...t, questions: 0 };
    row.questions += t.questions;
    merged.set(t.topic, row);
  }
  return [...merged.values()].sort((a, b) => b.questions - a.questions || a.topic_name.localeCompare(b.topic_name));
}
