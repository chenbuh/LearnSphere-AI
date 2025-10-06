/**
 * 高级学习分析系统
 * 提供深度学习数据分析、预测性分析和个性化洞察
 */

class AdvancedAnalytics {
    constructor() {
        this.analyticsData = {
            learningPatterns: {},
            performanceMetrics: {},
            predictions: {},
            insights: []
        };
        
        // 优化：性能统计
        this.stats = {
            analysisCount: 0,
            cacheHits: 0,
            cacheMisses: 0,
            avgAnalysisTime: 0
        };
        
        // 优化：分析结果缓存
        this.analysisCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5分钟
        this.refreshIntervalMs = 60 * 1000; // 1分钟自动刷新
        this.autoRefreshHandle = null;
        
        this.init();
    }

    init() {
        const logger = window.logger || console;
        logger.info('AdvancedAnalytics', '初始化高级学习分析系统...');
        
        try {
            // 初始化图表组件
            this.initializeCharts();
            
            this.setupDataCollection();
            this.loadHistoricalData();
            this.addAnalyticsStyles();
            
            // 优化：设置缓存清理
            this.setupCacheCleanup();
            
            // 延迟加载分析数据
            setTimeout(() => {
                this.loadAnalyticsData();
            }, 200);
            
            logger.info('AdvancedAnalytics', '高级学习分析系统已初始化');
        } catch (error) {
            logger.error('AdvancedAnalytics', '初始化失败:', error);
        }
        
        // 订阅数据更新事件（若其他模块触发）
        try {
            window.addEventListener('learning-data-updated', () => this.refreshAll());
            window.addEventListener('storage', (e) => {
                if (e.key === 'progress_data' || e.key === 'study_sessions') {
                    this.refreshAll();
                }
            });
            // 订阅设置变化：学习分析自动刷新
            document.addEventListener('settings:analyticsAutoRefresh', (e) => {
                const enabled = !!(e.detail && e.detail.enabled);
                if (enabled) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });
        } catch (err) { /* 忽略 */ }

        // 页面退出时停止自动刷新，避免泄漏
        try {
            window.addEventListener('beforeunload', () => this.stopAutoRefresh());
        } catch (err) { /* 忽略 */ }
    }

    /**
     * 设置缓存清理
     */
    setupCacheCleanup() {
        setInterval(() => {
            const now = Date.now();
            const keysToDelete = [];
            
            this.analysisCache.forEach((value, key) => {
                if (now - value.timestamp > this.cacheTimeout) {
                    keysToDelete.push(key);
                }
            });
            
            keysToDelete.forEach(key => this.analysisCache.delete(key));
            
            if (keysToDelete.length > 0 && window.logger) {
                window.logger.debug('AdvancedAnalytics', `清理了 ${keysToDelete.length} 个过期缓存`);
            }
        }, this.cacheTimeout);
    }

    /**
     * 加载历史数据（优化版）
     */
    async loadHistoricalData() {
        const logger = window.logger || console;
        
        try {
            // 优化：使用Storage系统
            let data = null;
            if (window.Storage) {
                data = await window.Storage.get('advancedAnalyticsData');
            } else {
                const historicalData = localStorage.getItem('advancedAnalyticsData');
                if (historicalData) {
                    data = JSON.parse(historicalData);
                }
            }
            
            if (data) {
                this.analyticsData = { ...this.analyticsData, ...data };
                logger.info('AdvancedAnalytics', '历史数据已加载');
            } else {
                logger.info('AdvancedAnalytics', '未找到历史数据，使用默认配置');
            }
        } catch (error) {
            logger.error('AdvancedAnalytics', '加载历史数据失败:', error);
        }
    }

    /**
     * 获取会话数据（基于真实学习记录）
     */
    async getSessionData() {
        // 尝试从统一统计管理器获取数据
        if (window.unifiedStatisticsManager) {
            try {
                const recentSessions = await window.unifiedStatisticsManager.getFilteredSessions('all');
                if (recentSessions && recentSessions.length > 0) {
                    const totalStudyTime = recentSessions.reduce((sum, session) => {
                        return sum + (session.duration || 0);
                    }, 0);
                    const avgStudyTime = Math.round(totalStudyTime / recentSessions.length);

                    const accuracyData = recentSessions.filter(s => s.performance?.accuracy !== undefined);
                    const avgAccuracy = accuracyData.length > 0
                        ? Math.round(accuracyData.reduce((sum, s) => sum + s.performance.accuracy, 0) / accuracyData.length)
                        : 0;

                    return {
                        studyTime: avgStudyTime,
                        accuracy: avgAccuracy,
                        completedTasks: recentSessions.length
                    };
                }
            } catch (error) {
                console.warn('从统一统计管理器获取数据失败:', error);
            }
        }

        // 回退到旧的数据获取方式
        const studySessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
        const learningActivities = JSON.parse(localStorage.getItem('learning_activities') || '[]');

        if (studySessions.length === 0) {
            return {
                studyTime: 0,
                accuracy: 0,
                completedTasks: 0
            };
        }

        // 计算平均学习时间
        const totalStudyTime = studySessions.reduce((sum, session) => {
            return sum + (session.duration || 0);
        }, 0);
        const avgStudyTime = Math.round(totalStudyTime / studySessions.length);

        // 计算平均准确率
        const accuracyData = studySessions.filter(s => s.score !== undefined);
        const avgAccuracy = accuracyData.length > 0
            ? Math.round(accuracyData.reduce((sum, s) => sum + s.score, 0) / accuracyData.length)
            : 0;

        // 计算完成任务数
        const completedTasks = learningActivities.length + studySessions.length;

        return {
            studyTime: avgStudyTime,
            accuracy: avgAccuracy,
            completedTasks: completedTasks
        };
    }

    /**
     * 保存分析数据（优化版）
     */
    async saveAnalyticsData() {
        const logger = window.logger || console;
        
        try {
            // 优化：使用Storage系统
            if (window.Storage) {
                await window.Storage.set('advancedAnalyticsData', this.analyticsData);
            } else {
                localStorage.setItem('advancedAnalyticsData', JSON.stringify(this.analyticsData));
            }
            logger.debug('AdvancedAnalytics', '分析数据已保存');
        } catch (error) {
            logger.error('AdvancedAnalytics', '保存分析数据失败:', error);
        }
    }

    /**
     * 获取分析统计
     */
    getStats() {
        const hitRate = this.stats.analysisCount > 0
            ? ((this.stats.cacheHits / this.stats.analysisCount) * 100).toFixed(2)
            : 0;
        
        return {
            ...this.stats,
            hitRate: `${hitRate}%`,
            cacheSize: this.analysisCache.size
        };
    }

    /**
     * 清理资源
     */
    cleanup() {
        this.analysisCache.clear();
        const logger = window.logger || console;
        logger.info('AdvancedAnalytics', '资源已清理');
    }

    /**
     * 创建分析界面
     */
    createAnalyticsInterface() {
        // 检查是否页面模式的容器存在
        const pageContainer = document.getElementById('analytics-content');
        if (pageContainer) {
            // 页面模式 - 直接在容器中渲染
            this.renderAnalyticsToPage(pageContainer);
            return;
        }
    }

