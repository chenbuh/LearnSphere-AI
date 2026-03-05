#!/usr/bin/env node

import mysql from "mysql2/promise";

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "chen20040209";
const DB_NAME = process.env.DB_NAME || "learnsphere_ai";

const CONCURRENCY = Number(process.env.CONCURRENCY || 6);
const MAX_RETRIES = Number(process.env.MAX_RETRIES || 3);
const MAX_ITEMS = Number(process.env.MAX_ITEMS || 0); // 0 means all

const TARGET_EXAMS = (process.env.TARGET_EXAMS || "cet4,cet6,gre,ielts,toefl,postgraduate")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isBadDefinition(v) {
  const s = String(v || "").trim();
  if (!s) return true;
  return s.toLowerCase().includes("unavailable");
}

function isBadExample(v) {
  const s = String(v || "").trim();
  if (!s) return true;
  const low = s.toLowerCase();
  return s === "This is useful for study." || s === "Example unavailable." || low.includes("unavailable");
}

function isBadExampleCn(v) {
  const s = String(v || "").trim();
  if (!s) return true;
  const low = s.toLowerCase();
  return (
    s === "这对学习有用。" ||
    s === "暂无例句。" ||
    s.startsWith("这是一个关于") ||
    s.includes("翻译获取失败") ||
    s.includes("示例翻译不可用") ||
    low.includes("translation failed") ||
    low.includes("query length limit exceeded")
  );
}

