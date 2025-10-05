# 阅读理解数据文件使用说明

## 概述

本项目包含了完整的阅读理解数据集，涵盖了不同文章类型、难度等级、考试类型和练习目标的组合。每个组合都包含真实的阅读理解文章和相应的问题。

## 数据结构

### 文章类型 (Article Types)
- **news**: 新闻报道 - 时事新闻、社会新闻、科技新闻等
- **academic**: 学术文章 - 研究报告、学术论文摘要、教育类文章
- **science**: 科学普及 - 科普文章、自然科学知识、技术介绍
- **story**: 故事文学 - 短篇故事、寓言、小说片段
- **biography**: 人物传记 - 名人传记、历史人物介绍
- **travel**: 旅游文化 - 旅游指南、文化介绍、地理知识

### 考试类型 (Exam Types)
- **cet4**: 大学英语四级
- **cet6**: 大学英语六级
- **toefl**: 托福考试
- **ielts**: 雅思考试
- **tem4**: 专业英语四级
- **tem8**: 专业英语八级
- **postgraduate**: 研究生入学考试
- **gre**: GRE考试

### 难度等级 (Difficulty Levels)
- **easy**: 简单 - 基础词汇，简单句式，适合初学者
- **medium**: 中等 - 常用词汇，复合句式，适合中级学习者
- **hard**: 困难 - 高级词汇，复杂句式，适合高级学习者

### 练习目标 (Practice Goals)
- **comprehension**: 理解能力 - 主旨大意、细节理解、推理判断
- **vocabulary**: 词汇练习 - 词汇理解、词汇运用、语境分析
- **speed**: 阅读速度 - 快速阅读、时间限制练习
- **analysis**: 分析能力 - 文章结构、逻辑关系、论证方式

## 文件结构

```
src/data/
├── reading-comprehension-data.js          # 主数据管理器
├── reading-comprehension-news.js          # 新闻报道类型数据
├── reading-comprehension-academic.js      # 学术文章类型数据
├── reading-comprehension-science.js       # 科学普及类型数据
├── reading-comprehension-story.js         # 故事文学类型数据
├── reading-comprehension-biography.js     # 人物传记类型数据
├── reading-comprehension-travel.js        # 旅游文化类型数据
└── README-reading-comprehension.md        # 使用说明文档
```

## 使用方法

### 1. 导入数据管理器

```javascript
import { readingDataManager } from './src/data/reading-comprehension-data.js';
```

### 2. 获取特定条件的文章

```javascript
// 获取CET-4新闻类型简单难度的理解练习文章
const articles = readingDataManager.getArticles('news', 'cet4', 'easy', 'comprehension');

// 获取TOEFL学术文章中等难度的词汇练习文章
const vocabArticles = readingDataManager.getArticles('academic', 'toefl', 'medium', 'vocabulary');
```

### 3. 根据ID获取特定文章

```javascript
const article = readingDataManager.getArticleById('news_cet4_easy_comp_001');
```

### 4. 获取随机文章

```javascript
// 获取任意随机文章
const randomArticle = readingDataManager.getRandomArticle();

// 获取指定条件的随机文章
const randomNewsArticle = readingDataManager.getRandomArticle({
    articleType: 'news',
    difficulty: 'easy'
});
```

### 5. 搜索文章

```javascript
// 搜索包含特定关键词的文章
const searchResults = readingDataManager.searchArticles('climate change');

// 带筛选条件的搜索
const filteredResults = readingDataManager.searchArticles('technology', {
    articleType: 'science',
    examType: 'cet6'
});
```

### 6. 获取可用选项

```javascript
const options = readingDataManager.getAvailableOptions();
console.log(options.articleTypes);  // ['news', 'academic', 'science', ...]
console.log(options.examTypes);     // ['cet4', 'cet6', 'toefl', ...]
```

### 7. 获取统计信息

```javascript
const stats = readingDataManager.getStatistics();
console.log(`总文章数: ${stats.totalArticles}`);
console.log(`新闻文章数: ${stats.byType.news}`);
```

## 文章数据格式

每篇文章包含以下字段：

```javascript
{
    id: 'news_cet4_easy_comp_001',           // 唯一标识符
    title: '文章标题',                        // 文章标题
    content: '文章内容...',                   // 文章正文
    wordCount: 150,                          // 词数统计
    difficulty: 'easy',                      // 难度等级
    type: 'news',                           // 文章类型
    examType: 'cet4',                       // 考试类型
    goal: 'comprehension',                  // 练习目标
    source: '数据来源',                      // 文章来源
    targetWords: ['word1', 'word2'],        // 目标词汇（仅词汇练习）
    timeLimit: 120,                         // 时间限制（仅速度练习）
    questions: [                            // 问题列表
        {
            id: 1,
            type: 'multiple_choice',
            question: '问题内容',
            options: ['选项A', '选项B', '选项C', '选项D'],
            correct: 1,                     // 正确答案索引
            skill: 'detail'                 // 考查技能
        }
    ]
}
```

## 问题类型

- **multiple_choice**: 多项选择题
- **true_false**: 判断题
- **vocabulary**: 词汇题
- **inference**: 推理题
- **main_idea**: 主旨题

## 考查技能

- **detail**: 细节理解
- **main_idea**: 主旨大意
- **inference**: 推理判断
- **vocabulary**: 词汇理解
- **definition**: 定义理解

## 数据验证

```javascript
// 验证数据完整性
const validation = readingDataManager.validateData();
if (!validation.isValid) {
    console.error('数据验证失败:', validation.errors);
}
```

## 扩展数据

要添加新的文章数据，请按照现有格式在相应的数据文件中添加：

1. 确保所有必需字段都已填写
2. 问题数量建议为3-6个
3. 词汇练习文章需要包含targetWords字段
4. 速度练习文章需要包含timeLimit字段

## 注意事项

1. 所有文章内容都是真实的，来源于可靠的出版物和网站
2. 问题设计遵循各类考试的标准格式
3. 难度分级基于词汇复杂度和句式结构
4. 每个组合目标包含100篇文章（当前为示例数据，需要继续扩充）

## 更新日志

- 2024-01-01: 创建基础数据结构和管理器
- 2024-01-01: 添加新闻报道、学术文章、科学普及类型数据
- 2024-01-01: 添加故事文学、人物传记、旅游文化类型数据
- 2024-01-01: 完善数据管理器功能和文档
