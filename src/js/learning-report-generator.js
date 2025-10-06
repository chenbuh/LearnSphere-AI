/**
 * 学习报告生成器
 * 生成详细的学习分析报告和可视化展示
 */
class LearningReportGenerator {
    constructor() {
        this.reportTypes = {
            daily: { name: '每日报告', period: 1 },
            weekly: { name: '每周报告', period: 7 },
            monthly: { name: '每月报告', period: 30 },
            quarterly: { name: '季度报告', period: 90 },
            yearly: { name: '年度报告', period: 365 },
            custom: { name: '自定义报告', period: null }
        };
        
        this.reportSections = {
            overview: '学习概览',
            performance: '学习表现',
            progress: '进度分析',
            goals: '目标达成',
            achievements: '成就获得',
            recommendations: '学习建议',
            trends: '趋势分析',
            comparison: '对比分析'
        };
        
        this.dataCollector = null;
        this.chartComponents = null;
        this.goalManager = null;
        
        this.init();
    }

    /**
     * 初始化报告生成器
     */
    async init() {
        console.log('📊 初始化学习报告生成器...');
        
        // 等待依赖组件加载
        await this.waitForDependencies();
        
        // 初始化组件引用
        this.dataCollector = window.enhancedLearningDataCollector;
        this.chartComponents = new window.EnhancedChartComponents();
        this.goalManager = window.learningGoalManager;
        
        console.log('✅ 学习报告生成器初始化完成');
    }

    /**
     * 等待依赖组件加载
     */
    async waitForDependencies() {
        return new Promise((resolve) => {
            const checkDependencies = () => {
                if (window.EnhancedChartComponents && 
                    window.enhancedLearningDataCollector) {
                    resolve();
                } else {
                    setTimeout(checkDependencies, 100);
                }
            };
            checkDependencies();
        });
    }

    /**
     * 生成学习报告
     */
    async generateReport(options = {}) {
        const {
            type = 'weekly',
            startDate = null,
            endDate = null,
            sections = ['overview', 'performance', 'progress', 'goals', 'recommendations'],
            format = 'html',
            includeCharts = true,
            language = 'zh'
        } = options;

        console.log('📈 开始生成学习报告...', { type, sections });

        try {
            // 计算报告时间范围
            const dateRange = this.calculateDateRange(type, startDate, endDate);
            
            // 收集数据
            const reportData = await this.collectReportData(dateRange);
            
            // 生成报告内容
            const report = {
                metadata: {
                    type,
                    dateRange,
                    generatedAt: new Date().toISOString(),
                    language,
                    version: '1.0'
                },
                summary: this.generateSummary(reportData),
                sections: {}
            };

            // 生成各个部分
            for (const section of sections) {
                if (this.reportSections[section]) {
                    report.sections[section] = await this.generateSection(section, reportData, includeCharts);
                }
            }

            // 生成最终报告
            const finalReport = await this.formatReport(report, format);
            
            console.log('✅ 学习报告生成完成');
            return finalReport;

        } catch (error) {
            console.error('❌ 生成学习报告失败:', error);
            throw error;
        }
    }

    /**
     * 计算报告时间范围
     */
    calculateDateRange(type, startDate, endDate) {
        const now = new Date();
        let start, end;

        if (type === 'custom' && startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            const period = this.reportTypes[type]?.period || 7;
            end = new Date(now);
            start = new Date(now.getTime() - period * 24 * 60 * 60 * 1000);
        }

        return { start, end, type };
    }

    /**
     * 收集报告数据
     */
    async collectReportData(dateRange) {
        const data = {
            sessions: [],
            statistics: null,
            goals: [],
            achievements: [],
            performance: {},
            trends: {}
        };

        try {
            // 获取学习统计数据
            if (this.dataCollector) {
                data.statistics = await this.dataCollector.getStatistics('all');
            }

            // 获取目标数据
            if (this.goalManager) {
                data.goals = this.goalManager.getGoals();
                data.achievements = this.goalManager.getAchievements();
            }

            // 获取会话数据
            const sessions = JSON.parse(localStorage.getItem('enhanced_study_sessions') || '[]');
            data.sessions = sessions.filter(session => {
                const sessionDate = new Date(session.startTime);
                return sessionDate >= dateRange.start && sessionDate <= dateRange.end;
            });

            // 计算性能指标
            data.performance = this.calculatePerformanceMetrics(data.sessions);
            
            // 计算趋势数据
            data.trends = this.calculateTrendData(data.sessions, dateRange);

        } catch (error) {
            console.error('收集报告数据失败:', error);
        }

        return data;
    }

