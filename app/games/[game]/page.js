import { notFound } from "next/navigation";
import { metadata as pageMetadata } from "../../../lib/public";
import { session } from "../../../lib/server";
import { studyContext } from "../../../lib/study-scope";
import { scopedPyqs } from "../../../lib/study-scope-paths";
import { arenaQuery, gameById, gamesFor } from "../catalog";
import ArenaLevels from "./ArenaLevels";
import ArenaRound from "./ArenaRound";
import styles from "../arena.module.css";

export async function generateMetadata({ params }) {
  const game = gameById((await params).game);
  if (game) return pageMetadata(game.name, game.trains, `/games/${game.id}/`);
}

export default async function Game({ params, searchParams }) {
  const game = gameById((await params).game);
  if (!game) notFound();
  const [query, study, user] = await Promise.all([searchParams, studyContext(), session()]);
  const exam = typeof query.exam === "string" ? query.exam : "";
  const stage = typeof query.stage === "string" ? query.stage : "";
  const scope = exam ? study.scopes.find((item) => item.exam === exam && (!stage || item.stage === stage)) : study.selected;
  const cgl = scope?.exam === "CGL" || (!scope && (!exam || exam === "CGL"));
  const tierTwo = (stage || scope?.stage) === "Tier II";
  let practice = null;
  if (cgl) {
    const tier = tierTwo || game.id === "computer-keys" ? "?from=tier-ii" : "";
    practice = { href: `/learn/cgl/${game.learn}/${tier}`, label: "Review in Learn" };
  } else if (scope?.has_pyq && gamesFor(scope.exam, scope.stage).includes(game)) {
    practice = { href: scopedPyqs(scope, true), label: "Try previous-year questions" };
  }

  const library = `/games/${arenaQuery(exam, stage)}`;
  const map = `/games/${game.id}/${arenaQuery(exam, stage)}`;
  const rawLevel = typeof query.level === "string" && /^[1-9]\d*$/.test(query.level) ? Number(query.level) : 0;
  const level = rawLevel >= 1 && rawLevel <= 30 ? rawLevel : 0;

  if (!level) {
    return <div className={styles.arena}><ArenaLevels game={game} back={library} mapHref={map} signedIn={Boolean(user.authenticated)} /></div>;
  }

  return <div className={styles.arena}><ArenaRound key={`${game.id}:${level || "round"}`} game={game} practice={practice} level={level || undefined}
    back={level ? map : library} /></div>;
}
