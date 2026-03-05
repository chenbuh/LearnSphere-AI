#!/usr/bin/env node

const API_BASE = process.env.API_BASE || "http://127.0.0.1:8080";
const ADMIN_USER = process.env.ADMIN_USER || "chen";
const ADMIN_PASS = process.env.ADMIN_PASS || "chen20040209";
const PAGE_SIZE = Number(process.env.PAGE_SIZE || 500);
const CONCURRENCY = Number(process.env.CONCURRENCY || 8);
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
  const low = s.toLowerCase();
  return low.includes("unavailable");
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
        throw new Error(`HTTP ${resp.status} ${text.slice(0, 280)}`);
      }
      if (body == null) throw new Error(`Invalid JSON: ${text.slice(0, 280)}`);
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
        throw new Error(`HTTP ${resp.status} ${text.slice(0, 280)}`);
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

async function loginAdmin() {
  const body = await requestJson(`${API_BASE}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
  });
  if (body?.code !== 200 || !body?.data?.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(body).slice(0, 300)}`);
  }
  return body.data.token;
}

async function getExamRows(token, examType) {
  const rows = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;
  while (rows.length < total) {
    const body = await requestJson(
      `${API_BASE}/api/admin/vocabulary?page=${page}&size=${PAGE_SIZE}&examType=${encodeURIComponent(examType)}`,
      {
        headers: {
          satoken: token,
          Origin: "http://localhost:5173",
          Referer: "http://localhost:5173/admin",
          "X-Real-IP": "10.20.1.1",
        },
      }
    );
    if (body?.code !== 200) {
      throw new Error(`Fetch list failed: ${JSON.stringify(body).slice(0, 300)}`);
    }
    const pageData = body.data || {};
    const list = Array.isArray(pageData.records) ? pageData.records : [];
    rows.push(...list);
    total = Number(pageData.total || rows.length);
    if (list.length === 0) break;
    page += 1;
  }
  return rows;
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

async function updateRow(token, row) {
  const ip = `10.30.${row.id % 200}.${(Math.floor(row.id / 200) % 200) + 1}`;
  const payload = {
    id: row.id,
    word: row.word,
    phonetic: row.phonetic,
    definition: row.definition,
    translation: row.translation,
    example: row.example,
    exampleTranslation: row.exampleTranslation,
    examType: row.examType,
    difficulty: row.difficulty,
    frequency: row.frequency,
    tags: row.tags,
  };
  const body = await requestJson(`${API_BASE}/api/admin/vocabulary/${row.id}`, {
    method: "PUT",
    headers: {
      satoken: token,
      Origin: "http://localhost:5173",
      Referer: "http://localhost:5173/admin",
      "X-Real-IP": ip,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (body?.code !== 200) {
    throw new Error(`update failed: ${JSON.stringify(body).slice(0, 280)}`);
  }
}

async function main() {
  const token = await loginAdmin();

  const allRows = [];
  for (const exam of TARGET_EXAMS) {
    const rows = await getExamRows(token, exam);
    allRows.push(...rows);
  }

  let badRows = allRows.filter(
    (r) => isBadDefinition(r.definition) || isBadExample(r.example) || isBadExampleCn(r.exampleTranslation)
  );
  if (MAX_ITEMS > 0) {
    badRows = badRows.slice(0, MAX_ITEMS);
  }

  console.log(`target_exams=${TARGET_EXAMS.join(",")}, all_rows=${allRows.length}, bad_rows=${badRows.length}`);
  if (badRows.length === 0) {
    console.log("No bad rows found.");
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
      if (i >= badRows.length) return;
      const row = badRows[i];
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

        const badDef = isBadDefinition(row.definition);
        const badEx = isBadExample(row.example);
        const badExCn = isBadExampleCn(row.exampleTranslation);

        if (badDef && dictItem.definition) {
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
        if (badEx) {
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
        }

        if (badEx && chosenExample && !isBadExample(chosenExample)) {
          row.example = chosenExample;
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
          if (cn) {
            row.exampleTranslation = cn;
          }
        }

        const changed =
          row.definition !== original.definition ||
          row.example !== original.example ||
          row.exampleTranslation !== original.exampleTranslation;

        if (!changed) {
          unchanged += 1;
        } else {
          if (row.definition !== original.definition) defFixed += 1;
          if (row.example !== original.example) exFixed += 1;
          if (row.exampleTranslation !== original.exampleTranslation) exCnFixed += 1;
          await updateRow(token, row);
          updated += 1;
        }
      } catch (err) {
        failed += 1;
        failures.push(`id=${row.id} word=${row.word} err=${String(err?.message || err)}`);
      }

      const done = updated + unchanged + failed;
      if (done % 50 === 0 || done === badRows.length) {
        const sec = ((Date.now() - start) / 1000).toFixed(1);
        console.log(
          `[w${workerId}] ${done}/${badRows.length} updated=${updated} unchanged=${unchanged} failed=${failed} elapsed=${sec}s`
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
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exitCode = 1;
});

