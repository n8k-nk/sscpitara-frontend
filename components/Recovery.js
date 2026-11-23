"use client";
import { useState } from "react";
import AuthShell from "./AuthShell";
import Done from "./Done";
import SimpleForm from "./SimpleForm";

export default function Recovery({ verified }) {
  const [sent, setSent] = useState(false);
  if (sent) return <Done title="Check your inbox" detail="Open the verification link within one hour." />;
  return <AuthShell title="Recovery email" sub={verified ? <>Verified address: <strong>{verified}</strong>. Enter a new address to replace it.</> : "Add an email so you can reset your password if you forget it."}>
    <SimpleForm endpoint="account/recovery" action="Send verification" done={() => setSent(true)}
      fields={[{ name: "email", label: "Recovery email", type: "email", autoComplete: "email", required: true }]} />
  </AuthShell>;
}
