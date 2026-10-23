/**
 * Build a URL for the separate admin application.
 * - 生产环境：后台和前台同域，由后端在 /admin/ 下提供。
 * - 开发环境：后台跑在自己的 vite dev server 上（默认同主机 5174 端口），
 *   可用 VITE_ADMIN_DEV_URL 覆盖，例如 http://192.168.1.49:5174。
 */
export function buildAdminEntryUrl(fullPath, { origin, dev = false, adminDevUrl = '' }) {
  const source = new URL(origin)
  const target = new URL(fullPath, source)
  if (!/^\/admin(?:\/|$)/.test(target.pathname) || target.origin !== source.origin) {
    throw new Error('Expected an admin application path')
  }

  let adminOrigin = source.origin
  if (dev) {
    if (/^https?:\/\//i.test(String(adminDevUrl).trim())) {
      adminOrigin = new URL(String(adminDevUrl).trim()).origin
    } else {
      const adminDev = new URL(source.origin)
      adminDev.port = '5174'
      adminOrigin = adminDev.origin
    }
  }

  const destination = new URL(target.pathname + target.search + target.hash, adminOrigin)
  if (destination.pathname === '/admin') destination.pathname = '/admin/'
  return destination.href
}

/** Recognize admin URLs in the learner router and perform a full-page handoff. */
export function createAdminEntryRoute(navigate) {
  return {
    path: '/admin/:pathMatch(.*)*',
    name: 'AdminEntry',
    meta: { externalAdmin: true },
    beforeEnter(to) {
      navigate(to.fullPath)
      return false
    }
  }
}
