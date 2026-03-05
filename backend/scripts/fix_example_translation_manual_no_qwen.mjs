#!/usr/bin/env node

import mysql from "mysql2/promise";

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "chen20040209";
const DB_NAME = process.env.DB_NAME || "learnsphere_ai";

const updates = [
  {
    ids: [22647, 51103, 51104, 51105],
    cn: "低分辨率的渲染图看起来可能会有明显的块状感。",
  },
  {
    ids: [22648, 45156, 45157, 45158],
    cn: "图书发布会。",
  },
  {
    ids: [22649, 52575, 52576, 52577],
    cn: "现在该谁发球？",
  },
  {
    ids: [22656, 57522, 57523, 57524],
    cn: "那块地毯的织纹非常紧密。",
  },
  {
    ids: [22663, 50519, 50520, 50521],
    cn: "学生们抱团在网上“ratio”学校食堂，指责其把蔬菜加入餐食这种做法极不民主。",
  },
  {
    ids: [22651, 57890, 57891],
    cn: "看看我的宠物。他是一只狼。",
  },
  {
    ids: [22661, 45953, 45954],
    cn: "这个节目尤其受中年男性欢迎。",
  },
  {
    ids: [46962, 46963, 46964],
    cn: "她决定搬到一座新城市，重新开始。",
  },
  {
    ids: [49002, 49003, 49004],
    cn: "她在公司的领导层架构中位居最高职位。",
  },
  {
    ids: [54709, 54710, 54711],
    cn: "我支持你。",
  },
  {
    ids: [57733, 57734, 57735],
    cn: "那个车被偷了的男人已经向警方报案。",
  },
  {
    ids: [15498, 42386],
    cn: "让我惊讶的是，尽管侧风很难处理，我还是完成了一次非常平稳的着陆。",
  },
  {
    ids: [22671, 57921],
    cn: "把所有羊毛衣物都放进这个篮子里。",
  },
  {
    ids: [30491, 55105],
    cn: "1945年：我上了一辆满是“纳税人”的公交车。大家把一些钱交给另一位纳税人；那人肚子上挂着一个小盒子，让其他纳税人得以继续他们的“纳税人旅程”。我注意到车上一位纳税人，他脖子很长，头戴一顶毡帽，帽子上还绕着一圈辫饰，样式前所未见。突然，这位纳税人厉声斥责旁边的人，抱怨对方每次有人上下车都故意踩他的脚。随后，这位恼怒的纳税人走过去，坐在另一位纳税人刚腾出的座位上。——雷蒙·格诺，《文体练习》之《复沓》，1945年（英译1958年）。",
  },
  {
    ids: [15530],
    cn: "他认为《十诫》更像是行为准则，而不是硬性要求。",
  },
  {
    ids: [22653],
    cn: "有几个人丢了行李箱。你找到的是谁的？",
  },
  {
    ids: [22654],
    cn: "别动那根横梁！它是整个平台的支撑。",
  },
  {
    ids: [22655],
    cn: "舵柄稍微一动，船就会偏离航线。",
  },
  {
    ids: [22659],
    cn: "我现在处于一个陌生的地方。",
  },
  {
    ids: [23338],
    cn: "在霍乱这一主题变得如此引人关注的时刻，报刊若把版面（即使因此排除一些政治及其他重要议题）用于报道与该病是否具有传染性相关的朴素事实细节，无疑最符合公共利益。关于霍乱，几乎没有比这更重要的问题；因为一切卫生或防护措施都取决于此，一旦判断失误，而疫情又暴发，就会直接使成千上万人陷入灾难。",
  },
  {
    ids: [24944],
    cn: "不过，在军事法务官向法庭作出上述陈述后，法庭得知：作为起诉方，检察官反对任何延期；同时又得知，指挥将军认为将审理延期到12月1日，比延期三个月对军务损害更小。尽管如此，法庭仍决定作更长期的延期，或许是为了更大程度照顾该囚犯，或许是出于对军务利益的考虑；因为裁定中并未写明理由，而且也看不出当时囚犯本人提出过任何异议。",
  },
  {
    ids: [42536],
    cn: "这份报告为改善工作场所安全提供了明确的指导方针。",
  },
];

function clean(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function hasChinese(s) {
  return /[\u4e00-\u9fff]/.test(String(s || ""));
}

function isBadExampleCn(v) {
  const s = clean(v);
  if (!s) return true;
  if (s.startsWith("单词“")) return true;
  if (s.startsWith("这是一个关于")) return true;
  if (s.includes("真实例句")) return true;
  if (s.includes("翻译获取失败")) return true;
  if (s === "这对学习有用。") return true;
  if (s === "暂无例句。") return true;
  if (s.includes("QUERY LENGTH LIMIT EXCEEDED")) return true;
  if (/^\?+$/.test(s)) return true;
  if (!hasChinese(s)) return true;
  return false;
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
    connectionLimit: 4,
  });

  let affectedRows = 0;
  for (const item of updates) {
    const placeholders = item.ids.map(() => "?").join(",");
    const sql = `UPDATE vocabulary SET example_translation=?, update_time=NOW() WHERE id IN (${placeholders})`;
    const [res] = await pool.query(sql, [item.cn, ...item.ids]);
    affectedRows += res?.affectedRows || 0;
  }

  const targetIds = updates.flatMap((u) => u.ids);
  const idPlaceholders = targetIds.map(() => "?").join(",");
  const [updatedRows] = await pool.query(
    `SELECT id, word, exam_type AS examType, example_translation AS exampleTranslation FROM vocabulary WHERE id IN (${idPlaceholders}) ORDER BY id`,
    targetIds
  );

  const stillBadInTargets = updatedRows.filter((r) => isBadExampleCn(r.exampleTranslation));

  const [allRows] = await pool.query(
    "SELECT id, word, exam_type AS examType, example_translation AS exampleTranslation FROM vocabulary WHERE deleted=0"
  );
  const remainingBadAll = allRows.filter((r) => isBadExampleCn(r.exampleTranslation));

  console.log("=== Example Translation Manual Fix (No Qwen) ===");
  console.log(`planned_updates=${targetIds.length}`);
  console.log(`affected_rows=${affectedRows}`);
  console.log(`target_rows_bad_after_fix=${stillBadInTargets.length}`);
  console.log(`remaining_bad_example_translation_all=${remainingBadAll.length}`);
  if (stillBadInTargets.length > 0) {
    console.log("target_bad_samples=");
    console.log(JSON.stringify(stillBadInTargets.slice(0, 20), null, 2));
  }

  await pool.end();
}

main().catch((err) => {
  console.error("FATAL:", err?.message || err);
  process.exitCode = 1;
});

