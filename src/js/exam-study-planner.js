/**
 * 考试学习计划管理器
 * 为不同考试类型提供专门的学习进度和计划
 */

class ExamStudyPlanner {
    constructor() {
        this.studyPlans = {};
        this.currentPlan = null;
        this.progressTracking = {};
        this.init();
    }

    async init() {
        console.log('📋 初始化考试学习计划管理器...');
        
        try {
            // 初始化考试学习计划
            this.initializeStudyPlans();
            
            // 加载用户进度
            await this.loadUserProgress();
            
            console.log('✅ 考试学习计划管理器初始化完成');
        } catch (error) {
            console.error('考试学习计划管理器初始化失败:', error);
        }
    }

    /**
     * 初始化各考试类型的学习计划
     */
    initializeStudyPlans() {
        this.studyPlans = {
            // CET-4 学习计划
            cet4: {
                name: '大学英语四级',
                duration: 90, // 天
                targetScore: 425,
                maxScore: 710,
                phases: [
                    {
                        name: '基础阶段',
                        duration: 30,
                        goals: ['掌握核心词汇2500个', '熟悉基础语法', '建立学习习惯'],
                        milestones: [
                            { day: 10, target: '词汇量达到800个', type: 'vocabulary', value: 800 },
                            { day: 20, target: '语法准确率达到70%', type: 'grammar', value: 70 },
                            { day: 30, target: '词汇量达到1500个', type: 'vocabulary', value: 1500 }
                        ]
                    },
                    {
                        name: '强化阶段',
                        duration: 45,
                        goals: ['扩展词汇至4000个', '提高听读技能', '模拟练习'],
                        milestones: [
                            { day: 45, target: '词汇量达到2500个', type: 'vocabulary', value: 2500 },
                            { day: 60, target: '听力准确率达到75%', type: 'listening', value: 75 },
                            { day: 75, target: '阅读速度达到150wpm', type: 'reading', value: 150 }
                        ]
                    },
                    {
                        name: '冲刺阶段',
                        duration: 15,
                        goals: ['完成真题练习', '查漏补缺', '应试技巧'],
                        milestones: [
                            { day: 85, target: '模拟考试达到400分', type: 'mock_test', value: 400 },
                            { day: 90, target: '目标分数425分', type: 'target', value: 425 }
                        ]
                    }
                ],
                dailyTargets: {
                    vocabulary: 30, // 每日新学单词数
                    review: 50,     // 每日复习单词数
                    listening: 20,  // 每日听力练习分钟
                    reading: 30,    // 每日阅读练习分钟
                    grammar: 15,    // 每日语法练习分钟
                    writing: 20     // 每日写作练习分钟
                },
                weights: {
                    listening: 0.35,
                    reading: 0.35,
                    writing: 0.15,
                    translation: 0.15
                }
            },

            // CET-6 学习计划
            cet6: {
                name: '大学英语六级',
                duration: 120,
                targetScore: 425,
                maxScore: 710,
                phases: [
                    {
                        name: '基础巩固阶段',
                        duration: 40,
                        goals: ['巩固四级基础', '扩展高级词汇', '提升语法水平'],
                        milestones: [
                            { day: 15, target: '六级词汇掌握1000个', type: 'vocabulary', value: 1000 },
                            { day: 25, target: '语法准确率达到80%', type: 'grammar', value: 80 },
                            { day: 40, target: '六级词汇掌握2000个', type: 'vocabulary', value: 2000 }
                        ]
                    },
                    {
                        name: '技能提升阶段',
                        duration: 60,
                        goals: ['深度阅读理解', '高级听力训练', '写作能力提升'],
                        milestones: [
                            { day: 70, target: '阅读理解准确率85%', type: 'reading', value: 85 },
                            { day: 85, target: '听力理解准确率80%', type: 'listening', value: 80 },
                            { day: 100, target: '写作平均分15分', type: 'writing', value: 15 }
                        ]
                    },
                    {
                        name: '考前冲刺阶段',
                        duration: 20,
                        goals: ['真题强化训练', '弱项突破', '心理调适'],
                        milestones: [
                            { day: 115, target: '模拟考试达到450分', type: 'mock_test', value: 450 },
                            { day: 120, target: '目标分数500分', type: 'target', value: 500 }
                        ]
                    }
                ],
                dailyTargets: {
                    vocabulary: 35,
                    review: 60,
                    listening: 25,
                    reading: 40,
                    grammar: 20,
                    writing: 25
                },
                weights: {
                    listening: 0.35,
                    reading: 0.35,
                    writing: 0.15,
                    translation: 0.15
                }
            },

            // 雅思学习计划
            ielts: {
                name: '雅思考试',
                duration: 150,
                targetScore: 6.5,
                maxScore: 9.0,
                phases: [
                    {
                        name: '基础能力建设',
                        duration: 50,
                        goals: ['建立英语思维', '掌握基础技能', '了解考试形式'],
                        milestones: [
                            { day: 20, target: '雅思词汇掌握2000个', type: 'vocabulary', value: 2000 },
                            { day: 35, target: '听力理解日常对话', type: 'listening', value: 60 },
                            { day: 50, target: '阅读速度200wpm', type: 'reading', value: 200 }
                        ]
                    },
                    {
                        name: '技能专项训练',
                        duration: 70,
                        goals: ['听说读写分项提升', '学术英语能力', '应试技巧掌握'],
                        milestones: [
                            { day: 80, target: '听力分数6.0', type: 'listening', value: 6.0 },
                            { day: 100, target: '阅读分数6.5', type: 'reading', value: 6.5 },
                            { day: 120, target: '写作分数6.0', type: 'writing', value: 6.0 }
                        ]
                    },
                    {
                        name: '综合能力提升',
                        duration: 30,
                        goals: ['模拟考试训练', '弱项强化', '考试策略优化'],
                        milestones: [
                            { day: 140, target: '模拟考试6.5分', type: 'mock_test', value: 6.5 },
                            { day: 150, target: '目标分数7.0分', type: 'target', value: 7.0 }
                        ]
                    }
                ],
                dailyTargets: {
                    vocabulary: 40,
                    review: 70,
                    listening: 30,
                    reading: 45,
                    writing: 30,
                    speaking: 20
                },
                weights: {
                    listening: 0.25,
                    reading: 0.25,
                    writing: 0.25,
                    speaking: 0.25
                }
            },

            // 托福学习计划
            toefl: {
                name: '托福考试',
                duration: 120,
                targetScore: 90,
                maxScore: 120,
                phases: [
                    {
                        name: '学术英语基础',
                        duration: 40,
                        goals: ['学术词汇积累', '学术听力适应', '学术阅读理解'],
                        milestones: [
                            { day: 15, target: '托福词汇掌握1500个', type: 'vocabulary', value: 1500 },
                            { day: 25, target: '学术听力理解60%', type: 'listening', value: 60 },
                            { day: 40, target: '学术阅读理解70%', type: 'reading', value: 70 }
                        ]
                    },
                    {
                        name: '综合技能训练',
                        duration: 60,
                        goals: ['综合写作训练', '口语表达提升', '考试技巧掌握'],
                        milestones: [
                            { day: 70, target: '阅读分数22分', type: 'reading', value: 22 },
                            { day: 85, target: '听力分数20分', type: 'listening', value: 20 },
                            { day: 100, target: '口语分数19分', type: 'speaking', value: 19 }
                        ]
                    },
                    {
                        name: '高分冲刺',
                        duration: 20,
                        goals: ['真题模拟', '时间管理', '心理准备'],
                        milestones: [
                            { day: 115, target: '模拟考试85分', type: 'mock_test', value: 85 },
                            { day: 120, target: '目标分数100分', type: 'target', value: 100 }
                        ]
                    }
                ],
                dailyTargets: {
                    vocabulary: 45,
                    review: 80,
                    listening: 35,
                    reading: 50,
                    writing: 35,
                    speaking: 25
                },
                weights: {
                    reading: 0.25,
                    listening: 0.25,
                    speaking: 0.25,
                    writing: 0.25
                }
            },

            // 考研英语学习计划
            postgraduate: {
                name: '考研英语',
                duration: 200,
                targetScore: 70,
                maxScore: 100,
                phases: [
                    {
                        name: '词汇语法基础',
                        duration: 80,
                        goals: ['掌握考研核心词汇', '语法体系构建', '长难句分析'],
                        milestones: [
                            { day: 30, target: '考研词汇掌握2000个', type: 'vocabulary', value: 2000 },
                            { day: 50, target: '语法准确率85%', type: 'grammar', value: 85 },
                            { day: 80, target: '考研词汇掌握4000个', type: 'vocabulary', value: 4000 }
                        ]
                    },
                    {
                        name: '阅读写作强化',
                        duration: 80,
                        goals: ['阅读理解技巧', '写作模板掌握', '翻译技能训练'],
                        milestones: [
                            { day: 120, target: '阅读理解准确率80%', type: 'reading', value: 80 },
                            { day: 140, target: '大作文平均18分', type: 'writing', value: 18 },
                            { day: 160, target: '翻译准确率75%', type: 'translation', value: 75 }
                        ]
                    },
                    {
                        name: '真题冲刺',
                        duration: 40,
                        goals: ['历年真题训练', '答题策略优化', '考前调整'],
                        milestones: [
                            { day: 190, target: '模拟考试65分', type: 'mock_test', value: 65 },
                            { day: 200, target: '目标分数75分', type: 'target', value: 75 }
                        ]
                    }
                ],
                dailyTargets: {
                    vocabulary: 50,
                    review: 100,
                    reading: 60,
                    writing: 40,
                    translation: 30,
                    grammar: 25
                },
                weights: {
                    reading: 0.4,
                    knowledge: 0.1,
                    writing: 0.3,
                    translation: 0.2
                }
            },

            // GRE学习计划
            gre: {
                name: 'GRE考试',
                duration: 180,
                targetScore: 320,
                maxScore: 340,
                phases: [
                    {
                        name: '词汇量突破',
                        duration: 60,
                        goals: ['掌握GRE核心词汇', '词汇记忆技巧', '词根词缀学习'],
                        milestones: [
                            { day: 20, target: 'GRE词汇掌握2000个', type: 'vocabulary', value: 2000 },
                            { day: 40, target: 'GRE词汇掌握4000个', type: 'vocabulary', value: 4000 },
                            { day: 60, target: 'GRE词汇掌握6000个', type: 'vocabulary', value: 6000 }
                        ]
                    },
                    {
                        name: 'Verbal推理训练',
                        duration: 80,
                        goals: ['阅读理解提升', '逻辑推理训练', '文本完成技巧'],
                        milestones: [
                            { day: 100, target: 'Verbal正确率70%', type: 'verbal', value: 70 },
                            { day: 120, target: 'Verbal正确率80%', type: 'verbal', value: 80 },
                            { day: 140, target: 'Verbal分数155', type: 'verbal', value: 155 }
                        ]
                    },
                    {
                        name: '模考冲刺',
                        duration: 40,
                        goals: ['全真模拟考试', '时间管理训练', '心理素质提升'],
                        milestones: [
                            { day: 170, target: '模拟考试315分', type: 'mock_test', value: 315 },
                            { day: 180, target: '目标分数330分', type: 'target', value: 330 }
                        ]
                    }
                ],
                dailyTargets: {
                    vocabulary: 80,
                    review: 150,
                    verbal: 45,
                    reading: 60,
                    writing: 30,
                    quantitative: 30
                },
                weights: {
                    verbal: 0.5,
                    quantitative: 0.5
                }
            }
        };
    }

