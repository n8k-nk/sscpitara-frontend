"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { send } from "../lib/client";
import { Errors, Field, Select, Tiles } from "./Fields";

const YES_NO = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];

/** Profile form: detail, preparation and preference sections, validated by Django. */
export default function Onboarding({ initial, options, exists }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (name) => (value) => setValues((current) => ({ ...current, [name]: value }));
  const has = (names) => names.some((name) => errors[name]);
  const open = Object.keys(errors).length > 0;
  const common = (name) => ({ name, value: values[name], onChange: set(name), errors });

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const { ok, data } = await send("profile", values, "PUT");
    if (ok) { router.push("/account/"); router.refresh(); return; }
    setErrors(data.errors ?? { __all__: [data.error ?? "Could not save your profile."] });
    setBusy(false);
    document.querySelector(".has-error, .errorlist")?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  return <div className="onboarding">
    <div className="page-head">
      <span className="eyebrow">{exists ? "Your profile" : "Get started"}</span>
      <h1>{exists ? "Edit your SSC profile" : "Find exams that fit you"}</h1>
      <p>Tell us what you’ve completed and where you are in your preparation. You can update your answers anytime.</p>
    </div>
    <ol className="progress-steps" aria-label="What happens next">
      <li><span>1</span>Your details</li><li><span>2</span>Your preparation</li><li><span>3</span>Your exam matches</li>
    </ol>
    <form className="profile-form" method="post" onSubmit={submit}>
      <Errors list={errors.__all__} className="errorlist nonfield" />
      <fieldset>
        <legend><span className="num" aria-hidden="true">1</span>Your details</legend>
        <p className="fieldset-intro">We use these to check age limits and education requirements.</p>
        <div className="field-grid">
          <Field {...common("display_name")} label="Display name" required />
          <Field {...common("date_of_birth")} label="Date of birth" type="date" required help="Used to calculate your age for SSC exam guidance." />
          <Select {...common("education")} label="Highest completed education" options={options.education} required />
          <Select {...common("age_relaxation")} label="Age relaxation" options={options.age_relaxation} required />
          <Field {...common("qualification_notes")} label="Relevant qualifications or skills" optional wide maxLength={200}
            help="Include any relevant engineering branch, stenography, maths or Hindi–English translation qualifications. Leave out certificate numbers." />
        </div>
        <details open={has(options.specialist.map((q) => q.name)) || undefined}>
          <summary><span>Check specialist qualifications<small>Only needed for JE, Stenographer and translator exams</small></span></summary>
          {options.specialist.map((q) => <Select key={q.name} {...common(q.name)} label={q.question} placeholder="Unsure / skip" options={YES_NO} />)}
        </details>
      </fieldset>
      <fieldset>
        <legend><span className="num" aria-hidden="true">2</span>Your preparation</legend>
        <p className="fieldset-intro">This shapes your next step and your daily study plan.</p>
        <Tiles {...common("experience")} label="Preparation experience" options={options.experience} />
        {options.history.length > 0 && <details open={open || undefined}>
          <summary><span>Record previous preparation and results<small>Tell us how far you got in earlier attempts</small></span></summary>
          {options.history.map((row) => <div className="history-row" key={row.code}>
            <Select {...common(row.outcome)} label={`${row.code} previous result`} placeholder="No preparation recorded" options={options.outcomes} />
            <Select {...common(row.stage)} label={`${row.code} last stage (optional)`} placeholder="Choose a stage" options={row.stages.map((stage) => ({ value: stage, label: stage }))} />
          </div>)}
        </details>}
        <details open={open || undefined}>
          <summary><span>Choose target exams and study preferences</span></summary>
          <Tiles {...common("target_exams")} label="Exams you’re interested in (optional)" multiple options={options.exams.map((e) => ({ value: e.id, label: e.code }))} />
          <Tiles {...common("language")} label="Study language" options={options.language} />
          <div className="field-grid">
            <Field {...common("daily_minutes")} label="Daily minutes" type="number" min={5} max={720} required help="Between 5 and 720 minutes." />
            <Field {...common("target_date")} label="Personal target date" type="date" optional />
          </div>
          <Field {...common("focus_topic")} label="Topic to work on first" optional maxLength={120} />
        </details>
      </fieldset>
      <div className="submit-bar">
        <p>You can change these answers anytime.</p>
        <button type="submit" className="lg" disabled={busy}>{busy ? "Saving…" : "See my exam matches"}</button>
      </div>
    </form>
  </div>;
}
