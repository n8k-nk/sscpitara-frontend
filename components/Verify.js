"use client";
import { useState } from "react";
import AuthShell from "./AuthShell";
import Done from "./Done";
import { send } from "../lib/client";

export default function Verify({ token, pending }) {
  const [state, setState] = useState({ done: false, error: "" });
  if (state.done) return <Done title="Recovery email verified" detail="You can now reset your password using this address." />;
  return <AuthShell title="Confirm recovery email" sub={<>Use <strong>{pending}</strong> to recover this account?</>}>
    {state.error && <p className="errorlist nonfield">{state.error}</p>}
    <button className="block" type="button" onClick={async () => {
      const { ok, data } = await send(`account/recovery/${token}`);
      setState(ok ? { done: true } : { error: data.error ?? "Could not verify the address." });
    }}>Verify email</button>
  </AuthShell>;
}
