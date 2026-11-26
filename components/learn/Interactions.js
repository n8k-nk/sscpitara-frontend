"use client";
import { useState } from "react";

const r2 = (x) => Math.round(x * 100) / 100;
const money = (u, x) => `${u ?? ""}${r2(x).toLocaleString("en-IN")}`;

/** Bars drawn from numbers, plus the same numbers as text, so nothing depends on colour or on seeing the bars. */
export function PercentBars({ data }) {
  const steps = data.steps, max = Math.max(...steps.map((s) => s.value));
  return <figure className="bars" role="group" aria-label={`Amounts: ${steps.map((s) => `${s.label} ${money(data.unit, s.value)}`).join(", then ")}`}>
    {steps.map((s, i) => <div className="bar-row" key={i}><span className="bar-label">{s.label}</span>
      <span className="bar-track" aria-hidden="true"><span className="bar-fill" style={{ width: `${(s.value / max) * 100}%` }} /></span>
      <strong className="bar-num">{money(data.unit, s.value)}</strong></div>)}
    {data.caption && <figcaption className="muted small">{data.caption}</figcaption>}</figure>;
}

/** Two signed percentage changes on a start amount. Exact to the paisa; shows why adding the percentages is wrong. */
export function PercentageSlider({ data }) {
  const [a, setA] = useState(data.a ?? 20), [b, setB] = useState(data.b ?? -20), start = data.start ?? 100, lo = data.min ?? -50, hi = data.max ?? 50, u = data.unit;
  const clamp = (v) => Math.min(hi, Math.max(lo, Number.isFinite(+v) ? +v : 0));
  const mid = start * (1 + a / 100), end = mid * (1 + b / 100), net = (end / start - 1) * 100, formula = a + b + (a * b) / 100;
  const word = (x) => `${x >= 0 ? "+" : "−"}${Math.abs(x)}%`;
  const row = (label, v, set, id) => <div className="slider-row"><label htmlFor={id}>{label}</label>
    <input id={id} type="range" min={lo} max={hi} step="1" value={v} onChange={(e) => set(clamp(e.target.value))} aria-valuetext={word(v)} />
    <input type="number" aria-label={`${label}, as a number`} min={lo} max={hi} value={v} onChange={(e) => set(clamp(e.target.value))} /></div>;
  return <div className="pslider">
    {row("First change", a, setA, "pa")}{row("Second change", b, setB, "pb")}
    <PercentBars data={{ unit: u, steps: [{ label: "Start", value: start }, { label: word(a), value: mid }, { label: word(b), value: end }] }} />
    <ul className="slider-facts" aria-live="polite">
      <li>After {word(a)}: <strong>{money(u, mid)}</strong></li>
      <li>{word(b)} is taken from {money(u, mid)}, which is <strong>{money(u, Math.abs(mid * b / 100))}</strong>, not {money(u, Math.abs(start * b / 100))}.</li>
      <li>Final: <strong>{money(u, end)}</strong>. Net change: <strong>{r2(net) > 0 ? "+" : r2(net) < 0 ? "−" : ""}{Math.abs(r2(net))}%</strong></li>
      <li className="muted">Adding the percentages would say {word(a + b)}. The rule {a} + ({b}) + ({a}×{b})/100 = {r2(formula)}% agrees with the real net.</li></ul></div>;
}

export const COMPONENTS = { "percent-bars": PercentBars, "percentage-slider": PercentageSlider };
