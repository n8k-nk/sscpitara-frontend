"use client";
import { useState } from "react";

const ROLE = { concept: "Lesson", shortcut: "Shortcuts", practice: "Practice", revision: "Revision" };
const LANG = { en: "English", hi: "Hindi", hinglish: "Hinglish" };

/** One subtopic's videos. Concept videos from different teachers are the choice; extras follow. Only the chosen video is loaded. */
export default function VideoPlayer({ videos, title }) {
  const [i, setI] = useState(0);
  if (!videos.length) return <p className="muted">No free video for this part yet. Use the reading below.</p>;
  const v = videos[i];
  const params = new URLSearchParams({ rel: "0", ...(v.start ? { start: v.start } : {}), ...(v.end ? { end: v.end } : {}) });
  const label = (x) => x.role === "concept" ? `${x.teacher}${x.language !== videos[0].language ? ` · ${LANG[x.language]}` : ""}` : `${ROLE[x.role]} · ${x.teacher}`;
  return <div className="player">
    {videos.length > 1 && <div className="tabs" role="tablist" aria-label={`Videos for ${title}`}>
      {videos.map((x, k) => <button key={`${x.video_id}-${x.start}`} type="button" role="tab" aria-selected={k === i}
        className={k === i ? "tab on" : "tab"} onClick={() => setI(k)}>{label(x)}</button>)}</div>}
    <iframe key={`${v.video_id}-${v.start}`} title={`${v.title || title} by ${v.teacher}`} loading="lazy" allowFullScreen
      src={`https://www.youtube-nocookie.com/embed/${v.video_id}?${params}`} />
    <p className="video-meta"><strong>{v.teacher}</strong>{v.channel && v.channel !== v.teacher ? ` · ${v.channel}` : ""} · {LANG[v.language]}
      {v.start ? " · Starts at a selected point" : ""}
      {" · "}<a href={`https://www.youtube.com/watch?v=${v.video_id}${v.start ? `&t=${v.start}s` : ""}`} target="_blank" rel="noopener noreferrer">Open on YouTube</a></p>
  </div>;
}
