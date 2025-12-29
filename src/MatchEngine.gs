function normalizeAmount_(v) {
  if (v === null || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^0-9.\-]/g, ""));
  return isFinite(n) ? Math.round(n * 100) / 100 : null;
}

function normalizeDate_(v) {
  if (!v) return null;
  if (v instanceof Date) return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function tokenize_(s) {
  if (!s) return [];
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function jaccard_(aTokens, bTokens) {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  if (!a.size && !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

function dateDistanceDays_(a, b) {
  if (!a || !b) return Infinity;
  const ms = Math.abs(a.getTime() - b.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Score a candidate match. Returns 0-100.
 */
function scoreMatch_(a, b) {
  const amountA = a.amount;
  const amountB = b.amount;
  const dateA = a.date;
  const dateB = b.date;

  // Amount score
  let amountScore = 0;
  if (amountA !== null && amountB !== null) {
    const diff = Math.abs(amountA - amountB);
    amountScore = diff <= CONFIG.RULES.AMOUNT_TOLERANCE ? 50 : Math.max(0, 50 - diff * 10);
  }

  // Date score
  const days = dateDistanceDays_(dateA, dateB);
  const dateScore =
    days <= CONFIG.RULES.MAX_DATE_DISTANCE_DAYS ? Math.max(0, 30 - days * 3) : 0;

  // Reference similarity score
  const refScore = Math.round(jaccard_(a.tokens, b.tokens) * 20);

  return amountScore + dateScore + refScore; // max 100
}

function matchRecords_(aRecords, bRecords) {
  // Index B by amount for speed (optional)
  const bByAmount = new Map();
  for (const b of bRecords) {
    const key = b.amount === null ? "null" : String(b.amount);
    if (!bByAmount.has(key)) bByAmount.set(key, []);
    bByAmount.get(key).push(b);
  }

  const matches = [];
  const usedB = new Set();

  for (const a of aRecords) {
    const key = a.amount === null ? "null" : String(a.amount);
    const candidates = (bByAmount.get(key) || bRecords).filter((b) => !usedB.has(b._idx));

    let best = null;
    for (const b of candidates) {
      const score = scoreMatch_(a, b);
      if (!best || score > best.score) best = { b, score };
    }

    if (best && best.score >= CONFIG.RULES.MIN_SCORE_TO_MATCH) {
      usedB.add(best.b._idx);
      matches.push({ a, b: best.b, score: best.score, status: "MATCHED" });
    } else {
      matches.push({ a, b: null, score: best ? best.score : 0, status: "NO_MATCH" });
    }
  }

  return matches;
}
