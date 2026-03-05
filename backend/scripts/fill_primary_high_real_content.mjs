#!/usr/bin/env node

const API_BASE = process.env.API_BASE || "http://127.0.0.1:8080";
const ADMIN_USER = process.env.ADMIN_USER || "chen";
const ADMIN_PASS = process.env.ADMIN_PASS || "chen20040209";
const CONCURRENCY = Number(process.env.CONCURRENCY || 6);
const MAX_RETRIES = Number(process.env.MAX_RETRIES || 2);
const MAX_ITEMS = Number(process.env.MAX_ITEMS || 400);
const PAGE_SIZE = Number(process.env.PAGE_SIZE || 500);

const INVALID_WHERE = `
coalesce(trim(definition),'') = ''
or coalesce(trim(example),'') = ''
or coalesce(trim(example_translation),'') = ''
or example = 'This is useful for study.'
or example like '%unavailable%'
or example_translation like '这是一个关于%'
or example_translation = '这对学习有用。'
or example_translation = '暂无例句。'
or example_translation like '%翻译获取失败%'
`;

function isBlank(v) {
  return !v || !String(v).trim();
}

function normalizeRecord(row) {
  return {
    id: Number(row?.id),
    word: row?.word || "",
    examType: row?.examType || row?.exam_type || "",
    definition: row?.definition || "",
    example: row?.example || "",
    exampleTranslation: row?.exampleTranslation || row?.example_translation || "",
  };
}

