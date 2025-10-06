/**
 * 统一统计数据管理器
 * 优化统计数据的存储、检索和管理
 */
class UnifiedStatisticsManager {
    constructor() {
        this.dataKeys = {
            sessions: 'unified_study_sessions',
            aggregated: 'unified_aggregated_stats',
            goals: 'unified_goal_data',
            achievements: 'unified_achievement_data',
            cache: 'unified_stats_cache',
            metadata: 'unified_stats_metadata'
        };
        
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
        this.batchSize = 100; // 批处理大小
        this.compressionEnabled = true;
        
        this.dataCollector = null;
        this.chartComponents = null;
        this.goalManager = null;
        this.reportGenerator = null;
        
        this.init();
    }

    /**
     * 初始化管理器
     */
    async init() {
        console.log('📊 初始化统一统计数据管理器...');

        // 初始化存储结构
        await this.initializeStorage();

        // 数据迁移（从旧格式迁移数据）
        await this.migrateData();

        // 初始化增强学习分析管理器
        await this.initializeEnhancedAnalysis();

        // 启动后台任务
        this.startBackgroundTasks();

        // 设置事件监听
        this.setupEventListeners();

        console.log('✅ 统一统计数据管理器初始化完成');
    }

    /**
     * 初始化增强学习分析管理器
     */
    async initializeEnhancedAnalysis() {
        try {
            if (window.EnhancedLearningAnalysisManager) {
                this.enhancedAnalysisManager = new window.EnhancedLearningAnalysisManager();
                console.log('✅ 增强学习分析管理器已集成');
            } else {
                console.warn('⚠️ 增强学习分析管理器未加载');
            }
        } catch (error) {
            console.warn('⚠️ 增强学习分析管理器初始化失败:', error);
        }
    }

    /**
     * 初始化存储结构
     */
    async initializeStorage() {
        const defaultStructures = {
            [this.dataKeys.sessions]: [],
            [this.dataKeys.aggregated]: {
                daily: {},
                weekly: {},
                monthly: {},
                yearly: {},
                lastUpdated: 0
            },
            [this.dataKeys.cache]: {},
            [this.dataKeys.metadata]: {
                version: '1.0',
                lastMaintenance: Date.now(),
                totalSessions: 0,
                dataSize: 0
            }
        };

        for (const [key, defaultValue] of Object.entries(defaultStructures)) {
            if (!localStorage.getItem(key)) {
                await this.setItem(key, defaultValue);
            }
        }
    }

    /**
     * 设置数据项（支持压缩）
     */
    async setItem(key, value) {
        try {
            const data = JSON.stringify(value);
            
            if (this.compressionEnabled && data.length > 10000) {
                // 对大数据进行简单压缩（移除空白字符）
                const compressed = data.replace(/\s+/g, '');
                localStorage.setItem(key + '_compressed', compressed);
                localStorage.setItem(key + '_meta', JSON.stringify({
                    compressed: true,
                    originalSize: data.length,
                    compressedSize: compressed.length,
                    timestamp: Date.now()
                }));
            } else {
                localStorage.setItem(key, data);
            }
            
            // 更新元数据
            await this.updateMetadata(key, data.length);
            
        } catch (error) {
            console.error('存储数据失败:', error);
            // 尝试清理空间后重试
            await this.cleanupStorage();
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (retryError) {
                console.error('重试存储失败:', retryError);
                throw retryError;
            }
        }
    }

    /**
     * 获取数据项（支持解压缩）
     */
    async getItem(key) {
        try {
            // 检查是否有压缩版本
            const metaData = localStorage.getItem(key + '_meta');
            if (metaData) {
                const meta = JSON.parse(metaData);
                if (meta.compressed) {
                    const compressed = localStorage.getItem(key + '_compressed');
                    return compressed ? JSON.parse(compressed) : null;
                }
            }
            
            // 获取普通版本
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
            
        } catch (error) {
            console.error('读取数据失败:', error);
            return null;
        }
    }

    /**
     * 更新元数据
     */
    async updateMetadata(key, dataSize) {
        try {
            const metadata = await this.getItem(this.dataKeys.metadata) || {};
            metadata.dataSize = (metadata.dataSize || 0) + dataSize;
            metadata.lastUpdated = Date.now();
            
            await this.setItem(this.dataKeys.metadata, metadata);
        } catch (error) {
            console.warn('更新元数据失败:', error);
        }
    }

