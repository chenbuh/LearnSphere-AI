#!/usr/bin/env node

import mysql from "mysql2/promise";

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "chen20040209";
const DB_NAME = process.env.DB_NAME || "learnsphere_ai";

const CONCURRENCY = Number(process.env.CONCURRENCY || 16);
const MAX_RETRIES = Number(process.env.MAX_RETRIES || 2);
const WORD_OFFSET = Number(process.env.WORD_OFFSET || 0);
const MAX_WORDS = Number(process.env.MAX_WORDS || 0); // 0 = all

const POS_RE =
  /(^|[^a-z])(n\.|v\.|vi\.|vt\.|adj\.|adv\.|prep\.|conj\.|pron\.|num\.|int\.|aux\.|det\.|modal\.)/i;
const POS_ONLY_RE =
  /^(\s*(n\.|v\.|vi\.|vt\.|adj\.|adv\.|prep\.|conj\.|pron\.|num\.|int\.|aux\.|det\.|modal\.)\s*)+$/i;
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

function hasPos(s) {
  return POS_RE.test(String(s || ""));
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

function firstPos(s) {
  const t = String(s || "");
  POS_TOKEN_RE.lastIndex = 0;
  const m = POS_TOKEN_RE.exec(t);
  return normalizePos(m?.groups?.pos || "");
}

function isBadTranslation(tr) {
  const t = cleanText(tr);
  if (!t) return true;
  if (!hasChinese(t)) return true;
  if (!hasPos(t)) return true;
  if (POS_ONLY_RE.test(t)) return true;
  if (/^num\.\s*&$/i.test(t)) return true;
  return false;
}

function isBadDefinition(df) {
  const t = cleanText(df);
  if (!t) return true;
  if (!hasPos(t)) return true;
  if (!isPureEnglish(t)) return true;
  if (POS_ONLY_RE.test(t)) return true;
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

function cleanupEnglishText(s) {
  return cleanText(String(s || "").replace(/[\u4e00-\u9fff]/g, ""))
    .replace(/\s*[;,]{2,}\s*/g, "; ")
    .replace(/\s+/g, " ")
    .trim();
}

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v == null) return [];
  return [v];
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
        if (!line) continue;
        lines.push(line);
      }
    }
  }
  const uniq = Array.from(new Set(lines));
  const joined = uniq.join(" ; ");
  return hasChinese(joined) && hasPos(joined) ? limit(joined, 500) : "";
}

function extractEnglishBeforeChinese(text) {
  const t = cleanText(text);
  if (!t) return "";
  const idx = t.search(/[\u4e00-\u9fff]/);
  const left = idx >= 0 ? t.slice(0, idx) : t;
  return cleanText(left.replace(/[;，,:\-–—]+$/g, ""));
}

function parseYoudaoDefinitionEn(body) {
  const lines = [];
  const collinsEntries = asArray(body?.collins?.collins_entries);
  for (const ce of collinsEntries) {
    const entries = asArray(ce?.entries?.entry || ce?.entries);
    for (const e of entries) {
      const tranEntries = asArray(e?.tran_entry);
      for (const te of tranEntries) {
        const pos = normalizePos(te?.pos_entry?.pos || "");
        const tran = extractEnglishBeforeChinese(te?.tran || "");
        if (!tran || !hasEnglish(tran)) continue;
        const text = `${pos || firstPos(tran) || "n."} ${tran}`;
        lines.push(text);
      }
    }
  }
  const uniq = Array.from(new Set(lines)).slice(0, 8);
  const joined = uniq.join(" ; ");
  return isPureEnglish(joined) && hasPos(joined) ? limit(joined, 4000) : "";
}

