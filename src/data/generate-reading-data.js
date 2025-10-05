/**
 * 批量生成阅读理解数据的执行脚本
 * 使用ReadingDataGenerator生成所有组合的数据
 */

const ReadingDataGenerator = require('./reading-data-generator.js');
const fs = require('fs');
const path = require('path');

class DataGenerationManager {
    constructor() {
        this.generator = new ReadingDataGenerator();
        this.outputDir = path.join(__dirname, 'generated');
        this.ensureOutputDirectory();
    }

    ensureOutputDirectory() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * 生成指定文章类型的所有组合数据
     */
    async generateArticleTypeData(articleType) {
        console.log(`\n开始生成 ${articleType} 类型的数据...`);
        
        const examTypes = ['cet4', 'cet6', 'toefl', 'ielts', 'tem4', 'tem8', 'postgraduate', 'gre'];
        const difficulties = ['easy', 'medium', 'hard'];
        const goals = ['comprehension', 'vocabulary', 'speed', 'analysis'];

        const articleTypeData = {};

        for (const examType of examTypes) {
            console.log(`  生成 ${examType} 考试类型...`);
            articleTypeData[examType] = {};

            for (const difficulty of difficulties) {
                console.log(`    生成 ${difficulty} 难度...`);
                articleTypeData[examType][difficulty] = {};

                for (const goal of goals) {
                    console.log(`      生成 ${goal} 练习目标...`);
                    
                    // 生成100篇文章
                    const articles = this.generator.generateArticles(
                        articleType, examType, difficulty, goal, 100
                    );
                    
                    articleTypeData[examType][difficulty][goal] = articles;
                    
                    console.log(`        ✓ 已生成 ${articles.length} 篇文章`);
                }
            }
        }

        // 保存到文件
        await this.saveArticleTypeData(articleType, articleTypeData);
        console.log(`✓ ${articleType} 类型数据生成完成！`);
        
        return articleTypeData;
    }

    /**
     * 保存文章类型数据到文件
     */
    async saveArticleTypeData(articleType, data) {
        const filename = `reading-comprehension-${articleType}-complete.js`;
        const filepath = path.join(this.outputDir, filename);

        const fileContent = `/**
 * ${articleType} 类型阅读理解完整数据
 * 自动生成的完整数据集，包含所有组合
 * 生成时间: ${new Date().toISOString()}
 */

const ${articleType}ReadingDataComplete = ${JSON.stringify(data, null, 4)};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ${articleType}ReadingDataComplete;
} else if (typeof window !== 'undefined') {
    window.${articleType}ReadingDataComplete = ${articleType}ReadingDataComplete;
}`;

        fs.writeFileSync(filepath, fileContent, 'utf8');
        console.log(`  数据已保存到: ${filepath}`);
    }

    /**
     * 生成所有文章类型的数据
     */
    async generateAllData() {
        const articleTypes = ['news', 'academic', 'science', 'story', 'biography', 'travel'];
        const startTime = Date.now();

        console.log('开始批量生成所有阅读理解数据...');
        console.log(`总计需要生成: 6 × 8 × 3 × 4 × 100 = 57,600 篇文章`);
        console.log('预计用时: 10-15分钟\n');

        const allData = {};

        for (const articleType of articleTypes) {
            try {
                allData[articleType] = await this.generateArticleTypeData(articleType);
            } catch (error) {
                console.error(`生成 ${articleType} 数据时出错:`, error);
            }
        }

        // 生成统计报告
        await this.generateStatisticsReport(allData);

        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);
        
        console.log('\n🎉 所有数据生成完成！');
        console.log(`总用时: ${duration} 秒`);
        console.log(`输出目录: ${this.outputDir}`);

