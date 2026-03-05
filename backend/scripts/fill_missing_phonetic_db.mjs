#!/usr/bin/env node

import mysql from "mysql2/promise";

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "chen20040209";
const DB_NAME = process.env.DB_NAME || "learnsphere_ai";
const MAX_RETRIES = Number(process.env.MAX_RETRIES || 2);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizePhonetic(v) {
  if (!v) return "";
  let s = String(v).trim();
  if (!s) return "";
  s = s.replace("[", "/").replace("]", "/");
  if (!s.startsWith("/")) s = `/${s}`;
  if (!s.endsWith("/")) s = `${s}/`;
  return s;
}

async function requestJson(url, retries = MAX_RETRIES) {
  let lastErr = null;
  for (let i = 0; i <= retries; i += 1) {
    try {
      const resp = await fetch(url);
      const text = await resp.text();
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text.slice(0, 180)}`);
      return JSON.parse(text);
    } catch (err) {
      lastErr = err;
      if (i < retries) await sleep(250 * (i + 1));
    }
  }
  throw lastErr;
}

async function getPhonetic(word) {
  const variants = Array.from(
    new Set([
      String(word || "").trim(),
      String(word || "")
        .trim()
        .replace(/\s+/g, ""),
      String(word || "")
        .trim()
        .replace(/\s+/g, " ")
        .replace(/-/g, " "),
      String(word || "")
        .trim()
        .replace(/\s+/g, " ")
        .replace(/-/g, ""),
    ])
  ).filter(Boolean);

  for (const v of variants) {
    try {
      const youdaoUrl = `http://dict.youdao.com/jsonapi?q=${encodeURIComponent(v)}`;
      const y = await requestJson(youdaoUrl, 1);
      const wd = y?.ec?.word?.[0];
      const yp = normalizePhonetic(wd?.ukphone || wd?.usphone || "");
      if (yp) return yp;
    } catch {
      // try next source
    }

    try {
      const dUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(v)}`;
      const d = await requestJson(dUrl, 1);
      if (Array.isArray(d) && d.length > 0) {
        for (const p of d[0]?.phonetics || []) {
          const dp = normalizePhonetic(p?.text || "");
          if (dp) return dp;
        }
      }
    } catch {
      // ignore
    }
  }

  return "";
}

async function main() {
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    charset: "utf8mb4",
  });

  try {
    const [rows] = await conn.query(`
      SELECT id, word, exam_type
      FROM vocabulary
      WHERE COALESCE(TRIM(phonetic), '') = ''
      ORDER BY exam_type, word
    `);

    if (!rows.length) {
      console.log("No missing phonetic rows.");
      return;
    }

    console.log(`Rows missing phonetic: ${rows.length}`);
    let success = 0;
    let failed = 0;

    for (const r of rows) {
      const phonetic = await getPhonetic(r.word);
      if (!phonetic) {
        failed += 1;
        console.log(`MISS id=${r.id} word=${r.word} exam_type=${r.exam_type}`);
        continue;
      }

      await conn.query(`UPDATE vocabulary SET phonetic = ?, deleted = 0 WHERE id = ?`, [phonetic, r.id]);
      success += 1;
      console.log(`OK id=${r.id} word=${r.word} -> ${phonetic}`);
    }

    const [[check]] = await conn.query(`
      SELECT COUNT(*) AS cnt
      FROM vocabulary
      WHERE COALESCE(TRIM(phonetic), '') = ''
    `);

    console.log(`Filled=${success}, Failed=${failed}, RemainingMissing=${check?.cnt ?? 0}`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("Fill missing phonetic failed:", err?.message || err);
  process.exit(1);
});

