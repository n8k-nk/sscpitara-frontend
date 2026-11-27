"use client";

function token() {
  return document.cookie.split("; ").find((row) => row.startsWith("csrftoken="))?.split("=")[1] ?? "";
}

let csrfRequest;

function ensureCsrfToken() {
  csrfRequest ??= fetch("/api/csrf/", { credentials: "same-origin" }).finally(() => {
    csrfRequest = undefined;
  });
  return csrfRequest;
}

/** Send JSON or a file to the same-origin Django API with its CSRF header. */
export async function send(path, body = {}, method = "POST", { keepalive = false } = {}) {
  try {
    if (!token()) await ensureCsrfToken();
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

export const CREDITS_EVENT = "sscpitara:credits";

/** Optimistically adjust or sync the header AI credits counter immediately on click. */
export function updateCredits(detail) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CREDITS_EVENT, { detail }));
  }
}
