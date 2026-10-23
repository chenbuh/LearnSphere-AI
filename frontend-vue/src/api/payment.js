import request from '@/utils/request'

export const paymentApi = {
    // 获取支付 Token
    getPaymentToken() {
        return request({
            url: '/payment/token',
            method: 'get'
        })
    },

    // 在线支付是否已开启
    getStatus() {
        return request({
            url: '/payment/status',
            method: 'get',
            silent: true
        })
    },

    // 当前用户各套餐报价（升级按剩余天数折算抵扣）
    getQuote() {
        return request({
            url: '/payment/quote',
            method: 'get',
            silent: true
        })
    },

    // 创建易支付订单
    // 入参：{ paymentToken, vipLevel, payType, device }
    //   device=pc 时返回 qrcode（自行渲染二维码，不跳转网关）；否则返回 payUrl 走跳转
    // 返回：{ outTradeNo, amount, orderType, credit, device, qrcode, payUrl }
    checkout(data) {
        return request({
            url: '/payment/checkout',
            method: 'post',
            data
        })
    },

    // 查询订单支付状态
    // options.silent=true 时不弹全局错误提示（轮询场景用，避免 429 时连续弹窗）
    getOrder(outTradeNo, options = {}) {
        return request({
            url: `/payment/order/${encodeURIComponent(outTradeNo)}`,
            method: 'get',
            ...options
        })
    }
}
