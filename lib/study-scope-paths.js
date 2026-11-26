export const STUDY_SCOPE_COOKIE = "sscpitara_scope";
export const scopeKey = (scope) => `${scope.exam_slug}/${scope.stage_slug}`;

export function scopedPyqs(scope, topics = false) {
  return `/pyq/${scope.exam_slug}/${topics ? "topics/" : ""}?${new URLSearchParams({ stage: scope.stage })}`;
}

export function scopedAnalytics(scope, page = "") {
  return `/analytics/${page ? `${page}/` : ""}?${new URLSearchParams({ exam: scope.exam, stage: scope.stage })}`;
}