    /**
     * 渲染分析内容到页面（修复语法错误）
     */
    renderAnalyticsToPage(container) {
        container.innerHTML = `
            <div class="analytics-container">
            <div class="analytics-dashboard-page">
                <div class="dashboard-tabs">
                    <button class="tab-btn active" data-tab="overview">📊 概览</button>
                    <button class="tab-btn" data-tab="patterns">📈 学习模式</button>
                    <button class="tab-btn" data-tab="predictions">🔮 预测分析</button>
                    <button class="tab-btn" data-tab="insights">💡 个性化洞察</button>
                    <button class="tab-btn" data-tab="recommendations">🎯 学习建议</button>
                </div>

                <div class="tab-content">
                    <div class="tab-pane active" id="overview-pane">
                        <div class="overview-grid">
                            <div class="metric-card">
                                <div class="metric-icon">📚</div>
                                <div class="metric-value" id="totalStudyTime">125 小时</div>
                                <div class="metric-label">总学习时间</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-icon"></div>
                                <div class="metric-value" id="averageAccuracy">78%</div>
                                <div class="metric-label">平均准确率</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-icon"></div>
                                <div class="metric-value" id="learningVelocity">42 词/天</div>
                                <div class="metric-label">学习速度</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-icon"></div>
                                <div class="metric-value" id="cognitiveLoad">65%</div>
                                <div class="metric-label">认知负荷</div>
                            </div>
                        </div>

                        <div class="charts-grid">
                            <div class="chart-container">
                                <h4>学习进度趋势</h4>
                                <div class="chart-placeholder"> 图表加载中...</div>
                            </div>
                            <div class="chart-container">
                                <h4>技能雷达图</h4>
                                <div class="chart-placeholder"> 图表加载中...</div>
                            </div>
                        </div>
                    </div>

                    <div class="tab-pane" id="patterns-pane">
                        <div class="patterns-section">
                            <h4>时间模式分析</h4>
                            <div class="pattern-item">
                                <strong>最佳学习时间：</strong> 上午 9-11 点（专注度最高）
                            </div>
                            <div class="pattern-item">
                                <strong>学习频率：</strong> 平均每天学习 2.3 小时
                            </div>
                            <div class="pattern-item">
                                <strong>效率波动：</strong> 周一最高，周五最低
                            </div>
                        </div>
                        <div class="patterns-section">
                            <h4>表现模式分析</h4>
                            <div class="pattern-item">
                                <strong>强项技能：</strong> 阅读理解（85%）、词汇记忆（78%）
                            </div>
                            <div class="pattern-item">
                                <strong>薄弱环节：</strong> 语法练习（62%）、听力训练（58%）
                            </div>
                            <div class="pattern-item">
                                <strong>进步趋势：</strong> 整体上升，最近一周提升15%
                            </div>
                        </div>
                        <div class="patterns-section">
                            <h4>行为模式分析</h4>
                            <div class="pattern-item">
                                <strong>学习习惯：</strong> 倾向于短时高频学习
                            </div>
                            <div class="pattern-item">
                                <strong>错误模式：</strong> 复杂语法结构理解困难
                            </div>
                            <div class="pattern-item">
                                <strong>复习规律：</strong> 间隔复习效果显著
                            </div>
                        </div>
                    </div>

                    <div class="tab-pane" id="predictions-pane">
                        <div class="predictions-grid">
                            <div class="prediction-card">
                                <h4>技能提升预测</h4>
                                <div class="prediction-item">
                                    <h5>词汇掌握预测</h5>
                                    <p>按当前进度，预计3个月内掌握核心词汇2000个</p>
                                    <div class="prediction-bar">
                                        <div class="prediction-progress" style="width: 75%"></div>
                                    </div>
                                </div>
                                <div class="prediction-item">
                                    <h5>语法熟练度</h5>
                                    <p>预计6个月达到中级水平，建议加强复合句练习</p>
                                    <div class="prediction-bar">
                                        <div class="prediction-progress" style="width: 60%"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="prediction-card">
                                <h4>学习目标达成</h4>
                                <div class="prediction-item">
                                    <h5>考试准备度</h5>
                                    <p>当前水平可达到预期目标的78%，建议重点提升听力</p>
                                    <div class="prediction-bar">
                                        <div class="prediction-progress" style="width: 78%"></div>
                                    </div>
                                </div>
                                <div class="prediction-item">
                                    <h5>学习目标达成</h5>
                                    <p>按计划学习，预计能够在目标时间内完成85%的学习任务</p>
                                    <div class="prediction-bar">
                                        <div class="prediction-progress" style="width: 85%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="tab-pane" id="insights-pane">
                        <div class="insights-container">
                            <div class="insight-card">
                                <div class="insight-icon"></div>
                                <div class="insight-content">
                                    <h4>学习风格分析</h4>
                                    <p>您是视觉学习者，通过图表和思维导图学习效果更佳。建议使用更多视觉化材料。</p>
                                </div>
                            </div>
                            <div class="insight-card">
                                <div class="insight-icon"></div>
                                <div class="insight-content">
                                    <h4>最佳学习时段</h4>
                                    <p>数据显示您在上午9-11点学习效率最高，建议将重难点内容安排在此时间段。</p>
                                </div>
                            </div>
                            <div class="insight-card">
                                <div class="insight-icon"></div>
                                <div class="insight-content">
                                    <h4>进步空间分析</h4>
                                    <p>语法练习是您当前的最大提升空间，建议每日增加30分钟语法专项练习。</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="tab-pane" id="recommendations-pane">
                        <div class="recommendations-container">
                            <div class="recommendation-card priority-high">
                                <div class="rec-header">
                                    <span class="rec-priority">高优先级</span>
                                    <span class="rec-category">语法提升</span>
                                </div>
                                <h4>加强复合句练习</h4>
                                <p>建议每日练习复合句结构15分钟，重点关注从句和并列句的使用。</p>
                                <div class="rec-actions">
                                    <button class="btn-small btn-primary">开始练习</button>
                                    <button class="btn-small btn-outline">稍后提醒</button>
                                </div>
                            </div>
                            <div class="recommendation-card priority-medium">
                                <div class="rec-header">
                                    <span class="rec-priority">中优先级</span>
                                    <span class="rec-category">听力训练</span>
                                </div>
                                <h4>增加听力材料多样性</h4>
                                <p>尝试不同口音和语速的听力材料，提升听力适应性。</p>
                                <div class="rec-actions">
                                    <button class="btn-small btn-primary">查看资源</button>
                                    <button class="btn-small btn-outline">设置提醒</button>
                                </div>
                            </div>
                            <div class="recommendation-card priority-low">
                                <div class="rec-header">
                                    <span class="rec-priority">低优先级</span>
                                    <span class="rec-category">学习方法</span>
                                </div>
                                <h4>优化复习间隔</h4>
                                <p>采用间隔重复算法，在遗忘临界点进行复习，提升记忆效率。</p>
                                <div class="rec-actions">
                                    <button class="btn-small btn-primary">了解更多</button>
                                    <button class="btn-small btn-outline">应用设置</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="analytics-actions">
                    <button class="btn btn-primary" id="refreshAnalytics">🔄 刷新数据</button>
                    <button class="btn btn-secondary" id="exportReport">📋 导出报告</button>
                    <button class="btn btn-secondary" id="exportSnapshot">🖼️ 导出图片</button>
                    <button class="btn btn-secondary" id="copyShareSummary">📤 复制分享摘要</button>
                </div>
            </div>
            </div>
        `;

        this.bindAnalyticsEvents();
        this.populateOverviewMetrics();
        this.renderCharts();
        this.populatePatterns();
        this.populatePredictions();
        this.populateInsights();
        this.populateRecommendations();
        this.startAutoRefresh();
        console.log('🎨 分析页面已创建');
    }

