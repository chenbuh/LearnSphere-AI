import { createModel } from 'vosk-browser'
import logger from '@/utils/logger'

const DEFAULT_MODEL_URL = import.meta.env.VITE_VOSK_MODEL_URL || '/models/vosk/vosk-model-small-en-us-0.15.tar.gz'
const VOSK_SAMPLE_RATE = 16000

let sharedModel = null
let sharedModelPromise = null
const FINAL_RESULT_TIMEOUT_MS = 1200

const isEnglishLang = (lang = '') => String(lang || '').toLowerCase().startsWith('en')

export const isVoskLanguageSupported = (lang = '') => isEnglishLang(lang)

export const getVoskDisplayLanguage = (lang = '') => (isEnglishLang(lang) ? 'en-US' : 'en-US')

export async function ensureVoskModel() {
  if (sharedModel) {
    return sharedModel
  }

  if (!sharedModelPromise) {
    logger.log(`[Vosk] Loading model from ${DEFAULT_MODEL_URL}`)
    sharedModelPromise = createModel(DEFAULT_MODEL_URL, -2)
      .then((model) => {
        sharedModel = model
        logger.log('[Vosk] Model loaded successfully.')
        return model
      })
      .catch((error) => {
        sharedModelPromise = null
        logger.error('[Vosk] Model load failed', error)
        throw error
      })
  }

  return sharedModelPromise
}

const mergeFloat32Chunks = (chunks = []) => {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return new Float32Array(0)
  }

  const totalLength = chunks.reduce((sum, chunk) => sum + (chunk?.length || 0), 0)
  const merged = new Float32Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    if (!chunk?.length) {
      continue
    }
    merged.set(chunk, offset)
    offset += chunk.length
  }

  return merged
}

const extractMonoPcmFromAudioBuffer = (audioBuffer) => {
  if (!audioBuffer || !audioBuffer.numberOfChannels) {
    return new Float32Array(0)
  }

  const channelCount = audioBuffer.numberOfChannels
  const frameCount = audioBuffer.length

  if (channelCount === 1) {
    return new Float32Array(audioBuffer.getChannelData(0))
  }

  const mono = new Float32Array(frameCount)
  for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
    const channelData = audioBuffer.getChannelData(channelIndex)
    for (let sampleIndex = 0; sampleIndex < frameCount; sampleIndex += 1) {
      mono[sampleIndex] += channelData[sampleIndex]
    }
  }

  for (let sampleIndex = 0; sampleIndex < frameCount; sampleIndex += 1) {
    mono[sampleIndex] /= channelCount
  }

  return mono
}

const getPcmStats = (pcmData) => {
  if (!pcmData?.length) {
    return { maxAbs: 0, rms: 0 }
  }

  let maxAbs = 0
  let powerSum = 0
  for (let index = 0; index < pcmData.length; index += 1) {
    const sample = pcmData[index]
    const abs = Math.abs(sample)
    if (abs > maxAbs) {
      maxAbs = abs
    }
    powerSum += sample * sample
  }

  return {
    maxAbs,
    rms: Math.sqrt(powerSum / pcmData.length)
  }
}

const trimSilence = (pcmData, sampleRate, threshold = 0.01) => {
  if (!pcmData?.length) {
    return pcmData
  }

  let start = 0
  let end = pcmData.length - 1

  while (start < pcmData.length && Math.abs(pcmData[start]) < threshold) {
    start += 1
  }

  while (end > start && Math.abs(pcmData[end]) < threshold) {
    end -= 1
  }

  if (start >= end) {
    return pcmData
  }

  const padding = Math.max(0, Math.floor((sampleRate || VOSK_SAMPLE_RATE) * 0.15))
  const paddedStart = Math.max(0, start - padding)
  const paddedEnd = Math.min(pcmData.length, end + padding + 1)
  return pcmData.slice(paddedStart, paddedEnd)
}

const normalizePcm = (pcmData, targetPeak = 0.85) => {
  if (!pcmData?.length) {
    return pcmData
  }

  const { maxAbs } = getPcmStats(pcmData)
  if (!maxAbs) {
    return pcmData
  }

  const gain = Math.min(targetPeak / maxAbs, 12)
  if (gain <= 1.05) {
    return pcmData
  }

  const normalized = new Float32Array(pcmData.length)
  for (let index = 0; index < pcmData.length; index += 1) {
    normalized[index] = Math.max(-1, Math.min(1, pcmData[index] * gain))
  }
  return normalized
}

