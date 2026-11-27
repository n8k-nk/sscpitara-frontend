import "server-only";
import { cache } from "react";
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

/** Revalidated read for anonymous visitors / crawlers; live cookie-forwarded read when signed in. */
export async function callPublic(path, query = "", revalidate = 300) {
  const jar = await cookies();
  if (jar.has("sessionid")) return call(path, query);
  const ttl = process.env.NODE_ENV === "production" ? revalidate : 0;
  const response = await fetch(new URL(`/api/${path}/${query ? `?${query}` : ""}`, backend), {
    ...(ttl > 0 ? { next: { revalidate: ttl } } : { cache: "no-store" }),
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

export const session = cache(async () => {
  if (!(await cookies()).has("sessionid")) return { authenticated: false };
  try { return (await call("session")).data; } catch { return { authenticated: false }; }
});

export const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
export const day = (value) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