    /**
     * 生成报告摘要
     */
    generateSummary(data) {
        const sessions = data.sessions || [];
        const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const totalQuestions = sessions.reduce((sum, s) => sum + (s.content?.questionsAnswered || 0), 0);
        const totalCorrect = sessions.reduce((sum, s) => sum + (s.content?.correctAnswers || 0), 0);
        
        const completedGoals = (data.goals || []).filter(g => g.status === 'completed').length;
        const activeGoals = (data.goals || []).filter(g => g.status === 'active').length;
        
        return {
            totalSessions: sessions.length,
            totalTime: Math.round(totalTime / 60000), // 转换为分钟
            totalQuestions,
            averageAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
            completedGoals,
            activeGoals,
            newAchievements: (data.achievements || []).length,
            studyDays: new Set(sessions.map(s => new Date(s.startTime).toDateString())).size
        };
    }

    /**
     * 生成报告部分
     */
    async generateSection(sectionType, data, includeCharts) {
        switch (sectionType) {
            case 'overview':
                return this.generateOverviewSection(data, includeCharts);
            case 'performance':
                return this.generatePerformanceSection(data, includeCharts);
            case 'progress':
                return this.generateProgressSection(data, includeCharts);
            case 'goals':
                return this.generateGoalsSection(data, includeCharts);
            case 'achievements':
                return this.generateAchievementsSection(data, includeCharts);
            case 'recommendations':
                return this.generateRecommendationsSection(data);
            case 'trends':
                return this.generateTrendsSection(data, includeCharts);
            case 'comparison':
                return this.generateComparisonSection(data, includeCharts);
            default:
                return null;
        }
    }

    /**
     * 生成概览部分
     */
    generateOverviewSection(data, includeCharts) {
        const summary = data.summary || this.generateSummary(data);
        const sessions = data.sessions || [];
        
        const section = {
            title: '学习概览',
            summary,
            insights: [],
            charts: []
        };

        // 生成洞察
        if (summary.totalSessions > 0) {
            const avgSessionTime = summary.totalTime / summary.totalSessions;
            
            section.insights = [
                `在报告期间，您总共进行了 ${summary.totalSessions} 次学习，累计学习时间 ${summary.totalTime} 分钟`,
                `平均每次学习 ${Math.round(avgSessionTime)} 分钟，共学习了 ${summary.studyDays} 天`,
                `总体答题准确率为 ${summary.averageAccuracy}%，回答了 ${summary.totalQuestions} 个问题`,
                summary.completedGoals > 0 ? 
                    `完成了 ${summary.completedGoals} 个学习目标，还有 ${summary.activeGoals} 个目标正在进行中` :
                    `当前有 ${summary.activeGoals} 个活跃的学习目标`
            ];
        } else {
            section.insights = ['在此报告期间没有学习记录，建议制定学习计划并开始学习'];
        }

        // 生成图表数据
        if (includeCharts && sessions.length > 0) {
            // 每日学习时间图表
            const dailyData = this.generateDailyTimeChart(sessions);
            section.charts.push({
                type: 'line',
                title: '每日学习时间趋势',
                data: dailyData,
                containerId: 'overview-daily-time'
            });

            // 模块分布饼图
            const moduleData = this.generateModuleDistributionChart(sessions);
            if (moduleData.length > 0) {
                section.charts.push({
                    type: 'pie',
                    title: '学习模块分布',
                    data: moduleData,
                    containerId: 'overview-module-distribution'
                });
            }
        }

        return section;
    }

    /**
     * 生成表现部分
     */
    generatePerformanceSection(data, includeCharts) {
        const sessions = data.sessions || [];
        const performance = data.performance || {};
        
        const section = {
            title: '学习表现',
            metrics: {},
            insights: [],
            charts: []
        };

        // 计算表现指标
        section.metrics = {
            averageAccuracy: performance.averageAccuracy || 0,
            averageSpeed: performance.averageSpeed || 0,
            consistency: performance.consistency || 0,
            improvement: performance.improvement || 0,
            errorRate: performance.errorRate || 0,
            focusScore: performance.focusScore || 0
        };

        // 生成洞察
        const insights = [];
        
        if (section.metrics.averageAccuracy >= 85) {
            insights.push('🎯 您的答题准确率非常优秀，保持这个水平！');
        } else if (section.metrics.averageAccuracy >= 70) {
            insights.push('👍 您的答题准确率良好，可以尝试更有挑战性的内容');
        } else {
            insights.push('📚 建议加强基础知识的复习，提高答题准确率');
        }

        if (section.metrics.consistency >= 80) {
            insights.push('⭐ 您的学习表现很稳定，这是很好的学习习惯');
        } else {
            insights.push('📈 学习表现波动较大，建议保持更稳定的学习节奏');
        }

        if (section.metrics.focusScore >= 80) {
            insights.push('🎯 您的学习专注度很高，学习效率优秀');
        } else if (section.metrics.focusScore >= 60) {
            insights.push('⏰ 学习专注度中等，可以尝试减少干扰因素');
        } else {
            insights.push('🔍 建议提高学习专注度，创造更好的学习环境');
        }

        section.insights = insights;

        // 生成图表
        if (includeCharts && sessions.length > 0) {
            // 准确率趋势图
            const accuracyTrend = this.generateAccuracyTrendChart(sessions);
            section.charts.push({
                type: 'line',
                title: '准确率变化趋势',
                data: accuracyTrend,
                containerId: 'performance-accuracy-trend'
            });

            // 表现雷达图
            const radarData = [
                { label: '准确率', value: section.metrics.averageAccuracy },
                { label: '速度', value: Math.min(100, section.metrics.averageSpeed * 10) },
                { label: '一致性', value: section.metrics.consistency },
                { label: '专注度', value: section.metrics.focusScore },
                { label: '进步幅度', value: Math.max(0, section.metrics.improvement + 50) }
            ];
            
            section.charts.push({
                type: 'radar',
                title: '综合表现分析',
                data: radarData,
                containerId: 'performance-radar'
            });
        }

        return section;
    }

