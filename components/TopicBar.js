import Link from "next/link";

/** Breadcrumb and the Overview / Watch / Read switch shown on every topic page. */
export default function TopicBar({ base, stage, name, current, modes }) {
  const tabs = [["", "Overview"], ["watch/", "Watch"], ["read/", "Read"]];
  return <div className="topic-bar">
    <Link className="back" href={`/learn/?stage=${stage}`}>All topics</Link>
    <nav className="tabs" aria-label={`${name} sections`}>{tabs.map(([path, label]) =>
      <Link key={label} href={`${base}${path}`} className={current === label ? "tab on" : "tab"} aria-current={current === label ? "page" : undefined}>
        {label}{label === "Read" && modes && !modes.read.available ? " (soon)" : ""}</Link>)}</nav>
  </div>;
}
