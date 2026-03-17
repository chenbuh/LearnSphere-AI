export const MOBILE_AUDIO_UNLOCK_DATA_URL = 'data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YSADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='

export const isMobilePlaybackBrowser = () => {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent || '')
}

export const createInlineAudioElement = (src = '') => {
  const audio = new Audio(src)
  audio.preload = 'auto'
  audio.playsInline = true
  if (typeof audio.setAttribute === 'function') {
    audio.setAttribute('playsinline', 'true')
    audio.setAttribute('webkit-playsinline', 'true')
  }
  return audio
}

export async function primeMobileAudioPlayback(audio = null) {
  if (!isMobilePlaybackBrowser()) {
    console.debug('[MobilePlayback] Not a mobile browser, skipping prime')
    return audio
  }

  console.debug('[MobilePlayback] Priming mobile audio playback')
  const unlockedAudio = audio || createInlineAudioElement(MOBILE_AUDIO_UNLOCK_DATA_URL)

  try {
    unlockedAudio.src = MOBILE_AUDIO_UNLOCK_DATA_URL
    unlockedAudio.muted = true
    unlockedAudio.volume = 0
    unlockedAudio.currentTime = 0

    const playPromise = unlockedAudio.play()
    if (playPromise !== undefined) {
      await playPromise
      console.debug('[MobilePlayback] Silent audio played successfully')
    }
    unlockedAudio.pause()
  } catch (error) {
    console.warn('[MobilePlayback] Failed to prime audio:', error)
  } finally {
    unlockedAudio.currentTime = 0
    unlockedAudio.muted = false
    unlockedAudio.volume = 1
  }

  console.debug('[MobilePlayback] Audio context unlocked')
  return unlockedAudio
}