const resamplePcm = async (pcmData, sourceSampleRate, targetSampleRate = VOSK_SAMPLE_RATE) => {
  if (!pcmData?.length || !sourceSampleRate || sourceSampleRate === targetSampleRate) {
    return pcmData
  }

  const sourceContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: sourceSampleRate })
  try {
    const sourceBuffer = sourceContext.createBuffer(1, pcmData.length, sourceSampleRate)
    sourceBuffer.copyToChannel(pcmData, 0)

    const targetLength = Math.max(1, Math.round((pcmData.length * targetSampleRate) / sourceSampleRate))
    const offlineContext = new OfflineAudioContext(1, targetLength, targetSampleRate)
    const source = offlineContext.createBufferSource()
    source.buffer = sourceBuffer
    source.connect(offlineContext.destination)
    source.start(0)

    const rendered = await offlineContext.startRendering()
    return new Float32Array(rendered.getChannelData(0))
  } finally {
    try {
      await sourceContext.close()
    } catch (error) {}
  }
}

const preprocessPcmForRecognition = async (pcmData, sampleRate = VOSK_SAMPLE_RATE) => {
  if (!pcmData?.length) {
    return {
      pcmData: new Float32Array(0),
      sampleRate: VOSK_SAMPLE_RATE,
      beforeStats: { maxAbs: 0, rms: 0 },
      afterStats: { maxAbs: 0, rms: 0 }
    }
  }

  const beforeStats = getPcmStats(pcmData)
  let processed = trimSilence(pcmData, sampleRate)
  processed = normalizePcm(processed)
  processed = await resamplePcm(processed, sampleRate, VOSK_SAMPLE_RATE)
  const afterStats = getPcmStats(processed)

  return {
    pcmData: processed,
    sampleRate: VOSK_SAMPLE_RATE,
    beforeStats,
    afterStats
  }
}

const waitForRecognizerFinalResult = (recognizer, triggerFinalization) => new Promise((resolve) => {
  if (!recognizer) {
    resolve('')
    return
  }

  let settled = false
  const finish = (value = '') => {
    if (settled) {
      return
    }
    settled = true
    clearTimeout(timeoutId)
    resolve(String(value || '').trim())
  }

  recognizer.on('result', (message) => {
    finish(message?.result?.text || '')
  })

  const timeoutId = setTimeout(() => finish(''), FINAL_RESULT_TIMEOUT_MS)

  try {
    triggerFinalization?.()
  } catch (error) {
    clearTimeout(timeoutId)
    logger.warn('[Vosk] Final result retrieval failed before the worker responded.', error)
    resolve('')
  }
})

export class VoskSpeechRecognizer {
  constructor(options = {}) {
    this.lang = getVoskDisplayLanguage(options.lang)
    this.onPartialResult = options.onPartialResult || (() => {})
    this.onFinalResult = options.onFinalResult || (() => {})
    this.onStatusChange = options.onStatusChange || (() => {})
    this.onError = options.onError || (() => {})

    this.model = null
    this.recognizer = null
    this.audioContext = null
    this.source = null
    this.processor = null
    this.silenceGain = null
    this.stream = null
    this.ownsStream = false
    this.isActive = false
    this.capturedPcmChunks = []
    this.sampleRate = VOSK_SAMPLE_RATE
    this.loggedFirstChunk = false
    this.lastFinalText = ''
  }

