export const defaultSystemSettings = {
  'sys.site_name': '',
  'sys.announcement': '',
  'sys.user_registration': true,
  'sys.maintenance_mode': false,
  'sys.maintenance_message': '',
  'ai.limit.daily.0': 5,
  'ai.limit.daily.1': 50,
  'ai.limit.daily.2': 100,
  'ai.limit.daily.3': 200,
  quota_cost_reading: 2,
  quota_cost_writing_topic: 1,
  quota_cost_writing_eval: 3,
  quota_cost_listening: 2,
  quota_cost_grammar: 1,
  quota_cost_speaking_topic: 1,
  quota_cost_speaking_eval: 3,
  quota_cost_error_analysis: 2,
  quota_cost_speaking_mock: 5,
  quota_cost_mock_exam: 4,
  'ui.theme.primary_color': '#6366f1',
  'ui.theme.dark_mode': true
}

export const systemSettingsGroups = {
  basic: ['sys.site_name', 'sys.announcement'],
  aiQuota: ['ai.limit.daily.0', 'ai.limit.daily.1', 'ai.limit.daily.2', 'ai.limit.daily.3'],
  quotaCost: [
    'quota_cost_reading',
    'quota_cost_writing_topic',
    'quota_cost_writing_eval',
    'quota_cost_listening',
    'quota_cost_grammar',
    'quota_cost_speaking_topic',
    'quota_cost_speaking_eval',
    'quota_cost_error_analysis',
    'quota_cost_speaking_mock',
    'quota_cost_mock_exam'
  ]
}

const normalizeConfigValue = (value) => {
  if (typeof value !== 'string') {
    return value
  }

  if (value === 'true' || value === 'false') {
    return value === 'true'
  }

  if (value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value)
  }

  return value
}

export const buildSystemSettings = (configList = []) => {
  const nextConfigs = { ...defaultSystemSettings }

  configList.forEach((item) => {
    nextConfigs[item.configKey] = normalizeConfigValue(item.configValue)
  })

  return nextConfigs
}
