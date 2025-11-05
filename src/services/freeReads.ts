const FREE_READS_KEY = "free_reads_count";
const FREE_READS_TS_KEY = "free_reads_ts";
const DEFAULT_LIMIT = 3; //cantidad de lecturas gratuitas
const PERIOD_MS = 24 * 60 * 60 * 1000; // 24 horas

function now() {
  return Date.now();
}

export function initFreeReads(limit: number = DEFAULT_LIMIT) {
  const ts = localStorage.getItem(FREE_READS_TS_KEY);
  const count = localStorage.getItem(FREE_READS_KEY);

  if (!ts || !count) {
    resetFreeReads(limit);
    return getRemaining();
  }

  const t = Number(ts);
  if (isNaN(t) || now() - t > PERIOD_MS) {
    resetFreeReads(limit);
  }

  return getRemaining();
}

export function getRemaining() {
  const raw = localStorage.getItem(FREE_READS_KEY);
  const n = raw ? Number(raw) : NaN;
  if (isNaN(n)) return DEFAULT_LIMIT;
  return Math.max(0, n);
}

export function resetFreeReads(limit: number = DEFAULT_LIMIT) {
  localStorage.setItem(FREE_READS_KEY, String(limit));
  localStorage.setItem(FREE_READS_TS_KEY, String(now()));
  // notify
  window.dispatchEvent(new CustomEvent('freeReadsUpdated'));
}

export function consumeFreeRead(): { allowed: boolean; remaining: number } {
  const tsRaw = localStorage.getItem(FREE_READS_TS_KEY);
  const countRaw = localStorage.getItem(FREE_READS_KEY);

  // ensure initialization
  if (!tsRaw || !countRaw) {
    initFreeReads();
  }

  const ts = Number(localStorage.getItem(FREE_READS_TS_KEY) || 0);
  if (isNaN(ts) || now() - ts > PERIOD_MS) {
    // reset window
    resetFreeReads();
  }

  let remaining = getRemaining();
  if (remaining <= 0) {
    // already exhausted
    window.dispatchEvent(new CustomEvent('freeReadsDepleted'));
    return { allowed: false, remaining: 0 };
  }

  remaining = Math.max(0, remaining - 1);
  localStorage.setItem(FREE_READS_KEY, String(remaining));

  window.dispatchEvent(new CustomEvent('freeReadsUpdated'));

  if (remaining === 0) {
    window.dispatchEvent(new CustomEvent('freeReadsDepleted'));
  }

  return { allowed: true, remaining };
}

export function forceShowDepleted() {
  window.dispatchEvent(new CustomEvent('freeReadsDepleted'));
}

export function forceDepletionOnLogout() {
  // Al cerrar sesión, reiniciar el contador para que tenga los 3 artículos disponibles
  resetFreeReads(DEFAULT_LIMIT);
  window.dispatchEvent(new CustomEvent('freeReadsUpdated'));
}

export default {
  initFreeReads,
  getRemaining,
  resetFreeReads,
  consumeFreeRead,
  forceShowDepleted,
  forceDepletionOnLogout,
};
