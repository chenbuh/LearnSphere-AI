import request from '@/utils/request'

export const paymentApi = {
    // 获取支付 Token
    getPaymentToken() {
        return request({
            url: '/payment/token',
            method: 'get'
        })
    },

    // 提交支付
    checkout(data) {
        return request({
            url: '/payment/checkout',
            method: 'post',
            data
        })
    }
}