    /**
     * 使用真实数据填充"概览"指标
     */
    async populateOverviewMetrics() {
        const logger = window.logger || console;
        try {
            const clampPercent = (v) => Math.max(0, Math.min(100, Math.round(v)));
            const num = (x, d = 0) => {
                const n = Number(x);
                return Number.isFinite(n) ? n : d;
            };
            const vocab = window.vocabularyManager?.getStats?.() || {};
            const grammar = window.grammarManager?.getStats?.() || {};
            const listening = window.listeningManager?.getStats?.() || {};
            const reading = window.readingManager?.getStats?.() || {};
            const writing = window.writingManager?.getStats?.() || {};
            const progress = window.progressTracker?.progressData || {};

            // 1) 总学习时间（小时） - 优先使用统一统计管理器；否则回退到旧方式
            let totalHours = 0;

            if (statsManager) {
                try {
                    const recentStats = await statsManager.getStatistics({ timeRange: 'all', detailed: true });
                    if (recentStats && recentStats.overview && typeof recentStats.overview.totalTime === 'number') {
                        totalHours = Math.round(recentStats.overview.totalTime / 60); // 转换为小时
                    }
                } catch (error) {
                    console.warn('从统一统计管理器获取总学习时间失败:', error);
                }
            }

            if (totalHours === 0) {
                // 回退到旧的数据获取方式
                const sessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
                const totalMinutesFromSessions = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
                if (totalMinutesFromSessions > 0) {
                    totalHours = Math.round(totalMinutesFromSessions / 60);
                } else if (progress.overall?.totalStudyTime) {
                    // progress 里可能是分钟
                    const val = progress.overall.totalStudyTime;
                    totalHours = val > 1000 ? Math.round(val / 60) : Math.round(val);
                } else if (listening.overall?.totalMinutes) {
                    totalHours = Math.round((listening.overall.totalMinutes || 0) / 60);
                } else if (listening.hoursListened) {
                    totalHours = Math.round(listening.hoursListened);
                }
            }

            // 2) 平均准确率（%） - 改进计算逻辑，使用真实数据
            const accuracyValues = [];
            
            // 从统一统计管理器获取真实数据
            const statsManager = window.unifiedStatisticsManager;
            if (statsManager) {
                try {
                    const recentStats = await statsManager.getStatistics({ timeRange: 'month', detailed: true });
                    if (recentStats && recentStats.overview && typeof recentStats.overview.averageAccuracy === 'number') {
                        // 使用统一统计管理器的准确率
                        const realAccuracy = recentStats.overview.averageAccuracy;
                        accuracyValues.push(realAccuracy / 100); // 转换为0-1范围
                    }
                } catch (error) {
                    console.warn('获取统一统计数据失败，使用模块数据:', error);
                }
            }
            
            // 如果没有统一统计数据，则从各模块收集
            if (accuracyValues.length === 0) {
                if (typeof vocab.accuracy === 'number' && vocab.accuracy > 0) {
                    accuracyValues.push(num(vocab.accuracy));
                }
                if (typeof grammar.overall?.accuracy === 'number' && grammar.overall.accuracy > 0) {
                    accuracyValues.push(num(grammar.overall.accuracy));
                }
                if (typeof listening.overall?.accuracy === 'number' && listening.overall.accuracy > 0) {
                    accuracyValues.push(num(listening.overall.accuracy));
                }
                if (typeof reading.comprehensionRate === 'number' && reading.comprehensionRate > 0) {
                    accuracyValues.push(num(reading.comprehensionRate));
                }
                if (typeof writing.averageScore === 'number' && writing.averageScore > 0) {
                    accuracyValues.push(num((writing.averageScore || 0) / 100));
                }
            }
            
            // 计算平均准确率
            const avgAccuracy = accuracyValues.length > 0
                ? clampPercent((accuracyValues.reduce((a, b) => a + b, 0) / accuracyValues.length) * 100)
                : 0;

            console.log('📊 平均准确率计算:', {
                accuracyValues,
                avgAccuracy,
                dataSource: accuracyValues.length > 0 ? '真实数据' : '无数据'
            });

            // 3) 学习速度（词/天） - 改进计算，使用真实的学习数据
            let wordsPerDay = 0;
            const totalStudied = typeof vocab.totalStudied === 'number' ? vocab.totalStudied : 0;
            
            // 尝试从统一统计管理器获取更准确的数据
            if (statsManager) {
                try {
                    const recentStats = await statsManager.getStatistics({ timeRange: 'week', detailed: true });
                    if (recentStats && recentStats.overview) {
                        // 使用最近一周的学习数据计算平均速度
                        const weeklyQuestions = recentStats.overview.totalQuestions || 0;
                        wordsPerDay = Math.round(weeklyQuestions / 7);
                    }
                } catch (error) {
                    console.warn('获取学习速度数据失败，使用备用计算:', error);
                }
            }
            
            // 如果没有统一统计数据，使用原有逻辑
            if (wordsPerDay === 0 && totalStudied > 0) {
            const studyDays = progress.overall?.studyDays || 0;
                const denom = studyDays && studyDays > 0 ? studyDays : Math.max(1, Math.round((sessions.length || 1) / 1));
                wordsPerDay = Math.max(0, Math.round(totalStudied / denom));
            }

            // 4) 认知负荷（%） - 改进计算，基于学习难度和错误率
            let cognitiveLoad = 50; // 默认中等负荷
            
            if (avgAccuracy > 0) {
                // 基于准确率计算认知负荷：准确率越低，认知负荷越高
                cognitiveLoad = Math.max(10, Math.min(90, 100 - avgAccuracy));
                
                // 如果有学习会话数据，考虑学习强度
                if (statsManager) {
                    try {
                        const recentSessions = statsManager.getFilteredSessions('week');
                        if (recentSessions && recentSessions.length > 0) {
                            const avgSessionLength = recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / recentSessions.length;
                            // 学习时间过长会增加认知负荷
                            if (avgSessionLength > 60) { // 超过1小时
                                cognitiveLoad = Math.min(90, cognitiveLoad + 10);
                            } else if (avgSessionLength > 30) { // 超过30分钟
                                cognitiveLoad = Math.min(90, cognitiveLoad + 5);
                            }
                        }
                    } catch (error) {
                        console.warn('计算认知负荷时获取会话数据失败:', error);
                    }
                }
            }
            
            cognitiveLoad = clampPercent(cognitiveLoad);
            
            console.log('📊 学习指标计算结果:', {
                totalHours,
                avgAccuracy,
                wordsPerDay,
                cognitiveLoad,
                dataQuality: statsManager ? '统一数据源' : '模块数据源'
            });

            const elTotal = document.getElementById('totalStudyTime');
            const elAcc = document.getElementById('averageAccuracy');
            const elVelocity = document.getElementById('learningVelocity');
            const elCognitive = document.getElementById('cognitiveLoad');
            
            if (elTotal) elTotal.textContent = `${totalHours} 小时`;
            if (elAcc) elAcc.textContent = `${Math.round(avgAccuracy)}%`;
            if (elVelocity) elVelocity.textContent = `${wordsPerDay} 词/天`;
            if (elCognitive) elCognitive.textContent = `${Math.round(cognitiveLoad)}%`;
            
            // 添加数据质量指示器
            if (elAcc && statsManager) {
                elAcc.title = `基于${accuracyValues.length > 0 ? '真实' : '模拟'}数据计算`;
            }
        } catch (error) {
            logger.error('AdvancedAnalytics', '填充概览指标失败:', error);
        }
    }

    /**
     * 强制刷新分析数据
     */
    forceRefresh() {
        console.log('🔄 强制刷新学习分析数据...');
        
        try {
            // 清除缓存
            this.analysisCache.clear();
            
            // 重新加载数据
            this.loadAnalyticsData();
            
            // 触发数据更新事件
            window.dispatchEvent(new CustomEvent('analytics-refreshed', {
                detail: { timestamp: Date.now() }
            }));
            
            console.log('✅ 学习分析数据刷新完成');
            
            // 显示刷新提示
            if (window.app && typeof window.app.showNotification === 'function') {
                window.app.showNotification('学习分析数据已更新', 'success');
            }
            
        } catch (error) {
            console.error('❌ 强制刷新失败:', error);
            if (window.app && typeof window.app.showNotification === 'function') {
                window.app.showNotification('数据刷新失败，请稍后重试', 'error');
            }
        }
    }

    /**
     * 测试图表显示（调试用）
     */
    testChartDisplay() {
        console.log('🧪 测试图表显示...');
        
        const testData = [
            { label: '日', value: 1.2 },
            { label: '一', value: 2.3 },
            { label: '二', value: 1.8 },
            { label: '三', value: 3.1 },
            { label: '四', value: 2.7 },
            { label: '五', value: 1.9 },
            { label: '六', value: 2.4 }
        ];
        
        console.log('🧪 测试数据:', testData);
        console.log('🧪 测试标签:', testData.map(d => d.label));
        
        // 查找图表容器
        const lineBox = document.querySelectorAll('#overview-pane .chart-container')[0];
        if (lineBox) {
            const lineId = this.ensureChartContainerId(lineBox);
            if (lineId) {
                this.createBasicLineChart(lineId, testData, {
                    width: 600,
                    height: 240,
                    lineColor: '#667eea'
                });
                console.log('🧪 测试图表渲染完成');
            }
        }
    }

    /**
     * 加载分析数据（延迟渲染图表）
     */
    loadAnalyticsData() {
        const logger = window.logger || console;
        logger.info('AdvancedAnalytics', '开始加载分析数据...');
        
        try {
            // 延迟渲染图表，确保DOM完全加载
            setTimeout(() => {
                // 指标与图表一起加载
                if (typeof this.populateOverview === 'function') {
                    this.populateOverview();
                } else if (typeof this.populateOverviewMetrics === 'function') {
                    this.populateOverviewMetrics();
                }
                // 关键：调用统一的图表渲染
                if (typeof this.renderCharts === 'function') {
                    this.renderCharts();
                }
                this.populatePatterns();
                this.populatePredictions();
                this.populateRecommendations();
                
                logger.info('AdvancedAnalytics', '分析数据加载完成');
            }, 100); // 100ms延迟确保DOM就绪
            
        } catch (error) {
            logger.error('AdvancedAnalytics', '加载分析数据失败:', error);
        }
    }

    /**
     * 启动/停止自动刷新
     */
    startAutoRefresh() {
        if (this.autoRefreshHandle) return;
        this.autoRefreshHandle = setInterval(() => this.refreshAll(), this.refreshIntervalMs);
    }
    stopAutoRefresh() {
        if (this.autoRefreshHandle) {
            clearInterval(this.autoRefreshHandle);
            this.autoRefreshHandle = null;
        }
    }

    /**
     * 刷新全部模块
     */
    refreshAll() {
        this.populateOverviewMetrics();
        this.renderCharts();
        this.populatePatterns();
        this.populatePredictions();
        this.populateInsights();
        this.populateRecommendations();
    }

