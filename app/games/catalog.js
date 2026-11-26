export const games = [
  { id: "math-sprint", sample: "18 × 7 = ?", name: "Math Sprint", subject: "Maths", color: "orange", mark: "×",
    play: "Solve bite-size calculations.",
    trains: "Mental maths, percentages and fractions.",
    learn: "quantitative-aptitude" },
  { id: "pattern-rush", sample: "2 · 6 · 12 · ?", name: "Pattern Rush", subject: "Reasoning", color: "purple", mark: "…",
    play: "Spot the rule. Pick what comes next.",
    trains: "Pattern recognition for number and letter series.",
    learn: "reasoning" },
  { id: "logic-lab", sample: "A > B > C", name: "Logic Lab", subject: "Reasoning", color: "green", mark: "∴",
    play: "Solve a deduction in a few seconds.",
    trains: "Directions, ranking and syllogisms.",
    learn: "reasoning" },
  { id: "word-relay", sample: "brief ≈ ?", name: "Word Relay", subject: "English", color: "blue", mark: "Aa",
    play: "Pick the right word, spelling or phrase.",
    trains: "Vocabulary recall, grammar and spelling.",
    learn: "english-comprehension" },
  { id: "fact-match", sample: "Article 17 → ?", name: "Fact Match", subject: "General Awareness", color: "pink", mark: "?",
    play: "Match a clue to the fact.",
    trains: "Recall across polity, history, geography and science.",
    learn: "general-awareness" },
  { id: "computer-keys", sample: "Ctrl + Z", name: "Computer Keys", subject: "Computer", color: "cyan", mark: ">_",
    play: "Recognise the shortcut, term or command.",
    trains: "Computer basics, spreadsheets and shortcuts.",
    learn: "computer-knowledge" },
];

export const gameById = (id) => games.find((game) => game.id === id);

const core = ["Maths", "Reasoning", "English", "General Awareness"];
const examSubjects = {
  CGL: core,
  CHSL: core,
  CHT: ["English"],
  CPO: core,
  GD: core,
  JE: ["Reasoning", "General Awareness"],
  MTS: core,
  "Selection Post": core,
  Stenographer: ["Reasoning", "English", "General Awareness"],
  "DP Executive": ["Maths", "Reasoning", "General Awareness", "Computer"],
  "DP Driver": ["Maths", "Reasoning", "General Awareness"],
  "DP Ministerial": [...core, "Computer"],
  "DP AWO/TPO": ["Maths", "Reasoning", "General Awareness", "Computer"],
  "ASO LDCE": ["General Awareness"],
  "JSA/LDC LDCE": ["English", "General Awareness"],
  "SSA/UDC LDCE": ["English", "General Awareness"],
  "Steno C LDCE": ["English", "General Awareness"],
};

const examStages = {
  CGL: { "Tier I": core, "Tier II": [...core, "Computer"] },
  CHSL: { "Tier I": core, "Tier II": [...core, "Computer"] },
  CPO: { "Paper I": core, "Paper II": ["English"] },
  JE: { "Paper I": examSubjects.JE, "Paper II": [] },
  CHT: { "Paper I": ["English"], "Paper II": [] },
};

export function gamesFor(exam, stage) {
  if (!exam) return games;
  const subjects = examStages[exam]?.[stage]
    ?? (exam === "CGL" || exam === "CHSL" ? examStages[exam]["Tier II"] : examSubjects[exam])
    ?? [];
  return games.filter((game) => subjects.includes(game.subject));
}

export function arenaOptions(exams, scopes) {
  return exams.map(({ code, category }) => {
    const stages = new Set([
      ...Object.keys(examStages[code] ?? {}),
      ...scopes.filter((scope) => scope.exam === code).map((scope) => scope.stage),
    ]);
    return { code, category, stages: [...stages] };
  });
}

export function arenaQuery(exam, stage) {
  if (!exam) return "";
  const params = new URLSearchParams({ exam });
  if (stage) params.set("stage", stage);
  return "?" + params;
}

export function gameHref(game, exam, stage) {
  return `/games/${game.id}/${arenaQuery(exam, stage)}`;
}