function normWord(word) {
  return String(word || "")
    .trim()
    .toLowerCase()
    .replace(/[\s\-.'"]/g, "");
}

async function requestJson(url, options = {}, retries = MAX_RETRIES) {
  let lastErr = null;
  for (let i = 0; i <= retries; i += 1) {
    try {
      const resp = await fetch(url, options);
      const text = await resp.text();
      let body = null;
      try {
        body = JSON.parse(text);
      } catch {
        body = null;
      }
      if (!resp.ok) {
        const retryable = resp.status === 429 || resp.status >= 500;
        if (retryable && i < retries) {
          await sleep(300 * (i + 1));
          continue;
        }
        throw new Error(`HTTP ${resp.status} ${text.slice(0, 220)}`);
      }
      if (body == null) throw new Error(`Invalid JSON: ${text.slice(0, 220)}`);
      return body;
    } catch (err) {
      lastErr = err;
      if (i < retries) {
        await sleep(300 * (i + 1));
        continue;
      }
      throw lastErr;
    }
  }
  throw lastErr || new Error("Unknown request error");
}

async function requestText(url, options = {}, retries = MAX_RETRIES) {
  let lastErr = null;
  for (let i = 0; i <= retries; i += 1) {
    try {
      const resp = await fetch(url, options);
      const text = await resp.text();
      if (!resp.ok) {
        const retryable = resp.status === 429 || resp.status >= 500;
        if (retryable && i < retries) {
          await sleep(300 * (i + 1));
          continue;
        }
        throw new Error(`HTTP ${resp.status} ${text.slice(0, 220)}`);
      }
      return text;
    } catch (err) {
      lastErr = err;
      if (i < retries) {
        await sleep(300 * (i + 1));
        continue;
      }
      throw lastErr;
    }
  }
  throw lastErr || new Error("Unknown request error");
}

function decodeHtml(s) {
  return String(s || "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickFromDictionaryApi(jsonArr) {
  if (!Array.isArray(jsonArr)) return { definition: "", example: "" };
  let definition = "";
  let example = "";
  for (const entry of jsonArr) {
    const meanings = Array.isArray(entry?.meanings) ? entry.meanings : [];
    for (const m of meanings) {
      const defs = Array.isArray(m?.definitions) ? m.definitions : [];
      for (const d of defs) {
        const def = String(d?.definition || "").trim();
        const ex = String(d?.example || "").trim();
        if (!definition && def && !def.toLowerCase().includes("unavailable")) {
          definition = def;
        }
        if (!example && ex && !isBadExample(ex)) {
          example = ex;
        }
        if (definition && example) {
          return { definition, example };
        }
      }
    }
  }
  return { definition, example };
}

async function fetchDictionaryWord(word) {
  const variants = Array.from(
    new Set([
      String(word || "").trim(),
      String(word || "")
        .trim()
        .replace(/\./g, ""),
      String(word || "")
        .trim()
        .replace(/-/g, ""),
      String(word || "")
        .trim()
        .replace(/-/g, " "),
    ])
  ).filter(Boolean);

  let best = { definition: "", example: "" };
  for (const v of variants) {
    try {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(v)}`;
      const body = await requestJson(url, {}, 1);
      const item = pickFromDictionaryApi(body);
      if (!best.definition && item.definition) best.definition = item.definition;
      if (!best.example && item.example) best.example = item.example;
      if (best.definition && best.example) return best;
    } catch {
      // ignore miss
    }
  }
  return best;
}

async function translateEnToZh(text) {
  const url =
    "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(text) +
    "&langpair=en|zh-CN";
  const body = await requestJson(url, {}, 2);
  const direct = String(body?.responseData?.translatedText || "").trim();
  if (direct) return direct;
  const matches = Array.isArray(body?.matches) ? body.matches : [];
  for (const m of matches) {
    const t = String(m?.translation || "").trim();
    if (t) return t;
  }
  return "";
}

function flattenTranslations(translations) {
  const out = [];
  if (!Array.isArray(translations)) return out;
  for (const grp of translations) {
    if (!Array.isArray(grp)) continue;
    for (const item of grp) {
      if (item) out.push(item);
    }
  }
  return out;
}

async function fetchTatoebaPair(word) {
  const url =
    "https://tatoeba.org/en/api_v0/search?from=eng&to=cmn&query=" + encodeURIComponent(String(word || "").trim());
  const body = await requestJson(url, {}, 1);
  const results = Array.isArray(body?.results) ? body.results : [];
  const w = String(word || "").toLowerCase().trim();

  for (const r of results) {
    const en = String(r?.text || "").trim();
    if (!en || isBadExample(en)) continue;
    if (en.length > 180) continue;
    if (w && !en.toLowerCase().includes(w)) continue;

    const trans = flattenTranslations(r?.translations);
    let zh = "";
    for (const t of trans) {
      const lang = String(t?.lang || "").toLowerCase();
      const txt = String(t?.text || "").trim();
      if (!txt) continue;
      if (lang === "cmn" || lang === "zh" || lang.startsWith("zh-")) {
        zh = txt;
        break;
      }
    }
    if (zh && !isBadExampleCn(zh)) {
      return { example: en, exampleTranslation: zh };
    }
  }
  return { example: "", exampleTranslation: "" };
}

async function fetchMerriamSentence(word) {
  const variants = Array.from(
    new Set([
      String(word || "").trim(),
      String(word || "")
        .trim()
        .replace(/-/g, ""),
      String(word || "")
        .trim()
        .replace(/-/g, " "),
      String(word || "")
        .trim()
        .replace(/\./g, ""),
    ])
  ).filter(Boolean);

  for (const v of variants) {
    try {
      const html = await requestText(`https://www.merriam-webster.com/sentences/${encodeURIComponent(v)}`, {}, 1);
      const m = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
      if (!m) continue;
      const desc = decodeHtml(m[1]);
      const p = desc.match(/in a sentence:\s*(.+)$/i);
      if (!p) continue;
      const ex = String(p[1] || "").trim();
      if (ex && !isBadExample(ex) && ex.length <= 220) {
        return ex;
      }
    } catch {
      // next variant
    }
  }
  return "";
}

async function fetchMerriamDefinition(word) {
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

  for (const v of variants) {
    try {
      const html = await requestText(`https://www.merriam-webster.com/dictionary/${encodeURIComponent(v)}`, {}, 1);
      const m = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
      if (!m) continue;
      const desc = decodeHtml(m[1]);
      const p = desc.match(/The meaning of [A-Z0-9\- ]+ is\s+(.+?)(?:\.\s|:\s|$)/i);
      if (!p) continue;
      const def = String(p[1] || "").trim();
      if (def && !def.toLowerCase().includes("unavailable")) {
        return def;
      }
    } catch {
      // next variant
    }
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
    connectionLimit: Math.max(4, CONCURRENCY),
  });

  const placeholders = TARGET_EXAMS.map(() => "?").join(",");
  const [rowsRaw] = await pool.query(
    `
    SELECT id, word, exam_type AS examType, definition, example, example_translation AS exampleTranslation
    FROM vocabulary
    WHERE deleted=0
      AND exam_type IN (${placeholders})
      AND (
        COALESCE(TRIM(definition),'')='' OR
        COALESCE(TRIM(example),'')='' OR
        COALESCE(TRIM(example_translation),'')='' OR
        definition LIKE '%unavailable%' OR
        example='This is useful for study.' OR
        example='Example unavailable.' OR
                example LIKE '%unavailable%' OR
        example_translation='这对学习有用。' OR
        example_translation='暂无例句。' OR
        example_translation LIKE '这是一个关于%' OR
        example_translation LIKE '%翻译获取失败%' OR
        example_translation LIKE '%示例翻译不可用%' OR
        LOWER(example_translation) LIKE '%translation failed%' OR
        LOWER(example_translation) LIKE '%query length limit exceeded%'
      )
    ORDER BY id
    `,
    TARGET_EXAMS
  );

  let rows = Array.isArray(rowsRaw) ? rowsRaw : [];
  if (MAX_ITEMS > 0) {
    rows = rows.slice(0, MAX_ITEMS);
  }
  console.log(`target_exams=${TARGET_EXAMS.join(",")}, bad_rows=${rows.length}`);
  if (rows.length === 0) {
    await pool.end();
    return;
  }

  const dictCache = new Map();
  const transCache = new Map();
  const tatoebaCache = new Map();
  const mwSentenceCache = new Map();
  const mwDefCache = new Map();

  let idx = 0;
  let updated = 0;
  let unchanged = 0;
  let failed = 0;
  let defFixed = 0;
  let exFixed = 0;
  let exCnFixed = 0;
  const failures = [];
  const start = Date.now();

  async function worker(workerId) {
    while (true) {
      const i = idx;
      idx += 1;
      if (i >= rows.length) return;
      const row = rows[i];
      const original = {
        definition: row.definition,
        example: row.example,
        exampleTranslation: row.exampleTranslation,
      };
      const nword = normWord(row.word);

      try {
        let dictItem = dictCache.get(nword);
        if (!dictItem) {
          try {
            dictItem = await fetchDictionaryWord(row.word);
          } catch {
            dictItem = { definition: "", example: "" };
          }
          dictCache.set(nword, dictItem);
        }

        if (isBadDefinition(row.definition) && dictItem.definition) {
          row.definition = dictItem.definition;
        }
        if (isBadDefinition(row.definition)) {
          let mwDef = mwDefCache.get(nword);
          if (!mwDef) {
            try {
              mwDef = await fetchMerriamDefinition(row.word);
            } catch {
              mwDef = "";
            }
            mwDefCache.set(nword, mwDef || "");
          }
          if (mwDef && !isBadDefinition(mwDef)) {
            row.definition = mwDef;
          }
        }

        let chosenExample = row.example;
        if (isBadExample(row.example)) {
          if (dictItem.example) chosenExample = dictItem.example;
          if (isBadExample(chosenExample)) {
            let tb = tatoebaCache.get(nword);
            if (!tb) {
              try {
                tb = await fetchTatoebaPair(row.word);
              } catch {
                tb = { example: "", exampleTranslation: "" };
              }
              tatoebaCache.set(nword, tb);
            }
            if (tb.example && !isBadExample(tb.example)) {
              chosenExample = tb.example;
              if (tb.exampleTranslation && !isBadExampleCn(tb.exampleTranslation)) {
                row.exampleTranslation = tb.exampleTranslation;
              }
            }
          }
          if (isBadExample(chosenExample)) {
            let mwEx = mwSentenceCache.get(nword);
            if (!mwEx) {
              try {
                mwEx = await fetchMerriamSentence(row.word);
              } catch {
                mwEx = "";
              }
              mwSentenceCache.set(nword, mwEx || "");
            }
            if (mwEx && !isBadExample(mwEx)) {
              chosenExample = mwEx;
            }
          }
          if (chosenExample && !isBadExample(chosenExample)) {
            row.example = chosenExample;
          }
        }

        if (isBadExampleCn(row.exampleTranslation) && !isBadExample(row.example)) {
          let cn = transCache.get(row.example);
          if (!cn) {
            try {
              cn = await translateEnToZh(row.example);
            } catch {
              cn = "";
            }
            if (cn) transCache.set(row.example, cn);
          }
          if (cn) row.exampleTranslation = cn;
        }

        const changed =
          row.definition !== original.definition ||
          row.example !== original.example ||
          row.exampleTranslation !== original.exampleTranslation;

        if (!changed) {
          unchanged += 1;
        } else {
          await pool.query(
            "UPDATE vocabulary SET definition=?, example=?, example_translation=?, update_time=NOW() WHERE id=?",
            [row.definition, row.example, row.exampleTranslation, row.id]
          );
          if (row.definition !== original.definition) defFixed += 1;
          if (row.example !== original.example) exFixed += 1;
          if (row.exampleTranslation !== original.exampleTranslation) exCnFixed += 1;
          updated += 1;
        }
      } catch (err) {
        failed += 1;
        failures.push(`id=${row.id} word=${row.word} err=${String(err?.message || err)}`);
      }

      const done = updated + unchanged + failed;
      if (done % 50 === 0 || done === rows.length) {
        const sec = ((Date.now() - start) / 1000).toFixed(1);
        console.log(
          `[w${workerId}] ${done}/${rows.length} updated=${updated} unchanged=${unchanged} failed=${failed} elapsed=${sec}s`
        );
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, CONCURRENCY) }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  console.log(
    `DONE updated=${updated}, unchanged=${unchanged}, failed=${failed}, def_fixed=${defFixed}, ex_fixed=${exFixed}, excn_fixed=${exCnFixed}`
  );
  if (failures.length > 0) {
    console.log("Sample failures:");
    for (const f of failures.slice(0, 30)) {
      console.log(f);
    }
  }

  await pool.end();
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exitCode = 1;
});

