export const BENEFITS = ["Exam matches from your education and age", "Free SSC CGL (Combined Graduate Level) diagnostic and practice", "Timed mocks with explanations", "Revision of the questions you missed"];

/** Two-column auth layout (card + benefits) or a single centred card. */
export default function AuthShell({ title, sub, children, aside, switchTo, icon }) {
  return <div className={`auth${aside ? "" : " single"}`}>
    <div className={`auth-card${icon ? " status-card" : ""}`}>
      {icon && <div className="icon" aria-hidden="true">{icon}</div>}
      <h1>{title}</h1>
      {sub && <p className="sub">{sub}</p>}
      {children}
      {switchTo && <p className="auth-switch">{switchTo}</p>}
    </div>
    {aside && <aside className="auth-aside">
      <h2>{aside}</h2>
      <p>Answer a few questions about your education and age. We’ll match you to SSC exams and build a daily study plan.</p>
      <ul className="checks">{BENEFITS.map((item) => <li key={item}>{item}</li>)}</ul>
    </aside>}
  </div>;
}
