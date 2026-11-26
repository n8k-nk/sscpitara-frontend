"use client";

import { useMemo, useState } from "react";
import DOMPurify from "dompurify";
import Rich from "../../components/Rich";
import styles from "./tutor.module.css";

/**
 * Normalize LaTeX delimiters safely for remark-math + rehype-katex:
 * - Preserves fenced code blocks and inline code spans
 * - Converts \[...\] and \(...\) to $$...$$ and $...$
 * - Ensures all $$...$$ blocks sit on their own blank-lined blocks so remark-math
 *   never treats them as inline math errors that swallow subsequent Markdown headings/lists
 * - Escapes dangling unmatched $ / $$ (including mid-stream partial formulas) so KaTeX
 *   never turns the rest of a message red.
 */
export function normalizeMath(text, streaming = false) {
  if (!text || typeof text !== "string") return "";
  const segments = text.split(/(```[\s\S]*?```|`[^`\n]+`)/g);
  return segments
    .map((seg, idx) => {
      if (idx % 2 === 1) return seg;

      let out = seg
        .replace(/\\\[([\s\S]*?)\\\]/g, (_, expr) => `\n\n$$\n${expr.trim()}\n$$\n\n`)
        .replace(/\\\(([\s\S]*?)\\\)/g, (_, expr) => `$${expr.trim()}$`);

      // Place every closed $$...$$ display block cleanly on its own blank-lined block
      const mathBlocks = [];
      out = out.replace(/\$\$([\s\S]*?)\$\$/g, (_, expr) => {
        const token = `@@MATH_BLOCK_${mathBlocks.length}@@`;
        mathBlocks.push(`\n\n$$\n${expr.trim()}\n$$\n\n`);
        return token;
      });

      // Handle any leftover unclosed $$ (for example mid-stream before closing $$ arrives)
      if (out.includes("$$")) {
        out = out.replace(/\$\$/g, streaming ? "" : "\\$\\$");
      }

      // Per line/paragraph, ensure inline $...$ is balanced so a single unmatched $
      // (or partially streamed formula) never bleeds across headings or bullets
      out = out
        .split("\n")
        .map((line) => {
          const matches = [...line.matchAll(/(?<!\\)\$/g)];
          if (matches.length % 2 === 1) {
            const lastIdx = matches[matches.length - 1].index;
            return line.slice(0, lastIdx) + (streaming ? "" : "\\$") + line.slice(lastIdx + 1);
          }
          return line;
        })
        .join("\n");

      // Restore display math blocks
      out = out.replace(/@@MATH_BLOCK_(\d+)@@/g, (_, i) => mathBlocks[Number(i)]);
      return out;
    })
    .join("");
}

function normalizeLines(text) {
  return normalizeMath(text).replace(/([^\n])\n([^\n])/g, "$1  \n$2");
}

const PENDING_LABELS = {
  svg: "Drawing vector diagram...",
  xml: "Drawing vector diagram...",
  html: "Drawing vector diagram...",
  flashcards: "Creating flashcards...",
  notes: "Writing short revision notes...",
  quiz: "Building practice quiz...",
};

function splitStreamingTail(text, streaming) {
  if (!streaming || !text) return { complete: text, pendingLabel: "" };
  const fenceRe = /```([a-z0-9_-]*)/gi;
  let inFence = false;
  let openIndex = -1;
  let openKind = "";
  let m;
  while ((m = fenceRe.exec(text)) !== null) {
    if (!inFence) {
      inFence = true;
      openIndex = m.index;
      openKind = (m[1] || "").toLowerCase();
    } else {
      inFence = false;
      openIndex = -1;
      openKind = "";
    }
  }
  if (inFence && openIndex !== -1) {
    if (PENDING_LABELS[openKind] || text.slice(openIndex).includes("<svg")) {
      return {
        complete: text.slice(0, openIndex).trimEnd(),
        pendingLabel: PENDING_LABELS[openKind] || PENDING_LABELS.svg,
      };
    }
  }
  const lastOpenSvg = text.lastIndexOf("<svg");
  if (lastOpenSvg !== -1 && text.indexOf("</svg>", lastOpenSvg) === -1) {
    return {
      complete: text.slice(0, lastOpenSvg).trimEnd(),
      pendingLabel: PENDING_LABELS.svg,
    };
  }
  return { complete: text, pendingLabel: "" };
}

function parseBlocks(text) {
  if (!text) return [];
  const blocks = [];
  const fence = /```(flashcards|notes|quiz|svg|xml|html)?\s*\n([\s\S]*?)```|(<svg\b[\s\S]*?<\/svg>)/gi;
  let last = 0;
  let match;

  while ((match = fence.exec(text)) !== null) {
    if (match.index > last) {
      const before = text.slice(last, match.index).trim();
      if (before) blocks.push({ type: "prose", content: before });
    }

    if (match[3]) {
      blocks.push({ type: "svg", raw: match[3].trim() });
      last = match.index + match[0].length;
      continue;
    }

    const kind = (match[1] || "").toLowerCase();
    const payload = match[2].trim();

    if (kind === "svg" || ((kind === "xml" || kind === "html" || kind === "") && payload.includes("<svg"))) {
      const svgMatch = payload.match(/<svg\b[\s\S]*<\/svg>/i);
      if (svgMatch) {
        blocks.push({ type: "svg", raw: svgMatch[0] });
      } else {
        blocks.push({ type: "prose", content: match[0] });
      }
      last = match.index + match[0].length;
      continue;
    }

    if (kind !== "flashcards" && kind !== "notes" && kind !== "quiz") {
      blocks.push({ type: "prose", content: match[0] });
      last = match.index + match[0].length;
      continue;
    }

    let parsed = null;
    try {
      parsed = JSON.parse(payload);
    } catch {
      parsed = null;
    }

    const valid =
      parsed &&
      typeof parsed === "object" &&
      ((kind === "flashcards" && Array.isArray(parsed.cards) && parsed.cards.length > 0) ||
        (kind === "notes" && Array.isArray(parsed.sections) && parsed.sections.length > 0) ||
        (kind === "quiz" && Array.isArray(parsed.questions) && parsed.questions.length > 0));

    if (valid) {
      blocks.push({ type: kind, data: parsed });
    } else {
      blocks.push({ type: "prose", content: match[0] });
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    const rest = text.slice(last).trim();
    if (rest) blocks.push({ type: "prose", content: rest });
  }
  return blocks;
}

const SVG_PURIFY_CFG = {
  USE_PROFILES: { svg: true, svgFilters: true },
  ADD_ATTR: [
    "viewBox", "preserveAspectRatio", "transform", "rx", "ry",
    "markerWidth", "markerHeight", "refX", "refY", "orient",
    "stroke-dasharray", "dominant-baseline", "text-anchor",
    "font-family", "font-size", "font-weight", "role", "aria-label",
  ],
  FORBID_TAGS: ["script", "foreignObject", "iframe", "image", "a", "use"],
  FORBID_ATTR: ["onload", "onerror", "onclick", "onmouseover", "href", "xlink:href"],
};

function DiagramBlock({ raw }) {
  const safeSvg = useMemo(() => {
    if (typeof window === "undefined") return "";
    return DOMPurify.sanitize(raw, SVG_PURIFY_CFG);
  }, [raw]);

  const labelMatch = raw.match(/aria-label=["']([^"']+)["']/i);
  const caption = labelMatch ? labelMatch[1] : "";

  function downloadSvg() {
    if (!safeSvg) return;
    const blob = new Blob([safeSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!safeSvg) return null;

  return (
    <div className={styles.diagramCard}>
      <div className={styles.diagramHead}>
        <span className={styles.diagramCaption}>{caption || "Diagram"}</span>
        <button type="button" className={styles.widgetBtn} onClick={downloadSvg}>
          Download SVG
        </button>
      </div>
      <div
        className={styles.diagramCanvas}
        dangerouslySetInnerHTML={{ __html: safeSvg }}
      />
    </div>
  );
}

function FlashcardsDeck({ data }) {
  const cards = data.cards.filter((c) => c && (c.front || c.back));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [listMode, setListMode] = useState(false);
  const [known, setKnown] = useState(() => new Set());

  if (cards.length === 0) return null;
  const current = cards[Math.min(index, cards.length - 1)];
  const isKnown = known.has(index);
  const pct = Math.round(((index + 1) / cards.length) * 100);

  function go(nextIdx) {
    setFlipped(false);
    setIndex((nextIdx + cards.length) % cards.length);
  }

  function toggleKnown() {
    setKnown((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
    if (!isKnown && index < cards.length - 1) {
      setTimeout(() => go(index + 1), 180);
    }
  }

  function onCardKey(e) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setFlipped((f) => !f);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  }

  return (
    <div className={styles.deckWrap}>
      <div className={styles.deckHead}>
        <h3 className={styles.deckTitle}>{data.title || "Flashcards"}</h3>
        <div className={styles.widgetActions}>
          {known.size > 0 && (
            <span className={styles.deckProgress}>
              {known.size}/{cards.length} known
            </span>
          )}
          <button
            type="button"
            className={styles.widgetBtn}
            onClick={() => setListMode((v) => !v)}
          >
            {listMode ? "Deck view" : `All ${cards.length}`}
          </button>
        </div>
      </div>

      {listMode ? (
        <div className={styles.deckList}>
          {cards.map((c, i) => (
            <div className={styles.deckListRow} key={i}>
              <span className={styles.deckListNum}>{String(i + 1).padStart(2, "0")}</span>
              <div className={styles.deckListContent}>
                <div className={styles.deckListFront}><Rich>{normalizeLines(c.front)}</Rich></div>
                <div className={styles.deckListBack}><Rich>{normalizeLines(c.back)}</Rich></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className={styles.cardScene}>
            <div
              role="button"
              tabIndex={0}
              className={`${styles.cardInner} ${flipped ? styles.cardInnerFlipped : ""}`}
              onClick={() => setFlipped((f) => !f)}
              onKeyDown={onCardKey}
              aria-label={flipped ? "Answer side, click to show question" : "Question side, click to reveal answer"}
            >
              <div className={`${styles.cardFace} ${isKnown ? styles.cardFaceKnown : ""}`}>
                <div className={styles.cardProgressTrack}>
                  <div className={styles.cardProgressFill} style={{ width: `${pct}%` }} />
                </div>
                <div className={styles.cardMetaRow}>
                  <span className={styles.cardSideLabel}>Prompt</span>
                  <span className={styles.cardCounter}>{index + 1} / {cards.length}</span>
                </div>
                <div className={styles.cardCenterFront}>
                  <Rich>{normalizeLines(current.front)}</Rich>
                </div>
                <div className={styles.cardFlipHint}>Tap to flip</div>
              </div>

              <div className={`${styles.cardFace} ${styles.cardFaceBack} ${isKnown ? styles.cardFaceKnown : ""}`}>
                <div className={styles.cardProgressTrack}>
                  <div className={styles.cardProgressFill} style={{ width: `${pct}%` }} />
                </div>
                <div className={styles.cardMetaRow}>
                  <span className={styles.cardSideLabel}>Answer</span>
                  <span className={styles.cardCounter}>{index + 1} / {cards.length}</span>
                </div>
                <div className={styles.cardCenterBack}>
                  <Rich>{normalizeLines(current.back)}</Rich>
                </div>
                <div className={styles.cardFlipHint}>Tap to flip back</div>
              </div>
            </div>
          </div>

          <div className={styles.deckControls}>
            <button
              type="button"
              className={styles.deckNavBtn}
              onClick={() => go(index - 1)}
              aria-label="Previous card"
              title="Previous"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              className={`${styles.deckPill} ${isKnown ? styles.deckPillKnown : ""}`}
              onClick={toggleKnown}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {isKnown ? "Got it" : "Mark known"}
            </button>

            <button
              type="button"
              className={`${styles.deckPill} ${styles.deckPillPrimary}`}
              onClick={() => setFlipped((f) => !f)}
            >
              {flipped ? "Show prompt" : "Show answer"}
            </button>

            <button
              type="button"
              className={styles.deckNavBtn}
              onClick={() => go(index + 1)}
              aria-label="Next card"
              title="Next"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function NotesCard({ data }) {
  const sections = data.sections.filter((s) => s && s.heading);
  const [closed, setClosed] = useState(() => new Set());
  const [copied, setCopied] = useState(false);

  function toggleSection(idx) {
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  async function copyNotes() {
    const lines = [];
    if (data.title) lines.push(data.title, "");
    for (const s of sections) {
      lines.push(s.heading);
      for (const p of s.points || []) lines.push(`- ${p}`);
      lines.push("");
    }
    if (data.tip) lines.push(`Tip: ${data.tip}`);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  const allCollapsed = closed.size === sections.length;

  return (
    <div className={styles.widgetWrap}>
      <div className={styles.widgetHead}>
        <h3 className={styles.widgetTitle}>{data.title || "Revision notes"}</h3>
        <div className={styles.widgetActions}>
          <button
            type="button"
            className={styles.widgetBtn}
            onClick={() => setClosed(allCollapsed ? new Set() : new Set(sections.map((_, i) => i)))}
          >
            {allCollapsed ? "Expand all" : "Collapse all"}
          </button>
          <button type="button" className={styles.widgetBtn} onClick={copyNotes}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className={styles.notesSheet}>
        {sections.map((sec, idx) => {
          const isOpen = !closed.has(idx);
          return (
            <div key={idx} className={styles.noteSection}>
              <button
                type="button"
                className={styles.noteHead}
                onClick={() => toggleSection(idx)}
                aria-expanded={isOpen}
              >
                <span className={styles.noteHeading}><Rich inline>{normalizeMath(sec.heading)}</Rich></span>
                <span className={styles.noteChevron} aria-hidden="true">{isOpen ? "-" : "+"}</span>
              </button>
              {isOpen && Array.isArray(sec.points) && sec.points.length > 0 && (
                <ul className={styles.notePoints}>
                  {sec.points.map((pt, j) => (
                    <li key={j}><Rich inline>{normalizeMath(String(pt))}</Rich></li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {data.tip && (
        <div className={styles.noteTip}>
          <strong>Tip: </strong>
          <Rich inline>{normalizeMath(data.tip)}</Rich>
        </div>
      )}
    </div>
  );
}

function formatQuizStem(raw, index) {
  const text = normalizeMath(String(raw || "").trim());
  const match = text.match(/^(\d+)\.\s+([\s\S]+)$/);
  if (match && Number(match[1]) === index + 1) return match[2];
  return text;
}

function QuizWidget({ data }) {
  const questions = data.questions.filter((q) => q && q.q && Array.isArray(q.options));
  const [answers, setAnswers] = useState({});

  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.reduce(
    (acc, q, idx) => (answers[idx] === q.answer ? acc + 1 : acc),
    0
  );

  return (
    <div className={styles.widgetWrap}>
      {(data.title || answeredCount > 0) && (
        <div className={styles.widgetHead}>
          <h3 className={styles.widgetTitle}>{data.title || "Practice quiz"}</h3>
          {answeredCount > 0 && (
            <div className={styles.widgetActions}>
              <span className={styles.widgetCount}>{correctCount}/{questions.length}</span>
              <button type="button" className={styles.widgetBtn} onClick={() => setAnswers({})}>
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      <div className={styles.quizList}>
        {questions.map((q, qi) => {
          const chosen = answers[qi];
          const isAnswered = chosen !== undefined;
          const stemText = formatQuizStem(q.q, qi);
          return (
            <div key={qi} className={styles.quizItem}>
              <div className={styles.quizStem}>
                <span className={styles.quizNum}>{qi + 1}.</span>
                <div className={styles.quizQuestion}>
                  <Rich inline={!stemText.includes("\n\n")}>{stemText}</Rich>
                </div>
              </div>
              <div className={styles.quizOptions}>
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.answer;
                  const isChosen = oi === chosen;
                  let stateClass = "";
                  if (isAnswered) {
                    if (isCorrect) stateClass = styles.quizOptCorrect;
                    else if (isChosen) stateClass = styles.quizOptWrong;
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={isAnswered}
                      className={`${styles.quizOpt} ${stateClass}`}
                      onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                    >
                      <span className={styles.quizLetter}>{String.fromCharCode(65 + oi)}.</span>
                      <span className={styles.quizOptText}>
                        <Rich inline>{normalizeMath(String(opt))}</Rich>
                      </span>
                    </button>
                  );
                })}
              </div>
              {isAnswered && q.explain && (
                <div className={styles.quizExplain}>
                  <Rich>{normalizeMath(q.explain)}</Rich>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TutorMessage({ content, streaming = false }) {
  const { complete, pendingLabel } = splitStreamingTail(content, streaming);
  const blocks = parseBlocks(complete);

  return (
    <div className={styles.assistantBody}>
      {streaming && !content && (
        <div className={styles.thinking} aria-label="Loading">
          <span /><span /><span />
        </div>
      )}

      {blocks.map((block, idx) => {
        if (block.type === "svg") return <DiagramBlock key={idx} raw={block.raw} />;
        if (block.type === "flashcards") return <FlashcardsDeck key={idx} data={block.data} />;
        if (block.type === "notes") return <NotesCard key={idx} data={block.data} />;
        if (block.type === "quiz") return <QuizWidget key={idx} data={block.data} />;
        return (
          <div key={idx} className={styles.richText}>
            <Rich>{normalizeMath(block.content, streaming)}</Rich>
          </div>
        );
      })}

      {streaming && pendingLabel && (
        <div className={styles.pendingWidget}>
          <span>{pendingLabel}</span>
        </div>
      )}

      {streaming && content && !pendingLabel && (
        <span className={styles.streamCursor} aria-hidden="true" />
      )}
    </div>
  );
}

export function splitQuote(content) {
  if (!content || !content.startsWith("> ")) return { quote: "", body: content };
  const idx = content.indexOf("\n\n");
  if (idx === -1) return { quote: "", body: content };
  const quote = content.slice(2, idx).replace(/\n>\s?/g, "\n").trim();
  const body = content.slice(idx + 2).trim();
  if (!quote || !body) return { quote: "", body: content };
  return { quote, body };
}

export function TutorMessagesList({ messages, selectable = true }) {
  return messages.map((msg) =>
    msg.role === "user" ? (() => {
      const { quote, body } = splitQuote(msg.content);
      return (
        <div key={msg.id} className={styles.userRow}>
          <div className={styles.userBubble}>
            {quote && <div className={styles.userQuote}>{quote}</div>}
            <div>{body}</div>
          </div>
        </div>
      );
    })() : (
      <div
        key={msg.id}
        className={styles.assistantRow}
        data-assistant-msg={selectable ? "true" : undefined}
      >
        <TutorMessage
          content={msg.content}
          streaming={Boolean(msg.streaming)}
        />
      </div>
    )
  );
}
