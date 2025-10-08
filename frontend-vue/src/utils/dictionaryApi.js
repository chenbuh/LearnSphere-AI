/**
 * 词典API工具 - 从免费词典API获取单词例句
 */

// 例句缓存
const exampleCache = new Map()

/**
 * 从免费词典API获取单词例句
 * @param {string} word - 单词
 * @returns {Promise<{en: string, cn: string}>}
 */
export async function fetchExampleFromApi(word) {
  const lowerWord = word.toLowerCase().trim()
  
  // 检查缓存
  if (exampleCache.has(lowerWord)) {
    return exampleCache.get(lowerWord)
  }
  
  try {
    // 使用免费的 Free Dictionary API
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${lowerWord}`)
    
    if (response.ok) {
      const data = await response.json()
      
      // 查找例句
      for (const entry of data) {
        for (const meaning of entry.meanings || []) {
          for (const def of meaning.definitions || []) {
            if (def.example) {
              const result = {
                en: def.example,
                cn: '' // API不提供中文翻译，留空
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

/**
 * 根据单词词性生成合适的例句
 */
const categoryTemplates = {
  // 名词
  n: [
    { en: (w) => `The ${w} is essential for success.`, cn: (w, m) => `${m}对成功至关重要。` },
    { en: (w) => `We discussed the ${w} in detail.`, cn: (w, m) => `我们详细讨论了${m}。` },
    { en: (w) => `The ${w} has changed significantly.`, cn: (w, m) => `${m}发生了显著变化。` },
    { en: (w) => `Understanding the ${w} is important.`, cn: (w, m) => `理解${m}很重要。` },
    { en: (w) => `The ${w} affects our daily life.`, cn: (w, m) => `${m}影响着我们的日常生活。` }
  ],
  noun: [
    { en: (w) => `The ${w} is essential for success.`, cn: (w, m) => `${m}对成功至关重要。` },
    { en: (w) => `We discussed the ${w} in detail.`, cn: (w, m) => `我们详细讨论了${m}。` },
    { en: (w) => `The ${w} has changed significantly.`, cn: (w, m) => `${m}发生了显著变化。` }
  ],
  // 动词
  v: [
    { en: (w) => `She decided to ${w} the problem.`, cn: (w, m) => `她决定${m}这个问题。` },
    { en: (w) => `We need to ${w} more carefully.`, cn: (w, m) => `我们需要更仔细地${m}。` },
    { en: (w) => `They ${w} every day to improve.`, cn: (w, m) => `他们每天${m}以求进步。` },
    { en: (w) => `It is wise to ${w} before acting.`, cn: (w, m) => `行动前${m}是明智的。` },
    { en: (w) => `He learned to ${w} effectively.`, cn: (w, m) => `他学会了有效地${m}。` }
  ],
  verb: [
    { en: (w) => `She decided to ${w} the problem.`, cn: (w, m) => `她决定${m}这个问题。` },
    { en: (w) => `We need to ${w} more carefully.`, cn: (w, m) => `我们需要更仔细地${m}。` },
    { en: (w) => `They ${w} every day to improve.`, cn: (w, m) => `他们每天${m}以求进步。` }
  ],
  // 形容词
  adj: [
    { en: (w) => `The colors in the painting are very ${w}.`, cn: (w, m) => `画中的颜色非常${m}。` },
    { en: (w) => `Her description was remarkably ${w}.`, cn: (w, m) => `她的描述非常${m}。` },
    { en: (w) => `The ${w} details caught my attention.`, cn: (w, m) => `${m}的细节引起了我的注意。` },
    { en: (w) => `His memory of the event is still ${w}.`, cn: (w, m) => `他对那件事的记忆仍然${m}。` },
    { en: (w) => `The experience left a ${w} impression.`, cn: (w, m) => `这次经历留下了${m}的印象。` }
  ],
  adjective: [
    { en: (w) => `The colors in the painting are very ${w}.`, cn: (w, m) => `画中的颜色非常${m}。` },
    { en: (w) => `Her description was remarkably ${w}.`, cn: (w, m) => `她的描述非常${m}。` },
    { en: (w) => `The ${w} details caught my attention.`, cn: (w, m) => `${m}的细节引起了我的注意。` }
  ],
  // 副词
  adv: [
    { en: (w) => `She explained the concept ${w}.`, cn: (w, m) => `她${m}地解释了这个概念。` },
    { en: (w) => `The team worked ${w} together.`, cn: (w, m) => `团队${m}地合作。` },
    { en: (w) => `He ${w} completed the task.`, cn: (w, m) => `他${m}完成了任务。` },
    { en: (w) => `The situation changed ${w}.`, cn: (w, m) => `情况${m}地改变了。` }
  ],
  adverb: [
    { en: (w) => `She explained the concept ${w}.`, cn: (w, m) => `她${m}地解释了这个概念。` },
    { en: (w) => `The team worked ${w} together.`, cn: (w, m) => `团队${m}地合作。` },
    { en: (w) => `He ${w} completed the task.`, cn: (w, m) => `他${m}完成了任务。` }
  ]
}

/**
 * 根据词性生成例句
 */
export function generateExampleByCategory(word, meaning, category) {
  const cat = (category || 'n').toLowerCase()
  const templates = categoryTemplates[cat] || categoryTemplates.n
  const template = templates[Math.floor(Math.random() * templates.length)]
  
  // 提取中文含义的第一个词
  const shortMeaning = meaning ? meaning.split(/[;；,，]/)[0].replace(/[a-zA-Z.&]/g, '').trim() : word
  
  return {
    en: template.en(word),
    cn: template.cn(word, shortMeaning || word)
  }
}
