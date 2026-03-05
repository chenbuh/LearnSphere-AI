#!/usr/bin/env python3
"""
完善 COCA 词库中的缺失字段：
1) 先使用本地词库离线补齐 phonetic/translation
2) 再调用外部词典补齐剩余缺失
"""

import json
import re
import sys
import threading
import urllib.parse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests


DATA_DIR = Path(__file__).resolve().parent
COCA_FILE = DATA_DIR / "coca_words.js"

LOCAL_SOURCE_FILES = [
    "primary_school_words.js",
    "middle_school_words.js",
    "high_school_words.js",
    "cet4_words.js",
    "cet6_words.js",
    "tem4_words.js",
    "tem8_words.js",
    "toefl_words.js",
    "ielts_words.js",
    "gre_words.js",
    "postgraduate_words.js",
]

MAX_WORKERS = 20
TIMEOUT = 8
CACHE_LOCK = threading.Lock()

MANUAL_PHONETIC = {
    "ahh": "/ɑː/",
    "umm": "/ʌm/",
    "mm-hmm": "/m hʌm/",
    "n't": "/nt/",
    "y'all": "/jɔːl/",
}

MANUAL_TRANSLATION = {
    "ahh": "啊（表示理解、惊讶等）",
    "umm": "嗯（表示犹豫）",
    "mm-hmm": "嗯哼（表示同意）",
    "n't": "不（否定缩写）",
    "y'all": "你们（口语）",
}


def setup_stdout() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="ignore")
    except Exception:
        pass


def normalize_word(word: str) -> str:
    return re.sub(r"\s+", " ", (word or "").strip()).lower()


def normalize_phonetic(value: str | None) -> str | None:
    if not value:
        return None
    p = str(value).strip()
    if not p:
        return None
    p = p.replace("[", "/").replace("]", "/")
    if not p.startswith("/"):
        p = f"/{p}"
    if not p.endswith("/"):
        p = f"{p}/"
    return p


def extract_entries(content: str) -> list[dict]:
    objects = re.findall(r"\{[\s\S]*?\}", content)
    entries = []
    for obj in objects:
        word = (re.search(r'"word":\s*"([^"]+)"', obj) or [None, None])[1]
        if not word:
            continue
        phonetic = (re.search(r'"phonetic":\s*"([^"]*)"', obj) or [None, ""])[1].strip()
        translation = (re.search(r'"translation":\s*"([^"]*)"', obj) or [None, ""])[1].strip()
        meaning = (re.search(r'"meaning":\s*"([^"]*)"', obj) or [None, ""])[1].strip()
        entries.append(
            {
                "word": word,
                "key": normalize_word(word),
                "phonetic": phonetic,
                "translation": translation,
                "meaning": meaning,
            }
        )
    return entries


def build_local_maps() -> tuple[dict[str, str], dict[str, str]]:
    phonetic_map: dict[str, str] = {}
    translation_map: dict[str, str] = {}

    for name in LOCAL_SOURCE_FILES:
        path = DATA_DIR / name
        if not path.exists():
            continue

        content = path.read_text(encoding="utf-8")
        entries = extract_entries(content)
        for entry in entries:
            k = entry["key"]
            if entry["phonetic"] and k not in phonetic_map:
                phonetic_map[k] = entry["phonetic"]

            tr = entry["translation"] or entry["meaning"]
            if tr and k not in translation_map:
                translation_map[k] = tr

    return phonetic_map, translation_map


