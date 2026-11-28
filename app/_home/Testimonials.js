"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Arrow } from "../HomeQuestion";
import s from "./Testimonials.module.css";

const LEFT_COLUMN = [
  {
    name: "Aarav Sharma",
    role: "Income Tax Inspector",
    dept: "CBDT",
    tone: "blue",
    quote:
      "Mixed mocks alone can hide weak spots. Use topic-wise PYQs to see whether Percentage or Profit and Loss is costing you marks, then practise recent shifts on those topics.",
  },
  {
    name: "Sneha Verma",
    role: "Assistant Audit Officer (AAO)",
    dept: "CAG",
    tone: "emerald",
    quote:
      "AAO aspirants need Paper III Finance and Economics alongside Tier I. Keep lessons and topic-tagged PYQs in one place, and bring accounting and economics concepts back through spaced review.",
  },
  {
    name: "Rohan Deshmukh",
    role: "ASO (MEA)",
    dept: "MEA",
    tone: "amber",
    quote:
      "Small errors in English and Reasoning add up. Review each mistake, and ask AI Tutor for a first-step hint on cloze tests and syllogisms before reading the full solution.",
  },
  {
    name: "Ananya Iyer",
    role: "GST & Excise Inspector",
    dept: "CBIC",
    tone: "violet",
    quote:
      "Check where your time goes. If Geometry takes far longer than Mensuration, drill the slower chapter with chapter-wise CGL PYQs and speed games.",
  },
  {
    name: "Vivek Mishra",
    role: "Asst. Enforcement Officer",
    dept: "ED",
    tone: "blue",
    quote:
      "Long monthly PDFs are hard to remember. Spend a few minutes a day on short Hindi and English current affairs cards, and keep polity lessons in your review queue.",
  },
  {
    name: "Priya Nair",
    role: "ASO (CSS)",
    dept: "CSS",
    tone: "emerald",
    quote:
      "Studying around a job? Let the seven-day plan pick weak chapters and due reviews, so your limited time goes into studying instead of deciding what to study.",
  },
  {
    name: "Siddharth Kulkarni",
    role: "Preventive Officer",
    dept: "CBIC",
    tone: "amber",
    quote:
      "Don’t leave Tier II Computer Knowledge for the last week. Work through the available lessons and short drills alongside your Maths revision.",
  },
  {
    name: "Neha Choudhary",
    role: "Sub-Inspector",
    dept: "CBI",
    tone: "violet",
    quote:
      "First answers show where you really stand. Track them to see whether Trigonometry or Statement and Conclusion needs more work before your next mock.",
  },
  {
    name: "Harshvardhan Patel",
    role: "Divisional Accountant",
    dept: "CAG",
    tone: "blue",
    quote:
      "After a mock, trace lost marks to exact topics. Follow up with PYQs you haven’t seen on Number System or Time and Work while the mistakes are fresh.",
  },
  {
    name: "Tanvi Saxena",
    role: "Examiner",
    dept: "CBIC",
    tone: "emerald",
    quote:
      "The Data Entry test is easier to face when it feels familiar. Practise on the side-by-side typing screen with the timer running.",
  },
  {
    name: "Karthik Subramanian",
    role: "Junior Statistical Officer",
    dept: "MoSPI",
    tone: "amber",
    quote:
      "Paper II Statistics practice can be scattered. Bring Variance, Regression and Probability study together, and check which lessons and questions are available for each.",
  },
  {
    name: "Ritu Joshi",
    role: "ASO (AFHQ)",
    dept: "MoD",
    tone: "violet",
    quote:
      "Turn vocabulary into a short evening habit. Word games and revision of idioms, one-word substitutions and voice rules can sit alongside your PYQs.",
  },
  {
    name: "Manish Tiwari",
    role: "Inspector of Posts",
    dept: "DoP",
    tone: "blue",
    quote:
      "Stuck on Algebra or a Venn diagram? Ask AI Tutor for a hint on the missing step, try again, and only then compare the worked solution.",
  },
  {
    name: "Pooja Bansal",
    role: "Auditor",
    dept: "CAG",
    tone: "emerald",
    quote:
      "A low first mock can feel overwhelming. Start the Learn path from basic arithmetic and move to recent shift papers one step at a time.",
  },
  {
    name: "Aditya Narayan",
    role: "ASO (Railways)",
    dept: "MOR",
    tone: "amber",
    quote:
      "Question styles change between cycles. Include Reasoning and Decision Making PYQs from recent shifts so newer patterns don’t surprise you.",
  },
];

