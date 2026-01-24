import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSpeakingStore = defineStore('speaking', () => {
    // 当前练习状态
    const topicData = ref(null)
    const currentMode = ref('select') // 'select' | 'practice' | 'result'
    const transcript = ref('')
    const recordingTime = ref(0)
    const evaluationResult = ref(null)

    // 时间戳（用于过期检测）
    const timestamp = ref(Date.now())

    // 配置
    const selectedType = ref('ielts_part2')
    const selectedDifficulty = ref('normal')

    // 检查数据是否过期（24小时）
    const isExpired = () => {
        const now = Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000
        return (now - timestamp.value) > twentyFourHours
    }

    // 开始新练习
    function startPractice(topic, type, difficulty) {
        topicData.value = topic
        selectedType.value = type
        selectedDifficulty.value = difficulty
        currentMode.value = 'practice'
        transcript.value = ''
        recordingTime.value = 0
        evaluationResult.value = null
        timestamp.value = Date.now()
    }

    // 保存进度
    function updateProgress(content, time) {
        transcript.value = content
        recordingTime.value = time
        timestamp.value = Date.now()
    }

    // 完成练习
    function completePractice(result) {
        evaluationResult.value = result
        currentMode.value = 'result'
    }

    // 清除状态
    function clearPersistedState() {
        topicData.value = null
        currentMode.value = 'select'
        transcript.value = ''
        recordingTime.value = 0
        evaluationResult.value = null
        timestamp.value = Date.now()
    }

    return {
        topicData,
        currentMode,
        transcript,
        recordingTime,
        evaluationResult,
        selectedType,
        selectedDifficulty,
        timestamp,
        isExpired,
        startPractice,
        updateProgress,
        completePractice,
        clearPersistedState
    }
}, {
    persist: {
        key: 'learnsphere-speaking',
        storage: localStorage,
        paths: [
            'topicData',
            'currentMode',
            'transcript',
            'recordingTime',
            'evaluationResult',
            'selectedType',
            'selectedDifficulty',
            'timestamp'
        ]
    }
})