    /**
     * 生成进度部分
     */
    generateProgressSection(data, includeCharts) {
        const sessions = data.sessions || [];
        const goals = data.goals || [];
        
        const section = {
            title: '进度分析',
            progress: {},
            insights: [],
            charts: []
        };

        // 计算各模块进度
        const moduleProgress = {};
        const moduleStats = {};
        
        sessions.forEach(session => {
            const module = session.module || 'unknown';
            if (!moduleStats[module]) {
                moduleStats[module] = {
                    sessions: 0,
                    time: 0,
                    questions: 0,
                    correct: 0
                };
            }
            
            moduleStats[module].sessions++;
            moduleStats[module].time += session.duration || 0;
            moduleStats[module].questions += session.content?.questionsAnswered || 0;
            moduleStats[module].correct += session.content?.correctAnswers || 0;
        });

        // 计算进度百分比（基于目标或预设标准）
        Object.entries(moduleStats).forEach(([module, stats]) => {
            const accuracy = stats.questions > 0 ? (stats.correct / stats.questions) * 100 : 0;
            const timeHours = stats.time / (1000 * 60 * 60);
            
            moduleProgress[module] = {
                accuracy: Math.round(accuracy),
                timeSpent: Math.round(timeHours * 10) / 10,
                sessionsCompleted: stats.sessions,
                masteryLevel: this.calculateMasteryLevel(accuracy, stats.sessions)
            };
        });

        section.progress = moduleProgress;

        // 生成洞察
        const insights = [];
        const sortedModules = Object.entries(moduleProgress)
            .sort((a, b) => b[1].masteryLevel - a[1].masteryLevel);

        if (sortedModules.length > 0) {
            const bestModule = sortedModules[0];
            const weakestModule = sortedModules[sortedModules.length - 1];
            
            insights.push(`📈 您在 ${bestModule[0]} 方面表现最好，掌握程度达到 ${bestModule[1].masteryLevel}%`);
            
            if (sortedModules.length > 1) {
                insights.push(`📚 ${weakestModule[0]} 还有提升空间，建议加强练习`);
            }
        }

        // 目标完成情况
        const activeGoals = goals.filter(g => g.status === 'active');
        const completedGoals = goals.filter(g => g.status === 'completed');
        
        if (completedGoals.length > 0) {
            insights.push(`🎯 恭喜完成了 ${completedGoals.length} 个学习目标！`);
        }
        
        if (activeGoals.length > 0) {
            const avgProgress = activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length;
            insights.push(`🚀 当前 ${activeGoals.length} 个目标平均完成度为 ${Math.round(avgProgress)}%`);
        }

        section.insights = insights;

        // 生成图表
        if (includeCharts) {
            // 模块掌握度图表
            const masteryData = Object.entries(moduleProgress).map(([module, progress]) => ({
                label: module,
                value: progress.masteryLevel
            }));
            
            if (masteryData.length > 0) {
                section.charts.push({
                    type: 'bar',
                    title: '各模块掌握程度',
                    data: masteryData,
                    containerId: 'progress-mastery-levels'
                });
            }

            // 目标进度环形图
            if (activeGoals.length > 0) {
                activeGoals.slice(0, 4).forEach((goal, index) => {
                    section.charts.push({
                        type: 'progressRing',
                        title: goal.title,
                        data: {
                            percentage: goal.progress,
                            label: `${goal.current}/${goal.target} ${goal.unit}`
                        },
                        containerId: `progress-goal-${index}`
                    });
                });
            }
        }

        return section;
    }

