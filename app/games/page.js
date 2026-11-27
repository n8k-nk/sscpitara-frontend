import { Suspense } from "react";
import RouteSkeleton from "../../components/RouteSkeleton";
import { metadata as pageMetadata, readExams } from "../../lib/public";
import { studyContext } from "../../lib/study-scope";
import { arenaOptions } from "./catalog";
import ArenaLibrary from "./ArenaLibrary";
import styles from "./arena.module.css";

export const metadata = pageMetadata("SSC Games | Quick practice games", "Play short SSC practice games for maths, reasoning, English, general awareness and computer knowledge.", "/games/");

export default function Arena({ searchParams }) {
  return <div className={styles.arena}>
    <header className={styles.libraryHeader}>
      <h1 id="arena-title">Games</h1>
      <p>Quick practice games for SSC exams.</p>
    </header>
    <Suspense fallback={<RouteSkeleton label="games catalogue" variant="overview" inline />}>
      <GameCatalogue searchParams={searchParams} />
    </Suspense>
  </div>;
}

async function GameCatalogue({ searchParams }) {
  const [exams, { scopes, selected }, query] = await Promise.all([
    readExams().catch(() => []), studyContext(), searchParams,
  ]);
  const scopeExams = [...new Set(scopes.map(({ exam }) => exam))].map((code) => ({ code, category: "SSC exams" }));
  const options = arenaOptions(exams.length ? exams : scopeExams, scopes);
  const exam = options.find((item) => item.code === query.exam);

  return <ArenaLibrary key={`${exam?.code ?? ""}/${query.stage ?? ""}`} options={options} selected={selected}
      initialExam={exam?.code ?? ""} initialStage={exam?.stages.includes(query.stage) ? query.stage : ""} />
}
