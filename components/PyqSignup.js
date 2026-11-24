"use client";
import { useEffect, useRef, useState } from "react";
import Auth from "./Auth";

export const openSignup = () => window.dispatchEvent(new Event("pyq:signup"));

/** One sign-up / sign-in dialog per page. Any question opens it with openSignup(). */
export default function PyqSignup() {
  const ref = useRef(null);
  const [mode, setMode] = useState("signup");
  const [next, setNext] = useState("/pyq/");

  useEffect(() => {
    const open = () => {
      setNext(window.location.pathname + window.location.search);
      ref.current?.showModal();
    };
    window.addEventListener("pyq:signup", open);
    return () => window.removeEventListener("pyq:signup", open);
  }, []);

  const signup = mode === "signup";
  return <dialog ref={ref} className="pyq-dialog" aria-labelledby="pyq-dialog-title"
    onClick={(e) => { if (e.target === ref.current) ref.current.close(); }}>
    <div className="pyq-dialog-body">
      <button type="button" className="pyq-dialog-close ghost" aria-label="Close" onClick={() => ref.current.close()}>×</button>
      <h2 id="pyq-dialog-title">{signup ? "Sign up free to attempt" : "Sign in to attempt"}</h2>
      <p className="muted">{signup ? "Create a free account to unlock every previous year question, mark your answers and see what you got right." : "Welcome back. Pick up where you left off."}</p>
      <Auth key={mode} mode={mode} next={next} />
      <p className="auth-switch">{signup ? "Already have an account? " : "New here? "}
        <button type="button" className="link" onClick={() => setMode(signup ? "signin" : "signup")}>{signup ? "Sign in" : "Sign up"}</button></p>
    </div>
  </dialog>;
}
