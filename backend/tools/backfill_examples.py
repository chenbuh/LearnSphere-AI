"""
用有道词典补全 learnsphere_ai 词汇表的「例句 + 例句中文翻译」。

设计要点
--------
* 唯一来源：有道词典 jsonapi 的 blng_sents_part（柯林斯/权威例句，中英成对）。
  不做机器翻译、不做模板拼接，保证每句的英文和中文出自同一词条。
* 按"单词"处理，不是按行：同一个 word 在多个 exam_type 下的所有行
  使用同一句例句，避免同一单词在不同词书里例句不一致。
* 三种模式：
    --mode fill     只补空的（不动已有内容）
    --mode refresh  已有例句也整体替换成有道例句（用于统一风格 / 修掉错配）
    --mode fix      只处理"例句与翻译疑似对不上"的行
* 可断点续跑：处理过的单词记录在 backfill_done.txt，重跑自动跳过。

用法
----
  python backfill_examples.py --mode fill --limit 50 --dry-run
  python backfill_examples.py --mode fill --all
  python backfill_examples.py --mode refresh --all
  python backfill_examples.py --mode fix --all
"""

import argparse
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

import pymysql

MYSQL = dict(host="127.0.0.1", port=3306, user="root",
             password=os.environ.get("MYSQL_PWD", "<REDACTED-DB-PASSWORD>"),
             database="learnsphere_ai", charset="utf8mb4")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
YOUDAO = "https://dict.youdao.com/jsonapi?q={q}"
PROXY = os.environ.get("BACKFILL_PROXY")  # 有道国内直连即可，默认不走代理

opener = (urllib.request.build_opener(urllib.request.ProxyHandler({"http": PROXY, "https": PROXY}))
          if PROXY else urllib.request.build_opener())

TAG_FRAG = re.compile(r"&lt;/?b&gt;|</\s*b>|<\s*b>|&lt;br\s*/?&gt;|<br\s*/?>", re.I)
ANY_TAG = re.compile(r"<[^>]{0,40}>")
CJK = re.compile(r"[\u4e00-\u9fff]")


