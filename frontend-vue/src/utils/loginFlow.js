/**
 * 前台登录的编排逻辑：先按学习账号登录，失败后再按管理员账号尝试一次。
 *
 * 抽成纯函数是为了能被单元测试覆盖，不必挂载整个 LoginView 组件。
 *
 * 为什么不再按错误文案判断（历史坑）：
 * 这里曾经写的是 `if (error.message === '用户不存在')` 才去尝试管理员登录。
 * 但后端为了避免账号枚举，已经把「用户不存在」和「密码错误」统一成
 * 「用户名或密码错误」，于是文案判断永远不成立，
 * 管理员在前台登录会直接看到「用户名或密码错误」，进不去。
 *
 * 现在改成只要学习账号登录失败就尝试管理员登录：
 * 管理员账号本就只存在于 admin 表、不在 user 表，多试一次没有副作用；
 * 普通用户输错密码时管理员校验同样失败，最终仍显示统一的错误提示，
 * 不会泄露账号是否存在。
 *
 * @param {object} params
 * @param {() => Promise<void>} params.loginAsLearner 学习账号登录，失败时抛错
 * @param {() => Promise<boolean>} params.tryAdminLogin 管理员登录，成功返回 true
 * @param {(error: unknown) => void} params.onLearnerError 学习账号登录失败时的回调（用于统一提示）
 * @returns {Promise<'learner' | 'admin' | 'failed'>}
 */
export async function runLoginFlow({ loginAsLearner, tryAdminLogin, onLearnerError }) {
  try {
    await loginAsLearner()
    return 'learner'
  } catch (error) {
    if (await tryAdminLogin()) {
      return 'admin'
    }
    onLearnerError(error)
    return 'failed'
  }
}
