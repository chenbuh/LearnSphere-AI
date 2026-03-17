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
  signal,
  retries = 2
}) {
  const normalizedText = (text || '').trim()
  if (!normalizedText) {
    console.warn('[TTS] Empty text provided')
    return null
  }

  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      console.debug(`[TTS] Retry attempt ${attempt}/${retries}`)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.warn('[TTS] Request timeout after', timeoutMs, 'ms')
      controller.abort()
    }, timeoutMs)
    const cleanupAbortListener = signal
      ? () => signal.removeEventListener('abort', abortHandler)
      : () => {}

    function abortHandler() {
      console.debug('[TTS] Request aborted by external signal')
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

      console.debug('[TTS] Fetching audio from /api/tts/edge, text length:', normalizedText.length, 'attempt:', attempt + 1)

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

      console.debug('[TTS] Response status:', response.status, 'Content-Type:', response.headers.get('content-type'))

      if (!response.ok) {
        const detail = await readTtsFailureMessage(response)
        console.error('[TTS] Request failed:', response.status, detail)
        lastError = new Error(detail || `HTTP ${response.status}`)
        clearTimeout(timeoutId)
        cleanupAbortListener()
        continue
      }

      const contentType = (response.headers.get('content-type') || '').toLowerCase()
      if (!contentType.includes('audio')) {
        const detail = await readTtsFailureMessage(response)
        console.error('[TTS] Non-audio response:', contentType, detail)
        lastError = new Error(detail || `Non-audio response: ${contentType || 'unknown'}`)
        clearTimeout(timeoutId)
        cleanupAbortListener()
        continue
      }

      const rawBlob = await response.blob()
      console.debug('[TTS] Received blob, size:', rawBlob.size, 'type:', rawBlob.type)

      const audioBlob = rawBlob.type && rawBlob.type.startsWith('audio/')
        ? rawBlob
        : new Blob([rawBlob], { type: 'audio/mpeg' })

      if (!audioBlob || audioBlob.size === 0) {
        console.error('[TTS] Empty audio payload')
        lastError = new Error('Empty audio payload')
        clearTimeout(timeoutId)
        cleanupAbortListener()
        continue
      }

      const blobUrl = URL.createObjectURL(audioBlob)
      console.info('[TTS] Audio blob URL created successfully on attempt', attempt + 1)
      clearTimeout(timeoutId)
      cleanupAbortListener()
      return blobUrl
    } catch (error) {
      clearTimeout(timeoutId)
      cleanupAbortListener()

      if (error?.name === 'AbortError') {
        console.debug('[TTS] Request aborted on attempt', attempt + 1)
        lastError = error
      } else {
        console.error('[TTS] Fetch error on attempt', attempt + 1, ':', error)
        lastError = error
      }
    }
  }

  console.error('[TTS] All retry attempts failed')
  throw lastError || new Error('Failed to fetch TTS audio after retries')
}
