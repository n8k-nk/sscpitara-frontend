"use client";
import { useState } from "react";
import Link from "next/link";
import AuthShell from "./AuthShell";
import Done from "./Done";
import SimpleForm from "./SimpleForm";

export default function ResetRequest() {
  const [sent, setSent] = useState(false);
  if (sent) return <Done title="Check your inbox" detail="If a verified account matches this address, a reset link is on its way." href="/signin/" label="Sign in" />;
  return <AuthShell title="Reset password" sub="Enter your verified recovery email and we’ll send a reset link."
    switchTo={<>Remembered it? <Link href="/signin/">Back to sign in</Link></>}>
    <SimpleForm endpoint="auth/password-reset" action="Send reset link" done={() => setSent(true)}
      fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email", required: true }]} />
  </AuthShell>;
}
