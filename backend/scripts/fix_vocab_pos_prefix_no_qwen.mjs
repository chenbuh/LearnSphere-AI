#!/usr/bin/env node

import mysql from "mysql2/promise";

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "chen20040209";
const DB_NAME = process.env.DB_NAME || "learnsphere_ai";
const CONCURRENCY = Number(process.env.CONCURRENCY || 10);

const ANY_POS_RE = /(^|[^a-z])(n\.|v\.|vi\.|vt\.|adj\.|adv\.|prep\.|conj\.|pron\.|num\.|int\.|aux\.|det\.|modal\.)/i;
const START_POS_RE = /^\s*(n\.|v\.|vi\.|vt\.|adj\.|adv\.|prep\.|conj\.|pron\.|num\.|int\.|aux\.|det\.|modal\.)/i;
const POS_TOKEN_RE =
  /(^|[\s,;，；()（）\[\]{}])(?<pos>vi|vt|adj|adv|prep|conj|pron|num|int|aux|det|modal|art|noun|verb|adjective|adverb|n|v|a|ad)\s*\./gi;

function cleanText(v) {
  return String(v || "").replace(/\s+/g, " ").trim();
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
    const t = JSON.parse(String(tags || ""));
    return normalizePos(t?.partOfSpeech || t?.category || "");
  } catch {
    return "";
  }
}

function firstPos(text) {
  const s = String(text || "");
  POS_TOKEN_RE.lastIndex = 0;
  const m = POS_TOKEN_RE.exec(s);
  return normalizePos(m?.groups?.pos || "");
}

function addPrefixIfNeeded(text, hintPos) {
  const s = cleanText(text);
  if (!s) return s;
  if (!ANY_POS_RE.test(s)) return s;
  if (START_POS_RE.test(s)) return s;
  const p = normalizePos(hintPos) || firstPos(s) || "n.";
  return `${p} ${s}`;
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
    SELECT id, tags, translation, definition
    FROM vocabulary
    WHERE deleted=0
      AND (
        (translation REGEXP '(^|[^a-z])(n\\.|v\\.|vi\\.|vt\\.|adj\\.|adv\\.|prep\\.|conj\\.|pron\\.|num\\.|int\\.|aux\\.|det\\.|modal\\.)'
          AND translation NOT REGEXP '^[[:space:]]*(n\\.|v\\.|vi\\.|vt\\.|adj\\.|adv\\.|prep\\.|conj\\.|pron\\.|num\\.|int\\.|aux\\.|det\\.|modal\\.)')
        OR
        (definition REGEXP '(^|[^a-z])(n\\.|v\\.|vi\\.|vt\\.|adj\\.|adv\\.|prep\\.|conj\\.|pron\\.|num\\.|int\\.|aux\\.|det\\.|modal\\.)'
          AND definition NOT REGEXP '^[[:space:]]*(n\\.|v\\.|vi\\.|vt\\.|adj\\.|adv\\.|prep\\.|conj\\.|pron\\.|num\\.|int\\.|aux\\.|det\\.|modal\\.)')
      )
    ORDER BY id
  `);

  const rows = Array.isArray(rowsRaw) ? rowsRaw : [];
  console.log(`Rows needing leading POS prefix: ${rows.length}`);
  if (rows.length === 0) {
    await pool.end();
    return;
  }

  const updates = [];
  for (const r of rows) {
    const hint = parseTagPos(r.tags);
    const newTr = addPrefixIfNeeded(r.translation, hint);
    const newDf = addPrefixIfNeeded(r.definition, hint);
    if (newTr !== r.translation || newDf !== r.definition) {
      updates.push({ id: r.id, translation: newTr, definition: newDf });
    }
  }

  console.log(`Rows to update: ${updates.length}`);
  let idx = 0;
  let done = 0;
  let failed = 0;

  async function worker() {
    while (true) {
      const i = idx++;
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
      if (done % 500 === 0 || done === updates.length) {
        console.log(`progress ${done}/${updates.length}, failed=${failed}`);
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, CONCURRENCY) }, () => worker());
  await Promise.all(workers);

  const [[check]] = await pool.query(`
    SELECT
      SUM(CASE WHEN translation REGEXP '(^|[^a-z])(n\\.|v\\.|vi\\.|vt\\.|adj\\.|adv\\.|prep\\.|conj\\.|pron\\.|num\\.|int\\.|aux\\.|det\\.|modal\\.)'
        AND translation NOT REGEXP '^[[:space:]]*(n\\.|v\\.|vi\\.|vt\\.|adj\\.|adv\\.|prep\\.|conj\\.|pron\\.|num\\.|int\\.|aux\\.|det\\.|modal\\.)'
      THEN 1 ELSE 0 END) AS tr_bad_start,
      SUM(CASE WHEN definition REGEXP '(^|[^a-z])(n\\.|v\\.|vi\\.|vt\\.|adj\\.|adv\\.|prep\\.|conj\\.|pron\\.|num\\.|int\\.|aux\\.|det\\.|modal\\.)'
        AND definition NOT REGEXP '^[[:space:]]*(n\\.|v\\.|vi\\.|vt\\.|adj\\.|adv\\.|prep\\.|conj\\.|pron\\.|num\\.|int\\.|aux\\.|det\\.|modal\\.)'
      THEN 1 ELSE 0 END) AS df_bad_start
    FROM vocabulary
    WHERE deleted=0
  `);

  console.log("=== Prefix Fix Summary ===");
  console.log(`updated=${updates.length}, failed=${failed}`);
  console.log(`remaining_tr_bad_start=${check.tr_bad_start}, remaining_df_bad_start=${check.df_bad_start}`);

  await pool.end();
}

main().catch((err) => {
  console.error("FATAL:", err?.message || err);
  process.exitCode = 1;
});

