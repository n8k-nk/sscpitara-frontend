import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { readStudyScopes } from "./public";
import { STUDY_SCOPE_COOKIE, scopeKey } from "./study-scope-paths";

export const studyContext = cache(async () => {
  try {
    const [{ scopes }, jar] = await Promise.all([readStudyScopes(), cookies()]);
    const tiers = scopes.filter((scope) => scope.exam === "CGL" && (scope.stage === "Tier I" || scope.stage === "Tier II"));
    const list = tiers.length ? tiers : scopes;
    const saved = jar.get(STUDY_SCOPE_COOKIE)?.value;
    const selected = list.find((scope) => scopeKey(scope) === saved)
      ?? list.find((scope) => scope.stage === "Tier I")
      ?? list[0]
      ?? null;
    return { scopes: list, selected };
  } catch {
    // The main navigation is still available when the catalogue service is down.
  }
  return { scopes: [], selected: null };
});
