import axios from 'axios'
import { createDiscreteApi } from 'naive-ui'
import { triggerQuotaUpdate } from './quotaEvent'

const { message } = createDiscreteApi(['message'])

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000, // AI 生成试卷需要较长时间，设置为 120 秒
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('learnsphere-token')
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers['satoken'] = token // Backend still expects Sa-Token's default header
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

    // 统一处理响应
    if (data.code === 200) {
      // 如果是 AI 相关接口，自动触发配额更新
      const aiEndpoints = ['/ai-tutor/', '/reading/', '/writing/', '/listening/', '/mock-exam/']
      const url = response.config.url || ''
      if (aiEndpoints.some(endpoint => url.includes(endpoint))) {
        // 延迟 500ms 触发更新，确保后端配额已经更新
        setTimeout(() => {
          triggerQuotaUpdate()
        }, 500)
      }
      return data
    } else if (data.code === 401) {
      // 未登录或token过期
      localStorage.removeItem('learnsphere-token')
      localStorage.removeItem('userInfo')

      // 如果不在公共页面，则跳转到登录页
      const publicPaths = ['/', '/login', '/features', '/exams', '/pricing']
      if (!publicPaths.includes(window.location.pathname)) {
        message.error('登录已过期，请重新登录')
        window.location.href = '/login'
      }
      return Promise.reject(new Error(data.message))
    } else {
      // 其他错误
      message.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
  },
  error => {
    console.error('响应错误:', error)

    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          localStorage.removeItem('learnsphere-token')
          localStorage.removeItem('userInfo')
          const currentPath = window.location.pathname
          if (currentPath !== '/' && currentPath !== '/login') {
            message.error('未授权，请重新登录')
            window.location.href = '/login'
          }
          break
        case 403:
          message.error('没有权限访问')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 429:
          message.error('操作过于频繁，请稍后再试')
          break
        case 500:
          message.error('服务器内部错误')
          break
        default:
          message.error(data?.message || '网络错误')
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络')
    } else {
      message.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

export default request