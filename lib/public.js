import "server-only";

const backend = process.env.DJANGO_ORIGIN ?? "http://127.0.0.1:8024";

export const site = new URL(process.env.SITE_URL ?? "http://127.0.0.1:3000");
export const indexable = Boolean(process.env.SITE_URL) && site.protocol === "https:";

async function read(path, query = "", revalidate = 0) {
  const response = await fetch(new URL(`/api/public/${path}/${query}`, backend), {
    next: { revalidate: process.env.NODE_ENV === "production" ? revalidate : 0 },
  });
  if (!response.ok) throw new Error(`Publication API returned ${response.status} for ${path}`);
  return response.json();
}

export const readExams = async () => (await read("exams", "", 60)).exams;
export const readStudyScopes = () => read("study-scopes", "", 300);
export const readLessons = async () => (await read("lessons")).lessons;
export async function readPyqs(params) {
  return read("pyqs", `?${new URLSearchParams(params)}`, 300);
}
export async function readPyqOverview() {
  return read("pyqs/overview", "", 300);
}
export async function readPyqSitemap() {
  return read("pyqs/sitemap", "", 3600);
}
export const readNews = (lang) => read("news", `?${new URLSearchParams({ lang })}`);
export const readCoverage = () => read("coverage", "", 60);

export function metadata(title, description, path) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", siteName: "SSC Pitara" },
  };
}
export async function readCurrentAffairs(date) {
  const response = await fetch(new URL(`/api/public/current-affairs/${date ? `?${new URLSearchParams({ date })}` : ""}`, backend), { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Current affairs API returned ${response.status}`);
  return response.json();
}
