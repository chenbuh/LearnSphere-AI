/**
 * 移动端兼容的音频录制器
 * 自动检测浏览器支持的音频格式
 *
 * 支持的格式：
 * - Chrome/Android: audio/webm;codecs=opus
 * - Safari/iOS: audio/mp4 或 audio/alac
 * - Firefox: audio/webm;codecs=opus
 * - 降级: 不指定格式（浏览器默认）
 */

export class MobileAudioRecorder {
    constructor() {
        this.mediaRecorder = null
        this.audioChunks = []
        this.stream = null
        this.isRecording = false
        this.supportedMimeType = null
    }

    /**
     * 获取浏览器支持的音频 MIME 类型
     */
    getSupportedMimeType() {
        const browserInfo = MobileAudioRecorder.getBrowserInfo()
        const types = [
            // Prefer Opus containers for frontend Vosk transcription on Chromium/Firefox.
            ...(browserInfo.isSafari || browserInfo.isIOS
                ? ['audio/mp4', 'audio/mp4;codecs=aac', 'audio/alac']
                : ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']),
            // Fallback order for less common engines.
            'audio/ogg;codecs=opus',
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/mp4;codecs=aac',
            'audio/alac',
            '' // 降级：让浏览器选择默认格式
        ]

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                console.log(`[MobileAudioRecorder] Using MIME type: ${type || 'default'}`)
                return type
            }
        }

        console.warn('[MobileAudioRecorder] No supported MIME type found, using browser default')
        return ''
    }

    /**
     * 初始化录音器
     */
    async init(options = {}) {
        try {
            const requestedDeviceId = options.deviceId || null
            const audioConstraints = {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 44100
            }

            if (requestedDeviceId) {
                audioConstraints.deviceId = { exact: requestedDeviceId }
            }

            // 请求麦克风权限
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: audioConstraints
            })

            // 获取支持的 MIME 类型
            this.supportedMimeType = this.getSupportedMimeType()

            // 初始化 MediaRecorder
            const recorderOptions = this.supportedMimeType
                ? { mimeType: this.supportedMimeType }
                : {}

            this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions)

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.audioChunks.push(event.data)
                }
            }

            console.log('[MobileAudioRecorder] Initialized successfully')
            return true

        } catch (error) {
            console.error('[MobileAudioRecorder] Init failed:', error)

            // 提供更友好的错误信息
            if (error.name === 'NotAllowedError') {
                throw new Error('麦克风权限被拒绝。请在浏览器设置中允许访问麦克风。')
            } else if (error.name === 'NotFoundError') {
                throw new Error('未检测到麦克风设备。请连接麦克风后重试。')
            } else if (error.name === 'NotReadableError') {
                throw new Error('麦克风被其他应用占用。请关闭其他使用麦克风的应用后重试。')
            } else {
                throw new Error('无法访问麦克风：' + error.message)
            }
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
        this.isRecording = true

        // 开始录音
        this.mediaRecorder.start(100) // 每100ms取一次数据
        console.log('[MobileAudioRecorder] Recording started')

        return {
            mimeType: this.supportedMimeType,
            isSupported: !!this.supportedMimeType
        }
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

            this.mediaRecorder.onstop = () => {
                this.isRecording = false

                // 根据支持的格式生成 Blob
                const blobType = this.getBlobType()
                const audioBlob = new Blob(this.audioChunks, { type: blobType })
                const audioUrl = URL.createObjectURL(audioBlob)

                console.log('[MobileAudioRecorder] Recording stopped')
                console.log(`[MobileAudioRecorder] Audio size: ${(audioBlob.size / 1024).toFixed(2)} KB`)
                console.log(`[MobileAudioRecorder] MIME type: ${blobType}`)

                resolve({
                    blob: audioBlob,
                    url: audioUrl,
                    mimeType: blobType,
                    size: audioBlob.size
                })
            }

            this.mediaRecorder.stop()
        })
    }

    /**
     * 获取 Blob 的 MIME 类型
     * 对于 iOS Safari，需要将 mp4 转换为 webm 或保持原样
     */
    getBlobType() {
        if (this.supportedMimeType) {
            return this.supportedMimeType
        }

        // 降级：根据音频块推断类型
        if (this.audioChunks.length > 0) {
            return this.audioChunks[0].type || 'audio/webm'
        }

        return 'audio/webm' // 默认
    }

    /**
     * 获取文件扩展名
     */
    getFileExtension() {
        const mimeType = this.getBlobType()
        return MobileAudioRecorder.getFileExtensionForMimeType(mimeType)
    }

    static getFileExtensionForMimeType(mimeType = '') {
        const normalizedMimeType = String(mimeType || '').toLowerCase()

        if (normalizedMimeType.includes('ogg') || normalizedMimeType.includes('opus')) {
            return '.ogg'
        }
        if (normalizedMimeType.includes('mp4') || normalizedMimeType.includes('aac')) {
            return '.mp4'
        }
        if (normalizedMimeType.includes('alac') || normalizedMimeType.includes('m4a')) {
            return '.m4a'
        }
        if (normalizedMimeType.includes('webm')) {
            return '.webm'
        }

        return '.webm'
    }

    /**
     * 检查浏览器是否支持录音
     */
    static isSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && MediaRecorder)
    }

    /**
     * 获取浏览器信息
     */
    static getBrowserInfo() {
        const ua = navigator.userAgent

        return {
            isIOS: /iPad|iPhone|iPod/.test(ua) && !window.MSStream,
            isSafari: /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua),
            isAndroid: /Android/.test(ua),
            isChrome: /Chrome|CriOS/.test(ua) && !/Edge|EdgiOS/.test(ua),
            isFirefox: /Firefox|FxiOS/.test(ua),
            userAgent: ua
        }
    }

    /**
     * 释放资源
     */
    destroy() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop())
            this.stream = null
        }

        this.mediaRecorder = null
        this.audioChunks = []
        this.isRecording = false

        console.log('[MobileAudioRecorder] Destroyed')
    }
}

/**
 * 创建适合移动端的 FormData 上传
 * 自动处理文件名和 MIME 类型
 */
export function createAudioFormData(audioBlob, filename = 'recording') {
    const formData = new FormData()

    // Preserve the actual audio type so the backend can detect the format reliably.
    const extension = MobileAudioRecorder.getFileExtensionForMimeType(audioBlob?.type || '')
    const fullFilename = `${filename}${extension}`

    formData.append('file', audioBlob, fullFilename)

    return {
        formData,
        filename: fullFilename,
        mimeType: audioBlob.type
    }
}

export default MobileAudioRecorder
