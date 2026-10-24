import request from '@/utils/request'

/**
 * 认证相关API
 */
export const authApi = {
  /**
   * 用户登录
   * @param {Object} data - 登录数据
   * @param {string} data.username - 用户名
   * @param {string} data.password - 密码
   */
  login(data) {
    return request({
      url: '/auth/login',
      method: 'post',
      data
    })
  },

  /**
   * 管理员登录（前台登录页识别管理员账号后使用）
   * @param {Object} data - { username, password }
   */
  adminLogin(data) {
    return request({
      url: '/admin/auth/login',
      method: 'post',
      data
    })
  },

  /**
   * 管理员进入学习中心：用管理员 token 换取关联学习账号的用户 token
   * @param {string} adminToken - 管理员登录返回的 token
   */
  adminLearnerSession(adminToken) {
    return request({
      url: '/admin/auth/learner-session',
      method: 'post',
      headers: { satoken: adminToken }
    })
  },

  /**
   * 用户注册
   * @param {Object} data - 注册数据
   * @param {string} data.username - 用户名
   * @param {string} data.password - 密码
   * @param {string} data.email - 邮箱
   * @param {string} data.nickname - 昵称（可选）
   * @param {string} data.emailCode - 邮箱验证码（邮件服务开启时必填）
   */
  register(data) {
    return request({
      url: '/auth/register',
      method: 'post',
      data
    })
  },

  /**
   * 用户登出
   */
  logout() {
    return request({
      url: '/auth/logout',
      method: 'post'
    })
  },

  /**
   * 获取当前用户信息
   */
  getUserInfo() {
    return request({
      url: '/auth/info',
      method: 'get'
    })
  },

  /**
   * 邮件服务是否开启（未开启时注册不需要邮箱验证码）
   */
  getEmailStatus() {
    return request({
      url: '/auth/email-status',
      method: 'get',
      silent: true
    })
  },

  /**
   * 发送邮箱验证码
   * @param {Object} data
   * @param {string} data.email - 邮箱
   * @param {'register'|'reset'} data.scene - 场景
   */
  sendEmailCode(data) {
    return request({
      url: '/auth/email-code',
      method: 'post',
      data
    })
  },

  /**
   * 重置密码
   * @param {Object} data
   * @param {string} data.email - 注册邮箱
   * @param {string} data.code - 邮箱验证码
   * @param {string} data.password - 新密码
   */
  resetPassword(data) {
    return request({
      url: '/auth/reset-password',
      method: 'post',
      data
    })
  },

  /**
   * 获取验证码
   */
  getCaptcha() {
    return request({
      url: '/auth/captcha',
      method: 'get'
    })
  },

  /**
   * 检查是否需要验证码
   */
  checkCaptchaRequired(username) {
    return request({
      url: `/auth/captcha/required?username=${username}`,
      method: 'get'
    })
  }
}
