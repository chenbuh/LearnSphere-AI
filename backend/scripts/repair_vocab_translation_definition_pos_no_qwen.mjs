#!/usr/bin/env node

import mysql from "mysql2/promise";

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "chen20040209";
const DB_NAME = process.env.DB_NAME || "learnsphere_ai";

const CONCURRENCY = Number(process.env.CONCURRENCY || 10);
const MAX_ITEMS = Number(process.env.MAX_ITEMS || 0); // 0 = all candidates
const MAX_RETRIES = Number(process.env.MAX_RETRIES || 2);

const POS_RE = /(^|[^a-z])(n\.|v\.|vi\.|vt\.|adj\.|adv\.|prep\.|conj\.|pron\.|num\.|int\.|aux\.|det\.|modal\.)/i;
const POS_TOKEN_RE =
  /(^|[\s,;，；()（）\[\]{}])(?<pos>vi|vt|adj|adv|prep|conj|pron|num|int|aux|det|modal|art|noun|verb|adjective|adverb|n|v|a|ad)\s*\./gi;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(v) {
  return String(v || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function limit(s, max) {
  const t = cleanText(s);
  if (t.length <= max) return t;
  return t.slice(0, max);
}

function hasPos(text) {
  return POS_RE.test(String(text || ""));
}

function hasEnglish(text) {
  return /[A-Za-z]/.test(String(text || ""));
}

function hasChinese(text) {
  return /[\u4e00-\u9fff]/.test(String(text || ""));
}

function normalizeWord(word) {
  return String(word || "")
    .trim()
    .toLowerCase()
    .replace(/[\s.'"]/g, "");
}

function normalizePos(raw) {
  const x = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/\./g, "");
  const map = {
    n: "n.",
    noun: "n.",
    v: "v.",
    verb: "v.",
    vt: "vt.",
    vi: "vi.",
    a: "adj.",
    adj: "adj.",
    adjective: "adj.",
    ad: "adv.",
    adv: "adv.",
    adverb: "adv.",
    prep: "prep.",
    preposition: "prep.",
    conj: "conj.",
    pron: "pron.",
    num: "num.",
    int: "int.",
    aux: "aux.",
    det: "det.",
    art: "det.",
    article: "det.",
    modal: "modal.",
  };
  return map[x] || "";
}

function parseTagPos(tags) {
  try {
    const obj = JSON.parse(String(tags || ""));
    const p = normalizePos(obj?.partOfSpeech || obj?.category || "");
    return p;
  } catch {
    return "";
  }
}

function extractPosList(text) {
  const s = String(text || "");
  const out = [];
  let m = null;
  POS_TOKEN_RE.lastIndex = 0;
  while ((m = POS_TOKEN_RE.exec(s)) !== null) {
    const p = normalizePos(m?.groups?.pos || "");
    if (p && !out.includes(p)) out.push(p);
  }
  return out;
}

function firstPos(text) {
  const arr = extractPosList(text);
  return arr.length > 0 ? arr[0] : "";
}

function cleanupMeaningText(text) {
  return cleanText(text)
    .replace(/^&+/, "")
    .replace(/^[,;，；:：]+/, "")
    .trim();
}

function prefixPos(pos, text) {
  const p = normalizePos(pos);
  const t = cleanupMeaningText(text);
  if (!t) return "";
  if (hasPos(t)) return t;
  if (!p) return t;
  return `${p} ${t}`;
}

function qualityScore(text, expectEnglish = false) {
  const t = cleanText(text);
  if (!t) return -9999;
  let score = 0;
  if (hasPos(t)) score += 10;
  if (expectEnglish) {
    if (hasEnglish(t)) score += 3;
    if (!hasChinese(t)) score += 2;
  } else if (hasChinese(t)) {
    score += 3;
  }
  if (t.includes("???")) score -= 20;
  if (t.includes("翻译获取失败") || t.includes("真实例句")) score -= 20;
  const len = t.length;
  if (len >= 6 && len <= 420) score += 2;
  if (len > 800) score -= 2;
  return score;
}

async function requestJson(url, retries = MAX_RETRIES) {
  let lastErr = null;
  for (let i = 0; i <= retries; i += 1) {
    try {
      const resp = await fetch(url);
      const txt = await resp.text();
      if (!resp.ok) throw new Error(`HTTP ${resp.status} ${txt.slice(0, 200)}`);
      return JSON.parse(txt);
    } catch (err) {
      lastErr = err;
      if (i < retries) await sleep(250 * (i + 1));
    }
  }
  throw lastErr || new Error("requestJson failed");
}

function uniqueNonEmpty(arr) {
  return Array.from(new Set((arr || []).map((x) => cleanText(x)).filter(Boolean)));
}

function parseYoudaoPosTranslation(body) {
  const trs = body?.ec?.word?.[0]?.trs;
  if (!Array.isArray(trs)) return "";
  const lines = [];
  for (const trItem of trs) {
    const trList = Array.isArray(trItem?.tr) ? trItem.tr : [];
    for (const tr of trList) {
      const lis = Array.isArray(tr?.l?.i) ? tr.l.i : [];
      for (const raw of lis) {
        const line = cleanText(raw);
        if (!line) continue;
        if (hasPos(line)) {
          lines.push(line);
        } else {
          const p = normalizePos(trItem?.pos || "");
          if (p) lines.push(`${p} ${line}`);
        }
      }
    }
  }
  return limit(uniqueNonEmpty(lines).join(" "), 500);
}

function parseDictionaryApiPosDefinition(body) {
  if (!Array.isArray(body)) return "";
  const lines = [];
  const usedPos = new Set();
  for (const entry of body) {
    const meanings = Array.isArray(entry?.meanings) ? entry.meanings : [];
    for (const m of meanings) {
      const p = normalizePos(m?.partOfSpeech || "");
      const defs = Array.isArray(m?.definitions) ? m.definitions : [];
      const firstDef = cleanText(defs[0]?.definition || "");
      if (!firstDef) continue;
      const key = `${p}|${firstDef}`;
      if (usedPos.has(key)) continue;
      usedPos.add(key);
      lines.push(`${p || "n."} ${firstDef}`);
    }
  }
  return limit(uniqueNonEmpty(lines).join(" ; "), 4000);
}

async function fetchYoudaoTranslation(word) {
  const variants = uniqueNonEmpty([
    word,
    String(word || "").replace(/\./g, ""),
    String(word || "").replace(/-/g, " "),
    String(word || "").replace(/-/g, ""),
  ]);
  for (const v of variants) {
    try {
      const body = await requestJson(`http://dict.youdao.com/jsonapi?q=${encodeURIComponent(v)}`, 1);
      const t = parseYoudaoPosTranslation(body);
      if (t && hasPos(t)) return t;
    } catch {
      // ignore
    }
  }
  return "";
}

async function fetchDictionaryDefinition(word) {
  const variants = uniqueNonEmpty([
    word,
    String(word || "").replace(/\./g, ""),
    String(word || "").replace(/-/g, " "),
    String(word || "").replace(/-/g, ""),
  ]);
  for (const v of variants) {
    try {
      const body = await requestJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(v)}`, 1);
      const d = parseDictionaryApiPosDefinition(body);
      if (d && hasPos(d)) return d;
    } catch {
      // ignore
    }
  }
  return "";
}

async function runWordApiMap(wordKeys, wordOriginalMap) {
  const keys = Array.from(wordKeys);
  const out = new Map();
  let idx = 0;
  let ok = 0;
  let fail = 0;
  const start = Date.now();

  async function worker(wid) {
    while (true) {
      const i = idx++;
      if (i >= keys.length) return;
      const k = keys[i];
      const word = wordOriginalMap.get(k) || k;
      try {
        const [translation, definition] = await Promise.all([
          fetchYoudaoTranslation(word),
          fetchDictionaryDefinition(word),
        ]);
        out.set(k, { translation, definition });
        ok += 1;
      } catch {
        out.set(k, { translation: "", definition: "" });
        fail += 1;
      }

      const done = ok + fail;
      if (done % 100 === 0 || done === keys.length) {
        const sec = ((Date.now() - start) / 1000).toFixed(1);
        console.log(`[api w${wid}] ${done}/${keys.length} ok=${ok} fail=${fail} elapsed=${sec}s`);
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, CONCURRENCY) }, (_, i) => worker(i + 1));
  await Promise.all(workers);
  return out;
}

async function main() {
  const pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: Math.max(4, CONCURRENCY + 4),
  });

  const [rowsRaw] = await pool.query(`
    SELECT id, word, exam_type AS examType, translation, definition, tags
    FROM vocabulary
    WHERE deleted=0
    ORDER BY id
  `);
  const rows = Array.isArray(rowsRaw) ? rowsRaw : [];
  console.log(`Loaded rows: ${rows.length}`);

  const byWord = new Map();
  const wordOriginal = new Map();
  for (const r of rows) {
    const key = normalizeWord(r.word);
    if (!key) continue;
    if (!byWord.has(key)) byWord.set(key, []);
    byWord.get(key).push(r);
    if (!wordOriginal.has(key)) wordOriginal.set(key, cleanText(r.word));
  }

  const canonical = new Map();
  for (const [k, list] of byWord.entries()) {
    let bestTr = "";
    let bestDf = "";
    let bestTrScore = -9999;
    let bestDfScore = -9999;

    for (const r of list) {
      const tr = cleanText(r.translation);
      const df = cleanText(r.definition);

      const trScore = qualityScore(tr, false);
      if (trScore > bestTrScore && hasPos(tr)) {
        bestTrScore = trScore;
        bestTr = tr;
      }

      const dfScore = qualityScore(df, true);
      if (dfScore > bestDfScore && hasPos(df)) {
        bestDfScore = dfScore;
        bestDf = df;
      }
    }

    canonical.set(k, {
      translation: bestTr,
      definition: bestDf,
      posHint: firstPos(bestTr) || firstPos(bestDf),
    });
  }

  const candidates = rows.filter((r) => !hasPos(r.translation) || !hasPos(r.definition));
  const selected = MAX_ITEMS > 0 ? candidates.slice(0, MAX_ITEMS) : candidates;
  console.log(`Rows requiring POS repair: ${selected.length}`);
  if (selected.length === 0) {
    await pool.end();
    return;
  }

  const interim = new Map();
  const unresolvedWords = new Set();

  for (const row of selected) {
    const key = normalizeWord(row.word);
    const c = canonical.get(key) || { translation: "", definition: "", posHint: "" };
    const tr0 = cleanText(row.translation);
    const df0 = cleanText(row.definition);

    let tr = tr0;
    let df = df0;

    const tagPos = parseTagPos(row.tags);
    const localPos = firstPos(tr0) || firstPos(df0);
    const hintPos = localPos || c.posHint || tagPos;

    if (!hasPos(tr)) {
      if (hasPos(c.translation)) {
        tr = c.translation;
      } else if (hintPos) {
        tr = prefixPos(hintPos, tr);
      }
    }

    if (!hasPos(df)) {
      if (hasPos(c.definition)) {
        df = c.definition;
      } else {
        const p = hintPos || firstPos(tr);
        if (p) df = prefixPos(p, df);
      }
    }

    const unresolved = !hasPos(tr) || !hasPos(df);
    if (unresolved) unresolvedWords.add(key);

    interim.set(row.id, {
      id: row.id,
      wordKey: key,
      examType: row.examType,
      originalTranslation: tr0,
      originalDefinition: df0,
      translation: tr,
      definition: df,
      hintPos: hintPos || "",
    });
  }

  console.log(`Unresolved words after local repair: ${unresolvedWords.size}`);
  let apiMap = new Map();
  if (unresolvedWords.size > 0) {
    apiMap = await runWordApiMap(unresolvedWords, wordOriginal);
  }

  const updates = [];
  let fallbackForced = 0;

  for (const item of interim.values()) {
    let tr = item.translation;
    let df = item.definition;

    if (!hasPos(tr) || !hasPos(df)) {
      const api = apiMap.get(item.wordKey) || { translation: "", definition: "" };
      if (!hasPos(tr) && hasPos(api.translation)) {
        tr = api.translation;
      }
      if (!hasPos(df) && hasPos(api.definition)) {
        df = api.definition;
      }
      if (!hasPos(df) && hasPos(api.translation)) {
        const p = firstPos(api.translation);
        if (p) df = prefixPos(p, df);
      }
    }

    if (!hasPos(tr)) {
      const p = item.hintPos || firstPos(df) || "n.";
      tr = prefixPos(p, tr || item.originalTranslation);
      fallbackForced += 1;
    }
    if (!hasPos(df)) {
      const p = item.hintPos || firstPos(tr) || "n.";
      df = prefixPos(p, df || item.originalDefinition);
      fallbackForced += 1;
    }

    tr = limit(tr, 500);
    df = limit(df, 4000);

    if (tr !== item.originalTranslation || df !== item.originalDefinition) {
      updates.push({ id: item.id, translation: tr, definition: df });
    }
  }

  console.log(`Rows to update: ${updates.length}`);
  console.log(`Forced fallback assignments: ${fallbackForced}`);

  let done = 0;
  let failed = 0;
  const start = Date.now();
  let updIdx = 0;

  async function updater(wid) {
    while (true) {
      const i = updIdx++;
      if (i >= updates.length) return;
      const u = updates[i];
      try {
        await pool.query(
          "UPDATE vocabulary SET translation=?, definition=?, update_time=NOW() WHERE id=?",
          [u.translation, u.definition, u.id]
        );
      } catch {
        failed += 1;
      }
      done += 1;
      if (done % 200 === 0 || done === updates.length) {
        const sec = ((Date.now() - start) / 1000).toFixed(1);
        console.log(`[db w${wid}] ${done}/${updates.length} failed=${failed} elapsed=${sec}s`);
      }
    }
  }

  const writers = Array.from({ length: Math.max(1, CONCURRENCY) }, (_, i) => updater(i + 1));
  await Promise.all(writers);

  const [[check]] = await pool.query(`
    SELECT
      SUM(CASE WHEN translation REGEXP '(^|[^a-z])(n\\.|v\\.|vi\\.|vt\\.|adj\\.|adv\\.|prep\\.|conj\\.|pron\\.|num\\.|int\\.|aux\\.|det\\.|modal\\.)' THEN 1 ELSE 0 END AS tr_pos,
      SUM(CASE WHEN definition REGEXP '(^|[^a-z])(n\\.|v\\.|vi\\.|vt\\.|adj\\.|adv\\.|prep\\.|conj\\.|pron\\.|num\\.|int\\.|aux\\.|det\\.|modal\\.)' THEN 1 ELSE 0 END AS df_pos,
      COUNT(*) AS total
    FROM vocabulary
    WHERE deleted=0
  `);

  console.log("=== POS Repair Summary ===");
  console.log(`updated=${updates.length}, update_failed=${failed}`);
  console.log(`translation_with_pos=${check.tr_pos}/${check.total}`);
  console.log(`definition_with_pos=${check.df_pos}/${check.total}`);

  await pool.end();
}

main().catch((err) => {
  console.error("FATAL:", err?.message || err);
  process.exitCode = 1;
});

