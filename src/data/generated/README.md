# 阅读理解数据生成报告

## 生成概况
- 生成时间: 2025-10-02T11:22:51.235Z
- 总文章数: 0
- 组合数量: 0

## 按文章类型统计


## 按考试类型统计


## 按难度等级统计


## 按练习目标统计


## 文件结构
```
generated/
├── reading-comprehension-news-complete.js
├── reading-comprehension-academic-complete.js
├── reading-comprehension-science-complete.js
├── reading-comprehension-story-complete.js
├── reading-comprehension-biography-complete.js
├── reading-comprehension-travel-complete.js
├── generation-report.json
└── README.md
```

## 使用方法
```javascript
// 导入完整数据
const newsData = require('./generated/reading-comprehension-news-complete.js');
const academicData = require('./generated/reading-comprehension-academic-complete.js');

// 获取特定组合的文章
const cet4EasyComprehension = newsData.cet4.easy.comprehension;
console.log(`CET-4简单理解练习文章数量: ${cet4EasyComprehension.length}`);
```