    /**
     * 设置当前学习计划
     */
    setCurrentPlan(examType) {
        if (this.studyPlans[examType]) {
            this.currentPlan = examType;
            console.log(`📋 已设置学习计划: ${this.studyPlans[examType].name}`);
            return true;
        }
        return false;
    }

    /**
     * 获取当前学习计划
     */
    getCurrentPlan() {
        return this.currentPlan ? this.studyPlans[this.currentPlan] : null;
    }

    /**
     * 获取学习进度
     */
    getStudyProgress(examType = null) {
        const planType = examType || this.currentPlan;
        if (!planType || !this.studyPlans[planType]) {
            return null;
        }

        const plan = this.studyPlans[planType];
        const progress = this.progressTracking[planType] || {};
        
        // 计算当前阶段
        const studyDays = progress.studyDays || 0;
        let currentPhase = 0;
        let phaseProgress = 0;
        let daysSoFar = 0;

        for (let i = 0; i < plan.phases.length; i++) {
            if (studyDays <= daysSoFar + plan.phases[i].duration) {
                currentPhase = i;
                phaseProgress = ((studyDays - daysSoFar) / plan.phases[i].duration) * 100;
                break;
            }
            daysSoFar += plan.phases[i].duration;
        }

        // 计算总体进度
        const totalProgress = (studyDays / plan.duration) * 100;

        // 计算各技能进度
        const skillProgress = this.calculateSkillProgress(planType, progress);

        // 获取下一个里程碑
        const nextMilestone = this.getNextMilestone(planType, studyDays);

        return {
            examType: planType,
            examName: plan.name,
            totalProgress: Math.min(100, Math.round(totalProgress)),
            studyDays,
            totalDays: plan.duration,
            currentPhase,
            phaseProgress: Math.round(phaseProgress),
            phaseName: plan.phases[currentPhase]?.name,
            skillProgress,
            nextMilestone,
            targetScore: plan.targetScore,
            maxScore: plan.maxScore,
            dailyTargets: plan.dailyTargets
        };
    }

