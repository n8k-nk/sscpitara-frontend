"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { send, updateCredits } from "../../lib/client";
import { TutorMessagesList } from "./TutorMessage";
import TutorBackdrop from "./TutorBackdrop";
import VoiceWaveform from "./VoiceWaveform";
import useVoiceTyping from "./useVoiceTyping";
import styles from "./tutor.module.css";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function csrfToken() {
  return document.cookie.split("; ").find((row) => row.startsWith("csrftoken="))?.split("=")[1] ?? "";
}

async function getJson(url) {
  const res = await fetch(url, { credentials: "same-origin", cache: "no-store" });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

const PROMPTS_CACHE_KEY = "sscpitara.tutor.prompts.v1";
const PROMPTS_CACHE_TTL_MS = 30 * 60 * 1000;

function readCachedPrompts() {
  try {
    const raw = window.sessionStorage.getItem(PROMPTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.prompts) || parsed.prompts.length < 3) return null;
    if (typeof parsed.ts !== "number" || Date.now() - parsed.ts > PROMPTS_CACHE_TTL_MS) return null;
    return parsed.prompts.slice(0, 3);
  } catch {
    return null;
  }
}

function writeCachedPrompts(prompts) {
  try {
    window.sessionStorage.setItem(PROMPTS_CACHE_KEY, JSON.stringify({ prompts, ts: Date.now() }));
  } catch {
    // ignore storage failures
  }
}

