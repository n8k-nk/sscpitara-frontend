"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { send } from "../lib/client";

export default function CheckStatus({ orderId }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  return <><button type="button" className="secondary block" style={{ marginTop: ".75rem" }} onClick={async () => {
    const { ok, data } = await send(`billing/orders/${orderId}/refresh`);
    if (ok) router.refresh(); else setNote(data.error ?? "Could not check the payment.");
  }}>Check payment status</button>{note && <p role="status" className="muted">{note}</p>}</>;
}
