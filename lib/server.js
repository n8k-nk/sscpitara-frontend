import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const backend = process.env.DJANGO_ORIGIN ?? "http://127.0.0.1:8024";

/** Call the Django JSON API from a server component, forwarding the visitor's session cookie. */
export async function call(path, query = "") {
  const jar = await cookies();
  const response = await fetch(new URL(`/api/${path}/${query ? `?${query}` : ""}`, backend), {
    cache: "no-store", headers: { cookie: jar.toString() },
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok, data };
}

/** Like call(), but sends signed-out visitors to sign in and incomplete profiles to onboarding. */
export async function need(path, where, query = "") {
  const result = await call(path, query);
  if (result.status === 401) redirect(`/signin/?next=${encodeURIComponent(where)}`);
  if (result.status === 409 && result.data.onboarding) redirect("/onboarding/");
  if (result.status === 404) return null;
  if (!result.ok) throw new Error(`API returned ${result.status} for ${path}`);
  return result.data;
}

export async function session() {
  try { return (await call("session")).data; } catch { return { authenticated: false }; }
}

export const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
export const day = (value) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
