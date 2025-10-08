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
    }
}
