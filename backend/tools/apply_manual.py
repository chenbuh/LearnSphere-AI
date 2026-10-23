"""
把 manual_examples.py 里手工编写的例句写入数据库。

写入前逐条校验：
  * 英文例句必须真的包含该单词（忽略大小写；缩写词允许大小写差异）
  * 中文译文必须含汉字
  * 英文例句不得含中文
校验不通过的条目不写库，并打印出来，便于修正。

用法：
  python apply_manual.py --dry-run    # 只校验，不写库
  python apply_manual.py              # 校验并写库
"""

import argparse
import os
import re
import sys

import pymysql

from manual_examples import MANUAL, SENTENCE_CN

MYSQL = dict(host="127.0.0.1", port=3306, user="root",
             password=os.environ.get("MYSQL_PWD", "<REDACTED-DB-PASSWORD>"),
             database="learnsphere_ai", charset="utf8mb4")
CJK = re.compile(r"[\u4e00-\u9fff]")


def word_in_sentence(word, en):
    """例句里是否真的用到了这个单词（容忍大小写、缩写词的写法差异）。

    词库里有少量脏词条（如 'really v' 把词性混进了单词），
    这类按去掉末尾词性标记后的主词来校验。
    """
    low = en.lower()
    w = word.lower().strip()
    # 去掉 " really v" / " word n." 这类混入词性的后缀
    candidates = [w]
    stripped = re.sub(r"\s+[a-z]{1,5}\.?$", "", w)
    if stripped and stripped != w:
        candidates.append(stripped)
    for cand in candidates:
        if re.search(r"(?<![a-z])" + re.escape(cand) + r"(?:'s|s|es|ed|ing|d)?(?![a-z])", low):
            return True
        # 连字符词：允许空格写法（take-out / take out）
        if "-" in cand and re.search(r"(?<![a-z])" + re.escape(cand.replace("-", " ")) + r"(?![a-z])", low):
            return True
    return False


def validate(word, en, cn):
    problems = []
    if not en or len(en.split()) < 4:
        problems.append("英文例句过短")
    if not en or en[-1] not in ".!?\"'":
        problems.append("英文例句缺句末标点")
    if en and CJK.search(en):
        problems.append("英文例句含中文")
    if not cn or not CJK.search(cn):
        problems.append("译文不含中文")
    if en and not word_in_sentence(word, en):
        problems.append(f"例句未包含单词 {word!r}")
    return problems


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    conn = pymysql.connect(**MYSQL)
    cur = conn.cursor()

    bad = []
    rows = 0
    for word, (en, cn) in MANUAL.items():
        problems = validate(word, en, cn)
        if problems:
            bad.append((word, problems, en, cn))
            continue
        cur.execute("SELECT COUNT(*) FROM vocabulary WHERE deleted=0 AND word=%s", (word,))
        exists = cur.fetchone()[0]
        if not exists:
            bad.append((word, ["数据库中不存在该单词"], en, cn))
            continue
        if not args.dry_run:
            cur.execute("""UPDATE vocabulary SET example=%s, example_translation=%s
                           WHERE deleted=0 AND word=%s AND (example IS NULL OR example='')""",
                        (en, cn, word))
            rows += cur.rowcount
        else:
            rows += 1

    sent_rows = 0
    for sentence, cn in SENTENCE_CN.items():
        if not CJK.search(cn):
            bad.append((sentence[:40], ["译文不含中文"], sentence, cn))
            continue
        if not args.dry_run:
            cur.execute("""UPDATE vocabulary SET example_translation=%s
                           WHERE deleted=0 AND example=%s
                             AND (example_translation IS NULL OR example_translation='')""",
                        (cn, sentence))
            sent_rows += cur.rowcount
        else:
            sent_rows += 1

    if not args.dry_run:
        conn.commit()

    print(f"{'[试运行] ' if args.dry_run else ''}手工例句: {rows} 行, 句子补译: {sent_rows} 行")
    if bad:
        print(f"\n校验未通过 {len(bad)} 条（未写库）：")
        for word, problems, en, cn in bad:
            print(f"  - {word}: {'; '.join(problems)}")
            print(f"      EN: {en}")
            print(f"      CN: {cn}")
    else:
        print("全部条目校验通过。")
    conn.close()


if __name__ == "__main__":
    main()
