"use client";

function token() {
  return document.cookie.split("; ").find((row) => row.startsWith("csrftoken="))?.split("=")[1] ?? "";
}

/** Send JSON or a file to the same-origin Django API with its CSRF header. */
export async function send(path, body = {}, method = "POST", { keepalive = false } = {}) {
  try {
    if (!token()) await fetch("/api/session/", { credentials: "same-origin" });
    const binary = body instanceof Blob;
    const response = await fetch(`/api/${path}/`, {
      method, keepalive, credentials: "same-origin", body: binary ? body : JSON.stringify(body),
      headers: { "Content-Type": binary ? "application/octet-stream" : "application/json", "X-CSRFToken": token() },
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "Network error. Check your connection and try again." } };
  }
}

/** Only follow same-site relative redirects. */
export const safeNext = (value, fallback) => (typeof value === "string" && /^\/(?!\/)/.test(value) ? value : fallback);
