import { useEffect, useRef } from "react";
import styles from "./tutor.module.css";

export default function TutorBackdrop() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame;

    function draw(time) {
      context.clearRect(0, 0, width, height);
      const light = document.documentElement.dataset.theme === "light";
      context.fillStyle = light ? "#111111" : "#eeeeee";
      const wavelength = Math.min(width * .85, 720);
      const spacing = 8;
      const spread = height * .25;
      for (let x = 2; x < width; x += spacing) {
        const phase = (x / wavelength) * Math.PI * 2 - time;
        const crest = height * (.51 + .23 * Math.sin(phase));
        const firstRow = Math.max(0, Math.ceil((crest - spread - 2) / spacing));
        for (let y = firstRow * spacing + 2; y < Math.min(height, crest + spread); y += spacing) {
          const fade = 1 - Math.abs(y - crest) / spread;
          context.globalAlpha = fade ** 1.5 * (light ? .46 : .38);
          context.fillRect(x, y, 2, 2);
        }
      }
    }

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.scale(scale, scale);
      draw(0);
    }

    function animate(now) {
      draw(now / 3200);
      frame = window.requestAnimationFrame(animate);
    }

    function syncMotion() {
      window.cancelAnimationFrame(frame);
      if (reducedMotion.matches) draw(0);
      else frame = window.requestAnimationFrame(animate);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const themeObserver = new MutationObserver(() => {
      if (reducedMotion.matches) draw(0);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    syncMotion();
    reducedMotion.addEventListener("change", syncMotion);
    return () => {
      observer.disconnect();
      themeObserver.disconnect();
      window.cancelAnimationFrame(frame);
      reducedMotion.removeEventListener("change", syncMotion);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.tutorBackdrop} aria-hidden="true" />;
}
