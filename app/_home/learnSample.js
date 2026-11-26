/** Static snapshot of the approved lesson and its saved companion.
 * Skill: quantitative-aptitude.trigonometry.degrees-radians-and-heights-distances
 * Taken from the local database on 26 November 2026.
 * Trigonometry is asked in about 3 of 4 CGL Tier I shifts here. Height and distance
 * is the slice public attempt write-ups mark as the least accurate.
 */

export const LEARN_SAMPLE = {
  subject: "Quantitative Aptitude",
  topic: "Trigonometry",
  title: "Degrees, radians and heights and distances",
  minutes: 14,
  questions: 85,
  href: "/learn/cgl/quantitative-aptitude/trigonometry/degrees-radians-and-heights-distances/",
  note: "Asked in about 3 of every 4 Tier I shifts in this archive.",
  steps: [
    {
      id: "idea",
      short: "Idea",
      title: "The goal and the idea",
      items: [
        { type: "goal", label: "Goal", text: "Convert degrees and radians with $\\pi$, and read a height from the opposite side of a right triangle." },
        { type: "concept", text: "$\\pi$ radians $= 180^{\\circ}$.\n\nTo convert degrees to radians, multiply by $\\frac{\\pi}{180}$.\n\nTo convert radians to degrees, multiply by $\\frac{180}{\\pi}$.\n\n- $30^{\\circ}$ is $\\frac{\\pi}{6}$\n- $45^{\\circ}$ is $\\frac{\\pi}{4}$\n- $60^{\\circ}$ is $\\frac{\\pi}{3}$\n- $90^{\\circ}$ is $\\frac{\\pi}{2}$\n\nA height-and-distance diagram is a right triangle. The angle of elevation is measured up from the horizontal. The angle of depression, from a higher point, is measured down from the horizontal, and it equals the angle of elevation from the lower point looking back, when the ground is horizontal.\n\nIf the distance along the ground to the object is $d$ and the angle of elevation of the top is $\\theta$, the height is $d \\tan \\theta$. If you are given the hypotenuse, the line of sight, use sine for the height instead." },
      ],
    },
    {
      id: "rule",
      short: "Rule",
      title: "See it",
      items: [
        { type: "formula", label: "Rule", text: "Radians = degrees $\\times \\frac{\\pi}{180}$.\n\nHeight = (ground distance) $\\times \\tan$(angle of elevation), on level ground." },
      ],
    },
    {
      id: "example",
      short: "Example",
      title: "Worked example",
      items: [
        { type: "worked_example", label: "Worked example", text: "From a point 10 m from the foot of a pole, the angle of elevation of the top is $45^{\\circ}$.\n\nHeight $= 10 \\times \\tan 45^{\\circ} = 10 \\times 1 = 10$ m.\n\nThe triangle is isosceles.\n\nAt $30^{\\circ}$, the height would be $\\frac{10}{\\sqrt{3}}$ m." },
      ],
    },
    {
      id: "check",
      short: "Check",
      title: "Check yourself",
      items: [
        {
          type: "checkpoint",
          prompt: "Convert $150^{\\circ}$ to radians.",
          answer: "$\\frac{5\\pi}{6}$",
          explanation: "$150 \\times \\frac{\\pi}{180} = \\frac{5\\pi}{6}$.",
        },
      ],
    },
    {
      id: "recall",
      short: "Recall",
      title: "Common mistake and quick recall",
      items: [
        { type: "common_mistake", label: "Common mistake", text: "Using sin where the given side is the adjacent side, which calls for tan." },
      ],
    },
    {
      id: "practice",
      short: "Practice",
      title: "Real exam questions",
      source: "SSC CGL 2026 · Tier I · 24 Oct 2026 · Shift 1 · Q53",
      sourceHref: "/pyq/cgl/2026/tier-i/24-oct-2026-shift-1/#q12593",
      prompt: "Convert $210^{\\circ}$ to radians.",
      options: ["$\\frac{7\\pi}{6}$", "$\\frac{5\\pi}{4}$", "$\\frac{11\\pi}{6}$", "$\\frac{3\\pi}{2}$"],
      answer: 0,
      explanation: "$210 \\times \\frac{\\pi}{180} = \\frac{7\\pi}{6}$.",
    },
  ],
  match: {
    title: "Match angles to radian values",
    how: "Match each degree measure with its correct radian equivalent.",
    pairs: [
      { left: "30°", right: "π/6 radians", why: "30 × (π / 180) = π / 6." },
      { left: "45°", right: "π/4 radians", why: "45 × (π / 180) = π / 4." },
      { left: "60°", right: "π/3 radians", why: "60 × (π / 180) = π / 3." },
      { left: "90°", right: "π/2 radians", why: "90 × (π / 180) = π / 2." },
      { left: "150°", right: "5π/6 radians", why: "150 × (π / 180) = 5π / 6." },
    ],
    rightOrder: [1, 2, 3, 4, 0],
  },
  notes: [
    { kind: "rule", tag: "Rule", title: "Degree to radian conversion", points: ["π radians = 180°.", "Degrees to radians: multiply degrees by π / 180.", "Radians to degrees: multiply radians by 180 / π."] },
    { kind: "fact", tag: "Remember", title: "Elevation and depression", points: ["Angle of elevation is measured upward from the horizontal.", "Angle of depression is measured downward from the horizontal.", "On level ground, angle of depression = alternate angle of elevation."] },
    { kind: "rule", tag: "Rule", title: "Height from ground distance", points: ["Height = ground distance × tan(θ).", "Use tan because height is opposite and ground distance is adjacent.", "If line of sight (hypotenuse) is given, use sin(θ) instead."] },
    { kind: "example", tag: "Example", title: "Worked height calculation", points: ["Distance from pole foot = 10 m, angle of elevation = 45°.", "Height = 10 × tan(45°) = 10 × 1 = 10 m.", "For 30°, height = 10 × tan(30°) = 10 / √3 m."] },
    { kind: "trick", tag: "Shortcut", title: "The 45° shortcut", points: ["Whenever the angle of elevation is 45°, tan(45°) = 1.", "Therefore, height = distance along level ground.", "The right-angled triangle is always isosceles."] },
    { kind: "trap", tag: "Trap", title: "Choosing sin vs tan", points: ["Do not use sin(θ) with ground distance.", "sin(θ) = opposite / hypotenuse (line of sight).", "tan(θ) = opposite / adjacent (ground distance)."] },
  ],
};
