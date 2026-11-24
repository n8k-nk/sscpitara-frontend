import Rich from "./Rich";
import { Mcq } from "./ArticleTools";

const DIFF = { easy: "Easy", medium: "Medium", exam: "Exam-style" };
const CALL = { tip: "Tip", warning: "Careful", remember: "Remember", exam: "In the exam" };

const steps = (list) => <ol className="solution">{list.map((s, i) => <li key={i}><Rich inline>{s}</Rich></li>)}</ol>;

/** One-line `$$..$$` is parsed as small inline maths; wrap it as real display maths so fractions are full size. */
const display = (latex) => `$$\n${latex.trim().replace(/^\$\$?/, "").replace(/\$\$?$/, "").trim()}\n$$`;

function Body({ b }) {
  switch (b.type) {
    case "text": return <div className="blk-text">{b.title && <h3><Rich inline>{b.title}</Rich></h3>}<Rich>{b.body}</Rich></div>;
    case "formula": return <div className="blk-card formula"><span className="tag">Formula</span><h3><Rich inline>{b.name}</Rich></h3>
      <div className="math-scroll"><Rich>{display(b.latex)}</Rich></div><p><Rich inline>{b.meaning}</Rich></p>
      {b.when_to_use && <p className="muted small"><strong>Use it when:</strong> <Rich inline>{b.when_to_use}</Rich></p>}</div>;
    case "steps": return <div className="blk-card method"><span className="tag">Method</span><h3><Rich inline>{b.title}</Rich></h3>
      <ol className="method-steps">{b.steps.map((s, i) => <li key={i}><span className="step-text"><Rich inline>{s}</Rich></span></li>)}</ol></div>;
    case "example": return <div className={`blk-card example diff-${b.difficulty}`}>
      <div className="blk-top"><span className="tag">Example</span><span className={`badge diff-${b.difficulty}`}>{DIFF[b.difficulty]}</span>{b.seconds && <span className="muted small">Target: {b.seconds} seconds</span>}</div>
      <div className="ex-prompt"><Rich>{b.prompt}</Rich></div>
      <details><summary>Show the solution, step by step</summary>{steps(b.solution_steps)}
        <p className="ex-answer"><strong>Answer:</strong> <Rich inline>{b.answer}</Rich></p>
        {b.why_it_works && <p className="muted"><strong>Why it works:</strong> <Rich inline>{b.why_it_works}</Rich></p>}
        {b.fast_method && <p className="fast"><strong>Faster:</strong> <Rich inline>{b.fast_method}</Rich></p>}</details></div>;
    case "shortcut": return <div className="blk-card shortcut"><span className="tag">Shortcut</span><h3><Rich inline>{b.title}</Rich></h3><Rich>{b.body}</Rich>
      <p className="small"><strong>Works when:</strong> <Rich inline>{b.works_when}</Rich></p>
      {b.fails_when && <p className="small"><strong>Does not work when:</strong> <Rich inline>{b.fails_when}</Rich></p>}</div>;
    case "mistake": return <div className="blk-card mistake"><span className="tag">Common mistake</span>
      <p className="wrong"><span>Wrong</span><span className="m-text"><Rich inline>{b.wrong}</Rich></span></p><p className="why"><Rich inline>{b.why}</Rich></p>
      <p className="right"><span>Right</span><span className="m-text"><Rich inline>{b.right}</Rich></span></p></div>;
    case "pattern": return <div className="blk-card pattern"><span className="tag">How SSC asks this</span><h3><Rich inline>{b.title}</Rich></h3><Rich>{b.body}</Rich></div>;
    case "callout": return <aside className={`callout-blk ${b.kind}`}><strong>{CALL[b.kind]}</strong><Rich>{b.body}</Rich></aside>;
    case "quick_check": return <Mcq kind="quick" label="Quick check" prompt={<Rich>{b.prompt}</Rich>} options={b.options.map((o, i) => <Rich inline key={i}>{o}</Rich>)}
      answer={b.answer} explanation={<Rich>{b.explanation}</Rich>} />;
    case "practice": return <Mcq kind="practice" label="Practice" difficulty={b.difficulty} prompt={<Rich>{b.prompt}</Rich>} options={b.options.map((o, i) => <Rich inline key={i}>{o}</Rich>)}
      answer={b.answer} explanation={steps(b.solution_steps)} />;
    default: return null;
  }
}

/** One block. `pace` drives Fast track in CSS; advanced blocks sit under a "Go deeper" disclosure. */
export function Block({ b }) {
  const pace = b.pace ?? "core";
  const inner = <div className={`blk blk-${b.type}`} data-pace={pace}><Body b={b} /></div>;
  return pace === "advanced" ? <details className="blk-deeper" data-pace="advanced"><summary>Go deeper</summary>{inner}</details> : inner;
}

/** A run of blocks; a heading precedes the first practice question of a section. */
export function Blocks({ blocks }) {
  let seenPractice = false, seenCheck = false;
  return blocks.map((b, i) => {
    const head = b.type === "practice" && !seenPractice ? <h3 className="blk-head" data-pace="core">Practice set</h3>
      : b.type === "quick_check" && !seenCheck ? <h3 className="blk-head" data-pace="foundation">Check yourself</h3> : null;
    if (b.type === "practice") seenPractice = true;
    if (b.type === "quick_check") seenCheck = true;
    return <div key={i}>{head}<Block b={b} /></div>;
  });
}
