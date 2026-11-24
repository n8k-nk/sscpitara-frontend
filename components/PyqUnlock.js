"use client";
import { openSignup } from "./PyqSignup";

export default function Unlock({ free, hidden }) {
  return <div className="pyq-unlock-bar" role="note">
    <span>You can open <strong>{free}</strong> questions without an account. <strong>{hidden}</strong> more {hidden === 1 ? "is" : "are"} locked.</span>
    <button type="button" onClick={openSignup}>Sign up free to unlock all</button>
  </div>;
}