    /**
     * 渲染折线图与雷达图（真实数据）
     */
    async renderCharts() {
        const charts = window.chartComponents || new ChartComponents();
        const progress = window.progressTracker?.progressData || {};
        const vocab = window.vocabularyManager?.getStats?.() || {};
        const grammar = window.grammarManager?.getStats?.() || {};
        const listening = window.listeningManager?.getStats?.() || {};
        const reading = window.readingManager?.getStats?.() || {};
        const writing = window.writingManager?.getStats?.() || {};

        // 数值规整工具（局部）
        const num = (x, d = 0) => {
            const n = Number(x);
            return Number.isFinite(n) ? n : d;
        };

        // 学习进度趋势：改进数据处理，使用真实的学习会话数据
        const weekly = new Array(7).fill(0);
        const weeks = 7;
        
        // 从统一统计管理器获取真实的学习会话数据
        const statsManager = window.unifiedStatisticsManager;
        let hasRealData = false;
        
        if (statsManager) {
            try {
                // 获取最近一周的学习会话
                const recentSessions = await statsManager.getFilteredSessions('week');
                console.log('📊 获取到的学习会话数据:', recentSessions);
                
                if (recentSessions && recentSessions.length > 0) {
                    // 按星期几分组统计学习时长或学习次数
                    const now = new Date();
                    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    
                    recentSessions.forEach(session => {
                        const sessionDate = new Date(session.startTime || session.recordedAt || session.timestamp);
                        if (sessionDate >= weekStart) {
                            const dayOfWeek = sessionDate.getDay(); // 0=周日, 1=周一, ...
                            const duration = session.duration || 0; // 学习时长（分钟）
                            const score = session.content?.accuracy || session.content?.correctAnswers || 0;
                            
                            // 使用学习时长作为进度指标（转换为小时）
                            weekly[dayOfWeek] += duration / 60;
                        }
                    });
                    
                    hasRealData = weekly.some(v => v > 0);
                    console.log('📊 真实学习进度数据:', weekly, '有数据:', hasRealData);
                }
            } catch (error) {
                console.warn('获取学习会话数据失败:', error);
            }
        }
        
        // 如果没有真实数据，尝试从各模块的周进度数据获取
        if (!hasRealData) {
            const mergeWeekly = (arr, weight = 0.2) => {
                if (!Array.isArray(arr) || arr.length === 0) return;
                for (let i = 0; i < Math.min(weeks, arr.length); i++) {
                    const value = num(arr[i], 0);
                    if (value > 0) {
                        weekly[i] += value * weight;
                    }
                }
            };

            // 从各模块收集周进度数据
            mergeWeekly(progress.vocabulary?.weeklyProgress, 0.2);
            mergeWeekly(progress.grammar?.weeklyProgress, 0.2);
            mergeWeekly(progress.listening?.weeklyProgress, 0.2);
            mergeWeekly(progress.reading?.weeklyProgress, 0.2);
            mergeWeekly(progress.writing?.weeklyProgress, 0.2);
            
            hasRealData = weekly.some(v => v > 0);
        }

        // 如果仍然没有数据，生成示例数据以显示图表结构
        if (!hasRealData) {
            console.log('📊 没有真实数据，生成示例数据');
            for (let i = 0; i < 7; i++) {
                // 生成更真实的模拟数据，基于正弦波加随机波动
                weekly[i] = Math.max(0, 0.5 + Math.sin(i * 0.8) * 0.3 + (Math.random() - 0.5) * 0.2);
            }
        }

        // 强制生成7天（日~六）的数据顺序，避免后续渲染缺失
        const weekLabels = ['日','一','二','三','四','五','六'];
        const lineData = weekLabels.map((lbl, i) => ({
            label: lbl,
            value: Math.round(num(weekly[i], 0) * 10) / 10
        }));
        
        console.log('📊 最终图表数据:', lineData);
        console.log('📊 图表标签检查:', lineData.map(d => d.label));

        // 确保图表容器存在并渲染
        const lineBox = document.querySelectorAll('#overview-pane .chart-container')[0];
        if (lineBox) {
        const lineId = this.ensureChartContainerId(lineBox);
            if (lineId) {
                try {
                    console.log('📊 开始渲染学习进度趋势图, 容器ID:', lineId);
                    
                    // 优先使用内置的基础图表（更可靠）
                    this.createBasicLineChart(lineId, lineData, {
                        lineColor: '#667eea'
                    });
                    
                    console.log('✅ 学习进度趋势图渲染成功');
                } catch (error) {
                    console.error('❌ 学习进度趋势图渲染失败:', error);
                    // 显示错误提示
                    const container = document.getElementById(lineId);
                    if (container) {
                        container.innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: center; height: 220px; color: #6c757d; border: 1px dashed #dee2e6; border-radius: 8px;">
                                <div style="text-align: center;">
                                    <div style="font-size: 48px; margin-bottom: 10px;">📊</div>
                                    <div>图表渲染失败</div>
                                    <div style="font-size: 12px; margin-top: 5px;">请检查控制台获取详细错误信息</div>
                                </div>
                            </div>
                        `;
                    }
                }
            } else {
                console.warn('⚠️ 无法创建图表容器ID');
            }
        } else {
            console.warn('⚠️ 学习进度趋势图容器未找到');
        }

        // 技能雷达图：改进数据处理和错误处理
        const radarData = [
            { label: '词汇', value: Math.max(0, Math.min(100, Math.round(num(vocab.accuracy, 0.6) * 100))) },
            { label: '语法', value: Math.max(0, Math.min(100, Math.round(num(grammar.overall?.accuracy, 0.7) * 100))) },
            { label: '听力', value: Math.max(0, Math.min(100, Math.round(num(listening.overall?.accuracy, 0.5) * 100))) },
            { label: '阅读', value: Math.max(0, Math.min(100, Math.round(num(reading.comprehensionRate, 0.65) * 100))) },
            { label: '写作', value: Math.max(0, Math.min(100, Math.round(num((writing.averageScore || 65) / 100, 0.65) * 100))) }
        ];

        // 确保雷达图容器存在并渲染
        const radarBox = document.querySelectorAll('#overview-pane .chart-container')[1];
        if (radarBox) {
        const radarId = this.ensureChartContainerId(radarBox);
            if (radarId) {
                try {
                    console.log('📊 开始渲染技能雷达图, 容器ID:', radarId);
                    
                    // 优先使用内置的基础图表（更可靠）
                    this.createBasicRadarChart(radarId, radarData, {
                        strokeColor: '#764ba2',
                        fillColor: 'rgba(118,75,162,0.2)'
                    });
                    
                    console.log('✅ 技能雷达图渲染成功');
                } catch (error) {
                    console.error('❌ 技能雷达图渲染失败:', error);
                    // 显示错误提示
                    const container = document.getElementById(radarId);
                    if (container) {
                        container.innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: center; height: 280px; color: #6c757d; border: 1px dashed #dee2e6; border-radius: 8px;">
                                <div style="text-align: center;">
                                    <div style="font-size: 48px; margin-bottom: 10px;">🎯</div>
                                    <div>雷达图渲染失败</div>
                                    <div style="font-size: 12px; margin-top: 5px;">请检查控制台获取详细错误信息</div>
                                </div>
                            </div>
                        `;
                    }
                }
            } else {
                console.warn('⚠️ 无法创建雷达图容器ID');
            }
        } else {
            console.warn('⚠️ 技能雷达图容器未找到');
        }
    }

    // 确保替换占位容器并返回ID
    ensureChartBox(selector) {
        const el = document.querySelector(selector + ' .chart-placeholder') || document.querySelector(selector);
        const id = 'chart_' + Math.random().toString(36).slice(2, 9);
        if (el) {
            el.id = id;
            el.innerHTML = '';
        }
        return id;
    }

    // 改进：确保容器存在并返回ID（基于节点）
    ensureChartContainerId(node) {
        if (!node) {
            console.warn('⚠️ 图表容器节点不存在');
            return '';
        }
        
        // 查找图表占位符或使用节点本身
        let el = node.querySelector('.chart-placeholder');
        if (!el) {
            el = node.querySelector('div');
        }
        if (!el) {
            el = node;
        }

        // 生成唯一ID
        if (!el.id) {
            el.id = 'chart_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
        }

        // 清空内容并设置基本样式
        el.innerHTML = '';
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.minHeight = '260px'; // 增加最小高度，确保图表有足够空间
        // 关键：移除占位符默认的内边距，避免内容溢出到虚线外
        try { el.style.padding = '0'; } catch (e) {}
        // 防止覆盖层或标签越出虚线边框
        el.style.overflow = 'hidden';
        // 移除虚线边框样式，因为我们要显示图表而不是虚线框
        el.style.border = 'none';
        el.style.borderRadius = '0';
        // 关键：为后续HTML标签覆盖层提供定位上下文
        if (!el.style.position) {
            el.style.position = 'relative';
        }
        
        console.log('📊 图表容器已准备:', el.id);
        return el.id;
    }

