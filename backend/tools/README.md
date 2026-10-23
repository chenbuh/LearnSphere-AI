# 词汇例句补全工具

用**有道词典**的权威例句（中英成对）补全 `vocabulary` 表的 `example` / `example_translation`。

## 为什么用它

之前词库存在三类问题：

1. **35,590 行有例句但没有中文翻译**，前端只能逐词去外网翻译，每页 12 个词 → 12 个 8 秒超时请求。
2. **同词跨词书不一致**：`wake` 在 cet4 是 "I wake up at 7 every morning."（有译文），
   在 cet6 是 "Wake up early."（却配着 "我每天早上7点醒来。"，张冠李戴）。
3. **完全没例句**：34,394 行。

## 数据来源

有道词典 `https://dict.youdao.com/jsonapi?q=<word>` 的 `blng_sents_part`
（柯林斯 / 权威例句，每条都同时带 `sentence-eng` 和 `sentence-translation`）。

**同一来源**是关键：英文和中文出自同一条词典记录，不存在机翻或模板拼接，
也不会出现"句子和译文对不上"。

## 质量红线（脚本内置）

入库前逐条校验，以下任一不满足即丢弃：

| 检查 | 说明 |
|---|---|
| 必须真正用到该词 | `match_score >= 2`，即原词或常见词形（`-s/-ed/-ing/-ly`）出现在句中 |
| 长度 20–140 字符 | 太短无语境（"I'm sixteen."），太长是论文摘句 |
| 首字母大写 + 句末标点 | 排除被截断的片段 |
| 英文句中不得含中文 | 有道偶尔塞入 `(笨拙的)` 这类注释 |
| 不得含 HTML 标签 | 有道用 `<b>word</b>` 高亮，需清洗 |
| 至少 5 个单词 | 排除短语碎片 |
| 中文译文必须含汉字 | 防止拿到空串或纯英文 |

> ⚠️ 历史教训：早期版本允许 `match_score >= 1`（仅词根相关），
> 结果 `bastard` 配到了 "Cooper was a good mixer"、`co-author` 配到了
> "James flicked a peanut at her."——共 103 行错配。现已被红线拦住。

## 用法

```bash
cd backend/tools
set MYSQL_PWD=<数据库口令>

# 只补空的
python backfill_examples.py --mode fill --all

# 全部用有道例句覆盖（统一风格，修掉错配）
python backfill_examples.py --mode refresh --all

# 只修"同词存在多组不同例句"的
python backfill_examples.py --mode fix --all

# 先看效果不写库
python backfill_examples.py --mode refresh --limit 50 --dry-run
```

* 按**单词**处理：同一个 word 在 12 个 `exam_type` 下的所有行写成同一句例句。
* 支持断点续跑：处理过的词记在 `backfill_done.txt`，重跑自动跳过。
* 有道国内直连即可（约 0.15s/词）；如需代理，设 `BACKFILL_PROXY=http://127.0.0.1:7890`。

依赖：`pip install pymysql`。

## 当前结果

| 指标 | 数值 |
|---|---|
| 总行数 | 70,206 |
| 例句 + 译文完整 | 70,206（**100.00%**） |
| 无例句 | **0** |
| 有例句缺译文 | **0** |
| 例句与单词不匹配 | 0 |
| 英文例句含中文 / 含 HTML 标签 | **0 / 0** |
| 同词跨词书不一致 | 0 |

### 有道未收录的词：手工编写

有 133 个单词在有道词条下没有任何中英成对的例句（缩写 `a.m.`、`mr.`、
连字符专有名词 `likert-type`、拼错词条 `inser`、以及 `communist`、`prisoner`、
`skin`、`democracy` 等）。这些词由 `manual_examples.py` 手工编写例句，
经 `apply_manual.py` 校验后入库：

```bash
cd backend/tools
python apply_manual.py --dry-run   # 只校验
python apply_manual.py             # 校验并写库
```

编写原则（脚本强制校验）：

1. 例句必须真正包含该单词（按词边界匹配，容忍 `-s/-ed/-ing` 等词形变化；
   连字符词允许空格写法）。
2. 译文必须含汉字。
3. 英文例句不得含中文，需有句末标点，至少 4 个单词。
4. 敏感词用中性、词典式表述，不渲染细节。

校验不通过的条目**不会写库**，脚本会列出原因，便于修正后重跑。

### 已知瑕疵

* 2 条例句偏短（`Fucking hell!`、`I am Taiwanese.`），是有道原句，保留原貌。
* 29 条例句偏长（160~180 字符），是该词条下唯一可用的候选，保留比留空好。

## 脏数据清洗

`clean_dirty.py` 处理词库本身的历史脏数据：

```bash
python clean_dirty.py --dry-run
python clean_dirty.py
```

处理三类：

1. **单词字段混入词性** —— `really v` → `really`
2. **释义里残留 HTML 标签** —— `<b>阿以</b>` → `阿以`
3. **释义为空** —— 用同词其他词书的释义回填

> ⚠️ 清洗**必须保留**词典的语域标记：`<口>`（口语）、`<古>`（古语）、`<俚>`（俚语）、
> `<废语>`、`<罕>`、`<非正式>`、`<篮>`（领域）等。这些是词典学上的正常标注，
> 不是 HTML 标签。正则只匹配 `<b> <i> <span> <div> <p> <br> <font> <a> <td>` 等真实标签。

另有 6 个词的释义是从别的词条误抓的（`eight-year`、`four-day`、`six-week`、
`spanish-speaking`、`three-year`、`two-hour`，内容含 `»` 和韩文乱码），
以及 4 个词的释义为空（`backache`、`beancurd`、`bedclothes`、`birdcage`），
已按词义手工修正。

## 最终数据状态

| 指标 | 数值 |
|---|---|
| 总行数 | 70,206 |
| 例句 + 译文完整 | 70,206（**100.00%**） |
| 释义非空 | 70,206（**100.00%**） |
| 例句与单词不匹配 | 0 |
| 英文例句含中文 | 0 |
| 译文不含中文 | 0 |
| 释义残留 HTML 标签 | 0 |
| 单词字段混入词性 | 0 |
| 同词跨词书多版本 | 0 |


## 相关前端改动

词库补齐后，前端不再需要在浏览/详情时请求外网：

* `frontend-vue/src/utils/dictionaryApi.js`：`ENABLE_REMOTE_FALLBACK = false`，
  `fetchExampleFromApi` 直接返回 `null`，`translateExampleToChinese` 直接返回 `''`。
* `frontend-vue/src/composables/useVocabularyPractice.js`：删除逐词翻译调用，
  缺译文时用本地模板兜底，页面即时渲染。
* `frontend-vue/src/utils/request.js`：超时/网络错误分支补上 `silent` 判断，
  避免一页十几个后台请求连续弹 toast。
