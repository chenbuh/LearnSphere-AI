/**
 * 语音合成 (TTS) 工具类
 * 支持多种 TTS 提供商，自动降级
 * 
 * 优先级：Edge TTS > Azure TTS > 有道 > 系统 TTS
 */

// TTS 提供商配置
const TTS_PROVIDERS = {
    EDGE: 'edge',
    AZURE: 'azure',
    YOUDAO: 'youdao',
    SYSTEM: 'system'
}

// Edge TTS 语音配置
const EDGE_VOICES = {
    'en-US': {
        male: 'en-US-GuyNeural',         // 美音-男
        female: 'en-US-JennyNeural'      // 美音-女
    },
    'en-GB': {
        male: 'en-GB-RyanNeural',        // 英音-男
        female: 'en-GB-SoniaNeural'      // 英音-女
    },
    'en-AU': {
        female: 'en-AU-NatashaNeural'    // 澳音-女
    }
}

class TTSManager {
    constructor() {
        this.currentAudio = null
        this.currentProvider = TTS_PROVIDERS.EDGE
        this.preferredAccent = 'en-US'  // 默认美音
        this.preferredGender = 'female' // 默认女声
        this.rate = 1.0                  // 语速 (0.5 - 2.0)
        this.cache = new Map()           // 音频缓存
    }

    /**
     * 播放文本
     * @param {string} text - 要朗读的文本
     * @param {object} options - 配置选项
     */
    async speak(text, options = {}) {
        if (!text || typeof text !== 'string') {
            console.warn('[TTS] Invalid text provided')
            return
        }

        // 停止当前播放
        this.stop()

        // 合并配置
        const config = {
            accent: options.accent || this.preferredAccent,
            gender: options.gender || this.preferredGender,
            rate: options.rate || this.rate,
            provider: options.provider || this.currentProvider
        }

        console.log(`[TTS] Speaking: "${text.substring(0, 50)}..." with ${config.provider}`)

        // 检查缓存
        const cacheKey = `${text}-${config.accent}-${config.gender}-${config.rate}`
        if (this.cache.has(cacheKey)) {
            const audioUrl = this.cache.get(cacheKey)
            return this.playAudio(audioUrl)
        }

        // 根据提供商播放
        try {
            switch (config.provider) {
                case TTS_PROVIDERS.EDGE:
                    await this.speakWithEdge(text, config)
                    break
                case TTS_PROVIDERS.AZURE:
                    await this.speakWithAzure(text, config)
                    break
                case TTS_PROVIDERS.YOUDAO:
                    await this.speakWithYoudao(text, config)
                    break
                case TTS_PROVIDERS.SYSTEM:
                default:
                    await this.speakWithSystem(text, config)
            }
        } catch (error) {
            console.error(`[TTS] ${config.provider} failed`, error)
            // 自动降级
            await this.fallback(text, config)
        }
    }

    /**
     * Edge TTS（推荐，免费且自然）
     */
    async speakWithEdge(text, config) {
        const voice = this.getEdgeVoice(config.accent, config.gender)

        // Edge TTS API 端点（使用免费的第三方服务）
        // 注意：这个服务可能不稳定，建议自建 Edge TTS 服务
        const apiUrl = 'https://api.oioweb.cn/api/txt/QQBubble'

        try {
            const response = await fetch(`${apiUrl}?msg=${encodeURIComponent(text)}&voice=${voice}`)
            const data = await response.json()

            if (data.code === 1 && data.result) {
                await this.playAudio(data.result)
            } else {
                throw new Error('Edge TTS API failed')
            }
        } catch (error) {
            // 备选方案：使用本地 Edge TTS 服务（需要自建）
            await this.speakWithLocalEdge(text, config)
        }
    }