    /**
     * 学习模式（真实数据）
     */
    populatePatterns() {
        const mgr = window.aiRecommendationManager || new AIRecommendationManager();
        const p = mgr.learningPatterns || {};
        const pane = document.getElementById('patterns-pane');
        if (!pane) return;
        // 简单替换静态文本
        const items = pane.querySelectorAll('.patterns-section .pattern-item');
        if (items[0]) items[0].innerHTML = `<strong>最佳学习时间：</strong> ${p.preferredTime || 'morning'}`;
        if (items[1]) items[1].innerHTML = `<strong>学习频率：</strong> 每天 ${ (p.learningFrequency || 0).toFixed(1) } 次`;
        if (items[2]) items[2].innerHTML = `<strong>效率波动：</strong> 一致性 ${ Math.round((p.consistencyScore || 0) * 100) }%`;
        const perf = pane.querySelectorAll('.patterns-section')[1]?.querySelectorAll('.pattern-item');
        if (perf && perf[0]) perf[0].innerHTML = `<strong>强项技能：</strong> ${p.strongestSkill || '-'}`;
        if (perf && perf[1]) perf[1].innerHTML = `<strong>薄弱环节：</strong> ${p.weakestSkill || '-'}`;
        if (perf && perf[2]) perf[2].innerHTML = `<strong>进步趋势：</strong> ${(p.improvementRate || 0) >= 0 ? '上升' : '下降'} (${Math.round((p.improvementRate || 0) * 100)}%)`;
    }

    /**
     * 预测分析（真实数据占位，结合学习目标）
     */
    populatePredictions() {
        const mgr = window.aiRecommendationManager || new AIRecommendationManager();
        const goals = mgr.userProfile?.goals || {};
        const pane = document.getElementById('predictions-pane');
        if (!pane) return;

        const progress = window.progressTracker?.progressData || {};
        const vocabStats = window.vocabularyManager?.getStats?.() || {};
        const grammarStats = window.grammarManager?.getStats?.() || {};
        const listeningStats = window.listeningManager?.getStats?.() || {};
        const readingStats = window.readingManager?.getStats?.() || {};
        const writingStats = window.writingManager?.getStats?.() || {};

        const clampPercent = (v) => Math.max(0, Math.min(100, Math.round(v)));
        const num = (x, d = 0) => {
            const n = Number(x);
            return Number.isFinite(n) ? n : d;
        };

        // ---- 1) 词汇掌握预测（3个月） ----
        const vocabPd = progress.vocabulary || {};
        const totalWordsGoal = Math.max(1000, Math.min( (vocabPd.total || 2000), 5000));
        const learned = Number(vocabPd.learned || vocabStats.totalStudied || 0);
        const dailyGoal = Number(vocabPd.dailyGoal || 30);
        const projectedWords = Math.min(learned + dailyGoal * 90, totalWordsGoal);
        const vocabPct = clampPercent((projectedWords / totalWordsGoal) * 100);
        // 写入UI
        const vocabItem = pane.querySelector('.prediction-card:first-child .prediction-item:nth-child(1) p');
        if (vocabItem) {
            vocabItem.textContent = `按当前计划，预计3个月内新增 ${projectedWords - learned} 个核心词汇（当前 ${learned}/${totalWordsGoal}）`;
        }
        const vocabBar = pane.querySelector('.prediction-card:first-child .prediction-item:nth-child(1) .prediction-progress');
        if (vocabBar) {
            vocabBar.style.width = `${Math.max(5, Math.min(100, vocabPct))}%`;
        }

        // ---- 2) 语法熟练度预测（6个月） ----
        const gramPd = progress.grammar || {};
        const topicsCompleted = Number(gramPd.topicsCompleted || 0);
        const totalTopics = Number(gramPd.totalTopics || 20);
        const weekly = Array.isArray(gramPd.weeklyProgress) ? gramPd.weeklyProgress : [];
        const avgTopicsPerWeek = weekly.length ? (weekly.reduce((a,b)=>a+(b||0),0) / weekly.length) : 1;
        const projectedTopics = Math.min(totalTopics, topicsCompleted + Math.round(avgTopicsPerWeek * 26));
        const grammarAccuracy = num(grammarStats.overall?.accuracy || gramPd.accuracy, 0);
        const grammarPct = clampPercent((projectedTopics / totalTopics) * 100 * (0.6 + 0.4 * grammarAccuracy));
        const gramItem = pane.querySelector('.prediction-card:first-child .prediction-item:nth-child(2) p');
        if (gramItem) {
            gramItem.textContent = `预计6个月覆盖 ${projectedTopics}/${totalTopics} 个语法主题，当前准确率 ${(Math.round(grammarAccuracy*100))}%`;
        }
        const gramBar = pane.querySelector('.prediction-card:first-child .prediction-item:nth-child(2) .prediction-progress');
        if (gramBar) {
            gramBar.style.width = `${Math.max(5, Math.min(100, grammarPct))}%`;
        }

        // ---- 3) 考试准备度 ----
        // 根据考试类型应用权重
        const weightsByExam = {
            ielts:   { vocab: 0.2, grammar: 0.2, listening: 0.25, reading: 0.2, writing: 0.15 },
            toefl:   { vocab: 0.2, grammar: 0.2, listening: 0.2, reading: 0.2, writing: 0.2 },
            cet4:    { vocab: 0.25, grammar: 0.25, listening: 0.2, reading: 0.2, writing: 0.1 },
            cet6:    { vocab: 0.25, grammar: 0.25, listening: 0.2, reading: 0.2, writing: 0.1 },
            default: { vocab: 0.22, grammar: 0.22, listening: 0.2, reading: 0.2, writing: 0.16 }
        };
        const examKey = String(goals.examType || 'default').toLowerCase();
        const w = weightsByExam[examKey] || weightsByExam.default;
        const acc = {
            vocab: num(vocabStats.accuracy, 0),
            grammar: num(grammarStats.overall?.accuracy, 0),
            listening: num(listeningStats.overall?.accuracy, 0),
            reading: num(readingStats.comprehensionRate, 0),
            writing: num((writingStats.averageScore || 0) / 100, 0)
        };
        const readiness = clampPercent((acc.vocab*w.vocab + acc.grammar*w.grammar + acc.listening*w.listening + acc.reading*w.reading + acc.writing*w.writing) * 100);
        const examBar = pane.querySelector('.prediction-card:nth-child(2) .prediction-item:nth-child(1) .prediction-progress');
        if (examBar) examBar.style.width = `${Math.max(5, Math.min(100, readiness))}%`;
        const examText = pane.querySelector('.prediction-card:nth-child(2) .prediction-item:nth-child(1) p');
        if (examText) {
            const weak = mgr.learningPatterns?.weakestSkill || 'listening';
            examText.textContent = `当前综合准备度约 ${readiness}% ，建议优先提升 ${weak}。`;
        }

        // ---- 4) 学习目标达成（按时间框架） ----
        const timeframe = Number(goals.timeframe || 90); // 天
        const studyDays = Number(progress.overall?.studyDays || 0);
        const consistency = Number(mgr.learningPatterns?.consistencyScore || 0.5);
        const progressRate = Math.min(1, (studyDays / Math.max(1, timeframe)) * (0.6 + 0.4 * consistency));
        const goalPct = clampPercent(progressRate * 100);
        const goalBar = pane.querySelector('.prediction-card:nth-child(2) .prediction-item:nth-child(2) .prediction-progress');
        if (goalBar) goalBar.style.width = `${Math.max(5, Math.min(100, goalPct))}%`;
        const goalText = pane.querySelector('.prediction-card:nth-child(2) .prediction-item:nth-child(2) p');
        if (goalText) {
            goalText.textContent = `按计划学习，预计在目标时间内完成约 ${goalPct}% 的学习任务（已学习天数 ${studyDays}/${timeframe}）。`;
        }
    }

