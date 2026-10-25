export function validateProviderUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    )
  } catch {
    return false
  }
}

/** 推理强度档位，必须与后端 AIProviderConfigService 的 EFFORT_* 常量一致。 */
export const REASONING_EFFORTS = ['off', 'low', 'medium', 'high']

export function normalizeEffort(value) {
  const level = String(value || '')
    .trim()
    .toLowerCase()
  return REASONING_EFFORTS.includes(level) ? level : 'off'
}

export function buildProviderConfigPayload(form, config) {
  const apiUrl = String(form.apiUrl || '').trim()
  const model = String(form.model || '').trim()
  const apiKey = String(form.apiKey || '').trim()
  if (!validateProviderUrl(apiUrl)) throw new Error('请输入有效的 HTTP/HTTPS API URL')
  if (!model) throw new Error('请输入模型 ID')
  if (!apiKey && !config.apiKeyConfigured) throw new Error('请填写 API Key')
  const payload = { apiUrl, model, reasoningEffort: normalizeEffort(form.reasoningEffort) }
  if (apiKey) payload.apiKey = apiKey
  return payload
}
