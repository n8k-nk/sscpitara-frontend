"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { send } from "../lib/client";
import { Errors, Field, Select, Slider, Tiles, duration } from "./Fields";
import ExamBrief from "./ExamBrief";

const YES_NO = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
const RELAXATION = {
  none: "No age relaxation. Includes General and EWS (Economically Weaker Section) candidates.",
  obc: "OBC means Other Backward Classes, non-creamy layer.",
  sc_st: "SC / ST means Scheduled Castes or Scheduled Tribes.",
  review: "Ex-servicemen, persons with disabilities, government employees and similar categories.",
};
const STATUS = {
  match: ["ok", "Likely match"], review: ["warn", "Check conditions"], age_review: ["warn", "Check age relaxation"],
  age: ["off", "Outside age range"], education: ["off", "Needs higher education"],
};
const FIT = ["match", "review", "age_review"];
const names = (rows) => rows.map((r) => r.code).join(", ");
const hours = (minutes) => { const h = (minutes * 7) / 60; return `${Number.isInteger(h) ? h : h.toFixed(1)} hours`; };
const FOUR_HOUR_MINUTES = 240;
const studyDuration = (minutes) => Number(minutes) === FOUR_HOUR_MINUTES ? "4 hr+" : duration(minutes);

/** A short, data-driven response to what the user just entered. */
function Insight({ title, children }) {
  return <div className="insight" aria-live="polite"><strong>{title}</strong>{children}</div>;
}

const STEPS = [
  { short: "Education", title: "What’s your education?", hint: "Pick the highest level you’ve completed." },
  { short: "Age", title: "How old are you?", hint: "Exams have age limits. We only use this to check them." },
  { short: "Preparation", title: "How are you preparing?", hint: "This sets your daily study plan." },
  { short: "Pick exams", title: "Which exams interest you?", hint: "Optional. Not sure? Skip it and we’ll suggest exams that fit your profile." },
  { short: "Your exams", title: "What you get if you clear", hint: "The post you can land, your starting salary, what the job lets you do, and what each stage unlocks." },
];
// Which step each server-validated field lives on, so errors can send you back to it.
const HOME = { education: 0, date_of_birth: 1, age_relaxation: 1, experience: 2, daily_minutes: 2, target_exams: 3, language: 3 };
const stepOf = (name) => HOME[name] ?? 4;

function check(step, v) {
  const e = {};
  if (step === 0 && !v.education) e.education = ["Choose your highest completed education."];
  if (step === 1) {
    if (!v.date_of_birth) e.date_of_birth = ["Enter your date of birth."];
    else if (v.date_of_birth > new Date().toISOString().slice(0, 10)) e.date_of_birth = ["Enter a date of birth in the past."];
    else if (v.date_of_birth < "1900-01-01") e.date_of_birth = ["Enter a valid date of birth."];
    if (!v.age_relaxation) e.age_relaxation = ["Choose the option that fits you best."];
  }
  if (step === 2) {
    const n = Number(v.daily_minutes);
    if (!Number.isInteger(n) || n < 5 || n > 720) e.daily_minutes = ["Enter between 5 and 720 minutes."];
  }
  return e;
}

