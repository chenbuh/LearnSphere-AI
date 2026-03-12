export const defaultAITutorCleanupStats = {
  expiredCount: 0,
  message: ''
}

export const defaultAITutorDashboardStats = {
  totalMessages: 0,
  activeSessions: 0,
  todayQuestions: 0,
  sensitiveIntercepts: 0
}

export const defaultAITutorPrompt = {
  content: '',
  promptKey: '',
  description: ''
}

export const defaultAITutorConfig = {
  activeModel: 'default',
  isOverridden: false
}

export function formatAITutorTime(time) {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

export function filterAITutorPrompts(promptList = []) {
  return promptList.filter((prompt) =>
    prompt.promptKey.startsWith('AI_TUTOR_') || prompt.promptKey === 'LEARNING_ADVICE_USER'
  )
}