function parseDictionaryApiDefinitionEn(body) {
  if (!Array.isArray(body)) return "";
  const lines = [];
  for (const entry of body) {
    const meanings = asArray(entry?.meanings);
    for (const m of meanings) {
      const pos = normalizePos(m?.partOfSpeech || "");
      const defs = asArray(m?.definitions);
      const def = cleanText(defs[0]?.definition || "");
      if (!def || !hasEnglish(def) || hasChinese(def)) continue;
      lines.push(`${pos || "n."} ${def}`);
    }
  }
  const uniq = Array.from(new Set(lines)).slice(0, 8);
  const joined = uniq.join(" ; ");
  return isPureEnglish(joined) && hasPos(joined) ? limit(joined, 4000) : "";
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
      if (!dfEn) dfEn = parseYoudaoDefinitionEn(yd);
      if (trZh && dfEn) break;
    } catch {
      // ignore
    }
  }

  if (!dfEn) {
    for (const v of variants) {
      try {
        const dict = await requestJson(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(v)}`,
          1
        );
        dfEn = parseDictionaryApiDefinitionEn(dict);
        if (dfEn) break;
      } catch {
        // ignore
      }
    }
  }

  return { trZh, dfEn };
}

async function translateZhToEn(text) {
  const q = cleanText(text);
  if (!q) return "";
  const body = await requestJson(
    "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(q) + "&langpair=zh-CN|en",
    2
  );
  const direct = cleanupEnglishText(body?.responseData?.translatedText || "");
  if (direct && hasEnglish(direct)) return direct;
  const matches = Array.isArray(body?.matches) ? body.matches : [];
  for (const m of matches) {
    const t = cleanupEnglishText(m?.translation || "");
    if (t && hasEnglish(t)) return t;
  }
  return "";
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
    connectionLimit: Math.max(6, CONCURRENCY + 4),
  });

  const [rowsRaw] = await pool.query(`
    SELECT id, word, exam_type AS examType, translation, definition
    FROM vocabulary
    WHERE deleted=0
    ORDER BY id
  `);
  const rows = Array.isArray(rowsRaw) ? rowsRaw : [];
  console.log(`Loaded rows: ${rows.length}`);

  const pureEnDefByWord = new Map();
  for (const r of rows) {
    const key = normalizeWord(r.word);
    const df = cleanText(r.definition);
    if (!key) continue;
    if (isPureEnglish(df) && hasPos(df) && !pureEnDefByWord.has(key)) {
      pureEnDefByWord.set(key, df);
    }
  }

  const candidates = rows.filter((r) => isBadTranslation(r.translation) || isBadDefinition(r.definition));
  const candidateWordsAll = Array.from(new Set(candidates.map((r) => normalizeWord(r.word)).filter(Boolean))).sort();
  const slicedWords = MAX_WORDS > 0 ? candidateWordsAll.slice(WORD_OFFSET, WORD_OFFSET + MAX_WORDS) : candidateWordsAll.slice(WORD_OFFSET);
  const targetWordSet = new Set(slicedWords);
  const targetRows = candidates.filter((r) => targetWordSet.has(normalizeWord(r.word)));

  console.log(
    `Candidate rows=${candidates.length}, candidate words=${candidateWordsAll.length}, target rows=${targetRows.length}, target words=${slicedWords.length}`
  );

  if (targetRows.length === 0) {
    await pool.end();
    return;
  }

  const needApiWords = slicedWords.filter((w) => !pureEnDefByWord.has(w));
  console.log(`Words requiring API fetch: ${needApiWords.length}`);

  const wordDataMap = new Map();
  let apiIdx = 0;
  let apiOk = 0;
  let apiFail = 0;
  const apiStart = Date.now();

  async function apiWorker(wid) {
    while (true) {
      const i = apiIdx++;
      if (i >= needApiWords.length) return;
      const key = needApiWords[i];
      const word = targetRows.find((r) => normalizeWord(r.word) === key)?.word || key;
      try {
        const data = await fetchWordData(word);
        wordDataMap.set(key, data);
        apiOk += 1;
      } catch {
        wordDataMap.set(key, { trZh: "", dfEn: "" });
        apiFail += 1;
      }
      const done = apiOk + apiFail;
      if (done % 100 === 0 || done === needApiWords.length) {
        const sec = ((Date.now() - apiStart) / 1000).toFixed(1);
        console.log(`[api w${wid}] ${done}/${needApiWords.length} ok=${apiOk} fail=${apiFail} elapsed=${sec}s`);
      }
    }
  }

  const apiWorkers = Array.from({ length: Math.max(1, CONCURRENCY) }, (_, i) => apiWorker(i + 1));
  await Promise.all(apiWorkers);

  const updates = [];
  const zhToEnCache = new Map();
  for (const r of targetRows) {
    const key = normalizeWord(r.word);
    const oldTr = cleanText(r.translation);
    const oldDf = cleanText(r.definition);
    const data = wordDataMap.get(key) || { trZh: "", dfEn: "" };

    let newTr = oldTr;
    let newDf = oldDf;

    if (isBadTranslation(oldTr) && data.trZh) {
      newTr = data.trZh;
    }

    if (isBadDefinition(oldDf)) {
      const byWord = pureEnDefByWord.get(key) || "";
      if (byWord) {
        newDf = byWord;
      } else if (data.dfEn) {
        newDf = data.dfEn;
      } else {
        const srcZh = data.trZh || oldTr;
        if (srcZh && hasChinese(srcZh)) {
          let translated = zhToEnCache.get(srcZh);
          if (translated === undefined) {
            try {
              translated = await translateZhToEn(srcZh);
            } catch {
              translated = "";
            }
            zhToEnCache.set(srcZh, translated || "");
          }
          if (translated) {
            const pos = firstPos(srcZh) || firstPos(oldTr) || "n.";
            newDf = `${pos} ${translated}`;
          }
        }
      }
    }

    newTr = limit(newTr, 500);
    newDf = limit(newDf, 4000);

    if (newTr !== oldTr || newDf !== oldDf) {
      updates.push({ id: r.id, translation: newTr, definition: newDf });
    }
  }

  console.log(`Rows to update: ${updates.length}`);
  let updIdx = 0;
  let updDone = 0;
  let updFail = 0;
  const updStart = Date.now();

  async function dbWorker(wid) {
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
        updFail += 1;
      }
      updDone += 1;
      if (updDone % 500 === 0 || updDone === updates.length) {
        const sec = ((Date.now() - updStart) / 1000).toFixed(1);
        console.log(`[db w${wid}] ${updDone}/${updates.length} fail=${updFail} elapsed=${sec}s`);
      }
    }
  }

  const dbWorkers = Array.from({ length: Math.max(1, CONCURRENCY) }, (_, i) => dbWorker(i + 1));
  await Promise.all(dbWorkers);

  const [checkRows] = await pool.query(`
    SELECT translation, definition
    FROM vocabulary
    WHERE deleted=0
  `);
  let trHasZh = 0;
  let dfPureEn = 0;
  for (const r of checkRows) {
    if (hasChinese(r.translation)) trHasZh += 1;
    if (isPureEnglish(r.definition)) dfPureEn += 1;
  }
  const total = Array.isArray(checkRows) ? checkRows.length : 0;

  console.log("=== TR/DF Repair Summary ===");
  console.log(`updated=${updates.length}, update_fail=${updFail}`);
  console.log(`translation_with_chinese=${trHasZh}/${total}`);
  console.log(`definition_pure_english=${dfPureEn}/${total}`);

  await pool.end();
}

main().catch((err) => {
  console.error("FATAL:", err?.message || err);
  process.exitCode = 1;
});
