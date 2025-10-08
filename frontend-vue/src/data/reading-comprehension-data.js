/**
 * 阅读理解数据管理器
 * 整合所有类型的阅读理解文章数据
 * 提供统一的数据访问接口
 */

// 导入各类型数据
import { newsReadingData } from './reading-comprehension-news.js';
import { academicReadingData } from './reading-comprehension-academic.js';
import { scienceReadingData } from './reading-comprehension-science.js';
import { storyReadingData } from './reading-comprehension-story.js';
import { biographyReadingData } from './reading-comprehension-biography.js';
import { travelReadingData } from './reading-comprehension-travel.js';

/**
 * 阅读理解数据结构说明：
 * 
 * 文章类型 (Article Types):
 * - news: 新闻报道
 * - academic: 学术文章  
 * - science: 科学普及
 * - story: 故事文学
 * - biography: 人物传记
 * - travel: 旅游文化
 * 
 * 考试类型 (Exam Types):
 * - cet4: 大学英语四级
 * - cet6: 大学英语六级
 * - toefl: 托福考试
 * - ielts: 雅思考试
 * - tem4: 专业英语四级
 * - tem8: 专业英语八级
 * - postgraduate: 研究生入学考试
 * - gre: GRE考试
 * 
 * 难度等级 (Difficulty Levels):
 * - easy: 简单 (基础词汇，简单句式)
 * - medium: 中等 (常用词汇，复合句式)
 * - hard: 困难 (高级词汇，复杂句式)
 * 
 * 练习目标 (Practice Goals):
 * - comprehension: 理解能力 (主旨大意，细节理解，推理判断)
 * - vocabulary: 词汇练习 (词汇理解，词汇运用)
 * - speed: 阅读速度 (快速阅读，时间限制)
 * - analysis: 分析能力 (文章结构，逻辑关系)
 */

class ReadingComprehensionDataManager {
    constructor() {
        this.data = {
            news: newsReadingData || {},
            academic: academicReadingData || {},
            science: scienceReadingData || {},
            story: storyReadingData || {},
            biography: biographyReadingData || {},
            travel: travelReadingData || {}
        };
        
        this.statistics = this.calculateStatistics();
    }

    /**
     * 获取指定条件的文章列表
     * @param {string} articleType - 文章类型
     * @param {string} examType - 考试类型
     * @param {string} difficulty - 难度等级
     * @param {string} goal - 练习目标
     * @returns {Array} 文章列表
     */
    getArticles(articleType, examType, difficulty, goal) {
        try {
            const typeData = this.data[articleType];
            if (!typeData) {
                console.warn(`文章类型 "${articleType}" 不存在`);
                return [];
            }

            const examData = typeData[examType];
            if (!examData) {
                console.warn(`考试类型 "${examType}" 在 "${articleType}" 中不存在`);
                return [];
            }

            const difficultyData = examData[difficulty];
            if (!difficultyData) {
                console.warn(`难度等级 "${difficulty}" 在 "${articleType}-${examType}" 中不存在`);
                return [];
            }

            const goalData = difficultyData[goal];
            if (!goalData) {
                console.warn(`练习目标 "${goal}" 在 "${articleType}-${examType}-${difficulty}" 中不存在`);
                return [];
            }

            return goalData;
        } catch (error) {
            console.error('获取文章数据时出错:', error);
            return [];
        }
    }

    /**
     * 根据ID获取特定文章
     * @param {string} articleId - 文章ID
     * @returns {Object|null} 文章对象
     */
    getArticleById(articleId) {
        for (const articleType in this.data) {
            for (const examType in this.data[articleType]) {
                for (const difficulty in this.data[articleType][examType]) {
                    for (const goal in this.data[articleType][examType][difficulty]) {
                        const articles = this.data[articleType][examType][difficulty][goal];
                        const article = articles.find(a => a.id === articleId);
                        if (article) {
                            return article;
                        }
                    }
                }
            }
        }
        return null;
    }

    /**
     * 获取随机文章
     * @param {Object} filters - 筛选条件
     * @returns {Object|null} 随机文章
     */
    getRandomArticle(filters = {}) {
        const {
            articleType = null,
            examType = null,
            difficulty = null,
            goal = null
        } = filters;

        let availableArticles = [];

        for (const type in this.data) {
            if (articleType && type !== articleType) continue;
            
            for (const exam in this.data[type]) {
                if (examType && exam !== examType) continue;
                
                for (const diff in this.data[type][exam]) {
                    if (difficulty && diff !== difficulty) continue;
                    
                    for (const g in this.data[type][exam][diff]) {
                        if (goal && g !== goal) continue;
                        
                        availableArticles.push(...this.data[type][exam][diff][g]);
                    }
                }
            }
        }

        if (availableArticles.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * availableArticles.length);
        return availableArticles[randomIndex];
    }