export default function TutorChat({ initialThread = null, userName }) {
  const [threadId, setThreadId] = useState(initialThread?.id ?? null);
  const [threadTitle, setThreadTitle] = useState(initialThread?.title || "");
  const [isShared, setIsShared] = useState(Boolean(initialThread?.is_shared));
  const [shareId, setShareId] = useState(initialThread?.share_id || "");
  const [messages, setMessages] = useState(
    Array.isArray(initialThread?.messages) ? initialThread.messages : []
  );
  const [input, setInput] = useState("");
  const {
    supported: voiceSupported, status: voiceStatus, error: voiceError, preview: voicePreview,
    toggle: toggleVoice, cancel: cancelVoice,
  } = useVoiceTyping(input, setInput);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [prompts, setPrompts] = useState([]);
  const [promptsLoading, setPromptsLoading] = useState(true);

  const [showMemory, setShowMemory] = useState(false);
  const [memory, setMemory] = useState("");
  const [memoryDraft, setMemoryDraft] = useState("");
  const [memoryUpdatedAt, setMemoryUpdatedAt] = useState(null);
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [memorySaving, setMemorySaving] = useState(false);
  const [memoryError, setMemoryError] = useState("");

  const [showShare, setShowShare] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState("");

  const [sheetState, setSheetState] = useState("closed");
  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [replyQuote, setReplyQuote] = useState("");
  const [selPopup, setSelPopup] = useState(null); // { text, top, left }

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const closeTimerRef = useRef(null);
  const copyTimerRef = useRef(null);
  const pollTimerRef = useRef(null);
  const abortRef = useRef(null);
  const activeRunRef = useRef(initialThread?.active_run?.run_id || null);
  const threadIdRef = useRef(initialThread?.id ?? null);
  const stoppingRef = useRef(false);

  useEffect(() => {
    threadIdRef.current = threadId;
  }, [threadId]);

  const setActiveRun = useCallback((rid) => {
    activeRunRef.current = rid || null;
  }, []);

  const syncUrl = useCallback((nextId, replace = false) => {
    if (typeof window === "undefined") return;
    const target = nextId ? `/tutor/${nextId}/` : "/tutor/";
    if (window.location.pathname === target) return;
    if (replace) window.history.replaceState({ threadId: nextId }, "", target);
    else window.history.pushState({ threadId: nextId }, "", target);
  }, []);

  const loadPrompts = useCallback(async () => {
    const cached = readCachedPrompts();
    if (cached) {
      setPrompts(cached);
      setPromptsLoading(false);
      return;
    }
    setPromptsLoading(true);
    const data = await getJson("/api/tutor/prompts/");
    const items = Array.isArray(data?.prompts) ? data.prompts.slice(0, 3) : [];
    setPrompts(items);
    if (items.length >= 3) writeCachedPrompts(items);
    setPromptsLoading(false);
  }, []);

  const loadMemory = useCallback(async () => {
    setMemoryLoading(true);
    const data = await getJson("/api/tutor/memory/");
    if (data && typeof data.content === "string") {
      setMemory(data.content);
      setMemoryDraft(data.content);
      setMemoryUpdatedAt(data.updated_at || null);
    }
    setMemoryLoading(false);
  }, []);

  const consumeStream = useCallback(async (res, aiMsgId, controller) => {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let pendingContent = "";

    const patchAssistant = (updater) => {
      setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? updater(m) : m)));
    };

    const flushAll = () => {
      if (!pendingContent) return;
      const cAdd = pendingContent;
      pendingContent = "";
      patchAssistant((m) => ({
        ...m,
        content: (m.content || "") + cAdd,
      }));
    };

    const drainer = setInterval(() => {
      if (!pendingContent) return;
      const n = Math.max(3, Math.ceil(pendingContent.length / 7));
      const cStep = pendingContent.slice(0, n);
      pendingContent = pendingContent.slice(n);
      patchAssistant((m) => ({
        ...m,
        content: (m.content || "") + cStep,
      }));
    }, 16);

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split(/\r?\n\r?\n/);
        buffer = parts.pop() || "";

        for (const chunk of parts) {
          const line = chunk.split(/\r?\n/).find((l) => l.startsWith("data:"));
          if (!line) continue;
          let ev;
          try {
            ev = JSON.parse(line.slice(5).trim());
          } catch {
            continue;
          }

          if (ev.type === "started") {
            if (ev.run_id) setActiveRun(ev.run_id);
            if (ev.thread_id) {
              setThreadId(ev.thread_id);
              if (ev.title) setThreadTitle(ev.title);
              if (typeof ev.is_shared === "boolean") setIsShared(ev.is_shared);
              if (ev.share_id !== undefined) setShareId(ev.share_id || "");
              syncUrl(ev.thread_id, true);
            }
          } else if (ev.type === "delta") {
            if (!stoppingRef.current) pendingContent += ev.text || "";
          } else if (ev.type === "stream_end") {
            flushAll();
            patchAssistant((m) => ({ ...m, streaming: false }));
          } else if (ev.type === "done") {
            flushAll();
            setActiveRun(null);
            if (ev.thread_id) {
              setThreadId(ev.thread_id);
              if (ev.title) {
                setThreadTitle(ev.title);
                setThreads((prev) => prev.map((thread) => thread.id === ev.thread_id
                  ? { ...thread, title: ev.title }
                  : thread));
              }
              if (typeof ev.is_shared === "boolean") setIsShared(ev.is_shared);
              if (ev.share_id !== undefined) setShareId(ev.share_id || "");
              syncUrl(ev.thread_id, true);
            }
            patchAssistant((m) => ({ ...m, streaming: false }));
            if (ev.memory_updated) loadMemory();
          } else if (ev.type === "cancelled") {
            flushAll();
            setActiveRun(null);
            setMessages((prev) =>
              prev
                .map((m) => (m.id === aiMsgId ? { ...m, streaming: false } : m))
                .filter((m) => !(m.id === aiMsgId && !m.content.trim()))
            );
          } else if (ev.type === "error") {
            flushAll();
            setActiveRun(null);
            setError(ev.error || "Something went wrong.");
            setMessages((prev) =>
              prev
                .map((m) => (m.id === aiMsgId ? { ...m, streaming: false } : m))
                .filter((m) => !(m.id === aiMsgId && !m.content.trim()))
            );
          }
        }
      }
    } finally {
      clearInterval(drainer);
      flushAll();
      if (abortRef.current === controller) abortRef.current = null;
      setActiveRun(null);
    }

    patchAssistant((m) => (m.streaming ? { ...m, streaming: false } : m));
  }, [loadMemory, setActiveRun, syncUrl]);

  const resumeActiveStream = useCallback(async (data) => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    const msgs = Array.isArray(data?.messages) ? data.messages : [];
    const last = msgs[msgs.length - 1];
    const runInfo = data?.active_run;
    if (!last || !last.streaming) {
      setLoading(false);
      setActiveRun(null);
      return;
    }

    stoppingRef.current = false;
    setLoading(true);
    if (runInfo?.run_id) {
      setActiveRun(runInfo.run_id);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(
          `/api/tutor/runs/${encodeURIComponent(runInfo.run_id)}/stream/?after=${runInfo.next_seq || 0}`,
          { credentials: "same-origin", signal: controller.signal, cache: "no-store" }
        );
        if (res.ok && res.body) {
          await consumeStream(res, last.id, controller);
          setLoading(false);
          return;
        }
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    // Fallback poll when run lives on another worker or finished right before attach
    const poll = async () => {
      const fresh = await getJson(`/api/tutor/threads/${data.id}/`);
      if (!fresh || !Array.isArray(fresh.messages)) {
        setLoading(false);
        return;
      }
      setMessages(fresh.messages);
      const tail = fresh.messages[fresh.messages.length - 1];
      if (tail?.streaming) {
        pollTimerRef.current = setTimeout(poll, 1200);
      } else {
        setThreadTitle(fresh.title || "");
        setLoading(false);
        setActiveRun(null);
      }
    };
    pollTimerRef.current = setTimeout(poll, 800);
  }, [consumeStream, setActiveRun]);

  useEffect(() => {
    loadPrompts();
    loadMemory();
    if (initialThread && (initialThread.active_run || initialThread.messages?.some((m) => m.streaming))) {
      resumeActiveStream(initialThread);
    }
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [loadPrompts, loadMemory]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onPopState = async () => {
      cancelVoice();
      if (abortRef.current) abortRef.current.abort();
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      setActiveRun(null);
      setLoading(false);
      const m = window.location.pathname.match(/^\/tutor\/([1-9]\d*)\/?$/);
      if (!m) {
        setThreadId(null);
        setThreadTitle("");
        setIsShared(false);
        setShareId("");
        setMessages([]);
        setShowShare(false);
        setError("");
        setReplyQuote("");
        return;
      }
      const nextId = Number(m[1]);
      const data = await getJson(`/api/tutor/threads/${nextId}/`);
      if (data && Array.isArray(data.messages)) {
        cancelVoice();
        setThreadId(data.id);
        setThreadTitle(data.title || "");
        setIsShared(Boolean(data.is_shared));
        setShareId(data.share_id || "");
        setMessages(data.messages);
        setShowShare(false);
        setError("");
        if (data.active_run || data.messages.some((msg) => msg.streaming)) {
          resumeActiveStream(data);
        }
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [cancelVoice, resumeActiveStream, setActiveRun]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: loading ? "auto" : "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const isEmptyStage = messages.length === 0 && !loading;
    const maxHeight = 200;
    const prev = el.style.height;
    el.style.transition = "none";
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, maxHeight);
    const next = `${nextHeight}px`;
    if (prev && prev !== next) {
      el.style.height = prev;
      el.getBoundingClientRect();
      el.style.transition = "";
    } else {
      el.style.transition = "";
    }
    el.style.height = next;
  }, [voicePreview, messages.length, loading, voiceStatus]);

  const openMemoryModal = useCallback(async () => {
    setMemoryError("");
    setShowMemory(true);
    await loadMemory();
  }, [loadMemory]);

  const closeMemoryModal = useCallback(() => {
    setShowMemory(false);
    setMemoryError("");
    setMemoryDraft(memory);
  }, [memory]);

  useEffect(() => {
    if (!showMemory) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeMemoryModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showMemory, closeMemoryModal]);

  const openShareModal = useCallback(() => {
    setShareError("");
    setShareCopied(false);
    setShowShare(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setShowShare(false);
    setShareError("");
  }, []);

  useEffect(() => {
    if (!showShare) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeShareModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showShare, closeShareModal]);

  const openHistory = useCallback(async () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setSheetState("opening");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setSheetState("open"));
    });
    setThreadsLoading(true);
    setEditingThreadId(null);
    const data = await getJson("/api/tutor/threads/");
    setThreads(Array.isArray(data?.threads) ? data.threads : []);
    setThreadsLoading(false);
  }, []);

  const closeHistory = useCallback(() => {
    if (sheetState === "closed" || sheetState === "closing") return;
    setEditingThreadId(null);
    setSheetState("closing");
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setSheetState("closed");
    }, 240);
  }, [sheetState]);

  useEffect(() => {
    if (sheetState !== "open") return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (editingThreadId !== null) setEditingThreadId(null);
        else closeHistory();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetState, editingThreadId, closeHistory]);

  const startRename = useCallback((e, t) => {
    e.stopPropagation();
    setEditingThreadId(t.id);
    setEditingTitle(t.title || "");
  }, []);

  const saveRename = useCallback(async (id) => {
    const clean = editingTitle.trim();
    if (!clean) return;
    const res = await send(`tutor/threads/${id}/rename`, { title: clean });
    if (res.ok) {
      setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, title: res.data.title } : t)));
      if (id === threadId) setThreadTitle(res.data.title);
      setEditingThreadId(null);
    }
  }, [editingTitle, threadId]);

  const selectThread = useCallback(async (id) => {
    cancelVoice();
    if (abortRef.current) abortRef.current.abort();
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    setActiveRun(null);
    closeHistory();
    setError("");
    setLoading(false);
    setReplyQuote("");
    setSelPopup(null);
    setShowShare(false);
    const data = await getJson(`/api/tutor/threads/${id}/`);
    if (data && Array.isArray(data.messages)) {
      cancelVoice();
      setThreadId(data.id);
      setThreadTitle(data.title || "");
      setIsShared(Boolean(data.is_shared));
      setShareId(data.share_id || "");
      setMessages(data.messages);
      syncUrl(data.id, false);
      if (data.active_run || data.messages.some((m) => m.streaming)) {
        resumeActiveStream(data);
      }
    }
  }, [cancelVoice, closeHistory, resumeActiveStream, setActiveRun, syncUrl]);

  const deleteThread = useCallback(async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Permanently delete this chat?")) return;
    if (id === threadId && abortRef.current) abortRef.current.abort();
    const res = await send("tutor/clear", { thread_id: id });
    if (res.ok) {
      setThreads((prev) => prev.filter((t) => t.id !== id));
      if (threadId === id) {
        cancelVoice();
        if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        setActiveRun(null);
        setLoading(false);
        setThreadId(null);
        setThreadTitle("");
        setIsShared(false);
        setShareId("");
        setMessages([]);
        setShowShare(false);
        setReplyQuote("");
        syncUrl(null, false);
        loadPrompts();
      }
    }
  }, [cancelVoice, threadId, loadPrompts, setActiveRun, syncUrl]);

  const startNewChat = useCallback(() => {
    cancelVoice();
    if (abortRef.current) abortRef.current.abort();
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    setActiveRun(null);
    setLoading(false);
    setThreadId(null);
    setThreadTitle("");
    setIsShared(false);
    setShareId("");
    setMessages([]);
    setShowShare(false);
    setError("");
    setReplyQuote("");
    setSelPopup(null);
    syncUrl(null, false);
    loadPrompts();
    textareaRef.current?.focus();
  }, [cancelVoice, loadPrompts, setActiveRun, syncUrl]);

  // Text selection inside AI tutor responses -> show floating "Ask tutor" button
  useEffect(() => {
    const updateSelectionPopup = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setSelPopup(null);
        return;
      }
      const raw = sel.toString().replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim();
      if (raw.length < 2) {
        setSelPopup(null);
        return;
      }
      const nodeToEl = (n) => (n?.nodeType === 1 ? n : n?.parentElement);
      const aEl = nodeToEl(sel.anchorNode);
      const fEl = nodeToEl(sel.focusNode);
      if (!aEl?.closest("[data-assistant-msg='true']") || !fEl?.closest("[data-assistant-msg='true']")) {
        setSelPopup(null);
        return;
      }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setSelPopup(null);
        return;
      }
      const left = Math.max(76, Math.min(window.innerWidth - 76, rect.left + rect.width / 2));
      const top = rect.top > 110 ? rect.top - 42 : rect.bottom + 8;
      setSelPopup({ text: raw.slice(0, 400), top, left });
    };

    const onKeyUp = (e) => {
      if (e.key === "Escape") setSelPopup(null);
      else updateSelectionPopup();
    };
    const onScroll = () => setSelPopup(null);

    document.addEventListener("mouseup", updateSelectionPopup);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onScroll);
    const area = messagesAreaRef.current;
    area?.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mouseup", updateSelectionPopup);
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onScroll);
      area?.removeEventListener("scroll", onScroll);
    };
  }, [messages.length]);

  const askSelectedText = useCallback(() => {
    if (!selPopup?.text) return;
    setReplyQuote(selPopup.text);
    setSelPopup(null);
    window.getSelection()?.removeAllRanges();
    textareaRef.current?.focus();
  }, [selPopup]);

  const stopGeneration = useCallback(() => {
    if (!loading) return;
    stoppingRef.current = true;
    const runId = activeRunRef.current;
    const tid = threadIdRef.current;
    setActiveRun(null);
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    if (abortRef.current) abortRef.current.abort();

    setMessages((prev) =>
      prev
        .map((m) => (m.streaming ? { ...m, streaming: false } : m))
        .filter((m) => !(m.role === "assistant" && !m.content.trim()))
    );
    setLoading(false);

    if (runId || tid) {
      send("tutor/chat/stop", { run_id: runId, thread_id: tid }, "POST", { keepalive: true });
    }
  }, [loading, setActiveRun]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading || voiceStatus) return;
    const activeQuote = text ? "" : replyQuote.trim();
    const displayContent = activeQuote
      ? activeQuote.split("\n").map((l) => `> ${l}`).join("\n") + `\n\n${msg}`
      : msg;

    const userMsgId = Date.now();
    const aiMsgId = userMsgId + 1;

    cancelVoice();
    stoppingRef.current = false;
    setInput("");
    setReplyQuote("");
    setSelPopup(null);
    setError("");
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: displayContent },
      { id: aiMsgId, role: "assistant", content: "", streaming: true },
    ]);
    setLoading(true);
    updateCredits({ delta: -1 });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!csrfToken()) {
        await fetch("/api/session/", { credentials: "same-origin" });
      }
      const payload = { message: msg };
      if (activeQuote) payload.quote = activeQuote;
      if (threadId) payload.thread_id = threadId;

      const res = await fetch("/api/tutor/chat/stream/", {
        method: "POST",
        credentials: "same-origin",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({}));
        updateCredits(typeof errData?.credits === "number" ? { credits: errData.credits } : { delta: 1 });
        const msgErr = res.status === 429
          ? "Rate limit reached for this hour. Try again later."
          : errData.error || "Something went wrong. Please try again.";
        setError(msgErr);
        setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
        setLoading(false);
        return;
      }

      await consumeStream(res, aiMsgId, controller);
    } catch (err) {
      if (err?.name !== "AbortError") {
        setError("Connection interrupted. Please try again.");
        setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, streaming: false } : m)));
      }
    } finally {
      setLoading(false);
    }
  }, [cancelVoice, consumeStream, input, loading, replyQuote, threadId, voiceStatus]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) sendMessage();
    }
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      setShareCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // clipboard blocked or unsupported
    }
  }

  async function toggleShare(shared) {
    if (!threadId || shareBusy) return;
    setShareBusy(true);
    setShareError("");
    const res = await send(`tutor/threads/${threadId}/share`, { shared });
    setShareBusy(false);
    if (!res.ok) {
      setShareError(res.data?.error || "Could not update sharing settings.");
      return;
    }
    const nextShared = Boolean(res.data?.is_shared);
    const nextShareId = res.data?.share_id || "";
    setIsShared(nextShared);
    setShareId(nextShareId);
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, is_shared: nextShared, share_id: nextShareId || null } : t))
    );
    if (nextShared && nextShareId && typeof window !== "undefined") {
      copyText(`${window.location.origin}/tutor/share/${nextShareId}/`);
    }
  }

  async function saveMemory(nextContent) {
    const value = nextContent !== undefined ? nextContent : memoryDraft;
    setMemorySaving(true);
    setMemoryError("");
    const res = await send("tutor/memory/update", { content: value });
    setMemorySaving(false);
    if (res.ok) {
      const saved = res.data?.content || "";
      setMemory(saved);
      setMemoryDraft(saved);
      setMemoryUpdatedAt(res.data?.updated_at || null);
      setShowMemory(false);
    } else {
      setMemoryError(res.data?.error || "Could not save memory.");
    }
  }

  const isEmpty = messages.length === 0 && !loading;
  const voiceLabel = voiceStatus ? "Stop voice typing" : "Start voice typing";

  const composer = (large) => (
    <div className={`${styles.composer} ${large ? styles.composerLarge : styles.composerCompact}`}>
      {!large && replyQuote && (
        <div className={styles.quotePreview}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 14 4 9 9 4" />
            <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
          </svg>
          <span className={styles.quotePreviewText}>{replyQuote}</span>
          <button
            type="button"
            className={styles.quoteDismiss}
            onClick={() => setReplyQuote("")}
            aria-label="Remove quoted text"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <div className={large ? styles.composerStack : styles.composerRow}>
        <textarea
          ref={textareaRef}
          value={voicePreview}
          readOnly={Boolean(voiceStatus)}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={loading ? "Generating response..." : replyQuote ? "Ask about this part" : "Ask anything"}
          rows={large ? 2 : 1}
          aria-label="Message AI tutor"
        />
        <div className={styles.composerFooter}>
          {voiceStatus && <VoiceWaveform active={voiceStatus === "listening"} />}
          {voiceSupported && !loading && (
            <button
              type="button"
              className={styles.voiceBtn}
              onClick={voiceStatus === "stopping" ? undefined : toggleVoice}
              aria-disabled={voiceStatus === "stopping" || undefined}
              data-active={voiceStatus ? "true" : undefined}
              aria-label={voiceLabel}
              title={voiceLabel}
            >
              {voiceStatus ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="6" width="12" height="12" rx="2.5" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <rect x="9" y="3" width="6" height="12" rx="3" />
                  <path d="M5 11v1a7 7 0 0 0 14 0v-1M12 19v3M9 22h6" />
                </svg>
              )}
            </button>
          )}
          {loading ? (
            <button
              type="button"
              className={`${styles.sendBtn} ${styles.stopBtn}`}
              onClick={stopGeneration}
              aria-label="Stop response"
              title="Stop"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2.5" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              className={styles.sendBtn}
              onClick={() => sendMessage()}
              disabled={!input.trim() || Boolean(voiceStatus)}
              aria-label="Send message"
              title="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <p className={styles.voiceStatus} role="status">
        {voiceError}
      </p>
    </div>
  );

  return (
    <div className={`tutor-root ${styles.chatPage}`}>
      <div className={`${styles.topBar} ${styles.chatTopBar}`}>
        <div className={styles.barGroup}>
          <button
            type="button"
            className={styles.barBtn}
            onClick={openHistory}
            aria-label="Open chat history"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l3 2" />
            </svg>
            History
          </button>
          {!isEmpty && (
            <button type="button" className={styles.barBtn} onClick={startNewChat}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New chat
            </button>
          )}
        </div>

        {threadTitle && !isEmpty && <span className={styles.barTitle} title={threadTitle}>{threadTitle}</span>}

        <div className={`${styles.barGroup} ${styles.barActions}`}>
          {threadId && !isEmpty && !loading && (
            <button
              type="button"
              className={`${styles.barBtn} ${showShare ? styles.barBtnActive : ""}`}
              onClick={openShareModal}
              aria-label="Share chat"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              {isShared && <span className={styles.shareDot} aria-hidden="true" />}
              Share
            </button>
          )}
          <button
            type="button"
            className={`${styles.barBtn} ${showMemory ? styles.barBtnActive : ""}`}
            onClick={openMemoryModal}
          >
            {memory.trim().length > 0 && <span className={styles.memoryDot} aria-hidden="true" />}
            Memory
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className={styles.emptyStage}>
          <TutorBackdrop />
          <h1 className={styles.headline}>{userName ? <>What’s next, <strong>{userName}</strong>?</> : "What’s next?"}</h1>
          {composer(true)}
          <div className={styles.promptRow}>
            {promptsLoading ? (
              <>
                <span className={styles.promptSkeleton} aria-hidden="true" />
                <span className={styles.promptSkeleton} aria-hidden="true" />
                <span className={styles.promptSkeleton} aria-hidden="true" />
              </>
            ) : (
              prompts.slice(0, 3).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={styles.promptChip}
                  disabled={Boolean(voiceStatus)}
                  onClick={() => sendMessage(p)}
                >
                  {p}
                </button>
              ))
            )}
          </div>
          {error && <p className={styles.errorLine} style={{ marginTop: "1rem" }}>{error}</p>}
        </div>
      ) : (
        <>
          <div ref={messagesAreaRef} className={styles.messagesArea}>
            <div className={styles.messagesInner}>
              <TutorMessagesList messages={messages} />
              {error && <p className={styles.errorLine}>{error}</p>}
              <div ref={bottomRef} />
            </div>
          </div>

          {selPopup && (
            <button
              type="button"
              className={styles.askFloatBtn}
              style={{ top: `${selPopup.top}px`, left: `${selPopup.left}px` }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={askSelectedText}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 14 4 9 9 4" />
                <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
              </svg>
              Ask tutor
            </button>
          )}

          <div className={styles.dockArea}>
            {composer(false)}
          </div>
        </>
      )}

      {showMemory && (
        <div className={styles.modalBackdrop} onClick={closeMemoryModal} role="presentation">
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Tutor memory"
          >
            <div className={styles.modalHead}>
              <h2>Memory</h2>
              <button
                type="button"
                className={styles.sheetClose}
                onClick={closeMemoryModal}
                aria-label="Close memory"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className={styles.modalSub}>
              Long-term preferences and context remembered across chats. You and the tutor can view or edit these.
            </p>
            <textarea
              className={styles.modalTextarea}
              value={memoryLoading && !memoryDraft ? "Loading..." : memoryDraft}
              onChange={(e) => setMemoryDraft(e.target.value)}
              disabled={memoryLoading && !memoryDraft}
              placeholder={"Nothing saved yet.\nExample:\n- Target exam: CGL 2026 Tier I\n- Focus: Geometry and idioms\n- Prefer short step by step answers"}
              maxLength={1500}
            />
            {memoryError && <p className={styles.errorLine}>{memoryError}</p>}
            <div className={styles.modalFooter}>
              <span className={styles.memoryMeta}>
                {memoryDraft.length}/1500
                {memoryUpdatedAt ? ` · Updated ${formatDate(memoryUpdatedAt)}` : ""}
              </span>
              {memoryDraft.trim().length > 0 && (
                <button
                  type="button"
                  className={`${styles.smallBtn} ${styles.smallBtnDanger}`}
                  onClick={() => saveMemory("")}
                  disabled={memorySaving}
                >
                  Clear
                </button>
              )}
              <button type="button" className={styles.smallBtn} onClick={closeMemoryModal}>
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.smallBtn} ${styles.smallBtnPrimary}`}
                onClick={() => saveMemory()}
                disabled={memorySaving || memoryLoading}
              >
                {memorySaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showShare && (
        <div className={styles.modalBackdrop} onClick={closeShareModal} role="presentation">
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Share chat"
          >
            <div className={styles.modalHead}>
              <h2>Share chat</h2>
              <button
                type="button"
                className={styles.sheetClose}
                onClick={closeShareModal}
                aria-label="Close share dialog"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className={styles.modalSub}>
              {isShared
                ? "Anyone with this link can view this conversation without signing in (read-only). Your profile and memory stay private."
                : `Create a read-only public link for "${threadTitle || "this chat"}". Anyone with the link can view it without signing in.`}
            </p>
            {isShared && shareId && (
              <div className={styles.shareUrlRow}>
                <input
                  type="text"
                  readOnly
                  className={styles.shareUrlInput}
                  value={typeof window !== "undefined" ? `${window.location.origin}/tutor/share/${shareId}/` : `/tutor/share/${shareId}/`}
                  onFocus={(e) => e.target.select()}
                  aria-label="Public share URL"
                />
              </div>
            )}
            {shareError && <p className={styles.errorLine}>{shareError}</p>}
            <div className={styles.modalFooter}>
              {isShared && shareId ? (
                <>
                  <button
                    type="button"
                    className={`${styles.smallBtn} ${styles.smallBtnDanger}`}
                    onClick={() => toggleShare(false)}
                    disabled={shareBusy}
                  >
                    Stop sharing
                  </button>
                  <span className={styles.shareSpacer} />
                  <a
                    href={`/tutor/share/${shareId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.shareCtaBtn}
                  >
                    Preview
                  </a>
                  <button
                    type="button"
                    className={`${styles.smallBtn} ${styles.smallBtnPrimary}`}
                    onClick={() =>
                      copyText(
                        typeof window !== "undefined"
                          ? `${window.location.origin}/tutor/share/${shareId}/`
                          : `/tutor/share/${shareId}/`
                      )
                    }
                  >
                    {shareCopied ? "Copied" : "Copy link"}
                  </button>
                </>
              ) : (
                <>
                  <span className={styles.shareSpacer} />
                  <button type="button" className={styles.smallBtn} onClick={closeShareModal}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`${styles.smallBtn} ${styles.smallBtnPrimary}`}
                    onClick={() => toggleShare(true)}
                    disabled={shareBusy}
                  >
                    {shareBusy ? "Creating..." : "Create public link"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {sheetState !== "closed" && (
        <div
          className={`${styles.sheetBackdrop} ${
            sheetState === "open" ? styles.sheetBackdropOpen : ""
          } ${sheetState === "closing" ? styles.sheetBackdropClosing : ""}`}
          onClick={closeHistory}
          role="presentation"
        >
          <div
            className={`${styles.sheet} ${
              sheetState === "open" ? styles.sheetOpen : ""
            } ${sheetState === "closing" ? styles.sheetClosing : ""}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Chat history"
          >
            <div className={styles.sheetHandle} />
            <div className={styles.sheetHead}>
              <h2>History</h2>
              <button
                type="button"
                className={styles.sheetClose}
                onClick={closeHistory}
                aria-label="Close history"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className={styles.sheetList}>
              {threadsLoading ? (
                <p className={styles.sheetEmpty}>Loading...</p>
              ) : threads.length === 0 ? (
                <p className={styles.sheetEmpty}>No past chats yet.</p>
              ) : (
                threads.map((t) => (
                  <div
                    key={t.id}
                    className={`${styles.threadRow} ${t.id === threadId ? styles.threadRowActive : ""}`}
                  >
                    {editingThreadId === t.id ? (
                      <form
                        className={styles.threadEditForm}
                        onSubmit={(e) => {
                          e.preventDefault();
                          saveRename(t.id);
                        }}
                      >
                        <input
                          type="text"
                          className={styles.threadEditInput}
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          maxLength={120}
                          autoFocus
                          aria-label="Rename chat title"
                        />
                        <button
                          type="submit"
                          className={styles.threadActionBtn}
                          aria-label="Save chat title"
                          title="Save"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={styles.threadActionBtn}
                          onClick={() => setEditingThreadId(null)}
                          aria-label="Cancel rename"
                          title="Cancel"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </form>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={styles.threadSelect}
                          onClick={() => selectThread(t.id)}
                        >
                          <span className={styles.threadTitle}>{t.title}</span>
                          <span className={styles.threadDate}>{formatDate(t.updated_at)}</span>
                        </button>
                        <button
                          type="button"
                          className={styles.threadActionBtn}
                          onClick={(e) => startRename(e, t)}
                          aria-label={`Rename ${t.title}`}
                          title="Rename"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={styles.threadDelete}
                          onClick={(e) => deleteThread(e, t.id)}
                          aria-label={`Delete ${t.title}`}
                          title="Delete"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
