import Rich from "../Rich";

export const KNOWN = ["percent-bars", "percentage-slider"]; // interaction components that exist; anything else is skipped, never shown as a placeholder
const SCREEN = { goal: 0, concept: 0, diagram: 1, formula: 1, worked_example: 2, interaction: 3, checkpoint: 4, common_mistake: 5, recall: 5, summary: 6 };
const TITLE = ["The goal and the idea", "See it", "Worked example", "Try it yourself", "Check yourself", "Common mistake and quick recall", "Wrap up and practise"];
const SHORT = ["Idea", "Rule", "Example", "Try", "Check", "Recall", "Wrap up"];
const LABEL = { goal: "Goal", common_mistake: "Common mistake", formula: "Rule", worked_example: "Worked example", summary: "Summary", recall: "Quick recall" };

/** Group a lesson's blocks into the guide's screens and render the text on the server. Empty screens are dropped. */
export function screensOf(blocks) {
  const out = {};
  for (const b of blocks) {
    if ((b.type === "interaction" || b.component) && b.component && !KNOWN.includes(b.component)) {
      if (b.type === "interaction") continue;
    }
    const i = SCREEN[b.type] ?? 1;
    const item = { type: b.type, label: LABEL[b.type] ?? null };
    if (b.type === "checkpoint" || b.type === "recall") {
      const d = b.data ?? {};
      Object.assign(item, { prompt: <Rich>{b.prompt}</Rich>, explanation: <Rich>{b.explanation ?? ""}</Rich>, answer: b.answer, options: b.options ?? null,
        optionNodes: (b.options ?? []).map((o, k) => <Rich inline key={k}>{o}</Rich>), hint: d.hint ? <Rich>{d.hint}</Rich> : null,
        simpler: d.simplerExample ? <Rich>{d.simplerExample}</Rich> : null, onSecondMiss: d.onSecondMiss ?? null, answerNode: <Rich inline>{b.answer}</Rich> });
    } else {
      Object.assign(item, { node: b.text ? <Rich>{b.text}</Rich> : null, component: KNOWN.includes(b.component) ? b.component : null, data: b.data ?? null });
    }
    (out[i] ??= { title: TITLE[i], short: SHORT[i], items: [] }).items.push(item);
  }
  return Object.keys(out).map(Number).sort((a, b) => a - b).map((k) => out[k]);
}
