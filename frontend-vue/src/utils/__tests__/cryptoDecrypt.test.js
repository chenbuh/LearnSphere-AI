import { describe, it, expect, beforeEach } from 'vitest'
import { decryptContent, decryptPayload, setServerKeyDate } from '../crypto'

/**
 * 后端 ContentSecurityUtil 的加密是 XOR + Base64，密钥为
 * `LrnSphere2026` + `YYYY-MM-DD`。这里在测试里复刻一份，
 * 用于验证前端解密。
 */
const STATIC_SALT = 'LrnSphere2026'

const encrypt = (plain, dateStr) => {
  const key = new TextEncoder().encode(STATIC_SALT + dateStr)
  const bytes = new TextEncoder().encode(plain)
  const out = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i += 1) {
    out[i] = bytes[i] ^ key[i % key.length]
  }
  let binary = ''
  for (let i = 0; i < out.length; i += 1) binary += String.fromCharCode(out[i])
  return btoa(binary)
}

const TODAY = '2026-10-29'

describe('decryptContent - 短加密串（曾因长度门槛漏解密）', () => {
  beforeEach(() => setServerKeyDate(TODAY))

  // 这些是本 bug 的核心用例：中文短释义加密后只有 4~8 个字符
  const shortWords = ['动物', '兽', '一', '的', '关于', '之后', '下', '大', '小', '水', '火', '山']

  shortWords.forEach(plain => {
    it(`解密短释义「${plain}」（密文 ${encrypt(plain, TODAY)}）`, () => {
      const encrypted = encrypt(plain, TODAY)
      expect(decryptContent(encrypted)).toBe(plain)
    })
  })

  it('「动物」的密文正是 qfjGtPnB，必须能解回中文', () => {
    expect(encrypt('动物', TODAY)).toBe('qfjGtPnB')
    expect(decryptContent('qfjGtPnB')).toBe('动物')
  })

  it('长释义照常解密', () => {
    const plain = '在...之后'
    expect(decryptContent(encrypt(plain, TODAY))).toBe(plain)
  })
})

describe('decryptContent - 明文不应被破坏', () => {
  beforeEach(() => setServerKeyDate(TODAY))

  it('明文中文原样返回', () => {
    expect(decryptContent('动物')).toBe('动物')
    expect(decryptContent('在...之后')).toBe('在...之后')
  })

  it('明文英文单词原样返回', () => {
    // 注意：纯字母且长度是 4 的倍数会被当成候选 Base64，
    // 但解出来不像正常文本，应回退原文
    expect(decryptContent('apple')).toBe('apple')
    expect(decryptContent('animal')).toBe('animal')
    expect(decryptContent('good')).toBe('good')
  })

  it('空值与非法输入原样返回', () => {
    expect(decryptContent('')).toBe('')
    expect(decryptContent(null)).toBe(null)
    expect(decryptContent(undefined)).toBe(undefined)
  })

  it('带空格或标点的英文原样返回', () => {
    expect(decryptContent('insist on')).toBe('insist on')
    expect(decryptContent('He said: "hello".')).toBe('He said: "hello".')
  })
})

describe('decryptContent - 密钥差一天仍能还原', () => {
  it('服务端用前一天密钥加密，前端按今天解也能修正', () => {
    setServerKeyDate(TODAY)
    const plain = '动物'
    const encryptedYesterday = encrypt(plain, '2026-10-28')
    // 前端拿到的是今天的 keyDate，但密文是昨天加密的 →
    // 应通过昨天/明天候选密钥修正
    expect(decryptContent(encryptedYesterday)).toBe(plain)
  })
})

describe('decryptPayload - 词汇分页对象', () => {
  beforeEach(() => setServerKeyDate(TODAY))

  it('短释义字段全部正确解密（复现线上乱码场景）', () => {
    // 模拟后端 encryptVocabularyPage 的结果
    const page = {
      records: [
        { word: 'animal', translation: encrypt('动物', TODAY), definition: encrypt('动物', TODAY) },
        {
          word: 'after',
          translation: encrypt('在...之后', TODAY),
          definition: encrypt('在...之后', TODAY)
        },
        { word: 'about', translation: encrypt('关于', TODAY), definition: encrypt('关于', TODAY) },
        { word: 'water', translation: encrypt('水', TODAY), definition: encrypt('水', TODAY) }
      ]
    }

    const result = decryptPayload(page)

    expect(result.records.map(r => r.translation)).toEqual(['动物', '在...之后', '关于', '水'])
    expect(result.records.map(r => r.definition)).toEqual(['动物', '在...之后', '关于', '水'])
  })

  it('word 字段本身不加密，保持原样', () => {
    const page = { records: [{ word: 'animal', translation: encrypt('动物', TODAY) }] }
    const result = decryptPayload(page)
    expect(result.records[0].word).toBe('animal')
  })
})
