import { site, readExams, readPyqOverview, readLearn } from "../lib/public";
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const [exams, pyq, learn] = await Promise.all([readExams(), readPyqOverview(), readLearn()]);
  const paths = ["/", "/exams/", "/learn/", "/pyq/", "/plans/", ...exams.map((exam) => `/exams/${exam.slug}/`)];
  for (const e of pyq.exams) {
    paths.push(`/pyq/${e.slug}/`, `/pyq/${e.slug}/topics/`);
    for (const y of e.years) {
      paths.push(`/pyq/${e.slug}/${y.year}/`, ...y.papers.map((p) => `/pyq/${p.path}/`));
    }
    const topics = new Set(e.topic_stats.map((t) => `/pyq/${e.slug}/topics/${t.subject}/${t.topic_slug}/`));
    paths.push(...topics);
  }
  for (const stage of learn.stages) for (const sub of stage.subjects) paths.push(...sub.topics.map((t) => t.path));
  return paths.map((path) => ({ url: new URL(path, site).href }));
}
