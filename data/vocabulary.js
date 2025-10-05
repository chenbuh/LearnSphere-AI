/**
 * 词汇数据库
 */
const vocabularyData = {
    // 基础词汇
    basic: [
        {
            id: 1,
            word: "hello",
            phonetic: "/həˈləʊ/",
            meaning: "你好",
            partOfSpeech: "interjection",
            examples: [
                "Hello, how are you?",
                "She said hello to everyone."
            ],
            difficulty: 1,
            frequency: 1000,
            tags: ["greeting", "common"]
        },
        {
            id: 2,
            word: "book",
            phonetic: "/bʊk/",
            meaning: "书",
            partOfSpeech: "noun",
            examples: [
                "I'm reading a good book.",
                "The book is on the table."
            ],
            difficulty: 1,
            frequency: 950,
            tags: ["object", "education"]
        },
        {
            id: 3,
            word: "happy",
            phonetic: "/ˈhæpi/",
            meaning: "快乐的",
            partOfSpeech: "adjective",
            examples: [
                "I am very happy today.",
                "She looks happy."
            ],
            difficulty: 1,
            frequency: 900,
            tags: ["emotion", "positive"]
        }
    ],

    // 中级词汇
    intermediate: [
        {
            id: 101,
            word: "knowledge",
            phonetic: "/ˈnɒlɪdʒ/",
            meaning: "知识",
            partOfSpeech: "noun",
            examples: [
                "Knowledge is power.",
                "He has extensive knowledge of history."
            ],
            difficulty: 3,
            frequency: 700,
            tags: ["abstract", "education"]
        },
        {
            id: 102,
            word: "environment",
            phonetic: "/ɪnˈvaɪrənmənt/",
            meaning: "环境",
            partOfSpeech: "noun",
            examples: [
                "We need to protect the environment.",
                "The work environment is very friendly."
            ],
            difficulty: 3,
            frequency: 650,
            tags: ["nature", "science"]
        }
    ],

    // 高级词汇
    advanced: [
        {
            id: 201,
            word: "sophisticated",
            phonetic: "/səˈfɪstɪkeɪtɪd/",
            meaning: "复杂的，精密的",
            partOfSpeech: "adjective",
            examples: [
                "This is a sophisticated system.",
                "She has sophisticated taste in art."
            ],
            difficulty: 5,
            frequency: 400,
            tags: ["complex", "formal"]
        },
        {
            id: 202,
            word: "ubiquitous",
            phonetic: "/juːˈbɪkwɪtəs/",
            meaning: "无处不在的",
            partOfSpeech: "adjective",
            examples: [
                "Smartphones are ubiquitous in modern society.",
                "The ubiquitous presence of technology."
            ],
            difficulty: 5,
            frequency: 200,
            tags: ["formal", "academic"]
        }
    ],

    // 考试词汇
    exam: {
        cet4: [
            {
                id: 301,
                word: "abandon",
                phonetic: "/əˈbændən/",
                meaning: "放弃，抛弃",
                partOfSpeech: "verb",
                examples: [
                    "Don't abandon your dreams.",
                    "The ship was abandoned."
                ],
                difficulty: 3,
                frequency: 600,
                tags: ["cet4", "verb"]
            }
        ],
        cet6: [
            {
                id: 401,
                word: "abbreviate",
                phonetic: "/əˈbriːvieɪt/",
                meaning: "缩写，缩短",
                partOfSpeech: "verb",
                examples: [
                    "You can abbreviate the word.",
                    "The name is often abbreviated."
                ],
                difficulty: 4,
                frequency: 300,
                tags: ["cet6", "verb"]
            }
        ],
        ielts: [
            {
                id: 501,
                word: "accommodate",
                phonetic: "/əˈkɒmədeɪt/",
                meaning: "容纳，适应",
                partOfSpeech: "verb",
                examples: [
                    "The hotel can accommodate 200 guests.",
                    "We need to accommodate different needs."
                ],
                difficulty: 4,
                frequency: 450,
                tags: ["ielts", "formal"]
            }
        ]
    },

    // 主题词汇
    themes: {
        business: [
            {
                id: 601,
                word: "profit",
                phonetic: "/ˈprɒfɪt/",
                meaning: "利润",
                partOfSpeech: "noun",
                examples: [
                    "The company made a huge profit.",
                    "Profit margins are increasing."
                ],
                difficulty: 2,
                frequency: 700,
                tags: ["business", "money"]
            }
        ],
        technology: [
            {
                id: 701,
                word: "algorithm",
                phonetic: "/ˈælɡərɪðəm/",
                meaning: "算法",
                partOfSpeech: "noun",
                examples: [
                    "The search algorithm is very efficient.",
                    "Machine learning algorithms are complex."
                ],
                difficulty: 4,
                frequency: 350,
                tags: ["technology", "computer"]
            }
        ]
    }
};

// 词汇统计
const vocabularyStats = {
    total: 0,
    byLevel: {
        basic: 0,
        intermediate: 0,
        advanced: 0
    },
    byExam: {
        cet4: 0,
        cet6: 0,
        ielts: 0,
        toefl: 0
    }
};

// 计算统计信息
function calculateStats() {
    vocabularyStats.byLevel.basic = vocabularyData.basic.length;
    vocabularyStats.byLevel.intermediate = vocabularyData.intermediate.length;
    vocabularyStats.byLevel.advanced = vocabularyData.advanced.length;
    
    vocabularyStats.byExam.cet4 = vocabularyData.exam.cet4.length;
    vocabularyStats.byExam.cet6 = vocabularyData.exam.cet6.length;
    vocabularyStats.byExam.ielts = vocabularyData.exam.ielts.length;
    
    vocabularyStats.total = vocabularyStats.byLevel.basic + 
                           vocabularyStats.byLevel.intermediate + 
                           vocabularyStats.byLevel.advanced +
                           vocabularyStats.byExam.cet4 +
                           vocabularyStats.byExam.cet6 +
                           vocabularyStats.byExam.ielts;
}

// 词汇搜索功能
function searchVocabulary(query, options = {}) {
    const { level, exam, theme, difficulty } = options;
    let results = [];
    
    // 搜索所有词汇
    const allWords = [
        ...vocabularyData.basic,
        ...vocabularyData.intermediate,
        ...vocabularyData.advanced,
        ...(vocabularyData.exam.cet4 || []),
        ...(vocabularyData.exam.cet6 || []),
        ...(vocabularyData.exam.ielts || [])
    ];
    
    results = allWords.filter(word => {
        const matchesQuery = !query || 
            word.word.toLowerCase().includes(query.toLowerCase()) ||
            word.meaning.includes(query);
            
        const matchesLevel = !level || word.tags.includes(level);
        const matchesExam = !exam || word.tags.includes(exam);
        const matchesDifficulty = !difficulty || word.difficulty === difficulty;
        
        return matchesQuery && matchesLevel && matchesExam && matchesDifficulty;
    });
    
    return results;
}

// 获取随机词汇
function getRandomWords(count = 10, options = {}) {
    const searchResults = searchVocabulary('', options);
    const shuffled = searchResults.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 初始化统计
calculateStats();

// 导出数据和函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        vocabularyData,
        vocabularyStats,
        searchVocabulary,
        getRandomWords,
        calculateStats
    };
} else {
    // 浏览器环境
    window.vocabularyData = vocabularyData;
    window.vocabularyStats = vocabularyStats;
    window.searchVocabulary = searchVocabulary;
    window.getRandomWords = getRandomWords;
    window.calculateStats = calculateStats;
}