    /**
     * 记录学习会话
     */
    async recordSession(sessionData) {
        try {
            const sessions = await this.getItem(this.dataKeys.sessions) || [];
            
            // 添加新会话
            sessions.push({
                ...sessionData,
                id: sessionData.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                recordedAt: Date.now()
            });

            // 保持最近的会话记录
            if (sessions.length > 1000) {
                sessions.splice(0, sessions.length - 1000);
            }

            await this.setItem(this.dataKeys.sessions, sessions);
            
            // 异步更新聚合数据
            this.updateAggregatedData(sessionData);
            
            // 清除相关缓存
            this.clearRelatedCache(['sessions', 'statistics', 'performance']);
            
            console.log('✅ 学习会话已记录:', sessionData.id);
            return true;
            
        } catch (error) {
            console.error('记录学习会话失败:', error);
            return false;
        }
    }

    /**
     * 更新聚合数据
     */
    async updateAggregatedData(sessionData) {
        try {
            const aggregated = await this.getItem(this.dataKeys.aggregated) || {};
            const now = new Date(sessionData.startTime || Date.now());
            
            const keys = {
                daily: `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`,
                weekly: `${now.getFullYear()}-W${this.getWeekNumber(now)}`,
                monthly: `${now.getFullYear()}-${now.getMonth()}`,
                yearly: `${now.getFullYear()}`
            };

            // 更新各个时间维度的数据
            Object.entries(keys).forEach(([period, key]) => {
                if (!aggregated[period]) aggregated[period] = {};
                if (!aggregated[period][key]) {
                    aggregated[period][key] = {
                        sessions: 0,
                        totalTime: 0,
                        totalQuestions: 0,
                        totalCorrect: 0,
                        modules: {},
                        firstSession: sessionData.startTime,
                        lastSession: sessionData.startTime
                    };
                }

                const periodData = aggregated[period][key];
                periodData.sessions++;
                periodData.totalTime += sessionData.duration || 0;
                periodData.totalQuestions += sessionData.content?.questionsAnswered || 0;
                periodData.totalCorrect += sessionData.content?.correctAnswers || 0;
                periodData.lastSession = Math.max(periodData.lastSession, sessionData.startTime || 0);

                // 模块统计
                const module = sessionData.module || 'unknown';
                if (!periodData.modules[module]) {
                    periodData.modules[module] = {
                        sessions: 0,
                        time: 0,
                        questions: 0,
                        correct: 0
                    };
                }
                periodData.modules[module].sessions++;
                periodData.modules[module].time += sessionData.duration || 0;
                periodData.modules[module].questions += sessionData.content?.questionsAnswered || 0;
                periodData.modules[module].correct += sessionData.content?.correctAnswers || 0;
            });

            aggregated.lastUpdated = Date.now();
            await this.setItem(this.dataKeys.aggregated, aggregated);
            
        } catch (error) {
            console.error('更新聚合数据失败:', error);
        }
    }

