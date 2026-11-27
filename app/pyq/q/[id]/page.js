import Link from "next/link";
import { notFound } from "next/navigation";
import PyqQuestion from "../../../../components/PyqQuestion";
import Rich from "../../../../components/Rich";
import { metadata as pageMetadata, site } from "../../../../lib/public";
import { getQuestion, paperLabel } from "../../../../lib/pyq";
import { Crumbs } from "../../_ui";

function plainSnippet(markdown, max = 72) {
  if (!markdown) return "";
  const cleaned = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#~]/g, "")
    .replace(/\$\$?([^$]+)\$\$?/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return {};
  const data = await getQuestion(id).catch(() => null);
  const q = data?.question;
  if (!q) return {};

  const paper = q.paper;
  const snippet = q.locked
    ? `SSC ${paper.exam} ${paper.year} ${q.subject} Q${q.number}`
    : plainSnippet(q.text, 68) || `SSC ${paper.exam} ${paper.year} Q${q.number}`;

  const page = pageMetadata(
    `${snippet} — SSC ${paper.exam} ${paper.year} PYQ`,
    q.locked
      ? `SSC ${paper.exam} ${paper.stage} (${paperLabel(paper)}) ${q.subject} question on ${q.topic}. Part of SSC Pitara Premium.`
      : `Practise this SSC ${paper.exam} ${paper.stage} (${paperLabel(paper)}) ${q.subject} question on ${q.topic}, with its answer.`,
    `/pyq/q/${q.id}/`,
  );
  // A locked question has nothing for a searcher to read.
  return q.locked ? { ...page, robots: { index: false, follow: true } } : page;
}

function buildQaJsonLd(q) {
  if (!q || q.locked) return null;
  const questionText = plainSnippet(q.text, 500);
  if (!questionText) return null;

  const correctOptions = (q.options || []).filter((o) => o.correct);
  let answerText = "";
  if (correctOptions.length > 0) {
    answerText = correctOptions
      .map((o) => `${o.label}. ${plainSnippet(o.text, 240)}`)
      .join("; ");
  } else if (q.answer?.number != null) {
    answerText = `${q.answer.number}${q.answer.unit ? ` ${q.answer.unit}` : ""}`;
  } else if (q.answer?.text) {
    answerText = plainSnippet(q.answer.text, 300);
  }

  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: plainSnippet(q.text, 120),
      text: questionText,
      answerCount: answerText ? 1 : 0,
      ...(answerText
        ? {
            acceptedAnswer: {
              "@type": "Answer",
              text: answerText,
              url: new URL(`/pyq/q/${q.id}/`, site).href,
            },
          }
        : {}),
    },
  };
}

export default async function SinglePyqPage({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const data = await getQuestion(id).catch(() => null);
  const q = data?.question;
  if (!q) notFound();

  const paper = q.paper;
  const year = String(paper.year);
  const paperHref = `/pyq/${paper.path}/`;
  const qaSchema = buildQaJsonLd(q);

  return (
    <>
      {qaSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(qaSchema) }}
        />
      )}
      <Crumbs
        trail={[
          { name: "PYQs", href: "/pyq/" },
          { name: `SSC ${paper.exam}`, href: `/pyq/${paper.exam_slug}/` },
          { name: year, href: `/pyq/${paper.exam_slug}/${year}/` },
          { name: `${paper.stage} ${paperLabel(paper)}`, href: paperHref },
          { name: `Q${q.number}`, href: `/pyq/q/${q.id}/` },
        ]}
      />
      <div className="page-head">
        <span className="eyebrow">
          SSC {paper.exam} {year} · {paper.stage} · {q.subject}
        </span>
        <h1>
          Question {q.number} — {q.topic}
        </h1>
        <p>
          Asked in {paperLabel(paper)}
          {paper.shift_time ? ` (${paper.shift_time})` : ""}.
        </p>
      </div>

      {q.locked ? (
        <PyqQuestion q={q} viewer={data.viewer} />
      ) : (
        <PyqQuestion
          q={q}
          viewer={data.viewer}
          stem={<Rich>{q.text}</Rich>}
          options={q.options.map((o) => (
            <Rich inline key={o.label}>
              {o.text}
            </Rich>
          ))}
          passage={
            q.passage ? (
              <div className="passage rich">
                <Rich>{q.passage.text}</Rich>
              </div>
            ) : null
          }
          solution={
            data.viewer === "premium" && q.explanation ? (
              <div className="rich">
                <Rich>{q.explanation}</Rich>
              </div>
            ) : null
          }
        />
      )}

      <nav className="actions" aria-label="Adjacent questions">
        {data.neighbors?.prev_id && (
          <Link className="button secondary" rel="prev" href={`/pyq/q/${data.neighbors.prev_id}/`}>
            ← Previous question
          </Link>
        )}
        <Link className="button secondary" href={paperHref}>
          View full paper
        </Link>
        {data.neighbors?.next_id && (
          <Link className="button secondary" rel="next" href={`/pyq/q/${data.neighbors.next_id}/`}>
            Next question →
          </Link>
        )}
      </nav>
    </>
  );
}
