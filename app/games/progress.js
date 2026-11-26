function keyFor(gameId) {
  return `ssc-arena:${gameId}:levels`;
}

function read(gameId) {
  try {
    const data = JSON.parse(localStorage.getItem(keyFor(gameId)) || "{}");
    return {
      cleared: data.cleared && typeof data.cleared === "object" ? data.cleared : {},
      best: data.best && typeof data.best === "object" ? data.best : {},
    };
  } catch {
    return { cleared: {}, best: {} };
  }
}

export function guestClears(gameId) {
  const { cleared } = read(gameId);
  const done = [];
  for (let level = 1; level <= 30; level += 1) {
    if (cleared[level] || cleared[String(level)]) done.push(level);
  }
  return done;
}

export function withGuestProgress(payload) {
  if (!payload?.levels || payload.authenticated) return payload;
  const stored = read(payload.game);
  const done = new Set(guestClears(payload.game));
  let current = payload.levels.length;
  const levels = payload.levels.map((level, index) => {
    const previous = payload.levels[index - 1];
    const startsPart = !previous || previous.band !== level.band;
    const best = stored.best[level.level] ?? stored.best[String(level.level)];
    let status = "locked";
    if (done.has(level.level)) status = "cleared";
    else if (startsPart || done.has(previous.level)) {
      status = "current";
      if (current === payload.levels.length) current = level.level;
    }
    return {
      ...level,
      status,
      bestCorrect: Number.isFinite(best?.correct) ? best.correct : null,
      bestScore: Number.isFinite(best?.score) ? best.score : null,
    };
  });
  return {
    ...payload,
    current,
    cleared: done.size,
    complete: done.size === payload.levels.length,
    levels,
  };
}

export function rememberGuestLevel(gameId, level, result, startsPart) {
  const stored = read(gameId);
  const key = String(level);
  const prev = stored.best[key] ?? {};
  stored.best[key] = {
    correct: Math.max(Number(prev.correct) || 0, result.correct || 0),
    score: Math.max(Number(prev.score) || 0, result.score || 0),
  };
  const previousCleared = Boolean(stored.cleared[String(level - 1)] || stored.cleared[level - 1]);
  if (result.passed && (startsPart || previousCleared)) stored.cleared[key] = true;
  localStorage.setItem(keyFor(gameId), JSON.stringify(stored));
  return guestClears(gameId);
}

export function nextPlayableLevel(levels, clearedLevel) {
  if (!levels) return clearedLevel < 30 ? { level: clearedLevel + 1 } : null;
  const cleared = levels.find((row) => row.level === clearedLevel);
  // Clearing this level opens its immediate successor in the same part.
  const forward = levels.find((row) => row.level > clearedLevel && (
    row.status === "current" ||
    (row.level === clearedLevel + 1 && row.status === "locked" && row.band === cleared?.band)
  ));
  return forward ?? levels.find((row) => row.level < clearedLevel && row.status === "current");
}

export function levelHref(mapHref, level) {
  const url = new URL(mapHref || "/games/math-sprint/", "http://local");
  url.searchParams.set("level", String(level));
  url.hash = "";
  return `${url.pathname}?${url.searchParams}`;
}
