"use client";

function token() {
  return document.cookie.split("; ").find((row) => row.startsWith("csrftoken="))?.split("=")[1] ?? "";
}

/** POST/PUT JSON to the Django API on the same origin, with the CSRF header Django expects. */
export async function send(path, body = {}, method = "POST") {
  if (!token()) await fetch("/api/session/", { credentials: "same-origin" });
  try {
    const response = await fetch(`/api/${path}/`, {
      method, credentials: "same-origin", body: JSON.stringify(body),
      headers: { "Content-Type": "application/json", "X-CSRFToken": token() },
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "Network error. Check your connection and try again." } };
  }
}

/** Only follow same-site relative redirects. */
export const safeNext = (value, fallback) => (typeof value === "string" && /^\/(?!\/)/.test(value) ? value : fallback);