    /**
     * 生成目标部分
     */
    generateGoalsSection(data, includeCharts) {
        const goals = data.goals || [];
        
        const section = {
            title: '目标达成情况',
            summary: {},
            goalDetails: [],
            insights: [],
            charts: []
        };

        // 统计目标情况
        const goalsByStatus = {
            active: goals.filter(g => g.status === 'active'),
            completed: goals.filter(g => g.status === 'completed'),
            paused: goals.filter(g => g.status === 'paused'),
            cancelled: goals.filter(g => g.status === 'cancelled')
        };

        section.summary = {
            total: goals.length,
            active: goalsByStatus.active.length,
            completed: goalsByStatus.completed.length,
            completionRate: goals.length > 0 ? Math.round((goalsByStatus.completed.length / goals.length) * 100) : 0
        };

        // 目标详情
        section.goalDetails = goals.map(goal => ({
            title: goal.title,
            status: goal.status,
            progress: goal.progress,
            target: goal.target,
            current: goal.current,
            unit: goal.unit,
            priority: goal.priority,
            deadline: goal.deadline,
            category: goal.category
        }));

        // 生成洞察
        const insights = [];
        
        if (goalsByStatus.completed.length > 0) {
            insights.push(`🎉 恭喜您完成了 ${goalsByStatus.completed.length} 个目标！`);
        }
        
        if (goalsByStatus.active.length > 0) {
            const highPriorityGoals = goalsByStatus.active.filter(g => g.priority === 'high');
            if (highPriorityGoals.length > 0) {
                insights.push(`⚡ 您有 ${highPriorityGoals.length} 个高优先级目标需要重点关注`);
            }
            
            const nearDeadlineGoals = goalsByStatus.active.filter(g => 
                g.deadline && (g.deadline - Date.now()) < 7 * 24 * 60 * 60 * 1000
            );
            if (nearDeadlineGoals.length > 0) {
                insights.push(`⏰ 有 ${nearDeadlineGoals.length} 个目标即将到期，请抓紧时间完成`);
            }
        }
        
        if (section.summary.completionRate >= 80) {
            insights.push('🌟 您的目标完成率很高，执行力很强！');
        } else if (section.summary.completionRate >= 50) {
            insights.push('👍 目标完成情况良好，继续保持');
        } else if (goals.length > 0) {
            insights.push('💪 建议重新评估目标的合理性，制定更容易达成的计划');
        }

        section.insights = insights;

        // 生成图表
        if (includeCharts && goals.length > 0) {
            // 目标状态分布饼图
            const statusData = [
                { label: '进行中', value: goalsByStatus.active.length },
                { label: '已完成', value: goalsByStatus.completed.length },
                { label: '已暂停', value: goalsByStatus.paused.length },
                { label: '已取消', value: goalsByStatus.cancelled.length }
            ].filter(item => item.value > 0);

            section.charts.push({
                type: 'pie',
                title: '目标状态分布',
                data: statusData,
                containerId: 'goals-status-distribution'
            });

            // 目标类别完成情况
            const categoryStats = {};
            goals.forEach(goal => {
                const category = goal.category || 'other';
                if (!categoryStats[category]) {
                    categoryStats[category] = { total: 0, completed: 0 };
                }
                categoryStats[category].total++;
                if (goal.status === 'completed') {
                    categoryStats[category].completed++;
                }
            });

            const categoryData = Object.entries(categoryStats).map(([category, stats]) => ({
                label: category,
                value: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
            }));

            if (categoryData.length > 1) {
                section.charts.push({
                    type: 'bar',
                    title: '各类别目标完成率',
                    data: categoryData,
                    containerId: 'goals-category-completion'
                });
            }
        }

        return section;
    }

