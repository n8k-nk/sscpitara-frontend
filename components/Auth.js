"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { send, safeNext } from "../lib/client";
import { Errors, Field } from "./Fields";
import { track } from "../lib/track";

const PASSWORD_HELP = "At least 8 characters. Avoid common or all-number passwords and anything similar to your email.";

const MODES = {
  signin: { endpoint: "auth/signin", action: "Sign in", fields: [["username", "Email ID", "email", "email"], ["password", "Password", "password", "current-password"]] },
  signup: { endpoint: "auth/signup", action: "Sign up", fields: [["username", "Email ID", "email", "email", "We’ll send a 6-digit OTP to verify this email ID."], ["password1", "Password", "password", "new-password", PASSWORD_HELP], ["password2", "Password confirmation", "password", "new-password", "Enter the same password again."]] },
};

/** Sign-in, sign-up, and 6-digit email OTP verification card. */
export default function Auth({ mode, next }) {
  const router = useRouter();
  const config = MODES[mode];
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const [verifyEmail, setVerifyEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpNotice, setOtpNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    const extra = mode === "signup" ? { utm_source: sessionStorage.getItem("utm_source") ?? "" } : {};
    const { ok, data } = await send(config.endpoint, { ...values, ...extra });
    if (data?.verificationRequired && data?.email) {
      setVerifyEmail(data.email);
      setOtp("");
      setOtpNotice(`Enter the 6-digit OTP sent to ${data.email}.`);
      setCooldown(60);
      setBusy(false);
      return;
    }
    if (!ok) {
      setErrors(data.errors ?? { __all__: [data.error ?? "Something went wrong. Try again."] });
      setBusy(false);
      return;
    }
    router.push(safeNext(next, mode === "signup" || !data.profileComplete ? "/onboarding/" : "/account/"));
    router.refresh();
  }

  async function submitOtp(event) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    const { ok, data } = await send("auth/verify-email", { email: verifyEmail, otp: otp.trim() });
    if (!ok) {
      setErrors({ otp: [data.error ?? "Invalid or expired OTP."] });
      setBusy(false);
      return;
    }
    track("sign_up", { method: "email" });
    router.push(safeNext(next, !data.profileComplete ? "/onboarding/" : "/account/"));
    router.refresh();
  }

  async function resend() {
    if (cooldown > 0 || busy) return;
    setBusy(true);
    setErrors({});
    const { ok, data } = await send("auth/resend-otp", { email: verifyEmail });
    setBusy(false);
    if (!ok) {
      setErrors({ __all__: [data.error ?? "Could not resend OTP."] });
      return;
    }
    setOtpNotice(`A new 6-digit OTP has been sent to ${verifyEmail}.`);
    setCooldown(60);
  }

  if (verifyEmail) {
    return (
      <form method="post" onSubmit={submitOtp}>
        <Errors list={errors.__all__} className="errorlist nonfield" />
        {otpNotice && <p className="notice" role="status">{otpNotice}</p>}
        <Field
          name="otp"
          label="6-digit OTP"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          errors={errors}
          value={otp}
          onChange={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
          required
        />
        <button type="submit" disabled={busy || otp.length !== 6}>
          {busy ? "Verifying…" : "Verify & continue"}
        </button>
        <div className="auth-links" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: ".75rem" }}>
          <button
            type="button"
            className="ghost"
            disabled={busy || cooldown > 0}
            onClick={resend}
            style={{ padding: 0, minHeight: "auto" }}
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
          </button>
          <button
            type="button"
            className="ghost"
            disabled={busy}
            onClick={() => { setVerifyEmail(""); setErrors({}); setOtp(""); }}
            style={{ padding: 0, minHeight: "auto" }}
          >
            Change email
          </button>
        </div>
      </form>
    );
  }

  return <form method="post" onSubmit={submit}>
    <Errors list={errors.__all__} className="errorlist nonfield" />
    {config.fields.map(([name, label, type, autoComplete, help]) =>
      <Field key={name} name={name} label={label} type={type} autoComplete={autoComplete} help={help} errors={errors} revealPassword={type === "password"} required
        value={values[name]} onChange={(value) => setValues({ ...values, [name]: value })} />)}
    <button type="submit" disabled={busy}>{busy ? "Please wait…" : config.action}</button>
    {mode === "signin" && <div className="auth-links"><Link href="/account/reset/">Forgot password?</Link></div>}
  </form>;
}
