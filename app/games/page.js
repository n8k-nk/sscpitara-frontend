import { metadata as pageMetadata, readExams } from "../../lib/public";
import { studyContext } from "../../lib/study-scope";
import { arenaOptions } from "./catalog";
import ArenaLibrary from "./ArenaLibrary";
import styles from "./arena.module.css";

export const metadata = pageMetadata("SSC Games | Quick practice games", "Play short SSC practice games for maths, reasoning, English, general awareness and computer knowledge.", "/games/");

export default async function Arena({ searchParams }) {
  const [exams, { scopes, selected }, query] = await Promise.all([
    readExams().catch(() => []), studyContext(), searchParams,
  ]);
  const scopeExams = [...new Set(scopes.map(({ exam }) => exam))].map((code) => ({ code, category: "SSC exams" }));
  const options = arenaOptions(exams.length ? exams : scopeExams, scopes);
  const exam = options.find((item) => item.code === query.exam);

  return <div className={styles.arena}>
    <ArenaLibrary key={`${exam?.code ?? ""}/${query.stage ?? ""}`} options={options} selected={selected}
      initialExam={exam?.code ?? ""} initialStage={exam?.stages.includes(query.stage) ? query.stage : ""} />
  </div>;
}
