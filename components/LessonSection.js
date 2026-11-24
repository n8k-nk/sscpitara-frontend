import Rich from "./Rich";

/** The written part of one subtopic. Everything is Markdown + LaTeX, rendered by Rich. */
export default function LessonSection({ section: s }) {
  const list = (items) => items.map((x, i) => <li key={i}><Rich inline>{x}</Rich></li>);
  return <div className="lesson-text">
    <Rich>{s.body}</Rich>
    {s.formulas.length > 0 && <><h4>Formulas</h4><ul>{list(s.formulas)}</ul></>}
    {s.shortcuts.length > 0 && <><h4>Shortcuts</h4><ul>{list(s.shortcuts)}</ul></>}
    {s.facts.length > 0 && <><h4>Key facts{s.time_sensitive && s.as_of ? ` (as of ${s.as_of})` : ""}</h4><ul>{list(s.facts)}</ul></>}
    {s.worked_examples.length > 0 && <><h4>Worked examples</h4>
      {s.worked_examples.map((e, i) => <div className="example" key={i}>
        <p><strong>Q{i + 1}.</strong> <Rich inline>{e.prompt}</Rich></p>
        <details><summary>Show solution</summary><Rich>{e.solution}</Rich><p><strong>Answer:</strong> <Rich inline>{String(e.answer)}</Rich></p>
          {e.pattern_note && <p className="muted">{e.pattern_note}</p>}</details></div>)}</>}
    {s.common_mistakes.length > 0 && <><h4>Common mistakes</h4><ul>{list(s.common_mistakes)}</ul></>}
  </div>;
}
