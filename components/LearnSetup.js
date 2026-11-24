"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { send } from "../lib/client";

const LEVELS = [
  { value: "starting", title: "Just starting", text: "I am new to this. Teach me from the beginning." },
  { value: "some", title: "I have studied some topics", text: "I have finished a few chapters and want to skip them." },
  { value: "revising", title: "I am revising", text: "I know most of it. Show me the topics that matter most." },
];
const hrs = (m) => (m >= 90 ? `${Math.round(m / 60)} h` : `${m} min`);

/** Asked once. Every step is optional; skipping still counts as answered so we never ask again. */
export default function LearnSetup({ stages, current, editing }) {
  const router = useRouter();
  const [stage, setStage] = useState(current?.stage ?? (stages.length === 1 ? stages[0].slug : ""));
  const [level, setLevel] = useState(current?.level ?? "");
  const [known, setKnown] = useState(() => new Set(stages.flatMap((s) => s.subjects.flatMap((x) => x.topics)).filter((t) => t.done === t.total).map((t) => t.id)));
  const [step, setStep] = useState(stages.length === 1 && !editing ? 1 : 0);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const chosen = stages.find((s) => s.slug === stage);
  const needsList = level === "some" || level === "revising";

  async function save(skipped = false) {
    const slug = stage || stages[0].slug;
    setBusy(true); setError("");
    const { ok, data } = await send("learn/setup", {
      exam: "CGL", stage: slug, level: level || "starting", skipped,
      known_topics: skipped || !needsList ? [] : [...known], replace: editing && !skipped });
    if (!ok) { setBusy(false); return setError(data.error ?? "Could not save. Try again."); }
    router.push(`/learn/?stage=${slug}`);
    router.refresh();
  }
  const toggle = (id) => setKnown((k) => { const n = new Set(k); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = (topics) => setKnown((k) => {
    const n = new Set(k), all = topics.every((t) => n.has(t.id));
    topics.forEach((t) => (all ? n.delete(t.id) : n.add(t.id))); return n; });
  const lead = stages.length > 1 ? 1 : 0, steps = lead + 1 + (needsList ? 1 : 0), at = step + (lead ? 1 : 0);

  return <div className="setup">
    <p className="setup-step" aria-live="polite">Step {at} of {steps}</p>

    {step === 0 && <section><h2>Which stage are you preparing for?</h2><p className="muted">We will build your path around it. You can switch stage any time.</p>
      <div className="choices">{stages.map((s) => <button key={s.slug} type="button" className={`choice${stage === s.slug ? " on" : ""}`} aria-pressed={stage === s.slug} onClick={() => setStage(s.slug)}>
        <strong>CGL {s.name}</strong><span>{s.totals.topics} topics · about {hrs(s.totals.minutes_total)} of study</span></button>)}</div>
      <p className="setup-actions"><button type="button" disabled={!stage} onClick={() => setStep(1)}>Continue</button></p></section>}

    {step === 1 && <section><h2>Where are you right now{stages.length === 1 ? ` for CGL ${stages[0].name}` : ""}?</h2><p className="muted">This decides what we show you first.</p>
      <div className="choices">{LEVELS.map((l) => <button key={l.value} type="button" className={`choice${level === l.value ? " on" : ""}`} aria-pressed={level === l.value} onClick={() => setLevel(l.value)}>
        <strong>{l.title}</strong><span>{l.text}</span></button>)}</div>
      <p className="setup-actions">
        {stages.length > 1 && <button type="button" className="secondary" onClick={() => setStep(0)}>Back</button>}
        {needsList ? <button type="button" disabled={!level} onClick={() => setStep(2)}>Continue</button>
          : <button type="button" disabled={!level || busy} onClick={() => save()}>{busy ? "Saving…" : "Start my path"}</button>}</p></section>}

    {step === 2 && chosen && <section><h2>Tick what you have already finished</h2>
      <p className="muted">Optional. Anything you tick is skipped in your path, and you can change it later. Only tick topics you really know.</p>
      {chosen.subjects.map((sub) => <fieldset key={sub.slug} className="tick-group"><legend>{sub.name}</legend>
        <button type="button" className="ghost small-btn" onClick={() => toggleAll(sub.topics)}>{sub.topics.every((t) => known.has(t.id)) ? "Clear all" : "Select all"}</button>
        <div className="ticks">{sub.topics.map((t) => <label key={t.id} className={known.has(t.id) ? "tick on" : "tick"}>
          <input type="checkbox" checked={known.has(t.id)} onChange={() => toggle(t.id)} /> <span>{t.name}</span><small>{hrs(t.minutes)}</small></label>)}</div></fieldset>)}
      <p className="setup-actions sticky-actions"><button type="button" className="secondary" onClick={() => setStep(1)}>Back</button>
        <button type="button" disabled={busy} onClick={() => save()}>{busy ? "Saving…" : known.size ? `Save ${known.size} finished and start` : "Start my path"}</button></p></section>}

    {error && <p className="errorlist" role="alert">{error}</p>}
    {!editing && <p className="setup-skip"><button type="button" className="ghost" disabled={busy} onClick={() => save(true)}>Skip for now. Just show me everything.</button></p>}
  </div>;
}