def fetch_youdao(word: str) -> tuple[str | None, str | None]:
    """
    返回: (phonetic, translation)
    """
    try:
        url = f"http://dict.youdao.com/jsonapi?q={urllib.parse.quote(word)}"
        resp = requests.get(url, timeout=TIMEOUT)
        if resp.status_code != 200:
            return None, None

        data = resp.json()
        phonetic = None
        translation = None

        ec = data.get("ec")
        if ec and ec.get("word"):
            wd = ec["word"][0]
            phonetic = normalize_phonetic(wd.get("ukphone") or wd.get("usphone"))

            trs = wd.get("trs") or []
            tr_parts = []
            for tr in trs:
                tr_block = tr.get("tr")
                if isinstance(tr_block, list):
                    for item in tr_block:
                        if isinstance(item, dict):
                            line = item.get("l", {}).get("i")
                            if isinstance(line, list):
                                tr_parts.extend([x for x in line if isinstance(x, str) and x.strip()])
                        elif isinstance(item, str) and item.strip():
                            tr_parts.append(item.strip())
                elif isinstance(tr_block, str) and tr_block.strip():
                    tr_parts.append(tr_block.strip())

            if tr_parts:
                translation = "; ".join(dict.fromkeys(tr_parts))

        if not translation:
            fanyi = data.get("fanyi")
            if fanyi and isinstance(fanyi.get("tran"), str):
                tran = fanyi.get("tran", "").strip()
                if tran:
                    translation = tran

        if not translation:
            web_trans = data.get("web_trans", {}).get("web-translation", [])
            web_candidates = []
            for item in web_trans:
                for tr_item in item.get("trans", []):
                    summary = tr_item.get("summary")
                    if isinstance(summary, dict):
                        lines = summary.get("line", [])
                        if isinstance(lines, list):
                            web_candidates.extend([x for x in lines if isinstance(x, str) and x.strip()])
            if web_candidates:
                translation = "; ".join(dict.fromkeys(web_candidates[:3]))

        return phonetic, translation
    except Exception:
        return None, None


def fetch_dictapi_phonetic(word: str) -> str | None:
    try:
        url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{urllib.parse.quote(word)}"
        resp = requests.get(url, timeout=TIMEOUT)
        if resp.status_code != 200:
            return None
        data = resp.json()
        if not data or not isinstance(data, list):
            return None
        phonetics = data[0].get("phonetics") or []
        for p in phonetics:
            text = p.get("text")
            normalized = normalize_phonetic(text)
            if normalized:
                return normalized
        return None
    except Exception:
        return None


def strip_slashes(phonetic: str) -> str:
    p = (phonetic or "").strip()
    if p.startswith("/"):
        p = p[1:]
    if p.endswith("/"):
        p = p[:-1]
    return p.strip()


def generate_candidate_words(word: str) -> list[str]:
    """
    生成查询候选词形，优先保留原词，再尝试常见归一化/词形还原。
    """
    w = normalize_word(word)
    candidates = [w]

    if "-" in w:
        candidates.append(w.replace("-", " "))
        candidates.append(w.replace("-", ""))
    if "/" in w:
        candidates.append(w.replace("/", " "))
        candidates.append(w.replace("/", ""))
    if "'" in w:
        candidates.append(w.replace("'", ""))
        candidates.append(w.replace("'", " "))

    def add_lemma_forms(token: str) -> None:
        if len(token) <= 3:
            return

        if token.endswith("ing") and len(token) > 5:
            stem = token[:-3]
            candidates.append(stem)
            candidates.append(stem + "e")
            if len(stem) >= 2 and stem[-1] == stem[-2]:
                candidates.append(stem[:-1])

        if token.endswith("ed") and len(token) > 4:
            stem = token[:-2]
            candidates.append(stem)
            candidates.append(stem + "e")
            if len(stem) >= 2 and stem[-1] == stem[-2]:
                candidates.append(stem[:-1])

        if token.endswith("ies") and len(token) > 4:
            candidates.append(token[:-3] + "y")

        if token.endswith("es") and len(token) > 4:
            candidates.append(token[:-2])

        if token.endswith("s") and len(token) > 3:
            candidates.append(token[:-1])

        if token.endswith("ly") and len(token) > 4:
            candidates.append(token[:-2])

        if token.endswith("ness") and len(token) > 6:
            candidates.append(token[:-4])

    for c in list(candidates):
        add_lemma_forms(c)

    cleaned = []
    for c in candidates:
        c = normalize_word(c)
        if c:
            cleaned.append(c)

    # 去重并保持顺序
    return list(dict.fromkeys(cleaned))


def split_compound(word: str) -> tuple[list[str], list[str]]:
    """
    拆分复合词，返回 (parts, separators)。
    separators 长度 = len(parts) - 1
    """
    parts = re.split(r"[-/]", word)
    separators = re.findall(r"[-/]", word)
    parts = [normalize_word(x) for x in parts if normalize_word(x)]
    return parts, separators


