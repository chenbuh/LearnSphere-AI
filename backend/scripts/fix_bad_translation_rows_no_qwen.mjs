#!/usr/bin/env node

import mysql from "mysql2/promise";

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "chen20040209";
const DB_NAME = process.env.DB_NAME || "learnsphere_ai";
const CONCURRENCY = Number(process.env.CONCURRENCY || 10);
const MAX_RETRIES = Number(process.env.MAX_RETRIES || 2);

const POS_RE =
  /(^|[^a-z])(n\.|v\.|vi\.|vt\.|adj\.|adv\.|prep\.|conj\.|pron\.|num\.|int\.|aux\.|det\.|modal\.)/i;
const POS_ONLY_RE =
  /^(\s*(n\.|v\.|vi\.|vt\.|adj\.|adv\.|prep\.|conj\.|pron\.|num\.|int\.|aux\.|det\.|modal\.)\s*)+$/i;

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

function hasChinese(s) {
  return /[\u4e00-\u9fff]/.test(String(s || ""));
}

function hasEnglish(s) {
  return /[A-Za-z]/.test(String(s || ""));
}

function isPureEnglish(s) {
  const t = cleanText(s);
  return !!t && hasEnglish(t) && !hasChinese(t);
}

function normalizeWord(w) {
  return String(w || "")
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

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v == null) return [];
  return [v];
}

function isBadTranslation(tr) {
  const t = cleanText(tr);
  if (!t) return true;
  if (!hasChinese(t)) return true;
  if (!POS_RE.test(t)) return true;
  if (POS_ONLY_RE.test(t)) return true;
  if (/^num\.\s*&$/i.test(t)) return true;
  return false;
}

function isBadDefinition(df) {
  const t = cleanText(df);
  if (!t) return true;
  if (!POS_RE.test(t)) return true;
  if (POS_ONLY_RE.test(t)) return true;
  if (!isPureEnglish(t)) return true;
  return false;
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

function parseYoudaoTranslationZh(body) {
  const lines = [];
  const trs = asArray(body?.ec?.word?.[0]?.trs);
  for (const trItem of trs) {
    const trList = asArray(trItem?.tr);
    for (const tr of trList) {
      const lis = asArray(tr?.l?.i);
      for (const raw of lis) {
        const line = cleanText(raw);
        if (line) lines.push(line);
      }
    }
  }
  const joined = Array.from(new Set(lines)).join(" ; ");
  return hasChinese(joined) && POS_RE.test(joined) ? joined.slice(0, 500) : "";
}

function parseDictionaryDefinitionEn(body) {
  if (!Array.isArray(body)) return "";
  const lines = [];
  for (const entry of body) {
    const meanings = asArray(entry?.meanings);
    for (const m of meanings) {
      const pos = normalizePos(m?.partOfSpeech || "");
      const defs = asArray(m?.definitions);
      const d = cleanText(defs[0]?.definition || "");
      if (!d || !hasEnglish(d) || hasChinese(d)) continue;
      lines.push(`${pos || "n."} ${d}`);
    }
  }
  const joined = Array.from(new Set(lines)).slice(0, 6).join(" ; ");
  return isPureEnglish(joined) && POS_RE.test(joined) ? joined.slice(0, 4000) : "";
}

async function fetchWordData(word) {
  const variants = Array.from(
    new Set([
      String(word || "").trim(),
      String(word || "")
        .trim()
        .replace(/\./g, ""),
      String(word || "")
        .trim()
        .replace(/-/g, " "),
      String(word || "")
        .trim()
        .replace(/-/g, ""),
    ])
  ).filter(Boolean);

  let trZh = "";
  let dfEn = "";

  for (const v of variants) {
    try {
      const yd = await requestJson(`http://dict.youdao.com/jsonapi?q=${encodeURIComponent(v)}`, 1);
      if (!trZh) trZh = parseYoudaoTranslationZh(yd);
      if (trZh) break;
    } catch {
      // ignore
    }
  }

  for (const v of variants) {
    try {
      const dict = await requestJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(v)}`, 1);
      dfEn = parseDictionaryDefinitionEn(dict);
      if (dfEn) break;
    } catch {
      // ignore
    }
  }

  return { trZh, dfEn };
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
    connectionLimit: Math.max(4, CONCURRENCY + 2),
  });

  const [rowsRaw] = await pool.query(`
    SELECT id, word, exam_type AS examType, translation, definition
    FROM vocabulary
    WHERE deleted=0
    ORDER BY id
  `);
  const rows = Array.isArray(rowsRaw) ? rowsRaw : [];

  const badRows = rows.filter((r) => isBadTranslation(r.translation));
  console.log(`Bad translation rows: ${badRows.length}`);
  if (badRows.length === 0) {
    await pool.end();
    return;
  }

  const wordMap = new Map();
  for (const r of badRows) {
    const k = normalizeWord(r.word);
    if (!wordMap.has(k)) wordMap.set(k, r.word);
  }
  const words = Array.from(wordMap.keys());
  console.log(`Unique words to fetch: ${words.length}`);

  const fetched = new Map();
  let idx = 0;
  let ok = 0;
  let fail = 0;
  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= words.length) return;
      const k = words[i];
      const w = wordMap.get(k) || k;
      try {
        const d = await fetchWordData(w);
        fetched.set(k, d);
        ok += 1;
      } catch {
        fetched.set(k, { trZh: "", dfEn: "" });
        fail += 1;
      }
      const done = ok + fail;
      if (done % 20 === 0 || done === words.length) {
        console.log(`fetch ${done}/${words.length} ok=${ok} fail=${fail}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, () => worker()));

  const updates = [];
  for (const r of badRows) {
    const k = normalizeWord(r.word);
    const d = fetched.get(k) || { trZh: "", dfEn: "" };
    const oldTr = cleanText(r.translation);
    const oldDf = cleanText(r.definition);
    let newTr = oldTr;
    let newDf = oldDf;

    if (d.trZh) newTr = d.trZh;
    if (isBadDefinition(oldDf) && d.dfEn) newDf = d.dfEn;

    if (newTr !== oldTr || newDf !== oldDf) {
      updates.push({ id: r.id, translation: newTr, definition: newDf });
    }
  }

  console.log(`Rows to update: ${updates.length}`);
  for (const u of updates) {
    await pool.query("UPDATE vocabulary SET translation=?, definition=?, update_time=NOW() WHERE id=?", [
      u.translation,
      u.definition,
      u.id,
    ]);
  }

  const [[check]] = await pool.query(`
    SELECT
      SUM(CASE WHEN translation REGEXP '[一-龥]' THEN 1 ELSE 0 END) AS tr_has_zh,
      SUM(CASE WHEN
        COALESCE(TRIM(translation),'')='' OR
        translation NOT REGEXP '[一-龥]' OR
        translation REGEXP '^(\\s*(n\\.|v\\.|vi\\.|vt\\.|adj\\.|adv\\.|prep\\.|conj\\.|pron\\.|num\\.|int\\.|aux\\.|det\\.|modal\\.)\\s*)+$'
      THEN 1 ELSE 0 END) AS tr_bad
    FROM vocabulary
    WHERE deleted=0
  `);

  console.log(`translation_with_chinese=${check.tr_has_zh}, remaining_bad_translation=${check.tr_bad}`);
  await pool.end();
}

main().catch((err) => {
  console.error("FATAL:", err?.message || err);
  process.exitCode = 1;
});

