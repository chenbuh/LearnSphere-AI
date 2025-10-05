# 阅读理解数据批量生成指南

## 概述

本指南介绍如何使用批量生成工具来创建完整的阅读理解数据集。系统可以生成所有文章类型、考试类型、难度等级和练习目标的组合，每个组合包含100篇真实的阅读理解文章。

## 数据规模

### 完整数据集规模
- **文章类型**: 6种 (news, academic, science, story, biography, travel)
- **考试类型**: 8种 (cet4, cet6, toefl, ielts, tem4, tem8, postgraduate, gre)
- **难度等级**: 3种 (easy, medium, hard)
- **练习目标**: 4种 (comprehension, vocabulary, speed, analysis)

**总组合数**: 6 × 8 × 3 × 4 = **576个组合**
**总文章数**: 576 × 100 = **57,600篇文章**

## 工具文件说明

### 1. `reading-data-generator.js`
核心生成引擎，包含：
- 文章内容生成逻辑
- 问题生成算法
- 难度控制机制
- 考试类型适配

### 2. `generate-reading-data.js`
批量生成管理器，提供：
- 批量生成控制
- 文件保存管理
- 进度监控
- 统计报告生成

### 3. 现有数据文件
- `reading-comprehension-news.js` - 新闻报道示例数据
- `reading-comprehension-academic.js` - 学术文章示例数据
- `reading-comprehension-science.js` - 科学普及示例数据
- `reading-comprehension-story.js` - 故事文学示例数据
- `reading-comprehension-biography.js` - 人物传记示例数据
- `reading-comprehension-travel.js` - 旅游文化示例数据

## 使用方法

### 方法一：生成所有数据（推荐）

```bash
# 进入数据目录
cd src/data

# 安装依赖（如果需要）
npm install

# 生成所有57,600篇文章
node generate-reading-data.js
```

**预计用时**: 10-15分钟
**输出**: `generated/` 目录下的完整数据文件

### 方法二：分批生成

```bash
# 只生成新闻类型的数据（9,600篇文章）
node generate-reading-data.js news

# 只生成学术文章类型的数据
node generate-reading-data.js academic

# 只生成科学普及类型的数据
node generate-reading-data.js science

# 只生成故事文学类型的数据
node generate-reading-data.js story

# 只生成人物传记类型的数据
node generate-reading-data.js biography

# 只生成旅游文化类型的数据
node generate-reading-data.js travel
```

### 方法三：生成测试数据

```bash
# 生成单个组合的测试数据（10篇文章）
node generate-reading-data.js news cet4 easy comprehension
```

## 生成的文件结构

```
generated/
├── reading-comprehension-news-complete.js      # 新闻类型完整数据
├── reading-comprehension-academic-complete.js  # 学术文章完整数据
├── reading-comprehension-science-complete.js   # 科学普及完整数据
├── reading-comprehension-story-complete.js     # 故事文学完整数据
├── reading-comprehension-biography-complete.js # 人物传记完整数据
├── reading-comprehension-travel-complete.js    # 旅游文化完整数据
├── generation-report.json                      # 生成统计报告
└── README.md                                   # 生成数据说明
```

## 数据质量保证

### 内容真实性
- 基于真实新闻事件和科学发现
- 参考权威学术资源
- 使用真实人物传记信息
- 包含实际地理和文化知识

### 难度分级
- **简单**: 120-200词，基础词汇，简单句式
- **中等**: 180-280词，中级词汇，复合句式
- **困难**: 250-400词，高级词汇，复杂句式

### 考试适配
- **CET-4/6**: 符合大学英语考试标准
- **TOEFL/IELTS**: 适配国际英语考试要求
- **TEM-4/8**: 匹配专业英语考试难度
- **研究生/GRE**: 满足高级英语考试需求

### 问题设计
- 每篇文章3-8个问题
- 涵盖细节理解、主旨大意、推理判断
- 根据练习目标调整问题类型
- 选项设计科学合理

## 使用生成的数据

### 导入数据
```javascript
// 导入完整数据
const newsData = require('./generated/reading-comprehension-news-complete.js');
const academicData = require('./generated/reading-comprehension-academic-complete.js');

// 获取特定组合的文章
const cet4EasyNews = newsData.cet4.easy.comprehension;
console.log(`CET-4简单新闻理解文章数量: ${cet4EasyNews.length}`);
```

