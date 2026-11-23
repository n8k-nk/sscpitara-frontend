"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { send, safeNext } from "../lib/client";
import { Errors, Field } from "./Fields";

const PASSWORD_HELP = "At least 8 characters. Avoid common or all-number passwords and anything similar to your username.";

const MODES = {
  signin: { endpoint: "auth/signin", action: "Sign in", fields: [["username", "Username", "text", "username"], ["password", "Password", "password", "current-password"]] },
  signup: { endpoint: "auth/signup", action: "Sign up", fields: [["username", "Username", "text", "username", "150 characters or fewer. Letters, digits and @/./+/-/_ only."], ["password1", "Password", "password", "new-password", PASSWORD_HELP], ["password2", "Password confirmation", "password", "new-password", "Enter the same password again."]] },
};

/** Sign-in and sign-up card: posts to Django, then continues to `next` or onboarding. */
export default function Auth({ mode, next }) {
  const router = useRouter();
  const config = MODES[mode];
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const extra = mode === "signup" ? { utm_source: sessionStorage.getItem("utm_source") ?? "" } : {};
    const { ok, data } = await send(config.endpoint, { ...values, ...extra });
    if (!ok) { setErrors(data.errors ?? { __all__: [data.error ?? "Something went wrong. Try again."] }); setBusy(false); return; }
    router.push(safeNext(next, mode === "signup" || !data.profileComplete ? "/onboarding/" : "/account/"));
    router.refresh();
  }

  return <form method="post" onSubmit={submit}>
    <Errors list={errors.__all__} className="errorlist nonfield" />
    {config.fields.map(([name, label, type, autoComplete, help]) =>
      <Field key={name} name={name} label={label} type={type} autoComplete={autoComplete} help={help} errors={errors} required
        value={values[name]} onChange={(value) => setValues({ ...values, [name]: value })} />)}
    <button type="submit" disabled={busy}>{busy ? "Please wait…" : config.action}</button>
    {mode === "signin" && <div className="auth-links"><Link href="/account/reset/">Forgot password?</Link></div>}
  </form>;
}
