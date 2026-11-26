import Link from "next/link";
import Overview from "../../../components/learn/Overview";
import { metadata as pageMetadata } from "../../../lib/public";
import { call } from "../../../lib/server";

export const metadata = pageMetadata("SSC CGL Tier I: learn, practise and revise", "Lessons for every Tier I skill, with the rule and a worked example, then real previous-year questions and spaced revision.", "/learn/cgl/");

export default async function Cgl() {
  const { data: d } = await call("learn/cgl");
  return <Overview d={d} here="/learn/cgl/" title="Learn" intro="The first two lessons are open with or without an account. Every other lesson is part of Premium.">
    <section><div className="grid two">
      <article className="card"><h3>Play to build speed</h3><p className="muted">Short games linked to skills. They build fluency and never count as your mock score.</p><Link className="button secondary" href="/games/">Open Games</Link></article>
      <article className="card"><h3>Practise real questions</h3><p className="muted">Browse previous year papers and practise by topic.</p><Link className="button secondary" href="/pyq/">Previous year questions</Link></article></div></section>
  </Overview>;
}
