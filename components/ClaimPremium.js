"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { send } from "../lib/client";
import { track } from "../lib/track";

export default function ClaimPremium({ label = "Get Premium · ₹0", className = "button block" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function claim() {
    if (busy) return;
    setBusy(true);
    setError("");
    const { ok, data } = await send("billing/claim-free", {}, "POST");
    if (ok) {
      track("claim_premium");
      router.push("/");
      router.refresh();
      return;
    }
    setBusy(false);
    setError(data?.error ?? "Could not activate Premium. Please try again.");
  }

  return (
    <>
      <button type="button" className={className} onClick={claim} disabled={busy}>
        {busy ? "Activating Premium…" : label}
      </button>
      {error && (
        <p role="alert" className="fieldError" style={{ marginTop: ".5rem" }}>
          {error}
        </p>
      )}
    </>
  );
}
