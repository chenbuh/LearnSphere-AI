export const DEFAULT_EDGE_TTS_VOICE = 'en-US-JennyNeural'

export function getEdgeTtsAuthToken() {
  if (typeof window === 'undefined') return ''
  const token = localStorage.getItem('learnsphere-token')
  if (!token || token === 'null' || token === 'undefined') return ''
  return token
}

async function readTtsFailureMessage(response) {
  try {
    const contentType = (response.headers.get('content-type') || '').toLowerCase()
    const cloned = response.clone()
    if (contentType.includes('application/json')) {
      const payload = await cloned.json()
      return payload?.message || payload?.msg || payload?.error || JSON.stringify(payload)
    }

    const text = await cloned.text()
    return (text || '').trim().slice(0, 180)
  } catch {
    return ''
  }
}

export async function fetchEdgeTtsAudioUrl({
  text,
  rate = 1,
  voice = DEFAULT_EDGE_TTS_VOICE,
  timeoutMs = 10000,
  signal
}) {
  const normalizedText = (text || '').trim()
  if (!normalizedText) {
    return null
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  const cleanupAbortListener = signal
    ? () => signal.removeEventListener('abort', abortHandler)
    : () => {}

  function abortHandler() {
    controller.abort()
  }

  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', abortHandler, { once: true })
    }
  }

  try {
    const headers = { 'Content-Type': 'application/json' }
    const authToken = getEdgeTtsAuthToken()
    if (authToken) {
      headers.satoken = authToken
    }

    const response = await fetch('/api/tts/edge', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text: normalizedText,
        voice,
        rate
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      const detail = await readTtsFailureMessage(response)
      throw new Error(detail || `HTTP ${response.status}`)
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase()
    if (!contentType.includes('audio')) {
      const detail = await readTtsFailureMessage(response)
      throw new Error(detail || `Non-audio response: ${contentType || 'unknown'}`)
    }

    const rawBlob = await response.blob()
    const audioBlob = rawBlob.type && rawBlob.type.startsWith('audio/')
      ? rawBlob
      : new Blob([rawBlob], { type: 'audio/mpeg' })

    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Empty audio payload')
    }

    return URL.createObjectURL(audioBlob)
  } finally {
    clearTimeout(timeoutId)
    cleanupAbortListener()
  }
}
