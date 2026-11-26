"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  { short: "Pick exam", title: "Which exam interests you?", hint: "Choose one exam. You can change it later in your profile, or skip this step for suggestions." },
  { short: "Your exams", title: "What you get if you clear", hint: "The post you can land, your starting salary, what the job lets you do, and what each stage unlocks." },
];
// Which step each server-validated field lives on, so errors can send you back to it.
const HOME = { education: 0, age: 1, age_relaxation: 1, experience: 2, daily_minutes: 2, target_exams: 3, language: 3 };
const EDIT_TITLES = ["Edit education", "Edit age and relaxation", "Edit study preferences", "Edit exams and language", "Edit profile details and results"];
const stepOf = (name) => HOME[name] ?? 4;

function check(step, v) {
  const e = {};
  if (step === 0 && !v.education) e.education = ["Choose your highest completed education."];
  if (step === 1) {
    if (!/^\d+$/.test(v.age) || Number(v.age) > 125) e.age = ["Enter your age in whole years."];
    if (!v.age_relaxation) e.age_relaxation = ["Choose the option that fits you best."];
  }
  if (step === 2) {
    const n = Number(v.daily_minutes);
    if (!Number.isInteger(n) || n < 5 || n > 720) e.daily_minutes = ["Enter between 5 and 720 minutes."];
  }
  if (step === 3 && v.target_exams.length > 1) e.target_exams = ["Choose one exam to continue, or skip this step."];
  return e;
}

