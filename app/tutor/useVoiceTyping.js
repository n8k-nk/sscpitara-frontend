import { useCallback, useEffect, useRef, useState } from "react";

const errorMessages = {
  "not-allowed": "Allow microphone access in your browser to use voice typing.",
  "audio-capture": "No microphone is available. Check your microphone and try again.",
  "no-speech": "No speech was detected. Try again.",
};
const unavailable = "Voice typing is unavailable right now. Try again or type your message.";

function appendTranscript(draft, transcript) {
  if (!transcript) return draft;
  return `${draft}${draft && !/\s$/.test(draft) ? " " : ""}${transcript}`;
}

export default function useVoiceTyping(input, setInput) {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [interim, setInterim] = useState("");
  const sessionRef = useRef(null);

  const abort = useCallback(() => {
    const session = sessionRef.current;
    sessionRef.current = null;
    session?.abort();
  }, []);

  useEffect(() => {
    setSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    return abort;
  }, [abort]);

  const cancel = useCallback(() => {
    abort();
    setStatus("");
    setError("");
    setInterim("");
  }, [abort]);

  function toggle() {
    if (sessionRef.current) {
      setStatus("stopping");
      sessionRef.current.stop();
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setError("");
    try {
      const session = new Recognition();
      session.lang = navigator.language || "en-IN";
      session.continuous = true;
      session.interimResults = true;
      session.onresult = (event) => {
        if (sessionRef.current !== session) return;
        const finalized = [];
        const pending = [];
        for (let i = 0; i < event.results.length; i += 1) {
          const result = event.results[i];
          const text = result[0].transcript.trim();
          if (!text) continue;
          if (!result.isFinal) pending.push(text);
          else if (i >= event.resultIndex) finalized.push(text);
        }
        if (finalized.length) {
          setInput((draft) => appendTranscript(draft, finalized.join(" ")));
        }
        setInterim(pending.join(" "));
      };
      session.onerror = (event) => {
        if (sessionRef.current !== session) return;
        sessionRef.current = null;
        setInterim("");
        setStatus("");
        if (event.error !== "aborted") setError(errorMessages[event.error] || unavailable);
      };
      session.onend = () => {
        if (sessionRef.current !== session) return;
        sessionRef.current = null;
        setInterim("");
        setStatus("");
      };

      sessionRef.current = session;
      setStatus("listening");
      session.start();
    } catch {
      sessionRef.current = null;
      setStatus("");
      setError(unavailable);
    }
  }

  return { supported, status, error, preview: appendTranscript(input, interim), toggle, cancel };
}
