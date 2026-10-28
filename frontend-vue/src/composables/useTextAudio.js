import { onBeforeUnmount, ref } from 'vue'

/** 与后端 EdgeTTSController 的默认音色保持一致 */
const DEFAULT_TTS_VOICE = 'en-US-JennyNeural'
/**
 * 后端合成超时。
 *
 * 实测耗时（服务器 5010 服务，日志 tts.log）：
 *   <50 字符   平均 0.85s
 *   50~200     平均 1.19s
 *   500+ 字符  平均 5.86s，最长 8.6s
 *
 * 原值 8000ms 与长文本耗时几乎重合，稍有网络抖动就会 abort 并静默降级到
 * 浏览器原生语音——用户听到的口音就不可控了（正是「不像美式也不像英式」的
 * 来源）。提到 20s：长文本能稳定拿到 Jenny 音频，真失败时仍会降级，只是
 * 不再因为差两秒而误判。
 */
const TTS_FETCH_TIMEOUT_MS = 20000

export function useTextAudio(options = {}) {
  const currentAudio = ref(null)
  const notifyWarning = options.notifyWarning || (() => {})
  const logger = options.logger || console
  const autoPlayStorageKey = options.autoPlayStorageKey || 'user_autoplay_preference'
  let nativePlaybackToken = 0
  // 后端合成请求的序号：stopAudio / 新播放会使其自增，旧请求返回后直接丢弃
  let playbackToken = 0

  const clampFiniteNumber = (value, fallback, min, max) => {
    const normalizedValue = Number(value)
    if (!Number.isFinite(normalizedValue)) {
      return fallback
    }

    return Math.min(max, Math.max(min, normalizedValue))
  }

  const normalizePlayOptions = playOptions => {
    if (typeof playOptions === 'boolean') {
      return { isAuto: playOptions }
    }

    return playOptions || {}
  }

  const isExpectedNativeTtsInterruption = error => {
    const errorCode = String(error?.error || error?.message || '').toLowerCase()
    return errorCode === 'interrupted' || errorCode === 'canceled' || errorCode === 'cancelled'
  }

  const createNativeTtsStartTimeoutError = () => {
    const error = new Error('Native TTS failed to start')
    error.code = 'native_tts_start_timeout'
    error.error = 'native_tts_start_timeout'
    return error
  }

  // 默认走自建后端 /api/tts/edge（Edge 神经音色，音质与例句/听力一致）。
  // 之前这里回退到海词 / Google 翻译 / 有道的公开接口，有两个问题：
  //   1. 会把用户正在学的单词和例句原样发给第三方，属于学习数据外泄；
  //   2. 国内访问 translate.google.com 基本不通，失败前还要等满 2 秒超时，
  //      表现为“点了没反应，过一会儿才出声”。
  // 现在后端不可用时直接降级到浏览器原生 speechSynthesis（离线、无隐私风险）。
  // 注意：/api/tts/edge 是 POST，不能直接塞给 new Audio().src，
  // 因此这里返回空数组，由 tryPlayAudio 走 fetchTtsBlobUrl 分支。
  const buildDefaultOnlineSources = () => []

  /**
   * 从后端拉取音频并转成 blob URL。
   * 失败返回 null，调用方继续降级到原生语音。
   */
  const fetchTtsBlobUrl = async (text, playOptions = {}) => {
    if (!text) return null
    const voice = playOptions.voice || DEFAULT_TTS_VOICE
    const rate = typeof playOptions.rate === 'number' ? playOptions.rate : 1

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TTS_FETCH_TIMEOUT_MS)
    try {
      const headers = { 'Content-Type': 'application/json' }
      const token =
        typeof localStorage !== 'undefined' ? localStorage.getItem('learnsphere-token') : ''
      if (token && token !== 'null' && token !== 'undefined') {
        headers.satoken = token
      }

      const response = await fetch('/api/tts/edge', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text, voice, rate }),
        signal: controller.signal
      })

      if (!response.ok) {
        logger.warn?.('[Text Audio] Backend TTS responded', response.status)
        return null
      }
      const contentType = (response.headers.get('content-type') || '').toLowerCase()
      if (!contentType.includes('audio')) {
        logger.warn?.('[Text Audio] Backend TTS returned non-audio:', contentType)
        return null
      }

      const blob = await response.blob()
      if (!blob || blob.size === 0) return null
      return URL.createObjectURL(blob)
    } catch (error) {
      logger.warn?.('[Text Audio] Backend TTS fetch failed:', error?.message || error)
      return null
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const splitLongSegment = (segment, maxLength) => {
    const normalizedSegment = String(segment || '')
      .replace(/\s+/g, ' ')
      .trim()
    if (!normalizedSegment) return []
    if (normalizedSegment.length <= maxLength) return [normalizedSegment]

    const words = normalizedSegment.split(' ')
    const chunks = []
    let currentChunk = ''

    words.forEach(word => {
      if (!word) return

      const candidate = currentChunk ? `${currentChunk} ${word}` : word
      if (candidate.length <= maxLength) {
        currentChunk = candidate
        return
      }

      if (currentChunk) {
        chunks.push(currentChunk)
      }

      if (word.length <= maxLength) {
        currentChunk = word
        return
      }

      let remaining = word
      while (remaining.length > maxLength) {
        chunks.push(remaining.slice(0, maxLength))
        remaining = remaining.slice(maxLength)
      }
      currentChunk = remaining
    })

    if (currentChunk) {
      chunks.push(currentChunk)
    }

    return chunks
  }

  const splitTextForNativeTts = (text, maxLength = 220) => {
    const normalizedText = String(text || '')
      .replace(/\s+/g, ' ')
      .trim()
    if (!normalizedText) return []
    if (normalizedText.length <= maxLength) return [normalizedText]

    const sentenceMatches = normalizedText.match(/[^.!?;:]+[.!?;:]?\s*/g) || [normalizedText]
    const chunks = []
    let currentChunk = ''

    sentenceMatches
      .map(segment => segment.trim())
      .filter(Boolean)
      .forEach(segment => {
        const candidate = currentChunk ? `${currentChunk} ${segment}` : segment
        if (candidate.length <= maxLength) {
          currentChunk = candidate
          return
        }

        if (currentChunk) {
          chunks.push(currentChunk)
          currentChunk = ''
        }

        const longPieces = splitLongSegment(segment, maxLength)
        if (longPieces.length === 0) {
          return
        }

        if (longPieces.length === 1) {
          currentChunk = longPieces[0]
          return
        }

        chunks.push(...longPieces.slice(0, -1))
        currentChunk = longPieces[longPieces.length - 1]
      })

    if (currentChunk) {
      chunks.push(currentChunk)
    }

    return chunks
  }

  const stopAudio = () => {
    nativePlaybackToken += 1
    // 作废还在飞行中的后端合成请求，避免旧请求返回后覆盖新播放
    playbackToken += 1
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

    // 显式给了在线源（如听力自己管理的 Edge 音频）→ 按原逻辑逐个尝试
    if (playOptions.onlineSources && playOptions.onlineSources.length) {
      tryOnlineSource(text, playOptions.onlineSources, 0, playOptions)
      return
    }

    // 默认：先拉后端 Edge 神经音色，失败再降级原生语音
    const token = ++playbackToken
    fetchTtsBlobUrl(text, playOptions).then(blobUrl => {
      // 期间用户又点了别的词 / 调了 stopAudio，丢弃这次结果
      if (token !== playbackToken) {
        if (blobUrl) URL.revokeObjectURL(blobUrl)
        return
      }
      if (!blobUrl) {
        playNativeTTS(text, playOptions)
        return
      }
      playBlobUrl(blobUrl, text, playOptions)
    })
  }

  /** 播放 fetch 得到的 blob URL；失败降级原生语音 */
  const playBlobUrl = (blobUrl, text, playOptions = {}) => {
    try {
      const audio = new Audio()
      currentAudio.value = audio

      let hasPlayed = false
      let hasErrored = false

      audio.onplay = () => {
        hasPlayed = true
        playOptions.onStart?.()
      }

      audio.onended = () => {
        currentAudio.value = null
        URL.revokeObjectURL(blobUrl)
        playOptions.onEnd?.()
      }

      audio.onerror = () => {
        if (hasErrored) return
        hasErrored = true
        URL.revokeObjectURL(blobUrl)
        playNativeTTS(text, playOptions)
      }

      audio.src = blobUrl
      if (typeof playOptions.audioVolume === 'number') {
        audio.volume = Math.max(0, Math.min(1, playOptions.audioVolume))
      }

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (hasPlayed || hasErrored) return
          hasErrored = true
          URL.revokeObjectURL(blobUrl)
          playNativeTTS(text, playOptions)
        })
      }
    } catch (error) {
      logger.warn?.('[Text Audio] Blob playback failed:', error?.message || error)
      URL.revokeObjectURL(blobUrl)
      playNativeTTS(text, playOptions)
    }
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
      isIOS:
        /iPad|iPhone|iPod/.test(userAgent) && !(typeof window !== 'undefined' && window.MSStream)
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
      const chunkList = splitTextForNativeTts(text, 220)
      const playbackToken = ++nativePlaybackToken

      if (!chunkList.length) {
        return
      }

      const speakChunk = chunkIndex => {
        if (playbackToken !== nativePlaybackToken || chunkIndex >= chunkList.length) {
          return
        }

        const chunkText = chunkList[chunkIndex]
        const utterance = new SpeechSynthesisUtterance(chunkText)
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
            selectVoiceAndSpeak(utterance, [], chunkText, playOptions, safeNativeOptions, {
              chunkIndex,
              chunkCount: chunkList.length,
              playbackToken,
              playNextChunk: () => speakChunk(chunkIndex + 1)
            })
            return
          }

          window.speechSynthesis.onvoiceschanged = () => {
            voices = warmVoices()
            logger.log?.(`[Text Audio] Voices loaded: ${voices.length} voices available`)
            if (playbackToken !== nativePlaybackToken) return
            selectVoiceAndSpeak(utterance, voices, chunkText, playOptions, safeNativeOptions, {
              chunkIndex,
              chunkCount: chunkList.length,
              playbackToken,
              playNextChunk: () => speakChunk(chunkIndex + 1)
            })
          }

          setTimeout(() => {
            if (voices.length === 0) {
              logger.warn?.('[Text Audio] Timeout waiting for voices, using default')
              if (playbackToken !== nativePlaybackToken) return
              selectVoiceAndSpeak(utterance, [], chunkText, playOptions, safeNativeOptions, {
                chunkIndex,
                chunkCount: chunkList.length,
                playbackToken,
                playNextChunk: () => speakChunk(chunkIndex + 1)
              })
            }
          }, 3000)
          return
        }

        selectVoiceAndSpeak(utterance, voices, chunkText, playOptions, safeNativeOptions, {
          chunkIndex,
          chunkCount: chunkList.length,
          playbackToken,
          playNextChunk: () => speakChunk(chunkIndex + 1)
        })
      }

      if (playbackEnvironment.isMobile) {
        speakChunk(0)
      } else {
        setTimeout(() => speakChunk(0), 50)
      }
    } catch (error) {
      logger.error?.('[Text Audio] Native TTS not available:', error.message)
      notifyWarning(
        'Audio playback is unavailable. Please check browser permissions and try again.'
      )
      playOptions.onError?.(error)
    }
  }

  const selectVoiceAndSpeak = (
    utterance,
    voices,
    text,
    playOptions = {},
    nativeOptions = {},
    sequenceState = null
  ) => {
    try {
      if (voices.length > 0) {
        // 只接受英语语音。此前的兜底是 voices[0]，在中文系统上会选中
        // "Microsoft Huihui - Chinese"，用中文音色念英文单词，发音完全不对。
        const englishVoices = voices.filter(item => {
          const lang = (item.lang || '').toLowerCase()
          return lang === 'en' || lang.startsWith('en-')
        })

        /**
         * 原生语音的选择顺序：优先美音，最后才考虑其他英语口音。
         *
         * 背景：降级到浏览器语音时，若系统只装了 en-GB 就会读成英音，
         * 若装的是 en-IN / en-AU 则是印度腔 / 澳洲腔——用户听起来
         * 「既不像美式也不像英式」多半是这种情况。这里显式把美音排在前面，
         * 并且尽量挑名字里能看出是美音的语音。
         */
        const isUsEnglish = item => {
          const lang = (item.lang || '').toLowerCase()
          const name = (item.name || '').toLowerCase()
          return (
            lang === 'en-us' ||
            lang === 'en_us' ||
            name.includes('us english') ||
            name.includes('united states') ||
            name.includes('america') ||
            // Windows 的美音语音常见命名
            /(jenny|aria|guy|david|zira|mark|christopher|michelle|ana|ava|andrew|emma|brian)/.test(
              name
            )
          )
        }

        const selectedVoice =
          typeof nativeOptions.voiceSelector === 'function'
            ? nativeOptions.voiceSelector(englishVoices.length ? englishVoices : voices)
            : englishVoices.find(isUsEnglish) ||
              englishVoices.find(item => item.lang === 'en-US') ||
              // 没有美音时退而求其次：英音比其他英语口音更接近教学标准
              englishVoices.find(item => item.lang === 'en-GB') ||
              englishVoices.find(item => item.lang.startsWith('en')) ||
              null

        if (selectedVoice) {
          utterance.voice = selectedVoice
          if (selectedVoice.lang) utterance.lang = selectedVoice.lang
          logger.log?.('[Text Audio] Using voice:', selectedVoice.name)
        } else {
          // 系统没装英语语音：保持 lang='en-US' 让浏览器自行匹配，
          // 不要回落到中文音色。
          logger.warn?.('[Text Audio] No English voice found; relying on lang tag')
        }
      } else {
        logger.log?.('[Text Audio] Using default voice (no voices available)')
      }

      let hasStarted = false
      let hasEnded = false
      let hasErrored = false
      const isFirstChunk = !sequenceState || sequenceState.chunkIndex === 0
      const isLastChunk = !sequenceState || sequenceState.chunkIndex >= sequenceState.chunkCount - 1

      utterance.onstart = () => {
        if (
          sequenceState?.playbackToken != null &&
          sequenceState.playbackToken !== nativePlaybackToken
        )
          return
        if (hasStarted) return
        hasStarted = true
        logger.log?.('[Text Audio] Native TTS playing')
        if (isFirstChunk) {
          playOptions.onStart?.()
        }
      }

      utterance.onend = () => {
        if (
          sequenceState?.playbackToken != null &&
          sequenceState.playbackToken !== nativePlaybackToken
        )
          return
        hasEnded = true
        if (!isLastChunk) {
          setTimeout(() => {
            if (
              sequenceState?.playbackToken != null &&
              sequenceState.playbackToken !== nativePlaybackToken
            )
              return
            sequenceState?.playNextChunk?.()
          }, 0)
          return
        }

        logger.log?.('[Text Audio] Native TTS ended')
        playOptions.onEnd?.()
      }

      utterance.onerror = error => {
        if (
          sequenceState?.playbackToken != null &&
          sequenceState.playbackToken !== nativePlaybackToken
        )
          return
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

      logger.log?.(
        '[Text Audio] Speaking:',
        text.substring(0, 50) + (text.length > 50 ? '...' : '')
      )
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
