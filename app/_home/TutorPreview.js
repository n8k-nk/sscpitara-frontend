"use client";

import css from "../home.module.css";

function HeightDiagram() {
  return (
    <svg className={css.tutorDiagram} viewBox="0 0 280 168" role="img" aria-label="Right triangle: 20 metre base, 30 degree angle of elevation, height h">
      <line x1="36" y1="124" x2="228" y2="124" />
      <line x1="228" y1="124" x2="228" y2="20" />
      <line x1="36" y1="124" x2="228" y2="20" />
      <path d="M214 124 V110 H228" />
      <path d="M64 124 A 28 28 0 0 0 60.2 110" />
      <text x="68" y="118">30°</text>
      <text x="108" y="146">20 m</text>
      <text x="236" y="76">h</text>
    </svg>
  );
}

export default function TutorPreview() {
  return (
    <div className={css.tutorSample}>
      <header className={css.tutorBar}>
        <div>
          <span>History</span>
        </div>
        <strong>Height of a pole</strong>
        <span><i aria-hidden="true" /> Memory</span>
      </header>

      <div className={css.tutorThread}>
        <div className={css.tutorUser}>
          <p>From a point 20 m from a pole, the angle of elevation of the top is 30°. How tall is the pole?</p>
        </div>
        <div className={css.tutorAnswer}>
          <p>The 20 m is the adjacent side. The height is the opposite side.</p>
          <p>tan 30° = 1/√3, so height = 20 × 1/√3 = 20/√3 m, about 11.5 m.</p>
          <HeightDiagram />
        </div>
      </div>

      <div className={css.tutorAsk} aria-disabled="true">
        <input value="" readOnly tabIndex={-1} placeholder="Ask anything" aria-label="Message AI tutor" />
        <button type="button" disabled aria-label="Send message">↑</button>
      </div>
    </div>
  );
}
