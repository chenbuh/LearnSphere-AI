export function validateProviderUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname)
      && !url.username && !url.password && !url.search && !url.hash
  } catch {
    return false
  }
}

export function buildProviderConfigPayload(form, config) {
  const apiUrl = String(form.apiUrl || '').trim()
  const model = String(form.model || '').trim()
  const apiKey = String(form.apiKey || '').trim()
  if (!validateProviderUrl(apiUrl)) throw new Error('请输入有效的 HTTP/HTTPS API URL')
  if (!model) throw new Error('请输入模型 ID')
  if (!apiKey && !config.apiKeyConfigured) throw new Error('请填写 API Key')
  const payload = { apiUrl, model }
  if (apiKey) payload.apiKey = apiKey
  return payload
}
