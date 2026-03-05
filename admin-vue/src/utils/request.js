import axios from 'axios'
import { createDiscreteApi } from 'naive-ui'

const { message } = createDiscreteApi(['message'])

const request = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
})

const isSilentRequest = (config) => {
    if (!config) return false
    return Boolean(config._silent)
}

// 请求拦截器
request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('admin-token')
        if (token) {
            config.headers['satoken'] = token
        }
        return config
    },
    error => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    response => {
        const { data } = response
        const silent = isSilentRequest(response.config)

        if (data.code === 200) {
            return data
        } else if (data.code === 401) {
            if (!silent) message.error('登录已过期，请重新登录')
            localStorage.removeItem('admin-token')
            window.location.href = '/login'
            return Promise.reject(new Error(data.message))
        } else {
            if (!silent) message.error(data.message || '请求失败')
            return Promise.reject(new Error(data.message))
        }
    },
    error => {
        console.error('响应错误:', error)
        const silent = isSilentRequest(error.config) || isSilentRequest(error.response?.config)

        if (error.response) {
            const { status } = error.response

            switch (status) {
                case 401:
                    if (!silent) message.error('未授权，请重新登录')
                    localStorage.removeItem('admin-token')
                    window.location.href = '/login'
                    break
                case 403:
                    if (!silent) message.error('没有权限访问')
                    break
                case 404:
                    if (!silent) message.error('请求的资源不存在')
                    break
                case 500:
                    if (!silent) message.error('服务器内部错误')
                    break
                default:
                    if (!silent) message.error('网络错误')
            }
        } else {
            if (!silent) message.error('网络连接失败')
        }

        return Promise.reject(error)
    }
)

export default request
