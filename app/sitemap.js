import { informationPages } from "../lib/information-pages";
import { site, readExams, readPyqOverview, readPyqSitemap } from "../lib/public";
import { games, gameHref } from "./games/catalog";
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const [exams, pyq, pyqIds] = await Promise.all([
    readExams(),
    readPyqOverview(),
    readPyqSitemap().catch(() => ({ ids: [] })),
  ]);
  const paths = [
    "/",
    ...informationPages.map(({ path }) => path),
    "/exams/",
    "/learn/cgl/",
    "/learn/cgl/quantitative-aptitude/",
    "/learn/cgl/reasoning/",
    "/learn/cgl/english-comprehension/",
    "/learn/cgl/general-awareness/",
    "/games/",
    ...games.map((game) => gameHref(game)),
    "/pyq/",
    "/current-affairs/",
    "/news/",
    "/plans/",
    ...exams.map((exam) => `/exams/${exam.slug}/`),
  ];

  for (const e of pyq.exams) {
    paths.push(`/pyq/${e.slug}/`, `/pyq/${e.slug}/topics/`);
    for (const y of e.years) {
      paths.push(`/pyq/${e.slug}/${y.year}/`);
      // Only pages a signed-out visitor can read: locked papers and later pages show placeholders.
      for (const p of y.papers) if (!p.locked) paths.push(`/pyq/${p.path}/`);
    }
    const topics = new Set(e.topic_stats.map((t) => `/pyq/${e.slug}/topics/${t.subject}/${t.topic_slug}/`));
    paths.push(...topics);
  }

  for (const id of pyqIds?.ids ?? []) {
    paths.push(`/pyq/q/${id}/`);
  }

  return paths.map((path) => ({ url: new URL(path, site).href }));
}
