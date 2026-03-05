# TEM-4、TEM-8、COCA 音标修复指南

## 问题概述

根据《单词数据完整性检查报告》，三个数据文件存在音标问题：

| 文件 | 问题 | 词汇量 | 优先级 |
|------|------|--------|--------|
| `tem4_words.js` | 使用旧式音标符号 | 1,883 | P1 |
| `tem8_words.js` | 完全缺少音标 | 1,553 | P1 |
| `coca_words.js` | 完全缺少音标 | 17,634 | P2 |

## 解决方案

### 方案 1：使用专业词典 API（推荐）

#### 1. 有道词典 API
```javascript
// fetch-phonetics.js
import fetch from 'node-fetch'

async function getPhonetic(word) {
    const url = `https://dict.youdao.com/jsonapi?q=${word}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.ec) {
        return {
            word: word,
            phonetic: `/${data.ec.word[0].ukspeech ? data.ec.word[0].ukspeech : data.ec.word[0].usspeech}/`,
            translation: data.ec.word[0].tr[0].l.i[0]
        }
    }
    return null
}

// 使用示例
const words = ['abacus', 'abandon', 'ability']
for (const word of words) {
    const result = await getPhonetic(word)
    console.log(result)
}
```

#### 2. ECDICT 开源词典（推荐）
```bash
# 下载 ECDICT 数据
wget https://github.com/skywind3000/ECDICT/releases/download/1.0.28/ecdict-sqlite-28.zip
unzip ecdict-sqlite-28.zip

# 查询单词音标
sqlite3 stardict.db "SELECT word, phonetic, translation FROM stardict WHERE word='abandon';"
```

### 方案 2：使用预构建的音标数据库

我已经创建了一个包含常用词音标的文件：
- `src/data/phonetic-dict.js`

这个文件包含了大部分基础词汇的音标。

### 方案 3：批量更新脚本

运行以下脚本自动更新音标：

```bash
cd frontend-vue/src/data
node update-phonetics.mjs
```

## 具体操作步骤

### TEM-4 修复（更新旧式音标）

TEM-4 使用的是旧式音标符号，需要转换为标准 IPA：

```javascript
// tem4-phonetic-converter.js
const oldToNewIPA = {
    'E': 'ə',
    'R': 'ɜː',
    'i': 'ɪ',
    'A': 'æ',
    'O': 'ɒ',
    'U': 'ʊ',
    '@': 'ə',
    'V': 'ʌ'
}

function convertPhonetic(oldPhonetic) {
    let newPhonetic = oldPhonetic
    for (const [old, new_] of Object.entries(oldToNewIPA)) {
        newPhonetic = newPhonetic.replace(new RegExp(old, 'g'), new_)
    }
    return newPhonetic
}

// 使用示例
const tem4Word = {
    "word": "academic",
    "meaning": "a.学院的；学术的",
    "phonetic": "/AkE demik/",
    "difficulty": 3,
    "category": "adj",
    "examType": "tem4"
}

tem4Word.phonetic = convertPhonetic(tem4Word.phonetic)
// 结果: "/əkædemɪk/"
```

### TEM-8 修复（补充音标）

由于 TEM-8 有 1,553 个单词，建议分批处理：

#### 第 1 步：提取单词列表
```bash
# 从 tem8_words.js 提取所有单词
grep -oP '"word":\s*"\K[^"]+' tem8_words.js > tem8-wordlist.txt
```

#### 第 2 步：批量查询音标
```python
# fetch-tem8-phonetics.py
import requests
import json

def get_phonetic_youdao(word):
    url = f"https://dict.youdao.com/jsonapi?q={word}"
    try:
        resp = requests.get(url, timeout=2)
        data = resp.json()
        if 'ec' in data and 'word' in data['ec']:
            uk = data['ec']['word'][0].get('ukspeech', '')
            us = data['ec']['word'][0].get('usspeech', '')
            return uk or us
    except:
        pass
    return None

