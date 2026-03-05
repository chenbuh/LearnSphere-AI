#!/usr/bin/env node

import fs from "fs";
import path from "path";

const inputPath = path.resolve("frontend-vue/src/data/example-sentences.js");
const outputPath = path.resolve("backend/tmp/apply_real_examples_other_exams.sql");

function esc(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .replace(/\u0000/g, "");
}

const text = fs.readFileSync(inputPath, "utf8");
const re = /"([^"]+)"\s*:\s*\{\s*en:\s*"([^"]+)"\s*,\s*cn:\s*"([^"]+)"\s*\}/g;

const unique = new Map();
let m;
while ((m = re.exec(text)) !== null) {
  const word = m[1].trim().toLowerCase();
  const en = m[2].trim();
  if (!word || !en) continue;
  if (!unique.has(word)) {
    unique.set(word, { word, en });
  }
}

const values = [];
for (const r of unique.values()) {
  values.push(`('${esc(r.word)}','${esc(r.en)}')`);
}

const chunkSize = 500;
const chunks = [];
for (let i = 0; i < values.length; i += chunkSize) {
  chunks.push(values.slice(i, i + chunkSize));
}

let sql = "";
sql += "START TRANSACTION;\n\n";
sql += "CREATE TEMPORARY TABLE tmp_real_examples_other (\n";
sql += "  word VARCHAR(128) PRIMARY KEY,\n";
sql += "  example TEXT NOT NULL,\n";
sql += "  norm_word VARCHAR(160) AS (LOWER(REPLACE(REPLACE(REPLACE(word,' ',''),'-',''),'.',''))) STORED,\n";
sql += "  KEY idx_norm_word (norm_word)\n";
sql += ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n";

for (const chunk of chunks) {
  sql += "INSERT INTO tmp_real_examples_other (word, example) VALUES\n";
  sql += chunk.join(",\n");
  sql += ";\n\n";
}

sql += "UPDATE vocabulary t\n";
sql += "JOIN tmp_real_examples_other e ON e.word = LOWER(t.word)\n";
sql += "SET\n";
sql += "  t.example = CASE WHEN (COALESCE(TRIM(t.example),'')='' OR t.example='This is useful for study.' OR t.example='Example unavailable.' OR t.example LIKE '%unavailable%') THEN e.example ELSE t.example END,\n";
sql += "  t.update_time = NOW()\n";
sql += "WHERE t.deleted=0\n";
sql += "  AND t.exam_type NOT IN ('primary','high_school')\n";
sql += "  AND (COALESCE(TRIM(t.example),'')='' OR t.example='This is useful for study.' OR t.example='Example unavailable.' OR t.example LIKE '%unavailable%');\n\n";

sql += "UPDATE vocabulary t\n";
sql += "JOIN tmp_real_examples_other e\n";
sql += "  ON e.norm_word = LOWER(REPLACE(REPLACE(REPLACE(t.word,' ',''),'-',''),'.',''))\n";
sql += "SET\n";
sql += "  t.example = CASE WHEN (COALESCE(TRIM(t.example),'')='' OR t.example='This is useful for study.' OR t.example='Example unavailable.' OR t.example LIKE '%unavailable%') THEN e.example ELSE t.example END,\n";
sql += "  t.update_time = NOW()\n";
sql += "WHERE t.deleted=0\n";
sql += "  AND t.exam_type NOT IN ('primary','high_school')\n";
sql += "  AND (COALESCE(TRIM(t.example),'')='' OR t.example='This is useful for study.' OR t.example='Example unavailable.' OR t.example LIKE '%unavailable%');\n\n";

sql += "COMMIT;\n";

fs.writeFileSync(outputPath, sql, "utf8");
console.log("realExamples parsed:", unique.size);
console.log("sql:", outputPath);
