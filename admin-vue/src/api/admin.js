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

    // 获取用户增长趋势
    getUserGrowth() {
        return request.get('/admin/user-growth')
    },

    // 获取用户列表
    getUserList(params) {
        return request.get('/admin/users', { params })
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
    generateVocabularyDetails(id) {
        return request.post(`/admin/vocabulary/${id}/generate-details`)
    },

    // 批量AI补全词汇信息
    batchGenerateVocabularyDetails(limit = 20) {
        return request.post('/admin/vocabulary/batch-generate', null, { params: { limit } })
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
    }
}