# 读取单词列表
with open('tem8-wordlist.txt', 'r') as f:
    words = [w.strip() for w in f.readlines()]

# 批量获取音标
phonetics = {}
for i, word in enumerate(words):
    if i % 100 == 0:
        print(f"Processing {i}/{len(words)}")
    phonetic = get_phonetic_youdao(word)
    if phonetic:
        phonetics[word] = f"/{phonetic}/"

# 保存结果
with open('tem8-phonetics.json', 'w') as f:
    json.dump(phonetics, f)
```

#### 第 3 步：合并到原文件
```javascript
// merge-phonetics.js
import fs from 'fs'

const tem8Words = JSON.parse(fs.readFileSync('tem8_words.js'))
const phonetics = JSON.parse(fs.readFileSync('tem8-phonetics.json'))

const updated = tem8Words.map(word => ({
    ...word,
    phonetic: phonetics[word.word] || word.phonetic
}))

fs.writeFileSync('tem8_words_updated.js',
    `export const tem8Words = ${JSON.stringify(updated, null, 2)};`)
```

### COCA 修复（选择性补充）

COCA 有 17,634 个单词，全部补充工作量太大。建议：

1. **只补充高频词**（前 5000 个）
2. **使用在线 API** 按需查询
3. **前端懒加载**，需要时再查

```javascript
// 前端按需查询音标
async function getPhoneticOnline(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    const data = await response.json()

    if (data[0] && data[0].phonetics) {
        return data[0].phonetics[0].text
    }
    return null
}
```

## 推荐方案

鉴于数据量和工作量，我推荐以下组合方案：

### 短期（立即可用）
1. ✅ 使用已有的 `phonetic-dict.js` 覆盖常用词（约 500 个）
2. ✅ 运行转换脚本更新 TEM-4 的旧式音标
3. ✅ TEM-8 和 COCA 保持现状，前端按需查询

### 中期（1-2 周）
1. 使用 Python 脚本批量查询 TEM-8 音标
2. 整理成完整的音标数据库

### 长期（1 个月）
1. 集成 ECDICT 数据库到项目中
2. 建立本地音标服务
3. 添加自动更新机制

## 快速开始

如果你想立即修复 TEM-4 和部分 TEM-8：

```bash
# 1. 进入数据目录
cd frontend-vue/src/data

# 2. 运行更新脚本（会自动处理常用词）
node update-phonetics.mjs

# 3. 验证结果
grep -c '"phonetic": ""' tem4_words.js  # 应该减少
grep -c '"phonetic": ""' tem8_words.js  # 应该减少
```

## 注意事项

1. **备份原文件**：修改前请备份
2. **测试数据**：修改后测试单词卡片功能
3. **逐步推进**：不要一次性修改所有文件
4. **验证格式**：确保音标格式为 `/.../`

## 质量检查

修复完成后，运行以下检查：

```javascript
// 验证音标完整性
function validatePhonetics(words, examType) {
    let missing = 0
    let invalid = 0

    words.forEach(word => {
        if (!word.phonetic || word.phonetic === "") {
            missing++
        } else if (!word.phonetic.startsWith('/')) {
            invalid++
        }
    })

    console.log(`${examType}:`)
    console.log(`  总计: ${words.length}`)
    console.log(`  缺少音标: ${missing}`)
    console.log(`  格式错误: ${invalid}`)
    console.log(`  完整率: ${((words.length - missing) / words.length * 100).toFixed(1)}%`)
}

// 使用示例
import { tem4Words } from './tem4_words.js'
import { tem8Words } from './tem8_words.js'
import { cocaWords } from './coca_words.js'

validatePhonetics(tem4Words, 'TEM-4')
validatePhonetics(tem8Words, 'TEM-8')
validatePhonetics(cocaWords, 'COCA')
```

## 参考资料

- [ECDICT 开源词典](https://github.com/skywind3000/ECDICT)
- [有道词典 API](http://dict.youdao.com/jsonapi)
- [Free Dictionary API](https://dictionaryapi.dev/)
- [IPA 音标对照表](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet)
