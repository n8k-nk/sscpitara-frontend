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
      "Repeating mixed mocks without fixing weak topics kept me stuck around 132 in Tier I. Switching to topic-wise PYQs here exposed that Percentage and Profit-Loss time traps cost me 14 marks alone. Practicing 2022 to 2026 shifts cleanly pushed my Tier I score past 166 and helped me land Income Tax Inspector.",
  },
  {
    name: "Sneha Verma",
    role: "Assistant Audit Officer (AAO)",
    dept: "CAG",
    tone: "emerald",
    quote:
      "AAO needed solid Paper III Finance and Economics prep alongside Tier I. Having structured draft lessons and topic-tagged PYQs in one workspace saved me hours of hunting PDFs. Revising accounting ratios and macro concepts every third day with spaced recall made Paper III feel straightforward on exam day.",
  },
  {
    name: "Rohan Deshmukh",
    role: "ASO (MEA)",
    dept: "MEA",
    tone: "amber",
    quote:
      "Targeting ASO in MEA leaves zero margin for silly errors in English and Reasoning. Using the mistake review and AI Tutor hints forced me to attempt the first step on Cloze tests and syllogisms instead of reading solutions blindly. My accuracy in Tier II English touched 95%.",
  },
  {
    name: "Ananya Iyer",
    role: "GST & Excise Inspector",
    dept: "CBIC",
    tone: "violet",
    quote:
      "The 15-minute sectional timing analytics showed I was spending nearly 2 minutes per Geometry question while leaving easier Mensuration marks on the table. Three weeks of Math Sprint drills and chapter-scoped CGL PYQs cut my Quant average time down enough to finish comfortably with review time left.",
  },
  {
    name: "Vivek Mishra",
    role: "Asst. Enforcement Officer",
    dept: "ED",
    tone: "blue",
    quote:
      "I used to read 40-page current affairs PDFs every month and forget half of them by Tier II. Five minutes a day flipping the concise Hindi-English cards plus static polity lessons kept Articles, Constitutional Bodies, and awards fresh all the way to final selection as AEO.",
  },
  {
    name: "Priya Nair",
    role: "ASO (CSS)",
    dept: "CSS",
    tone: "emerald",
    quote:
      "Working full-time left me barely 75 minutes on weekdays. The 7-day planner automatically picked my lowest-accuracy chapters and overdue reviews so I never wasted 20 minutes deciding what to study. That daily consistency took me straight into CSS ASO.",
  },
  {
    name: "Siddharth Kulkarni",
    role: "Preventive Officer",
    dept: "CBIC",
    tone: "amber",
    quote:
      "Tier II Computer Knowledge is an instant qualifier barrier many ignore until the final week. Doing the structured OSI layers, MS Excel shortcuts, and networking drills plus Computer Keys kept me way above the cutoff without eating into Maths revision.",
  },
  {
    name: "Neha Choudhary",
    role: "Sub-Inspector",
    dept: "CBI",
    tone: "violet",
    quote:
      "What stood out was first-attempt tracking. Other platforms count questions you re-solved after peeking at solutions. Only counting honest first answers showed where my Trigonometry and Statement-Conclusion logic actually stood, turning weak areas into scoring sections for CBI.",
  },
  {
    name: "Harshvardhan Patel",
    role: "Divisional Accountant",
    dept: "CAG",
    tone: "blue",
    quote:
      "Every post-mock summary mapped lost marks straight to exact topics and follow-up PYQs I had never seen before. Fixing Number System and Time & Work gaps right after each Sunday mock helped me move from Tax Assistant merit in my first attempt to Divisional Accountant.",
  },
  {
    name: "Tanvi Saxena",
    role: "Examiner",
    dept: "CBIC",
    tone: "emerald",
    quote:
      "Tier II Data Entry Speed Test used to make me anxious because my keystrokes dropped under countdown stress. Practising on the split-screen typing runner with matching speed telemetry built real composure and helped me clear Examiner comfortably.",
  },
  {
    name: "Karthik Subramanian",
    role: "Junior Statistical Officer",
    dept: "MoSPI",
    tone: "amber",
    quote:
      "Finding clean, verified Paper II Statistics practice outside scattered coaching notes is tough. Working through Variance, Regression, and Probability lessons alongside the eligible question bank gave me the exact clarity needed to qualify for JSO.",
  },
  {
    name: "Ritu Joshi",
    role: "ASO (AFHQ)",
    dept: "MoD",
    tone: "violet",
    quote:
      "Word Relay and idiom flashcards turned vocabulary revision into a quick night habit instead of boring rote lists. Idioms, OWS, and active-passive rules that used to cost me negative marks in Tier I became guaranteed 100% accuracy points.",
  },
  {
    name: "Manish Tiwari",
    role: "Inspector of Posts",
    dept: "DoP",
    tone: "blue",
    quote:
      "AI Tutor never spoon-fed final answers when I got stuck in Algebra or Venn diagrams; it nudged me with the exact theorem or substitution I missed and cited real PYQ patterns. Retaining methods learned that way lasted months longer.",
  },
  {
    name: "Pooja Bansal",
    role: "Auditor",
    dept: "CAG",
    tone: "emerald",
    quote:
      "After scoring below 110 in my first mock, I felt completely overwhelmed by the CGL syllabus. Following the Learn path step-by-step from foundation arithmetic to recent shift papers gave structure to every study hour until final merit.",
  },
  {
    name: "Aditya Narayan",
    role: "ASO (Railways)",
    dept: "MOR",
    tone: "amber",
    quote:
      "Reasoning Pattern Rush and Decision Making PYQs from the latest 2025-2026 shifts prepared me for the new Tier I/II twists that older books skipped completely. Zero surprises when sitting in the actual examination hall.",
  },
];

