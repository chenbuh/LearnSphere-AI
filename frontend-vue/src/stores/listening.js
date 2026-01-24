import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useListeningStore = defineStore('listening', () => {
    // 当前练习状态
    const currentMaterial = ref(null)
    const currentMode = ref('select') // 'select' | 'practice' | 'result'
    const currentQuestionIndex = ref(0)
    const userAnswers = ref([])
    const isSubmitted = ref(false)

    // 时间戳（用于过期检测）
    const timestamp = ref(Date.now())

    // 配置
    const selectedType = ref('conversation')
    const selectedDifficulty = ref('medium')

    // 检查数据是否过期（24小时）
    const isExpired = () => {
        const now = Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000
        return (now - timestamp.value) > twentyFourHours
    }

    // 开始新练习
    function startPractice(material, type, difficulty) {
        currentMaterial.value = material
        selectedType.value = type
        selectedDifficulty.value = difficulty
        currentMode.value = 'practice'
        currentQuestionIndex.value = 0
        userAnswers.value = new Array(material.questions?.length || 0).fill(null)
        isSubmitted.value = false
        timestamp.value = Date.now()
    }

    // 保存全套草稿答案
    function saveDraft(flatAnswers) {
        userAnswers.value = flatAnswers
        timestamp.value = Date.now()
    }

    // 更新当前进度位置（篇章索引）
    function updatePosition(index) {
        currentQuestionIndex.value = index
        timestamp.value = Date.now()
    }

    // 完成练习
    function completePractice() {
        isSubmitted.value = true
        currentMode.value = 'result'
    }

    // 清除状态
    function clearPersistedState() {
        currentMaterial.value = null
        currentMode.value = 'select'
        currentQuestionIndex.value = 0
        userAnswers.value = []
        isSubmitted.value = false
        timestamp.value = Date.now()
    }

    return {
        currentMaterial,
        currentMode,
        currentQuestionIndex,
        userAnswers,
        isSubmitted,
        selectedType,
        selectedDifficulty,
        timestamp,
        isExpired,
        startPractice,
        saveDraft,
        updatePosition,
        completePractice,
        clearPersistedState
    }
}, {
    persist: {
        key: 'learnsphere-listening',
        storage: localStorage,
        paths: [
            'currentMaterial',
            'currentMode',
            'currentQuestionIndex',
            'userAnswers',
            'isSubmitted',
            'selectedType',
            'selectedDifficulty',
            'timestamp'
        ]
    }
})
