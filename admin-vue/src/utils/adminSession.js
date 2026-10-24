// 后台没有独立登录页：管理员在前台登录页完成身份验证，再通过 URL hash 把 token 交给后台。
const TOKEN_KEY = 'admin-token'
const INFO_KEY = 'admin-info'
const LOGIN_ORIGIN_KEY = 'admin-login-origin'

const HANDOFF_TOKEN_PARAM = 'ls_admin_token'
const HANDOFF_ORIGIN_PARAM = 'ls_login_origin'

// 只接受同主机（端口可不同）的前台地址，避免被构造成开放跳转
const normalizeLoginOrigin = value => {
  try {
    const url = new URL(String(value || ''))
    if (!/^https?:$/.test(url.protocol)) return ''
    if (url.hostname !== window.location.hostname) return ''
    return url.origin
  } catch {
    return ''
  }
}

/** 读取前台交接过来的 token / 前台地址，并从地址栏清除 */
export function consumeAdminHandoff() {
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash.includes(HANDOFF_TOKEN_PARAM) && !hash.includes(HANDOFF_ORIGIN_PARAM)) return false

  const params = new URLSearchParams(hash)
  const token = params.get(HANDOFF_TOKEN_PARAM)
  const loginOrigin = normalizeLoginOrigin(params.get(HANDOFF_ORIGIN_PARAM))

  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.removeItem(INFO_KEY)
  }
  if (loginOrigin) {
    localStorage.setItem(LOGIN_ORIGIN_KEY, loginOrigin)
  }

  const { pathname, search } = window.location
  window.history.replaceState(window.history.state, '', pathname + search)
  return Boolean(token)
}

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/** 当前管理员信息（登录接口或 /admin/auth/info 返回），没有时返回 null */
export function getAdminInfo() {
  try {
    const raw = localStorage.getItem(INFO_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setAdminInfo(info) {
  if (info) {
    localStorage.setItem(INFO_KEY, JSON.stringify(info))
  }
}

export function getAdminRole() {
  return getAdminInfo()?.role || null
}

export function clearAdminSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(INFO_KEY)
}

/** 前台登录页地址，登录后可通过 redirect 回到后台原页面 */
// 没有记录前台地址时的兜底：开发环境后台在 5174，前台在 5173；生产环境同域
const defaultLoginOrigin = () => {
  const url = new URL(window.location.origin)
  if (import.meta.env.DEV && url.port === '5174') url.port = '5173'
  return url.origin
}

export function buildFrontendLoginUrl(adminPath = '/') {
  const origin =
    normalizeLoginOrigin(localStorage.getItem(LOGIN_ORIGIN_KEY)) || defaultLoginOrigin()
  const url = new URL('/login', origin)
  const path = String(adminPath || '/')
  url.searchParams.set('redirect', '/admin' + (path.startsWith('/') ? path : '/' + path))
  return url.href
}

export function redirectToFrontendLogin(adminPath) {
  clearAdminSession()
  window.location.replace(buildFrontendLoginUrl(adminPath))
}
