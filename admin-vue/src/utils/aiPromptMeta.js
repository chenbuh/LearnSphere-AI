const MODULE_DEFINITIONS = [
  {
    id: 'reading',
    label: '阅读理解',
    description: '阅读生成、历史素材与题目结构',
    color: 'info',
    prefixes: ['READING_']
  },
  {
    id: 'writing',
    label: '写作练习',
    description: '写作命题、批改与结果反馈',
    color: 'success',
    prefixes: ['WRITING_', 'EVALUATE_WRITING_']
  },
  {
    id: 'listening',
    label: '听力练习',
    description: '听力素材、题目和脚本生成',
    color: 'warning',
    prefixes: ['LISTENING_']
  },
  {
    id: 'vocabulary',
    label: '词汇学习',
    description: '词汇详情、释义和例句扩展',
    color: 'primary',
    prefixes: ['VOCAB_']
  },
  {
    id: 'mockExam',
    label: '模拟考试',
    description: '整卷生成与题型组合',
    color: 'error',
    prefixes: ['MOCK_EXAM_']
  },
  {
    id: 'grammar',
    label: '语法练习',
    description: '语法出题与知识点练习',
    color: 'default',
    prefixes: ['GRAMMAR_']
  },
  {
    id: 'speaking',
    label: '口语练习',
    description: '口语命题、模考、报告与评测',
    color: 'warning',
    prefixes: ['SPEAKING_', 'EVALUATE_SPEAKING_']
  },
  {
    id: 'tutor',
    label: 'AI 助教',
    description: '助教对话、建议与陪练策略',
    color: 'success',
    prefixes: ['AI_TUTOR_', 'LEARNING_ADVICE_']
  },
  {
    id: 'analysis',
    label: '分析与推荐',
    description: '错题深析、推荐引擎和简报',
    color: 'info',
    prefixes: ['DEEP_ANALYZE_', 'REC_ENGINE_', 'AI_BRIEFING', 'CONTENT_AUDIT']
  }
]

const DEFAULT_MODULE = {
  id: 'misc',
  label: '未分类',
  description: '暂未归类的提示词',
  color: 'default'
}

const STAGE_DEFINITIONS = {
  PRIMARY: { key: 'primary', label: '小学', color: 'success' },
  MIDDLE: { key: 'middle', label: '中考', color: 'warning' },
  HIGH: { key: 'high', label: '高考', color: 'error' },
  DEFAULT: { key: 'general', label: '通用', color: 'default' }
}

const STAGE_ORDER = {
  general: 0,
  primary: 1,
  middle: 2,
  high: 3
}

const hasSystemMarker = (key) => key.endsWith('_SYSTEM') || key.includes('_SYSTEM_')
const hasUserMarker = (key) => key.endsWith('_USER') || key.includes('_USER_')
const hasRulesMarker = (key) => key.endsWith('_ADVICE_RULES') || key.includes('_ADVICE_RULES_')

const KIND_DEFINITIONS = [
  { key: 'system', label: '系统提示词', color: 'primary', matcher: (key) => hasSystemMarker(key) },
  { key: 'user', label: '用户提示词', color: 'success', matcher: (key) => hasUserMarker(key) },
  { key: 'rules', label: '规则提示词', color: 'warning', matcher: (key) => hasRulesMarker(key) },
  { key: 'other', label: '其他模板', color: 'default', matcher: () => true }
]

const MODULE_OPTIONS = [{ label: '全部模块', value: 'all' }].concat(
  MODULE_DEFINITIONS.map((module) => ({
    label: module.label,
    value: module.id
  }))
)

const STAGE_OPTIONS = [
  { label: '全部学段', value: 'all' },
  { label: '通用', value: 'general' },
  { label: '小学', value: 'primary' },
  { label: '中考', value: 'middle' },
  { label: '高考', value: 'high' }
]

const normalizeKey = (promptKey) => String(promptKey || '').trim().toUpperCase()

export function getPromptModule(promptKey) {
  const normalizedKey = normalizeKey(promptKey)
  if (!normalizedKey) {
    return DEFAULT_MODULE
  }

  const matchedModule = MODULE_DEFINITIONS.find((module) =>
    module.prefixes.some((prefix) => normalizedKey.startsWith(prefix))
  )

  return matchedModule || DEFAULT_MODULE
}

export function getPromptStage(promptKey) {
  const normalizedKey = normalizeKey(promptKey)

  if (normalizedKey.endsWith('_PRIMARY')) return STAGE_DEFINITIONS.PRIMARY
  if (normalizedKey.endsWith('_MIDDLE')) return STAGE_DEFINITIONS.MIDDLE
  if (normalizedKey.endsWith('_HIGH')) return STAGE_DEFINITIONS.HIGH

  return STAGE_DEFINITIONS.DEFAULT
}

export function getPromptKind(promptKey) {
  const normalizedKey = normalizeKey(promptKey)
  return KIND_DEFINITIONS.find((kind) => kind.matcher(normalizedKey)) || KIND_DEFINITIONS[KIND_DEFINITIONS.length - 1]
}

export function buildPromptMeta(prompt) {
  const module = getPromptModule(prompt?.promptKey)
  const stage = getPromptStage(prompt?.promptKey)
  const kind = getPromptKind(prompt?.promptKey)
  const fallbackDescription = `${module.label} · ${stage.label} · ${kind.label}`

  return {
    ...prompt,
    module,
    stage,
    kind,
    displayDescription: prompt?.description || fallbackDescription
  }
}

export function isPromptDescriptionAutoManaged(promptKey) {
  return getPromptModule(promptKey).id !== DEFAULT_MODULE.id
}

export function groupPromptsByModule(prompts = []) {
  const groups = new Map()

  prompts.forEach((prompt) => {
    const metaPrompt = buildPromptMeta(prompt)
    const moduleId = metaPrompt.module.id
    if (!groups.has(moduleId)) {
      groups.set(moduleId, {
        ...metaPrompt.module,
        prompts: []
      })
    }
    groups.get(moduleId).prompts.push(metaPrompt)
  })

  return Array.from(groups.values())
    .sort((left, right) => {
      const leftIndex = MODULE_DEFINITIONS.findIndex((item) => item.id === left.id)
      const rightIndex = MODULE_DEFINITIONS.findIndex((item) => item.id === right.id)
      return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex)
    })
    .map((group) => ({
      ...group,
      prompts: group.prompts.sort((left, right) => {
        if (left.stage.key !== right.stage.key) {
          return (STAGE_ORDER[left.stage.key] ?? 999) - (STAGE_ORDER[right.stage.key] ?? 999)
        }
        return left.promptKey.localeCompare(right.promptKey, 'en')
      })
    }))
}

export function matchPromptKeyword(prompt, keyword) {
  const normalizedKeyword = String(keyword || '').trim().toLowerCase()
  if (!normalizedKeyword) {
    return true
  }

  return [
    prompt?.promptKey,
    prompt?.description,
    prompt?.displayDescription,
    prompt?.module?.label,
    prompt?.module?.description,
    prompt?.stage?.label,
    prompt?.kind?.label
  ]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(normalizedKeyword))
}

export const aiPromptModuleOptions = MODULE_OPTIONS
export const aiPromptStageOptions = STAGE_OPTIONS
