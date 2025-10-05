/**
 * 考试进度显示组件
 * 为不同考试类型显示专门的进度界面
 */

class ExamProgressDisplay {
    constructor() {
        this.studyPlanner = null;
        this.chartComponents = null;
        this.currentExamType = null;
        this.init();
    }

    async init() {
        console.log('📊 初始化考试进度显示组件...');
        this.bindEvents();
        await this.waitForDependencies();

        // The initial display will now be triggered by the 'examTypeChanged' event
        // sent by app.js after loading the user's current exam type. This avoids a race condition.
        
        console.log('✅ 考试进度显示组件初始化完成');
    }

    bindEvents() {
        // 监听考试类型变化
        document.addEventListener('examTypeChanged', (event) => {
            this.handleExamTypeChange(event.detail.examType);
        });

        // 监听学习活动完成
        document.addEventListener('learningActivityCompleted', (event) => {
            this.handleLearningActivityCompleted(event.detail);
        });
    }

    /**
     * 等待依赖加载
     */
    async waitForDependencies() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50; // 最多等待5秒
            
            const checkDependencies = () => {
                attempts++;
                
                if (window.ExamStudyPlanner && window.ChartComponents) {
                    try {
                        this.studyPlanner = new ExamStudyPlanner();
                        this.chartComponents = new ChartComponents();
                        console.log('✅ 依赖加载完成');
                        resolve();
                    } catch (error) {
                        console.error('依赖初始化失败:', error);
                        this.initializeFallback();
                        resolve();
                    }
                } else if (attempts >= maxAttempts) {
                    console.warn('⚠️ 依赖加载超时，使用备用方案');
                    this.initializeFallback();
                    resolve();
                } else {
                    setTimeout(checkDependencies, 100);
                }
            };
            checkDependencies();
        });
    }

    /**
     * 初始化备用方案
     */
    initializeFallback() {
        // 创建简单的图表组件备用方案
        if (!this.chartComponents && window.ChartComponents) {
            try {
                this.chartComponents = new ChartComponents();
            } catch (error) {
                this.chartComponents = this.createFallbackChartComponents();
            }
        } else if (!this.chartComponents) {
            this.chartComponents = this.createFallbackChartComponents();
        }

        // 创建简单的学习计划器备用方案
        if (!this.studyPlanner && window.ExamStudyPlanner) {
            try {
                this.studyPlanner = new ExamStudyPlanner();
            } catch (error) {
                console.warn('使用备用学习计划器');
            }
        }
    }

    /**
     * 创建备用图表组件
     */
    createFallbackChartComponents() {
        return {
            createProgressRing: (containerId, data, options = {}) => {
                const container = document.getElementById(containerId);
                if (!container) return;
                
                const percentage = Math.min(100, Math.max(0, data.percentage || 0));
                container.innerHTML = `
                    <div class="fallback-progress-ring" style="
                        width: ${options.size || 120}px; 
                        height: ${options.size || 120}px;
                        border: 8px solid #e9ecef;
                        border-top: 8px solid ${options.foregroundColor || '#007bff'};
                        border-radius: 50%;
                        position: relative;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        animation: spin 2s linear infinite;
                    ">
                        <div style="text-align: center;">
                            <div style="font-size: 18px; font-weight: bold;">${percentage}%</div>
                            <div style="font-size: 12px; color: #666;">${data.label || ''}</div>
                        </div>
                    </div>
                `;
            }
        };
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 监听考试类型变化
        document.addEventListener('examTypeChanged', (event) => {
            this.handleExamTypeChange(event.detail.examType);
        });

        // 监听学习活动完成
        document.addEventListener('learningActivityCompleted', (event) => {
            this.handleLearningActivityCompleted(event.detail);
        });
    }

    /**
     * 处理考试类型变化
     */
    async handleExamTypeChange(examType) {
        this.currentExamType = examType;
        
        // 设置学习计划
        this.studyPlanner.setCurrentPlan(examType);
        
        // 更新进度显示
        await this.updateProgressDisplay();
        
        console.log(`📋 已切换到 ${examType} 进度显示`);
    }

    /**
     * 更新进度显示
     */
    async updateProgressDisplay() {
        if (!this.currentExamType) return;

        try {
            // 获取学习进度
            let progress = this.studyPlanner.getStudyProgress(this.currentExamType);
            
            // 如果没有进度数据，创建默认数据
            if (!progress) {
                console.log('没有找到学习进度，创建默认进度数据');
                progress = this.createDefaultProgress(this.currentExamType);
            }

            console.log('当前进度数据:', progress);

            // 更新各个显示组件
            this.updateOverallProgress(progress);
            this.updatePhaseProgress(progress);
            this.updateSkillProgress(progress);
            this.updateMilestones(progress);
            this.updateDailyTasks();
            this.updateRecommendations();

        } catch (error) {
            console.error('更新进度显示失败:', error);
            // 即使出错也显示默认内容
            this.showDefaultContent();
        }
    }

    /**
     * 更新总体进度
     */
    updateOverallProgress(progress) {
        // 更新总体进度环形图
        const overallContainer = document.getElementById('examOverallProgress');
        if (overallContainer) {
            this.chartComponents.createProgressRing('examOverallProgress', {
                percentage: progress.totalProgress,
                label: `${progress.studyDays}/${progress.totalDays}天`
            }, {
                size: 150,
                foregroundColor: this.getExamColor(progress.examType),
                showPercentage: true
            });
        }

        // 更新考试信息
        this.updateExamInfo(progress);
    }

    /**
     * 更新考试信息
     */
    updateExamInfo(progress) {
        const examInfoContainer = document.getElementById('examInfo');
        if (!examInfoContainer) return;

        // 目标分数与阶段名称的安全回退
        const plan = this.studyPlanner?.getCurrentPlan?.() || null;
        const examCfg = window.examConfig ? window.examConfig.getExamConfig(progress.examType) : null;
        const targetScore = (progress && typeof progress.targetScore !== 'undefined')
            ? progress.targetScore
            : (plan?.targetScore ?? examCfg?.targetScore ?? null);
        const maxScore = (progress && typeof progress.maxScore !== 'undefined')
            ? progress.maxScore
            : (plan?.maxScore ?? examCfg?.maxScore ?? null);
        const phaseName = progress.phaseName || plan?.phases?.[progress.currentPhase]?.name || '基础阶段';
        const targetHTML = (targetScore != null && maxScore != null)
            ? `<div class="exam-target">目标: ${targetScore}/${maxScore}分</div>`
            : '';

        examInfoContainer.innerHTML = `
            <div class="exam-info-card">
                <div class="exam-header">
                    <h3 class="exam-title">${progress.examName}</h3>
                    ${targetHTML}
                </div>
                <div class="exam-stats">
                    <div class="stat-item">
                        <span class="stat-label">学习天数</span>
                        <span class="stat-value">${progress.studyDays}/${progress.totalDays}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">总体进度</span>
                        <span class="stat-value">${progress.totalProgress}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">当前阶段</span>
                        <span class="stat-value">${phaseName}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 更新阶段进度
     */
    updatePhaseProgress(progress) {
        const phaseContainer = document.getElementById('examPhaseProgress');
        if (!phaseContainer) return;

        // 创建阶段进度条
        const phaseLabel = progress.phaseName || '基础阶段';
        this.chartComponents.createProgressRing('examPhaseProgress', {
            percentage: progress.phaseProgress,
            label: phaseLabel
        }, {
            size: 120,
            foregroundColor: '#28a745',
            showPercentage: true
        });

        // 显示阶段信息
        const phaseInfoContainer = document.getElementById('phaseInfo');
        if (phaseInfoContainer) {
            const plan = this.studyPlanner?.getCurrentPlan();
            if (!plan || !plan.phases || !plan.phases[progress.currentPhase]) {
                console.warn('⚠️ 无法获取学习计划或阶段信息，使用默认内容');
                phaseInfoContainer.innerHTML = `
                    <div class="phase-info">
                        <h4>当前阶段: 基础学习</h4>
                        <div class="phase-goals">
                            <p>正在为您准备个性化的学习计划...</p>
                        </div>
                    </div>
                `;
                return;
            }
            const currentPhase = plan.phases[progress.currentPhase];
            
            phaseInfoContainer.innerHTML = `
                <div class="phase-info">
                    <h4>当前阶段: ${currentPhase.name}</h4>
                    <div class="phase-goals">
                        <h5>阶段目标:</h5>
                        <ul>
                            ${currentPhase.goals.map(goal => `<li>${goal}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="phase-duration">
                        <span>阶段时长: ${currentPhase.duration}天</span>
                    </div>
                </div>
            `;
        }
    }

    /**
     * 更新技能进度
     */
    updateSkillProgress(progress) {
        const skillsContainer = document.getElementById('examSkillsProgress');
        if (!skillsContainer) return;

        let skillsHTML = '<div class="skills-grid">';
        
        const skillProgress = progress.skillProgress || {};
        Object.entries(skillProgress).forEach(([skill, data]) => {
            const skillName = this.getSkillName(skill);
            const skillColor = this.getSkillColor(skill);
            
            // 确保 data 有默认值
            const skillData = data || {};
            const weight = skillData.weight || 0.2;
            const completed = skillData.completed || skillData.current || 0;
            const total = skillData.total || skillData.target || 100;
            const progress = skillData.progress || 0;
            
            skillsHTML += `
                <div class="skill-item">
                    <div class="skill-header">
                        <span class="skill-name">${skillName}</span>
                        <span class="skill-weight">权重: ${Math.round(weight * 100)}%</span>
                    </div>
                    <div class="skill-progress-container">
                        <div id="skill-${skill}-progress" class="skill-progress-ring"></div>
                        <div class="skill-stats">
                            <div class="skill-completed">${completed}/${total}</div>
                            <div class="skill-percentage">${Math.round(progress)}%</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        skillsHTML += '</div>';
        skillsContainer.innerHTML = skillsHTML;

        // 为每个技能创建进度环
        Object.entries(skillProgress).forEach(([skill, data]) => {
            const skillData = data || {};
            const completed = skillData.completed || skillData.current || 0;
            const total = skillData.total || skillData.target || 100;
            const progress = skillData.progress || 0;
            
            this.chartComponents.createProgressRing(`skill-${skill}-progress`, {
                percentage: progress,
                label: `${completed}/${total}`
            }, {
                size: 80,
                foregroundColor: this.getSkillColor(skill),
                showPercentage: false
            });
        });
    }

    /**
     * 更新里程碑
     */
    updateMilestones(progress) {
        const milestonesContainer = document.getElementById('examMilestones');
        if (!milestonesContainer || !progress.nextMilestone) return;

        milestonesContainer.innerHTML = `
            <div class="milestone-card">
                <div class="milestone-header">
                    <h4>下个里程碑</h4>
                    <div class="days-left">${progress.nextMilestone.daysLeft}天后</div>
                </div>
                <div class="milestone-target">
                    <span class="target-icon">${this.getMilestoneIcon(progress.nextMilestone.type)}</span>
                    <span class="target-text">${progress.nextMilestone.target}</span>
                </div>
                <div class="milestone-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.calculateMilestoneProgress(progress.nextMilestone)}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 更新每日任务
     */
    updateDailyTasks() {
        const tasksContainer = document.getElementById('dailyTasks');
        if (!tasksContainer) return;

        // 获取每日任务，如果没有则使用默认任务
        let tasks = [];
        try {
            if (this.studyPlanner && this.studyPlanner.getDailyTasks) {
                tasks = this.studyPlanner.getDailyTasks(this.currentExamType);
            }
        } catch (error) {
            console.error('获取每日任务失败:', error);
        }

        // 如果没有任务数据，使用默认任务
        if (!tasks || tasks.length === 0) {
            tasks = this.getDefaultDailyTasks();
        }
        
        let tasksHTML = '<div class="daily-tasks">';
        tasksHTML += '<div class="daily-tasks-header">';
        tasksHTML += '<span class="tasks-icon">📋</span>';
        tasksHTML += '<h4>今日学习任务</h4>';
        tasksHTML += '</div>';
        tasksHTML += '<div class="tasks-list">';

        tasks.forEach(task => {
            const completionClass = task.isCompleted ? 'completed' : '';
            const progress = Math.min(100, task.progress || (task.completed / task.target * 100));
            tasksHTML += `
                <div class="task-item ${completionClass}">
                    <div class="task-info">
                        <span class="task-name">${this.getSkillName(task.skill)}</span>
                        <span class="task-target">${task.target}${task.unit}</span>
                    </div>
                    <div class="task-progress">
                        <div class="task-progress-bar">
                            <div class="task-progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="task-completion">${task.completed}/${task.target}</span>
                    </div>
                    <div class="task-status">
                        ${task.isCompleted ? '✅' : '⏳'}
                    </div>
                </div>
            `;
        });

        tasksHTML += '</div></div>';
        tasksContainer.innerHTML = tasksHTML;
    }

    /**
     * 获取默认每日任务
     */
    getDefaultDailyTasks() {
        return [
            {
                skill: 'vocabulary',
                target: 30,
                unit: '个单词',
                completed: 15,
                isCompleted: false,
                progress: 50
            },
            {
                skill: 'listening',
                target: 20,
                unit: '分钟',
                completed: 10,
                isCompleted: false,
                progress: 50
            },
            {
                skill: 'reading',
                target: 30,
                unit: '分钟',
                completed: 15,
                isCompleted: false,
                progress: 50
            },
            {
                skill: 'grammar',
                target: 15,
                unit: '分钟',
                completed: 5,
                isCompleted: false,
                progress: 33
            }
        ];
    }

    /**
     * 获取技能名称
     */
    getSkillName(skill) {
        const skillNames = {
            vocabulary: '词汇学习',
            listening: '听力练习',
            reading: '阅读理解',
            writing: '写作练习',
            grammar: '语法练习',
            speaking: '口语练习'
        };
        return skillNames[skill] || skill;
    }

    /**
     * 更新学习建议
     */
    updateRecommendations() {
        const recommendationsContainer = document.getElementById('studyRecommendations');
        if (!recommendationsContainer) return;

        // 获取推荐建议，如果没有则使用默认建议
        let recommendations = [];
        try {
            if (this.studyPlanner && this.studyPlanner.generateStudyRecommendations) {
                recommendations = this.studyPlanner.generateStudyRecommendations(this.currentExamType);
            }
        } catch (error) {
            console.error('获取学习建议失败:', error);
        }

        // 如果没有推荐建议，使用默认建议
        if (!recommendations || recommendations.length === 0) {
            recommendations = this.getDefaultRecommendations(this.currentExamType);
        }
        
        let recommendationsHTML = '<div class="study-recommendations">';
        recommendationsHTML += '<div class="recommendations-header">';
        recommendationsHTML += '<span class="recommendations-icon">🤖</span>';
        recommendationsHTML += '<h4>AI智能推荐</h4>';
        recommendationsHTML += '</div>';
        recommendationsHTML += '<div class="recommendations-list">';

        recommendations.forEach(rec => {
            const priorityClass = `priority-${rec.priority}`;
            recommendationsHTML += `
                <div class="recommendation-item ${priorityClass}">
                    <div class="recommendation-header">
                        <span class="recommendation-icon">${rec.icon || '📝'}</span>
                        <span class="recommendation-title">${rec.title}</span>
                        <span class="recommendation-priority">${this.getPriorityText(rec.priority)}</span>
                    </div>
                    <div class="recommendation-message">${rec.message}</div>
                    <div class="recommendation-action">
                        <button class="action-btn" data-action="${rec.action || 'start'}" onclick="console.log('执行:', '${rec.action || 'start'}')">
                            ${rec.actionText || '开始学习'}
                        </button>
                    </div>
                </div>
            `;
        });

        recommendationsHTML += '</div></div>';
        recommendationsContainer.innerHTML = recommendationsHTML;
    }

    /**
     * 处理学习活动完成
     */
    async handleLearningActivityCompleted(activityData) {
        if (!this.currentExamType) return;

        // 记录到学习计划中
        await this.studyPlanner.recordDailyTask(
            this.currentExamType, 
            activityData.skill, 
            activityData.amount
        );

        // 更新进度显示
        await this.updateProgressDisplay();
    }

    /**
     * 创建默认进度数据
     */
    createDefaultProgress(examType) {
        const examConfig = window.examConfig ? window.examConfig.getExamConfig(examType) : null;
        const examName = examConfig ? examConfig.name : '英语考试';
        const targetScore = examConfig?.targetScore ?? 0;
        const maxScore = examConfig?.maxScore ?? 0;
        
        return {
            examType: examType,
            examName: examName,
            targetScore: targetScore,
            maxScore: maxScore,
            studyDays: 0,
            totalDays: 90,
            totalProgress: 0,
            currentPhase: 0,
            phaseProgress: 0,
            phases: [
                { name: '基础阶段', duration: 30, progress: 0 },
                { name: '强化阶段', duration: 45, progress: 0 },
                { name: '冲刺阶段', duration: 15, progress: 0 }
            ],
            skillProgress: {
                vocabulary: { current: 0, target: 4500, progress: 0 },
                listening: { current: 0, target: 80, progress: 0 },
                reading: { current: 0, target: 80, progress: 0 },
                writing: { current: 0, target: 70, progress: 0 },
                grammar: { current: 0, target: 75, progress: 0 }
            },
            milestones: [
                { day: 30, target: '词汇量达到1500个', completed: false, type: 'vocabulary' },
                { day: 60, target: '听力准确率达到70%', completed: false, type: 'listening' },
                { day: 90, target: '模拟考试达到目标分数', completed: false, type: 'overall' }
            ],
            nextMilestone: {
                target: '词汇量达到1500个',
                daysLeft: 30,
                type: 'vocabulary',
                progress: 0
            },
            dailyTasks: {
                vocabulary: { current: 0, target: 30, unit: '个单词' },
                listening: { current: 0, target: 20, unit: '分钟' },
                reading: { current: 0, target: 30, unit: '分钟' },
                grammar: { current: 0, target: 15, unit: '分钟' }
            },
            streakDays: 0,
            totalStudyTime: 0
        };
    }

    /**
     * 显示默认内容
     */
    showDefaultContent() {
        const defaultProgress = this.createDefaultProgress(this.currentExamType || 'cet4');
        this.updateOverallProgress(defaultProgress);
        this.updatePhaseProgress(defaultProgress);
        this.updateSkillProgress(defaultProgress);
        this.updateMilestones(defaultProgress);
        this.updateDailyTasks();
        this.updateRecommendations();
    }

    /**
     * 获取默认学习建议
     */
    getDefaultRecommendations(examType) {
        const baseRecommendations = [
            {
                title: '开始每日词汇学习',
                message: '建议每天学习30个新单词，复习50个旧单词',
                priority: 'high',
                icon: '📚',
                action: 'start_vocabulary',
                actionText: '开始背单词'
            },
            {
                title: '加强听力练习',
                message: '您的听力能力需要提升，建议每天练习20分钟',
                priority: 'medium',
                icon: '🎵',
                action: 'start_listening',
                actionText: '听力练习'
            },
            {
                title: '完成语法练习',
                message: '巩固语法基础，重点练习时态和从句',
                priority: 'medium',
                icon: '📝',
                action: 'start_grammar',
                actionText: '语法练习'
            }
        ];

        // 根据考试类型自定义建议
        const examSpecificRecommendations = {
            cet4: [
                {
                    title: '四级真题模拟',
                    message: '距离考试还有较长时间，建议进行基础练习',
                    priority: 'low',
                    icon: '📋',
                    action: 'mock_test',
                    actionText: '模拟考试'
                }
            ],
            ielts: [
                {
                    title: '雅思口语练习',
                    message: '加强口语表达能力，重点练习Part2话题',
                    priority: 'high',
                    icon: '🗣️',
                    action: 'speaking_practice',
                    actionText: '口语练习'
                }
            ],
            toefl: [
                {
                    title: '托福综合写作',
                    message: '练习综合写作技巧，提高写作速度',
                    priority: 'medium',
                    icon: '✍️',
                    action: 'writing_practice',
                    actionText: '写作练习'
                }
            ]
        };

        const specificRecs = examSpecificRecommendations[examType] || [];
        return [...baseRecommendations, ...specificRecs];
    }

    /**
     * 获取优先级文本
     */
    getPriorityText(priority) {
        const priorityMap = {
            high: '高优先级',
            medium: '中优先级',
            low: '低优先级'
        };
        return priorityMap[priority] || '普通';
    }

    /**
     * 获取考试颜色
     */
    getExamColor(examType) {
        const colors = {
            cet4: '#007bff',
            cet6: '#28a745',
            tem4: '#17a2b8',
            tem8: '#6f42c1',
            ielts: '#dc3545',
            toefl: '#ffc107',
            postgraduate: '#6f42c1',
            gre: '#fd7e14'
        };
        return colors[examType] || '#007bff';
    }

    /**
     * 获取技能颜色
     */
    getSkillColor(skill) {
        const colors = {
            listening: '#007bff',
            reading: '#28a745',
            writing: '#ffc107',
            speaking: '#dc3545',
            vocabulary: '#6f42c1',
            grammar: '#fd7e14',
            translation: '#20c997',
            verbal: '#e83e8c',
            quantitative: '#6c757d'
        };
        return colors[skill] || '#007bff';
    }

    /**
     * 获取技能名称
     */
    getSkillName(skill) {
        const names = {
            listening: '听力',
            reading: '阅读',
            writing: '写作',
            speaking: '口语',
            vocabulary: '词汇',
            grammar: '语法',
            translation: '翻译',
            verbal: '语文推理',
            quantitative: '数量推理',
            knowledge: '语言知识',
            review: '复习'
        };
        return names[skill] || skill;
    }

    /**
     * 获取里程碑图标
     */
    getMilestoneIcon(type) {
        const icons = {
            vocabulary: '📚',
            grammar: '📝',
            listening: '🎧',
            reading: '📖',
            writing: '✍️',
            speaking: '🗣️',
            mock_test: '📊',
            target: '🎯'
        };
        return icons[type] || '🎯';
    }

    /**
     * 计算里程碑进度
     */
    calculateMilestoneProgress(milestone) {
        // 这里可以根据具体的里程碑类型计算进度
        // 简化实现，返回一个估算值
        return Math.random() * 70 + 10; // 10-80%
    }

    /**
     * 获取优先级文本
     */
    getPriorityText(priority) {
        const texts = {
            high: '高优先级',
            medium: '中优先级',
            low: '低优先级'
        };
        return texts[priority] || priority;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExamProgressDisplay;
} else {
    window.ExamProgressDisplay = ExamProgressDisplay;
}

console.log('📊 考试进度显示组件已加载');
