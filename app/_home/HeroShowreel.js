"use client";

import { useEffect, useRef, useState } from "react";
import s from "./HeroShowreel.module.css";

const scenes = [
  ["Opening", 2], ["Learn", 11], ["PYQs", 9], ["Mock test", 5], ["Analytics", 5],
  ["AI Tutor", 5], ["Games", 3], ["Current Affairs and News", 3], ["Close", 2],
];
const starts = scenes.map((_, i) => scenes.slice(0, i).reduce((sum, [, duration]) => sum + duration, 0));
const length = starts.at(-1) + scenes.at(-1)[1];
const clamp = (v) => Math.min(1, Math.max(0, v));

function Reveal({ at, t, children }) {
  const visible = clamp((t - at) * 5);
  return <div style={{ opacity: visible, transform: `translateY(${(1 - visible) * 5}px)` }}>{children}</div>;
}

function Opening() {
  return <div className={s.opening}><img src="/icon.svg" alt="" width="78" height="64" /><strong>One place for SSC prep</strong></div>;
}

function Grid({ close }) {
  return <div className={s.gridScene}><div className={s.grid}>{["Learn","PYQs","Practice","Analytics","AI Tutor","Games","Current Affairs","News"].map(name => <span key={name}>{name}</span>)}</div>{close && <strong>Start learning for free</strong>}</div>;
}

const LEARN_STEPS = ["Idea", "Rule", "Example", "Check", "Recall", "Practice"];
const LEARN_LINES = [
  "Learn one small idea at a time, not a wall of text.",
  "Part III rights, Part IV directive principles, Part IVA duties.",
  "Article 21 protects life and liberty — not speech.",
  "Article 21 protects what?",
  "Quick recall before it fades from memory.",
  "Real CGL questions on this exact skill.",
];

function LearnLevels({ t }) {
  const current = Math.min(LEARN_STEPS.length - 1, Math.floor(t * LEARN_STEPS.length));
  return <div className={s.learnCard}>
    <div className={s.pyqMeta}><span>Learn · General Awareness</span><span>14 min · Level {current + 1} of 6</span></div>
    <p className={s.learnTitle}>Fundamental rights, DPSP and duties</p>
    <ol className={s.levelPath} aria-label="Lesson steps, one level at a time">
      {LEARN_STEPS.map((step, i) => <li key={step} data-state={i < current ? "done" : i === current ? "current" : "locked"}>
        <span>{i < current ? "✓" : i + 1}</span><small>{step}</small>
      </li>)}
    </ol>
    <p className={s.learnLine}>{LEARN_LINES[current]}</p>
    <div className={s.featureTabs}>
      <span data-selected="true">🧩 Interactive activity</span>
      <span data-selected="true">📝 6 sticky notes</span>
    </div>
  </div>;
}

