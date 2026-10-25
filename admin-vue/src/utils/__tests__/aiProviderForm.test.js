import { describe, expect, it } from 'vitest'
import { buildProviderConfigPayload, normalizeEffort, validateProviderUrl } from '../aiProviderForm'

describe('AI service configuration form', () => {
  it('sends a URL, model and replacement key with surrounding whitespace removed', () => {
    expect(
      buildProviderConfigPayload(
        {
          apiUrl: ' https://gateway.example.test/v1/ ',
          model: ' custom-model ',
          apiKey: ' sk-test ',
          reasoningEffort: 'medium'
        },
        {}
      )
    ).toEqual({
      apiUrl: 'https://gateway.example.test/v1/',
      model: 'custom-model',
      apiKey: 'sk-test',
      reasoningEffort: 'medium'
    })
  })

  it('omits a blank key when one is already configured', () => {
    expect(
      buildProviderConfigPayload(
        {
          apiUrl: 'https://gateway.example.test/v1',
          model: 'custom-model',
          apiKey: '',
          reasoningEffort: 'off'
        },
        { apiKeyConfigured: true }
      )
    ).toEqual({
      apiUrl: 'https://gateway.example.test/v1',
      model: 'custom-model',
      reasoningEffort: 'off'
    })
  })

  it('requires a key for the first configuration and a model ID', () => {
    expect(() =>
      buildProviderConfigPayload(
        { apiUrl: 'https://gateway.example.test/v1', model: 'custom-model', apiKey: '' },
        {}
      )
    ).toThrow('API Key')
    expect(() =>
      buildProviderConfigPayload(
        { apiUrl: 'https://gateway.example.test/v1', model: '', apiKey: 'sk-test' },
        {}
      )
    ).toThrow('模型')
  })

  it('accepts a full completion URL and rejects credentials in URLs or unsupported protocols', () => {
    expect(validateProviderUrl('https://gateway.example.test/v1/chat/completions')).toBe(true)
    expect(validateProviderUrl('file:///key')).toBe(false)
    expect(validateProviderUrl('https://user:password@gateway.example.test/v1')).toBe(false)
    expect(validateProviderUrl('https://gateway.example.test/v1?key=secret')).toBe(false)
  })

  it('defaults reasoning effort to off when the field is absent', () => {
    expect(
      buildProviderConfigPayload(
        { apiUrl: 'https://gateway.example.test/v1', model: 'm', apiKey: 'sk' },
        {}
      ).reasoningEffort
    ).toBe('off')
  })

  it('normalizes unknown or malformed reasoning effort values to off', () => {
    expect(normalizeEffort('HIGH')).toBe('high')
    expect(normalizeEffort(' medium ')).toBe('medium')
    expect(normalizeEffort('turbo')).toBe('off')
    expect(normalizeEffort(null)).toBe('off')
    expect(normalizeEffort(undefined)).toBe('off')
    expect(normalizeEffort('')).toBe('off')
  })
})
