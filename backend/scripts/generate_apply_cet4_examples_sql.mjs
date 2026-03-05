#!/usr/bin/env node

import fs from "fs";
import path from "path";

const inputPath = path.resolve("frontend-vue/src/data/cet4_words.js");
const outDir = path.resolve("backend/tmp");
const outputPath = path.join(outDir, "apply_cet4_examples.sql");

function esc(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .replace(/\u0000/g, "");
}

function decodeJsString(value) {
  return String(value || "")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .replace(/\\\\/g, "\\")
    .trim();
}

const rows = new Map();
const text = fs.readFileSync(inputPath, "utf8");
const lines = text.split(/\r?\n/);
const lineRe =
  /word:\s*"((?:[^"\\]|\\.)*)".*?examType:\s*"cet4".*?example:\s*"((?:[^"\\]|\\.)*)".*?exampleCn:\s*"((?:[^"\\]|\\.)*)"/;

for (const line of lines) {
  const m = line.match(lineRe);
  if (!m) continue;
  const word = decodeJsString(m[1]).toLowerCase();
  const example = decodeJsString(m[2]);
  const exampleCn = decodeJsString(m[3]);
  if (!word || !example || !exampleCn) continue;
  if (!rows.has(word)) {
    rows.set(word, { word, example, exampleCn });
  }
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const values = [];
for (const r of rows.values()) {
  values.push(`('${esc(r.word)}','${esc(r.example)}','${esc(r.exampleCn)}')`);
}

const chunks = [];
const chunkSize = 500;
for (let i = 0; i < values.length; i += chunkSize) {
  chunks.push(values.slice(i, i + chunkSize));
}

let sql = "";
sql += "START TRANSACTION;\n\n";
sql += "DROP TEMPORARY TABLE IF EXISTS tmp_cet4_examples;\n";
sql += "CREATE TEMPORARY TABLE tmp_cet4_examples (\n";
sql += "  word VARCHAR(128) PRIMARY KEY,\n";
sql += "  example TEXT NOT NULL,\n";
sql += "  example_translation TEXT NOT NULL\n";
sql += ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n";

for (const chunk of chunks) {
  sql += "INSERT INTO tmp_cet4_examples (word, example, example_translation) VALUES\n";
  sql += chunk.join(",\n");
  sql += ";\n\n";
}

sql += "UPDATE vocabulary v\n";
sql += "JOIN tmp_cet4_examples e ON LOWER(TRIM(v.word)) = e.word\n";
sql += "SET\n";
sql += "  v.example = CASE\n";
sql += "    WHEN (COALESCE(TRIM(v.example),'')='' OR v.example='This is useful for study.' OR v.example='Example unavailable.' OR LOWER(v.example) LIKE '%unavailable%')\n";
sql += "      THEN e.example\n";
sql += "    ELSE v.example\n";
sql += "  END,\n";
sql += "  v.example_translation = CASE\n";
sql += "    WHEN (COALESCE(TRIM(v.example_translation),'')='' OR v.example_translation='这对学习有用。' OR v.example_translation='暂无例句。' OR v.example_translation LIKE '这是一个关于%' OR v.example_translation LIKE '%翻译获取失败%')\n";
sql += "      THEN e.example_translation\n";
sql += "    ELSE v.example_translation\n";
sql += "  END,\n";
sql += "  v.update_time = NOW()\n";
sql += "WHERE v.deleted=0\n";
sql += "  AND v.exam_type='cet4'\n";
sql += "  AND (\n";
sql += "    COALESCE(TRIM(v.example),'')=''\n";
sql += "    OR v.example='This is useful for study.'\n";
sql += "    OR v.example='Example unavailable.'\n";
sql += "    OR LOWER(v.example) LIKE '%unavailable%'\n";
sql += "    OR COALESCE(TRIM(v.example_translation),'')=''\n";
sql += "    OR v.example_translation='这对学习有用。'\n";
sql += "    OR v.example_translation='暂无例句。'\n";
sql += "    OR v.example_translation LIKE '这是一个关于%'\n";
sql += "    OR v.example_translation LIKE '%翻译获取失败%'\n";
sql += "  );\n\n";

sql += "SELECT ROW_COUNT() AS rows_updated;\n";
sql += "COMMIT;\n";

fs.writeFileSync(outputPath, sql, "utf8");
console.log(`parsed_words=${rows.size}`);
console.log(`output=${outputPath}`);