const RIGHT_COLUMN = [
  {
    name: "Divya Krishnan",
    role: "Income Tax Inspector",
    dept: "CBDT",
    tone: "emerald",
    quote:
      "Practise timed shift papers, then check time spent on wrong answers. It can show whether Data Interpretation tables are taking time from easier questions.",
  },
  {
    name: "Ankit Yadav",
    role: "Assistant Audit Officer (AAO)",
    dept: "CAG",
    tone: "blue",
    quote:
      "Large revision loads are easier in short sessions. Ask AI Tutor for revision notes or a quick quiz on fiscal policy and accounting basics, and verify them against your sources.",
  },
  {
    name: "Shreya Mukherjee",
    role: "ASO (MEA)",
    dept: "MEA",
    tone: "violet",
    quote:
      "For Tier II English, combine full mocks with sectional practice on para-jumbles and reading comprehension.",
  },
  {
    name: "Pranav Agarwal",
    role: "GST & Excise Inspector",
    dept: "CBIC",
    tone: "amber",
    quote:
      "Make Geometry visual. Ask for a diagram when a circle or similarity step isn’t clear, then practise related PYQs right after the lesson.",
  },
  {
    name: "Meenakshi Rao",
    role: "ASO (CSS)",
    dept: "CSS",
    tone: "blue",
    quote:
      "Open your plan, clear the reviews that are due and finish with a short set of PYQs. A simple routine is easier to repeat every day.",
  },
  {
    name: "Gaurav Chauhan",
    role: "Sub-Inspector",
    dept: "CBI",
    tone: "emerald",
    quote:
      "Look at penalty marks after every mock. If guesses in General Awareness are costing you, practise Polity and History PYQs and skip when you’re unsure.",
  },
  {
    name: "Kajal Rajput",
    role: "Preventive Officer",
    dept: "CBIC",
    tone: "violet",
    quote:
      "Read current affairs in Hindi or English, whichever is clearer to you, and practise Tier I and Tier II papers to build comfort with both.",
  },
  {
    name: "Nikhil Saini",
    role: "Asst. Enforcement Officer",
    dept: "ED",
    tone: "amber",
    quote:
      "A week after a mock, retry weak topics with fresh questions. It shows whether you learned the method or only remembered the answer.",
  },
  {
    name: "Kavya Menon",
    role: "Accountant",
    dept: "CGA",
    tone: "blue",
    quote:
      "Exam stamina takes practice. Sit full mocks with section timing so moving between Quant, Reasoning and English becomes familiar.",
  },
  {
    name: "Saurabh Pandey",
    role: "Divisional Accountant",
    dept: "CAG",
    tone: "emerald",
    quote:
      "Faster calculation helps every Quant question. Build up from tables and fractions to successive percentages with speed games.",
  },
  {
    name: "Bhavna Sethi",
    role: "Tax Assistant",
    dept: "CBDT",
    tone: "violet",
    quote:
      "Starting from zero in Arithmetic? Learn the basic idea first, then move to real previous year questions before trying shortcuts.",
  },
  {
    name: "Vikramaditya Roy",
    role: "Sr. Secretariat Assistant",
    dept: "CVC",
    tone: "amber",
    quote:
      "General Awareness fades quickly. Use spaced review to revisit constitutional amendments and Biology classifications before you forget them.",
  },
  {
    name: "Nisha Kashyap",
    role: "Auditor",
    dept: "CGDA",
    tone: "blue",
    quote:
      "Give Computer Knowledge a regular slot for DBMS, e-banking and shortcuts, so Tier II Paper I doesn’t depend on last-minute reading.",
  },
  {
    name: "Deepak Sinha",
    role: "Statistical Investigator",
    dept: "RGI",
    tone: "emerald",
    quote:
      "Build sectional tests from weak chapters such as 3D Mensuration or heights and distances, instead of repeating topics you already know.",
  },
  {
    name: "Aishwarya Thakur",
    role: "ASO (IB)",
    dept: "MHA",
    tone: "violet",
    quote:
      "Select any line in an AI Tutor reply and ask why it works. Clear the doubt while you’re on it instead of saving it for later.",
  },
];

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function TestimonialCard({ item, onOpen, clone = false }) {
  return (
    <article className={s.card} aria-hidden={clone || undefined}>
      <span className={s.quoteMark} aria-hidden="true">“</span>
      <p className={s.quoteText}>{item.quote}</p>
      <div className={s.cardActions}>
        <button
          type="button"
          className={s.readMoreBtn}
          onClick={() => onOpen(item)}
          tabIndex={clone ? -1 : undefined}
        >
          Read more
        </button>
      </div>
      <footer className={s.cardFoot}>
        <div className={s.author}>
          <span className={`${s.avatar} ${s[`tone_${item.tone}`]}`} aria-hidden="true">
            {initials(item.name)}
          </span>
          <div className={s.meta}>
            <strong>{item.name}</strong>
            <span>{item.role} · {item.dept}</span>
          </div>
        </div>
        <span className={s.deptBadge} title={item.dept}>{item.dept}</span>
      </footer>
    </article>
  );
}