    /**
     * 计算技能进度
     */
    calculateSkillProgress(examType, progress) {
        const plan = this.studyPlans[examType];
        const skillProgress = {};

        Object.keys(plan.weights).forEach(skill => {
            const skillData = progress[skill] || { completed: 0, total: 100 };
            skillProgress[skill] = {
                progress: Math.round((skillData.completed / skillData.total) * 100),
                weight: plan.weights[skill],
                completed: skillData.completed,
                total: skillData.total
            };
        });

        return skillProgress;
    }

    /**
     * 获取下一个里程碑
     */
    getNextMilestone(examType, currentDay) {
        const plan = this.studyPlans[examType];
        
        for (const phase of plan.phases) {
            for (const milestone of phase.milestones) {
                if (milestone.day > currentDay) {
                    return {
                        ...milestone,
                        daysLeft: milestone.day - currentDay
                    };
                }
            }
        }
        
        return null;
    }

    /**
     * 更新学习进度
     */
    async updateProgress(examType, progressData) {
        if (!this.progressTracking[examType]) {
            this.progressTracking[examType] = {
                studyDays: 0,
                startDate: Date.now(),
                lastStudyDate: null
            };
        }

        const progress = this.progressTracking[examType];
        
        // 更新进度数据
        Object.assign(progress, progressData);
        
        // 更新学习天数
        const today = new Date().toDateString();
        if (progress.lastStudyDate !== today) {
            progress.studyDays += 1;
            progress.lastStudyDate = today;
        }

        // 保存进度
        await this.saveUserProgress();

        console.log(`📈 ${examType} 学习进度已更新`);
    }

