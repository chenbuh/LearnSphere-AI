import request from '@/utils/request'

export const commonApi = {
    // 获取公共配置
    getPublicConfigs() {
        return request.get('/common/config')
    }
}
