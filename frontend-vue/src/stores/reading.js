import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Reading Store with timestamp expiration (24 hours)
 */
export const useReadingStore = defineStore('reading', () => {
    // 当前阅读状态
    const currentArticle = ref(null)
    const currentMode = ref('select') // 'select' | 'reading' | 'answering'
    const currentQuestionIndex = ref(0)
    const userAnswers = ref([])
    const isSubmitted = ref(false)

    // 时间戳（用于过期检测）
    const timestamp = ref(Date.now())

    // 配置
    const selectedLevel = ref('intermediate')
    const selectedTopic = ref('')

    // 检查数据是否过期（24小时）
    const isExpired = () => {
        const now = Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000
        return (now - timestamp.value) > twentyFourHours
    }

    // 开始新阅读
    function startReading(article, level, topic) {
        currentArticle.value = article
        selectedLevel.value = level
        selectedTopic.value = topic
        currentMode.value = 'reading'
        currentQuestionIndex.value = 0
        userAnswers.value = new Array(article.questions?.length || 0).fill(null)
        isSubmitted.value = false
        timestamp.value = Date.now() // 更新时间戳
    }

    // 提交答案
    function submitAnswer(index, answer) {
        userAnswers.value[index] = answer
    }

    // 提交整个测试
    function submitReading() {
        isSubmitted.value = true
    }

    // 重置阅读
    function resetReading() {
        currentArticle.value = null
        currentMode.value = 'select'
        currentQuestionIndex.value = 0
        userAnswers.value = []
        isSubmitted.value = false
        timestamp.value = Date.now()
    }

    // 清除持久化数据
    function clearPersistedState() {
        resetReading()
    }

    return {
        // State
        currentArticle,
        currentMode,
        currentQuestionIndex,
        userAnswers,
        isSubmitted,
        selectedLevel,
        selectedTopic,
        timestamp,

        // Getters
        isExpired,

        // Actions
        startReading,
        submitAnswer,
        submitReading,
        resetReading,
        clearPersistedState
    }
}, {
    persist: {
        key: 'learnsphere-reading',
        storage: localStorage,
        paths: [
            'currentArticle',
            'currentMode',
            'currentQuestionIndex',
            'userAnswers',
            'isSubmitted',
            'selectedLevel',
            'selectedTopic',
            'timestamp' // 持久化时间戳
        ]
    }
})
