import { informationPages } from "../lib/information-pages";
import { site, readExams, readPyqOverview } from "../lib/public";
import { games, gameHref } from "./games/catalog";
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const [exams, pyq] = await Promise.all([readExams(), readPyqOverview()]);
  const paths = ["/", ...informationPages.map(({ path }) => path), "/exams/", "/learn/cgl/", "/learn/cgl/quantitative-aptitude/", "/learn/cgl/reasoning/", "/learn/cgl/english-comprehension/", "/learn/cgl/general-awareness/", "/games/", ...games.map((game) => gameHref(game)), "/pyq/", "/current-affairs/", "/news/", "/plans/", ...exams.map((exam) => `/exams/${exam.slug}/`)];
  for (const e of pyq.exams) {
    paths.push(`/pyq/${e.slug}/`, `/pyq/${e.slug}/topics/`);
    for (const y of e.years) {
      paths.push(`/pyq/${e.slug}/${y.year}/`, ...y.papers.map((p) => `/pyq/${p.path}/`));
    }
    const topics = new Set(e.topic_stats.map((t) => `/pyq/${e.slug}/topics/${t.subject}/${t.topic_slug}/`));
    paths.push(...topics);
  }
  return paths.map((path) => ({ url: new URL(path, site).href }));
}
