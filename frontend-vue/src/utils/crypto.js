const STATIC_SALT = 'LrnSphere2026'

/**
 * 获取本地日期字符串 YYYY-MM-DD
 *
 * 注意：不能用 toISOString()。它返回的是 UTC 日期，而后端用的是
 * java.time.LocalDate.now()（服务器本地时区）。在 UTC+8 的 00:00~08:00 之间，
 * UTC 日期比本地日期早一天，导致密钥最后一位不同（'8' vs '7'），
 * 解密出来的文本会出现 n->a、?->/、?->0 这类字符损坏。
 */
const getLocalDateString = (offsetDays = 0) => {
  const now = new Date()
  if (offsetDays) {
    now.setDate(now.getDate() + offsetDays)
  }
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 服务端在响应里回传的密钥日期（Result.keyDate / payload._keyDate）。
 *
 * 这是最可靠的来源：后端用它加密，前端就用它解密，
 * 中间不存在"今天到底是几号"的歧义。
 */
let serverKeyDate = null

/** 记录服务端下发的密钥日期；传 null/非法值则清除 */
export const setServerKeyDate = date => {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    serverKeyDate = date
  } else if (date === null || date === undefined) {
    serverKeyDate = null
  }
}

/** 读取当前生效的密钥日期（优先服务端下发的） */
export const getServerKeyDate = () => serverKeyDate

/**
 * 获取动态密钥 (必须与后端 getDynamicKey 逻辑一致)
 *
 * 有服务端下发的日期时优先用它，这样即使浏览器与服务器时区不同，
 * 也一定和加密端对齐。
 */
const getDynamicKey = (offsetDays = 0) => {
  const base = serverKeyDate || getLocalDateString()
  if (offsetDays && serverKeyDate) {
    // 在服务端日期上做偏移
    const d = new Date(`${serverKeyDate}T00:00:00`)
    d.setDate(d.getDate() + offsetDays)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return new TextEncoder().encode(`${STATIC_SALT}${year}-${month}-${day}`)
  }
  const rawKey = STATIC_SALT + (offsetDays ? getLocalDateString(offsetDays) : base)
  return new TextEncoder().encode(rawKey)
}

/**
 * 密钥候选：当天、昨天、明天。
 *
 * 只要服务端和浏览器对"今天"的判断差一天（时区不同、跨零点、容器 UTC 等），
 * 单一密钥就会解出"看着像英文、其实有字符被改掉"的乱码，
 * 例如 insist on -> insist oa、空格 -> /、? -> 0。
 * 这类结果不会触发控制字符检查，所以需要额外判据兜底。
 */
const KEY_OFFSETS = [0, -1, 1]

/**
 * 统计解密结果里的"破损痕迹"。数值越小越可信，0 表示没有可疑之处。
 *
 * 注意这里只统计**几乎不可能出现在正常例句里**的形态，
 * 不用通用语言模型打分：否则 "and/or"、"he/she" 这类正常写法会被误判，
 * 反而把正确的当天密钥结果挤掉。当天密钥在打平时始终优先。
 */
