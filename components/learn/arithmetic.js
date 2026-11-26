/** Safe arithmetic for AI-described calculators: numbers, single-letter names, + - * / ^ ( ) and sqrt(). No eval. */
export function evaluate(expression, values) {
  const tokens = expression.match(/sqrt|\d+(?:\.\d+)?|[a-z]|[-+*/^()]|\S/g) ?? [];
  let i = 0;
  const take = (t) => { if (tokens[i] !== t) throw new Error("bad expression"); i++; };
  const sum = () => { let v = product(); while (tokens[i] === "+" || tokens[i] === "-") v = tokens[i++] === "+" ? v + product() : v - product(); return v; };
  const product = () => { let v = signed(); while (tokens[i] === "*" || tokens[i] === "/") v = tokens[i++] === "*" ? v * signed() : v / signed(); return v; };
  const signed = () => { if (tokens[i] === "-") { i++; return -signed(); } if (tokens[i] === "+") { i++; return signed(); } return power(); };
  const power = () => { const base = atom(); if (tokens[i] === "^") { i++; return base ** signed(); } return base; };
  const atom = () => {
    const t = tokens[i++];
    if (t === "(") { const v = sum(); take(")"); return v; }
    if (t === "sqrt") { take("("); const v = sum(); take(")"); return Math.sqrt(v); }
    if (/^\d/.test(t ?? "")) return Number(t);
    if (Object.hasOwn(values, t)) return Number(values[t]);
    throw new Error("bad expression");
  };
  const result = sum();
  if (i !== tokens.length) throw new Error("bad expression");
  return result;
}
