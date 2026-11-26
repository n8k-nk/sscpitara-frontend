"use client";
import { useMemo, useState } from "react";
import { evaluate } from "./arithmetic";

/** A fixed, repeatable shuffle, so the server and browser agree and the right answer is not in its original place. */
function shuffled(list, salt) {
  const key = (x, i) => [...(salt + i)].reduce((h, c) => (h * 33 + c.charCodeAt(0)) % 100003, 7);
  const out = list.map((x, i) => [key(x, i), i]).sort((a, b) => a[0] - b[0]).map(([, i]) => i);
  if (out.every((v, i) => v === i) && out.length > 1) out.push(out.shift());
  return out;
}

function Verdict({ ok, children }) {
  return <p className={`cw-verdict ${ok ? "ok" : "bad"}`} role="status"><strong>{ok ? "Yes." : "Not that one."}</strong> {children}</p>;
}

function Match({ block }) {
  const order = useMemo(() => shuffled(block.pairs, block.title), [block]);
  const [left, setLeft] = useState(null), [done, setDone] = useState([]), [last, setLast] = useState(null);
  function choose(i) {
    if (left === null) return;
    const ok = i === left;
    setLast({ ok, i: left });
    if (ok) { setDone((d) => [...d, i]); setLeft(null); }
  }
  if (done.length === block.pairs.length) {
    return <div>
      {last?.ok && <Verdict ok>{block.pairs[last.i].why}</Verdict>}
      <p className="cw-win" role="status">All {done.length} matched.</p>
      <dl className="cw-match-results">
        {block.pairs.map(({ left, right }) => <div key={left}>
          <dt>{left}</dt>
          <dd>{right}</dd>
        </div>)}
      </dl>
    </div>;
  }
  return <div>
    <div className="cw-match" style={{ "--match-rows": order.length }}>
      <div>{block.pairs.map((p, i) => <button key={p.left} type="button" disabled={done.includes(i)} aria-pressed={left === i}
        className={`cw-chip${left === i ? " on" : ""}${done.includes(i) ? " done" : ""}`} onClick={() => { setLeft(i); setLast(null); }}>{p.left}</button>)}</div>
      <div>{order.map((i) => <button key={block.pairs[i].right} type="button" disabled={done.includes(i) || left === null}
        className={`cw-chip${done.includes(i) ? " done" : ""}`} onClick={() => choose(i)}>{block.pairs[i].right}</button>)}</div>
    </div>
    {last && <Verdict ok={last.ok}>{last.ok ? block.pairs[last.i].why : "Try another match."}</Verdict>}
  </div>;
}

function Sort({ block }) {
  const order = useMemo(() => shuffled(block.items, block.title), [block]);
  const [at, setAt] = useState(0), [score, setScore] = useState(0), [last, setLast] = useState(null);
  const item = block.items[order[at]];
  function put(b) {
    if (last) return;
    const ok = b === item.bucket;
    setScore((s) => s + (ok ? 1 : 0));
    setLast({ ok, b });
  }
  if (!item) return <div><p className="cw-win">{score} of {block.items.length} sorted correctly.</p>
    <button type="button" className="secondary" onClick={() => { setAt(0); setScore(0); setLast(null); }}>Play again</button></div>;
  return <div>
    <p className="cw-count">{at + 1} of {block.items.length}</p>
    <p className="cw-card" key={at}>{item.text}</p>
    <div className="cw-buckets">{block.buckets.map((name, b) => <button key={name} type="button" disabled={Boolean(last)}
      className={`cw-chip${last && b === item.bucket ? " done" : ""}${last && !last.ok && b === last.b ? " miss" : ""}`} onClick={() => put(b)}>{name}</button>)}</div>
    {last && <><Verdict ok={last.ok}>{item.why}</Verdict><button type="button" onClick={() => { setAt((n) => n + 1); setLast(null); }}>{at + 1 === block.items.length ? "See score" : "Next"}</button></>}
  </div>;
}

function Sequence({ block }) {
  const order = useMemo(() => shuffled(block.steps, block.title), [block]);
  const [placed, setPlaced] = useState(0), [miss, setMiss] = useState(null);
  return <div>
    <ol className="cw-steps">{block.steps.slice(0, placed).map((s, i) => <li key={s.text}><span>{i + 1}</span><div><strong>{s.text}</strong><small>{s.why}</small></div></li>)}</ol>
    {placed < block.steps.length ? <><p className="cw-count">What comes {placed ? "next" : "first"}?</p>
      <div className="cw-buckets">{order.filter((i) => i >= placed).map((i) => <button key={block.steps[i].text} type="button" className={`cw-chip${miss === i ? " miss" : ""}`}
        onClick={() => { if (i === placed) { setPlaced(placed + 1); setMiss(null); } else setMiss(i); }}>{block.steps[i].text}</button>)}</div>
      {miss !== null && <Verdict ok={false}>Something else comes before it.</Verdict>}</>
      : <><p className="cw-win">That is the whole order.</p><button type="button" className="secondary" onClick={() => { setPlaced(0); setMiss(null); }}>Start again</button></>}
  </div>;
}

function ConceptMap({ block }) {
  const [open, setOpen] = useState(0), b = block.branches[open];
  return <div className="cw-map">
    <p className="cw-center">{block.center}</p>
    <div className="cw-branches">{block.branches.map((x, i) => <button key={x.label} type="button" aria-pressed={open === i} className={`cw-chip${open === i ? " on" : ""}`} onClick={() => setOpen(i)}>{x.label}</button>)}</div>
    <div className="cw-leaf" key={open} role="status"><p>{b.detail}</p><p className="cw-example">{b.example}</p></div>
  </div>;
}

const tidy = (x) => (Number.isFinite(x) ? (Math.round(x * 100) / 100).toLocaleString("en-IN") : "—");

function Calculator({ block }) {
  const [values, setValues] = useState(() => Object.fromEntries(block.variables.map((v) => [v.name, v.default])));
  const results = block.outputs.map((o) => { try { return { ...o, value: evaluate(o.expression, values) }; } catch { return { ...o, value: NaN }; } });
  const biggest = Math.max(1, ...results.map((r) => Math.abs(r.value) || 0));
  return <div>
    {block.variables.map((v) => <label key={v.name} className="cw-slider"><span>{v.label}<strong>{tidy(values[v.name])}</strong></span>
      <input type="range" min={v.min} max={v.max} step={v.step} value={values[v.name]} onChange={(e) => setValues({ ...values, [v.name]: Number(e.target.value) })} /></label>)}
    <ul className="cw-results" aria-live="polite">{results.map((r) => <li key={r.label}><span>{r.label}<strong>{tidy(r.value)}{r.unit ? ` ${r.unit}` : ""}</strong></span>
      <i aria-hidden="true" data-negative={r.value < 0 || undefined} style={{ width: `${(100 * (Math.abs(r.value) || 0)) / biggest}%` }} /></li>)}</ul>
    {block.insight && <p className="cw-insight">{block.insight}</p>}
  </div>;
}

export const WIDGETS = { match: Match, sort: Sort, sequence: Sequence, map: ConceptMap, calculator: Calculator };
