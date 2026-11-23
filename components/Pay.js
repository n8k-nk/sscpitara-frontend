"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { send } from "../lib/client";

const SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const tag = Object.assign(document.createElement("script"), { src: SCRIPT, onload: resolve, onerror: () => reject(new Error("Could not load Razorpay.")) });
    document.head.append(tag);
  });
}

/** Create an order on Django, open Razorpay checkout, then ask Django to verify the signed result. */
export default function Pay({ price }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true); setStatus("");
    const { ok, data } = await send("billing/checkout");
    if (!ok) { setStatus(data.error ?? "Checkout is unavailable right now."); setBusy(false); return; }
    if (data.already) { router.refresh(); return; }
    try { await loadRazorpay(); } catch (error) { setStatus(error.message); setBusy(false); return; }
    const checkout = new window.Razorpay({
      ...data.options,
      handler: async (response) => {
        setStatus("Confirming your payment…");
        const result = await send("billing/confirm", response);
        if (result.ok) { router.refresh(); return; }
        setStatus(result.data.error ?? "We could not confirm the payment yet. Use “Check payment status” in a moment.");
        setBusy(false); router.refresh();
      },
      modal: { ondismiss: () => { setStatus("Checkout closed. You have not been charged unless the payment completed."); setBusy(false); } },
    });
    checkout.open();
  }
  return <><button type="button" id="pay" className="block" onClick={pay} disabled={busy}>{busy ? "Opening checkout…" : `Buy Base · ${price}`}</button>
    <p role="status" id="payment-status" className="muted" style={{ marginTop: ".75rem" }}>{status}</p></>;
}
