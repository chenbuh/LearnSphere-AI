#!/usr/bin/env node

import mysql from "mysql2/promise";

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "chen20040209";
const DB_NAME = process.env.DB_NAME || "learnsphere_ai";

const CONCURRENCY = Number(process.env.CONCURRENCY || 10);
const MAX_RETRIES = Number(process.env.MAX_RETRIES || 2);
const MAX_ITEMS = Number(process.env.MAX_ITEMS || 0); // 0 = all

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(s) {
  return String(s || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normWord(word) {
  return String(word || "")
    .trim()
    .toLowerCase()
    .replace(/[\s\-.'"]/g, "");
}

const HARD_FALLBACKS = new Map(
  Object.entries({
    conjunction: {
      example: "Use a conjunction like 'and' to connect two clauses.",
      cn: "用 and 这样的连接词来连接两个分句。",
    },
    inser: {
      example: "In the draft, inser appears as a misspelling of insert.",
      cn: "在这份草稿里，inser 是 insert 的拼写错误。",
    },
    accommodatio: {
      example: "Accommodatio in this note is a misspelling of accommodation.",
      cn: "这条备注中的 accommodatio 是 accommodation 的拼写错误。",
    },
    reservior: {
      example: "Reservior is a common misspelling of reservoir.",
      cn: "reservior 是 reservoir 的常见拼写错误。",
    },
    und: {
      example: 'In German, und means "and".',
      cn: "在德语中，und 的意思是“和”。",
    },
    marxism: {
      example: "The seminar compares Marxism with liberalism.",
      cn: "这场研讨课比较了马克思主义与自由主义。",
    },
    meridiem: {
      example: "The invitation says the ceremony starts at ten ante meridiem.",
      cn: "邀请函写着仪式在上午十点开始。",
    },
    annal: {
      example: "The archive keeps an annal of major events each year.",
      cn: "档案馆每年都会保存一份重大事件编年记录。",
    },
    "anti-communist": {
      example: "The paper published an anti-communist editorial in 1950.",
      cn: "这家报纸在 1950 年发表过一篇反共社论。",
    },
    authoritarianism: {
      example: "Many scholars warn that fear can fuel authoritarianism.",
      cn: "许多学者警告说，恐惧会助长威权主义。",
    },
    biblical: {
      example: "The museum displayed biblical manuscripts from the fourth century.",
      cn: "博物馆展出了四世纪的《圣经》手稿。",
    },
    cornerback: {
      example: "The cornerback intercepted the pass in the final minute.",
      cn: "这名角卫在最后一分钟完成了抄截。",
    },
    crucifix: {
      example: "A wooden crucifix hung above the altar.",
      cn: "祭坛上方挂着一个木制十字架苦像。",
    },
    enamor: {
      example: "The old town can enamor first-time visitors.",
      cn: "这座古城会让初次到访的人着迷。",
    },
    ethicist: {
      example: "An ethicist reviewed the clinical trial before it began.",
      cn: "一位伦理学家在临床试验开始前进行了审查。",
    },
    fucker: {
      example: 'He was suspended for shouting "fucker" at a coworker.',
      cn: "他因对同事大喊“fucker”而被停职。",
    },
    horny: {
      example: "The cactus has hard, horny spines for protection.",
      cn: "这株仙人掌长有坚硬的角质刺来保护自己。",
    },
    incest: {
      example: "The novel confronts the taboo of incest in a small town.",
      cn: "这部小说直面了小镇中的乱伦禁忌。",
    },
    jihadist: {
      example: "The report tracks how jihadist groups recruit online.",
      cn: "这份报告追踪了圣战主义组织如何在网上招募成员。",
    },
    kurd: {
      example: "The journalist interviewed a Kurd from northern Iraq.",
      cn: "记者采访了一位来自伊拉克北部的库尔德人。",
    },
    mishandle: {
      example: "The company apologized for mishandling customer data.",
      cn: "这家公司为错误处理客户数据道歉。",
    },
    motherfucker: {
      example: "The warning notes that motherfucker is a highly offensive insult.",
      cn: "该提示指出，motherfucker 是一种极具冒犯性的辱骂语。",
    },
    nazism: {
      example: "The course examines the rise of Nazism in Europe.",
      cn: "这门课程研究了纳粹主义在欧洲的兴起。",
    },
    nigger: {
      example: "The lesson explains that nigger is an extremely racist slur.",
      cn: "课程说明 nigger 是一种极端种族歧视的蔑称。",
    },
    panamanian: {
      example: "They hired a Panamanian guide for the canal tour.",
      cn: "他们为运河之旅雇了一位巴拿马向导。",
    },
    politicization: {
      example: "Critics worry about the politicization of public health.",
      cn: "批评者担心公共卫生问题被政治化。",
    },
    politicize: {
      example: "Leaders should not politicize scientific advice.",
      cn: "领导者不应将科学建议政治化。",
    },
    pornographic: {
      example: "The site was removed for posting pornographic material.",
      cn: "该网站因发布色情内容被下架。",
    },
    seethe: {
      example: "He began to seethe after hearing the unfair decision.",
      cn: "听到这项不公平的决定后，他开始怒火中烧。",
    },
    slut: {
      example: "The teacher explained that slut is an insulting and sexist label.",
      cn: "老师解释说，slut 是一种带有性别歧视的侮辱性称呼。",
    },
    smallmouth: {
      example: "Anglers come to this river for smallmouth bass.",
      cn: "钓鱼者来到这条河里钓小口黑鲈。",
    },
    subtest: {
      example: "Applicants complete a reading subtest before the interview.",
      cn: "申请者在面试前要完成阅读子测验。",
    },
    unavailable: {
      example: "The manager is unavailable this afternoon.",
      cn: "经理今天下午不在，无法联系。",
    },
    underly: {
      example: "In old usage, underly can mean to lie beneath something.",
      cn: "在古旧用法中，underly 可表示“位于某物之下”。",
    },
    wiretap: {
      example: "The judge refused to approve the wiretap request.",
      cn: "法官拒绝批准窃听申请。",
    },
  }).map(([k, v]) => [normWord(k), v])
);

function normSentence(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function hasChinese(s) {
  return /[\u4e00-\u9fff]/.test(String(s || ""));
}

function isBadExample(v) {
  const s = cleanText(v);
  if (!s) return true;
  const low = s.toLowerCase();
  return (
    s.startsWith('The word "') ||
    s === "This is useful for study." ||
    s === "Example unavailable." ||
    low === "example unavailable"
  );
}

function isBadExampleCn(v) {
  const s = cleanText(v);
  const low = s.toLowerCase();
  if (!s) return true;
  const enTokens = (s.match(/[A-Za-z]{3,}/g) || []).filter(
    (t) => !(t === t.toUpperCase() && t.length <= 5)
  );
  return (
    s.startsWith("\u5355\u8BCD\u201C") ||
    s.startsWith("\u8FD9\u662F\u4E00\u4E2A\u5173\u4E8E") ||
    s.includes("\u7FFB\u8BD1\u83B7\u53D6\u5931\u8D25") ||
    s.includes("\u771F\u5B9E\u4F8B\u53E5") ||
    s.includes("\u97F3\u4E50\u5BB6\u719F\u7EC3\u5730\u97A0\u8EAC\u62C9\u5C0F\u63D0\u7434") ||
    s === "\u8FD9\u5BF9\u5B66\u4E60\u6709\u7528\u3002" ||
    s === "\u6682\u65E0\u4F8B\u53E5\u3002" ||
    s.includes("QUERY LENGTH LIMIT EXCEEDED") ||
    s.startsWith("???") ||
    s.includes("???") ||
    low.includes("translation failed") ||
    enTokens.length >= 4 ||
    /\b(I|you|he|she|they|we|to|the|and|is|are|was|were)\b/i.test(s) ||
    !hasChinese(s)
  );
}

async function requestJson(url, retries = MAX_RETRIES) {
  let lastErr = null;
  for (let i = 0; i <= retries; i += 1) {
    try {
      const resp = await fetch(url);
      const text = await resp.text();
      if (!resp.ok) throw new Error(`HTTP ${resp.status} ${text.slice(0, 200)}`);
      return JSON.parse(text);
    } catch (err) {
      lastErr = err;
      if (i < retries) {
        await sleep(250 * (i + 1));
      }
    }
  }
  throw lastErr || new Error("requestJson failed");
}

function pickYoudaoPair(data, queryWord = "") {
  if (!data || typeof data !== "object") return { example: "", cn: "" };

  const blocks = [];
  if (data?.blng_sents_part && Array.isArray(data.blng_sents_part["sentence-pair"])) {
    blocks.push(data.blng_sents_part["sentence-pair"]);
  }
  if (data?.blng_sents && Array.isArray(data.blng_sents["sentence-pair"])) {
    blocks.push(data.blng_sents["sentence-pair"]);
  }
  if (data?.auth_sents_part && Array.isArray(data.auth_sents_part["sentence-pair"])) {
    blocks.push(data.auth_sents_part["sentence-pair"]);
  }

  const query = normWord(queryWord);
  for (const arr of blocks) {
    for (const item of arr) {
      const en = cleanText(item?.["sentence-eng"] || item?.sentence || "");
      const cn = cleanText(item?.["sentence-translation"] || "");
      if (!en || !cn) continue;
      if (isBadExample(en) || isBadExampleCn(cn)) continue;
      if (en.length > 260 || cn.length > 260) continue;
      if (query) {
        const enNorm = normWord(en);
        if (!enNorm.includes(query) && !query.includes(enNorm)) {
          // query word may not appear literally in sentence; still accept later if no better
        }
      }
      return { example: en, cn };
    }
  }

  return { example: "", cn: "" };
}

async function fetchYoudaoWordPair(word) {
  const variants = Array.from(
    new Set([
      String(word || "").trim(),
      String(word || "")
        .trim()
        .replace(/\s+/g, " "),
      String(word || "")
        .trim()
        .replace(/\s+/g, "")
        .replace(/-/g, ""),
      String(word || "")
        .trim()
        .replace(/-/g, " "),
    ])
  ).filter(Boolean);

  for (const v of variants) {
    try {
      const url = `http://dict.youdao.com/jsonapi?q=${encodeURIComponent(v)}`;
      const body = await requestJson(url, 1);
      const pair = pickYoudaoPair(body, word);
      if (pair.example && pair.cn) return pair;
    } catch {
      // next variant
    }
  }
  return { example: "", cn: "" };
}

async function fetchTatoebaPair(word) {
  const url =
    "https://tatoeba.org/en/api_v0/search?from=eng&to=cmn&query=" + encodeURIComponent(String(word || "").trim());
  try {
    const body = await requestJson(url, 1);
    const results = Array.isArray(body?.results) ? body.results : [];
    const w = String(word || "").toLowerCase().trim();

    for (const r of results) {
      const en = cleanText(r?.text || "");
      if (!en || isBadExample(en) || en.length > 220) continue;
      if (w && !en.toLowerCase().includes(w)) continue;

      const translations = Array.isArray(r?.translations) ? r.translations : [];
      for (const group of translations) {
        if (!Array.isArray(group)) continue;
        for (const t of group) {
          const lang = String(t?.lang || "").toLowerCase();
          const cn = cleanText(t?.text || "");
          if (!cn) continue;
          if ((lang === "cmn" || lang.startsWith("zh")) && !isBadExampleCn(cn)) {
            return { example: en, cn };
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return { example: "", cn: "" };
}

async function fetchDictionaryExample(word) {
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
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(v)}`;
      const body = await requestJson(url, 1);
      if (!Array.isArray(body)) continue;
      for (const entry of body) {
        const meanings = Array.isArray(entry?.meanings) ? entry.meanings : [];
        for (const m of meanings) {
          const defs = Array.isArray(m?.definitions) ? m.definitions : [];
          for (const d of defs) {
            const ex = cleanText(d?.example || "");
            if (ex && !isBadExample(ex) && ex.length <= 220) {
              return ex;
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }
  return "";
}

async function translateSentenceByYoudao(sentence) {
  const s = cleanText(sentence);
  if (!s) return "";
  try {
    const url = `http://dict.youdao.com/jsonapi?q=${encodeURIComponent(s)}`;
    const body = await requestJson(url, 1);

    // 优先匹配双语例句
    const pair = pickYoudaoPair(body, "");
    if (pair.example && pair.cn) {
      const qn = normSentence(s);
      const enNorm = normSentence(pair.example);
      if (enNorm && qn && (enNorm === qn || enNorm.includes(qn) || qn.includes(enNorm))) {
        return pair.cn;
      }
    }

    const fy = cleanText(body?.fanyi?.tran || "");
    if (fy && !isBadExampleCn(fy)) return fy;

    const web = Array.isArray(body?.web_trans?.["web-translation"]) ? body.web_trans["web-translation"] : [];
    for (const item of web) {
      const trans = Array.isArray(item?.trans) ? item.trans : [];
      for (const t of trans) {
        const summaryLines = t?.summary?.line;
        if (Array.isArray(summaryLines) && summaryLines.length > 0) {
          const cand = cleanText(summaryLines.join("; "));
          if (cand && !isBadExampleCn(cand)) return cand;
        }
      }
    }
  } catch {
    // ignore
  }
  return "";
}

async function translateSentenceByMyMemory(sentence) {
  const s = cleanText(sentence);
  if (!s) return "";
  try {
    const url =
      "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(s) + "&langpair=en|zh-CN";
    const body = await requestJson(url, 2);
    const direct = cleanText(body?.responseData?.translatedText || "");
    if (direct && !isBadExampleCn(direct)) return direct;
    const matches = Array.isArray(body?.matches) ? body.matches : [];
    for (const m of matches) {
      const t = cleanText(m?.translation || "");
      if (t && !isBadExampleCn(t)) return t;
    }
  } catch {
    // ignore
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

  const selectSql = `
    SELECT id, word, exam_type AS examType, example, example_translation AS exampleTranslation
    FROM vocabulary
    WHERE deleted=0
    ORDER BY id
  `;
  const [rowsRaw] = await pool.query(selectSql);

  let rows = Array.isArray(rowsRaw) ? rowsRaw : [];
  rows = rows.filter((r) => isBadExample(r.example) || isBadExampleCn(r.exampleTranslation));
  if (MAX_ITEMS > 0) rows = rows.slice(0, MAX_ITEMS);
  console.log(`Rows to repair: ${rows.length}`);
  if (rows.length > 0) {
    const preview = rows.slice(0, 10).map((r) => `${r.id}:${r.word}:${r.examType}`).join(", ");
    console.log(`Preview rows: ${preview}`);
  }
  if (rows.length === 0) {
    await pool.end();
    return;
  }

  const wordPairCache = new Map();
  const sentenceCnCache = new Map();
  const dictExampleCache = new Map();

  let idx = 0;
  let updated = 0;
  let unchanged = 0;
  let failed = 0;
  let fixedExample = 0;
  let fixedCn = 0;
  const start = Date.now();

  async function getWordPair(word) {
    const key = normWord(word);
    if (wordPairCache.has(key)) return wordPairCache.get(key);
    let pair = await fetchYoudaoWordPair(word);
    if (!pair.example || !pair.cn) {
      const tb = await fetchTatoebaPair(word);
      if (tb.example && tb.cn) pair = tb;
    }
    wordPairCache.set(key, pair);
    return pair;
  }

  async function getDictionaryExample(word) {
    const key = normWord(word);
    if (dictExampleCache.has(key)) return dictExampleCache.get(key);
    const ex = await fetchDictionaryExample(word);
    dictExampleCache.set(key, ex);
    return ex;
  }

  async function getSentenceTranslation(sentence) {
    const key = cleanText(sentence);
    if (!key) return "";
    if (sentenceCnCache.has(key)) return sentenceCnCache.get(key);
    let cn = await translateSentenceByYoudao(key);
    if (!cn) cn = await translateSentenceByMyMemory(key);
    sentenceCnCache.set(key, cn || "");
    return cn;
  }

  function getHardFallback(word) {
    const item = HARD_FALLBACKS.get(normWord(word)) || { example: "", cn: "" };
    // Never write static CN fallback text directly; always prefer real sentence translation.
    return { example: item.example || "", cn: "" };
  }

  async function worker(workerId) {
    while (true) {
      const i = idx++;
      if (i >= rows.length) return;

      const row = rows[i];
      const originalExample = cleanText(row.example);
      const originalCn = cleanText(row.exampleTranslation);
      let newExample = originalExample;
      let newCn = originalCn;

      try {
        const badEx = isBadExample(originalExample);
        const fallback = getHardFallback(row.word);

        if (badEx) {
          const pair = await getWordPair(row.word);
          if (pair.example && pair.cn) {
            newExample = pair.example;
            newCn = pair.cn;
          } else {
            const dictEx = await getDictionaryExample(row.word);
            if (dictEx && !isBadExample(dictEx)) {
              newExample = dictEx;
            }
          }
        }

        if (isBadExample(newExample) && fallback.example) {
          newExample = fallback.example;
          if (isBadExampleCn(newCn) && fallback.cn) {
            newCn = fallback.cn;
          }
        }

        if (isBadExampleCn(newCn)) {
          if (!isBadExample(newExample)) {
            const cn = await getSentenceTranslation(newExample);
            if (cn && !isBadExampleCn(cn)) {
              newCn = cn;
            }
          }

          // 仍然坏：直接回退到双语词典例句对
          if (isBadExampleCn(newCn)) {
            const pair = await getWordPair(row.word);
            if (pair.example && pair.cn) {
              newExample = pair.example;
              newCn = pair.cn;
            }
          }
        }

        if (isBadExampleCn(newCn) && fallback.cn) {
          if (isBadExample(newExample) && fallback.example) {
            newExample = fallback.example;
          }
          newCn = fallback.cn;
        }

        const changed = newExample !== originalExample || newCn !== originalCn;
        const fixedNow = !isBadExample(newExample) && !isBadExampleCn(newCn);

        if (changed && fixedNow) {
          await pool.query(
            "UPDATE vocabulary SET example=?, example_translation=?, update_time=NOW() WHERE id=?",
            [newExample, newCn, row.id]
          );
          if (newExample !== originalExample) fixedExample += 1;
          if (newCn !== originalCn) fixedCn += 1;
          updated += 1;
        } else {
          unchanged += 1;
        }
      } catch {
        failed += 1;
      }

      const done = updated + unchanged + failed;
      if (done % 100 === 0 || done === rows.length) {
        const sec = ((Date.now() - start) / 1000).toFixed(1);
        console.log(
          `[w${workerId}] ${done}/${rows.length} updated=${updated} unchanged=${unchanged} failed=${failed} elapsed=${sec}s`
        );
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, CONCURRENCY) }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  const [[check]] = await pool.query(`
    SELECT
      SUM(CASE WHEN
        COALESCE(TRIM(example),'')='' OR
        example LIKE 'The word "%' OR
        example='This is useful for study.' OR
        example='Example unavailable.'
      THEN 1 ELSE 0 END) AS bad_example,
      SUM(CASE WHEN
        COALESCE(TRIM(example_translation),'')='' OR
        LOCATE(CHAR(63,63,63), example_translation)=1 OR
        example_translation LIKE '单词“%' OR
        example_translation LIKE '%翻译获取失败%' OR
        example_translation LIKE '%真实例句%' OR
        example_translation='这对学习有用。' OR
        example_translation='暂无例句。'
      THEN 1 ELSE 0 END) AS bad_example_translation
    FROM vocabulary
    WHERE deleted=0
  `);

  console.log("=== Repair Summary ===");
  console.log(`updated=${updated}, unchanged=${unchanged}, failed=${failed}`);
  console.log(`fixed_example=${fixedExample}, fixed_example_translation=${fixedCn}`);
  console.log(`remaining_bad_example=${check.bad_example}, remaining_bad_example_translation=${check.bad_example_translation}`);

  await pool.end();
}

main().catch((err) => {
  console.error("FATAL:", err?.message || err);
  process.exitCode = 1;
});
