"use client";

import { useEffect, useRef, useState } from "react";
import s from "./HeroAnimation.module.css";

const scenes = [
  { label: "Learn", title: "Learn the distinction", detail: "Indian Polity · Fundamental rights", action: "Article 19 protects freedom of speech.", result: "Article 21 protects life and personal liberty.", duration: 5600 },
  { label: "PYQs", title: "Try a real question", detail: "SSC CGL 2026 · Tier I · Shift 2", action: "Where is the New Development Bank headquartered?", result: "Shanghai, China", duration: 6200 },
  { label: "AI Tutor", title: "Ask about a mistake", detail: "AI Tutor · Example conversation", action: "Why is it Shanghai and not Moscow?", result: "BRICS founded the bank. Shanghai hosts its headquarters.", duration: 6400 },
  { label: "Plan", title: "Know what to study next", detail: "Analytics · Example study plan", action: "Review international organisations", result: "Practise General Awareness PYQs", duration: 5600 },
];
const cycle = scenes.reduce((total, scene) => total + scene.duration, 0);

function Typed({ text, time, delay }) {
  const count = Math.max(0, Math.floor((time - delay) / 25));
  return <span className={s.typed}>
    <span className={s.measure}>{text}</span>
    <span className={s.ink}>{text.slice(0, count)}{time >= delay && count < text.length && <i />}</span>
  </span>;
}

function SceneCard({ item, moment = item.duration, progress = 1, playing = false, entrance = 1 }) {
  const typingReply = item.label === "AI Tutor";
  const question = item.label === "PYQs";
  const tapping = playing && question && moment >= 2550 && moment < 3300;
  const cursorOffset = Math.max(0, 1 - (moment - 2550) / 420);

  return (
    <div style={{ opacity: entrance, transform: `translateY(${(1 - entrance) * 9}px)` }}>
      <span className={s.label}>{item.label}</span>
      <h2>{item.title}</h2>
      <div className={s.sheet}>
        <small>{item.detail}</small>
        <p><Typed text={item.action} time={moment} delay={playing ? 260 : 0} /></p>
        {question && (
          <div className={s.option} data-wrong={progress > 0 || undefined}>
            B　Moscow, Russia
            {tapping && (
              <svg
                className={s.pointer}
                viewBox="0 0 18 22"
                style={{ transform: `translate(${cursorOffset * 18}px, ${cursorOffset * 12}px)` }}
              >
                <path d="M2 2v17l4-4 4 6 3-2-4-6h7Z" />
              </svg>
            )}
          </div>
        )}
        <div className={s.result} style={{ opacity: progress, transform: `translateY(${(1 - progress) * 8}px)` }}>
          {question && <b>✓ </b>}
          {typingReply && playing ? <Typed text={item.result} time={moment} delay={3100} /> : item.result}
        </div>
      </div>
    </div>
  );
}

export default function HeroAnimation() {
  const frame = useRef(null);
  const clock = useRef(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [onscreen, setOnscreen] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setPlaying(!motion.matches);
    const visibility = () => setVisible(!document.hidden);
    const observer = new IntersectionObserver(([entry]) => setOnscreen(entry.isIntersecting));
    observer.observe(frame.current);
    preference();
    visibility();
    motion.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    if (!playing || !onscreen || !visible) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      clock.current = (clock.current + now - previous) % cycle;
      previous = now;
      setTime(clock.current);
    }, 32);
    return () => window.clearInterval(timer);
  }, [onscreen, playing, visible]);

  let elapsed = time;
  const scene = scenes.find((item) => {
    if (elapsed < item.duration) return true;
    elapsed -= item.duration;
    return false;
  });
  const moment = playing ? elapsed : Math.max(elapsed, 3600);
  const progress = Math.min(1, Math.max(0, (moment - 3050) / 450));
  const entrance = Math.min(1, moment / 360, (scene.duration - moment) / 320);

  return <section ref={frame} className={s.frame} aria-label="SSC Pitara demo of Learn, past questions, AI Tutor, and study plans">
    <div className={s.bar}>
      <span>SSC Pitara</span>
      <button type="button" aria-label={playing ? "Pause demo" : "Play demo"} onClick={() => setPlaying(!playing)}>{playing ? "Pause" : "Play"}</button>
    </div>
    <div className={s.stage} aria-hidden="true" data-scene={scene.label}>
      {scenes.map((item) => (
        <div key={item.label} className={s.stageMeasure}>
          <SceneCard item={item} />
        </div>
      ))}
      <SceneCard item={scene} moment={moment} progress={progress} playing={playing} entrance={entrance} />
    </div>
    <nav className={s.tabs} aria-label="Demo scenes">{scenes.map((item, i) =>
      <button type="button" key={item.label} aria-current={item === scene ? "step" : undefined} onClick={() => {
        clock.current = scenes.slice(0, i).reduce((total, entry) => total + entry.duration, 0);
        setTime(clock.current);
        setPlaying(false);
      }}>{item.label}</button>)}</nav>
  </section>;
}
