import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { vocabularyDatabase } from '../data/vocabulary.js'
import { vocabularyApi } from '../api/vocabulary.js'
import { learningApi } from '../api/learning.js'
import { decryptPayload } from '@/utils/crypto'

export const useVocabularyStore = defineStore('vocabulary', () => {
    // State
    const learned = ref(new Set())
    const mastered = ref(new Set())
    const failed = ref(new Set())
    const reviewing = ref(new Set())
    const lastStudied = ref({}) // word -> timestamp
    const totalStudyTime = ref(0)
    const todayLearnedCount = ref(0) // Track daily progress

    // Storage Key
    const STORAGE_KEY = 'learnsphere_vocab_progress'

    // Load progress from localStorage
    const loadProgress = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const data = JSON.parse(stored)
                learned.value = new Set(data.learned || [])
                mastered.value = new Set(data.mastered || [])
                failed.value = new Set(data.failed || [])
                reviewing.value = new Set(data.reviewing || [])
                lastStudied.value = data.lastStudied || {}
                totalStudyTime.value = data.totalStudyTime || 0

                // Reset daily count if needed (simple logic for now)
                const lastDate = data.lastSaveDate ? new Date(data.lastSaveDate).toDateString() : ''
                if (lastDate !== new Date().toDateString()) {
                    todayLearnedCount.value = 0
                } else {
                    todayLearnedCount.value = data.todayLearnedCount || 0
                }
            }
        } catch (e) {
            console.error('Failed to load vocabulary progress', e)
        }
    }

    // Save progress to localStorage
    const saveProgress = () => {
        try {
            const data = {
                learned: Array.from(learned.value),
                mastered: Array.from(mastered.value),
                failed: Array.from(failed.value),
                reviewing: Array.from(reviewing.value),
                lastStudied: lastStudied.value,
                totalStudyTime: totalStudyTime.value,
                todayLearnedCount: todayLearnedCount.value,
                lastSaveDate: Date.now()
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        } catch (e) {
            console.error('Failed to save vocabulary progress', e)
        }
    }

    // Action: Record learning result for a word
    const recordResult = async (word, isCorrect, timeSpent = 0) => {
        const wordText = word.word
        lastStudied.value[wordText] = Date.now()

        // Send to backend API
        try {
            await learningApi.createRecord({
                contentId: word.id,
                contentType: 'vocabulary',
                isCorrect: isCorrect ? 1 : 0,
                timeSpent: timeSpent,
                answer: isCorrect ? 'correct' : 'wrong',
                correctAnswer: 'correct',
                masteryLevel: isCorrect ? 3 : 1,
                originalContent: JSON.stringify({
                    word: word.word,
                    phonetic: word.phonetic,
                    meaning: word.meaning,
                    translation: word.translation,
                    example: word.example,
                    exampleTranslation: word.exampleTranslation
                })
            })
        } catch (e) {
            console.error('Failed to save vocabulary learning record to backend', e)
        }

        if (isCorrect) {
            if (failed.value.has(wordText)) {
                // Was failed, now correct -> Move to reviewing or learned
                failed.value.delete(wordText)
                reviewing.value.add(wordText)
            } else {
                // First time or already reviewing -> Mark learned
                learned.value.add(wordText)
                reviewing.value.delete(wordText)
            }
            todayLearnedCount.value++
        } else {
            failed.value.add(wordText)
            learned.value.delete(wordText)
            mastered.value.delete(wordText)
        }

        saveProgress()
    }

    // Action: Mark as Mastered manually
    const markMastered = (word) => {
        const wordText = word.word
        mastered.value.add(wordText)
        learned.value.add(wordText)
        failed.value.delete(wordText)
        reviewing.value.delete(wordText)
        saveProgress()
    }

    // Getter: Get recommended words for a session
    const getRecommendedWords = (examType, count = 20) => {
        const allWords = vocabularyDatabase.loadRealVocabularyData(examType) || []

        // 1. Failed words first (Need review)
        const failedWords = allWords.filter(w => failed.value.has(w.word))

        // 2. New words (Not learned, not failed, not mastered)
        const newWords = allWords.filter(w =>
            !learned.value.has(w.word) &&
            !failed.value.has(w.word) &&
            !mastered.value.has(w.word)
        )

        // Mix strategy: 30% failed/review, 70% new
        const reviewCount = Math.min(failedWords.length, Math.floor(count * 0.3))
        const freshCount = count - reviewCount

        // Scramble logic could be added here, for now just slice
        const sessionWords = [
            ...failedWords.slice(0, reviewCount),
            ...newWords.slice(0, freshCount)
        ]

        // Shuffle the result
        return sessionWords.sort(() => Math.random() - 0.5)
    }

    // Getter: Get recommended words for a session (Async version for real API)
    const fetchRecommended = async (examType, count = 20) => {
        try {
            const res = await vocabularyApi.getDailyWords({ examType, count })
            const decryptedData = decryptPayload(res.data)
            const records = decryptedData.records || []

            return records.map(w => ({
                ...w,
                meaning: w.translation,
                examples: w.example ? [{
                    en: w.example,
                    cn: w.exampleTranslation
                }] : []
            }))
        } catch (error) {
            console.error('Failed to fetch recommended words:', error)
            return []
        }
    }

    // Statistics
    const stats = computed(() => ({
        totalLearned: learned.value.size,
        totalMastered: mastered.value.size,
        totalFailed: failed.value.size,
        todayCount: todayLearnedCount.value
    }))

    // Initial load
    loadProgress()

    return {
        learned,
        mastered,
        failed,
        stats,
        recordResult,
        markMastered,
        getRecommendedWords,
        fetchRecommended,
        loadProgress
    }
})
