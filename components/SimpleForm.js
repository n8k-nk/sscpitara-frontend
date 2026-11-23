"use client";
import { useState } from "react";
import { send } from "../lib/client";
import { Errors, Field } from "./Fields";

/** One-shot form posting to the API. `done(data)` receives the success payload. */
export default function SimpleForm({ endpoint, fields, action, done, method = "POST", extra }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const { ok, data, status } = await send(endpoint, { ...values, ...extra }, method);
    setBusy(false);
    if (ok) return done(data);
    setErrors(data.errors ?? { __all__: [data.error ?? `Something went wrong (${status}).`] });
  }
  return <form method="post" onSubmit={submit}>
    <Errors list={errors.__all__} className="errorlist nonfield" />
    {fields.map(({ name, ...rest }) => <Field key={name} name={name} errors={errors} value={values[name]}
      onChange={(value) => setValues({ ...values, [name]: value })} {...rest} />)}
    <button type="submit" disabled={busy}>{busy ? "Please wait…" : action}</button>
  </form>;
}