def http_json(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with opener.open(req, timeout=15) as r:
                return json.loads(r.read().decode("utf-8", "replace"))
        except Exception as e:  # noqa: BLE001
            if attempt == retries - 1:
                print(f"  [warn] 请求失败: {e}", file=sys.stderr)
                return None
            time.sleep(1.5 * (attempt + 1))
    return None


def clean_text(text):
    if not text:
        return ""
    text = TAG_FRAG.sub("", text)
    text = re.sub(r"&lt;[^&]{0,40}?&gt;", "", text)
    text = ANY_TAG.sub("", text)
    text = html.unescape(text)
    text = re.sub(r"</\s*b>|<\s*b>", "", text, flags=re.I)
    text = text.replace("\u00a0", " ")
    return re.sub(r"\s+", " ", text).strip()


def has_cjk(text):
    return bool(CJK.search(text or ""))


def match_score(en, word):
    """3=原词逐字命中；2=常见词形变化命中；1=仅词根相关；0=无关。
    注意：只有 2 分以上才可入库——1 分常是有道的"相关例句"，
    与目标词并无关系（例如 bastard 配到 "Cooper was a good mixer"）。"""
    low = en.lower()
    w = word.lower().strip()
    # 逐字命中（含所有格 's、复数、连字符写法）
    if re.search(r"\b" + re.escape(w) + r"(?:'s|s|es|ed|ing|d)?\b", low):
        return 3
    strict = {w + "s", w + "es", w + "ed", w + "ing", w + "d", w + "ly"}
    if any(re.search(r"\b" + re.escape(v) + r"\b", low) for v in strict):
        return 2
    base = re.sub(r"(ing|ed|es|s|ly|er|est)$", "", w) if len(w) > 4 else w
    loose = {base, base + "s", base + "es", base + "ed", base + "ing", base + "ly"}
    if any(v and len(v) >= 3 and re.search(r"\b" + re.escape(v) + r"\b", low) for v in loose):
        return 1
    return 0


def is_good_example(en, cn):
    if not en or not cn or not has_cjk(cn):
        return False
    if re.search(r"<[^>]{0,40}>|&lt;|&gt;|\[\.\.\.\]|\.\.\.", en):
        return False
    # 长度：太短没有语境，太长不适合学习场景（且常是论文摘句）
    if len(en) < 20 or len(en) > 140:
        return False
    if has_cjk(en):          # 英文例句里混入中文注释
        return False
    if en[-1] not in ".!?\"":
        return False
    if not en[0].isupper() and en[0] not in "\"'":
        return False
    if len(en.split()) < 5:  # 短语碎片 / "I'm sixteen."
        return False
    if not re.search(r"[A-Za-z]", en):
        return False
    if re.search(r"\b(someone|sth)\b", en.lower()):
        return False
    # 论文/新闻摘句特征：过多分号、括号引用、缩写密度高
    if en.count(";") >= 2 or en.count("(") >= 2:
        return False
    if re.search(r"\b(et al|ibid|op\. cit)\b", en, re.I):
        return False
    return True


def fetch_examples(word, min_score=2):
    """返回该单词的有道成对例句，按命中强度 + 长度排序。"""
    data = http_json(YOUDAO.format(q=urllib.parse.quote(word)))
    if not data:
        return []
    pairs = []
    for item in (data.get("blng_sents_part") or {}).get("sentence-pair") or []:
        en = clean_text(item.get("sentence-eng") or item.get("sentence"))
        cn = clean_text(item.get("sentence-translation"))
        if is_good_example(en, cn):
            pairs.append((en, cn))
    if not pairs:
        for item in (data.get("media_sents_part") or {}).get("sent") or []:
            en = clean_text(item.get("eng"))
            cn = clean_text(item.get("chn"))
            if is_good_example(en, cn):
                pairs.append((en, cn))
    scored = [(match_score(en, word), -len(en), en, cn) for en, cn in pairs]
    scored.sort(key=lambda x: (-x[0], x[1], x[2]))
    return [(en, cn) for score, _, en, cn in scored if score >= min_score]


def load_words(conn, mode):
    """按单词取待处理列表。"""
    with conn.cursor() as cur:
        if mode == "fill":
            cur.execute("""SELECT word FROM vocabulary WHERE deleted=0
                           GROUP BY word
                           HAVING SUM(example IS NULL OR example='') > 0
                           ORDER BY word""")
        elif mode == "refresh":
            cur.execute("""SELECT word FROM vocabulary WHERE deleted=0
                           GROUP BY word ORDER BY word""")
        else:  # fix: 例句与翻译疑似对不上（同词存在多组不同 例句||翻译 组合）
            cur.execute("""SELECT word FROM (
                             SELECT word, COUNT(DISTINCT CONCAT(IFNULL(example,''),'||',
                                       IFNULL(example_translation,''))) combos
                             FROM vocabulary WHERE deleted=0
                               AND example<>'' AND example_translation<>''
                             GROUP BY word HAVING combos > 1
                           ) t ORDER BY word""")
        return [r[0] for r in cur.fetchall()]


def done_set(path):
    if not os.path.exists(path):
        return set()
    with open(path, encoding="utf-8") as f:
        return {line.strip() for line in f if line.strip()}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["fill", "refresh", "fix"], default="fill")
    ap.add_argument("--limit", type=int, default=50)
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--done-file", default="backfill_done.txt")
    ap.add_argument("--report", default="backfill_report.jsonl")
    args = ap.parse_args()

    conn = pymysql.connect(**MYSQL)
    words = load_words(conn, args.mode)
    done = done_set(args.done_file)
    words = [w for w in words if w not in done]
    if not args.all:
        words = words[:args.limit]

    print(f"模式={args.mode}  待处理单词={len(words)}  (已跳过 {len(done)} 个已完成的)")
    stats = {"word_ok": 0, "rows": 0, "miss": 0}
    done_fh = open(args.done_file, "a", encoding="utf-8")
    rep_fh = open(args.report, "a", encoding="utf-8")

    for i, word in enumerate(words, 1):
        # 只接受 2 分以上：必须真的用到这个单词（或它的常见词形）。
        # 1 分是有道的"相关例句"，与目标词无关，绝不能入库。
        pairs = fetch_examples(word, min_score=2)
        if not pairs:
            stats["miss"] += 1
            print(f"[{i}/{len(words)}] {word}: 有道无可用例句，跳过")
            time.sleep(0.12)
            continue

        en, cn = pairs[0]
        if args.dry_run:
            print(f"[{i}/{len(words)}] {word}\n    EN: {en}\n    CN: {cn}")
        else:
            with conn.cursor() as cur:
                if args.mode == "fill":
                    cur.execute("""UPDATE vocabulary SET example=%s, example_translation=%s
                                   WHERE deleted=0 AND word=%s
                                     AND (example IS NULL OR example='')""", (en, cn, word))
                else:
                    cur.execute("""UPDATE vocabulary SET example=%s, example_translation=%s
                                   WHERE deleted=0 AND word=%s""", (en, cn, word))
                stats["rows"] += cur.rowcount
            conn.commit()
            done_fh.write(word + "\n")
            done_fh.flush()
            rep_fh.write(json.dumps({"word": word, "en": en, "cn": cn}, ensure_ascii=False) + "\n")
            rep_fh.flush()
            if i % 100 == 0:
                print(f"  进度 {i}/{len(words)}  rows={stats['rows']}  miss={stats['miss']}", flush=True)
                conn.ping(reconnect=True)
        stats["word_ok"] += 1
        time.sleep(0.12)

    done_fh.close()
    rep_fh.close()
    conn.close()
    print("\n===== 汇总 =====")
    print(json.dumps(stats, ensure_ascii=False))
    if stats["miss"]:
        print(f"未命中 {stats['miss']} 个单词，可稍后重跑（有道偶发限流）。")


if __name__ == "__main__":
    main()
