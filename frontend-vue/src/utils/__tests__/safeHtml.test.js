import { describe, it, expect } from 'vitest'
import { escapeHtml, renderSafeMarkdown, renderSafeLineBreaks } from '../safeHtml'

/**
 * 这组测试保护的是 XSS 防护。
 *
 * 每条用例都对应一个真实的攻击载荷，不是「随便测测」——
 * 如果哪天有人觉得「转义多余」而删掉 escapeHtml，
 * 这些用例必须变红。
 */
describe('escapeHtml', () => {
  it('转义全部 HTML 特殊字符', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(escapeHtml('a & b')).toBe('a &amp; b')
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;')
    expect(escapeHtml("it's")).toBe('it&#39;s')
  })

  it('先处理 & 避免二次转义', () => {
    // 如果先替换 < 再替换 &，`&lt;` 会被再次转成 `&amp;lt;`，
    // 页面显示成字面量 `&lt;` 而不是 `<`
    expect(escapeHtml('<')).toBe('&lt;')
    expect(escapeHtml('&lt;')).toBe('&amp;lt;')
  })

  it('空值安全', () => {
    expect(escapeHtml(null)).toBe('')
    expect(escapeHtml(undefined)).toBe('')
    expect(escapeHtml('')).toBe('')
  })

  it('数字与布尔值不会抛异常', () => {
    expect(escapeHtml(0)).toBe('0')
    expect(escapeHtml(false)).toBe('false')
  })
})

describe('renderSafeMarkdown', () => {
  it('拦截 img onerror 攻击载荷', () => {
    const payload = '<img src=x onerror="alert(document.cookie)">'
    const html = renderSafeMarkdown(payload)

    // 关键断言：不能出现可执行的 <img 标签
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
  })

  it('拦截 script 标签', () => {
    const html = renderSafeMarkdown('<script>fetch("//evil")</script>')
    expect(html).not.toContain('<script')
    expect(html).toContain('&lt;script')
  })

  it('拦截 svg onload 攻击', () => {
    const html = renderSafeMarkdown('<svg onload=alert(1)>')
    expect(html).not.toContain('<svg')
    expect(html).toContain('&lt;svg')
  })

  it('保留 Markdown 格式且插入的是真实标签', () => {
    const html = renderSafeMarkdown('**粗体** 和 *斜体* 和 `代码`')
    expect(html).toContain('<strong>粗体</strong>')
    expect(html).toContain('<em>斜体</em>')
    expect(html).toContain('<code>代码</code>')
  })

  it('Markdown 与攻击载荷混在一起时仍然安全', () => {
    // 最容易出错的场景：攻击载荷藏在 Markdown 标记里
    const html = renderSafeMarkdown('**<img src=x onerror=alert(1)>**')
    expect(html).toContain('<strong>')
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
  })

  it('换行转成 br', () => {
    expect(renderSafeMarkdown('第一行\n第二行')).toBe('第一行<br>第二行')
  })

  it('反引号内的尖括号也被转义', () => {
    const html = renderSafeMarkdown('`<b>x</b>`')
    expect(html).not.toContain('<b>')
    expect(html).toContain('&lt;b&gt;')
  })
})

describe('renderSafeLineBreaks', () => {
  it('转义并保留换行', () => {
    const html = renderSafeLineBreaks('题目 <script>x</script>\n第二行')
    expect(html).not.toContain('<script')
    expect(html).toContain('<br/>')
  })

  it('不做 Markdown 替换', () => {
    // 题目正文不需要 Markdown，星号应原样保留
    expect(renderSafeLineBreaks('**not bold**')).toBe('**not bold**')
  })
})