function Shot({ index, t }) {
  if (!index) return <Opening />;
  if (index === scenes.length - 1) return t >= .82 ? <Opening /> : <Grid close />;
  const hint = "Article 51 guides the State. Article 51A lists duties of citizens.";
  const doubt = "I keep mixing up 51 and 51A.";
  switch (scenes[index][0]) {
    case "Learn": return <LearnLevels t={t} />;
    case "PYQs": {
      const answered = t >= .24;
      return <div className={s.pyqCard}>
        <div className={s.pyqMeta}><span>SSC CGL 2026 · Tier I · 28 Oct · Shift 2</span><span>General Awareness</span></div>
        <p><strong>Q26.</strong> The New Development Bank (NDB), established by BRICS, has its headquarters in which city?</p>
        <ol className={s.pyqChoices}>
          {["New Delhi, India", "Moscow, Russia", "Shanghai, China", "Cape Town, South Africa"].map((choice, i) =>
            <li key={choice} data-result={answered ? { 1: "wrong", 2: "correct" }[i] : undefined}>
              <b>{"ABCD"[i]}</b><span>{choice}</span>{answered && i === 2 && <strong>✓ Correct</strong>}
            </li>)}
        </ol>
        <div className={s.pyqFollowup} style={{ visibility: answered ? "visible" : "hidden" }}>
          <div className={s.pyqVerdict}><span><strong>Not quite.</strong> The correct answer is C.</span><b>Try again</b></div>
          <div className={s.pyqSkill}>Learn this skill: Sports, awards and organisations →</div>
          <div className={s.pyqActions}><span>View explanation</span><span>Explain my mistake</span></div>
        </div>
      </div>;
    }
    case "Mock test": return <><small>Practice / PYQ paper mock　·　Premium</small><h3>{t < .4 ? "Timed mock" : "Where marks were lost"}</h3>{t < .4 ? <div className={s.card}><strong>{t < .2 ? "00:02" : "00:01"}</strong><p>Submit attempt</p></div> : <div className={s.card}><small>Sample report</small><p>General Awareness　·　1 incorrect</p><strong>0.50 penalty marks</strong><Reveal at={.62} t={t}><div className={s.featureTabs}><span data-selected="true">Get AI coaching</span><small>Premium</small></div></Reveal></div>}</>;
    case "Analytics": return <><small>Analytics / Sample activity</small><h3>What to do next</h3><svg className={s.chart} viewBox="0 0 300 52" preserveAspectRatio="none"><path d="M0 49H300" stroke="var(--lp-line)" /><path d="M3 42L50 32L98 37L148 17L198 24L248 12L297 7" fill="none" stroke="currentColor" strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1-clamp(t*2.8)} /></svg><b>Today</b><Reveal at={.27} t={t}>□　Review Indian Polity</Reveal><Reveal at={.45} t={t}>□　Practise General Awareness PYQs</Reveal></>;
    case "AI Tutor": return <><small>AI Tutor / Example conversation</small><h3>Get a first-step hint</h3><div className={s.card}>{doubt.slice(0,Math.ceil(clamp(t*9)*doubt.length))}</div><p>{hint.slice(0,Math.ceil(clamp((t-.14)*6)*hint.length))}</p></>;
    case "Games": return <><small>Games / Reasoning</small><div className={s.game}><img src="/arena-art/pattern-rush.webp" alt="" width="360" height="360" /><div><h3>Pattern Rush</h3><div className={s.series}>2 · 6 · 12 · {t < .35 ? "?" : "20"}</div><Reveal at={.35} t={t}><p>✓ Correct<br />+4, +6, +8</p></Reveal></div></div></>;
    default: return <><small>Daily Current Affairs / SSC Pitara News</small><h3>{t < .5 ? "Daily Current Affairs" : "SSC Pitara News"}</h3><div className={s.card} style={{transform:`translateX(${t < .5 ? -clamp((t-.40)*10)*100 : (1-clamp((t-.5)*10))*100}%)`,opacity:t < .5 ? 1-clamp((t-.4)*10) : clamp((t-.5)*10)}}>{t < .5 ? <><small>Government schemes</small><p>CIE manufacturing scheme outlay: ₹11,000 crore</p></> : <><small>News headline</small><p>Massive explosion at Bangkok oil depot</p></>}</div></>;
  }
}

export default function HeroShowreel() {
  const root = useRef(null);
  const clock = useRef(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [overview, setOverview] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(true);
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { setPlaying(!motion.matches); setOverview(motion.matches); };
    const tab = () => setActiveTab(!document.hidden);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(root.current); sync(); tab();
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", tab);
    return () => { observer.disconnect(); motion.removeEventListener("change",sync); document.removeEventListener("visibilitychange",tab); };
  }, []);
  useEffect(() => {
    if (!playing || !visible || !activeTab) return;
    let previous = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      clock.current = (clock.current + (now-previous)/1000) % length;
      previous = now;
      setTime(clock.current);
    }, 50);
    return () => clearInterval(timer);
  }, [playing,visible,activeTab]);
  const index = starts.findLastIndex(start => start <= time);
  const t = (time-starts[index])/scenes[index][1];
  function jump(i) {
    setPlaying(false); setOverview(false);
    clock.current = starts[i] + scenes[i][1] * .77;
    setTime(clock.current);
  }
  const opening = !overview && (index === 0 || (index === scenes.length - 1 && t >= .82));
  return <section className={s.frame} ref={root} aria-label="SSC Pitara tour of Learn, PYQs, mock tests, Analytics, AI Tutor, Games, Current Affairs and News">
    <div className={s.header}><strong>SSC Pitara</strong><span>Product tour</span><button type="button" onClick={()=>{setOverview(false);setPlaying(!playing);}}>{playing ? "Pause" : "Play"}</button></div>
    <div className={s.stage} aria-hidden="true">{overview ? <Grid /> : <Shot index={index} t={t} />}</div>
    <nav className={s.segments} aria-label="Tour scenes">{scenes.map(([name],i)=><button type="button" key={name} aria-label={name} title={name} aria-current={!overview && (opening ? i===0 : i===index) ? "step" : undefined} onClick={()=>jump(i)}><i /></button>)}</nav>
  </section>;
}
