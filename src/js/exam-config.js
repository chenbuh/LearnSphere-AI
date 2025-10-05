/**
 * 考试类型配置管理器
 * 支持多种国内外英语考试
 */

class ExamConfig {
    constructor() {
        this.examTypes = this.initializeExamTypes();
        this.currentExam = null;
    }

    /**
     * 初始化考试类型配置
     */
    initializeExamTypes() {
        return {
            // 国内考试
            'cet4': {
                id: 'cet4',
                name: '大学英语四级',
                shortName: 'CET-4',
                category: 'domestic',
                icon: '🎓',
                description: '全国大学英语四级考试',
                targetScore: 425,
                maxScore: 710,
                duration: 130, // 分钟
                sections: {
                    listening: { name: '听力理解', weight: 0.35, duration: 30 },
                    reading: { name: '阅读理解', weight: 0.35, duration: 40 },
                    writing: { name: '写作', weight: 0.15, duration: 30 },
                    translation: { name: '翻译', weight: 0.15, duration: 30 }
                },
                vocabulary: {
                    total: 4500,
                    core: 2500,
                    difficulty: 'intermediate'
                },
                grammar: {
                    topics: ['时态语态', '从句', '非谓语动词', '虚拟语气', '倒装句'],
                    difficulty: 'intermediate'
                }
            },
            'cet6': {
                id: 'cet6',
                name: '大学英语六级',
                shortName: 'CET-6',
                category: 'domestic',
                icon: '🎓',
                description: '全国大学英语六级考试',
                targetScore: 425,
                maxScore: 710,
                duration: 130,
                sections: {
                    listening: { name: '听力理解', weight: 0.35, duration: 30 },
                    reading: { name: '阅读理解', weight: 0.35, duration: 40 },
                    writing: { name: '写作', weight: 0.15, duration: 30 },
                    translation: { name: '翻译', weight: 0.15, duration: 30 }
                },
                vocabulary: {
                    total: 6000,
                    core: 3000,
                    difficulty: 'upper-intermediate'
                },
                grammar: {
                    topics: ['高级时态', '复杂从句', '高级语法结构', '修辞手法'],
                    difficulty: 'upper-intermediate'
                }
            },
            'postgraduate': {
                id: 'postgraduate',
                name: '考研英语',
                shortName: '考研英语',
                category: 'domestic',
                icon: '📚',
                description: '全国硕士研究生入学统一考试英语',
                targetScore: 60,
                maxScore: 100,
                duration: 180,
                sections: {
                    reading: { name: '阅读理解', weight: 0.4, duration: 70 },
                    knowledge: { name: '英语知识运用', weight: 0.1, duration: 20 },
                    writing: { name: '写作', weight: 0.3, duration: 60 },
                    translation: { name: '翻译', weight: 0.2, duration: 30 }
                },
                vocabulary: {
                    total: 5500,
                    core: 3000,
                    difficulty: 'advanced'
                },
                grammar: {
                    topics: ['学术语法', '复杂句式', '语言逻辑', '修辞分析'],
                    difficulty: 'advanced'
                }
            },
            'tem4': {
                id: 'tem4',
                name: '专业英语四级',
                shortName: 'TEM-4',
                category: 'domestic',
                icon: '🎯',
                description: '英语专业四级考试',
                targetScore: 60,
                maxScore: 100,
                duration: 130,
                sections: {
                    listening: { name: '听力理解', weight: 0.2, duration: 25 },
                    reading: { name: '阅读理解', weight: 0.2, duration: 25 },
                    language: { name: '语言知识', weight: 0.2, duration: 25 },
                    writing: { name: '写作', weight: 0.2, duration: 45 },
                    dictation: { name: '听写', weight: 0.2, duration: 10 }
                },
                vocabulary: {
                    total: 7500,
                    core: 3800,
                    difficulty: 'advanced'
                }
            },
            'tem8': {
                id: 'tem8',
                name: '专业英语八级',
                shortName: 'TEM-8',
                category: 'domestic',
                icon: '🎯',
                description: '英语专业八级考试',
                targetScore: 60,
                maxScore: 100,
                duration: 195,
                sections: {
                    listening: { name: '听力理解', weight: 0.15, duration: 25 },
                    reading: { name: '阅读理解', weight: 0.3, duration: 45 },
                    language: { name: '人文知识', weight: 0.1, duration: 10 },
                    translation: { name: '汉译英', weight: 0.2, duration: 60 },
                    writing: { name: '写作', weight: 0.25, duration: 45 }
                },
                vocabulary: {
                    total: 13000,
                    core: 6500,
                    difficulty: 'expert'
                },
                grammar: {
                    topics: ['高级语法', '文体学', '语言学', '英美文学', '翻译理论'],
                    difficulty: 'expert'
                }
            },
            // 国际考试
            'ielts': {
                id: 'ielts',
                name: '雅思考试',
                shortName: 'IELTS',
                category: 'international',
                icon: '🌍',
                description: '国际英语语言测试系统',
                targetScore: 6.5,
                maxScore: 9.0,
                duration: 165,
                sections: {
                    listening: { name: 'Listening', weight: 0.25, duration: 40 },
                    reading: { name: 'Reading', weight: 0.25, duration: 60 },
                    writing: { name: 'Writing', weight: 0.25, duration: 60 },
                    speaking: { name: 'Speaking', weight: 0.25, duration: 15 }
                },
                vocabulary: {
                    total: 7500,
                    core: 3800,
                    difficulty: 'advanced',
                    topics: ['academic', 'general', 'professional']
                },
                grammar: {
                    topics: ['复杂句式', '学术写作', '口语表达', '语言准确性'],
                    difficulty: 'advanced'
                }
            },
            'toefl': {
                id: 'toefl',
                name: '托福考试',
                shortName: 'TOEFL',
                category: 'international',
                icon: '🌍',
                description: '英语作为外语的考试',
                targetScore: 90,
                maxScore: 120,
                duration: 240,
                sections: {
                    reading: { name: 'Reading', weight: 0.25, duration: 60 },
                    listening: { name: 'Listening', weight: 0.25, duration: 60 },
                    speaking: { name: 'Speaking', weight: 0.25, duration: 20 },
                    writing: { name: 'Writing', weight: 0.25, duration: 50 }
                },
                vocabulary: {
                    total: 9000,
                    core: 4500,
                    difficulty: 'advanced',
                    topics: ['academic', 'campus', 'professional']
                },
                grammar: {
                    topics: ['学术英语', '复合句', '高级语法', '语言流畅性'],
                    difficulty: 'advanced'
                }
            },
            'gre': {
                id: 'gre',
                name: 'GRE考试',
                shortName: 'GRE',
                category: 'international',
                icon: '🎓',
                description: '研究生入学考试',
                targetScore: 320,
                maxScore: 340,
                duration: 225,
                sections: {
                    verbal: { name: 'Verbal Reasoning', weight: 0.5, duration: 90 },
                    quantitative: { name: 'Quantitative Reasoning', weight: 0.5, duration: 90 },
                    writing: { name: 'Analytical Writing', weight: 0, duration: 60 }
                },
                vocabulary: {
                    total: 16000,
                    core: 8000,
                    difficulty: 'expert',
                    topics: ['academic', 'scholarly', 'advanced']
                }
            }
        };
    }