    /**
     * 加载用户进度
     */
    async loadUserProgress() {
        try {
            const savedProgress = await Storage.get('exam_study_progress', {});
            this.progressTracking = savedProgress || {};
            
            // 确保 progressTracking 是一个对象
            if (typeof this.progressTracking !== 'object' || this.progressTracking === null) {
                console.warn('⚠️ 进度数据格式错误，重置为空对象');
                this.progressTracking = {};
            }
            
            // 确保 studyPlans 已初始化
            if (!this.studyPlans || Object.keys(this.studyPlans).length === 0) {
                console.warn('⚠️ studyPlans 未初始化，重新初始化...');
                this.initializeStudyPlans();
            }
            
            // 确保每个考试类型都有默认的进度结构
            Object.keys(this.studyPlans).forEach(examType => {
                if (!this.progressTracking[examType]) {
                    this.progressTracking[examType] = {
                        studyDays: 0,
                        completedLessons: {},
                        scores: {},
                        milestones: [],
                        startDate: null,
                        lastStudyDate: null,
                        totalStudyTime: 0,
                        vocabularyProgress: {
                            learned: 0,
                            mastered: 0,
                            reviewing: 0
                        },
                        skillProgress: {
                            listening: 0,
                            reading: 0,
                            writing: 0,
                            grammar: 0
                        }
                    };
                }
            });
            
            console.log('📊 考试学习进度已加载');
        } catch (error) {
            console.error('加载学习进度失败:', error);
            // 如果加载失败，确保有默认结构
            this.progressTracking = {};
            Object.keys(this.studyPlans).forEach(examType => {
                this.progressTracking[examType] = {
                    studyDays: 0,
                    completedLessons: {},
                    scores: {},
                    milestones: [],
                    startDate: null,
                    lastStudyDate: null,
                    totalStudyTime: 0,
                    vocabularyProgress: {
                        learned: 0,
                        mastered: 0,
                        reviewing: 0
                    },
                    skillProgress: {
                        listening: 0,
                        reading: 0,
                        writing: 0,
                        grammar: 0
                    }
                };
            });
        }
    }

    /**
     * 保存用户进度
     */
    async saveUserProgress() {
        try {
            await Storage.set('exam_study_progress', this.progressTracking);
            console.log('💾 考试学习进度已保存');
        } catch (error) {
            console.error('保存学习进度失败:', error);
        }
    }

