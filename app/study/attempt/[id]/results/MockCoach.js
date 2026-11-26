"use client";

import { useState } from "react";
import { send } from "../../../../../lib/client";
import styles from "./report.module.css";

export default function MockCoach({ attempt }) {
  const [state, setState] = useState({});

  async function generate() {
    setState({ busy: true });
    const { ok, data } = await send(`study/attempts/${attempt}/coach`);
    setState(ok ? { text: data.text } : { error: data.error || "AI coaching is temporarily unavailable." });
  }

  if (state.text) return <details className={styles.coachTip} open>
    <summary>AI coaching</summary><p>{state.text}</p>
  </details>;
  return <div className={styles.coachTip}>
    <button className="secondary" type="button" onClick={generate} disabled={state.busy}>
      {state.busy ? "Reviewing your mock…" : "Get AI coaching"}
    </button>
    {state.error && <p className="errorlist" role="alert">{state.error}</p>}
  </div>;
}