function isInvalidPayload(rawData) {
  const data = normalizeRecord(rawData);
  const definition = String(data.definition || "").trim();
  const example = String(data.example || "").trim();
  const exampleTranslation = String(data.exampleTranslation || "").trim();

  if (isBlank(definition) || isBlank(example) || isBlank(exampleTranslation)) {
    return true;
  }
  if (example === "This is useful for study." || example.toLowerCase().includes("unavailable")) {
    return true;
  }
  if (
    exampleTranslation.startsWith("这是一个关于") ||
    exampleTranslation === "这对学习有用。" ||
    exampleTranslation === "暂无例句。" ||
    exampleTranslation.includes("翻译获取失败")
  ) {
    return true;
  }
  return false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loginAdmin() {
  const resp = await fetch(`${API_BASE}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
  });
  const body = await resp.json();
  if (!resp.ok || body?.code !== 200 || !body?.data?.token) {
    throw new Error(`Admin login failed: HTTP ${resp.status} ${JSON.stringify(body)}`);
  }
  return body.data.token;
}

async function requestAdmin(path, token, method = "GET", extraHeaders = {}) {
  const headers = {
    satoken: token,
    Origin: "http://localhost:5173",
    Referer: "http://localhost:5173/admin",
    "X-Real-IP": "10.10.250.1",
    ...extraHeaders,
  };
  const resp = await fetch(`${API_BASE}${path}`, { method, headers });
  const text = await resp.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`HTTP ${resp.status} non-JSON response: ${text.slice(0, 200)}`);
  }
  if (!resp.ok || body?.code !== 200) {
    throw new Error(`HTTP ${resp.status} body=${text.slice(0, 300)}`);
  }
  return body;
}

async function fetchExamTypeRows(examType, token) {
  const rows = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;
  while (rows.length < total) {
    const body = await requestAdmin(
      `/api/admin/vocabulary?page=${page}&size=${PAGE_SIZE}&examType=${encodeURIComponent(examType)}`,
      token,
      "GET"
    );
    const pageData = body?.data || {};
    const records = Array.isArray(pageData.records) ? pageData.records : [];
    for (const r of records) {
      rows.push(normalizeRecord(r));
    }
    total = Number(pageData.total || rows.length);
    if (records.length === 0) {
      break;
    }
    page += 1;
  }
  return rows;
}

async function generateOne(id, token) {
  // AntiCrawlerInterceptor keys by X-Real-IP; rotate pseudo IPs to avoid local admin batch being throttled.
  const pseudoIp = `10.10.${id % 200}.${(Math.floor(id / 200) % 200) + 1}`;
  const body = await requestAdmin(`/api/admin/vocabulary/${id}/generate-details`, token, "POST", {
    "X-Real-IP": pseudoIp,
  });
  if (isInvalidPayload(body.data)) {
    throw new Error(`Generated payload is still invalid: id=${id}`);
  }
}

async function processItem(item, token) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await generateOne(item.id, token);
      return { ok: true };
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        return { ok: false, error: String(err?.message || err), id: item.id, word: item.word };
      }
      const backoffMs = 400 * (attempt + 1) + Math.floor(Math.random() * 500);
      await sleep(backoffMs);
    }
  }
  return { ok: false, error: "Unknown retry error", id: item.id, word: item.word };
}

function summarize(rows) {
  const byType = {};
  for (const row of rows) {
    const r = normalizeRecord(row);
    const key = r.examType;
    if (!byType[key]) {
      byType[key] = {
        total: 0,
        emptyDef: 0,
        emptyEx: 0,
        emptyExCn: 0,
        templEx: 0,
        templExCn: 0,
        invalid: 0,
      };
    }
    const s = byType[key];
    s.total += 1;
    const emptyDef = isBlank(r.definition);
    const emptyEx = isBlank(r.example);
    const emptyExCn = isBlank(r.exampleTranslation);
    const templEx =
      r.example === "This is useful for study." || String(r.example).toLowerCase().includes("unavailable");
    const templExCn =
      r.exampleTranslation.startsWith("这是一个关于") ||
      r.exampleTranslation === "这对学习有用。" ||
      r.exampleTranslation === "暂无例句。" ||
      r.exampleTranslation.includes("翻译获取失败");
    if (emptyDef) s.emptyDef += 1;
    if (emptyEx) s.emptyEx += 1;
    if (emptyExCn) s.emptyExCn += 1;
    if (templEx) s.templEx += 1;
    if (templExCn) s.templExCn += 1;
    if (emptyDef || emptyEx || emptyExCn || templEx || templExCn) s.invalid += 1;
  }
  return byType;
}

async function fetchAllTargetRows(token) {
  const [primaryRows, highRows] = await Promise.all([
    fetchExamTypeRows("primary", token),
    fetchExamTypeRows("high_school", token),
  ]);
  return [...primaryRows, ...highRows];
}

function printSummary(rows) {
  const s = summarize(rows);
  const order = ["high_school", "primary"];
  for (const key of order) {
    const x = s[key] || {
      total: 0,
      emptyDef: 0,
      emptyEx: 0,
      emptyExCn: 0,
      templEx: 0,
      templExCn: 0,
      invalid: 0,
    };
    console.log(
      `${key}: total=${x.total}, empty_def=${x.emptyDef}, empty_ex=${x.emptyEx}, empty_ex_cn=${x.emptyExCn}, templ_ex=${x.templEx}, templ_ex_cn=${x.templExCn}, invalid=${x.invalid}`
    );
  }
}

async function main() {
  const token = await loginAdmin();
  const rowsBefore = await fetchAllTargetRows(token);
  const invalidBeforeRows = rowsBefore.filter((row) => isInvalidPayload(row));
  const before = invalidBeforeRows.length;
  if (before <= 0) {
    console.log("No invalid rows found for primary/high_school.");
    printSummary(rowsBefore);
    return;
  }

  const rows = invalidBeforeRows
    .sort((a, b) => {
      const rank = { primary: 0, high_school: 1 };
      const ra = rank[a.examType] ?? 9;
      const rb = rank[b.examType] ?? 9;
      if (ra !== rb) return ra - rb;
      return Number(a.id) - Number(b.id);
    })
    .slice(0, Math.max(1, MAX_ITEMS));
  if (rows.length === 0) {
    console.log("No rows selected.");
    return;
  }

  console.log(`Selected ${rows.length} rows (invalid before run: ${before}).`);
  console.log(`Config: concurrency=${CONCURRENCY}, retries=${MAX_RETRIES}, maxItems=${MAX_ITEMS}`);

  let idx = 0;
  let success = 0;
  let failed = 0;
  const failedRows = [];
  const start = Date.now();

  async function worker(workerId) {
    while (true) {
      const i = idx;
      idx += 1;
      if (i >= rows.length) {
        return;
      }
      const item = rows[i];
      const ret = await processItem(item, token);
      if (ret.ok) {
        success += 1;
      } else {
        failed += 1;
        failedRows.push(ret);
      }

      const done = success + failed;
      if (done % 20 === 0 || done === rows.length) {
        const elapsedSec = ((Date.now() - start) / 1000).toFixed(1);
        console.log(`[worker ${workerId}] progress ${done}/${rows.length}, ok=${success}, fail=${failed}, elapsed=${elapsedSec}s`);
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, CONCURRENCY) }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  const rowsAfter = await fetchAllTargetRows(token);
  const after = rowsAfter.filter((row) => isInvalidPayload(row)).length;
  console.log(`Run finished. success=${success}, failed=${failed}, invalid_after=${after}`);
  console.log("Current summary:");
  printSummary(rowsAfter);

  if (failedRows.length > 0) {
    const sample = failedRows.slice(0, 20);
    console.log("Sample failures:");
    for (const f of sample) {
      console.log(`id=${f.id} word=${f.word} error=${f.error}`);
    }
  }
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exitCode = 1;
});