    /**
     * 获取可用的选项列表
     * @returns {Object} 包含所有可用选项的对象
     */
    getAvailableOptions() {
        const options = {
            articleTypes: [],
            examTypes: new Set(),
            difficulties: new Set(),
            goals: new Set()
        };

        for (const articleType in this.data) {
            if (Object.keys(this.data[articleType]).length > 0) {
                options.articleTypes.push(articleType);
            }

            for (const examType in this.data[articleType]) {
                options.examTypes.add(examType);

                for (const difficulty in this.data[articleType][examType]) {
                    options.difficulties.add(difficulty);

                    for (const goal in this.data[articleType][examType][difficulty]) {
                        options.goals.add(goal);
                    }
                }
            }
        }

        return {
            articleTypes: options.articleTypes,
            examTypes: Array.from(options.examTypes),
            difficulties: Array.from(options.difficulties),
            goals: Array.from(options.goals)
        };
    }

    /**
     * 计算数据统计信息
     * @returns {Object} 统计信息
     */
    calculateStatistics() {
        const stats = {
            totalArticles: 0,
            byType: {},
            byExam: {},
            byDifficulty: {},
            byGoal: {}
        };

        for (const articleType in this.data) {
            stats.byType[articleType] = 0;

            for (const examType in this.data[articleType]) {
                if (!stats.byExam[examType]) stats.byExam[examType] = 0;

                for (const difficulty in this.data[articleType][examType]) {
                    if (!stats.byDifficulty[difficulty]) stats.byDifficulty[difficulty] = 0;

                    for (const goal in this.data[articleType][examType][difficulty]) {
                        if (!stats.byGoal[goal]) stats.byGoal[goal] = 0;

                        const count = this.data[articleType][examType][difficulty][goal].length;
                        stats.totalArticles += count;
                        stats.byType[articleType] += count;
                        stats.byExam[examType] += count;
                        stats.byDifficulty[difficulty] += count;
                        stats.byGoal[goal] += count;
                    }
                }
            }
        }

        return stats;
    }

    /**
     * 搜索文章
     * @param {string} keyword - 搜索关键词
     * @param {Object} filters - 筛选条件
     * @returns {Array} 搜索结果
     */
    searchArticles(keyword, filters = {}) {
        const results = [];
        const lowerKeyword = keyword.toLowerCase();

        for (const articleType in this.data) {
            if (filters.articleType && articleType !== filters.articleType) continue;

            for (const examType in this.data[articleType]) {
                if (filters.examType && examType !== filters.examType) continue;

                for (const difficulty in this.data[articleType][examType]) {
                    if (filters.difficulty && difficulty !== filters.difficulty) continue;

                    for (const goal in this.data[articleType][examType][difficulty]) {
                        if (filters.goal && goal !== filters.goal) continue;

                        const articles = this.data[articleType][examType][difficulty][goal];
                        articles.forEach(article => {
                            if (
                                article.title.toLowerCase().includes(lowerKeyword) ||
                                article.content.toLowerCase().includes(lowerKeyword)
                            ) {
                                results.push({
                                    ...article,
                                    metadata: {
                                        articleType,
                                        examType,
                                        difficulty,
                                        goal
                                    }
                                });
                            }
                        });
                    }
                }
            }
        }

        return results;
    }

    /**
     * 获取统计信息
     * @returns {Object} 统计信息
     */
    getStatistics() {
        return this.statistics;
    }

    /**
     * 验证文章数据完整性
     * @returns {Object} 验证结果
     */
    validateData() {
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };

        const requiredFields = ['id', 'title', 'content', 'wordCount', 'difficulty', 'type', 'examType', 'goal', 'questions'];

        for (const articleType in this.data) {
            for (const examType in this.data[articleType]) {
                for (const difficulty in this.data[articleType][examType]) {
                    for (const goal in this.data[articleType][examType][difficulty]) {
                        const articles = this.data[articleType][examType][difficulty][goal];
                        
                        articles.forEach((article, index) => {
                            // 检查必需字段
                            requiredFields.forEach(field => {
                                if (!article[field]) {
                                    validation.errors.push(
                                        `${articleType}-${examType}-${difficulty}-${goal}[${index}]: 缺少字段 "${field}"`
                                    );
                                    validation.isValid = false;
                                }
                            });

                            // 检查问题数量
                            if (article.questions && article.questions.length === 0) {
                                validation.warnings.push(
                                    `${articleType}-${examType}-${difficulty}-${goal}[${index}]: 没有问题`
                                );
                            }
                        });
                    }
                }
            }
        }

        return validation;
    }
}

// 创建全局实例
const readingDataManager = new ReadingComprehensionDataManager();

// 导出
export { ReadingComprehensionDataManager, readingDataManager };

// 兼容性导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ReadingComprehensionDataManager, readingDataManager };
} else if (typeof window !== 'undefined') {
    window.ReadingComprehensionDataManager = ReadingComprehensionDataManager;
    window.readingDataManager = readingDataManager;
}
