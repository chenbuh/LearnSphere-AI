/**
 * Dictionary utility for fetching and generating example sentences.
 */

import request from './request'

const exampleCache = new Map()
const translationCache = new Map()

const hasChinese = (text = '') => /[\u4E00-\u9FFF]/.test(text)

export async function translateExampleToChinese(text) {
  const source = (text || '').trim()
  if (!source) return ''
  if (hasChinese(source)) return source
  if (translationCache.has(source)) return translationCache.get(source)

  try {
    const res = await request.get('/vocabulary/translate-example', {
      params: { text: source }
    })
    const translated = (res?.data?.translation || '').trim()
    if (translated) {
      translationCache.set(source, translated)
      return translated
    }
  } catch (e) {
    console.warn('[DictionaryAPI] Failed to translate example:', e.message)
  }

  return ''
}

/**
 * Fetch example sentence from free dictionary API.
 * @param {string} word
 * @returns {Promise<{en: string, cn: string} | null>}
 */
export async function fetchExampleFromApi(word) {
  const lowerWord = (word || '').toLowerCase().trim()
  if (!lowerWord) return null

  if (exampleCache.has(lowerWord)) {
    return exampleCache.get(lowerWord)
  }

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${lowerWord}`)
    if (response.ok) {
      const data = await response.json()

      for (const entry of data) {
        for (const meaning of entry.meanings || []) {
          for (const def of meaning.definitions || []) {
            if (def.example) {
              const translatedCn = await translateExampleToChinese(def.example)
              const result = {
                en: def.example,
                cn: translatedCn || ''
              }
              exampleCache.set(lowerWord, result)
              return result
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn(`[DictionaryAPI] Failed to fetch example for "${word}":`, e.message)
  }

  return null
}

const categoryTemplates = {
  n: [
    { en: (w) => `The ${w} is essential for success.`, cn: (w, m) => `${m}对成功很重要。` },
    { en: (w) => `We discussed the ${w} in detail.`, cn: (w, m) => `我们详细讨论了${m}。` },
    { en: (w) => `Understanding the ${w} is important.`, cn: (w, m) => `理解${m}很重要。` }
  ],
  noun: [
    { en: (w) => `The ${w} is essential for success.`, cn: (w, m) => `${m}对成功很重要。` },
    { en: (w) => `We discussed the ${w} in detail.`, cn: (w, m) => `我们详细讨论了${m}。` }
  ],
  v: [
    { en: (w) => `She decided to ${w} the problem.`, cn: (w, m) => `她决定${m}这个问题。` },
    { en: (w) => `We need to ${w} more carefully.`, cn: (w, m) => `我们需要更仔细地${m}。` },
    { en: (w) => `They ${w} every day to improve.`, cn: (w, m) => `他们每天${m}以求进步。` }
  ],
  verb: [
    { en: (w) => `She decided to ${w} the problem.`, cn: (w, m) => `她决定${m}这个问题。` },
    { en: (w) => `We need to ${w} more carefully.`, cn: (w, m) => `我们需要更仔细地${m}。` }
  ],
  adj: [
    { en: (w) => `The colors in the painting are very ${w}.`, cn: (w, m) => `画中的颜色非常${m}。` },
    { en: (w) => `Her description was remarkably ${w}.`, cn: (w, m) => `她的描述非常${m}。` },
    { en: (w) => `The ${w} details caught my attention.`, cn: (w, m) => `${m}的细节吸引了我的注意。` }
  ],
  adjective: [
    { en: (w) => `The colors in the painting are very ${w}.`, cn: (w, m) => `画中的颜色非常${m}。` },
    { en: (w) => `Her description was remarkably ${w}.`, cn: (w, m) => `她的描述非常${m}。` }
  ],
  adv: [
    { en: (w) => `She explained the concept ${w}.`, cn: (w, m) => `她${m}地解释了这个概念。` },
    { en: (w) => `The team worked ${w} together.`, cn: (w, m) => `团队${m}地合作。` },
    { en: (w) => `He ${w} completed the task.`, cn: (w, m) => `他${m}地完成了任务。` }
  ],
  adverb: [
    { en: (w) => `She explained the concept ${w}.`, cn: (w, m) => `她${m}地解释了这个概念。` },
    { en: (w) => `The team worked ${w} together.`, cn: (w, m) => `团队${m}地合作。` }
  ]
}

const normalizeCategory = (word, category) => {
  let cat = (category || 'n').toLowerCase()
  const examTypes = ['primary', 'middle', 'high', 'cet4', 'cet6', 'tem4', 'tem8', 'ielts', 'toefl', 'gre', 'postgraduate', 'general']

  if (examTypes.includes(cat) || !categoryTemplates[cat]) {
    const lower = (word || '').toLowerCase()
    if (lower.endsWith('ly')) {
      const adjLy = ['costly', 'friendly', 'lovely', 'lonely', 'silly', 'ugly', 'holy']
      cat = adjLy.includes(lower) ? 'adj' : 'adv'
    } else if (lower.endsWith('able') || lower.endsWith('ible') || lower.endsWith('ive') || lower.endsWith('ous') || lower.endsWith('ful')) {
      cat = 'adj'
    } else if (lower.endsWith('ize') || lower.endsWith('ise') || lower.endsWith('ate') || lower.endsWith('ify')) {
      cat = 'v'
    } else {
      cat = 'n'
    }
  }

  return cat
}

const pickShortMeaning = (meaning, fallbackWord) => {
  if (!meaning) return fallbackWord

  const parts = String(meaning)
    .split(/[;；，、/\s]+/)
    .map((s) => s.replace(/[a-zA-Z0-9.&()\[\]]/g, '').trim())
    .filter((s) => s.length > 0)

  if (!parts.length) return fallbackWord
  return parts[0].slice(0, 5)
}

/**
 * Generate fallback example by part of speech.
 */
export function generateExampleByCategory(word, meaning, category) {
  const safeWord = (word || '').trim() || 'word'
  const cat = normalizeCategory(safeWord, category)
  const templates = categoryTemplates[cat] || categoryTemplates.n
  const template = templates[Math.floor(Math.random() * templates.length)]
  const shortMeaning = pickShortMeaning(meaning, safeWord)

  return {
    en: template.en(safeWord),
    cn: template.cn(safeWord, shortMeaning || safeWord)
  }
}