    /**
     * 生成学习建议
     */
    generateStudyRecommendations(examType = null) {
        const planType = examType || this.currentPlan;
        if (!planType) return [];

        const progress = this.getStudyProgress(planType);
        if (!progress) return [];

        const recommendations = [];
        const plan = this.studyPlans[planType];

        // 基于当前阶段的建议
        const currentPhase = plan.phases[progress.currentPhase];
        if (currentPhase) {
            recommendations.push({
                type: 'phase',
                priority: 'high',
                title: `当前阶段: ${currentPhase.name}`,
                message: `重点关注: ${currentPhase.goals.join('、')}`,
                action: '查看详细计划'
            });
        }

        // 基于里程碑的建议
        if (progress.nextMilestone) {
            recommendations.push({
                type: 'milestone',
                priority: 'medium',
                title: `下个目标: ${progress.nextMilestone.target}`,
                message: `还有 ${progress.nextMilestone.daysLeft} 天`,
                action: '加强练习'
            });
        }

        // 基于技能进度的建议
        Object.entries(progress.skillProgress).forEach(([skill, data]) => {
            if (data.progress < 50) {
                recommendations.push({
                    type: 'skill',
                    priority: 'medium',
                    title: `${skill} 需要加强`,
                    message: `当前进度 ${data.progress}%，建议增加练习时间`,
                    action: `练习 ${skill}`
                });
            }
        });

        return recommendations;
    }

    /**
     * 获取每日学习任务
     */
    getDailyTasks(examType = null) {
        const planType = examType || this.currentPlan;
        if (!planType || !this.studyPlans[planType]) {
            return [];
        }

        const plan = this.studyPlans[planType];
        const targets = plan.dailyTargets;
        const today = new Date().toDateString();
        
        // 检查今日任务完成情况
        const todayProgress = this.progressTracking[planType]?.dailyProgress?.[today] || {};

        const tasks = [];

        Object.entries(targets).forEach(([skill, target]) => {
            const completed = todayProgress[skill] || 0;
            const unit = this.getSkillUnit(skill);
            
            tasks.push({
                skill,
                target,
                completed,
                unit,
                progress: Math.round((completed / target) * 100),
                isCompleted: completed >= target
            });
        });

        return tasks;
    }

    /**
     * 获取技能单位
     */
    getSkillUnit(skill) {
        const units = {
            vocabulary: '个单词',
            review: '个单词',
            listening: '分钟',
            reading: '分钟',
            writing: '分钟',
            speaking: '分钟',
            grammar: '分钟',
            translation: '分钟',
            verbal: '分钟',
            quantitative: '分钟'
        };
        return units[skill] || '个';
    }

    /**
     * 记录每日任务完成
     */
    async recordDailyTask(examType, skill, amount) {
        const today = new Date().toDateString();
        
        if (!this.progressTracking[examType]) {
            this.progressTracking[examType] = {};
        }

        if (!this.progressTracking[examType].dailyProgress) {
            this.progressTracking[examType].dailyProgress = {};
        }

        if (!this.progressTracking[examType].dailyProgress[today]) {
            this.progressTracking[examType].dailyProgress[today] = {};
        }

        const dailyProgress = this.progressTracking[examType].dailyProgress[today];
        dailyProgress[skill] = (dailyProgress[skill] || 0) + amount;

        await this.saveUserProgress();
        console.log(`✅ 记录每日任务: ${skill} +${amount}`);
    }

    /**
     * 重置学习进度
     */
    async resetProgress() {
        try {
            console.log('🔄 重置考试学习进度...');
            
            // 重置内存中的进度数据
            this.progressTracking = {};
            
            // 为每个考试类型初始化默认进度结构
            Object.keys(this.studyPlans).forEach(examType => {
                this.progressTracking[examType] = {
                    studyDays: 0,
                    completedLessons: {},
                    scores: {},
                    milestones: [],
                    startDate: new Date().toISOString(),
                    lastStudyDate: null,
                    totalStudyTime: 0,
                    currentPhase: 0,
                    vocabularyProgress: { learned: 0, target: 1000 },
                    skillProgress: {
                        listening: { current: 0, target: 100 },
                        reading: { current: 0, target: 100 },
                        writing: { current: 0, target: 100 },
                        speaking: { current: 0, target: 100 },
                        grammar: { current: 0, target: 100 }
                    },
                    dailyProgress: {}
                };
            });
            
            // 清除存储中的数据
            await Storage.remove('exam_study_progress');
            
            // 重新保存默认进度结构
            await this.saveUserProgress();
            
            console.log('✅ 考试学习进度已重置');
        } catch (error) {
            console.error('❌ 重置考试进度失败:', error);
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExamStudyPlanner;
} else {
    window.ExamStudyPlanner = ExamStudyPlanner;
}

console.log('📋 考试学习计划管理器已加载');
