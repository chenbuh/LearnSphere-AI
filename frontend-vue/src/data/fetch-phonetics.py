#!/usr/bin/env python3
"""
批量获取单词音标
支持 TEM-4, TEM-8, COCA 等词汇表的音标补充
"""

import json
import re
import time
import sys
import urllib.parse
from pathlib import Path
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

# API 配置
API_TIMEOUT = 3
MAX_WORKERS = 5
RETRY_COUNT = 3

def setup_stdout():
    """确保控制台可输出 IPA 字符"""
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='ignore')
    except Exception:
        pass

def normalize_word(word):
    """清洗异常词形，修复数据源里夹杂的断裂空格"""
    if not word:
        return ''

    w = re.sub(r'\s+', ' ', word.strip())
    return w.lower()

def normalize_phonetic(phonetic):
    """标准化音标格式为 /.../"""
    if not phonetic:
        return None
    p = str(phonetic).strip()
    if not p:
        return None
    p = p.replace('[', '/').replace(']', '/')
    if not p.startswith('/'):
        p = f'/{p}'
    if not p.endswith('/'):
        p = f'{p}/'
    return p

def get_phonetic_from_dictapi(word):
    """使用 Free Dictionary API 获取音标"""
    try:
        encoded = urllib.parse.quote(word)
        url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{encoded}"
        response = requests.get(url, timeout=API_TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0 and 'phonetics' in data[0]:
                phonetics = data[0]['phonetics']
                if phonetics and len(phonetics) > 0:
                    # 优先使用英式音标
                    for p in phonetics:
                        if 'text' in p and p['text']:
                            result = normalize_phonetic(p['text'])
                            if result:
                                return result
        return None
    except Exception as e:
        print(f"Error fetching {word}: {e}")
        return None

def get_phonetic_from_youdao(word):
    """使用有道词典 API 获取音标"""
    try:
        encoded = urllib.parse.quote(word)
        url = f"http://dict.youdao.com/jsonapi?q={encoded}"
        response = requests.get(url, timeout=API_TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            if 'ec' in data and 'word' in data['ec']:
                word_data = data['ec']['word'][0]
                # 优先使用英式音标
                uk = word_data.get('ukphone', '')
                us = word_data.get('usphone', '')
                result = normalize_phonetic(uk or us)
                if result:
                    return result
                # 兼容旧字段（通常是发音文件路径，不作为首选）
                uk_legacy = word_data.get('ukspeech', '')
                us_legacy = word_data.get('usspeech', '')
                legacy = uk_legacy or us_legacy
                if legacy and 'type=' not in legacy:
                    return normalize_phonetic(legacy)
        return None
    except Exception as e:
        print(f"Error fetching {word} from Youdao: {e}")
        return None

def get_phonetic(word):
    """获取单词音标（尝试多个数据源）"""
    normalized = normalize_word(word)
    candidates = [normalized]
    if ' ' in normalized:
        candidates.append(normalized.replace(' ', ''))
    candidates = list(dict.fromkeys([c for c in candidates if c]))

    # 先尝试有道（更准确）
    for candidate in candidates:
        phonetic = get_phonetic_from_youdao(candidate)
        if phonetic:
            return phonetic

    # 备用：Free Dictionary API
    for candidate in candidates:
        phonetic = get_phonetic_from_dictapi(candidate)
        if phonetic:
            return phonetic

    return None

def extract_words_from_js(file_path):
    """从 JavaScript 文件中提取单词列表"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 提取所有 "word": "xxx" 模式
    pattern = r'"word":\s*"([^"]+)"'
    words = re.findall(pattern, content)
    return list(set(words))  # 去重

def update_js_file(file_path, phonetics_map, output_path=None):
    """更新 JavaScript 文件中的音标"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 按对象块替换空的音标字段
    object_pattern = re.compile(r'\{[\s\S]*?\}')

    def replace_object(match):
        obj = match.group(0)
        word_match = re.search(r'"word":\s*"([^"]+)"', obj)
        phonetic_match = re.search(r'"phonetic":\s*"([^"]*)"', obj)
        if not word_match or not phonetic_match:
            return obj

        current_phonetic = phonetic_match.group(1).strip()
        if current_phonetic:
            return obj

        word_raw = word_match.group(1)
        keys = [
            word_raw,
            word_raw.strip().lower(),
            normalize_word(word_raw),
            normalize_word(word_raw).replace(' ', '')
        ]

        for key in keys:
            if key and key in phonetics_map and phonetics_map[key]:
                new_phonetic = phonetics_map[key]
                return re.sub(
                    r'"phonetic":\s*"[^"]*"',
                    f'"phonetic": "{new_phonetic}"',
                    obj,
                    count=1
                )
        return obj

    content = object_pattern.sub(replace_object, content)

    output_path = output_path or file_path
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ Updated file saved to: {output_path}")

def process_words_batch(words, start=0, end=None):
    """批量处理单词"""
    end = end or len(words)
    batch = words[start:end]

    phonetics = {}
    total = len(batch)
    completed = 0

    print(f"📝 Processing {total} words (from index {start})...")

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_word = {executor.submit(get_phonetic, word): word for word in batch}

        for future in as_completed(future_to_word):
            word = future_to_word[future]
            try:
                phonetic = future.result()
                if phonetic:
                    phonetics[word] = phonetic
                    normalized = normalize_word(word)
                    phonetics[normalized] = phonetic
                    phonetics[normalized.replace(' ', '')] = phonetic
                    completed += 1
                    print(f"[{completed}/{total}] ✅ {word}: {phonetic}")
                else:
                    print(f"[{completed}/{total}] ⚠️  {word}: Not found")
                    completed += 1
            except Exception as e:
                print(f"[{completed}/{total}] ❌ {word}: Error - {e}")
                completed += 1

            # 每 10 个单词保存一次进度
            if completed % 50 == 0:
                with open(f'phonetics_progress_{start}.json', 'w', encoding='utf-8') as f:
                    json.dump(phonetics, f, ensure_ascii=False, indent=2)

    success_rate = len(phonetics) / total * 100
    print(f"\n✨ Completed: {len(phonetics)}/{total} ({success_rate:.1f}%)")

    return phonetics

def main():
    """主函数"""
    setup_stdout()

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python fetch-phonetics.py <filename> [start] [end]")
        print("\nExamples:")
        print("  python fetch-phonetics.py tem8_words.js           # 处理全部")
        print("  python fetch-phonetics.py tem8_words.js 0 100    # 处理前 100 个")
        print("  python fetch-phonetics.py tem8_words.js 100 200  # 处理第 100-200 个")
        return

    file_path = sys.argv[1]
    start = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    end = int(sys.argv[3]) if len(sys.argv) > 3 else None

    if not Path(file_path).exists():
        print(f"❌ File not found: {file_path}")
        return

    print(f"📖 Processing: {file_path}")
    print(f"📍 Range: {start} to {end or 'end'}")

    # 提取单词
    words = extract_words_from_js(file_path)
    print(f"📊 Total words in file: {len(words)}")

    # 处理指定范围
    phonetics = process_words_batch(words, start, end)

    # 保存结果
    output_file = f"phonetics_{Path(file_path).stem}_{start}_{end or 'all'}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(phonetics, f, ensure_ascii=False, indent=2)

    print(f"\n💾 Saved to: {output_file}")

    # 更新原文件
    if input("\n是否更新原文件? (y/n): ").lower() == 'y':
        backup_file = file_path + '.backup'
        import shutil
        shutil.copy2(file_path, backup_file)
        print(f"📦 Backup created: {backup_file}")

        update_js_file(file_path, phonetics)
        print("✅ 原文件已更新")

if __name__ == '__main__':
    main()
