const PATH = "/learn/cgl/general-awareness/polity/fundamental-rights-dpsp-and-duties/";
const SCREEN = { goal: 0, concept: 0, diagram: 1, formula: 1, worked_example: 2, interaction: 3, checkpoint: 4, common_mistake: 5, recall: 5, summary: 6 };
const TITLE = ["The goal and the idea", "See it", "Worked example", "Try it yourself", "Check yourself", "Common mistake and quick recall", "Wrap up and practise"];
const SHORT = ["Idea", "Rule", "Example", "Try", "Check", "Recall", "Wrap up"];
const NOTE = { rule: "Rule", example: "Example", trick: "Shortcut", trap: "Trap", fact: "Remember" };
const NOTE_KIND = { fact: "remember" };

function plain(text) {
  return String(text || "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

function sentences(text, max) {
  return plain(text).split(/(?<=\.)\s+/).map((line) => line.trim()).filter(Boolean).slice(0, max);
}

function screenBody(blocks) {
  const check = blocks.find((block) => block.type === "checkpoint" || block.type === "recall");
  if (check) return { prompt: plain(check.prompt), answer: plain(check.answer), lines: [] };
  const goal = blocks.find((block) => block.type === "goal");
  const formula = blocks.find((block) => block.type === "formula");
  const concept = blocks.find((block) => block.type === "concept");
  const example = blocks.find((block) => block.type === "worked_example");
  const mistake = blocks.find((block) => block.type === "common_mistake");
  if (formula && !goal) {
    return { lead: "", lines: formula.text.split(/\n+/).map(plain).filter(Boolean).slice(0, 4) };
  }
  if (goal) {
    const first = (concept?.text || "").split(/\n\n/)[0] || "";
    return { lead: plain(goal.text), lines: sentences(first, 3) };
  }
  const source = example || mistake;
  if (source?.text) {
    const [first, second] = source.text.split(/\n\n/);
    return { lead: plain(first), lines: second ? [plain(second)] : [] };
  }
  const text = blocks.map((block) => block.text).filter(Boolean).join("\n\n");
  return { lead: plain(text.split(/\n\n/)[0]).slice(0, 220), lines: [] };
}

function stepsFrom(blocks) {
  const groups = {};
  for (const block of blocks) {
    if (block.type === "interaction" && block.component && !["percent-bars", "percentage-slider"].includes(block.component)) continue;
    const index = SCREEN[block.type] ?? 1;
    (groups[index] ??= []).push(block);
  }
  return Object.keys(groups).map(Number).sort((a, b) => a - b).map((index) => ({
    short: SHORT[index] || "Step",
    title: TITLE[index] || "Lesson",
    ...screenBody(groups[index]),
  }));
}

function pickNotes(cards) {
  const list = Array.isArray(cards) ? cards : [];
  const chosen = [];
  for (const kind of ["rule", "fact", "trap"]) {
    const card = list.find((item) => item.kind === kind);
    if (card) chosen.push(card);
  }
  for (const card of list) {
    if (chosen.length >= 3) break;
    if (!chosen.includes(card)) chosen.push(card);
  }
  return chosen.slice(0, 3).map((card) => ({
    kind: NOTE_KIND[card.kind] || card.kind || "fact",
    label: NOTE[card.kind] || "Note",
    title: card.title,
    points: (card.points || []).slice(0, 1),
  }));
}

/** Compact Learn scene for the homepage tour, from the lesson and its saved companion. */
export function learnTour(skill, companion, href = PATH) {
  const blocks = skill?.lesson?.blocks;
  if (!Array.isArray(blocks) || blocks.length === 0) return null;
  const questions = skill.practice?.eligible || 0;
  const steps = stepsFrom(blocks);
  steps.push({
    short: "Practice",
    title: "Real exam questions",
    lead: questions
      ? `${questions} previous-year question${questions === 1 ? "" : "s"} on this skill.`
      : "Previous-year questions for this topic.",
    lines: [],
    prompt: "",
    answer: "",
  });
  return {
    eyebrow: `Learn / ${skill.topic || "Indian Polity"}`,
    title: skill.title,
    minutes: skill.lesson.estimatedMinutes,
    questions,
    href,
    steps,
    notes: pickNotes(companion?.spec?.flashcards),
  };
}