def join_translations(parts: list[str], separators: list[str]) -> str:
    if not parts:
        return ""
    if len(parts) == 1:
        return parts[0]
    out = [parts[0]]
    for i, sep in enumerate(separators):
        out.append(sep)
        out.append(parts[i + 1])
    return "".join(out)


def fetch_for_word(
    word: str,
    known_phonetic: dict[str, str],
    known_translation: dict[str, str],
    cache: dict[str, tuple[str | None, str | None]],
) -> tuple[str, str | None, str | None]:
    key = normalize_word(word)

    if key in MANUAL_PHONETIC or key in MANUAL_TRANSLATION:
        return key, MANUAL_PHONETIC.get(key), MANUAL_TRANSLATION.get(key)

    best_ph = None
    best_tr = None

    # 先走候选词形直查
    for candidate in generate_candidate_words(word):
        with CACHE_LOCK:
            cached = cache.get(candidate)
        if cached is not None:
            ph, tr = cached
        else:
            ph, tr = fetch_youdao(candidate)
            if not ph:
                ph = fetch_dictapi_phonetic(candidate)
            with CACHE_LOCK:
                cache[candidate] = (ph, tr)

        if ph and not best_ph:
            best_ph = ph
        if tr and not best_tr:
            best_tr = tr

        if best_ph and best_tr:
            return key, best_ph, best_tr

    # 复合词拆分：逐段拼接音标/翻译
    parts, separators = split_compound(key)
    if len(parts) >= 2:
        part_ph = []
        part_tr = []
        can_compose_ph = True
        can_compose_tr = True

        for p in parts:
            ph = known_phonetic.get(p) or MANUAL_PHONETIC.get(p)
            tr = known_translation.get(p) or MANUAL_TRANSLATION.get(p)

            if not ph or not tr:
                # 对分词继续走候选词形
                got_ph = ph
                got_tr = tr
                for cand in generate_candidate_words(p):
                    with CACHE_LOCK:
                        cached_part = cache.get(cand)
                    if cached_part is not None:
                        cph, ctr = cached_part
                    else:
                        cph, ctr = fetch_youdao(cand)
                        if not cph:
                            cph = fetch_dictapi_phonetic(cand)
                        with CACHE_LOCK:
                            cache[cand] = (cph, ctr)
                    if not got_ph and cph:
                        got_ph = cph
                    if not got_tr and ctr:
                        got_tr = ctr
                    if got_ph and got_tr:
                        break
                ph = got_ph
                tr = got_tr

            if ph:
                part_ph.append(strip_slashes(ph))
            else:
                can_compose_ph = False

            if tr:
                part_tr.append(tr)
            else:
                can_compose_tr = False

        composed_ph = f"/{' '.join(part_ph)}/" if can_compose_ph and part_ph else None
        composed_tr = join_translations(part_tr, separators) if can_compose_tr and part_tr else None
        if composed_ph and not best_ph:
            best_ph = composed_ph
        if composed_tr and not best_tr:
            best_tr = composed_tr

    return key, best_ph, best_tr


def replace_object_fields(content: str, phonetic_updates: dict[str, str], translation_updates: dict[str, str]) -> str:
    object_pattern = re.compile(r"\{[\s\S]*?\}")

    def repl(match: re.Match) -> str:
        obj = match.group(0)
        wm = re.search(r'"word":\s*"([^"]+)"', obj)
        if not wm:
            return obj
        key = normalize_word(wm.group(1))

        pm = re.search(r'"phonetic":\s*"([^"]*)"', obj)
        if pm and pm.group(1).strip() == "":
            value = phonetic_updates.get(key)
            if value:
                obj = re.sub(r'"phonetic":\s*"[^"]*"', f'"phonetic": "{value}"', obj, count=1)

        tm = re.search(r'"translation":\s*"([^"]*)"', obj)
        if tm and tm.group(1).strip() == "":
            value = translation_updates.get(key)
            if value:
                safe = value.replace("\\", "\\\\").replace('"', '\\"')
                obj = re.sub(r'"translation":\s*"[^"]*"', f'"translation": "{safe}"', obj, count=1)

        return obj

    return object_pattern.sub(repl, content)


