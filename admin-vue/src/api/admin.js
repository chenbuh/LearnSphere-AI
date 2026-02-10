import request from '@/utils/request'

export const adminApi = {
    // 管理员登录
    login(data) {
        return request.post('/admin/auth/login', data)
    },

    // 获取管理员信息
    getAdminInfo() {
        return request.get('/admin/auth/info')
    },

    // 管理员登出
    adminLogout() {
        return request.post('/admin/auth/logout')
    },

    // 获取系统统计
    getStats() {
        return request.get('/admin/stats')
    },

    getContentStats() {
        return request.get('/admin/content-stats')
    },

    // 获取用户增长趋势
    getUserGrowth() {
        return request.get('/admin/user-growth')
    },

    getUserFunnel() {
        return request.get('/admin/user-funnel')
    },

    getFinanceStats() {
        return request.get('/admin/finance/stats')
    },

    getRetentionData() {
        return request.get('/admin/retention')
    },

    auditContent(data) {
        return request.post('/admin/audit', data)
    },

    getSpeakingLeaderboard() {
        return request.get('/admin/speaking-leaderboard')
    },

    // 获取用户列表
    getUserList(params) {
        return request.get('/admin/users', { params })
    },

    getUserDetails(id) {
        return request.get(`/admin/users/${id}`)
    },

    updateUserProfile(id, data) {
        return request.put(`/admin/users/${id}`, data)
    },

    resetUserPassword(id, password) {
        return request.put(`/admin/users/${id}/password`, { password })
    },

    // 更新用户状态
    updateUserStatus(id, status) {
        return request.put(`/admin/users/${id}/status`, null, { params: { status } })
    },

    // 删除用户
    deleteUser(id) {
        return request.delete(`/admin/users/${id}`)
    },

    // 获取词汇列表
    getVocabularyList(params) {
        return request.get('/admin/vocabulary', { params })
    },

    // 添加词汇
    addVocabulary(data) {
        return request.post('/admin/vocabulary', data)
    },

    // 更新词汇
    updateVocabulary(id, data) {
        return request.put(`/admin/vocabulary/${id}`, data)
    },

    // 删除词汇
    deleteVocabulary(id) {
        return request.delete(`/admin/vocabulary/${id}`)
    },

    // 批量导入词汇
    batchAddVocabulary(data) {
        return request.post('/admin/vocabulary/batch', data)
    },

    // AI一键补全词汇详细信息
    generateVocabularyDetails(word) {
        return request.post('/admin/vocabulary/generate-details', { word })
    },

    // 批量AI补全词汇信息
    batchGenerateVocabularyDetails(limit = 20) {
        return request.post('/admin/vocabulary/batch-generate', null, { params: { limit } })
    },

    // 全库去重
    deduplicateVocabulary() {
        return request.post('/admin/vocabulary/deduplicate')
    },

    // 获取学习记录
    getLearningRecords(params) {
        return request.get('/admin/learning-records', { params })
    },

    // 获取听力材料列表
    getListeningList(params) {
        return request.get('/admin/listening', { params })
    },

    // 添加听力材料
    addListening(data) {
        return request.post('/admin/listening', data)
    },

    // 更新听力材料
    updateListening(id, data) {
        return request.put(`/admin/listening/${id}`, data)
    },

    // 删除听力材料
    deleteListening(id) {
        return request.delete(`/admin/listening/${id}`)
    },

    // 获取阅读文章列表
    getReadingList(params) {
        return request.get('/admin/reading', { params })
    },

    // 添加阅读文章
    addReading(data) {
        return request.post('/admin/reading', data)
    },

    // 更新阅读文章
    updateReading(id, data) {
        return request.put(`/admin/reading/${id}`, data)
    },

    // 删除阅读文章
    deleteReading(id) {
        return request.delete(`/admin/reading/${id}`)
    },

    // 获取写作话题列表
    getWritingList(params) {
        return request.get('/admin/writing', { params })
    },

    // 添加写作话题
    addWriting(data) {
        return request.post('/admin/writing', data)
    },

    // 更新写作话题
    updateWriting(id, data) {
        return request.put(`/admin/writing/${id}`, data)
    },

    // 删除写作话题
    deleteWriting(id) {
        return request.delete(`/admin/writing/${id}`)
    },

    // 获取语法练习列表
    getGrammarList(params) {
        return request.get('/admin/grammar', { params })
    },

    // 添加语法练习
    addGrammar(data) {
        return request.post('/admin/grammar', data)
    },

    // 更新语法练习
    updateGrammar(id, data) {
        return request.put(`/admin/grammar/${id}`, data)
    },

    // 删除语法练习
    deleteGrammar(id) {
        return request.delete(`/admin/grammar/${id}`)
    },

    // 获取口语话题列表
    getSpeakingList(params) {
        return request.get('/admin/speaking', { params })
    },

    // 添加口语话题
    addSpeaking(data) {
        return request.post('/admin/speaking', data)
    },

    // 更新口语话题
    updateSpeaking(id, data) {
        return request.put(`/admin/speaking/${id}`, data)
    },

    // 删除口语话题
    deleteSpeaking(id) {
        return request.delete(`/admin/speaking/${id}`)
    },

    // ============ VIP 管理 ============

    // 授予用户 VIP
    grantVip(data) {
        return request.post('/admin/vip/grant', data)
    },

    // 取消用户 VIP
    revokeVip(userId) {
        return request.post(`/admin/vip/revoke/${userId}`)
    },

    // 查询用户 VIP 状态
    getVipStatus(userId) {
        return request.get(`/admin/vip/status/${userId}`)
    },
    // ============ AI 治理 ============
    getPrompts() {
        return request.get('/admin/ai/prompts')
    },

    updatePrompt(id, data) {
        return request.put(`/admin/ai/prompts/${id}`, data)
    },

    addPrompt(data) {
        return request.post('/admin/ai/prompts', data)
    },

    deletePrompt(id) {
        return request.delete(`/admin/ai/prompts/${id}`)
    },

    getAILogs(params) {
        return request.get('/admin/ai/logs', { params })
    },

    getAIStats() {
        return request.get('/admin/ai/stats')
    },

    getAITrends(days = 7) {
        return request.get('/admin/ai/trends', { params: { days } })
    },

    getAIHealth() {
        return request.get('/admin/ai/health')
    },

    testPrompt(data) {
        return request.post('/admin/ai/test', data)
    },

    getAILoopStats() {
        return request.get('/admin/ai/loop-stats')
    },

    getPromptHistory(id) {
        return request.get(`/admin/ai/prompts/${id}/history`)
    },

    rollbackPrompt(id, historyId) {
        return request.post(`/admin/ai/prompts/${id}/rollback`, { historyId })
    },

    getAIConfig() {
        return request.get('/admin/ai/config')
    },

    updateAIConfig(data) {
        return request.post('/admin/ai/config', data)
    },

    // ============ A/B Experiments ============
    getExperiments() {
        return request.get('/admin/ai/experiments')
    },
    startExperiment(data) {
        return request.post('/admin/ai/experiments', data)
    },
    stopExperiment(id) {
        return request.post(`/admin/ai/experiments/${id}/stop`)
    },
    getExperimentReport(id) {
        return request.get(`/admin/ai/experiments/${id}/report`)
    },

    // ============ AI 反馈审计 ============
    getAIFeedbackList(params) {
        return request.get('/admin/ai/feedback/list', { params })
    },

    auditAIFeedback(data) {
        return request.post('/admin/ai/feedback/audit', data)
    },

    analyzeFeedback(id) {
        return request.post(`/admin/ai/feedback/${id}/analyze`)
    },

    // ============ 操作日志 ============
    getOperationLogs(params) {
        return request.get('/admin/logs/operation', { params })
    },

    // ============ 系统监控 ============
    getSystemMonitor() {
        return request.get('/admin/monitor/server')
    },

    // ============ 系统配置 ============
    getSystemConfigs() {
        return request.get('/admin/system/config')
    },

    updateSystemConfig(key, value) {
        return request.put(`/admin/system/config/${key}`, { value })
    },

    // ============ 模考管理 ============
    getExamList(params) {
        return request.get('/admin/exams', { params })
    },

    deleteExam(id) {
        return request.delete(`/admin/exams/${id}`)
    },

    getExamRecords(params) {
        return request.get('/admin/exams/records', { params })
    },

    getExamDetail(id) {
        return request.get(`/admin/exams/${id}`)
    },

    // ============ 敏感内容审计 ============
    getSensitiveLogs(params) {
        return request.get('/admin/sensitive/list', { params })
    },

    deleteSensitiveLog(id) {
        return request.delete(`/admin/sensitive/${id}`)
    },

    deleteSensitiveLogsBatch(ids) {
        return request.post('/admin/sensitive/batch-delete', ids) // Using POST with body for batch
    },

    // ============ 通知管理 ============
    getNotifications(params) {
        return request.get('/admin/notifications', { params })
    },

    sendNotification(data) {
        return request.post('/admin/notifications', data)
    },

    getNotification(id) {
        return request.get(`/admin/notifications/${id}`)
    },

    deleteNotification(id) {
        return request.delete(`/admin/notifications/${id}`)
    },

    batchDeleteNotifications(ids) {
        return request.post('/admin/notifications/batch-delete', ids)
    },

    // ============ 用户操作日志 ============
    getUserLogs(params) {
        return request.get('/admin/user-logs/list', { params })
    },

    getUserLogStats() {
        return request.get('/admin/user-logs/statistics')
    },

    getUserLogActionStats() {
        return request.get('/admin/user-logs/stats/actions')
    },

    getUserLogModuleStats() {
        return request.get('/admin/user-logs/stats/modules')
    },

    getUserLogProvinceStats() {
        return request.get('/admin/user-logs/stats/provinces')
    },

    getUserLogDeviceStats() {
        return request.get('/admin/user-logs/stats/devices')
    },

    getUserLogDetail(id) {
        return request.get(`/admin/user-logs/${id}`)
    },

    batchDeleteUserLogs(ids) {
        return request.delete('/admin/user-logs/batch', { data: { ids } })
    },

    clearAllUserLogs() {
        return request.delete('/admin/user-logs/clear')
    },

    // ==================== 用户管理 ====================

    // 获取用户列表
    getUserList(params) {
        return request.get('/admin/users', { params })
    },

    // 获取用户详情（旧版）
    getUserDetails(id) {
        return request.get(`/admin/users/${id}`)
    },

    // 获取用户完整档案（新版 - 包含画像分析）
    getUserProfile(id) {
        return request.get(`/admin/users/${id}/profile`)
    },

    // 更新用户资料
    updateUserProfile(id, data) {
        return request.put(`/admin/users/${id}`, data)
    },

    // 更新用户状态
    updateUserStatus(id, status) {
        return request.put(`/admin/users/${id}/status`, null, { params: { status } })
    },

    // 重置用户密码
    resetUserPassword(id, password) {
        return request.put(`/admin/users/${id}/password`, { password })
    },

    // 删除用户
    deleteUser(id) {
        return request.delete(`/admin/users/${id}`)
    },

    // 赠送VIP
    grantVip(data) {
        return request.post('/admin/vip/grant', data)
    },

    // 取消VIP
    revokeVip(userId) {
        return request.post('/admin/vip/revoke', { userId })
    },

    // 批量发送通知
    batchNotify(data) {
        return request.post('/admin/users/batch/notify', data)
    },

    // 批量赠送VIP
    batchGrantVip(data) {
        return request.post('/admin/users/batch/grant-vip', data)
    },

    // 高级筛选用户
    filterUsers(criteria, page = 1, size = 10) {
        return request.post('/admin/users/filter', criteria, { params: { page, size } })
    },

    // ==================== 智能内容管理 ====================

    // 内容质量检查
    checkContentQuality(data) {
        return request.post('/admin/content/quality-check', data)
    },

    // 获取内容热度分析
    getContentHeatAnalysis(contentId, contentType = 'general') {
        return request.get(`/admin/content/${contentId}/heat-analysis`, {
            params: { contentType }
        })
    },

    // 获取热门内容列表
    getHotContentList(params = {}) {
        return request.get('/admin/content/hot-list', { params })
    }
}