    /**
     * 获取考试配置
     */
    getExamConfig(examId) {
        return this.examTypes[examId] || null;
    }

    /**
     * 获取所有考试类型
     */
    getAllExamTypes() {
        return this.examTypes;
    }

    /**
     * 按类别获取考试类型
     */
    getExamsByCategory(category) {
        return Object.values(this.examTypes).filter(exam => exam.category === category);
    }

    /**
     * 设置当前考试类型
     */
    setCurrentExam(examId) {
        const exam = this.getExamConfig(examId);
        if (exam) {
            this.currentExam = exam;
            // 保存到本地存储
            localStorage.setItem('currentExam', examId);
            return true;
        }
        return false;
    }

    /**
     * 获取当前考试类型
     */
    getCurrentExam() {
        if (!this.currentExam) {
            const savedExamId = localStorage.getItem('currentExam');
            if (savedExamId) {
                this.currentExam = this.getExamConfig(savedExamId);
            }
        }
        return this.currentExam;
    }

    /**
     * 获取考试难度级别
     */
    getDifficultyLevel(examId) {
        const exam = this.getExamConfig(examId);
        return exam ? exam.vocabulary.difficulty : 'intermediate';
    }

    /**
     * 获取词汇量要求
     */
    getVocabularyRequirement(examId) {
        const exam = this.getExamConfig(examId);
        return exam ? exam.vocabulary : { total: 4000, core: 2000, difficulty: 'intermediate' };
    }

    /**
     * 获取考试时间分配
     */
    getTimeAllocation(examId) {
        const exam = this.getExamConfig(examId);
        return exam ? exam.sections : {};
    }

    /**
     * 计算学习计划
     */
    generateStudyPlan(examId, currentLevel = 'beginner', targetDate = null) {
        const exam = this.getExamConfig(examId);
        if (!exam) return null;

        const plan = {
            examType: exam,
            currentLevel,
            targetDate,
            phases: [],
            estimatedDuration: 0
        };

        // 基础阶段
        plan.phases.push({
            name: '基础阶段',
            duration: 30, // 天
            goals: ['掌握基础词汇', '熟悉考试题型', '建立学习习惯'],
            focus: ['vocabulary', 'grammar', 'basic_skills']
        });

        // 强化阶段
        plan.phases.push({
            name: '强化阶段',
            duration: 45,
            goals: ['提高解题技巧', '扩展词汇量', '强化弱项'],
            focus: ['skills_training', 'weakness_improvement', 'mock_tests']
        });

        // 冲刺阶段
        plan.phases.push({
            name: '冲刺阶段',
            duration: 15,
            goals: ['模拟考试', '查漏补缺', '心理调适'],
            focus: ['mock_exams', 'final_review', 'exam_strategy']
        });

        plan.estimatedDuration = plan.phases.reduce((total, phase) => total + phase.duration, 0);

        return plan;
    }

    /**
     * 获取推荐学习资源
     */
    getRecommendedResources(examId) {
        const exam = this.getExamConfig(examId);
        if (!exam) return [];

        const resources = {
            'cet4': [
                { type: 'book', name: '新东方四级词汇', priority: 'high' },
                { type: 'app', name: '扇贝单词', priority: 'high' },
                { type: 'website', name: '沪江英语', priority: 'medium' }
            ],
            'ielts': [
                { type: 'book', name: '剑桥雅思真题', priority: 'high' },
                { type: 'online', name: 'IELTS官方练习', priority: 'high' },
                { type: 'course', name: '雅思写作课程', priority: 'medium' }
            ],
            'toefl': [
                { type: 'software', name: 'ETS官方软件', priority: 'high' },
                { type: 'book', name: 'TOEFL词汇精选', priority: 'high' },
                { type: 'practice', name: 'TPO练习', priority: 'high' }
            ]
        };

        return resources[examId] || [];
    }
}

// 创建全局实例
const examConfig = new ExamConfig();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExamConfig;
} else {
    window.ExamConfig = ExamConfig;
    window.examConfig = examConfig;
}

console.log('📋 考试配置管理器已加载');