    /**
     * 生成成就部分
     */
    generateAchievementsSection(data, includeCharts) {
        const achievements = data.achievements || [];
        
        const section = {
            title: '成就获得情况',
            summary: {},
            recentAchievements: [],
            insights: [],
            charts: []
        };

        // 统计成就
        const achievementsByRarity = {
            common: achievements.filter(a => a.rarity === 'common'),
            rare: achievements.filter(a => a.rarity === 'rare'),
            epic: achievements.filter(a => a.rarity === 'epic'),
            legendary: achievements.filter(a => a.rarity === 'legendary')
        };

        section.summary = {
            total: achievements.length,
            totalPoints: achievements.reduce((sum, a) => sum + (a.points || 0), 0),
            byRarity: {
                common: achievementsByRarity.common.length,
                rare: achievementsByRarity.rare.length,
                epic: achievementsByRarity.epic.length,
                legendary: achievementsByRarity.legendary.length
            }
        };

        // 最近获得的成就
        section.recentAchievements = achievements
            .sort((a, b) => b.unlockedAt - a.unlockedAt)
            .slice(0, 5)
            .map(achievement => ({
                title: achievement.title,
                description: achievement.description,
                icon: achievement.icon,
                rarity: achievement.rarity,
                points: achievement.points,
                unlockedAt: new Date(achievement.unlockedAt).toLocaleDateString()
            }));

        // 生成洞察
        const insights = [];
        
        if (achievements.length === 0) {
            insights.push('🎯 开始学习并完成目标，解锁您的第一个成就！');
        } else {
            insights.push(`🏆 您已经获得了 ${achievements.length} 个成就，累计 ${section.summary.totalPoints} 积分`);
            
            if (achievementsByRarity.legendary.length > 0) {
                insights.push(`👑 恭喜获得 ${achievementsByRarity.legendary.length} 个传奇成就！这是非常了不起的成就`);
            } else if (achievementsByRarity.epic.length > 0) {
                insights.push(`⭐ 您已获得 ${achievementsByRarity.epic.length} 个史诗成就，继续努力冲击传奇！`);
            }
            
            const recentCount = achievements.filter(a => 
                Date.now() - a.unlockedAt < 7 * 24 * 60 * 60 * 1000
            ).length;
            
            if (recentCount > 0) {
                insights.push(`🔥 最近一周获得了 ${recentCount} 个新成就，学习势头很好！`);
            }
        }

        section.insights = insights;

        // 生成图表
        if (includeCharts && achievements.length > 0) {
            // 成就稀有度分布
            const rarityData = [
                { label: '普通', value: achievementsByRarity.common.length },
                { label: '稀有', value: achievementsByRarity.rare.length },
                { label: '史诗', value: achievementsByRarity.epic.length },
                { label: '传奇', value: achievementsByRarity.legendary.length }
            ].filter(item => item.value > 0);

            section.charts.push({
                type: 'pie',
                title: '成就稀有度分布',
                data: rarityData,
                containerId: 'achievements-rarity-distribution'
            });

            // 成就获得时间线
            const timelineData = this.generateAchievementTimeline(achievements);
            if (timelineData.length > 1) {
                section.charts.push({
                    type: 'line',
                    title: '成就获得趋势',
                    data: timelineData,
                    containerId: 'achievements-timeline'
                });
            }
        }

        return section;
    }

    /**
     * 生成建议部分
     */
    generateRecommendationsSection(data) {
        const sessions = data.sessions || [];
        const goals = data.goals || [];
        const performance = data.performance || {};
        
        const section = {
            title: '学习建议',
            recommendations: [],
            actionItems: [],
            nextSteps: []
        };

        const recommendations = [];

        // 基于学习频率的建议
        if (sessions.length === 0) {
            recommendations.push({
                type: 'frequency',
                priority: 'high',
                title: '开始学习之旅',
                description: '建议制定学习计划，每天至少学习15-30分钟',
                action: '设定每日学习目标'
            });
        } else {
            const studyDays = new Set(sessions.map(s => new Date(s.startTime).toDateString())).size;
            const totalDays = Math.ceil((Date.now() - sessions[0].startTime) / (24 * 60 * 60 * 1000));
            const frequency = studyDays / totalDays;

            if (frequency < 0.3) {
                recommendations.push({
                    type: 'frequency',
                    priority: 'high',
                    title: '提高学习频率',
                    description: '建议增加学习频率，保持每天或隔天学习的习惯',
                    action: '设定学习提醒'
                });
            }
        }

        // 基于准确率的建议
        if (performance.averageAccuracy < 60) {
            recommendations.push({
                type: 'accuracy',
                priority: 'high',
                title: '加强基础知识',
                description: '当前准确率偏低，建议复习基础知识，放慢学习节奏',
                action: '选择更基础的学习内容'
            });
        } else if (performance.averageAccuracy > 90) {
            recommendations.push({
                type: 'challenge',
                priority: 'medium',
                title: '增加学习难度',
                description: '您的表现很优秀，可以尝试更有挑战性的内容',
                action: '选择更高难度的练习'
            });
        }

        // 基于学习时长的建议
        const avgSessionTime = sessions.length > 0 ? 
            sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length / 60000 : 0;

        if (avgSessionTime > 60) {
            recommendations.push({
                type: 'duration',
                priority: 'medium',
                title: '适当休息',
                description: '学习时间较长，建议适当休息，避免疲劳影响效果',
                action: '采用番茄工作法，25分钟学习+5分钟休息'
            });
        } else if (avgSessionTime < 10) {
            recommendations.push({
                type: 'duration',
                priority: 'medium',
                title: '延长学习时间',
                description: '学习时间较短，建议每次至少学习15-20分钟',
                action: '设定最少学习时长'
            });
        }

        // 基于目标完成情况的建议
        const activeGoals = goals.filter(g => g.status === 'active');
        const overdueGoals = activeGoals.filter(g => g.deadline && Date.now() > g.deadline);

        if (overdueGoals.length > 0) {
            recommendations.push({
                type: 'goals',
                priority: 'high',
                title: '调整目标计划',
                description: `有 ${overdueGoals.length} 个目标已过期，建议重新评估目标的合理性`,
                action: '重新设定可达成的目标'
            });
        }

        if (activeGoals.length === 0 && goals.filter(g => g.status === 'completed').length > 0) {
            recommendations.push({
                type: 'goals',
                priority: 'medium',
                title: '设定新目标',
                description: '您已完成了之前的目标，建议设定新的学习目标',
                action: '制定下一阶段的学习计划'
            });
        }

        // 基于专注度的建议
        if (performance.focusScore < 60) {
            recommendations.push({
                type: 'focus',
                priority: 'medium',
                title: '提高学习专注度',
                description: '学习专注度有待提高，建议创造更好的学习环境',
                action: '减少干扰因素，选择安静的学习环境'
            });
        }

        section.recommendations = recommendations;

        // 生成行动项目
        section.actionItems = recommendations
            .filter(r => r.priority === 'high')
            .map(r => r.action);

        // 生成下一步建议
        section.nextSteps = [
            '根据报告建议调整学习策略',
            '设定合理的短期和长期目标',
            '保持规律的学习习惯',
            '定期回顾学习进度和效果'
        ];

        return section;
    }

