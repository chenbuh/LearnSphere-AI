import { describe, expect, it } from 'vitest'
import { buildProviderConfigPayload, validateProviderUrl } from '../aiProviderForm'

describe('AI service configuration form', () => {
  it('sends a URL, model and replacement key with surrounding whitespace removed', () => {
    expect(buildProviderConfigPayload({ apiUrl: ' https://gateway.example.test/v1/ ', model: ' custom-model ', apiKey: ' sk-test ' }, {}))
      .toEqual({ apiUrl: 'https://gateway.example.test/v1/', model: 'custom-model', apiKey: 'sk-test' })
  })

  it('omits a blank key when one is already configured', () => {
    expect(buildProviderConfigPayload({ apiUrl: 'https://gateway.example.test/v1', model: 'custom-model', apiKey: '' }, { apiKeyConfigured: true }))
      .toEqual({ apiUrl: 'https://gateway.example.test/v1', model: 'custom-model' })
  })

  it('requires a key for the first configuration and a model ID', () => {
    expect(() => buildProviderConfigPayload({ apiUrl: 'https://gateway.example.test/v1', model: 'custom-model', apiKey: '' }, {})).toThrow('API Key')
    expect(() => buildProviderConfigPayload({ apiUrl: 'https://gateway.example.test/v1', model: '', apiKey: 'sk-test' }, {})).toThrow('模型')
  })

  it('accepts a full completion URL and rejects credentials in URLs or unsupported protocols', () => {
    expect(validateProviderUrl('https://gateway.example.test/v1/chat/completions')).toBe(true)
    expect(validateProviderUrl('file:///key')).toBe(false)
    expect(validateProviderUrl('https://user:password@gateway.example.test/v1')).toBe(false)
    expect(validateProviderUrl('https://gateway.example.test/v1?key=secret')).toBe(false)
  })
})
