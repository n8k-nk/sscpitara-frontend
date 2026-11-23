"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthShell from "./AuthShell";
import Done from "./Done";
import SimpleForm from "./SimpleForm";
import { send } from "../lib/client";

export default function ResetConfirm({ uid, token }) {
  const [state, setState] = useState("checking");
  useEffect(() => { send("auth/password-reset/confirm", { uid, token }).then(({ ok }) => setState(ok ? "valid" : "expired")); }, [uid, token]);
  if (state === "updated") return <Done title="Password updated" detail="You can now sign in with your new password." href="/signin/" label="Sign in" />;
  return <AuthShell title="Choose a new password" sub={state === "valid" ? "Pick something you don’t use on other sites." : state === "expired" ? "This link has expired or was already used." : "Checking your link…"}>
    {state === "expired" && <Link className="button block" href="/account/reset/">Request another link</Link>}
    {state === "valid" && <SimpleForm endpoint="auth/password-reset/confirm" action="Save new password" extra={{ uid, token }} done={() => setState("updated")}
      fields={[
        { name: "password1", label: "New password", type: "password", autoComplete: "new-password", required: true, help: "At least 8 characters. Avoid common or all-number passwords." },
        { name: "password2", label: "New password confirmation", type: "password", autoComplete: "new-password", required: true },
      ]} />}
  </AuthShell>;
}