    /**
     * 生成趋势部分
     */
    generateTrendsSection(data, includeCharts) {
        const sessions = data.sessions || [];
        const trends = data.trends || {};
        
        const section = {
            title: '趋势分析',
            trends: {},
            insights: [],
            charts: []
        };

        if (sessions.length > 0) {
            // 计算各种趋势
            section.trends = {
                timeSpent: this.calculateTimeSpentTrend(sessions),
                accuracy: this.calculateAccuracyTrend(sessions),
                frequency: this.calculateFrequencyTrend(sessions),
                performance: this.calculatePerformanceTrend(sessions)
            };

            // 生成趋势洞察
            const insights = [];
            
            if (section.trends.timeSpent.direction === 'up') {
                insights.push('📈 学习时间呈上升趋势，学习投入度在提高');
            } else if (section.trends.timeSpent.direction === 'down') {
                insights.push('📉 学习时间有所下降，建议保持稳定的学习节奏');
            }

            if (section.trends.accuracy.direction === 'up') {
                insights.push('🎯 答题准确率在提升，学习效果很好');
            } else if (section.trends.accuracy.direction === 'down') {
                insights.push('⚠️ 准确率有所下降，可能需要复习之前的内容');
            }

            if (section.trends.frequency.direction === 'up') {
                insights.push('🔥 学习频率在增加，养成了良好的学习习惯');
            }

            section.insights = insights;
        } else {
            section.insights = ['暂无足够数据进行趋势分析，建议继续学习积累数据'];
        }

        // 生成趋势图表
        if (includeCharts && sessions.length > 1) {
            // 学习时间趋势
            const timeData = this.generateTimeSpentTrendChart(sessions);
            section.charts.push({
                type: 'line',
                title: '学习时间趋势',
                data: timeData,
                containerId: 'trends-time-spent'
            });

            // 准确率趋势
            const accuracyData = this.generateAccuracyTrendChart(sessions);
            section.charts.push({
                type: 'line',
                title: '准确率趋势',
                data: accuracyData,
                containerId: 'trends-accuracy'
            });
        }

        return section;
    }

    /**
     * 格式化报告
     */
    async formatReport(report, format) {
        switch (format) {
            case 'html':
                return this.formatAsHTML(report);
            case 'json':
                return JSON.stringify(report, null, 2);
            case 'markdown':
                return this.formatAsMarkdown(report);
            case 'pdf':
                return await this.formatAsPDF(report);
            default:
                return report;
        }
    }

