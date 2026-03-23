import { onBeforeUnmount, ref } from 'vue'

export function useTextAudio(options = {}) {
  const currentAudio = ref(null)
  const notifyWarning = options.notifyWarning || (() => {})
  const logger = options.logger || console
  const autoPlayStorageKey = options.autoPlayStorageKey || 'user_autoplay_preference'

  const clampFiniteNumber = (value, fallback, min, max) => {
    const normalizedValue = Number(value)
    if (!Number.isFinite(normalizedValue)) {
      return fallback
    }

    return Math.min(max, Math.max(min, normalizedValue))
  }

  const normalizePlayOptions = (playOptions) => {
    if (typeof playOptions === 'boolean') {
      return { isAuto: playOptions }
    }

    return playOptions || {}
  }

  const isExpectedNativeTtsInterruption = (error) => {
    const errorCode = String(error?.error || error?.message || '').toLowerCase()
    return errorCode === 'interrupted' || errorCode === 'canceled' || errorCode === 'cancelled'
  }

  const createNativeTtsStartTimeoutError = () => {
    const error = new Error('Native TTS failed to start')
    error.code = 'native_tts_start_timeout'
    error.error = 'native_tts_start_timeout'
    return error
  }

  const buildDefaultOnlineSources = (text) => {
    const isSentence = text.includes(' ') || text.length > 30
    return isSentence
      ? [
          `https://api.frdic.com/api/v2/speech/speakweb?langid=en&txt=${encodeURIComponent(text)}`,
          `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`
        ]
      : [`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`]
  }

  const stopAudio = () => {
    if (currentAudio.value) {
      try {
        currentAudio.value.pause()
      } catch (error) {
        logger.warn?.('[Text Audio] Failed to pause current audio', error)
      }
      currentAudio.value = null
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }

  const playAudio = (text, playOptions = {}) => {
    if (!text) return

    const normalizedOptions = normalizePlayOptions(playOptions)
    if (normalizedOptions.isAuto) {
      const autoPlayEnabled = localStorage.getItem(autoPlayStorageKey) !== 'false'
      if (!autoPlayEnabled) return
    }

    stopAudio()

    if (normalizedOptions.isAuto) {
      setTimeout(() => tryPlayAudio(text, normalizedOptions), 100)
      return
    }

    tryPlayAudio(text, normalizedOptions)
  }

  const tryPlayAudio = (text, playOptions = {}) => {
    const mode = playOptions.mode || 'mixed'
    if (mode === 'native') {
      playNativeTTS(text, playOptions)
      return
    }

    const sources = playOptions.onlineSources || buildDefaultOnlineSources(text)
    if (!sources.length) {
      playNativeTTS(text, playOptions)
      return
    }

    tryOnlineSource(text, sources, 0, playOptions)
  }

  const tryOnlineSource = (text, sources, index, playOptions = {}) => {
    if (index >= sources.length) {
      playNativeTTS(text, playOptions)
      return
    }

    try {
      const audio = new Audio()
      currentAudio.value = audio

      let hasPlayed = false
      let hasErrored = false

      audio.onplay = () => {
        hasPlayed = true
      }

      audio.onended = () => {
        currentAudio.value = null
        playOptions.onEnd?.()
      }

      audio.onerror = () => {
        if (hasErrored) return
        hasErrored = true
        tryOnlineSource(text, sources, index + 1, playOptions)
      }

      audio.src = sources[index]
      if (typeof playOptions.audioVolume === 'number') {
        audio.volume = Math.max(0, Math.min(1, playOptions.audioVolume))
      }
      const playPromise = audio.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => playOptions.onStart?.())
          .catch(() => {
            if (hasPlayed || hasErrored) return
            hasErrored = true
            tryOnlineSource(text, sources, index + 1, playOptions)
          })
      }

      setTimeout(() => {
        if (!hasPlayed && !hasErrored) {
          hasErrored = true
          if (currentAudio.value) {
            currentAudio.value.pause()
            currentAudio.value = null
          }
          tryOnlineSource(text, sources, index + 1, playOptions)
        }
      }, 2000)
    } catch (error) {
      tryOnlineSource(text, sources, index + 1, playOptions)
    }
  }

  const warmVoices = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return []
    return window.speechSynthesis.getVoices()
  }

  const getPlaybackEnvironment = () => {
    if (typeof navigator === 'undefined') {
      return {
        isMobile: false,
        isIOS: false
      }
    }

    const userAgent = navigator.userAgent || ''
    return {
      isMobile: /Android|webOS|iPhone|iPad|iPod/i.test(userAgent),
      isIOS: /iPad|iPhone|iPod/.test(userAgent) && !(typeof window !== 'undefined' && window.MSStream)
    }
  }

  const playNativeTTS = (text, playOptions = {}) => {
    const playbackEnvironment = getPlaybackEnvironment()
    const nativeOptions = {
      lang: 'en-US',
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0,
      voiceSelector: null,
      ...playOptions.nativeOptions
    }
    const safeNativeOptions = {
      ...nativeOptions,
      rate: clampFiniteNumber(nativeOptions.rate, 0.9, 0.1, 10),
      pitch: clampFiniteNumber(nativeOptions.pitch, 1.0, 0, 2),
      volume: clampFiniteNumber(nativeOptions.volume, 1.0, 0, 1)
    }

    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        throw new Error('speechSynthesis not available')
      }

      window.speechSynthesis.cancel()

      const speakWithRetry = () => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = safeNativeOptions.lang
        utterance.rate = safeNativeOptions.rate
        utterance.pitch = safeNativeOptions.pitch
        utterance.volume = safeNativeOptions.volume

        let voices = warmVoices()
        if (voices.length === 0) {
          logger.log?.('[Text Audio] Waiting for voices to load...')

          if (playbackEnvironment.isMobile) {
            // iOS/Android often require speechSynthesis.speak to stay in the original tap gesture.
            logger.log?.('[Text Audio] Mobile browser detected, using default voice immediately')
            selectVoiceAndSpeak(utterance, [], text, playOptions, safeNativeOptions)
            return
          }

          window.speechSynthesis.onvoiceschanged = () => {
            voices = warmVoices()
            logger.log?.(`[Text Audio] Voices loaded: ${voices.length} voices available`)
            selectVoiceAndSpeak(utterance, voices, text, playOptions, safeNativeOptions)
          }

          setTimeout(() => {
            if (voices.length === 0) {
              logger.warn?.('[Text Audio] Timeout waiting for voices, using default')
              selectVoiceAndSpeak(utterance, [], text, playOptions, safeNativeOptions)
            }
          }, 3000)
          return
        }

        selectVoiceAndSpeak(utterance, voices, text, playOptions, safeNativeOptions)
      }

      if (playbackEnvironment.isMobile) {
        speakWithRetry()
      } else {
        setTimeout(speakWithRetry, 50)
      }
    } catch (error) {
      logger.error?.('[Text Audio] Native TTS not available:', error.message)
      notifyWarning('Audio playback is unavailable. Please check browser permissions and try again.')
      playOptions.onError?.(error)
    }
  }

  const selectVoiceAndSpeak = (utterance, voices, text, playOptions = {}, nativeOptions = {}) => {
    try {
      if (voices.length > 0) {
        const selectedVoice = typeof nativeOptions.voiceSelector === 'function'
          ? nativeOptions.voiceSelector(voices)
          : voices.find((item) => item.name.includes('Google') && item.lang.startsWith('en'))
            || voices.find((item) => item.lang === 'en-US')
            || voices.find((item) => item.lang.startsWith('en'))
            || voices[0]

        if (selectedVoice) {
          utterance.voice = selectedVoice
          logger.log?.('[Text Audio] Using voice:', selectedVoice.name)
        }
      } else {
        logger.log?.('[Text Audio] Using default voice (no voices available)')
      }

      let hasStarted = false
      let hasEnded = false
      let hasErrored = false

      utterance.onstart = () => {
        if (hasStarted) return
        hasStarted = true
        logger.log?.('[Text Audio] Native TTS playing')
        playOptions.onStart?.()
      }

      utterance.onend = () => {
        hasEnded = true
        logger.log?.('[Text Audio] Native TTS ended')
        playOptions.onEnd?.()
      }

      utterance.onerror = (error) => {
        hasErrored = true
        if (isExpectedNativeTtsInterruption(error)) {
          logger.debug?.('[Text Audio] Native TTS interrupted')
          playOptions.onError?.(error)
          return
        }

        logger.error?.('[Text Audio] Native TTS error:', error.error)
        if (!hasStarted) {
          notifyWarning('Audio playback is unavailable. Please try again.')
        }
        playOptions.onError?.(error)
      }

      logger.log?.('[Text Audio] Speaking:', text.substring(0, 50) + (text.length > 50 ? '...' : ''))
      window.speechSynthesis.speak(utterance)

      const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)
      if (!isMobile) return

      let checkCount = 0
      let hasRetriedStart = false
      const checkInterval = setInterval(() => {
        if (hasStarted || hasEnded || hasErrored) {
          clearInterval(checkInterval)
          return
        }

        checkCount += 1
        const synthesis = window.speechSynthesis
        const isSpeaking = synthesis.speaking
        const isPending = synthesis.pending

        if (isSpeaking) {
          if (!hasStarted) {
            hasStarted = true
            logger.log?.('[Text Audio] Native TTS speaking without onstart event')
            playOptions.onStart?.()
          }
          clearInterval(checkInterval)
          return
        }

        if (checkCount > 25) {
          if (!hasRetriedStart && !isPending) {
            hasRetriedStart = true
            checkCount = 0
            logger.warn?.('[Text Audio] TTS did not start promptly, retrying once')
            synthesis.cancel()
            setTimeout(() => {
              if (!hasStarted && !hasEnded && !hasErrored) {
                synthesis.speak(utterance)
              }
            }, 120)
            return
          }

          clearInterval(checkInterval)
          logger.error?.('[Text Audio] TTS failed to start after retries')
          notifyWarning('Voice playback did not respond, please try again.')
          playOptions.onError?.(createNativeTtsStartTimeoutError())
          return
        }

        if (synthesis.paused && (isPending || checkCount > 5)) {
          logger.log?.('[Text Audio] Resuming paused TTS')
          synthesis.resume()
        }
      }, 100)
    } catch (error) {
      logger.error?.('[Text Audio] Error in selectVoiceAndSpeak:', error)
      notifyWarning('Audio playback is unavailable. Please try again.')
      playOptions.onError?.(error)
    }
  }

  onBeforeUnmount(() => {
    stopAudio()
  })

  return {
    currentAudio,
    playAudio,
    stopAudio,
    warmVoices
  }
}
