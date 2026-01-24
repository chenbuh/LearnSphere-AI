import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMockExamStore = defineStore('mockExam', () => {
    // 当前考试状态
    const activeExam = ref(null)
    const examQuestions = ref([])
    const userAnswers = ref([])
    const currentQuestionIndex = ref(0)
    const examStartTime = ref(null)
    const step = ref('setup')

    // 时间戳（用于过期检测）
    const timestamp = ref(Date.now())

    // 检查数据是否过期（24小时）
    const isExpired = () => {
        const now = Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000
        return (now - timestamp.value) > twentyFourHours
    }

    // 开始新考试
    function startExam(exam, questions) {
        activeExam.value = exam
        examQuestions.value = questions
        userAnswers.value = new Array(questions.length).fill(null)
        currentQuestionIndex.value = 0
        examStartTime.value = Date.now()
        step.value = 'testing'
        timestamp.value = Date.now()
    }

    // 更新进度
    function updateProgress(index, answer, currentIdx) {
        userAnswers.value[index] = answer
        currentQuestionIndex.value = currentIdx
        timestamp.value = Date.now()
    }

    // 清除状态
    function clearPersistedState() {
        activeExam.value = null
        examQuestions.value = []
        userAnswers.value = []
        currentQuestionIndex.value = 0
        examStartTime.value = null
        step.value = 'setup'
        timestamp.value = Date.now()
    }

    return {
        activeExam,
        examQuestions,
        userAnswers,
        currentQuestionIndex,
        examStartTime,
        step,
        timestamp,
        isExpired,
        startExam,
        updateProgress,
        clearPersistedState
    }
}, {
    persist: {
        key: 'learnsphere-mock-exam',
        storage: localStorage,
        paths: [
            'activeExam',
            'examQuestions',
            'userAnswers',
            'currentQuestionIndex',
            'examStartTime',
            'step',
            'timestamp'
        ]
    }
})
