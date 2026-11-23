import { site, readExams } from "../lib/public";
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const exams = await readExams();
  return ["/", "/exams/", "/learn/", "/plans/", ...exams.map((exam) => `/exams/${exam.slug}/`)]
    .map((path) => ({ url: new URL(path, site).href }));
}
