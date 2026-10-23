"""
清洗词库中的脏数据。

处理三类问题：
  1. 单词字段混入词性 —— "really v" -> "really"
  2. 释义里残留 HTML 标签 —— "<b>阿以</b>" -> "阿以"
     （注意：<口>、<古>、<俚>、<废语> 这类是词典的语域标记，属于正常内容，保留）
  3. 释义为空的词 —— 用同词其他词书的释义回填

用法：
  python clean_dirty.py --dry-run
  python clean_dirty.py
"""

import argparse
import os
import re
import sys

import pymysql

def _require_mysql_pwd():
    """数据库口令只从环境变量读取，不提供任何默认值。"""
    pwd = os.environ.get("MYSQL_PWD")
    if not pwd:
        sys.exit("缺少 MYSQL_PWD 环境变量，请先设置数据库口令后再运行本脚本。")
    return pwd


MYSQL = dict(host="127.0.0.1", port=3306, user="root",
             password=_require_mysql_pwd(),
             database="learnsphere_ai", charset="utf8mb4")

# 只清真正的 HTML 标签；<口> <古> <俚> <废语> <非正式> <篮> 等语域/领域标记要保留
HTML_TAG = re.compile(r"</?(?:b|i|u|em|strong|span|div|p|br|font|a|td|tr|table)\b[^>]{0,60}>", re.I)
# 单词末尾混入的词性标记
POS_SUFFIX = re.compile(r"\s+(n|v|vt|vi|adj|adv|prep|conj|pron|art|num|int)\.?$", re.I)


def clean_meaning(text):
    if not text:
        return text
    out = HTML_TAG.sub("", text)
    out = re.sub(r"\s{2,}", " ", out).strip()
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    conn = pymysql.connect(**MYSQL)
    cur = conn.cursor()
    plan = []

    # ---- 1. 单词字段混入词性 ----
    cur.execute(r"SELECT DISTINCT word FROM vocabulary WHERE deleted=0 AND word REGEXP ' [a-z]+\.?$'")
    for (word,) in cur.fetchall():
        fixed = POS_SUFFIX.sub("", word).strip()
        if fixed and fixed != word:
            plan.append(("word", word, word, fixed, None))

    # ---- 2. 释义里的 HTML 标签 ----
    cur.execute("""SELECT DISTINCT word, translation FROM vocabulary
                   WHERE deleted=0 AND (translation LIKE '%<%>%' OR definition LIKE '%<%>%')""")
    for word, translation in cur.fetchall():
        cleaned = clean_meaning(translation)
        if cleaned and cleaned != translation:
            plan.append(("meaning", word, translation, cleaned, None))

    # ---- 3. 空释义：用同词其他词书回填 ----
    cur.execute("""SELECT DISTINCT word FROM vocabulary
                   WHERE deleted=0 AND (translation IS NULL OR translation='')""")
    empty_words = [r[0] for r in cur.fetchall()]
    for word in empty_words:
        cur.execute("""SELECT translation FROM vocabulary
                       WHERE deleted=0 AND word=%s AND translation IS NOT NULL AND translation<>''
                       ORDER BY LENGTH(translation) LIMIT 1""", (word,))
        row = cur.fetchone()
        if row:
            plan.append(("empty", word, None, row[0], None))

    print(f"计划处理 {len(plan)} 项")
    by_kind = {}
    for kind, *_ in plan:
        by_kind[kind] = by_kind.get(kind, 0) + 1
    print("  分类:", by_kind)

    if args.dry_run:
        for kind, word, old, new, _ in plan[:20]:
            print(f"  [{kind}] {word}: {str(old)[:50]!r} -> {str(new)[:50]!r}")
        conn.close()
        return

    done = 0
    for kind, word, old, new, _ in plan:
        if kind == "word":
            cur.execute("UPDATE vocabulary SET word=%s WHERE deleted=0 AND word=%s", (new, old))
        elif kind == "meaning":
            cur.execute("""UPDATE vocabulary SET translation=%s,
                             definition=IF(definition=%s, %s, definition)
                           WHERE deleted=0 AND word=%s""", (new, old, new, word))
        else:  # empty
            cur.execute("""UPDATE vocabulary SET translation=%s
                           WHERE deleted=0 AND word=%s
                             AND (translation IS NULL OR translation='')""", (new, word))
        done += cur.rowcount
    conn.commit()
    print(f"已更新 {done} 行")
    conn.close()


if __name__ == "__main__":
    main()
