/**
 * 音频兼容性测试工具
 * 用于检测浏览器音频支持情况
 */

export function checkAudioSupport() {
    const results = {
        isSecureContext: window.isSecureContext,
        mediaDevices: !!navigator.mediaDevices,
        getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        mediaRecorder: !!window.MediaRecorder,
        speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
        audioContext: !!(window.AudioContext || window.webkitAudioContext),
        supportedMimeTypes: [],
        browserInfo: MobileAudioRecorder?.getBrowserInfo() || {}
    }

    // 测试支持的 MIME 类型
    const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/mp4;codecs=aac',
        'audio/ogg;codecs=opus',
        'audio/mpeg'
    ]

    mimeTypes.forEach(type => {
        if (window.MediaRecorder && MediaRecorder.isTypeSupported(type)) {
            results.supportedMimeTypes.push(type)
        }
    })

    return results
}

export function displayAudioSupport() {
    const support = checkAudioSupport()

    console.log('=== 音频支持情况 ===')
    console.log('安全上下文:', support.isSecureContext ? '✅' : '❌')
    console.log('MediaDevices:', support.mediaDevices ? '✅' : '❌')
    console.log('getUserMedia:', support.getUserMedia ? '✅' : '❌')
    console.log('MediaRecorder:', support.mediaRecorder ? '✅' : '❌')
    console.log('SpeechRecognition:', support.speechRecognition ? '✅' : '❌')
    console.log('AudioContext:', support.audioContext ? '✅' : '❌')
    console.log('支持的音频格式:', support.supportedMimeTypes)
    console.log('浏览器信息:', support.browserInfo)
    console.log('==================')

    return support
}

export async function requestMicrophonePermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
        return { success: true, message: '麦克风权限已授予' }
    } catch (error) {
        let message = '无法获取麦克风权限'

        switch (error.name) {
            case 'NotAllowedError':
            case 'PermissionDeniedError':
                message = '麦克风权限被拒绝。请在浏览器设置中允许访问麦克风。'
                break
            case 'NotFoundError':
                message = '未检测到麦克风设备。'
                break
            case 'NotReadableError':
                message = '麦克风被其他应用占用。'
                break
            default:
                message = '无法访问麦克风：' + error.message
        }

        return { success: false, message, error }
    }
}

/**
 * 获取麦克风权限帮助信息
 */
export function getMicrophoneHelp() {
    const browserInfo = MobileAudioRecorder?.getBrowserInfo() || {}

    if (browserInfo.isIOS) {
        return {
            title: 'iOS 麦克风权限设置',
            steps: [
                '确保使用 Safari 浏览器',
                '点击地址栏的"AA"图标或锁图标',
                '选择"网站设置"',
                '将麦克风设置为"允许"',
                '刷新页面'
            ]
        }
    }

    if (browserInfo.isAndroid) {
        return {
            title: 'Android 麦克风权限设置',
            steps: [
                '点击地址栏左侧的锁图标',
                '选择"网站设置"',
                '将麦克风设置为"允许"',
                '刷新页面'
            ]
        }
    }

    if (browserInfo.isSafari) {
        return {
            title: 'Safari 麦克风权限设置',
            steps: [
                '打开 Safari 偏好设置',
                '选择"网站" > "麦克风"',
                '找到当前网站，设置为"允许"',
                '刷新页面'
            ]
        }
    }

    return {
        title: '麦克风权限设置',
        steps: [
            '点击地址栏左侧的锁图标',
            '找到"麦克风"权限',
            '设置为"允许"',
            '刷新页面'
        ]
    }
}

/**
 * 导出音频兼容性测试报告
 */
export function exportAudioReport() {
    const support = checkAudioSupport()

    const report = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        support,
        canRecord: support.isSecureContext && support.getUserMedia && support.mediaRecorder,
        canUseWhisper: support.isSecureContext && support.getUserMedia,
        recommendations: []
    }

    if (!support.isSecureContext) {
        report.recommendations.push('⚠️ 需要使用 HTTPS 或 localhost 访问')
    }

    if (!support.getUserMedia) {
        report.recommendations.push('❌ 浏览器不支持 getUserMedia API')
    }

    if (!support.mediaRecorder) {
        report.recommendations.push('❌ 浏览器不支持 MediaRecorder API')
    }

    if (support.supportedMimeTypes.length === 0) {
        report.recommendations.push('⚠️ 未检测到支持的音频格式，将使用浏览器默认格式')
    }

    return report
}
