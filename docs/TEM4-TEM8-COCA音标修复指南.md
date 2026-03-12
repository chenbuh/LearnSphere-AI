# TEM-4、TEM-8、COCA 音标修复指南

## 合并说明

本文已吸收原 `TEM4-TEM8-COCA音标修复总结.md` 的快速开始、工具清单、验证与回滚内容。后续只保留这一份主文档。

## 问题概述

根据《单词数据完整性检查报告》，三个数据文件存在音标问题：

| 文件 | 问题 | 词汇量 | 优先级 |
|------|------|--------|--------|
| `tem4_words.js` | 使用旧式音标符号 | 1,883 | P1 |
| `tem8_words.js` | 完全缺少音标 | 1,553 | P1 |
| `coca_words.js` | 完全缺少音标 | 17,634 | P2 |

## 已有工具清单

当前项目里已经整理过一批可直接复用的工具和数据：

- `frontend-vue/src/data/phonetic-dict.js`
  - 常用词音标字典
- `frontend-vue/src/data/fix-tem4-phonetics.js`
  - TEM-4 旧式音标转换脚本
- `frontend-vue/src/data/fetch-phonetics.py`
  - 批量查询音标脚本
- `frontend-vue/src/data/update-phonetics.mjs`
  - 使用已有字典批量补音标

## 解决方案

### 方案 1：使用专业词典 API（推荐）

可选：有道词典 API、ECDICT、Free Dictionary API 等。

### 方案 2：使用预构建音标数据库

优先复用：
- `src/data/phonetic-dict.js`

### 方案 3：批量更新脚本

```bash
cd frontend-vue/src/data
node update-phonetics.mjs
```

## 分模块处理建议

### TEM-4 修复

TEM-4 主要是旧式音标转换问题，适合直接使用转换脚本：

```bash
cd frontend-vue/src/data
node fix-tem4-phonetics.js
```

### TEM-8 修复

TEM-8 主要是缺少音标，建议分批处理：

1. 先提取单词列表
2. 用 Python 脚本批量查询音标
3. 合并回原文件

### COCA 修复

COCA 数据量较大，不建议一次性全部补齐。更适合：

1. 先补高频词
2. 再做按需查询
3. 最后视情况补全本地词库

## 推荐方案

### 短期
1. 用现有字典覆盖常用词
2. 先修复 TEM-4
3. TEM-8 / COCA 先按需补充

### 中期
1. 批量补齐 TEM-8
2. 整理出更完整的本地音标库

### 长期
1. 接入 ECDICT 或本地音标服务
2. 建立自动更新机制

## 快速开始

### 方案 A：立即修复 TEM-4（推荐）

```bash
cd frontend-vue/src/data
node fix-tem4-phonetics.js
mv tem4_words_fixed.js tem4_words.js
```

### 方案 B：批量补 TEM-8

```bash
pip install requests
cd frontend-vue/src/data
python fetch-phonetics.py tem8_words.js 0 100
python fetch-phonetics.py tem8_words.js
```

### 方案 C：使用现有字典批量补充

```bash
cd frontend-vue/src/data
node update-phonetics.mjs
```

## 验证步骤

修复完成后，至少检查：

- TEM-4 是否已从旧式音标转成标准 IPA
- TEM-8 是否有明显的空音标残留
- COCA 是否至少覆盖到高频词

建议统计以下指标：

- 总词数
- 有音标词数
- 完整率

## 回滚方法

如果修复结果不理想，先从备份恢复：

```bash
cp tem4_words.js.backup tem4_words.js
cp tem8_words.js.backup tem8_words.js
cp coca_words.js.backup coca_words.js
```

## 相关文档

- [单词数据完整性检查报告](./单词数据完整性检查报告.md)
- [移动端Whisper录音功能](./移动端Whisper录音功能.md)
