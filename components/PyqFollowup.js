import Link from "next/link";
import Start from "./Start";

export default function PyqFollowup({ plan }) {
  if (!plan) return null;
  const { topic, mock, answered, correct, missed, skipped, review, fresh, available } = plan;
  const result = `/study/attempt/${mock}/results/`;
  const count = review.length + fresh.length;
  let evidence = `You answered ${correct} of ${answered} correctly on this topic in your mock.`;
  if (answered === 0) evidence = `You skipped ${skipped} on this topic. Try it without the timer.`;
  else if (answered === 1) evidence = `You ${missed ? "missed" : "got right"} the one question you answered on this topic. A short set can give you a clearer picture.`;
  return <article className="task accent">
    <div>
      <span className="eyebrow">From your CGL Tier I mock</span>
      <h2>{topic}</h2><p>{evidence}</p>
      <p className="muted">{[review.length > 0 && `${review.length} to review`, fresh.length > 0 && `${fresh.length} fresh from other papers`].filter(Boolean).join(" · ")}
        {available > fresh.length && !plan.attempt && ` · ${available} fresh available`}</p>
      {plan.review_position && <Link href={`${result}?q=${plan.review_position}#q${plan.review_position}`}>Review a mock answer</Link>}
    </div>
    {plan.attempt ? <Link className="button" href={`/study/attempt/${plan.attempt}/${plan.finished ? "results/" : ""}`}>
      {plan.finished ? "See practice results" : "Resume practice"}</Link> :
      <Start followup={plan} label={`Practise ${count} PYQ${count === 1 ? "" : "s"}`} />}
  </article>;
}
