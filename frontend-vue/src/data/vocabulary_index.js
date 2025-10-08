/**
 * 词汇数据索引文件
 * 统一管理所有词汇数据的导入和导出
 */

// 基础教育阶段词汇
import primarySchoolWords from './primary_school_words.js';
import middleSchoolWords from './middle_school_words.js';
import highSchoolWords from './high_school_words.js';

// 大学英语考试词汇
import cet4Words from './cet4_words.js';
import cet6Words from './cet6_words.js';

// 专业英语考试词汇
import tem4Words from './tem4_words.js';
import tem8Words from './tem8_words.js';

// 出国考试词汇
import toeflWords from './toefl_words.js';
import ieltsWords from './ielts_words.js';
import greWords from './gre_words.js';

// 研究生入学考试词汇
import postgraduateWords from './postgraduate_words.js';

// 语料库词汇
import cocaWords from './coca_words.js';

/**
 * 词汇数据集合
 * 按照学习阶段和考试类型分类
 */
export const vocabularyData = {
    // 基础教育阶段
    basicEducation: {
        primary: {
            name: '小学英语',
            level: 'primary',
            words: primarySchoolWords,
            count: primarySchoolWords.length,
            description: '小学英语大纲核心词汇'
        },
        middleSchool: {
            name: '中考英语',
            level: 'middle_school',
            words: middleSchoolWords,
            count: middleSchoolWords.length,
            description: '中考英语核心词汇，带音标和释义'
        },
        highSchool: {
            name: '高中英语',
            level: 'high_school',
            words: highSchoolWords,
            count: highSchoolWords.length,
            description: '高中英语核心词汇'
        }
    },
    
    // 大学英语考试
    collegeEnglish: {
        cet4: {
            name: '英语四级',
            level: 'cet4',
            words: cet4Words,
            count: cet4Words.length,
            description: '大学英语四级考试核心词汇'
        },
        cet6: {
            name: '英语六级',
            level: 'cet6',
            words: cet6Words,
            count: cet6Words.length,
            description: '大学英语六级考试核心词汇'
        }
    },
    
    // 专业英语考试
    professionalEnglish: {
        tem4: {
            name: '专业四级',
            level: 'tem4',
            words: tem4Words,
            count: tem4Words.length,
            description: '英语专业四级考试核心词汇'
        },
        tem8: {
            name: '专业八级',
            level: 'tem8',
            words: tem8Words,
            count: tem8Words.length,
            description: '英语专业八级考试核心词汇'
        }
    },
    
    // 出国考试
    studyAbroad: {
        toefl: {
            name: '托福',
            level: 'toefl',
            words: toeflWords,
            count: toeflWords.length,
            description: 'TOEFL考试核心词汇'
        },
        ielts: {
            name: '雅思',
            level: 'ielts',
            words: ieltsWords,
            count: ieltsWords.length,
            description: 'IELTS考试核心词汇'
        },
        gre: {
            name: 'GRE',
            level: 'gre',
            words: greWords,
            count: greWords.length,
            description: 'GRE考试核心词汇'
        }
    },
    
    // 研究生入学考试
    postgraduate: {
        name: '考研英语',
        level: 'postgraduate',
        words: postgraduateWords,
        count: postgraduateWords.length,
        description: '研究生入学考试英语核心词汇'
    },
    
    // 语料库词汇
    corpus: {
        coca: {
            name: 'COCA词汇',
            level: 'coca',
            words: cocaWords,
            count: cocaWords.length,
            description: '美国当代英语语料库高频词汇'
        }
    }
};

/**
 * 获取所有词汇数据的统计信息
 */
export function getVocabularyStats() {
    const stats = {
        totalCategories: 0,
        totalWords: 0,
        byCategory: {}
    };
    
    Object.entries(vocabularyData).forEach(([category, data]) => {
        if (data.words) {
            // 单个数据集
            stats.totalCategories++;
            stats.totalWords += data.count;
            stats.byCategory[category] = {
                name: data.name,
                count: data.count
            };
        } else {
            // 嵌套的数据集
            Object.entries(data).forEach(([subCategory, subData]) => {
                stats.totalCategories++;
                stats.totalWords += subData.count;
                stats.byCategory[`${category}.${subCategory}`] = {
                    name: subData.name,
                    count: subData.count
                };
            });
        }
    });
    
    return stats;
}

/**
 * 根据级别获取词汇数据
 */
export function getWordsByLevel(level) {
    for (const category of Object.values(vocabularyData)) {
        if (category.level === level) {
            return category.words;
        }
        
        for (const subCategory of Object.values(category)) {
            if (subCategory.level === level) {
                return subCategory.words;
            }
        }
    }
    
    return [];
}

/**
 * 搜索词汇
 */
export function searchWord(keyword, level = null) {
    const results = [];
    const searchTerm = keyword.toLowerCase();
    
    const searchInWords = (words, categoryLevel) => {
        if (level && categoryLevel !== level) return;
        
        words.forEach(wordData => {
            if (wordData.word.includes(searchTerm) || 
                (wordData.translation && wordData.translation.includes(keyword))) {
                results.push({
                    ...wordData,
                    category: categoryLevel
                });
            }
        });
    };
    
    Object.values(vocabularyData).forEach(category => {
        if (category.words) {
            searchInWords(category.words, category.level);
        } else {
            Object.values(category).forEach(subCategory => {
                if (subCategory.words) {
                    searchInWords(subCategory.words, subCategory.level);
                }
            });
        }
    });
    
    return results;
}

export default vocabularyData;