/** Step-by-step profile questionnaire. Django still validates everything on save. */
export default function Onboarding({ initial, options, exists, editStep = -1 }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const editing = editStep >= 0;
  const [step, setStep] = useState(editing ? editStep : 0);
  const [busy, setBusy] = useState(false);
  const heading = useRef(null);
  const [preview, setPreview] = useState({ rows: [], age: null });
  useEffect(() => {
    if (!values.education) { setPreview({ rows: [], age: null }); return; }
    let active = true;
    const timer = setTimeout(async () => {
      const { ok, data } = await send("profile/preview", { education: values.education, age: values.age, age_relaxation: values.age_relaxation });
      if (active && ok) setPreview(data);
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [values.education, values.age, values.age_relaxation]);
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
  const last = editing || step === STEPS.length - 1;
  const label = (list, value) => list.find((o) => o.value === String(value))?.label;

  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  function next() {
    const found = check(step, values);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep(step + 1);
  }

  async function submit() {
    const checkedSteps = editing ? [step] : [0, 1, 2, 3];
    for (const s of checkedSteps) {
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
  return <div className={editing ? "wz wz-edit" : "wz"}>
    {!editing && <nav className="wz-side" aria-label="Progress">
      <p className="wz-title">{exists ? "Edit your profile" : "Set up your profile"}</p>
      <ol>{STEPS.map((item, i) => <li key={item.short} className={i === step ? "current" : i < step ? "done" : ""} aria-current={i === step ? "step" : undefined}>
        {i < step
          ? <button type="button" onClick={() => { setErrors({}); setStep(i); }}><span className="n">{tick}</span>{item.short}</button>
          : <><span className="n">{i + 1}</span>{item.short}</>}
      </li>)}</ol>
    </nav>}
    <div className="wz-main">
      {!editing && <div className="wz-mobile"><p>Step {step + 1} of {STEPS.length} · {STEPS[step].short}</p>
        <div className="wz-seg" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Progress">{STEPS.map((item, i) => <i key={item.short} className={i <= step ? "on" : ""} />)}</div></div>}
      <form method="post" noValidate onSubmit={(e) => { e.preventDefault(); last ? submit() : next(); }}>
        <div className="wz-step" key={step}>
          <h1 ref={heading} tabIndex={-1}>{editing ? EDIT_TITLES[step] : STEPS[step].title}</h1>
          {(!editing || step < 3) && <p className="lead">{STEPS[step].hint}</p>}
          <Errors list={errors.__all__} className="errorlist nonfield" />

          {step === 0 && <>
            <Tiles {...common("education")} label="Highest completed education" list options={options.education} />
            {rows.length > 0 && <Insight title={`This opens ${rows.filter((r) => r.status !== "education").length} of ${rows.length} SSC exams`}>
              <p>{label(options.education, values.education)} meets the education requirement for these exams.
                {rows.some((r) => r.status === "education") && ` ${names(rows.filter((r) => r.status === "education"))} ${rows.filter((r) => r.status === "education").length > 1 ? "need" : "needs"} a higher qualification.`}</p>
            </Insight>}
          </>}

          {step === 1 && <>
            <Field {...common("age")} label="Age in years" type="number" inputMode="numeric" min={0} max={125} step={1} required />
            <Tiles {...common("age_relaxation")} label="Age relaxation that applies to you" list options={options.age_relaxation.map((o) => ({ ...o, hint: RELAXATION[o.value] }))} />
            {preview.age != null && <Insight title={fit.length ? `You’re ${preview.age}. ${fit.length} exam${fit.length === 1 ? "" : "s"} to consider` : `You’re ${preview.age}. No exam fits yet`}>
              {fit.length > 0 ? <>
                <p>{likely.length > 0 && <>Likely: <b>{names(likely)}</b>. </>}{check_.length > 0 && <>Check conditions for: <b>{names(check_)}</b>.</>}</p>
              </> : <p>Check your age and the relaxation option. The age limit is the usual reason.</p>}
            </Insight>}
          </>}

          {step === 2 && <>
            <Tiles {...common("experience")} label="Where are you in your preparation?" list options={options.experience} />
            <Slider {...common("daily_minutes")} label="Time you can study each day" max={FOUR_HOUR_MINUTES}
              stops={[15, 60, 120, 180, FOUR_HOUR_MINUTES]} formatValue={studyDuration} />
            <Insight title={`${studyDuration(values.daily_minutes)} a day is ${Number(values.daily_minutes) === FOUR_HOUR_MINUTES ? "at least" : "about"} ${hours(Number(values.daily_minutes) || 0)} a week`}>
              <p>Each day you get practice sized to your time, based on what you have learned and answered, plus revision of questions you missed.</p>
              {values.experience !== "starting" && <p>You can add your earlier results on the last step, and we’ll pick up from the stage you reached.</p>}
            </Insight>
          </>}

          {step === 3 && <>
            {values.target_exams.length > 1 && <p className="notice">Your profile has multiple saved exams. Choose the one you want to focus on.</p>}
            <Tiles {...common("target_exams")} label="Target exam (optional)" list
              value={values.target_exams.length === 1 ? values.target_exams[0] : ""}
              onChange={(id) => set("target_exams")([id])}
              options={[...options.exams].sort((a, b) => rank(a) - rank(b))
                .map((e) => ({ value: e.id, label: e.title, tag: e.code, badge: STATUS[status[String(e.id)]?.status] }))} />
            {values.target_exams.length === 1 && values.target_exams.map((id) => status[String(id)]).filter((r) => r && !FIT.includes(r.status)).map((r) =>
              <Insight key={r.id} title={`Heads up: ${r.code} doesn’t fit right now`}><p>{r.reason}</p></Insight>)}
            <Tiles {...common("language")} label="Study language" options={options.language} />
          </>}

          {step === 4 && <>
            {!editing && <>{values.target_exams.length === 0 && <p className="brief-intro">You didn’t pick any exams, so here are the best fits for your profile.</p>}
            <div className="briefs">{shown.map((exam) => <ExamBrief key={exam.id} exam={exam} status={status[String(exam.id)]} />)}</div>
            {shown.length === 0 && <p className="empty">No exam fits your answers yet. You can still save your profile and adjust it later.</p>}</>}
            <details className="panel" open={editing || Object.keys(errors).some((n) => stepOf(n) === 4) || undefined}>
              <summary>{editing ? "Profile details and previous results" : "Add more detail (optional)"}</summary>
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
          {editing ? <Link href="/account/">Cancel</Link> : step > 0 ? <button type="button" className="secondary" onClick={() => { setErrors({}); setStep(step - 1); }}>Back</button> : <span />}
          <div className="wz-right">
            {step === 3 && editing && values.target_exams.length > 0 && <button type="button" className="ghost" onClick={() => set("target_exams")([])}>Clear target exam</button>}
            {step === 3 && !editing && <button type="button" className="ghost" onClick={() => { set("target_exams")([]); setStep(4); }}>Skip</button>}
            <button type="submit" className="lg" disabled={busy}>{last ? (busy ? "Saving…" : editing ? "Save changes" : "Continue to dashboard") : "Continue"}</button>
          </div>
        </div>
      </form>
    </div>
  </div>;
}
