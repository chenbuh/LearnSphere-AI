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

        if (data.code === 200) {
            return data
        } else if (data.code === 401) {
            message.error('登录已过期，请重新登录')
            localStorage.removeItem('admin-token')
            window.location.href = '/login'
            return Promise.reject(new Error(data.message))
        } else {
            message.error(data.message || '请求失败')
            return Promise.reject(new Error(data.message))
        }
    },
    error => {
        console.error('响应错误:', error)

        if (error.response) {
            const { status } = error.response

            switch (status) {
                case 401:
                    message.error('未授权，请重新登录')
                    localStorage.removeItem('admin-token')
                    window.location.href = '/login'
                    break
                case 403:
                    message.error('没有权限访问')
                    break
                case 404:
                    message.error('请求的资源不存在')
                    break
                case 500:
                    message.error('服务器内部错误')
                    break
                default:
                    message.error('网络错误')
            }
        } else {
            message.error('网络连接失败')
        }

        return Promise.reject(error)
    }
)

export default request
