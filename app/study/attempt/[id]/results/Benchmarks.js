"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { send } from "../../../../../lib/client";
import s from "./report.module.css";

const PROFILE = ["UR", "EWS", "OBC", "SC", "ST"];

export default function Benchmarks({ benchmark: b, score, maximum }) {
  const router = useRouter();
  const initial = b?.saved_category || (b?.profile_categories?.length === 1 ? b.profile_categories[0] : "");
  const [category, setCategory] = useState(initial);
  const [listIndex, setListIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  if (!b) return <section className={s.panel}><h2>Qualifying marks</h2>
    <p className={s.note}>An official cutoff comparison is unavailable for this paper.</p></section>;

  const list = b.lists[listIndex];
  const categories = [...new Set([...PROFILE, ...b.lists.flatMap((item) => Object.keys(item.cutoffs))])];
  const cutoff = list.cutoffs[category];
  const minimum = b.minimums[category];
  async function saveCategory(value) {
    setBusy(true);
    const { ok, data } = await send("study/result-category", { category: value });
    setBusy(false);
    setMessage(ok ? value ? "Category saved to your profile." : "Saved category cleared." : data.error || "Could not save your category.");
    if (ok) router.refresh();
  }
  return <section className={s.panel}>
    <header className={s.panelTitle}><h2>Qualifying marks</h2><span>SSC CGL · {b.reference_year}</span></header>
    <p className={s.note}>{b.historical ? `Historical reference for this ${b.paper_year} paper. ` : ""}SSC shortlists using normalized scores. Your mock reports raw marks.</p>
    <div className={s.benchmarkFilters}>
      <label>Post list<select value={listIndex} onChange={(e) => setListIndex(Number(e.target.value))}>{b.lists.map((item, i) => <option value={i} key={item.label}>{item.label}</option>)}</select></label>
      <label>Category<select value={category} onChange={(e) => { setCategory(e.target.value); setMessage(""); }}>
        <option value="">Choose category</option>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
    </div>
    {!category && <p className={s.note}>{b.profile_categories.length > 1 ? `Your profile groups ${b.profile_categories.join(" and ")}. Choose your exact category to view the cutoff.` : "Choose a category to see its minimum marks and shortlisting cutoff."}</p>}
    {category && <dl className={s.cutoffValues}>
      <div><dt>Minimum qualifying</dt><dd>{minimum ? <>{minimum.marks} <small>/ {b.scale} · {minimum.percent}%</small></> : "Unavailable"}</dd></div>
      <div><dt>Shortlisting cutoff</dt><dd>{cutoff == null ? <small>No separate row published</small> : <>{cutoff} <small>/ {b.scale}</small></>}</dd></div>
    </dl>}
    {category && <p className={s.note}>{maximum === b.scale
      ? <>Your raw score is <strong>{score} / {maximum}</strong>. {minimum && <>That is {score === minimum.marks ? "exactly the minimum practice target" : `${Math.abs(score - minimum.marks).toLocaleString("en-IN")} marks ${score > minimum.marks ? "above" : "below"} the minimum practice target`}.</>}</>
      : <>Your paper is scored out of {maximum}. SSC publishes these references on a {b.scale}-mark scale.</>}</p>}
    {list.restricted && <p className={s.note}>This post list has additional eligibility criteria.</p>}
    {b.note && <details className={s.more}><summary>How to interpret these marks</summary><p>{b.note}</p></details>}
    {category !== (b.saved_category || "") && (PROFILE.includes(category) || !category) &&
      <button type="button" className="secondary" disabled={busy} onClick={() => saveCategory(category)}>{category ? `Save ${category} to my profile` : "Clear saved category"}</button>}
    {message && <p className={s.note} role="status">{message}</p>}
    <div className={s.sources}>{b.sources.map((source) => <a key={source.url} href={source.url} rel="noopener noreferrer" target="_blank">{source.label}{source.date && ` · ${source.date}`} ↗</a>)}</div>
  </section>;
}
