#!/usr/bin/env node

import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "chen20040209";
const DB_NAME = process.env.DB_NAME || "learnsphere_ai";
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 800);

const DATASETS = [
  { file: "frontend-vue/src/data/primary_school_words.js", examType: "primary", source: "primary_school_words" },
  { file: "frontend-vue/src/data/middle_school_words.js", examType: "middle_school", source: "middle_school_words" },
  { file: "frontend-vue/src/data/high_school_words.js", examType: "high_school", source: "high_school_words" },
  { file: "frontend-vue/src/data/cet4_words.js", examType: "cet4", source: "cet4_words" },
  { file: "frontend-vue/src/data/cet6_words.js", examType: "cet6", source: "cet6_words" },
  { file: "frontend-vue/src/data/tem4_words.js", examType: "tem4", source: "tem4_words" },
  { file: "frontend-vue/src/data/tem8_words.js", examType: "tem8", source: "tem8_words" },
  { file: "frontend-vue/src/data/toefl_words.js", examType: "toefl", source: "toefl_words" },
  { file: "frontend-vue/src/data/ielts_words.js", examType: "ielts", source: "ielts_words" },
  { file: "frontend-vue/src/data/gre_words.js", examType: "gre", source: "gre_words" },
  { file: "frontend-vue/src/data/postgraduate_words.js", examType: "postgraduate", source: "postgraduate_words" },
  { file: "frontend-vue/src/data/coca_words.js", examType: "coca", source: "coca_words" },
];

const IMPORT_EXAM_TYPES = DATASETS.map((x) => x.examType);

function isBlank(v) {
  return v == null || String(v).trim() === "";
}

function cleanText(v) {
  if (v == null) return "";
  return String(v).replace(/\u0000/g, "").trim();
}

function hasChinese(v) {
  return /[\u4e00-\u9fff]/.test(String(v || ""));
}

function englishTokenCount(v) {
  const m = String(v || "").match(/[A-Za-z]{3,}/g);
  if (!Array.isArray(m)) return 0;
  return m.filter((t) => !(t === t.toUpperCase() && t.length <= 5)).length;
}

function isBadExampleTranslation(v) {
  const s = cleanText(v);
  if (!s) return true;
  const low = s.toLowerCase();

  if (s === "这对学习有用。") return true;
  if (s === "暂无例句。") return true;
  if (s.startsWith("这是一个关于")) return true;
  if (s.includes("翻译获取失败")) return true;
  if (s.includes("示例翻译不可用")) return true;

  if (s.includes("QUERY LENGTH LIMIT EXCEEDED")) return true;
  if (low.includes("translation failed")) return true;
  if (/^\?{3,}$/.test(s)) return true;

  if (hasChinese(s)) {
    const enCount = englishTokenCount(s);
    if (enCount >= 4) return true;
    if (/\b(I|you|he|she|they|we|to|the|and|is|are|was|were)\b/i.test(s)) return true;
  }

  if (!hasChinese(s)) return true;
  return false;
}

function sanitizeExampleTranslation(v) {
  const s = cleanText(v);
  return isBadExampleTranslation(s) ? "" : s;
}

function toTinyInt(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < -128 || rounded > 127) return null;
  return rounded;
}

