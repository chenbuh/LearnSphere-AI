/**
 * VocabularyView.vue 集成示例
 * 
 * 在学习模式中添加云端同步
 */

// 1. 导入 masteryApi（已完成）
import { masteryApi } from '../api/mastery.js'

// 2. 修改 handleResult 函数，添加云端同步
const handleResult = async (correct) => {
    const word = currentLearnWord.value
    if (!word) return

    // 记录统计
    if (correct) sessionStats.value.correct++
    else sessionStats.value.wrong++

    // 本地存储（现有逻辑）
    vocabStore.recordResult(word, correct)

    // 【新增】云端同步
    try {
        await masteryApi.recordReview(word.id, correct)
        console.log('[Mastery] ✓ Synced:', word.word)
    } catch (error) {
        console.error('[Mastery] Sync failed:', error)
        // 失败不影响继续学习
    }

    // 继续下一题（现有逻辑）
    if (sessionIndex.value < sessionWords.value.length - 1) {
        sessionIndex.value++
        isFlipped.value = false
        setTimeout(() => {
            playAudio(currentLearnWord.value?.word)
        }, 300)
    } else {
        sessionComplete.value = true
    }
}

// 3. 可选：在 Browse 模式点击单词时也记录查看
const openWordDetail = async (word) => {
    currentDetailWord.value = word
    showDetailModal.value = true
    playAudio(word.word)

    // 【可选】记录为"查看"行为
    try {
        await masteryApi.recordReview(word.id, true) // 当作"认识"
    } catch (error) {
        console.log('[Mastery] Record view failed:', error)
    }
}

// 4. 在统计区域显示云端数据
import { onMounted } from 'vue'

const cloudStats = ref({})

onMounted(async () => {
    // 加载云端统计
    try {
        const res = await masteryApi.getStats()
        cloudStats.value = res.data
        console.log('[Mastery] Cloud stats:', cloudStats.value)
    } catch (error) {
        console.error('[Mastery] Failed to load stats:', error)
    }
})

// 5. 模板中使用云端统计（可选）
/*
<n-card class="stat-card">
  <div class="stat-content">
    <div class="stat-icon">🏆</div>
    <div class="stat-info">
      <div class="stat-label">云端已掌握</div>
      <div class="stat-value">{{ cloudStats.mastered || 0 }}</div>
    </div>
  </div>
</n-card>
*/
