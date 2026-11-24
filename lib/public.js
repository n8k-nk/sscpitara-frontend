import "server-only";

const backend = process.env.DJANGO_ORIGIN ?? "http://127.0.0.1:8024";

export const site = new URL(process.env.SITE_URL ?? "http://127.0.0.1:3000");
export const indexable = Boolean(process.env.SITE_URL) && site.protocol === "https:";

async function read(path) {
  const response = await fetch(new URL(`/api/public/${path}/`, backend), { cache: "no-store" });
  if (!response.ok) throw new Error(`Publication API returned ${response.status} for ${path}`);
  return response.json();
}

export const readExams = async () => (await read("exams")).exams;
export const readLessons = async () => (await read("lessons")).lessons;
export async function readPyqs(params) {
  const response = await fetch(new URL(`/api/public/pyqs/?${new URLSearchParams(params)}`, backend), { cache: "no-store" });
  if (!response.ok) throw new Error(`Publication API returned ${response.status} for pyqs`);
  return response.json();
}
export async function readPyqOverview() {
  const response = await fetch(new URL("/api/public/pyqs/overview/", backend), { cache: "no-store" });
  if (!response.ok) throw new Error(`Publication API returned ${response.status} for pyq overview`);
  return response.json();
}
export async function readLearn() {
  const response = await fetch(new URL("/api/learn/?exam=CGL", backend), { cache: "no-store" });
  if (!response.ok) throw new Error(`Learn API returned ${response.status}`);
  return response.json();
}
export const readCoverage = () => read("coverage");

export function metadata(title, description, path) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", siteName: "SSC Pitara" },
  };
}
