import Rich from "./Rich";
import { Block } from "./ArticleBlocks";

const ORDER = { easy: 0, medium: 1, exam: 2 };
const Fold = ({ title, count, open, children, tone }) => children && (!Array.isArray(children) || children.length) ? <details className={`fold${tone ? ` ${tone}` : ""}`} open={open}>
  <summary><strong>{title}</strong>{count != null && <span className="fold-n">{count}</span>}</summary><div className="fold-body">{children}</div></details> : null;

/**
 * One part of an article, layered so the short version comes first:
 * the rule and method, one worked example, then everything else folded away.
 * Slow learners (and anyone just starting) get the from-zero explanation and quick checks open; revisers get shortcuts open.
 * `pyq` is the real-exam-question section, placed after the learning blocks.
 */
export default function PartView({ blocks, level, pyq }) {
  const starting = !level || level === "starting", revising = level === "revising";
  const deeper = blocks.filter((b) => b.pace === "advanced");
  const main = blocks.filter((b) => b.pace !== "advanced");
  const of = (t) => main.filter((b) => b.type === t);
  const zero = main.filter((b) => (b.type === "text" || b.type === "callout") && b.pace === "foundation");
  const rule = main.filter((b) => ["formula", "steps"].includes(b.type) || ((b.type === "text" || b.type === "callout") && b.pace !== "foundation"));
  const examples = of("example");
  const featured = examples.find((b) => b.difficulty === "medium") ?? examples.find((b) => b.difficulty !== "easy") ?? examples[0];
  const more = examples.filter((b) => b !== featured).sort((a, b) => ORDER[a.difficulty] - ORDER[b.difficulty]);
  const tips = main.filter((b) => b.type === "shortcut" || b.type === "pattern");
  const flat = (list) => list.map((b, i) => <Block key={i} b={{ ...b, pace: "core" }} />);
  return <div className="part-view">
    <Fold title="Explain it from zero" open={starting} tone="zero">{flat(zero)}</Fold>
    <section className="rule" aria-label="The rule and the method">{flat(rule)}</section>
    {featured && <section aria-label="Worked example"><h3 className="blk-head">Worked example</h3>{flat([featured])}</section>}
    <Fold title="Check yourself" count={`${of("quick_check").length} quick questions`} open={starting}>{flat(of("quick_check"))}</Fold>
    <Fold title="More examples" count={`${more.length}, easy to exam-style`}>{flat(more)}</Fold>
    <Fold title="Shortcuts and how SSC asks this" count={tips.length} open={revising}>{flat(tips)}</Fold>
    <Fold title="Common mistakes" count={of("mistake").length}>{flat(of("mistake"))}</Fold>
    {pyq}
    <Fold title="Extra practice" count={`${of("practice").length} questions`}>{flat(of("practice"))}</Fold>
    <Fold title="Go deeper" count={deeper.length}>{flat(deeper)}</Fold>
  </div>;
}
