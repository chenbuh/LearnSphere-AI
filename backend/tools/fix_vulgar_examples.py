"""
替换"不合适"的例句。

判定"不合适"（只针对真正的脏话，不误伤正常词义）：
  * 目标词本身是脏话（hell/damn/fuck 等）时，例句保留但优先选语气轻的
  * 例句里把脏话当作感叹/骂人用的（"who the hell"、"oh hell"）
  * 对话体、语气随意，不适合作为学习材料

注意区分：
  * bitch 作"母狗"、bloody 作"流血的"、Dick 作人名 —— 是正常词义，保留
  * shell / animal 里出现的 "hell" 是子串，不能误判

处理方式：
  1) 用有道重新抓取，挑一条不含脏话、语气中性的例句
  2) 抓不到时，退回手工例句（manual_examples.py 里同词条）
  3) 都没有则保留原句，仅记录

用法：
  python fix_vulgar_examples.py --dry-run
  python fix_vulgar_examples.py
"""

import argparse
import os
import re
import sys

import pymysql

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from backfill_examples import fetch_examples, match_score  # noqa: E402
from manual_examples import MANUAL  # noqa: E402

def _require_mysql_pwd():
    """数据库口令只从环境变量读取，不提供任何默认值。"""
    pwd = os.environ.get("MYSQL_PWD")
    if not pwd:
        sys.exit("缺少 MYSQL_PWD 环境变量，请先设置数据库口令后再运行本脚本。")
    return pwd


MYSQL = dict(host="127.0.0.1", port=3306, user="root",
             password=_require_mysql_pwd(),
             database="learnsphere_ai", charset="utf8mb4")

# 真正的脏话（按词边界匹配）
VULGAR = re.compile(
    r"(?<![a-zA-Z])(hell|damn|damned|shit|shitty|fuck|fucking|fucked|fucker|"
    r"crap|bloody|bastard|bitch|piss|pissed|slut|whore|bugger|arse|arsehole|"
    r"prick|wanker|motherfucker|goddamn)(?![a-zA-Z])",
    re.I)

# 这些词的"脏话义"与"正常义"并存，若目标词就是它，允许保留
WORD_IS_VULGAR = {
    "hell", "damn", "damned", "shit", "fuck", "fucking", "fucked", "fucker",
    "crap", "bastard", "bitch", "piss", "slut", "whore", "bugger", "arse",
    "arsehole", "prick", "wanker", "motherfucker", "bullshit", "goddamn",
    "horny", "masturbate", "masturbation", "pedophile", "pornography",
    "pornographic", "brothel", "sodomy", "rape", "rapist",
}

# 这些词本身是脏话，但存在完全正常的义项，例句按该义项时不视为问题：
#   bloody  = 流血的      pissed = 恼怒的（口语）
#   bitch   = 母狗        dick   = 人名 Dick
NORMAL_SENSE_WORDS = {
    "bloody": re.compile(r"\bbloody\s+(nose|noses|hand|hands|knee|knees|wound|battle|war|murder)\b", re.I),
    "pissed": re.compile(r"\bpissed\s+off\b", re.I),
    "bitch": re.compile(r"\b(bitch|bitches)\s+(has|have|had|is|was|will|may)\b", re.I),
    "dick": re.compile(r"\bDick\b"),
}


def has_vulgar(text):
    return bool(VULGAR.search(text or ""))


def is_bad(word, example):
    """例句是否不适合作为学习材料。"""
    if not has_vulgar(example):
        return False
    # 目标词本身就是这类词：保留原句（否则这个词就没例句了）
    if word.lower() in WORD_IS_VULGAR:
        return False
    # 目标词是脏话但此处用的是正常义项（如 bloody noses = 流血）
    pattern = NORMAL_SENSE_WORDS.get(word.lower())
    if pattern and pattern.search(example):
        return False
    return True


def find_candidates(word):
    """从有道重新挑一条不含脏话的例句。"""
    for min_score in (2, 3):
        for en, cn in fetch_examples(word, min_score=min_score):
            if not has_vulgar(en) and len(en.split()) >= 5:
                return en, cn
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    conn = pymysql.connect(**MYSQL)
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT word FROM vocabulary WHERE deleted=0")
    words = [r[0] for r in cur.fetchall()]

    targets = []
    for w in words:
        cur.execute("""SELECT example FROM vocabulary
                       WHERE deleted=0 AND word=%s AND example<>'' LIMIT 1""", (w,))
        row = cur.fetchone()
        if row and is_bad(w, row[0]):
            targets.append((w, row[0]))

    print(f"发现 {len(targets)} 个词条使用了粗俗例句")
    if not targets:
        conn.close()
        return

    fixed = manual = kept = 0
    for i, (word, old) in enumerate(targets, 1):
        print(f"\n[{i}/{len(targets)}] {word}")
        print(f"   旧: {old[:80]}")

        cand = find_candidates(word)
        if not cand and word in MANUAL:
            cand = MANUAL[word]
            src = "手工"
        else:
            src = "有道"

        if not cand:
            kept += 1
            print("   → 未找到合适替代，保留原句")
            continue

        en, cn = cand
        if is_bad(word, en):
            kept += 1
            print("   → 替代句仍含粗俗表达，保留原句")
            continue

        print(f"   新[{src}]: {en[:80]}")
        print(f"   译: {cn[:50]}")
        if not args.dry_run:
            cur.execute("UPDATE vocabulary SET example=%s, example_translation=%s WHERE deleted=0 AND word=%s",
                        (en, cn, word))
            conn.commit()
        if src == "手工":
            manual += 1
        else:
            fixed += 1

    if not args.dry_run:
        conn.commit()
    print(f"\n{'[试运行] ' if args.dry_run else ''}有道替换 {fixed}, 手工替换 {manual}, 保留 {kept}")
    conn.close()


if __name__ == "__main__":
    main()
