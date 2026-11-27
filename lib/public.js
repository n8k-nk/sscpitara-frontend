import "server-only";

const backend = process.env.DJANGO_ORIGIN ?? "http://127.0.0.1:8024";

// SITE_URL wins. The Vercel production deployment falls back to the real domain, so a missing variable
// cannot silently hide the site from search engines. Previews and local runs are never indexed.
const preview = process.env.VERCEL_ENV === "preview";
const configured = process.env.SITE_URL?.trim() || (process.env.VERCEL_ENV === "production" ? "https://www.sscpitara.in" : "");
export const site = new URL(configured || "http://127.0.0.1:3000");
export const indexable = Boolean(configured) && !preview && site.protocol === "https:";

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

export const SHARE_IMAGE = { url: "/images/share.png", width: 1200, height: 630, alt: "SSC Pitara: learn, practise and revise for SSC exams" };

export function metadata(title, description, path) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", siteName: "SSC Pitara", images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE.url] },
  };
}
export async function readCurrentAffairs(date) {
  const response = await fetch(new URL(`/api/public/current-affairs/${date ? `?${new URLSearchParams({ date })}` : ""}`, backend), { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Current affairs API returned ${response.status}`);
  return response.json();
}