    /**
     * 个性化洞察（来自 AIRecommendationManager）
     */
    populateInsights() {
        const mgr = window.aiRecommendationManager || new AIRecommendationManager();
        const tips = mgr.getPersonalizedTips?.() || [];
        const container = document.querySelector('#insights-pane .insights-container');
        if (!container || tips.length === 0) return;
        container.innerHTML = tips.slice(0, 6).map(t => `
            <div class="insight-card">
                <div class="insight-icon">${t.icon || '💡'}</div>
                <div class="insight-content">
                    <h4>${t.title || '学习洞察'}</h4>
                    <p>${t.message || t.tip || '基于你的学习数据的个性化洞察'}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * 学习建议（来自 AIRecommendationManager）
     */
    populateRecommendations() {
        const mgr = window.aiRecommendationManager || new AIRecommendationManager();
        const recs = mgr.getRecommendations?.(6) || [];
        const container = document.querySelector('#recommendations-pane .recommendations-container');
        if (!container || recs.length === 0) return;
        const typeTitle = {
            weakness: '薄弱点提升',
            frequency: '学习频率建议',
            duration: '学习时长建议',
            break: '休息策略建议',
            focus: '学习重心调整',
            exam: '考试准备建议',
            'exam-specific': '考试专项建议',
            consistency: '坚持度提升',
            praise: '表现鼓励',
            strength: '优势强化',
            progress: '进步巩固',
            adjustment: '策略调整'
        };
        container.innerHTML = recs.map(rec => `
            <div class="recommendation-card priority-${rec.priority}">
                <div class="rec-header">
                    <span class="rec-priority">${rec.priority === 'high' ? '高' : rec.priority === 'medium' ? '中' : '低'}优先级</span>
                    <span class="rec-category">${typeTitle[rec.type] || rec.type}</span>
                </div>
                <h4>${rec.title || typeTitle[rec.type] || '个性化建议'}</h4>
                <p>${rec.description || rec.suggestion || rec.detail || '根据你的学习数据生成的建议'}</p>
                <div class="rec-actions">
                    <button class="btn-small btn-primary">开始执行</button>
                    <button class="btn-small btn-outline">稍后提醒</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * 绑定分析事件
     */
    bindAnalyticsEvents() {
        // 标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 刷新分析
        const refreshBtn = document.getElementById('refreshAnalytics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshAnalytics();
            });
        }

        // 导出报告
        const exportBtn = document.getElementById('exportReport');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportAnalyticsReport();
            });
        }

        // 导出图片快照
        const exportImgBtn = document.getElementById('exportSnapshot');
        if (exportImgBtn) {
            exportImgBtn.addEventListener('click', () => this.exportSnapshot());
        }

        // 复制分享摘要
        const copyShareBtn = document.getElementById('copyShareSummary');
        if (copyShareBtn) {
            copyShareBtn.addEventListener('click', () => this.copyShareSummary());
        }
    }

    /**
     * 切换标签页
     */
    switchTab(tabName) {
        // 更新标签按钮状态
        const tabButtons = document.querySelectorAll('.dashboard-tabs .tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // 更新标签页内容
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
        });

        const targetPane = document.getElementById(`${tabName}-pane`);
        if (targetPane) {
            targetPane.classList.add('active');
        }
    }

    /**
     * 刷新分析数据
     */
    refreshAnalytics() {
        console.log('🔄 刷新分析数据...');
        this.refreshAll();
        if (window.Notification) {
            window.Notification.success('✅ 分析数据已更新', { duration: 2000 });
        }
    }

    /**
     * 导出分析报告
     */
    exportAnalyticsReport() {
        const report = {
            timestamp: new Date().toISOString(),
            data: this.analyticsData,
            summary: '学习分析报告'
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `learning-analytics-${Date.now()}.json`;
        a.click();
        
        console.log('📋 分析报告已导出');
    }

    /**
     * 导出图片快照（无需外部库，使用SVG序列化 + html2canvas兜底）
     */
    async exportSnapshot() {
        try {
            const container = document.querySelector('.analytics-dashboard-page');
            if (!container) return;

            // 优先尝试使用HTMLCanvasElement的drawWindow（大多数浏览器不支持，跳过）
            // 使用轻量兜底：将当前容器的HTML序列化为SVG外壳，再转成PNG
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            const serialized = new XMLSerializer().serializeToString(container.cloneNode(true));
            const svg = `<?xml version="1.0" standalone="no"?>\n` +
                `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
                `<foreignObject width="100%" height="100%">` +
                `<div xmlns="http://www.w3.org/1999/xhtml">${serialized}</div>` +
                `</foreignObject></svg>`;
            const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
                canvas.toBlob((pngBlob) => {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(pngBlob);
                    a.download = `learning-analytics-snapshot-${Date.now()}.png`;
                    a.click();
                }, 'image/png');
            };
            img.src = url;
        } catch (error) {
            console.error('导出图片失败:', error);
            if (window.Notification) {
                window.Notification.error('导出图片失败');
            }
        }
    }

    /**
     * 复制分享摘要到剪贴板
     */
    async copyShareSummary() {
        try {
            const stats = {
                overview: {
                    total: document.getElementById('totalStudyTime')?.textContent || '',
                    accuracy: document.getElementById('averageAccuracy')?.textContent || '',
                    velocity: document.getElementById('learningVelocity')?.textContent || '',
                    load: document.getElementById('cognitiveLoad')?.textContent || ''
                }
            };
            const text = `学习分析摘要\n` +
                `- 总学习时间: ${stats.overview.total}\n` +
                `- 平均准确率: ${stats.overview.accuracy}\n` +
                `- 学习速度: ${stats.overview.velocity}\n` +
                `- 认知负荷: ${stats.overview.load}`;
            await navigator.clipboard.writeText(text);
            if (window.Notification) {
                window.Notification.success('已复制学习分享摘要');
            }
        } catch (error) {
            console.error('复制分享摘要失败:', error);
            if (window.Notification) {
                window.Notification.error('复制分享摘要失败');
            }
        }
    }

    /**
     * 设置数据收集
     */
    setupDataCollection() {
        console.log('📡 数据收集已设置');

        // 调试：添加一些测试数据（仅用于开发测试）
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            this.addTestData();
        }
    }

    /**
     * 添加测试数据（仅用于开发调试）
     */
    addTestData() {
        try {
            const statsManager = window.unifiedStatisticsManager;
            if (!statsManager) return;

            // 检查是否已有数据
            statsManager.getFilteredSessions('all').then(sessions => {
                if (sessions && sessions.length === 0) {
                    console.log('📊 添加测试数据用于调试...');

                    // 生成过去7天的测试数据
                    const now = Date.now();
                    const dayMs = 24 * 60 * 60 * 1000;

                    for (let i = 6; i >= 0; i--) {
                        const sessionDate = new Date(now - i * dayMs);
                        const duration = Math.floor(Math.random() * 60) + 30; // 30-90分钟，更合理
                        const accuracy = Math.floor(Math.random() * 30) + 70; // 70-100%，更合理

                        const sessionData = {
                            module: ['vocabulary', 'grammar', 'listening', 'reading'][Math.floor(Math.random() * 4)],
                            duration: duration * 60 * 1000, // 转换为毫秒
                            startTime: sessionDate.getTime(),
                            content: {
                                questionsAnswered: Math.floor(Math.random() * 15) + 5,
                                correctAnswers: Math.floor(Math.random() * 10) + 3,
                                accuracy: accuracy / 100
                            },
                            performance: {
                                accuracy: accuracy / 100
                            }
                        };

                        statsManager.recordSession(sessionData);
                    }

                    console.log('✅ 测试数据添加完成');

                    // 强制刷新图表以显示新数据
                    setTimeout(() => {
                        this.refreshAll();
                    }, 1000);
                }
            });
        } catch (error) {
            console.warn('添加测试数据失败:', error);
        }
    }

    /**
     * 添加分析样式
     */
    addAnalyticsStyles() {
        if (document.getElementById('analytics-page-styles')) return;

        const pageStyles = document.createElement('style');
        pageStyles.id = 'analytics-page-styles';
        pageStyles.textContent = `
            .analytics-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
            }

            .analytics-dashboard-page {
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                overflow: hidden;
            }

            .dashboard-tabs {
                display: flex;
                background: #f8f9fa;
                border-bottom: 1px solid #e0e0e0;
                overflow-x: auto;
            }

            .dashboard-tabs .tab-btn {
                padding: 1rem 1.5rem;
                background: none;
                border: none;
                color: #6c757d;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                transition: all 0.3s ease;
                white-space: nowrap;
                flex-shrink: 0;
            }

            .dashboard-tabs .tab-btn:hover {
                color: #667eea;
                background: rgba(102, 126, 234, 0.05);
            }

            .dashboard-tabs .tab-btn.active {
                color: #667eea;
                border-bottom-color: #667eea;
                background: white;
            }

            .tab-content {
                padding: 2rem;
                min-height: 600px;
            }

            .tab-pane {
                display: none;
            }

            .tab-pane.active {
                display: block;
            }

            .overview-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .metric-card {
                background: white;
                padding: 1.5rem;
                border-radius: 12px;
                text-align: center;
                border: 1px solid #e0e0e0;
                transition: transform 0.2s ease;
            }

            .metric-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .metric-icon {
                font-size: 2.5rem;
                margin-bottom: 0.5rem;
            }

            .metric-value {
                font-size: 2rem;
                font-weight: 700;
                color: #333;
                margin-bottom: 0.3rem;
            }

            .metric-label {
                color: #6c757d;
                font-size: 0.9rem;
                font-weight: 500;
            }

            .charts-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 2rem;
                margin-bottom: 2rem;
            }

            .chart-container {
                background: white;
                padding: 1.5rem;
                border-radius: 12px;
                border: 2px dashed #e0e0e0;
                position: relative;
            }

            .chart-container h4 {
                margin-bottom: 1rem;
                color: #333;
                font-size: 1.1rem;
            }

            .chart-placeholder {
                padding: 3rem;
                text-align: center;
                color: #999;
                font-size: 1.1rem;
                border: 2px dashed #e0e0e0;
                border-radius: 8px;
            }

            .patterns-section,
            .prediction-card {
                background: white;
                padding: 1.5rem;
                border-radius: 12px;
                border: 1px solid #e0e0e0;
                margin-bottom: 1.5rem;
            }

            .patterns-section h4,
            .prediction-card h4 {
                margin-bottom: 1rem;
                color: #333;
                font-size: 1.1rem;
            }

            .pattern-item {
                padding: 0.75rem 0;
                border-bottom: 1px solid #f0f0f0;
            }

            .pattern-item:last-child {
                border-bottom: none;
            }

            .predictions-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 2rem;
            }

            .prediction-item {
                margin-bottom: 1.5rem;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 8px;
            }

            .prediction-item h5 {
                margin-bottom: 0.5rem;
                color: #333;
            }

            .prediction-bar {
                height: 8px;
                background: #e0e0e0;
                border-radius: 4px;
                margin-top: 0.5rem;
                overflow: hidden;
            }

            .prediction-progress {
                height: 100%;
                background: linear-gradient(90deg, #667eea, #764ba2);
                transition: width 0.5s ease;
            }

            .insights-container,
            .recommendations-container {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .insight-card {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                padding: 1.5rem;
                background: white;
                border-radius: 12px;
                border: 1px solid #e0e0e0;
                transition: transform 0.2s ease;
            }

            .insight-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .insight-icon {
                font-size: 2rem;
                flex-shrink: 0;
            }

            .insight-content h4 {
                margin: 0 0 0.5rem 0;
                color: #333;
                font-size: 1.1rem;
            }

            .insight-content p {
                margin: 0;
                color: #666;
                line-height: 1.5;
            }

            .recommendation-card {
                background: white;
                border-radius: 12px;
                border: 1px solid #e0e0e0;
                padding: 1.5rem;
                transition: transform 0.2s ease;
            }

            .recommendation-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .rec-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }

            .rec-priority {
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 500;
            }

            .priority-high .rec-priority {
                background: #ffebee;
                color: #d32f2f;
            }

            .priority-medium .rec-priority {
                background: #fff3e0;
                color: #f57c00;
            }

            .priority-low .rec-priority {
                background: #e8f5e8;
                color: #388e3c;
            }

            .rec-category {
                background: #e3f2fd;
                color: #1976d2;
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.8rem;
            }

            .recommendation-card h4 {
                margin: 0 0 0.5rem 0;
                color: #333;
                font-size: 1.1rem;
            }

            .recommendation-card p {
                margin: 0 0 1rem 0;
                color: #666;
                line-height: 1.5;
            }

            .rec-actions {
                display: flex;
                gap: 0.5rem;
            }

            .btn-small {
                padding: 0.5rem 1rem;
                border-radius: 6px;
                border: none;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .btn-small.btn-primary {
                background: #667eea;
                color: white;
            }

            .btn-small.btn-outline {
                background: white;
                color: #667eea;
                border: 1px solid #667eea;
            }

            .analytics-actions {
                display: flex;
                justify-content: center;
                gap: 1rem;
                padding: 1.5rem;
                background: #f8f9fa;
                border-top: 1px solid #e0e0e0;
            }

            .analytics-actions .btn {
                padding: 0.75rem 2rem;
                border-radius: 8px;
                border: none;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .analytics-actions .btn-primary {
                background: #667eea;
                color: white;
            }

            .analytics-actions .btn-primary:hover {
                background: #5a6fd8;
                transform: translateY(-1px);
            }

            .analytics-actions .btn-secondary {
                background: white;
                color: #6c757d;
                border: 1px solid #e0e0e0;
            }

            .analytics-actions .btn-secondary:hover {
                background: #f8f9fa;
                transform: translateY(-1px);
            }

            .error-message {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 4rem 2rem;
                text-align: center;
                background: white;
                border-radius: 12px;
                border: 1px solid #ffebee;
                margin: 2rem;
            }

            .error-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }

            .error-message h3 {
                color: #d32f2f;
                margin-bottom: 1rem;
                font-size: 1.5rem;
            }

            .error-message p {
                color: #666;
                margin-bottom: 2rem;
                max-width: 400px;
                line-height: 1.6;
            }

            .error-message .btn {
                padding: 0.75rem 2rem;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            @media (max-width: 768px) {
                .analytics-container { padding: 1rem; }
                .tab-content { padding: 1rem; }
                .overview-grid { grid-template-columns: repeat(2, 1fr); }
                .charts-grid, .predictions-grid { grid-template-columns: 1fr; }
                .analytics-actions { flex-direction: column; }
            }
        `;

        document.head.appendChild(pageStyles);
    }

    /**
     * 初始化图表组件
     */
    initializeCharts() {
        // 确保图表组件可用
        if (!window.chartComponents) {
            if (window.ChartComponents) {
                window.chartComponents = new window.ChartComponents();
                console.log('✅ 图表组件已初始化');
            } else {
                console.warn('⚠️ 图表组件未找到，尝试创建基础图表功能');
                // 创建基础图表功能
                window.chartComponents = {
                    createLineChart: this.createBasicLineChart.bind(this),
                    createRadarChart: this.createBasicRadarChart.bind(this)
                };
            }
        }
    }

    /**
     * 创建基础折线图（备用方案）
     */
    createBasicLineChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('图表容器不存在:', containerId);
            return;
        }

        // 调整尺寸以适应虚线容器
        // 注意：容器已经有padding 1.5rem，需要减去这个padding
        const computedStyle = window.getComputedStyle(container);
        const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
        const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

        const containerWidth = container.clientWidth - paddingLeft - paddingRight;
        const containerHeight = container.clientHeight - paddingTop - paddingBottom;
        const width = Math.min(containerWidth, 580); // 留出边距
        const height = Math.min(containerHeight, 220); // 留出边距

        // 标准化一周数据，确保包含7天（日~六）
        try {
            const weekLabels = ['日','一','二','三','四','五','六'];
            const allWeekLabels = (arr) => Array.isArray(arr) && arr.every(p => p && weekLabels.includes(String(p.label)));
            if (Array.isArray(data) && data.length > 0) {
                if (data.length !== 7 && allWeekLabels(data)) {
                    const map = Object.create(null);
                    data.forEach(p => { map[String(p.label)] = Number(p.value) || 0; });
                    data = weekLabels.map(lbl => ({ label: lbl, value: map[lbl] ?? 0 }));
                    console.log('ℹ️ 已按星期标签补全数据到7天:', data);
                }
            }
        } catch (e) {
            console.warn('标准化周数据失败（忽略）：', e);
        }

        console.log('📊 创建基础折线图:', { containerId, dataLength: Array.isArray(data) ? data.length : 0, width, height });

        // 创建Canvas元素
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.maxWidth = '100%';
        canvas.style.display = 'block';
        
        const ctx = canvas.getContext('2d');
        // 调整为容器内绘图，不触碰虚线边框
        const padding = 40; // 留出足够内边距，避免贴边
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // 计算数据范围
        const values = data.map(d => d.value);
        const maxValue = Math.max(...values, 1); // 至少为1避免除零
        const minValue = Math.min(...values, 0);
        const valueRange = maxValue - minValue || 1;
        
        console.log('📊 图表数据范围:', { values, maxValue, minValue, valueRange });
        
        // 提取配置选项
        const lineColor = options.lineColor || '#667eea';
        const fillColor = options.fillColor || 'rgba(102, 126, 234, 0.1)';
        
        // 清除画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制网格
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        
        // 水平网格线
        for (let i = 0; i <= 4; i++) {
            const y = padding + (i / 4) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // 垂直网格线
        for (let i = 0; i < data.length; i++) {
            const x = padding + (i / Math.max(1, data.length - 1)) * chartWidth;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
        
        // 绘制折线
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        
        data.forEach((point, index) => {
            const x = padding + (index / Math.max(1, data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // 绘制数据点
        ctx.fillStyle = lineColor;
        data.forEach((point, index) => {
            const x = padding + (index / Math.max(1, data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // 绘制数据点白色边框
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 3;
        });
        
        // 绘制X轴标签
        ctx.fillStyle = '#6c757d';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textBaseline = 'top';
        
        data.forEach((point, index) => {
            const x = padding + (index / Math.max(1, data.length - 1)) * chartWidth;
            const label = point.label || '';

            // 调整第一个和最后一个标签的对齐方式以防溢出
            if (index === 0) {
                ctx.textAlign = 'left';
            } else if (index === data.length - 1) {
                ctx.textAlign = 'right';
            } else {
                ctx.textAlign = 'center';
            }
            
            ctx.fillText(label, x, height - padding + 10);
        });
        
        // 绘制Y轴标签
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i <= 4; i++) {
            const y = padding + (i / 4) * chartHeight;
            const value = maxValue - ((i / 4) * valueRange);
            ctx.fillText(value.toFixed(1), padding - 10, y);
        }
        
        // 清空容器并添加Canvas
        container.innerHTML = '';
        container.appendChild(canvas);
        
        // 使用HTML覆盖层渲染X轴标签，避免Canvas裁剪问题
        try {
            const overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.left = '0';
            overlay.style.top = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.pointerEvents = 'none';
            overlay.style.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            overlay.style.color = '#6c757d';
            overlay.style.overflow = 'hidden';
            
            const usableWidth = container.clientWidth || width;
            const usableHeight = container.clientHeight || height;
            const pxPerUnit = (usableWidth * (chartWidth / width)) / Math.max(1, data.length - 1);

            data.forEach((point, index) => {
                const label = String(point.label || '');
                const x = (padding / width) * usableWidth + index * pxPerUnit;
                const y = (height - padding + 5) / height * usableHeight; // 稍微上移标签位置
                
                const span = document.createElement('span');
                span.textContent = label;
                span.style.position = 'absolute';
                span.style.top = `${y}px`;
                span.style.whiteSpace = 'nowrap';
                
                if (index === 0) {
                    span.style.left = `${x}px`;
                    span.style.transform = 'translateX(0)';
                    span.style.textAlign = 'left';
                } else if (index === data.length - 1) {
                    span.style.left = `${x}px`;
                    span.style.transform = 'translateX(-100%)';
                    span.style.textAlign = 'right';
                } else {
                    span.style.left = `${x}px`;
                    span.style.transform = 'translateX(-50%)';
                    span.style.textAlign = 'center';
                }
                
                overlay.appendChild(span);
            });
            
            container.appendChild(overlay);
        } catch (e) {
            console.warn('X轴HTML标签覆盖层渲染失败（忽略）：', e);
        }
        
        console.log('✅ 基础折线图创建完成');
    }

    /**
     * 创建基础雷达图（备用方案）
     */
    createBasicRadarChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('雷达图容器不存在:', containerId);
            return;
        }

        // 调整尺寸以适应虚线容器
        // 注意：容器已经有padding 1.5rem，需要减去这个padding
        const computedStyle = window.getComputedStyle(container);
        const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
        const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

        const containerWidth = container.clientWidth - paddingLeft - paddingRight;
        const containerHeight = container.clientHeight - paddingTop - paddingBottom;
        const size = Math.min(containerWidth, containerHeight, 260); // 留出边距

        console.log('📊 创建基础雷达图:', { containerId, data, size });
        
        // 提取配置选项
        const strokeColor = options.strokeColor || '#764ba2';
        const fillColor = options.fillColor || 'rgba(118,75,162,0.2)';
        
        // 使用SVG实现雷达图
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        svg.style.width = '100%';
        svg.style.height = 'auto';
        svg.style.maxWidth = '100%';
        svg.style.display = 'block';
        
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = Math.min(size, size) / 2 - 35; // 调整半径留出更多边距
        const angleStep = (2 * Math.PI) / data.length;
        
        // 绘制网格圆圈
        for (let i = 1; i <= 5; i++) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', centerX);
            circle.setAttribute('cy', centerY);
            circle.setAttribute('r', (radius * i) / 5);
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', '#e9ecef');
            circle.setAttribute('stroke-width', 1);
            circle.setAttribute('stroke-dasharray', '2,2');
            svg.appendChild(circle);
        }
        
        // 绘制网格线
        data.forEach((_, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', centerX);
            line.setAttribute('y1', centerY);
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#e9ecef');
            line.setAttribute('stroke-width', 1);
            line.setAttribute('stroke-dasharray', '2,2');
            svg.appendChild(line);
        });
        
        // 绘制数据多边形
        let pathData = '';
        const points = [];
        
        data.forEach((point, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const value = Math.max(0, Math.min(100, point.value));
            const distance = (value / 100) * radius;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            points.push({ x, y, value });
            
            if (index === 0) {
                pathData += `M ${x} ${y}`;
            } else {
                pathData += ` L ${x} ${y}`;
            }
        });
        pathData += ' Z';
        
        // 绘制填充区域
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', fillColor);
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', 2);
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);
        
        // 绘制数据点
        points.forEach((point, index) => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', point.x);
            circle.setAttribute('cy', point.y);
            circle.setAttribute('r', 4);
            circle.setAttribute('fill', strokeColor);
            circle.setAttribute('stroke', '#ffffff');
            circle.setAttribute('stroke-width', 2);
            svg.appendChild(circle);
            
            // 添加数值标签
            if (point.value > 0) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', point.x);
                text.setAttribute('y', point.y - 8);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '10');
                text.setAttribute('font-weight', 'bold');
                text.setAttribute('fill', strokeColor);
                text.textContent = point.value + '%';
                svg.appendChild(text);
            }
        });
        
        // 绘制标签
        data.forEach((point, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const labelDistance = radius + 15; // 缩小标签距离，确保在虚线框内
            const x = centerX + Math.cos(angle) * labelDistance;
            const y = centerY + Math.sin(angle) * labelDistance;
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('font-size', '14');
            text.setAttribute('font-weight', '500');
            text.setAttribute('fill', '#333');
            text.textContent = point.label;
            svg.appendChild(text);
        });
        
        // 添加中心标题
        const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        centerText.setAttribute('x', centerX);
        centerText.setAttribute('y', centerY);
        centerText.setAttribute('text-anchor', 'middle');
        centerText.setAttribute('dominant-baseline', 'middle');
        centerText.setAttribute('font-size', '12');
        centerText.setAttribute('font-weight', 'bold');
        centerText.setAttribute('fill', '#666');
        centerText.textContent = '技能雷达';
        svg.appendChild(centerText);
        
        // 清空容器并添加SVG
        container.innerHTML = '';
        container.appendChild(svg);
        
        console.log('✅ 基础雷达图创建完成');
    }
}

// 创建全局实例
console.log('🏗️ 创建 AdvancedAnalytics 全局实例...');
try {
    window.AdvancedAnalytics = new AdvancedAnalytics();
    console.log('✅ AdvancedAnalytics 全局实例创建成功');
} catch (error) {
    console.error('❌ AdvancedAnalytics 实例创建失败:', error);
}

// 确保实例可用性检查
window.addEventListener('DOMContentLoaded', () => {
    if (window.AdvancedAnalytics) {
        console.log('✅ AdvancedAnalytics 全局实例已就绪');
        
        // 添加刷新按钮事件监听器
        const refreshBtn = document.getElementById('refreshAnalytics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                window.AdvancedAnalytics.forceRefresh();
            });
            console.log('✅ 分析刷新按钮事件已绑定');
        }
        
        // 添加分学习分析按钮事件监听器
        const analysisBtn = document.getElementById('分学习分析成果');
        if (analysisBtn) {
            analysisBtn.addEventListener('click', async () => {
                try {
                    if (window.unifiedStatisticsManager && window.unifiedStatisticsManager.performEnhancedAnalysis) {
                        analysisBtn.textContent = '分析中...';
                        analysisBtn.disabled = true;
                        
                        const analysis = await window.unifiedStatisticsManager.performEnhancedAnalysis({
                            timeRange: 'month',
                            includePredictons: true,
                            includeMining: true
                        });
                        
                        console.log('🧠 增强学习分析完成:', analysis);
                        
                        if (window.app && typeof window.app.showNotification === 'function') {
                            window.app.showNotification('学习分析完成！查看详细洞察和建议', 'success');
                        }
                        
                        // 刷新当前页面数据
                        window.AdvancedAnalytics.forceRefresh();
                        
                    } else {
                        console.warn('增强学习分析功能不可用');
                        if (window.app && typeof window.app.showNotification === 'function') {
                            window.app.showNotification('增强分析功能暂不可用', 'warning');
                        }
                    }
                } catch (error) {
                    console.error('增强学习分析失败:', error);
                    if (window.app && typeof window.app.showNotification === 'function') {
                        window.app.showNotification('分析失败，请稍后重试', 'error');
                    }
                } finally {
                    analysisBtn.textContent = '分学习分析成果';
                    analysisBtn.disabled = false;
                }
            });
            console.log('✅ 增强学习分析按钮事件已绑定');
        }
    } else {
        console.error('❌ AdvancedAnalytics 全局实例创建失败');
    }
});
