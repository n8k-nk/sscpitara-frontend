import { need } from "../../lib/server";
import { studyContext } from "../../lib/study-scope";

export function analyticsUrl(page, exam, stage, extra = {}) {
  const path = page ? `/analytics/${page}/` : "/analytics/";
  return `${path}?${new URLSearchParams({ exam, stage, ...extra })}`;
}

export async function loadAnalytics(searchParams, page = "") {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const key of ["exam", "stage", ...(page === "activity" ? ["date", "page"] : [])]) {
    if (typeof params[key] === "string") query.set(key, params[key]);
  }
  if (!query.has("exam") && !query.has("stage")) {
    const { selected } = await studyContext();
    if (selected) {
      query.set("exam", selected.exam);
      query.set("stage", selected.stage);
    }
  }
  const path = page ? `/analytics/${page}/` : "/analytics/";
  const where = query.size ? `${path}?${query}` : path;
  if (page === "activity") query.set("view", "activity");
  return need("study/analytics", where, query);
}