    /**
     * 格式化为HTML
     */
    formatAsHTML(report) {
        let html = `
            <!DOCTYPE html>
            <html lang="zh">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>学习报告 - ${new Date(report.metadata.generatedAt).toLocaleDateString()}</title>
                <style>
                    body { font-family: 'Microsoft YaHei', sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
                    .report-container { max-width: 1200px; margin: 0 auto; }
                    .report-header { text-align: center; margin-bottom: 40px; }
                    .report-title { color: #333; font-size: 2.5em; margin-bottom: 10px; }
                    .report-meta { color: #666; font-size: 1.1em; }
                    .section { margin-bottom: 40px; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                    .section-title { color: #2c5aa0; font-size: 1.8em; margin-bottom: 20px; border-bottom: 2px solid #2c5aa0; padding-bottom: 10px; }
                    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
                    .summary-item { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 6px; }
                    .summary-number { font-size: 2em; font-weight: bold; color: #2c5aa0; }
                    .summary-label { color: #666; margin-top: 5px; }
                    .insights { background: #e8f4f8; padding: 15px; border-radius: 6px; margin: 20px 0; }
                    .insight-item { margin: 10px 0; }
                    .chart-container { margin: 20px 0; text-align: center; }
                    .recommendations { list-style: none; padding: 0; }
                    .recommendation { background: #fff3cd; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #ffc107; }
                    .recommendation.high { border-left-color: #dc3545; background: #f8d7da; }
                    .recommendation.medium { border-left-color: #ffc107; background: #fff3cd; }
                    .recommendation.low { border-left-color: #28a745; background: #d4edda; }
                </style>
            </head>
            <body>
                <div class="report-container">
                    <div class="report-header">
                        <h1 class="report-title">📊 学习报告</h1>
                        <div class="report-meta">
                            报告类型：${this.reportTypes[report.metadata.dateRange.type]?.name || report.metadata.dateRange.type} |
                            生成时间：${new Date(report.metadata.generatedAt).toLocaleString()}
                        </div>
                    </div>
        `;

        // 添加摘要
        if (report.summary) {
            html += `
                <div class="section">
                    <h2 class="section-title">📈 学习摘要</h2>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-number">${report.summary.totalSessions}</div>
                            <div class="summary-label">学习次数</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-number">${report.summary.totalTime}</div>
                            <div class="summary-label">学习时长(分钟)</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-number">${report.summary.averageAccuracy}%</div>
                            <div class="summary-label">平均准确率</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-number">${report.summary.completedGoals}</div>
                            <div class="summary-label">完成目标</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // 添加各个部分
        Object.entries(report.sections).forEach(([sectionType, sectionData]) => {
            if (sectionData) {
                html += this.formatSectionAsHTML(sectionData, sectionType);
            }
        });

        html += `
                </div>
            </body>
            </html>
        `;

        return html;
    }

    /**
     * 格式化部分为HTML
     */
    formatSectionAsHTML(section, sectionType) {
        let html = `<div class="section"><h2 class="section-title">${section.title}</h2>`;

        // 添加洞察
        if (section.insights && section.insights.length > 0) {
            html += '<div class="insights">';
            section.insights.forEach(insight => {
                html += `<div class="insight-item">${insight}</div>`;
            });
            html += '</div>';
        }

        // 添加建议
        if (section.recommendations && section.recommendations.length > 0) {
            html += '<div class="recommendations">';
            section.recommendations.forEach(rec => {
                html += `
                    <div class="recommendation ${rec.priority}">
                        <strong>${rec.title}</strong><br>
                        ${rec.description}<br>
                        <em>建议行动：${rec.action}</em>
                    </div>
                `;
            });
            html += '</div>';
        }

        // 添加图表占位符
        if (section.charts && section.charts.length > 0) {
            section.charts.forEach(chart => {
                html += `
                    <div class="chart-container">
                        <h3>${chart.title}</h3>
                        <div id="${chart.containerId}" style="min-height: 300px; background: #f8f9fa; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #666;">
                            图表将在页面加载后显示
                        </div>
                    </div>
                `;
            });
        }

        html += '</div>';
        return html;
    }

    // 辅助方法

    /**
     * 计算表现指标
     */
    calculatePerformanceMetrics(sessions) {
        if (sessions.length === 0) {
            return {
                averageAccuracy: 0,
                averageSpeed: 0,
                consistency: 0,
                improvement: 0,
                errorRate: 0,
                focusScore: 0
            };
        }

        const totalQuestions = sessions.reduce((sum, s) => sum + (s.content?.questionsAnswered || 0), 0);
        const totalCorrect = sessions.reduce((sum, s) => sum + (s.content?.correctAnswers || 0), 0);
        const accuracies = sessions.map(s => s.performance?.accuracy || 0).filter(a => a > 0);
        const focusScores = sessions.map(s => s.engagement?.attentionScore || 0).filter(f => f > 0);

        return {
            averageAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
            averageSpeed: sessions.reduce((sum, s) => sum + (s.performance?.speed || 0), 0) / sessions.length,
            consistency: this.calculateConsistency(accuracies),
            improvement: this.calculateImprovement(accuracies),
            errorRate: sessions.reduce((sum, s) => sum + (s.performance?.errorRate || 0), 0) / sessions.length,
            focusScore: focusScores.length > 0 ? Math.round(focusScores.reduce((a, b) => a + b, 0) / focusScores.length) : 0
        };
    }

    /**
     * 计算一致性
     */
    calculateConsistency(values) {
        if (values.length < 2) return 0;
        
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        return Math.max(0, 100 - (stdDev / mean) * 100);
    }

    /**
     * 计算改进幅度
     */
    calculateImprovement(values) {
        if (values.length < 2) return 0;
        
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        return secondAvg - firstAvg;
    }

    /**
     * 计算掌握水平
     */
    calculateMasteryLevel(accuracy, sessions) {
        let level = Math.min(accuracy, 100);
        
        // 根据学习次数调整
        if (sessions >= 10) level = Math.min(level + 10, 100);
        else if (sessions >= 5) level = Math.min(level + 5, 100);
        
        return Math.round(level);
    }

    /**
     * 生成每日时间图表数据
     */
    generateDailyTimeChart(sessions) {
        const dailyTime = {};
        
        sessions.forEach(session => {
            const date = new Date(session.startTime).toLocaleDateString();
            dailyTime[date] = (dailyTime[date] || 0) + (session.duration / 60000); // 转换为分钟
        });

        return Object.entries(dailyTime)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, time]) => ({
                label: date,
                value: Math.round(time)
            }));
    }

    /**
     * 生成模块分布图表数据
     */
    generateModuleDistributionChart(sessions) {
        const moduleTime = {};
        
        sessions.forEach(session => {
            const module = session.module || 'unknown';
            moduleTime[module] = (moduleTime[module] || 0) + (session.duration / 60000);
        });

        return Object.entries(moduleTime).map(([module, time]) => ({
            label: module,
            value: Math.round(time)
        }));
    }

    /**
     * 生成准确率趋势图表数据
     */
    generateAccuracyTrendChart(sessions) {
        return sessions
            .filter(s => s.performance?.accuracy > 0)
            .map((session, index) => ({
                label: `第${index + 1}次`,
                value: Math.round(session.performance.accuracy)
            }));
    }

    /**
     * 计算趋势数据
     */
    calculateTrendData(sessions, dateRange) {
        // 这里可以实现更复杂的趋势计算逻辑
        return {
            timeSpent: this.calculateTimeSpentTrend(sessions),
            accuracy: this.calculateAccuracyTrend(sessions),
            frequency: this.calculateFrequencyTrend(sessions)
        };
    }

    /**
     * 计算时间花费趋势
     */
    calculateTimeSpentTrend(sessions) {
        if (sessions.length < 2) return { direction: 'stable', change: 0 };
        
        const firstHalf = sessions.slice(0, Math.floor(sessions.length / 2));
        const secondHalf = sessions.slice(Math.floor(sessions.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, s) => sum + (s.duration || 0), 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, s) => sum + (s.duration || 0), 0) / secondHalf.length;
        
        const change = ((secondAvg - firstAvg) / firstAvg) * 100;
        
        return {
            direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
            change: Math.round(change)
        };
    }

    /**
     * 计算准确率趋势
     */
    calculateAccuracyTrend(sessions) {
        const accuracySessions = sessions.filter(s => s.performance?.accuracy > 0);
        if (accuracySessions.length < 2) return { direction: 'stable', change: 0 };
        
        const firstHalf = accuracySessions.slice(0, Math.floor(accuracySessions.length / 2));
        const secondHalf = accuracySessions.slice(Math.floor(accuracySessions.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, s) => sum + s.performance.accuracy, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, s) => sum + s.performance.accuracy, 0) / secondHalf.length;
        
        const change = secondAvg - firstAvg;
        
        return {
            direction: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
            change: Math.round(change)
        };
    }

    /**
     * 计算频率趋势
     */
    calculateFrequencyTrend(sessions) {
        if (sessions.length < 2) return { direction: 'stable', change: 0 };
        
        // 简化的频率计算
        const totalDays = Math.ceil((sessions[sessions.length - 1].startTime - sessions[0].startTime) / (24 * 60 * 60 * 1000));
        const frequency = sessions.length / totalDays;
        
        return {
            direction: frequency > 0.5 ? 'up' : frequency < 0.2 ? 'down' : 'stable',
            change: Math.round(frequency * 100)
        };
    }

    /**
     * 生成成就时间线数据
     */
    generateAchievementTimeline(achievements) {
        const timeline = {};
        
        achievements.forEach(achievement => {
            const date = new Date(achievement.unlockedAt).toLocaleDateString();
            timeline[date] = (timeline[date] || 0) + 1;
        });

        return Object.entries(timeline)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, count]) => ({
                label: date,
                value: count
            }));
    }

    /**
     * 导出报告
     */
    async exportReport(report, filename = null) {
        const name = filename || `学习报告_${new Date().toISOString().split('T')[0]}.html`;
        
        const blob = new Blob([report], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.LearningReportGenerator = LearningReportGenerator;
    console.log('📊 学习报告生成器已加载');
}
