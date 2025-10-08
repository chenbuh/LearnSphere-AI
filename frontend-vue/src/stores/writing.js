import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Writing Store with timestamp expiration (24 hours)
 */
export const useWritingStore = defineStore('writing', () => {
    // 当前写作状态
    const currentPrompt = ref(null)
    const currentMode = ref('select') // 'select' | 'writing' | 'evaluation'
    const userEssay = ref('')
    const evaluationResult = ref(null)

    // 时间戳（用于过期检测）
    const timestamp = ref(Date.now())

    // 配置
    const selectedType = ref('argumentative')
    const selectedTopic = ref('')

    // 检查数据是否过期（24小时）
    const isExpired = () => {
        const now = Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000
        return (now - timestamp.value) > twentyFourHours
    }

    // 开始新写作
    function startWriting(prompt, type, topic) {
        currentPrompt.value = prompt
        selectedType.value = type
        selectedTopic.value = topic
        currentMode.value = 'writing'
        userEssay.value = ''
        evaluationResult.value = null
        timestamp.value = Date.now() // 更新时间戳
    }

    // 保存草稿
    function saveDraft(content) {
        userEssay.value = content
        timestamp.value = Date.now() // 每次保存更新时间戳
    }

    // 提交评分
    function submitEvaluation(result) {
        evaluationResult.value = result
        currentMode.value = 'evaluation'
    }

    // 重置写作
    function resetWriting() {
        currentPrompt.value = null
        currentMode.value = 'select'
        userEssay.value = ''
        evaluationResult.value = null
        timestamp.value = Date.now()
    }

    // 清除持久化数据
    function clearPersistedState() {
        resetWriting()
    }

    return {
        // State
        currentPrompt,
        currentMode,
        userEssay,
        evaluationResult,
        selectedType,
        selectedTopic,
        timestamp,

        // Getters
        isExpired,

        // Actions
        startWriting,
        saveDraft,
        submitEvaluation,
        resetWriting,
        clearPersistedState
    }
}, {
    persist: {
        key: 'learnsphere-writing',
        storage: localStorage,
        paths: [
            'currentPrompt',
            'currentMode',
            'userEssay',
            'evaluationResult',
            'selectedType',
            'selectedTopic',
            'timestamp'
        ]
    }
})