function toInt(v, fallback = 0) {
  if (v == null || v === "") return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

function limit(v, max) {
  const s = cleanText(v);
  if (s.length <= max) return s;
  return s.slice(0, max);
}

function pickFirstNonBlank(...vals) {
  for (const v of vals) {
    if (!isBlank(v)) return cleanText(v);
  }
  return "";
}

function buildTags(item, source) {
  const tags = {};
  if (!isBlank(item.category)) tags.category = cleanText(item.category);
  if (!isBlank(item.partOfSpeech)) tags.partOfSpeech = cleanText(item.partOfSpeech);
  if (!isBlank(item.level)) tags.level = cleanText(item.level);
  if (!isBlank(item.examType)) tags.examTypeRaw = cleanText(item.examType);
  tags.source = source;
  return limit(JSON.stringify(tags), 255);
}

function normalizedKey(word, examType) {
  return `${cleanText(word).toLowerCase()}||${examType}`;
}

function mergeRecord(current, incoming) {
  const merged = { ...current };
  const fieldsPreferNonBlank = ["phonetic", "definition", "translation", "example", "example_translation", "tags"];
  for (const f of fieldsPreferNonBlank) {
    if (isBlank(merged[f]) && !isBlank(incoming[f])) merged[f] = incoming[f];
  }
  if (merged.difficulty == null && incoming.difficulty != null) {
    merged.difficulty = incoming.difficulty;
  }
  if ((merged.frequency || 0) < (incoming.frequency || 0)) {
    merged.frequency = incoming.frequency;
  }
  return merged;
}

async function loadWordArray(absPath) {
  const mod = await import(pathToFileURL(absPath).href);
  if (Array.isArray(mod.default)) return mod.default;
  for (const v of Object.values(mod)) {
    if (Array.isArray(v)) return v;
  }
  throw new Error(`Cannot find exported array in ${absPath}`);
}

async function collectRecords(rootDir) {
  const map = new Map();
  const stats = [];

  for (const ds of DATASETS) {
    const abs = path.resolve(rootDir, ds.file);
    const arr = await loadWordArray(abs);

    let rawCount = 0;
    for (let i = 0; i < arr.length; i += 1) {
      const item = arr[i] || {};
      const word = limit(item.word, 100);
      if (isBlank(word)) continue;
      rawCount += 1;

      const translation = limit(pickFirstNonBlank(item.translation, item.meaning, item.definition), 500);
      const definition = cleanText(pickFirstNonBlank(item.meaning, item.definition, item.translation));
      const record = {
        word,
        exam_type: ds.examType,
        phonetic: limit(item.phonetic, 100),
        definition,
        translation,
        example: cleanText(item.example),
        example_translation: sanitizeExampleTranslation(
          pickFirstNonBlank(item.exampleCn, item.example_translation, item.exampleTranslation)
        ),
        difficulty: toTinyInt(item.difficulty),
        frequency: toInt(item.frequency, ds.examType === "coca" ? Math.max(1, arr.length - i) : 0),
        tags: buildTags(item, ds.source),
      };

      const key = normalizedKey(record.word, record.exam_type);
      if (!map.has(key)) {
        map.set(key, record);
      } else {
        map.set(key, mergeRecord(map.get(key), record));
      }
    }

    stats.push({ examType: ds.examType, source: ds.source, rawCount });
  }

  return { records: Array.from(map.values()), stats };
}

async function insertTempTable(conn, records) {
  await conn.query(`
    CREATE TEMPORARY TABLE tmp_vocabulary_import (
      word VARCHAR(100) NOT NULL,
      exam_type VARCHAR(20) NOT NULL,
      phonetic VARCHAR(100) DEFAULT NULL,
      definition TEXT,
      translation VARCHAR(500) DEFAULT NULL,
      example TEXT,
      example_translation TEXT,
      difficulty TINYINT DEFAULT NULL,
      frequency INT DEFAULT 0,
      tags VARCHAR(255) DEFAULT NULL,
      PRIMARY KEY (word, exam_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const sql = `
    INSERT INTO tmp_vocabulary_import
      (word, exam_type, phonetic, definition, translation, example, example_translation, difficulty, frequency, tags)
    VALUES ?
  `;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE).map((r) => [
      r.word,
      r.exam_type,
      isBlank(r.phonetic) ? null : r.phonetic,
      isBlank(r.definition) ? null : r.definition,
      isBlank(r.translation) ? null : r.translation,
      isBlank(r.example) ? null : r.example,
      isBlank(r.example_translation) ? null : r.example_translation,
      r.difficulty == null ? null : r.difficulty,
      r.frequency || 0,
      isBlank(r.tags) ? null : r.tags,
    ]);
    await conn.query(sql, [batch]);
  }
}

async function syncToDb(conn) {
  const [updateRes] = await conn.query(`
    UPDATE vocabulary v
    JOIN tmp_vocabulary_import t
      ON v.word = t.word AND v.exam_type = t.exam_type
    SET
      v.phonetic = COALESCE(NULLIF(TRIM(t.phonetic), ''), v.phonetic),
      v.translation = COALESCE(NULLIF(TRIM(t.translation), ''), v.translation),
      v.definition = CASE
        WHEN COALESCE(TRIM(t.definition), '') <> '' THEN t.definition
        WHEN COALESCE(TRIM(v.definition), '') = '' AND COALESCE(TRIM(t.translation), '') <> '' THEN t.translation
        ELSE v.definition
      END,
      v.example = COALESCE(NULLIF(TRIM(t.example), ''), v.example),
      v.example_translation = COALESCE(NULLIF(TRIM(t.example_translation), ''), v.example_translation),
      v.difficulty = COALESCE(t.difficulty, v.difficulty),
      v.frequency = CASE
        WHEN COALESCE(t.frequency, 0) > COALESCE(v.frequency, 0) THEN t.frequency
        ELSE v.frequency
      END,
      v.tags = COALESCE(NULLIF(TRIM(t.tags), ''), v.tags),
      v.deleted = 0
  `);

  const [insertRes] = await conn.query(`
    INSERT INTO vocabulary
      (word, phonetic, definition, translation, example, example_translation, exam_type, difficulty, frequency, tags, deleted, create_time, update_time)
    SELECT
      t.word,
      NULLIF(TRIM(t.phonetic), ''),
      CASE
        WHEN COALESCE(TRIM(t.definition), '') <> '' THEN t.definition
        ELSE NULLIF(TRIM(t.translation), '')
      END,
      NULLIF(TRIM(t.translation), ''),
      NULLIF(TRIM(t.example), ''),
      NULLIF(TRIM(t.example_translation), ''),
      t.exam_type,
      t.difficulty,
      COALESCE(t.frequency, 0),
      NULLIF(TRIM(t.tags), ''),
      0,
      NOW(),
      NOW()
    FROM tmp_vocabulary_import t
    LEFT JOIN (
      SELECT DISTINCT word, exam_type
      FROM vocabulary
    ) v ON v.word = t.word AND v.exam_type = t.exam_type
    WHERE v.word IS NULL
  `);

  const [fillDefRes] = await conn.query(`
    UPDATE vocabulary
    SET definition = translation
    WHERE exam_type IN (${IMPORT_EXAM_TYPES.map(() => "?").join(",")})
      AND COALESCE(TRIM(definition), '') = ''
      AND COALESCE(TRIM(translation), '') <> ''
  `, IMPORT_EXAM_TYPES);

  return {
    updatedRows: updateRes.affectedRows || 0,
    insertedRows: insertRes.affectedRows || 0,
    filledDefinitions: fillDefRes.affectedRows || 0,
  };
}

async function printVerification(conn, expectedDistinctPairs) {
  const placeholders = IMPORT_EXAM_TYPES.map(() => "?").join(",");

  const [pairRows] = await conn.query(
    `
      SELECT COUNT(*) AS cnt
      FROM (
        SELECT word, exam_type
        FROM vocabulary
        WHERE exam_type IN (${placeholders})
        GROUP BY word, exam_type
      ) t
    `,
    IMPORT_EXAM_TYPES
  );

  const [emptyRows] = await conn.query(
    `
      SELECT
        SUM(CASE WHEN COALESCE(TRIM(phonetic), '') = '' THEN 1 ELSE 0 END) AS empty_phonetic,
        SUM(CASE WHEN COALESCE(TRIM(translation), '') = '' THEN 1 ELSE 0 END) AS empty_translation,
        SUM(CASE WHEN COALESCE(TRIM(definition), '') = '' THEN 1 ELSE 0 END) AS empty_definition,
        SUM(CASE WHEN COALESCE(TRIM(example), '') = '' THEN 1 ELSE 0 END) AS empty_example,
        SUM(CASE WHEN COALESCE(TRIM(example_translation), '') = '' THEN 1 ELSE 0 END) AS empty_example_translation
      FROM vocabulary
      WHERE exam_type IN (${placeholders})
    `,
    IMPORT_EXAM_TYPES
  );

  const [countRows] = await conn.query(
    `
      SELECT exam_type, COUNT(*) AS cnt
      FROM vocabulary
      WHERE exam_type IN (${placeholders})
      GROUP BY exam_type
      ORDER BY cnt DESC
    `,
    IMPORT_EXAM_TYPES
  );

  console.log("=== Verification ===");
  console.log(`Expected distinct pairs from files: ${expectedDistinctPairs}`);
  console.log(`Distinct pairs in DB (import exam types): ${pairRows[0]?.cnt ?? 0}`);
  console.log("Row count by exam_type:");
  for (const row of countRows) {
    console.log(`  ${row.exam_type}: ${row.cnt}`);
  }
  console.log("Empty field counts (import exam types):");
  console.log(
    `  phonetic=${emptyRows[0]?.empty_phonetic ?? 0}, translation=${emptyRows[0]?.empty_translation ?? 0}, definition=${emptyRows[0]?.empty_definition ?? 0}, example=${emptyRows[0]?.empty_example ?? 0}, example_translation=${emptyRows[0]?.empty_example_translation ?? 0}`
  );
}

async function main() {
  const scriptFile = fileURLToPath(import.meta.url);
  const rootDir = path.resolve(path.dirname(scriptFile), "..", "..");
  const { records, stats } = await collectRecords(rootDir);

  console.log("=== Source Stats ===");
  for (const s of stats) {
    console.log(`  ${s.examType.padEnd(12)} source=${s.source.padEnd(24)} raw_words=${s.rawCount}`);
  }
  console.log(`Distinct (word + exam_type) from files: ${records.length}`);

  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    charset: "utf8mb4",
    multipleStatements: false,
  });

  try {
    await conn.beginTransaction();
    await insertTempTable(conn, records);
    const res = await syncToDb(conn);
    await conn.commit();

    console.log("=== Sync Result ===");
    console.log(`Updated existing rows: ${res.updatedRows}`);
    console.log(`Inserted missing rows: ${res.insertedRows}`);
    console.log(`Filled empty definitions from translation: ${res.filledDefinitions}`);

    await printVerification(conn, records.length);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("Sync failed:", err?.message || err);
  process.exit(1);
});