  async start(stream = null) {
    if (this.isActive) {
      return this.stream
    }

    this.model = await ensureVoskModel()
    this.stream = stream || await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: VOSK_SAMPLE_RATE
      }
    })
    this.ownsStream = !stream

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }

    this.sampleRate = this.audioContext.sampleRate || VOSK_SAMPLE_RATE
    this.capturedPcmChunks = []
    this.loggedFirstChunk = false
    this.lastFinalText = ''

    this.recognizer = new this.model.KaldiRecognizer(this.sampleRate)
    this.recognizer.setWords?.(true)
    this.recognizer.on('partialresult', (message) => {
      const partial = String(message?.result?.partial || '').trim()
      this.onPartialResult(partial)
    })
    this.recognizer.on('result', (message) => {
      const text = String(message?.result?.text || '').trim()
      if (!text || text === this.lastFinalText) {
        return
      }
      this.lastFinalText = text
      this.onFinalResult(text)
    })

    this.source = this.audioContext.createMediaStreamSource(this.stream)
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1)
    this.silenceGain = this.audioContext.createGain()
    this.silenceGain.gain.value = 0

    this.processor.onaudioprocess = (event) => {
      try {
        const monoInputData = extractMonoPcmFromAudioBuffer(event.inputBuffer)
        if (monoInputData?.length) {
          this.capturedPcmChunks.push(monoInputData)
          if (!this.loggedFirstChunk) {
            this.loggedFirstChunk = true
            logger.log(`[Vosk] Capturing microphone PCM. firstChunkSamples=${monoInputData.length}, sampleRate=${event.inputBuffer.sampleRate || this.sampleRate}, channels=${event.inputBuffer.numberOfChannels || 1}`)
          }
        }
        this.recognizer?.acceptWaveformFloat(monoInputData, event.inputBuffer.sampleRate || this.sampleRate)
      } catch (error) {
        logger.error('[Vosk] acceptWaveform failed', error)
        this.onError(error)
      }
    }

    this.source.connect(this.processor)
    this.processor.connect(this.silenceGain)
    this.silenceGain.connect(this.audioContext.destination)

    this.isActive = true
    this.onStatusChange('listening')
    logger.log(`[Vosk] Recognition started (${this.lang})`)
    return this.stream
  }

  async stop() {
    if (!this.isActive) {
      return {
        finalResultText: '',
        pcmData: new Float32Array(0),
        sampleRate: this.sampleRate
      }
    }

    this.isActive = false
    let finalResultText = ''

    try {
      finalResultText = await waitForRecognizerFinalResult(
        this.recognizer,
        () => this.recognizer?.retrieveFinalResult?.()
      )
    } catch (error) {
      logger.warn('[Vosk] retrieveFinalResult failed', error)
    }

    if (this.processor) {
      this.processor.onaudioprocess = null
      try {
        this.processor.disconnect()
      } catch (error) {}
      this.processor = null
    }

    if (this.source) {
      try {
        this.source.disconnect()
      } catch (error) {}
      this.source = null
    }

    if (this.silenceGain) {
      try {
        this.silenceGain.disconnect()
      } catch (error) {}
      this.silenceGain = null
    }

    if (this.recognizer) {
      try {
        this.recognizer.remove()
      } catch (error) {}
      this.recognizer = null
    }

    if (this.audioContext) {
      try {
        await this.audioContext.close()
      } catch (error) {}
      this.audioContext = null
    }

    if (this.stream && this.ownsStream) {
      this.stream.getTracks().forEach(track => track.stop())
    }

    this.stream = null
    this.ownsStream = false
    const pcmData = mergeFloat32Chunks(this.capturedPcmChunks)
    this.capturedPcmChunks = []
    logger.log(`[Vosk] Recognition stopped. pcmChunksMerged=${pcmData.length}, sampleRate=${this.sampleRate}, finalLength=${finalResultText.length}`)
    if (finalResultText && finalResultText !== this.lastFinalText) {
      this.lastFinalText = finalResultText
      this.onFinalResult(finalResultText)
    }
    this.onStatusChange('stopped')
    return {
      finalResultText,
      pcmData,
      sampleRate: this.sampleRate
    }
  }
}

export async function transcribePCMWithVosk(pcmData, sampleRate = VOSK_SAMPLE_RATE, options = {}) {
  if (!pcmData?.length) {
    return ''
  }

  const model = await ensureVoskModel()

  try {
    const processed = await preprocessPcmForRecognition(pcmData, sampleRate)
    logger.log(`[Vosk] PCM stats before preprocessing. maxAbs=${processed.beforeStats.maxAbs.toFixed(4)}, rms=${processed.beforeStats.rms.toFixed(4)}, samples=${pcmData.length}, sampleRate=${sampleRate}`)
    logger.log(`[Vosk] PCM stats after preprocessing. maxAbs=${processed.afterStats.maxAbs.toFixed(4)}, rms=${processed.afterStats.rms.toFixed(4)}, samples=${processed.pcmData.length}, sampleRate=${processed.sampleRate}`)
    if (!processed.pcmData?.length) {
      return ''
    }

    const recognizer = new model.KaldiRecognizer(processed.sampleRate)
    const finalChunks = []

    recognizer.on('result', (message) => {
      const text = String(message?.result?.text || '').trim()
      if (text) {
        finalChunks.push(text)
      }
    })

    try {
      recognizer.acceptWaveformFloat(processed.pcmData, processed.sampleRate)
      const trailingResult = await waitForRecognizerFinalResult(
        recognizer,
        () => recognizer.retrieveFinalResult?.()
      )
      if (trailingResult) {
        finalChunks.push(trailingResult)
      }
    } finally {
      recognizer.remove()
    }

    const transcript = finalChunks.join(' ').replace(/\s+/g, ' ').trim()
    logger.log(`[Vosk] PCM transcription completed. length=${transcript.length}`)
    return transcript
  } catch (error) {
    logger.error('[Vosk] PCM transcription failed', error)
    if (options.throwOnError) {
      throw error
    }
    return ''
  }
}

export async function transcribeAudioBlobWithVosk(audioBlob, options = {}) {
  if (!audioBlob || !audioBlob.size) {
    return ''
  }

  const model = await ensureVoskModel()
  const arrayBuffer = await audioBlob.arrayBuffer()
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()

  try {
    const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))
    const transcript = await transcribePCMWithVosk(
      extractMonoPcmFromAudioBuffer(decodedBuffer),
      decodedBuffer.sampleRate || VOSK_SAMPLE_RATE,
      options
    )
    logger.log(`[Vosk] Offline transcription completed. length=${transcript.length}`)
    return transcript
  } catch (error) {
    logger.error('[Vosk] Offline transcription failed', error)
    if (options.throwOnError) {
      throw error
    }
    return ''
  } finally {
    try {
      await audioContext.close()
    } catch (error) {}
  }
}