    /**
     * 获取统计数据
     */
    async getStatistics(options = {}) {
        const {
            timeRange = 'all',
            modules = null,
            useCache = true,
            detailed = true
        } = options;

        const cacheKey = `stats_${timeRange}_${modules || 'all'}_${detailed}`;
        
        // 检查缓存
        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const statistics = await this.calculateStatistics(timeRange, modules, detailed);
            
            // 缓存结果
            if (useCache) {
                this.cache.set(cacheKey, {
                    data: statistics,
                    timestamp: Date.now()
                });
            }
            
            return statistics;
            
        } catch (error) {
            console.error('获取统计数据失败:', error);
            return null;
        }
    }

    /**
     * 计算统计数据
     */
    async calculateStatistics(timeRange, modules, detailed) {
        const sessions = await this.getFilteredSessions(timeRange, modules);
        const aggregated = await this.getItem(this.dataKeys.aggregated) || {};
        
        const statistics = {
            overview: this.calculateOverviewStats(sessions),
            performance: this.calculatePerformanceStats(sessions),
            trends: detailed ? this.calculateTrendStats(sessions) : null,
            modules: this.calculateModuleStats(sessions),
            timeDistribution: detailed ? this.calculateTimeDistribution(sessions) : null,
            aggregated: this.getRelevantAggregatedData(aggregated, timeRange)
        };

        return statistics;
    }

    /**
     * 获取过滤后的会话
     */
    async getFilteredSessions(timeRange, modules) {
        const allSessions = await this.getItem(this.dataKeys.sessions) || [];
        let filtered = allSessions;

        // 时间过滤
        if (timeRange !== 'all') {
            const now = Date.now();
            let cutoffTime;
            
            switch (timeRange) {
                case 'today':
                    cutoffTime = now - 24 * 60 * 60 * 1000;
                    break;
                case 'week':
                    cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
                    break;
                case 'month':
                    cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
                    break;
                case 'quarter':
                    cutoffTime = now - 90 * 24 * 60 * 60 * 1000;
                    break;
                case 'year':
                    cutoffTime = now - 365 * 24 * 60 * 60 * 1000;
                    break;
                default:
                    cutoffTime = 0;
            }
            
            filtered = filtered.filter(session => 
                (session.startTime || session.recordedAt || 0) >= cutoffTime
            );
        }

        // 模块过滤
        if (modules) {
            const moduleList = Array.isArray(modules) ? modules : [modules];
            filtered = filtered.filter(session => 
                moduleList.includes(session.module)
            );
        }

        return filtered;
    }

    /**
     * 计算概览统计
     */
    calculateOverviewStats(sessions) {
        const totalSessions = sessions.length;
        const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const totalQuestions = sessions.reduce((sum, s) => sum + (s.content?.questionsAnswered || 0), 0);
        const totalCorrect = sessions.reduce((sum, s) => sum + (s.content?.correctAnswers || 0), 0);
        
        const studyDates = new Set(sessions.map(s => {
            const date = new Date(s.startTime || s.recordedAt || 0);
            return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        }));

        return {
            totalSessions,
            totalTime: Math.round(totalTime / 60000), // 转换为分钟
            totalQuestions,
            totalCorrect,
            averageAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
            averageSessionTime: totalSessions > 0 ? Math.round(totalTime / totalSessions / 60000) : 0,
            studyDays: studyDates.size,
            averageSessionsPerDay: studyDates.size > 0 ? Math.round((totalSessions / studyDates.size) * 10) / 10 : 0
        };
    }

    /**
     * 计算表现统计
     */
    calculatePerformanceStats(sessions) {
        if (sessions.length === 0) {
            return {
                accuracy: { current: 0, trend: 'stable', history: [] },
                speed: { current: 0, trend: 'stable', history: [] },
                consistency: { score: 0, variance: 0 },
                improvement: { rate: 0, direction: 'stable' }
            };
        }

        const accuracies = sessions.map(s => s.performance?.accuracy || 0).filter(a => a > 0);
        const speeds = sessions.map(s => s.performance?.speed || 0).filter(s => s > 0);
        
        return {
            accuracy: {
                current: accuracies.length > 0 ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length) : 0,
                trend: this.calculateTrend(accuracies),
                history: accuracies.slice(-10)
            },
            speed: {
                current: speeds.length > 0 ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0,
                trend: this.calculateTrend(speeds),
                history: speeds.slice(-10)
            },
            consistency: this.calculateConsistency(accuracies),
            improvement: this.calculateImprovement(accuracies)
        };
    }

    /**
     * 计算模块统计
     */
    calculateModuleStats(sessions) {
        const moduleStats = {};
        
        sessions.forEach(session => {
            const module = session.module || 'unknown';
            if (!moduleStats[module]) {
                moduleStats[module] = {
                    sessions: 0,
                    totalTime: 0,
                    totalQuestions: 0,
                    totalCorrect: 0,
                    accuracies: [],
                    lastActivity: 0
                };
            }
            
            const stats = moduleStats[module];
            stats.sessions++;
            stats.totalTime += session.duration || 0;
            stats.totalQuestions += session.content?.questionsAnswered || 0;
            stats.totalCorrect += session.content?.correctAnswers || 0;
            stats.lastActivity = Math.max(stats.lastActivity, session.startTime || session.recordedAt || 0);
            
            if (session.performance?.accuracy > 0) {
                stats.accuracies.push(session.performance.accuracy);
            }
        });

        // 计算每个模块的派生指标
        Object.values(moduleStats).forEach(stats => {
            stats.averageAccuracy = stats.totalQuestions > 0 ? 
                Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0;
            stats.averageTime = stats.sessions > 0 ? 
                Math.round(stats.totalTime / stats.sessions / 60000) : 0;
            stats.masteryLevel = this.calculateMasteryLevel(stats.averageAccuracy, stats.sessions);
            stats.trend = this.calculateTrend(stats.accuracies);
        });

        return moduleStats;
    }

    /**
     * 批量处理数据
     */
    async batchProcess(operations) {
        const results = [];
        
        for (let i = 0; i < operations.length; i += this.batchSize) {
            const batch = operations.slice(i, i + this.batchSize);
            const batchResults = await Promise.all(
                batch.map(op => this.processOperation(op))
            );
            results.push(...batchResults);
            
            // 给UI线程一些时间
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        return results;
    }

    /**
     * 处理单个操作
     */
    async processOperation(operation) {
        const { type, data } = operation;
        
        switch (type) {
            case 'record_session':
                return await this.recordSession(data);
            case 'update_goal':
                return await this.updateGoalProgress(data.goalId, data.progress);
            case 'calculate_stats':
                return await this.getStatistics(data.options);
            default:
                console.warn('未知操作类型:', type);
                return null;
        }
    }

    /**
     * 数据迁移
     */
    async migrateData() {
        try {
            console.log('🔄 开始数据迁移...');
            
            // 从旧的存储格式迁移数据
            const oldSessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
            const oldActivities = JSON.parse(localStorage.getItem('learning_activities') || '[]');
            
            if (oldSessions.length > 0 || oldActivities.length > 0) {
                const migratedSessions = [...oldSessions, ...oldActivities];
                await this.setItem(this.dataKeys.sessions, migratedSessions);
                
                // 重新计算聚合数据
                for (const session of migratedSessions) {
                    await this.updateAggregatedData(session);
                }
                
                console.log(`✅ 已迁移 ${migratedSessions.length} 条数据`);
            }
            
        } catch (error) {
            console.error('数据迁移失败:', error);
        }
    }

    /**
     * 数据备份
     */
    async backupData() {
        try {
            const backup = {
                sessions: await this.getItem(this.dataKeys.sessions),
                aggregated: await this.getItem(this.dataKeys.aggregated),
                goals: await this.getItem(this.dataKeys.goals),
                achievements: await this.getItem(this.dataKeys.achievements),
                metadata: await this.getItem(this.dataKeys.metadata),
                timestamp: Date.now(),
                version: '1.0'
            };
            
            const backupData = JSON.stringify(backup);
            const blob = new Blob([backupData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `学习数据备份_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ 数据备份完成');
            return true;
            
        } catch (error) {
            console.error('数据备份失败:', error);
            return false;
        }
    }

    /**
     * 数据恢复
     */
    async restoreData(backupFile) {
        try {
            const text = await backupFile.text();
            const backup = JSON.parse(text);
            
            if (!backup.version || !backup.timestamp) {
                throw new Error('无效的备份文件格式');
            }
            
            // 确认恢复
            const confirmed = confirm(`确定要恢复 ${new Date(backup.timestamp).toLocaleString()} 的备份数据吗？这将覆盖当前数据。`);
            if (!confirmed) return false;
            
            // 恢复数据
            await this.setItem(this.dataKeys.sessions, backup.sessions || []);
            await this.setItem(this.dataKeys.aggregated, backup.aggregated || {});
            await this.setItem(this.dataKeys.goals, backup.goals || {});
            await this.setItem(this.dataKeys.achievements, backup.achievements || {});
            await this.setItem(this.dataKeys.metadata, backup.metadata || {});
            
            // 清除缓存
            this.cache.clear();
            
            console.log('✅ 数据恢复完成');
            return true;
            
        } catch (error) {
            console.error('数据恢复失败:', error);
            return false;
        }
    }

    /**
     * 清理存储空间
     */
    async cleanupStorage() {
        try {
            console.log('🧹 开始清理存储空间...');
            
            // 清理过期缓存
            this.cache.clear();
            localStorage.removeItem(this.dataKeys.cache);
            
            // 清理旧的会话数据（保留最近6个月）
            const sixMonthsAgo = Date.now() - 6 * 30 * 24 * 60 * 60 * 1000;
            const sessions = await this.getItem(this.dataKeys.sessions) || [];
            const filteredSessions = sessions.filter(session => 
                (session.startTime || session.recordedAt || 0) > sixMonthsAgo
            );
            
            if (filteredSessions.length < sessions.length) {
                await this.setItem(this.dataKeys.sessions, filteredSessions);
                console.log(`🗑️ 清理了 ${sessions.length - filteredSessions.length} 条过期会话`);
            }
            
            // 清理聚合数据中的过期项
            const aggregated = await this.getItem(this.dataKeys.aggregated) || {};
            let cleaned = false;
            
            ['daily', 'weekly'].forEach(period => {
                if (aggregated[period]) {
                    const keys = Object.keys(aggregated[period]);
                    const cutoff = period === 'daily' ? 90 : 52; // 保留90天或52周
                    
                    if (keys.length > cutoff) {
                        const sortedKeys = keys.sort();
                        const toDelete = sortedKeys.slice(0, keys.length - cutoff);
                        
                        toDelete.forEach(key => {
                            delete aggregated[period][key];
                        });
                        
                        cleaned = true;
                    }
                }
            });
            
            if (cleaned) {
                await this.setItem(this.dataKeys.aggregated, aggregated);
            }
            
            console.log('✅ 存储空间清理完成');
            
        } catch (error) {
            console.error('清理存储空间失败:', error);
        }
    }

    /**
     * 启动后台任务
     */
    startBackgroundTasks() {
        // 定期清理缓存
        setInterval(() => {
            this.cleanExpiredCache();
        }, 10 * 60 * 1000); // 每10分钟

        // 定期维护存储
        setInterval(() => {
            this.cleanupStorage();
        }, 24 * 60 * 60 * 1000); // 每24小时

        // 定期备份重要数据
        setInterval(() => {
            this.autoBackup();
        }, 7 * 24 * 60 * 60 * 1000); // 每周
    }

    /**
     * 清理过期缓存
     */
    cleanExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * 自动备份
     */
    async autoBackup() {
        try {
            const metadata = await this.getItem(this.dataKeys.metadata) || {};
            const lastBackup = metadata.lastBackup || 0;
            const now = Date.now();
            
            // 如果距离上次备份超过7天，则自动备份
            if (now - lastBackup > 7 * 24 * 60 * 60 * 1000) {
                await this.backupData();
                metadata.lastBackup = now;
                await this.setItem(this.dataKeys.metadata, metadata);
            }
        } catch (error) {
            console.warn('自动备份失败:', error);
        }
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听存储空间不足
        window.addEventListener('storage', (event) => {
            if (event.key === null) {
                // 存储空间可能不足
                this.cleanupStorage();
            }
        });

        // 监听页面关闭
        window.addEventListener('beforeunload', () => {
            // 清理内存缓存
            this.cache.clear();
        });
    }

    /**
     * 清除相关缓存
     */
    clearRelatedCache(tags) {
        for (const [key, value] of this.cache.entries()) {
            if (tags.some(tag => key.includes(tag))) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * 获取存储使用情况
     */
    getStorageUsage() {
        let totalSize = 0;
        const breakdown = {};
        
        Object.values(this.dataKeys).forEach(key => {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    const size = new Blob([data]).size;
                    breakdown[key] = size;
                    totalSize += size;
                }
            } catch (error) {
                console.warn(`获取 ${key} 大小失败:`, error);
            }
        });
        
        return {
            total: totalSize,
            breakdown,
            percentage: (totalSize / (5 * 1024 * 1024)) * 100 // 假设5MB限制
        };
    }

    // 辅助方法

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    calculateTrend(values) {
        if (values.length < 2) return 'stable';
        
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        const change = ((secondAvg - firstAvg) / firstAvg) * 100;
        
        if (change > 5) return 'up';
        if (change < -5) return 'down';
        return 'stable';
    }

    calculateConsistency(values) {
        if (values.length < 2) return { score: 0, variance: 0 };
        
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const score = Math.max(0, 100 - (Math.sqrt(variance) / mean) * 100);
        
        return { score: Math.round(score), variance: Math.round(variance) };
    }

    calculateImprovement(values) {
        if (values.length < 2) return { rate: 0, direction: 'stable' };
        
        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const rate = ((lastValue - firstValue) / firstValue) * 100;
        
        return {
            rate: Math.round(rate),
            direction: rate > 5 ? 'improving' : rate < -5 ? 'declining' : 'stable'
        };
    }

    calculateMasteryLevel(accuracy, sessions) {
        let level = accuracy;
        
        // 根据学习次数调整
        if (sessions >= 20) level = Math.min(level + 15, 100);
        else if (sessions >= 10) level = Math.min(level + 10, 100);
        else if (sessions >= 5) level = Math.min(level + 5, 100);
        
        return Math.round(level);
    }

    getRelevantAggregatedData(aggregated, timeRange) {
        const relevant = {};
        
        switch (timeRange) {
            case 'today':
            case 'week':
                relevant.daily = aggregated.daily || {};
                break;
            case 'month':
                relevant.weekly = aggregated.weekly || {};
                relevant.daily = aggregated.daily || {};
                break;
            case 'quarter':
            case 'year':
                relevant.monthly = aggregated.monthly || {};
                relevant.weekly = aggregated.weekly || {};
                break;
            default:
                return aggregated;
        }
        
        return relevant;
    }

    /**
     * 执行增强学习分析
     */
    async performEnhancedAnalysis(options = {}) {
        if (!this.enhancedAnalysisManager) {
            throw new Error('增强学习分析管理器未初始化');
        }

        try {
            console.log('🧠 开始执行增强学习分析...');
            
            const analysisResult = await this.enhancedAnalysisManager.performComprehensiveAnalysis({
                userId: options.userId || 'current_user',
                timeRange: options.timeRange || 'month',
                includePredictons: options.includePredictons !== false,
                includeMining: options.includeMining !== false,
                includePathOptimization: options.includePathOptimization !== false,
                ...options
            });

            // 触发分析完成事件
            this.dispatchEvent('enhancedAnalysisComplete', {
                analysisId: analysisResult.analysisId,
                keyInsights: analysisResult.keyInsights,
                recommendations: analysisResult.recommendations
            });

            return analysisResult;

        } catch (error) {
            console.error('❌ 增强学习分析失败:', error);
            throw error;
        }
    }

    /**
     * 执行快速学习分析
     */
    async performQuickAnalysis(options = {}) {
        if (!this.enhancedAnalysisManager) {
            throw new Error('增强学习分析管理器未初始化');
        }

        try {
            return await this.enhancedAnalysisManager.performQuickAnalysis({
                userId: options.userId || 'current_user',
                timeRange: options.timeRange || 'week',
                ...options
            });

        } catch (error) {
            console.error('❌ 快速学习分析失败:', error);
            throw error;
        }
    }

    /**
     * 获取分析历史
     */
    getAnalysisHistory(limit = 10) {
        if (!this.enhancedAnalysisManager) {
            return [];
        }
        
        return this.enhancedAnalysisManager.getAnalysisHistory(limit);
    }

    /**
     * 导出分析结果
     */
    async exportAnalysisResults(analysisResult, format = 'json') {
        if (!this.enhancedAnalysisManager) {
            throw new Error('增强学习分析管理器未初始化');
        }

        try {
            await this.enhancedAnalysisManager.exportAnalysisResults(analysisResult, format);
        } catch (error) {
            console.error('❌ 分析结果导出失败:', error);
            throw error;
        }
    }

    /**
     * 导出统计数据
     */
    async exportStatistics(format = 'json', options = {}) {
        try {
            const stats = await this.getStatistics(options);
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `学习统计_${timestamp}.${format}`;
            
            let content;
            let mimeType;
            
            switch (format.toLowerCase()) {
                case 'json':
                    content = JSON.stringify(stats, null, 2);
                    mimeType = 'application/json';
                    break;
                case 'csv':
                    content = this.convertToCSV(stats);
                    mimeType = 'text/csv';
                    break;
                default:
                    throw new Error('不支持的导出格式');
            }
            
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ 统计数据导出完成');
            
        } catch (error) {
            console.error('❌ 统计数据导出失败:', error);
            throw error;
        }
    }

    /**
     * 转换为CSV格式
     */
    convertToCSV(data) {
        const rows = [
            ['指标', '数值', '时间范围'],
            ['总学习时间', data.overview?.totalStudyTime || 0, data.timeRange || '未知'],
            ['学习会话数', data.overview?.totalSessions || 0, data.timeRange || '未知'],
            ['平均准确率', `${data.overview?.averageAccuracy || 0}%`, data.timeRange || '未知'],
            ['学习一致性', `${data.consistency?.score || 0}分`, data.timeRange || '未知']
        ];
        
        return rows.map(row => row.join(',')).join('\n');
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.UnifiedStatisticsManager = UnifiedStatisticsManager;
    console.log('📊 统一统计数据管理器已加载');
}
