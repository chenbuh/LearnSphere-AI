import logger from '@/utils/logger'

const getSpeechRecognitionConstructor = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export const isBrowserSpeechRecognitionSupported = () => Boolean(getSpeechRecognitionConstructor())

export class BrowserSpeechRecognizer {
  constructor(options = {}) {
    this.lang = options.lang || 'en-US'
    this.onPartialResult = options.onPartialResult || (() => {})
    this.onFinalResult = options.onFinalResult || (() => {})
    this.onStatusChange = options.onStatusChange || (() => {})
    this.onError = options.onError || (() => {})

    this.recognition = null
    this.isActive = false
    this.finalSegments = []
    this.lastFinalTranscript = ''
    this.lastEmittedText = ''
    this.stopResolver = null
  }

  async start() {
    if (this.isActive) {
      return
    }

    const RecognitionConstructor = getSpeechRecognitionConstructor()
    if (!RecognitionConstructor) {
      throw new Error('Browser speech recognition is not supported.')
    }

    this.finalSegments = []
    this.lastFinalTranscript = ''
    this.lastEmittedText = ''
    this.recognition = new RecognitionConstructor()
    this.recognition.lang = this.lang
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 1

    this.recognition.onstart = () => {
      this.isActive = true
      this.onStatusChange('listening')
      logger.log(`[BrowserSpeech] Recognition started (${this.lang})`)
    }

    this.recognition.onresult = (event) => {
      let interimTranscript = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const transcript = String(result?.[0]?.transcript || '').trim()
        if (!transcript) {
          continue
        }

        if (result.isFinal) {
          if (transcript === this.lastFinalTranscript) {
            continue
          }
          this.lastFinalTranscript = transcript
          if (transcript === this.lastEmittedText) {
            continue
          }
          this.lastEmittedText = transcript
          this.finalSegments.push(transcript)
          this.onFinalResult(transcript)
        } else {
          interimTranscript += `${transcript} `
        }
      }

      this.onPartialResult(interimTranscript.trim())
    }

    this.recognition.onerror = (event) => {
      const errorCode = String(event?.error || '').toLowerCase()
      logger.warn(`[BrowserSpeech] Recognition error: ${errorCode || 'unknown'}`)
      this.onError(event)
    }

    this.recognition.onend = () => {
      const finalText = this.finalSegments.join(' ').replace(/\s+/g, ' ').trim()
      this.isActive = false
      this.onStatusChange('stopped')
      logger.log(`[BrowserSpeech] Recognition ended. finalLength=${finalText.length}`)
      if (this.stopResolver) {
        this.stopResolver(finalText)
        this.stopResolver = null
      }
    }

    this.recognition.start()
  }

  async stop() {
    if (!this.recognition) {
      return { finalText: '' }
    }

    const finalText = await new Promise((resolve) => {
      this.stopResolver = resolve
      try {
        this.recognition.stop()
      } catch (error) {
        logger.warn('[BrowserSpeech] stop() failed, resolving with current final transcript.', error)
        resolve(this.finalSegments.join(' ').replace(/\s+/g, ' ').trim())
      }
    })

    this.recognition = null
    return { finalText }
  }
}