/** Step-by-step profile questionnaire. Django still validates everything on save. */
export default function Onboarding({ initial, options, exists }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const heading = useRef(null);
  const [preview, setPreview] = useState({ rows: [], age: null });
  useEffect(() => {
    if (!values.education) { setPreview({ rows: [], age: null }); return; }
    let active = true;
    const timer = setTimeout(async () => {
      const { ok, data } = await send("profile/preview", { education: values.education, date_of_birth: values.date_of_birth, age_relaxation: values.age_relaxation });
      if (active && ok) setPreview(data);
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [values.education, values.date_of_birth, values.age_relaxation]);
  const rows = preview.rows;
  const fit = rows.filter((r) => FIT.includes(r.status));
  const likely = rows.filter((r) => r.status === "match");
  const check_ = rows.filter((r) => r.status === "review" || r.status === "age_review");
  const status = Object.fromEntries(rows.map((r) => [String(r.id), r]));
  const examRank = new Map(rows.map((row, index) => [String(row.id), index]));
  const rank = (exam) => examRank.get(String(exam.id)) ?? rows.length;
  const chosen = options.exams.filter((e) => values.target_exams.map(String).includes(String(e.id)));
  const shown = chosen.length ? chosen : fit.slice(0, 3).map((r) => options.exams.find((e) => e.id === r.id)).filter(Boolean);
  const set = (name) => (value) => { setValues((current) => ({ ...current, [name]: value })); setErrors((e) => ({ ...e, [name]: undefined })); };
  const common = (name) => ({ name, value: values[name], onChange: set(name), errors });
  const last = step === STEPS.length - 1;
  const label = (list, value) => list.find((o) => o.value === String(value))?.label;

  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  function next() {
    const found = check(step, values);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep(step + 1);
  }

  async function submit() {
    for (let s = 0; s < STEPS.length - 1; s += 1) {
      const found = check(s, values);
      if (Object.keys(found).length) { setErrors(found); setStep(s); return; }
    }
    setBusy(true);
    const { ok, data } = await send("profile", values, "PUT");
    if (ok) { router.push("/account/"); router.refresh(); return; }
    const found = data.errors ?? { __all__: [data.error ?? "Could not save your profile."] };
    setErrors(found);
    setStep(Math.min(...Object.keys(found).map((name) => (name === "__all__" ? 4 : stepOf(name)))));
    setBusy(false);
  }

  const tick = <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return <div className="wz">
    <nav className="wz-side" aria-label="Progress">
      <p className="wz-title">{exists ? "Edit your profile" : "Set up your profile"}</p>
      <ol>{STEPS.map((item, i) => <li key={item.short} className={i === step ? "current" : i < step ? "done" : ""} aria-current={i === step ? "step" : undefined}>
        {i < step
          ? <button type="button" onClick={() => { setErrors({}); setStep(i); }}><span className="n">{tick}</span>{item.short}</button>
          : <><span className="n">{i + 1}</span>{item.short}</>}
      </li>)}</ol>
    </nav>
    <div className="wz-main">
      <div className="wz-mobile"><p>Step {step + 1} of {STEPS.length} · {STEPS[step].short}</p>
        <div className="wz-seg" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Progress">{STEPS.map((item, i) => <i key={item.short} className={i <= step ? "on" : ""} />)}</div></div>
      <form method="post" noValidate onSubmit={(e) => { e.preventDefault(); last ? submit() : next(); }}>
        <div className="wz-step" key={step}>
          <h1 ref={heading} tabIndex={-1}>{STEPS[step].title}</h1>
          <p className="lead">{STEPS[step].hint}</p>
          <Errors list={errors.__all__} className="errorlist nonfield" />

          {step === 0 && <>
            <Tiles {...common("education")} label="Highest completed education" list options={options.education} />
            {rows.length > 0 && <Insight title={`This opens ${rows.filter((r) => r.status !== "education").length} of ${rows.length} SSC exams`}>
              <p>{label(options.education, values.education)} meets the education requirement for these exams.
                {rows.some((r) => r.status === "education") && ` ${names(rows.filter((r) => r.status === "education"))} ${rows.filter((r) => r.status === "education").length > 1 ? "need" : "needs"} a higher qualification.`}</p>
            </Insight>}
          </>}

          {step === 1 && <>
            <Field {...common("date_of_birth")} label="Date of birth" type="date" max={new Date().toISOString().slice(0, 10)} autoComplete="bday" />
            <Tiles {...common("age_relaxation")} label="Age relaxation that applies to you" list options={options.age_relaxation.map((o) => ({ ...o, hint: RELAXATION[o.value] }))} />
            {preview.age != null && <Insight title={fit.length ? `You’re ${preview.age}. You likely fit ${likely.length} exam${likely.length === 1 ? "" : "s"}` : `You’re ${preview.age}. No exam fits yet`}>
              {fit.length > 0 ? <>
                <p>{likely.length > 0 && <>Likely: <b>{names(likely)}</b>. </>}{check_.length > 0 && <>Check conditions for: <b>{names(check_)}</b>.</>}</p>
                {likely[0]?.limit && <p>{likely[0].code} age limits go up to {likely[0].limit} for some posts, so you may have up to {Math.max(0, likely[0].limit - preview.age)} more years to apply.</p>}
              </> : <p>Check your date of birth and the relaxation option. The age limit is the usual reason.</p>}
            </Insight>}
          </>}

          {step === 2 && <>
            <Tiles {...common("experience")} label="Where are you in your preparation?" list options={options.experience} />
            <Slider {...common("daily_minutes")} label="Time you can study each day" max={FOUR_HOUR_MINUTES}
              stops={[15, 60, 120, 180, FOUR_HOUR_MINUTES]} formatValue={studyDuration} />
            <Insight title={`${studyDuration(values.daily_minutes)} a day is ${Number(values.daily_minutes) === FOUR_HOUR_MINUTES ? "at least" : "about"} ${hours(Number(values.daily_minutes) || 0)} a week`}>
              <p>Your plan starts with a free 20-question diagnostic across all four subjects. Then each day you get practice sized to your time, plus revision of questions you missed.</p>
              {values.experience !== "starting" && <p>You can add your earlier results on the last step, and we’ll pick up from the stage you reached.</p>}
            </Insight>
          </>}

          {step === 3 && <>
            <Tiles {...common("target_exams")} label="Exams you’re interested in" multiple list
              options={[...options.exams].sort((a, b) => rank(a) - rank(b))
                .map((e) => ({ value: e.id, label: e.title, tag: e.code, badge: STATUS[status[String(e.id)]?.status] }))} />
            {values.target_exams.map((id) => status[String(id)]).filter((r) => r && !FIT.includes(r.status)).map((r) =>
              <Insight key={r.id} title={`Heads up: ${r.code} doesn’t fit right now`}><p>{r.reason}</p></Insight>)}
            {values.target_exams.length > 0 && values.target_exams.every((id) => FIT.includes(status[String(id)]?.status)) &&
              <Insight title="All your chosen exams fit your profile"><p>We’ll show them first on your matches page.</p></Insight>}
            <Tiles {...common("language")} label="Study language" options={options.language} />
          </>}

          {step === 4 && <>
            {values.target_exams.length === 0 && <p className="brief-intro">You didn’t pick any exams, so here are the best fits for your profile.</p>}
            <div className="briefs">{shown.map((exam) => <ExamBrief key={exam.id} exam={exam} status={status[String(exam.id)]} />)}</div>
            {shown.length === 0 && <p className="empty">No exam fits your answers yet. You can still save your profile and adjust it later.</p>}
            <details className="panel" open={Object.keys(errors).some((n) => stepOf(n) === 4) || undefined}>
              <summary>Add more detail (optional)</summary>
              <div className="panel-body">
                <Field {...common("display_name")} label="Display name" />
                <Field {...common("qualification_notes")} label="Relevant qualifications or skills" optional maxLength={200}
                  help="For example an engineering branch or stenography. Leave out certificate numbers." />
                {options.specialist.map((q) => <Select key={q.name} {...common(q.name)} label={q.question} placeholder="Unsure / skip" options={YES_NO} />)}
                {options.history.map((row) => <div className="history-row" key={row.code}>
                  <Select {...common(row.outcome)} label={`${row.code} previous result`} placeholder="No preparation recorded" options={options.outcomes} />
                  <Select {...common(row.stage)} label={`${row.code} last stage`} placeholder="Choose a stage" options={row.stages.map((s) => ({ value: s, label: s }))} />
                </div>)}
                <Field {...common("target_date")} label="Personal target date" type="date" optional />
                <Field {...common("focus_topic")} label="Topic to work on first" optional maxLength={120} />
              </div>
            </details>
          </>}
        </div>

        <div className="wz-actions">
          {step > 0 ? <button type="button" className="secondary" onClick={() => { setErrors({}); setStep(step - 1); }}>Back</button> : <span />}
          <div className="wz-right">
            {step === 3 && <button type="button" className="ghost" onClick={() => setStep(4)}>Skip</button>}
            <button type="submit" className="lg" disabled={busy}>{last ? (busy ? "Saving…" : "Continue to dashboard") : "Continue"}</button>
          </div>
        </div>
      </form>
    </div>
  </div>;
}
