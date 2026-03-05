import fs from 'fs';
import path from 'path';

const inputPath = path.resolve('frontend-vue/src/data/example-sentences.js');
const outputPath = path.resolve('backend/tmp/apply_real_examples.sql');

function esc(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\u0000/g, '');
}

const text = fs.readFileSync(inputPath, 'utf8');
const re = /"([^"]+)"\s*:\s*\{\s*en:\s*"([^"]+)"\s*,\s*cn:\s*"([^"]+)"\s*\}/g;

const unique = new Map();
let m;
while ((m = re.exec(text)) !== null) {
  const word = m[1].trim().toLowerCase();
  const en = m[2].trim();
  const cn = m[3].trim();
  if (!word || !en || !cn) continue;
  if (!unique.has(word)) {
    unique.set(word, { word, en, cn });
  }
}

const values = [];
for (const r of unique.values()) {
  values.push(`('${esc(r.word)}','${esc(r.en)}','${esc(r.cn)}')`);
}

const chunkSize = 500;
const chunks = [];
for (let i = 0; i < values.length; i += chunkSize) {
  chunks.push(values.slice(i, i + chunkSize));
}

let sql = '';
sql += 'START TRANSACTION;\n\n';
sql += 'CREATE TEMPORARY TABLE tmp_real_examples (\n';
sql += '  word VARCHAR(128) PRIMARY KEY,\n';
sql += '  example TEXT NOT NULL,\n';
sql += '  example_translation TEXT NOT NULL,\n';
sql += "  norm_word VARCHAR(160) AS (LOWER(REPLACE(REPLACE(REPLACE(word,' ',''),'-',''),'.',''))) STORED,\n";
sql += '  KEY idx_norm_word (norm_word)\n';
sql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n';

for (const chunk of chunks) {
  sql += 'INSERT INTO tmp_real_examples (word, example, example_translation) VALUES\n';
  sql += chunk.join(',\n');
  sql += ';\n\n';
}

sql += '-- exact word update\n';
sql += 'UPDATE vocabulary t\n';
sql += 'JOIN tmp_real_examples e ON e.word = LOWER(t.word)\n';
sql += 'SET\n';
sql += "  t.example = CASE WHEN (COALESCE(TRIM(t.example),'')='' OR t.example='This is useful for study.' OR t.example LIKE '%unavailable%' OR COALESCE(TRIM(t.example_translation),'')='' OR t.example_translation LIKE '这是一个关于%' OR t.example_translation='这对学习有用。' OR t.example_translation='暂无例句。' OR t.example_translation LIKE '%翻译获取失败%') THEN e.example ELSE t.example END,\n";
sql += "  t.example_translation = CASE WHEN (COALESCE(TRIM(t.example_translation),'')='' OR t.example_translation LIKE '这是一个关于%' OR t.example_translation='这对学习有用。' OR t.example_translation='暂无例句。' OR t.example_translation LIKE '%翻译获取失败%' OR COALESCE(TRIM(t.example),'')='' OR t.example='This is useful for study.' OR t.example LIKE '%unavailable%') THEN e.example_translation ELSE t.example_translation END,\n";
sql += '  t.update_time = NOW()\n';
sql += "WHERE t.exam_type IN ('primary','high_school')\n";
sql += "  AND (COALESCE(TRIM(t.example),'')='' OR t.example='This is useful for study.' OR t.example LIKE '%unavailable%' OR COALESCE(TRIM(t.example_translation),'')='' OR t.example_translation LIKE '这是一个关于%' OR t.example_translation='这对学习有用。' OR t.example_translation='暂无例句。' OR t.example_translation LIKE '%翻译获取失败%');\n\n";

sql += '-- normalized word update\n';
sql += 'UPDATE vocabulary t\n';
sql += 'JOIN tmp_real_examples e\n';
sql += "  ON e.norm_word = LOWER(REPLACE(REPLACE(REPLACE(t.word,' ',''),'-',''),'.',''))\n";
sql += 'SET\n';
sql += "  t.example = CASE WHEN (COALESCE(TRIM(t.example),'')='' OR t.example='This is useful for study.' OR t.example LIKE '%unavailable%' OR COALESCE(TRIM(t.example_translation),'')='' OR t.example_translation LIKE '这是一个关于%' OR t.example_translation='这对学习有用。' OR t.example_translation='暂无例句。' OR t.example_translation LIKE '%翻译获取失败%') THEN e.example ELSE t.example END,\n";
sql += "  t.example_translation = CASE WHEN (COALESCE(TRIM(t.example_translation),'')='' OR t.example_translation LIKE '这是一个关于%' OR t.example_translation='这对学习有用。' OR t.example_translation='暂无例句。' OR t.example_translation LIKE '%翻译获取失败%' OR COALESCE(TRIM(t.example),'')='' OR t.example='This is useful for study.' OR t.example LIKE '%unavailable%') THEN e.example_translation ELSE t.example_translation END,\n";
sql += '  t.update_time = NOW()\n';
sql += "WHERE t.exam_type IN ('primary','high_school')\n";
sql += "  AND (COALESCE(TRIM(t.example),'')='' OR t.example='This is useful for study.' OR t.example LIKE '%unavailable%' OR COALESCE(TRIM(t.example_translation),'')='' OR t.example_translation LIKE '这是一个关于%' OR t.example_translation='这对学习有用。' OR t.example_translation='暂无例句。' OR t.example_translation LIKE '%翻译获取失败%');\n\n";

sql += 'COMMIT;\n';

fs.writeFileSync(outputPath, sql, 'utf8');
console.log('realExamples parsed:', unique.size);
console.log('sql:', outputPath);