export default function Testimonials() {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <div className={s.grid}>
      <div className={s.intro}>
        <span className={s.pill}>Testimonials</span>
        <h2 id="testimonials-title" className={s.heading}>
          Aiming for CGL.<br />Study with a plan.
        </h2>
        <p className={s.sub}>
          See how you could use PYQs, mock reports and spaced review for different target posts. These are examples, not user reviews.
        </p>
        <div className={s.ctaRow}>
          <Link href="/learn/" className={s.ctaBtn}>
            Start preparing <Arrow />
          </Link>
        </div>
      </div>

      <div className={s.marqueeViewport} aria-label="Study examples by target post">
        <div className={`${s.column} ${s.colUp}`}>
          <div className={s.track}>
            {LEFT_COLUMN.map((item) => (
              <TestimonialCard key={`l-a-${item.name}`} item={item} onOpen={setSelected} />
            ))}
            {LEFT_COLUMN.map((item) => (
              <TestimonialCard key={`l-b-${item.name}`} item={item} onOpen={setSelected} clone />
            ))}
          </div>
        </div>

        <div className={`${s.column} ${s.colDown}`}>
          <div className={s.track}>
            {RIGHT_COLUMN.map((item) => (
              <TestimonialCard key={`r-a-${item.name}`} item={item} onOpen={setSelected} />
            ))}
            {RIGHT_COLUMN.map((item) => (
              <TestimonialCard key={`r-b-${item.name}`} item={item} onOpen={setSelected} clone />
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className={s.modalBackdrop} onClick={() => setSelected(null)} role="presentation">
          <div
            className={s.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Study example for ${selected.name}`}
          >
            <div className={s.modalHead}>
              <div className={s.author}>
                <span className={`${s.avatar} ${s[`tone_${selected.tone}`]}`} aria-hidden="true">
                  {initials(selected.name)}
                </span>
                <div className={s.meta}>
                  <strong>{selected.name}</strong>
                  <span>{selected.role} · {selected.dept}</span>
                </div>
              </div>
              <button
                type="button"
                className={s.modalClose}
                onClick={() => setSelected(null)}
                aria-label="Close story"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className={s.modalQuote}>{selected.quote}</p>
          </div>
        </div>
      )}
    </div>
  );
}