    /**
     * 本地 Edge TTS（需要部署后端服务）
     */
    async speakWithLocalEdge(text, config) {
        const voice = this.getEdgeVoice(config.accent, config.gender)

        // 调用后端 Edge TTS API
        const apiUrl = '/api/tts/edge'

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voice, rate: config.rate })
            })

            if (response.ok) {
                const blob = await response.blob()
                const audioUrl = URL.createObjectURL(blob)
                this.cache.set(`${text}-${config.accent}-${config.gender}-${config.rate}`, audioUrl)
                await this.playAudio(audioUrl)
            } else {
                throw new Error('Local Edge TTS failed')
            }
        } catch (error) {
            console.warn('[TTS] Local Edge TTS not available, falling back...')
            throw error
        }
    }

    /**
     * Azure TTS（付费，质量最好）
     */
    async speakWithAzure(text, config) {
        const voice = this.getEdgeVoice(config.accent, config.gender) // Edge 和 Azure 使用相同语音

        // Azure TTS API（需要 API Key）
        const apiUrl = '/api/tts/azure'

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice, rate: config.rate })
        })

        if (response.ok) {
            const blob = await response.blob()
            const audioUrl = URL.createObjectURL(blob)
            await this.playAudio(audioUrl)
        } else {
            throw new Error('Azure TTS failed')
        }
    }

    /**
     * 有道 TTS（免费，适合单词和短句）
     */
    async speakWithYoudao(text, config) {
        // 有道只适合短文本
        if (text.length > 100) {
            console.warn('[TTS] Text too long for Youdao, using system TTS')
            throw new Error('Text too long')
        }

        // 有道 API
        const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`
        await this.playAudio(audioUrl)
    }

    /**
     * 系统 TTS（降级方案）
     */
    async speakWithSystem(text, config) {
        return new Promise((resolve, reject) => {
            if (!window.speechSynthesis) {
                reject(new Error('System TTS not supported'))
                return
            }

            // 取消之前的语音
            window.speechSynthesis.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = config.accent
            utterance.rate = config.rate

            // 尝试选择合适的语音
            const voices = window.speechSynthesis.getVoices()
            const preferredVoice = voices.find(voice =>
                voice.lang.startsWith(config.accent) &&
                (config.gender === 'female' ? voice.name.includes('Female') : voice.name.includes('Male'))
            ) || voices.find(voice => voice.lang.startsWith(config.accent))

            if (preferredVoice) {
                utterance.voice = preferredVoice
            }

            utterance.onend = () => {
                console.log('[TTS] System TTS finished')
                resolve()
            }
            utterance.onerror = (error) => {
                console.error('[TTS] System TTS error', error)
                reject(error)
            }

            window.speechSynthesis.speak(utterance)
        })
    }

    /**
     * 自动降级
     */
    async fallback(text, config) {
        const providers = [
            TTS_PROVIDERS.EDGE,
            TTS_PROVIDERS.YOUDAO,
            TTS_PROVIDERS.SYSTEM
        ]

        for (const provider of providers) {
            if (provider === config.provider) continue // 跳过已经失败的

            try {
                console.log(`[TTS] Trying fallback: ${provider}`)
                await this.speak(text, { ...config, provider })
                return
            } catch (error) {
                console.warn(`[TTS] Fallback ${provider} also failed`)
            }
        }

        console.error('[TTS] All providers failed')
    }

    /**
     * 播放音频
     */
    async playAudio(url) {
        return new Promise((resolve, reject) => {
            this.currentAudio = new Audio(url)

            this.currentAudio.onplay = () => {
                console.log('[TTS] ✓ Playing')
            }

            this.currentAudio.onended = () => {
                console.log('[TTS] ✓ Finished')
                this.currentAudio = null
                resolve()
            }

            this.currentAudio.onerror = (error) => {
                console.error('[TTS] Audio playback error', error)
                this.currentAudio = null
                reject(error)
            }

            this.currentAudio.play().catch(reject)
        })
    }

    /**
     * 停止播放
     */
    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause()
            this.currentAudio = null
        }

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel()
        }
    }

    /**
     * 获取 Edge 语音名称
     */
    getEdgeVoice(accent, gender) {
        const accentVoices = EDGE_VOICES[accent] || EDGE_VOICES['en-US']
        return accentVoices[gender] || accentVoices.female || EDGE_VOICES['en-US'].female
    }

    /**
     * 设置偏好
     */
    setPreferences({ accent, gender, rate, provider }) {
        if (accent) this.preferredAccent = accent
        if (gender) this.preferredGender = gender
        if (rate !== undefined) this.rate = rate
        if (provider) this.currentProvider = provider

        console.log('[TTS] Preferences updated', {
            accent: this.preferredAccent,
            gender: this.preferredGender,
            rate: this.rate,
            provider: this.currentProvider
        })
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url)
            }
        })
        this.cache.clear()
        console.log('[TTS] Cache cleared')
    }
}

// 导出单例
export const ttsManager = new TTSManager()

// 辅助函数
export function speak(text, options) {
    return ttsManager.speak(text, options)
}

export function stopSpeaking() {
    ttsManager.stop()
}

export function setTTSPreferences(preferences) {
    ttsManager.setPreferences(preferences)
}

export default ttsManager