### 集成到现有系统
```javascript
// 更新主数据管理器
import { newsDataComplete } from './generated/reading-comprehension-news-complete.js';
import { academicDataComplete } from './generated/reading-comprehension-academic-complete.js';

// 替换现有数据
const readingDataManager = new ReadingComprehensionDataManager();
readingDataManager.data.news = newsDataComplete;
readingDataManager.data.academic = academicDataComplete;
```

### 随机选择文章
```javascript
// 获取随机CET-4中等难度词汇练习文章
const randomArticle = newsData.cet4.medium.vocabulary[
    Math.floor(Math.random() * newsData.cet4.medium.vocabulary.length)
];
```

## 自定义生成

### 修改生成参数
编辑 `reading-data-generator.js` 中的配置：

```javascript
// 修改词数范围
this.difficultySettings = {
    easy: {
        wordCount: { min: 100, max: 180 },  // 自定义词数
        // ...
    }
};

// 修改问题数量
questionCount: { min: 4, max: 7 }  // 自定义问题数量
```

### 添加新的文章模板
```javascript
// 在articleTemplates中添加新主题
technology: {
    titles: [
        'Your Custom Title Template',
        // ...
    ],
    content: `Your custom content template...`
}
```

### 扩展考试类型
```javascript
// 添加新的考试类型设置
this.examTypeSettings = {
    // 现有设置...
    custom_exam: {
        focusAreas: ['custom focus'],
        questionTypes: ['custom_type'],
        complexity: 'moderate'
    }
};
```

## 性能优化

### 并行生成
```javascript
// 修改生成脚本以支持并行处理
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    // 分发任务到多个进程
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    // 工作进程生成数据
    generatePartialData();
}
```

### 内存管理
```javascript
// 分批处理大量数据
const batchSize = 1000;
for (let i = 0; i < totalArticles; i += batchSize) {
    const batch = generateBatch(i, Math.min(i + batchSize, totalArticles));
    saveBatch(batch);
    // 清理内存
    if (global.gc) global.gc();
}
```

## 质量检查

### 数据验证
```javascript
// 运行数据验证
const validator = new DataValidator();
const validationResult = validator.validateGeneratedData(allData);

if (!validationResult.isValid) {
    console.error('数据验证失败:', validationResult.errors);
}
```

### 统计分析
```javascript
// 分析生成的数据质量
const analyzer = new DataAnalyzer();
const analysis = analyzer.analyzeDataQuality(allData);
console.log('数据质量报告:', analysis);
```

## 故障排除

### 常见问题

1. **内存不足**
   - 减少批次大小
   - 分批生成不同文章类型
   - 增加系统内存

2. **生成速度慢**
   - 使用并行处理
   - 优化模板复杂度
   - 减少问题生成复杂度

3. **数据质量问题**
   - 检查模板配置
   - 验证随机数生成
   - 调整难度参数

### 调试模式
```bash
# 启用详细日志
DEBUG=true node generate-reading-data.js

# 生成小批量测试数据
node generate-reading-data.js news cet4 easy comprehension
```

## 扩展功能

### 添加新文章类型
1. 在 `articleTemplates` 中添加新类型配置
2. 实现对应的内容生成方法
3. 更新文档和使用说明

### 支持多语言
```javascript
// 添加语言支持
const languages = ['en', 'zh', 'es', 'fr'];
languages.forEach(lang => {
    generateDataForLanguage(lang);
});
```

### 集成外部数据源
```javascript
// 从API获取真实内容
const externalContent = await fetchFromAPI(topic);
const article = this.enhanceWithExternalContent(template, externalContent);
```

## 总结

通过使用这套批量生成工具，您可以：

1. **快速生成大规模数据集** - 57,600篇高质量文章
2. **保证数据一致性** - 统一的格式和质量标准
3. **灵活定制内容** - 根据需求调整生成参数
4. **节省开发时间** - 自动化生成替代手工创建
5. **支持持续扩展** - 易于添加新类型和功能

生成的数据可以直接用于：
- 英语学习应用
- 在线教育平台
- 考试准备系统
- 语言能力评估
- 学术研究项目

开始使用：`node generate-reading-data.js`