        return allData;
    }

    /**
     * 生成统计报告
     */
    async generateStatisticsReport(allData) {
        const stats = {
            generationTime: new Date().toISOString(),
            totalArticles: 0,
            byArticleType: {},
            byExamType: {},
            byDifficulty: {},
            byGoal: {},
            combinations: 0
        };

        // 计算统计信息
        for (const [articleType, articleData] of Object.entries(allData)) {
            stats.byArticleType[articleType] = 0;

            for (const [examType, examData] of Object.entries(articleData)) {
                if (!stats.byExamType[examType]) stats.byExamType[examType] = 0;

                for (const [difficulty, difficultyData] of Object.entries(examData)) {
                    if (!stats.byDifficulty[difficulty]) stats.byDifficulty[difficulty] = 0;

                    for (const [goal, articles] of Object.entries(difficultyData)) {
                        if (!stats.byGoal[goal]) stats.byGoal[goal] = 0;

                        const count = articles.length;
                        stats.totalArticles += count;
                        stats.byArticleType[articleType] += count;
                        stats.byExamType[examType] += count;
                        stats.byDifficulty[difficulty] += count;
                        stats.byGoal[goal] += count;
                        stats.combinations++;
                    }
                }
            }
        }

        // 保存统计报告
        const reportPath = path.join(this.outputDir, 'generation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2), 'utf8');

        // 生成可读的统计报告
        const readableReport = `# 阅读理解数据生成报告

## 生成概况
- 生成时间: ${stats.generationTime}
- 总文章数: ${stats.totalArticles.toLocaleString()}
- 组合数量: ${stats.combinations}

## 按文章类型统计
${Object.entries(stats.byArticleType).map(([type, count]) => 
    `- ${type}: ${count.toLocaleString()} 篇`).join('\n')}

## 按考试类型统计
${Object.entries(stats.byExamType).map(([type, count]) => 
    `- ${type}: ${count.toLocaleString()} 篇`).join('\n')}

## 按难度等级统计
${Object.entries(stats.byDifficulty).map(([level, count]) => 
    `- ${level}: ${count.toLocaleString()} 篇`).join('\n')}

## 按练习目标统计
${Object.entries(stats.byGoal).map(([goal, count]) => 
    `- ${goal}: ${count.toLocaleString()} 篇`).join('\n')}

## 文件结构
\`\`\`
generated/
├── reading-comprehension-news-complete.js
├── reading-comprehension-academic-complete.js
├── reading-comprehension-science-complete.js
├── reading-comprehension-story-complete.js
├── reading-comprehension-biography-complete.js
├── reading-comprehension-travel-complete.js
├── generation-report.json
└── README.md
\`\`\`

## 使用方法
\`\`\`javascript
// 导入完整数据
const newsData = require('./generated/reading-comprehension-news-complete.js');
const academicData = require('./generated/reading-comprehension-academic-complete.js');

// 获取特定组合的文章
const cet4EasyComprehension = newsData.cet4.easy.comprehension;
console.log(\`CET-4简单理解练习文章数量: \${cet4EasyComprehension.length}\`);
\`\`\`
`;

        const readmePath = path.join(this.outputDir, 'README.md');
        fs.writeFileSync(readmePath, readableReport, 'utf8');

        console.log(`\n📊 统计报告已生成:`);
        console.log(`  - JSON报告: ${reportPath}`);
        console.log(`  - 可读报告: ${readmePath}`);
    }

    /**
     * 生成单个组合的数据（用于测试）
     */
    async generateSingleCombination(articleType, examType, difficulty, goal, count = 10) {
        console.log(`生成测试数据: ${articleType}-${examType}-${difficulty}-${goal}`);
        
        const articles = this.generator.generateArticles(articleType, examType, difficulty, goal, count);
        
        const testData = {
            [examType]: {
                [difficulty]: {
                    [goal]: articles
                }
            }
        };

        const filename = `test-${articleType}-${examType}-${difficulty}-${goal}.js`;
        const filepath = path.join(this.outputDir, filename);

        const fileContent = `/**
 * 测试数据: ${articleType}-${examType}-${difficulty}-${goal}
 * 生成时间: ${new Date().toISOString()}
 */

const testData = ${JSON.stringify(testData, null, 4)};

module.exports = testData;`;

        fs.writeFileSync(filepath, fileContent, 'utf8');
        console.log(`测试数据已保存到: ${filepath}`);
        
        return articles;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const manager = new DataGenerationManager();
    
    // 解析命令行参数
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // 生成所有数据
        manager.generateAllData().catch(console.error);
    } else if (args.length === 1) {
        // 生成指定文章类型的数据
        const articleType = args[0];
        manager.generateArticleTypeData(articleType).catch(console.error);
    } else if (args.length === 4) {
        // 生成单个组合的测试数据
        const [articleType, examType, difficulty, goal] = args;
        manager.generateSingleCombination(articleType, examType, difficulty, goal).catch(console.error);
    } else {
        console.log('用法:');
        console.log('  node generate-reading-data.js                    # 生成所有数据');
        console.log('  node generate-reading-data.js news               # 生成新闻类型数据');
        console.log('  node generate-reading-data.js news cet4 easy comprehension  # 生成测试数据');
    }
}

module.exports = DataGenerationManager;