const RIGHT_COLUMN = [
  {
    name: "Divya Krishnan",
    role: "Income Tax Inspector",
    dept: "CBDT",
    tone: "emerald",
    quote:
      "Switching from random YouTube marathons to timed shift-wise PYQ mocks here changed my score trajectory completely. Checking exact viewing time per wrong answer showed I over-invested 3 minutes on tricky DI tables while rushing easy GS questions.",
  },
  {
    name: "Ankit Yadav",
    role: "Assistant Audit Officer (AAO)",
    dept: "CAG",
    tone: "blue",
    quote:
      "Paper III Finance & Economics plus Paper I Quant meant juggling massive revision volume. Using the AI Tutor's quick revision notes and Quiz widgets turned bulky fiscal policy and trial balance concepts into 5-minute active recall sessions.",
  },
  {
    name: "Shreya Mukherjee",
    role: "ASO (MEA)",
    dept: "MEA",
    tone: "violet",
    quote:
      "MEA required top rank in Tier II Paper I. Combining full-length CGL mocks with targeted sectional builders for Para-jumbles and Reading Comprehension pushed my overall percentile consistently into the top bracket.",
  },
  {
    name: "Pranav Agarwal",
    role: "GST & Excise Inspector",
    dept: "CBIC",
    tone: "amber",
    quote:
      "I struggled with Geometry circle tangents and similarity proofs for two attempts. Drawing clean step-by-step diagrams with the tutor and practising 2023-2026 PYQs right after each lesson finally clicked every theorem visually.",
  },
  {
    name: "Meenakshi Rao",
    role: "ASO (CSS)",
    dept: "CSS",
    tone: "blue",
    quote:
      "Clean, distraction-free interface with zero promotional clutter. Opening the platform meant opening Analytics, hitting Today's 3 focused study blocks, clearing due reviews, and closing with 10 real PYQs. CSS ASO felt earned step by step.",
  },
  {
    name: "Gaurav Chauhan",
    role: "Sub-Inspector",
    dept: "CBI",
    tone: "emerald",
    quote:
      "Penalty-mark breakdowns after every mock cured my habit of wild guessing in General Awareness. Once I stopped losing 6-8 net marks to avoidable negatives and strengthened Polity & History PYQs, my normalized rank jumped dramatically.",
  },
  {
    name: "Kajal Rajput",
    role: "Preventive Officer",
    dept: "CBIC",
    tone: "violet",
    quote:
      "Bilingual support in Current Affairs and AI explanations helped me bridge English comprehension speed while keeping General Awareness concepts sharp in Hindi. Practising 2024 Tier I & II papers side-by-side built huge confidence.",
  },
  {
    name: "Nikhil Saini",
    role: "Asst. Enforcement Officer",
    dept: "ED",
    tone: "amber",
    quote:
      "Re-attempting unseen fresh PYQs on my weak topics one week after a mock proved whether I had truly fixed the concept or just remembered the answer key. That feedback loop is what turned 280-level mocks into AEO selection.",
  },
  {
    name: "Kavya Menon",
    role: "Accountant",
    dept: "CGA",
    tone: "blue",
    quote:
      "Having 200 Tier I mocks, 35 Tier II mocks, and full official archive papers all following exact SSC block timing taught me real stamina. By exam day, switching cleanly from Quant to Reasoning to English felt completely automatic.",
  },
  {
    name: "Saurabh Pandey",
    role: "Divisional Accountant",
    dept: "CAG",
    tone: "emerald",
    quote:
      "Math Sprint levels starting from tables and fractions up to successive percentages doubled my mental calculation speed. Saving 10-12 minutes in Tier I Quant directly lifted my Reasoning and GS scores too.",
  },
  {
    name: "Bhavna Sethi",
    role: "Tax Assistant",
    dept: "CBDT",
    tone: "violet",
    quote:
      "As a first-time aspirant starting from zero in Arithmetic, the Learn foundation path never threw advanced shortcuts at me before explaining the core concept first. Each 15-minute lesson followed by real archive questions built steady momentum.",
  },
  {
    name: "Vikramaditya Roy",
    role: "Sr. Secretariat Assistant",
    dept: "CVC",
    tone: "amber",
    quote:
      "The 1-year spaced review reminders brought back tricky Constitutional Amendments and Biology classifications right before I would have forgotten them. General Awareness went from my scariest paper to a reliable score booster.",
  },
  {
    name: "Nisha Kashyap",
    role: "Auditor",
    dept: "CGDA",
    tone: "blue",
    quote:
      "Computer Knowledge modules covering DBMS, e-banking, and shortcuts in Tier II Paper I saved me when several candidates with higher Paper I scores missed the Computer sectional qualifying mark.",
  },
  {
    name: "Deepak Sinha",
    role: "Statistical Investigator",
    dept: "RGI",
    tone: "emerald",
    quote:
      "Building custom sectional tests only from my weak chapters (Mensuration 3D and Trigonometry heights) eliminated wasted hours on topics I already knew. Sharpest revision workflow I have used for CGL.",
  },
  {
    name: "Aishwarya Thakur",
    role: "ASO (IB)",
    dept: "MHA",
    tone: "violet",
    quote:
      "Selecting any line inside an AI Tutor solution with Ask Tutor to clarify why a step works felt like having a personal mentor beside me at midnight. Cleared every doubt immediately instead of piling up bookmarks.",
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
          Cleared CGL.<br />Stepping into top posts.
        </h2>
        <p className={s.sub}>
          Hear from aspirants who turned structured PYQs, mock diagnostics, and spaced review into selections across Income Tax, AAO, MEA, and CBIC.
        </p>
        <div className={s.ctaRow}>
          <Link href="/learn/" className={s.ctaBtn}>
            Start preparing <Arrow />
          </Link>
        </div>
      </div>

      <div className={s.marqueeViewport} aria-label="Selected SSC CGL candidate stories">
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
            aria-label={`Testimonial by ${selected.name}`}
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