def main() -> None:
    setup_stdout()

    if not COCA_FILE.exists():
        print(f"❌ File not found: {COCA_FILE}")
        sys.exit(1)

    original = COCA_FILE.read_text(encoding="utf-8")
    entries = extract_entries(original)

    missing_ph_before = sum(1 for e in entries if e["phonetic"] == "")
    missing_tr_before = sum(1 for e in entries if e["translation"] == "")
    print(f"Before: missing phonetic={missing_ph_before}, missing translation={missing_tr_before}")

    local_ph_map, local_tr_map = build_local_maps()

    offline_ph_updates: dict[str, str] = {}
    offline_tr_updates: dict[str, str] = {}
    unresolved_words: set[str] = set()

    # 初始可用映射：本地词库 + 当前 COCA 已有数据
    known_phonetic = dict(local_ph_map)
    known_translation = dict(local_tr_map)
    for e in entries:
        if e["phonetic"]:
            known_phonetic[e["key"]] = e["phonetic"]
        if e["translation"]:
            known_translation[e["key"]] = e["translation"]

    for e in entries:
        key = e["key"]
        if e["phonetic"] == "":
            if key in local_ph_map:
                offline_ph_updates[key] = local_ph_map[key]
                known_phonetic[key] = local_ph_map[key]
            else:
                unresolved_words.add(e["word"])
        if e["translation"] == "":
            if key in local_tr_map:
                offline_tr_updates[key] = local_tr_map[key]
                known_translation[key] = local_tr_map[key]
            else:
                unresolved_words.add(e["word"])

    print(
        f"Offline fill: phonetic={len(offline_ph_updates)}, translation={len(offline_tr_updates)}, "
        f"need_online_words={len(unresolved_words)}"
    )

    online_ph_updates: dict[str, str] = {}
    online_tr_updates: dict[str, str] = {}
    api_cache: dict[str, tuple[str | None, str | None]] = {}

    if unresolved_words:
        total = len(unresolved_words)
        done = 0
        words = sorted(unresolved_words, key=lambda x: x.lower())
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {
                executor.submit(fetch_for_word, w, known_phonetic, known_translation, api_cache): w for w in words
            }
            for fut in as_completed(futures):
                done += 1
                key, ph, tr = fut.result()
                if ph:
                    online_ph_updates[key] = ph
                    known_phonetic[key] = ph
                if tr:
                    online_tr_updates[key] = tr
                    known_translation[key] = tr
                if done % 200 == 0 or done == total:
                    print(
                        f"Online progress: {done}/{total}, "
                        f"phonetic_found={len(online_ph_updates)}, translation_found={len(online_tr_updates)}"
                    )

    all_ph_updates = {**offline_ph_updates, **online_ph_updates}
    all_tr_updates = {**offline_tr_updates, **online_tr_updates}

    updated = replace_object_fields(original, all_ph_updates, all_tr_updates)

    backup = COCA_FILE.with_suffix(".js.backup")
    if not backup.exists():
        backup.write_text(original, encoding="utf-8")
        print(f"Backup created: {backup.name}")

    COCA_FILE.write_text(updated, encoding="utf-8")
    print(f"Updated: {COCA_FILE.name}")

    final_entries = extract_entries(updated)
    missing_ph_after = sum(1 for e in final_entries if e["phonetic"] == "")
    missing_tr_after = sum(1 for e in final_entries if e["translation"] == "")
    print(f"After: missing phonetic={missing_ph_after}, missing translation={missing_tr_after}")

    progress = {
        "missing_phonetic_before": missing_ph_before,
        "missing_translation_before": missing_tr_before,
        "offline_filled_phonetic": len(offline_ph_updates),
        "offline_filled_translation": len(offline_tr_updates),
        "online_filled_phonetic": len(online_ph_updates),
        "online_filled_translation": len(online_tr_updates),
        "missing_phonetic_after": missing_ph_after,
        "missing_translation_after": missing_tr_after,
    }
    (DATA_DIR / "coca_completion_progress.json").write_text(
        json.dumps(progress, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("Saved: coca_completion_progress.json")


if __name__ == "__main__":
    main()