const countArtifacts = text => {
  if (!text) return Number.MAX_SAFE_INTEGER
  let bad = 0

  // UTF-8 解码失败留下的替换符
  bad += (text.match(/\uFFFD/g) || []).length * 10
  // 控制字符
  bad += (text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []).length * 10

  // 字母数字直接黏连（"there0"）：正常英文例句里极少见
  bad += (text.match(/[a-zA-Z]\d/g) || []).length
  // 字母紧贴斜杠（"Who/the"）：排除 and/or、he/she、m/s 这类约定写法
  const slash = (text.match(/[a-zA-Z]\/[a-zA-Z]/g) || []).length
  bad += Math.max(0, slash - 1)
  // 词中间出现感叹号/尖括号等（"Who!the"、"there>"）
  bad += (text.match(/[a-zA-Z][!<>~^`|]/g) || []).length

  return bad
}

/**
 * 用单个密钥做 XOR 解密
 */
const xorDecode = (bytes, offsetDays) => {
  const keyBytes = getDynamicKey(offsetDays)
  const result = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    result[i] = bytes[i] ^ keyBytes[i % keyBytes.length]
  }
  return new TextDecoder('utf-8').decode(result)
}

/**
 * 判断一段文本是否"像正常的中文/英文内容"。
 *
 * 用于剔除 XOR 解出来的垃圾：加密串和明文都是纯 ASCII，
 * 单靠长度无法区分，必须看解出来的东西读不读得通。
 *
 * 正常内容：中文、拉丁字母、常见标点、空白。
 * 垃圾内容：出现大量控制字符、或解出来是随机字母串（如 qurB、qelguu3K）。
 */
const looksLikeRealText = text => {
  if (!text) return false
  // 含控制字符（换行/制表除外）一定不是正常内容
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(text)) return false
  // 含中文 → 一定是解密成功的正常内容（加密串本身是纯 ASCII）
  if (/[\u4e00-\u9fa5]/.test(text)) return true
  // 纯拉丁文本：要求至少有一个空格分隔的完整单词，且不是随机大小写混杂
  // 随机串特征：小写大写无规律跳变、无空格、长度短
  const trimmed = text.trim()
  if (!trimmed) return false
  // 出现"小写紧跟大写"的比例过高（如 qfjGtPnB / qelguu3K）说明是随机串
  const camelJumps = (trimmed.match(/[a-z][A-Z]/g) || []).length
  if (trimmed.length <= 20 && camelJumps >= 2 && !/\s/.test(trimmed)) return false
  // 一个可读的英文词至少要 3 个连续字母
  if (!/[A-Za-z]{3,}/.test(trimmed)) return false
  return true
}

/**
 * 解密 XOR + Base64 字符串
 *
 * 重要：不能只用长度判断是否加密。
 *
 * 后端用 XOR + Base64 加密，中文短词加密后同样很短：
 *   "动物"   -> "qfjGtPnB"   （8 字符）
 *   "水"     -> "qsLa"       （4 字符）
 * 旧实现要求 length > 8（外层）和 length >= 4（这里），导致小学段
 * 绝大多数基础词（释义只有 1~3 个汉字）被当成"不是加密串"原样显示，
 * 页面上就出现了 qfjGtPnB / qurB / qelguu3K 这类乱码选项。
 *
 * 现在改为：只要字符串是合法 Base64 且不含中文，就尝试解密，
 * 再用 looksLikeRealText 判断解出来的结果是否可信；不可信则回退原文。
 */
export const decryptContent = encodedData => {
  if (!encodedData || typeof encodedData !== 'string') return encodedData

  // 已经含中文说明是明文，不需要解密
  if (/[\u4e00-\u9fa5]/.test(encodedData)) return encodedData

  // 检查是否是 Base64 格式 (简单检查)
  const base64Regex = /^[A-Za-z0-9+/=]+$/
  if (!base64Regex.test(encodedData) || encodedData.length < 4) {
    // 不是有效的 Base64 格式，直接返回原文
    return encodedData
  }
  // Base64 长度必须是 4 的倍数，否则不是加密串
  if (encodedData.length % 4 !== 0) return encodedData

  try {
    // 1. Base64 解码 - 使用更安全的方法处理 UTF-8
    const binaryString = atob(encodedData)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // 2. 先用当天密钥解，只有在结果不够"像正常文本"时，
    //    才尝试昨天/明天的密钥（应对浏览器与服务器时区差一天）。
    let best = xorDecode(bytes, 0)
    let bestBad = countArtifacts(best)
    let bestLooksReal = looksLikeRealText(best)

    if (!bestLooksReal || bestBad > 0) {
      for (const offset of KEY_OFFSETS) {
        if (offset === 0) continue
        const decoded = xorDecode(bytes, offset)
        const bad = countArtifacts(decoded)
        const real = looksLikeRealText(decoded)
        // 优先选"像正常文本"的；同为正常或同为异常时再比破损分
        if ((real && !bestLooksReal) || (real === bestLooksReal && bad < bestBad)) {
          bestBad = bad
          best = decoded
          bestLooksReal = real
        }
      }
    }

    // 3. 解出来不像正常内容 → 说明传入的本来就是明文，按原文返回。
    //    这一步是关键：避免把已经可读的英文（如 "apple"）再异或成乱码。
    if (!bestLooksReal) {
      return encodedData
    }

    return best
  } catch (e) {
    // 如果解密失败，可能是因为不是加密格式，或者是历史数据
    // 静默返回原文，不打印错误
    return encodedData
  }
}

/**
 * 自动递归处理对象或数组中的加密字段
 */
export const decryptPayload = payload => {
  if (!payload) return payload

  // 处理数组
  if (Array.isArray(payload)) {
    return payload.map(item => decryptPayload(item))
  }

  // 处理对象
  if (typeof payload === 'object') {
    // 先取服务端下发的密钥日期（Result.keyDate 或 payload._keyDate），
    // 让本次解密用与加密端一致的密钥
    if (typeof payload.keyDate === 'string' || typeof payload._keyDate === 'string') {
      setServerKeyDate(payload.keyDate || payload._keyDate)
    }

    const decrypted = { ...payload }
    const sensitiveFields = [
      'content',
      'passage',
      'analysis',
      'suggestions',
      'tips',
      'hint',
      'explanation',
      'feedback',
      'script',
      'transcript',
      'transcription',
      'translation',
      'example',
      'exampleTranslation',
      'definition',
      'meaning',
      'cn' // meaning: translation 字段映射名; cn: examples 数组内中文翻译
    ]

    // 递归处理子属性
    Object.keys(decrypted).forEach(key => {
      const value = decrypted[key]

      /**
       * 只对可能是加密数据的字段尝试解密。
       *
       * 注意这里**不能**再用长度门槛。
       *
       * 曾经的写法是 `value.length > 8`，注释里说"短加密串也需要解密"，
       * 但阈值本身把最常见的短词挡在外面：中文短释义经 XOR+Base64 后
       * 依然很短——"动物"→"qfjGtPnB"（8 字符）、"水"→"qsLa"（4 字符）。
       * 于是小学/初中段大量基础词的释义根本没解密，界面上直接显示
       * qfjGtPnB 这类乱码；而长一点的释义（"在...之后"→16 字符）正常，
       * 造成"同一次测试里有的选项正常、有的乱码"这种诡异现象。
       *
       * 现在改为：只要是不含中文的字符串就交给 decryptContent，
       * 由它内部判断到底是不是加密串（解出来不像正常文本就原样返回）。
       */
      if (
        sensitiveFields.includes(key) &&
        typeof value === 'string' &&
        !/[\u4e00-\u9fa5]/.test(value)
      ) {
        decrypted[key] = decryptContent(value)
      } else if (value && typeof value === 'object') {
        decrypted[key] = decryptPayload(value)
      }
    })

    return decrypted
  }

  return payload
}
