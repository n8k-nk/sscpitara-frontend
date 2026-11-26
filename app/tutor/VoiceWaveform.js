import { useEffect, useRef } from "react";
import styles from "./tutor.module.css";

const barCount = 20;

export default function VoiceWaveform({ active }) {
  const waveRef = useRef(null);

  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!active || !AudioContext || !navigator.mediaDevices?.getUserMedia) return;

    const bars = Array.from(waveRef.current.children);
    const levels = Array(barCount).fill(0);
    let context;
    let stream;
    let timer;
    let disposed = false;

    async function start() {
      try {
        context = new AudioContext();
        const resumed = context.resume().catch(() => {});
        const microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (disposed) {
          microphone.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = microphone;
        await resumed;
        if (disposed) return;

        const analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        context.createMediaStreamSource(stream).connect(analyser);
        const samples = new Float32Array(analyser.fftSize);
        timer = window.setInterval(() => {
          analyser.getFloatTimeDomainData(samples);
          const power = samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length;
          const level = Math.min(1, Math.sqrt(power) * 7);
          levels.shift();
          levels.push(level);
          bars.forEach((bar, index) => {
            bar.style.transform = `scaleY(${.1 + .9 * levels[index]})`;
          });
        }, 45);
      } catch {
        // The browser may support dictation without exposing a separate audio stream.
        release();
      }
    }

    function release() {
      window.clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
      if (context && context.state !== "closed") context.close().catch(() => {});
    }

    start();
    return () => {
      disposed = true;
      release();
    };
  }, [active]);

  return <div className={styles.voiceWaveform}>
    <span className="sr-only" role="status">{active ? "Voice typing active" : "Finishing voice typing"}</span>
    <div ref={waveRef} className={styles.voiceWaveBars} aria-hidden="true">
      {Array.from({ length: barCount }, (_, index) => <span key={index} />)}
    </div>
  </div>;
}
