/**
 * 前台登录的编排逻辑：先探测账号类型，再走对应的登录路径。
 *
 * 抽成纯函数是为了能被单元测试覆盖，不必挂载整个 LoginView 组件。
 *
 * ## 为什么不再按错误文案判断（历史坑）
 *
 * 这里曾经写的是 `if (error.message === '用户不存在')` 才去尝试管理员登录。
 * 但后端为了避免账号枚举，已经把「用户不存在」和「密码错误」统一成
 * 「用户名或密码错误」，于是文案判断永远不成立，
 * 管理员在前台登录会直接看到「用户名或密码错误」，进不去。
 *
 * ## 为什么要先探测，而不是无脑试两次
 *
 * 改成「失败就试管理员」能修好上面的问题，但会带来副作用：
 * 每次管理员登录都会先发一次注定失败的学习账号登录请求，
 * 而那次失败会给 Redis 里的 login_fail_count 加一。
 * 累积 3 次后，管理员再登录就会被要求输入验证码——明明密码是对的。
 *
 * 所以改成先调 /api/admin/auth/probe 问一句「这账号是管理员吗」：
 *   - 是 → 直接走管理员登录，不产生失败计数
 *   - 否 → 走学习账号登录
 *
 * 探测失败（网络异常等）时按「非管理员」处理，退回学习账号登录，
 * 保证接口不可用时普通用户仍能正常登录。
 *
 * @param {object} params
 * @param {(username: string) => Promise<boolean>} params.probeIsAdmin 探测是否为管理员
 * @param {string} params.username 登录用户名
 * @param {() => Promise<void>} params.loginAsLearner 学习账号登录，失败时抛错
 * @param {() => Promise<boolean>} params.tryAdminLogin 管理员登录，成功返回 true
 * @param {(error: unknown) => void} params.onError 登录失败时的回调（用于统一提示）
 * @returns {Promise<'learner' | 'admin' | 'failed'>}
 */
export async function runLoginFlow({
  probeIsAdmin,
  username,
  loginAsLearner,
  tryAdminLogin,
  onError
}) {
  // 探测本身不应阻断登录：拿不到结果就当作普通账号处理
  let isAdmin = false
  try {
    isAdmin = await probeIsAdmin(username)
  } catch {
    isAdmin = false
  }

  if (isAdmin) {
    if (await tryAdminLogin()) {
      return 'admin'
    }
    // 管理员账号存在但密码错误：不要再去试学习账号登录，
    // 否则会给同一个用户名累加一次无谓的失败计数。
    onError(new Error('用户名或密码错误'))
    return 'failed'
  }

  try {
    await loginAsLearner()
    return 'learner'
  } catch (error) {
    onError(error)
    return 'failed'
  }
}
