/**
 * 词汇数据库抽象层
 * 
 * 性能优化说明：
 * 之前该文件直接导入了数兆字节的 JS 词汇文件，导致前端打包体积过大且加载缓慢。
 * 现已将其优化为完全采用后端 API 动态按需加载模式。
 * 
 * 安全优化说明：
 * 所有通过 API 返回的词汇数据均经过 XOR 加密，防止爬虫抓取。
 */

export class VocabularyDatabase {
    constructor() {
        this.vocabularyData = this.initializeVocabularyData();
        console.log(`📚 词汇数据库已切换至异步 API 模式`);
    }

    /**
     * 初始化词汇数据（仅保留基础骨架或内存缓冲）
     */
    initializeVocabularyData() {
        return {
            basic: this.generateBasicVocabulary(),
            // 其他类型均通过 API 获取，本地不再存储静态副本
            cet4: [],
            cet6: [],
            tem4: [],
            tem8: [],
            ielts: [],
            toefl: [],
            gre: [],
            postgraduate: []
        };
    }

    /**
     * 生成极简基础词汇 (仅作为离线兜底或演示使用)
     * 生产环境建议通过 API 获取
     */
    generateBasicVocabulary() {
        return [
            { id: 10001, word: "about", meaning: "关于", phonetic: "/əˈbaʊt/", difficulty: 1, category: "pre" },
            { id: 10002, word: "above", meaning: "在...之上", phonetic: "/əˈbʌv/", difficulty: 1, category: "pre" },
            { id: 10003, word: "across", meaning: "穿过", phonetic: "/əˈkrɒs/", difficulty: 1, category: "pre" },
            { id: 10004, word: "action", meaning: "行动", phonetic: "/ˈækʃən/", difficulty: 1, category: "noun" },
            { id: 10005, word: "activity", meaning: "活动", phonetic: "/ækˈtɪvɪti/", difficulty: 1, category: "noun" }
        ];
    }

    /**
     * 加载真实词汇数据 - 已过时 (Deprecated)
     * 请使用 VocabularyStore 中的 fetchRecommended 或 API 调用
     */
    loadRealVocabularyData(examType) {
        console.warn(`[Performance] 静态词汇加载已停用 (${examType})。请确保后端数据已导入并使用 API。`);
        return null;
    }

    /**
     * 获取总词汇数量 (内存中)
     */
    getTotalWordCount() {
        return this.vocabularyData.basic.length;
    }

    /**
     * 根据考试类型获取词汇 (Legacy Support)
     */
    getVocabularyByExam(examType) {
        if (examType === 'basic') {
            return this.vocabularyData.basic;
        }
        return [];
    }

    /**
     * 搜索词汇 (仅搜索内存中的基础词汇)
     */
    searchVocabulary(query) {
        return this.vocabularyData.basic.filter(word =>
            word.word.toLowerCase().includes(query.toLowerCase())
        );
    }
}

export const vocabularyDatabase = new VocabularyDatabase();
