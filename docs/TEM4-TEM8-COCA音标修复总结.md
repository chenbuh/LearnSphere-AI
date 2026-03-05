# TEM-4、TEM-8、COCA 音标修复 - 完整方案

## 📁 已创建的文件

### 1. 核心数据文件
- **`frontend-vue/src/data/phonetic-dict.js`**
  - 包含约 500 个常用词汇的音标
  - 可直接导入使用
  - 用途：快速补充基础词汇音标

### 2. 修复工具
- **`frontend-vue/src/data/fix-tem4-phonetics.js`**
  - TEM-4 旧式音标转换脚本
  - 自动将旧式音标符号转换为标准 IPA
  - 使用方法：`node fix-tem4-phonetics.js`

- **`frontend-vue/src/data/fetch-phonetics.py`**
  - Python 批量获取音标脚本
  - 支持有道词典 API 和 Free Dictionary API
  - 可分批处理大量单词
  - 使用方法：`python fetch-phonetics.py <filename>`

- **`frontend-vue/src/data/update-phonetics.mjs`**
  - Node.js 批量更新脚本
  - 使用 phonetic-dict.js 中的数据
  - 使用方法：`node update-phonetics.mjs`

### 3. 文档
- **`docs/TEM4-TEM8-COCA音标修复指南.md`**
  - 详细的修复指南
  - 包含多种解决方案
  - API 使用说明

- **`docs/单词数据完整性检查报告.md`**
  - 原始问题报告
  - 数据完整性分析

## 🚀 快速开始

### 方案 A：立即修复 TEM-4（推荐）

```bash
cd frontend-vue/src/data
node fix-tem4-phonetics.js

# 检查生成的文件
cat tem4_words_fixed.js | head -50

# 如果满意，替换原文件
mv tem4_words_fixed.js tem4_words.js
```

### 方案 B：使用 Python 脚本批量获取音标

```bash
# 安装依赖
pip install requests

# 处理 TEM-8 的前 100 个单词（测试）
python fetch-phonetics.py tem8_words.js 0 100

# 处理全部 TEM-8 单词（需要时间）
python fetch-phonetics.py tem8_words.js

# 更新原文件
# 脚本会询问是否更新，选择 y
```

### 方案 C：使用 Node.js 脚本

```bash
cd frontend-vue/src/data
node update-phonetics.mjs
```

## 📊 各方案对比

| 方案 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| fix-tem4-phonetics.js | TEM-4 旧式音标转换 | 快速、离线 | 仅适用于 TEM-4 |
| fetch-phonetics.py | 批量获取新音标 | 准确、可分批 | 需要 Python |
| update-phonetics.mjs | 使用已有音标库 | 快速、离线 | 只包含常用词 |
| 手动使用 API | 少量单词补充 | 灵活 | 效率低 |

## 📝 预期效果

### TEM-4
- ✅ 修复前：`"phonetic": "/AkE demik/"`（旧式）
- ✅ 修复后：`"phonetic": "/ækædemɪk/"`（标准 IPA）
- ✅ 完整率：100%

### TEM-8
- ⚠️ 修复前：`"phonetic": ""`（空）
- ✅ 修复后：`"phonetic": "/ˈæbəkəs/"`（标准 IPA）
- ✅ 完整率：~85%（需要 API 查询）

### COCA
- ⚠️ 修复前：`"phonetic": ""`（空）
- ✅ 修复后：部分补充（高频词）
- ✅ 完整率：~30%（建议按需查询）

## 🔧 高级用法

### 1. 自定义 API 密钥

如果要使用付费词典 API（如牛津、剑桥），可以修改 `fetch-phonetics.py`：

```python
def get_phonetic_from_oxford(word, api_id, api_key):
    url = f"https://od-api.oxforddictionaries.com/api/v2/entries/en/{word}"
    headers = {
        'app_id': api_id,
        'app_key': api_key
    }
    response = requests.get(url, headers=headers)
    # ... 处理响应
```

### 2. 本地 ECDICT 数据库

```bash
# 下载 ECDICT
wget https://github.com/skywind3000/ECDICT/releases/download/1.0.28/ecdict-sqlite-28.zip
unzip ecdict-sqlite-28.zip

# 查询
sqlite3 stardict.db "SELECT word, phonetic FROM stardict WHERE word='abandon';"
```

### 3. 前端按需查询

```javascript
// 在 Vue 组件中
async function getWordPhonetic(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    const data = await response.json()

    if (data[0]?.phonetics?.[0]?.text) {
        return data[0].phonetics[0].text
    }
    return null
}
```

## ✅ 验证步骤

修复完成后，运行以下验证：

```javascript
// validate.js
import { tem4Words } from './tem4_words.js'
import { tem8Words } from './tem8_words.js'
import { cocaWords } from './coca_words.js'

function validate(words, name) {
    const total = words.length
    const withPhonetic = words.filter(w => w.phonetic && w.phonetic !== '').length
    const percentage = (withPhonetic / total * 100).toFixed(1)

    console.log(`${name}:`)
    console.log(`  总计: ${total}`)
    console.log(`  有音标: ${withPhonetic}`)
    console.log(`  完整率: ${percentage}%`)
}

validate(tem4Words, 'TEM-4')
validate(tem8Words, 'TEM-8')
validate(cocaWords, 'COCA')
```

## 🎯 推荐工作流程

### 第 1 步：修复 TEM-4（立即可做）
```bash
cd frontend-vue/src/data
node fix-tem4-phonetics.js
mv tem4_words_fixed.js tem4_words.js
```

### 第 2 步：补充 TEM-8 音标（可选）
```bash
# 先测试前 100 个
python fetch-phonetics.py tem8_words.js 0 100

# 确认无误后处理全部
python fetch-phonetics.py tem8_words.js
```

### 第 3 步：更新 COCA 高频词（可选）
```bash
# 只处理前 5000 个高频词
python fetch-phonetics.py coca_words.js 0 5000
```

## 📞 需要帮助？

如果遇到问题：
1. 查看 `docs/TEM4-TEM8-COCA音标修复指南.md`
2. 检查脚本输出的错误信息
3. 确保网络连接正常（使用 API 时）
4. 验证文件路径正确

## 🔄 回滚方法

如果修复结果不满意，可以从备份恢复：

```bash
# 恢复 TEM-4
cp tem4_words.js.backup tem4_words.js

# 恢复 TEM-8
cp tem8_words.js.backup tem8_words.js

# 恢复 COCA
cp coca_words.js.backup coca_words.js
```

## 📈 预期提升

修复后，单词数据的完整性将大幅提升：

| 文件 | 修复前 | 修复后 | 提升 |
|------|--------|--------|------|
| TEM-4 | ⭐⭐⭐ | ⭐⭐⭐⭐ | +1星 |
| TEM-8 | ⭐⭐⭐ | ⭐⭐⭐⭐ | +1星 |
| COCA | ⭐⭐⭐ | ⭐⭐⭐⭐ | +1星 |

---

**最后更新**: 2026-02-24
**版本**: 1.0
