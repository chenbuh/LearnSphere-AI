/**
 * HTML 转义工具。
 *
 * 背景：项目里有多处 `v-html` 用来渲染带 Markdown 轻量格式的文本（AI 回复、
 * 题目内容等）。这些渲染函数此前只做 `**bold**` / `` `code` `` 之类的替换，
 * **完全没有做 HTML 转义**，导致文本里若出现 `<img src=x onerror=...>`
 * 会被浏览器当作真实标签执行。
 *
 * 正确做法是「先转义、再替换」：把用户/模型内容中的 `<` `>` `&` 等字符变成
 * 实体，之后自己再插入的 `<strong>` 才是唯一被浏览器解释的标签。
 *
 * 注意：本工具只适合「纯文本 + 少量 Markdown」场景。不要用它处理本来
 * 就含合法 HTML 的内容（那样会把合法标签也转义掉），那种场景需要的是
 * 白名单净化（DOMPurify 之类）。
 */

/** 需要转义的字符到实体的映射。 */
const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

/**
 * 把文本中的 HTML 特殊字符转成实体。
 *
 * `&` 必须第一个替换，否则会把后面生成的实体（如 `&lt;`）再转一次变成
 * `&amp;lt;`，显示出来就是字面量 `&lt;` 而不是 `<`。
 *
 * @param {unknown} value 任意值，非字符串会先转成字符串，null/undefined 变空串
 * @returns {string} 可安全插入 v-html 的文本
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/[&<>"']/g, char => ESCAPE_MAP[char])
}

/**
 * 把纯文本渲染成「安全 + 支持轻量 Markdown」的 HTML。
 *
 * 支持的语法：
 * - `**粗体**`
 * - `*斜体*`
 * - `` `行内代码` ``
 * - 换行 → `<br>`
 *
 * 处理顺序很关键：**先转义整个文本，再做 Markdown 替换**。反过来做的话，
 * 替换产生的 `<strong>` 会被后续转义毁掉；而先转义后替换，只有我们自己
 * 插入的标签是活的。
 *
 * @param {unknown} value 原始文本
 * @returns {string} 可安全用于 v-html 的 HTML
 */
export function renderSafeMarkdown(value) {
  const escaped = escapeHtml(value)
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

/**
 * 只做换行转换的安全渲染，用于题目正文这类不需要 Markdown 的内容。
 *
 * @param {unknown} value 原始文本
 * @returns {string} 可安全用于 v-html 的 HTML
 */
export function renderSafeLineBreaks(value) {
  return escapeHtml(value).replace(/\n/g, '<br/>')
}
