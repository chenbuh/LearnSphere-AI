/**
 * 语音录制和处理工具
 * 支持录音、语音识别、音频处理
 */

export class AudioRecorder {
    constructor() {
        this.mediaRecorder = null
        this.audioChunks = []
        this.stream = null
        this.recognition = null
        this.isRecording = false
        this.transcription = ''
    }

    /**
     * 初始化录音器
     */
    async init() {
        try {
            // 请求麦克风权限
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            })

            // 初始化 MediaRecorder
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'audio/webm;codecs=opus'
            })

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data)
                }
            }

            console.log('[AudioRecorder] Initialized')
            return true
        } catch (error) {
            console.error('[AudioRecorder] Init failed:', error)
            throw new Error('无法访问麦克风，请检查权限设置')
        }
    }

    /**
     * 开始录音
     */
    async startRecording() {
        if (!this.mediaRecorder) {
            await this.init()
        }

        this.audioChunks = []
        this.transcription = ''
        this.isRecording = true

        // 开始录音
        this.mediaRecorder.start(100) // 每100ms取一次数据

        // 开始语音识别（如果支持）
        this.startSpeechRecognition()

        console.log('[AudioRecorder] Recording started')
    }

    /**
     * 停止录音
     */
    async stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                reject(new Error('录音未开始'))
                return
            }

            this.mediaRecorder.onstop = async () => {
                this.isRecording = false

                // 生成音频 Blob
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
                const audioUrl = URL.createObjectURL(audioBlob)

                // 停止语音识别
                this.stopSpeechRecognition()

                console.log('[AudioRecorder] Recording stopped')
                console.log('[AudioRecorder] Audio size:', (audioBlob.size / 1024).toFixed(2), 'KB')

                resolve({
                    blob: audioBlob,
                    url: audioUrl,
                    transcription: this.transcription,
                    duration: this.calculateDuration()
                })
            }

            this.mediaRecorder.stop()
        })
    }

    /**
     * 语音识别 (Web Speech API)
     */
    startSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            console.warn('[AudioRecorder] Speech Recognition not supported')
            return
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        this.recognition = new SpeechRecognition()

        this.recognition.continuous = true
        this.recognition.interimResults = true
        this.recognition.lang = 'en-US'
        this.recognition.maxAlternatives = 1

        let finalTranscript = ''

        this.recognition.onresult = (event) => {
            let interimTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' '
                } else {
                    interimTranscript += transcript
                }
            }

            this.transcription = finalTranscript + interimTranscript
        }

        this.recognition.onerror = (event) => {
            console.error('[AudioRecorder] Speech recognition error:', event.error)
            if (event.error === 'no-speech') {
                // 用户没说话，重启识别
                this.recognition.stop()
                setTimeout(() => {
                    if (this.isRecording) {
                        this.recognition.start()
                    }
                }, 1000)
            }
        }

        this.recognition.onend = () => {
            // 如果还在录音中，重新启动识别（避免自动停止）
            if (this.isRecording) {
                this.recognition.start()
            }
        }

        try {
            this.recognition.start()
            console.log('[AudioRecorder] Speech recognition started')
        } catch (error) {
            console.error('[AudioRecorder] Failed to start recognition:', error)
        }
    }

    /**
     * 停止语音识别
     */
    stopSpeechRecognition() {
        if (this.recognition) {
            this.recognition.stop()
            this.recognition = null
        }
    }

    /**
     * 计算录音时长（估算）
     */
    calculateDuration() {
        // 简单估算：根据 chunk 数量和采样率
        // 更精确的方法需要解析音频文件
        const totalSize = this.audioChunks.reduce((sum, chunk) => sum + chunk.size, 0)
        const estimatedDuration = totalSize / (44100 * 2) // 粗略估算
        return Math.max(1, estimatedDuration)
    }

    /**
     * 释放资源
     */
    destroy() {
        this.stopSpeechRecognition()

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop())
            this.stream = null
        }

        this.mediaRecorder = null
        this.audioChunks = []

        console.log('[AudioRecorder] Destroyed')
    }
}

/**
 * 音频分析工具
 */
