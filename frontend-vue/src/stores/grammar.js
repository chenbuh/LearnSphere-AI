import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGrammarStore = defineStore('grammar', () => {
    // 当前练习状态
    const currentExercise = ref(null)
    const currentMode = ref('select') // 'select' | 'quiz'
    const currentQuestionIndex = ref(0)
    const userAnswers = ref([])
    const isSubmitted = ref(false)

    // 时间戳（用于过期检测）
    const timestamp = ref(Date.now())

    // 配置
    const selectedTopic = ref('')
    const selectedDifficulty = ref('medium')
    const questionCount = ref(10)

    // 检查数据是否过期（24小时）
    const isExpired = () => {
        const now = Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000
        return (now - timestamp.value) > twentyFourHours
    }

    // 开始新练习
    function startExercise(exercise, topic, difficulty, count) {
        currentExercise.value = exercise
        selectedTopic.value = topic
        selectedDifficulty.value = difficulty
        questionCount.value = count
        currentMode.value = 'quiz'
        currentQuestionIndex.value = 0
        userAnswers.value = new Array(exercise.questions.length).fill(null)
        isSubmitted.value = false
        timestamp.value = Date.now() // 更新时间戳
    }

    // 提交答案
    function submitAnswer(index, answer) {
        userAnswers.value[index] = answer
    }

    // 提交整个测试
    function submitExercise() {
        isSubmitted.value = true
    }

    // 重置练习
    function resetExercise() {
        currentExercise.value = null
        currentMode.value = 'select'
        currentQuestionIndex.value = 0
        userAnswers.value = []
        isSubmitted.value = false
        timestamp.value = Date.now() // 更新时间戳
    }

    // 清除持久化数据（用于完成练习后）
    function clearPersistedState() {
        resetExercise()
    }

    return {
        // State
        currentExercise,
        currentMode,
        currentQuestionIndex,
        userAnswers,
        isSubmitted,
        selectedTopic,
        selectedDifficulty,
        questionCount,
        timestamp,

        // Getters
        isExpired,

        // Actions
        startExercise,
        submitAnswer,
        submitExercise,
        resetExercise,
        clearPersistedState
    }
}, {
    persist: {
        key: 'learnsphere-grammar',
        storage: localStorage,
        paths: [
            'currentExercise',
            'currentMode',
            'currentQuestionIndex',
            'userAnswers',
            'isSubmitted',
            'selectedTopic',
            'selectedDifficulty',
            'questionCount',
            'timestamp'  // 持久化时间戳
        ]
    }
})
