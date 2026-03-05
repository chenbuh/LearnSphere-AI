import json
import re
from typing import Dict, Optional, Tuple

import mysql.connector

DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "chen20040209",
    "database": "learnsphere_ai",
    "charset": "utf8mb4",
}


def norm_word(word: str) -> str:
    if not word:
        return ""
    w = word.strip().lower()
    for ch in (" ", "-", ".", "'"):
        w = w.replace(ch, "")
    return w


def is_bad_example(example: str) -> bool:
    e = (example or "").strip()
    if not e:
        return True
    low = e.lower()
    if e == "This is useful for study.":
        return True
    if "unavailable" in low:
        return True
    return False


def is_bad_example_cn(example_cn: str) -> bool:
    c = (example_cn or "").strip()
    if not c:
        return True
    if c.startswith("这是一个关于"):
        return True
    if c in ("这对学习有用。", "暂无例句。"):
        return True
    if "翻译获取失败" in c:
        return True
    return False


def is_bad_definition(definition: str) -> bool:
    d = (definition or "").strip()
    if not d:
        return True
    if "unavailable" in d.lower():
        return True
    return False


def clean_json_blob(text: str) -> str:
    s = (text or "").strip()
    if not s:
        return ""
    if s.startswith("```"):
        s = re.sub(r"^```(?:json)?\s*", "", s, flags=re.IGNORECASE)
        s = re.sub(r"\s*```$", "", s)
    # keep the largest object-looking slice
    l = s.find("{")
    r = s.rfind("}")
    if l != -1 and r != -1 and r > l:
        s = s[l : r + 1]
    return s


def parse_log_word(prompt_preview: str) -> Optional[str]:
    if not prompt_preview:
        return None
    m = re.search(r"单词：'([^']+)'", prompt_preview)
    if m:
        return m.group(1).strip()
    m = re.search(r"word:\s*'([^']+)'", prompt_preview, flags=re.IGNORECASE)
    if m:
        return m.group(1).strip()
    return None


def extract_candidate(prompt_preview: str, response_content: str) -> Optional[Tuple[str, Dict[str, str]]]:
    word = parse_log_word(prompt_preview)
    if not word:
        return None
    blob = clean_json_blob(response_content)
    if not blob:
        return None
    try:
        obj = json.loads(blob)
    except Exception:
        return None

    definition = str(obj.get("definition") or "").strip()
    example = str(obj.get("example") or "").strip()
    example_cn = str(obj.get("exampleTranslation") or obj.get("example_translation") or "").strip()

    if is_bad_definition(definition):
        definition = ""
    if is_bad_example(example):
        example = ""
    if is_bad_example_cn(example_cn):
        example_cn = ""

    if not definition and not (example and example_cn):
        return None

    return norm_word(word), {
        "definition": definition,
        "example": example,
        "example_translation": example_cn,
    }


def main() -> None:
    conn = mysql.connector.connect(**DB_CONFIG)
    conn.autocommit = False
    cur = conn.cursor(dictionary=True)

    target_sql = """
    SELECT id, word, definition, example, example_translation
    FROM vocabulary
    WHERE exam_type='high_school'
      AND (
        COALESCE(TRIM(definition),'')='' OR
        COALESCE(TRIM(example),'')='' OR
        COALESCE(TRIM(example_translation),'')='' OR
        example='This is useful for study.' OR
        example LIKE '%unavailable%' OR
        example_translation LIKE '这是一个关于%' OR
        example_translation='这对学习有用。' OR
        example_translation='暂无例句。' OR
        example_translation LIKE '%翻译获取失败%'
      )
    ORDER BY id
    """
    cur.execute(target_sql)
    targets = cur.fetchall()

    log_sql = """
    SELECT id, prompt_preview, response_content
    FROM ai_generation_log
    WHERE action_type='GENERATE_VOCAB_DETAIL'
      AND status='SUCCESS'
      AND response_content IS NOT NULL
      AND response_content <> ''
    ORDER BY id DESC
    """
    cur.execute(log_sql)
    logs = cur.fetchall()

    best: Dict[str, Dict[str, str]] = {}
    for row in logs:
        item = extract_candidate(row.get("prompt_preview"), row.get("response_content"))
        if not item:
            continue
        nword, payload = item
        # keep the newest valid entry for each word
        if nword not in best:
            best[nword] = payload

    updates = []
    for t in targets:
        nword = norm_word(t["word"])
        cand = best.get(nword)
        if not cand:
            continue

        old_def = t.get("definition") or ""
        old_ex = t.get("example") or ""
        old_ex_cn = t.get("example_translation") or ""

        new_def = old_def
        new_ex = old_ex
        new_ex_cn = old_ex_cn

        if is_bad_definition(old_def) and cand.get("definition"):
            new_def = cand["definition"]

        ex_bad = is_bad_example(old_ex)
        ex_cn_bad = is_bad_example_cn(old_ex_cn)
        if (ex_bad or ex_cn_bad) and cand.get("example") and cand.get("example_translation"):
            new_ex = cand["example"]
            new_ex_cn = cand["example_translation"]

        if new_def != old_def or new_ex != old_ex or new_ex_cn != old_ex_cn:
            updates.append((new_def, new_ex, new_ex_cn, t["id"]))

    if updates:
        update_sql = """
        UPDATE vocabulary
        SET definition=%s,
            example=%s,
            example_translation=%s,
            update_time=NOW()
        WHERE id=%s
        """
        cur.executemany(update_sql, updates)
        conn.commit()
    else:
        conn.rollback()

    print(f"targets={len(targets)} logs={len(logs)} candidates={len(best)} updates={len(updates)}")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