export class AudioAnalyzer {
    constructor(audioContext) {
        this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)()
        this.analyser = this.audioContext.createAnalyser()
        this.analyser.fftSize = 256
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    }

    /**
     * 连接音频源
     */
    connectSource(stream) {
        const source = this.audioContext.createMediaStreamSource(stream)
        source.connect(this.analyser)
        return source
    }

    /**
     * 获取音量级别 (0-100)
     */
    getVolumeLevel() {
        this.analyser.getByteFrequencyData(this.dataArray)
        const sum = this.dataArray.reduce((a, b) => a + b, 0)
        const average = sum / this.dataArray.length
        return Math.min(100, average / 255 * 100)
    }

    /**
     * 获取波形数据（用于可视化）
     */
    getWaveformData() {
        this.analyser.getByteTimeDomainData(this.dataArray)
        return Array.from(this.dataArray)
    }
}

/**
 * 发音评分工具
 */
export class PronunciationScorer {
    /**
     * 评估发音准确度
     * @param {string} expected - 期望的文本
     * @param {string} actual - 实际识别的文本
     */
    static evaluatePronunciation(expected, actual) {
        if (!expected || !actual) {
            return {
                score: 0,
                accuracy: 0,
                fluency: 0,
                completeness: 0,
                errors: []
            }
        }

        expected = expected.toLowerCase().trim()
        actual = actual.toLowerCase().trim()

        // 1. 准确度（基于编辑距离）
        const accuracy = this.calculateSimilarity(expected, actual)

        // 2. 流畅度（基于语速和停顿）
        const fluency = this.estimateFluency(actual)

        // 3. 完整度（说了多少内容）
        const completeness = this.calculateCompleteness(expected, actual)

        // 4. 找出错误
        const errors = this.findErrors(expected, actual)

        // 综合得分
        const score = Math.round(accuracy * 0.4 + fluency * 0.3 + completeness * 0.3)

        return {
            score: Math.min(100, Math.max(0, score)),
            accuracy: Math.round(accuracy),
            fluency: Math.round(fluency),
            completeness: Math.round(completeness),
            errors
        }
    }

    /**
     * 计算文本相似度（Levenshtein距离）
     */
    static calculateSimilarity(str1, str2) {
        const len1 = str1.length
        const len2 = str2.length
        const dp = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0))

        for (let i = 0; i <= len1; i++) dp[i][0] = i
        for (let j = 0; j <= len2; j++) dp[0][j] = j

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1]
                } else {
                    dp[i][j] = Math.min(
                        dp[i - 1][j] + 1,
                        dp[i][j - 1] + 1,
                        dp[i - 1][j - 1] + 1
                    )
                }
            }
        }

        const distance = dp[len1][len2]
        const maxLen = Math.max(len1, len2)
        return maxLen > 0 ? (1 - distance / maxLen) * 100 : 0
    }

    /**
     * 估算流畅度
     */
    static estimateFluency(text) {
        const words = text.split(/\s+/).filter(w => w.length > 0)
        const wordCount = words.length

        // 假设正常语速：150 词/分钟
        // 流畅度分数基于词数和合理性
        if (wordCount === 0) return 0
        if (wordCount < 5) return 50 // 太短
        if (wordCount > 200) return 70 // 太长可能有重复

        // 检查是否有过多重复
        const uniqueWords = new Set(words.map(w => w.toLowerCase()))
        const diversity = uniqueWords.size / wordCount

        return Math.min(100, 60 + diversity * 40)
    }

    /**
     * 计算完整度
     */
    static calculateCompleteness(expected, actual) {
        const expectedWords = expected.split(/\s+/).filter(w => w.length > 0)
        const actualWords = actual.split(/\s+/).filter(w => w.length > 0)

        let matchCount = 0
        expectedWords.forEach(word => {
            if (actualWords.includes(word)) {
                matchCount++
            }
        })

        return expectedWords.length > 0 ? (matchCount / expectedWords.length) * 100 : 0
    }

    /**
     * 找出发音错误
     */
    static findErrors(expected, actual) {
        const expectedWords = expected.split(/\s+/)
        const actualWords = actual.split(/\s+/)
        const errors = []

        expectedWords.forEach((expectedWord, index) => {
            const actualWord = actualWords[index]
            if (actualWord && expectedWord !== actualWord) {
                errors.push({
                    expected: expectedWord,
                    actual: actualWord,
                    position: index
                })
            } else if (!actualWord) {
                errors.push({
                    expected: expectedWord,
                    actual: '(missing)',
                    position: index
                })
            }
        })

        return errors
    }
}

export default {
    AudioRecorder,
    AudioAnalyzer,
    PronunciationScorer
}
