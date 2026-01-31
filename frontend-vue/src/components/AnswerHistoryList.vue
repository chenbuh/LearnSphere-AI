<template>
  <div class="history-list">
    <n-spin :show="loading">
      <n-empty v-if="!records || records.length === 0" description="暂无练习记录">
        <template #icon>
          <div style="font-size: 48px">📝</div>
        </template>
      </n-empty>

      <div v-else class="records-grid">
        <n-card 
          v-for="record in records" 
          :key="record.id"
          class="record-card"
          hoverable
        >
          <!-- Header -->
          <div class="record-header">
            <div class="title-section">
              <h3>{{ record.title || '练习题目' }}</h3>
              <n-space class="meta-info" size="small">
                <n-tag :type="getScoreType(record.score)" size="small">
                  得分: {{ record.score || 0 }}%
                </n-tag>
                <n-tag v-if="record.difficulty" size="small" :bordered="false">
                  {{ difficultyMap[record.difficulty] || record.difficulty }}
                </n-tag>
                <span class="time">{{ formatTime(record.createTime) }}</span>
              </n-space>
            </div>
          </div>

          <!-- Questions and Answers -->
          <n-collapse class="qa-collapse" arrow-placement="right">
            <n-collapse-item 
              v-for="(qa, idx) in parseQuestionsAndAnswers(record)" 
              :key="idx"
              :title="`问题 ${idx + 1}`"
            >
              <!-- Question -->
              <div class="question-block">
                <p class="question-text">{{ qa.question }}</p>
                <n-space v-if="qa.options && qa.options.length > 0" vertical class="options-list">
                  <div 
                    v-for="opt in formatOptions(qa.options)" 
                    :key="opt.key"
                    class="option-item"
                    :class="{
                      'correct': opt.key == qa.correctAnswer,
                      'wrong': opt.key == qa.userAnswer && opt.key != qa.correctAnswer,
                      'selected': opt.key == qa.userAnswer
                    }"
                  >
                    <span class="option-key">{{ opt.label }}.</span>
                    <span class="option-text">{{ opt.text }}</span>
                    <n-tag v-if="opt.key == qa.correctAnswer" type="success" size="tiny" style="margin-left: 8px">
                      ✓ 正确答案
                    </n-tag>
                    <n-tag v-else-if="opt.key == qa.userAnswer" type="error" size="tiny" style="margin-left: 8px">
                      ✗ 你的答案
                    </n-tag>
                  </div>
                </n-space>

                <!-- For writing/speaking (non-choice questions) -->
                <div v-else class="text-answer-block">
                  <div class="answer-section">
                    <strong>你的答案：</strong>
                    <p class="user-answer">{{ qa.userAnswer || '未作答' }}</p>
                  </div>
                  <div v-if="qa.feedback" class="feedback-section">
                    <strong>AI 评价：</strong>
                    <p class="feedback-text">{{ qa.feedback }}</p>
                  </div>
                </div>

                <!-- Explanation -->
                <div v-if="qa.explanation" class="explanation-block">
                  <n-alert type="info" :bordered="false">
                    <template #header>
                      <strong>📖 解析</strong>
                    </template>
                    {{ qa.explanation }}
                  </n-alert>
                </div>
              </div>
            </n-collapse-item>
          </n-collapse>
        </n-card>

        <!-- Pagination -->
        <div class="pagination-footer">
          <n-pagination
            :page="page"
            :page-size="pageSize"
            :item-count="total"
            show-size-picker
            :page-sizes="[10, 20, 30, 50]"
            @update:page="$emit('update:page', $event)"
            @update:page-size="$emit('update:page-size', $event)"
          />
        </div>
      </div>
    </n-spin>
  </div>
</template>

<script setup>
import { NCard, NEmpty, NSpace, NTag, NCollapse, NCollapseItem, NAlert, NSpin, NPagination } from 'naive-ui'
import { computed } from 'vue'

const props = defineProps({
  module: {
    type: String,
    required: true
  },
  records: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 20
  },
  total: {
    type: Number,
    default: 0
  }
})

defineEmits(['update:page', 'update:page-size', 'load-more'])

const difficultyMap = {
  'easy': '初级',
  'medium': '中级',
  'hard': '高级',
  '初级': '初级',
  '中级': '中级',
  '高级': '高级'
}

const getScoreType = (score) => {
  if (!score) return 'default'
  if (score >= 90) return 'success'
  if (score >= 70) return 'warning'
  return 'error'
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes === 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  }
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
}

const parseQuestionsAndAnswers = (record) => {
  try {
    // Parse questions from JSON string or array
    let questions = []
    if (typeof record.questions === 'string') {
      try {
        const parsed = JSON.parse(record.questions)
        questions = Array.isArray(parsed) ? parsed : [parsed]
      } catch (e) {
        console.warn('Failed to parse questions JSON', e)
        questions = []
      }
    } else if (Array.isArray(record.questions)) {
      questions = record.questions
    } else if (record.questions) {
      questions = [record.questions]
    }

    // Parse user answers
    let userAnswers = []
    if (typeof record.answer === 'string') {
      try {
        // Try parsing as JSON first (e.g. "[1, 2]" or "1")
        const parsedAns = JSON.parse(record.answer)
        userAnswers = parsedAns
      } catch {
        // If not JSON, treat as raw string
        userAnswers = record.answer
      }
    } else {
      userAnswers = record.answer
    }

    // Combine questions with answers
    return questions.map((q, idx) => {
      // Priority 1: Check if answer is already embedded in the question object (New Reading Logic)
      if (q && typeof q === 'object' && q.userAnswer !== undefined) {
          let actualQ = q
          // Handle nested question structure if present, but keep top-level answer
          if (q.question && typeof q.question === 'object') {
             actualQ = { ...q.question, userAnswer: q.userAnswer, correctAnswer: q.correctAnswer, isCorrect: q.isCorrect }
          }
          
          return {
            question: actualQ.question || actualQ.text || '题目内容',
            options: actualQ.options || [],
            userAnswer: actualQ.userAnswer,
            correctAnswer: actualQ.correctAnswer || actualQ.answer || actualQ.correct,
            explanation: actualQ.explanation,
            feedback: actualQ.feedback
          }
      }

      const userAns = Array.isArray(userAnswers) ? userAnswers[idx] : userAnswers
      
      // Handle different question structures
      // 1. Direct object: { text: "...", options: ... }
      // 2. String: "Question text"
      // 3. Nested Reading structure: { question: { text: "...", options: ... } }
      
      let actualQ = q
      // Try to extract nested question if 'q' itself doesn't look like a question but has a 'question' property
      if (q && typeof q === 'object' && !q.text && !q.options && q.question) {
        actualQ = q.question
      }

      return {
        question: actualQ?.question || actualQ?.text || (typeof actualQ === 'string' ? actualQ : '题目内容格式错误'),
        options: actualQ?.options || [],
        userAnswer: userAns,
        correctAnswer: actualQ?.answer || actualQ?.correct || actualQ?.correctAnswer,
        explanation: actualQ?.explanation,
        feedback: actualQ?.feedback
      }
    })
  } catch (e) {
    console.error('Failed to parse Q&A:', e)
    return [{
      question: '解析失败',
      userAnswer: record.answer,
      correctAnswer: record.correctAnswer
    }]
  }
}

const formatOptions = (options) => {
  if (!Array.isArray(options)) return []
  return options.map((text, idx) => ({
    key: idx, // Use index for comparison with answer (stored as 0,1,2...)
    text: text,
    label: String.fromCharCode(65 + idx) // A, B, C...
  }))
}
</script>

<style scoped>
.history-list {
  min-height: 400px;
}

.records-grid {
  display: grid;
  gap: 20px;
}

.record-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.record-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.record-header {
  margin-bottom: 16px;
}

.title-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.meta-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.time {
  font-size: 12px;
  color: #999;
}

.qa-collapse {
  margin-top: 16px;
}

.question-block {
  padding: 12px 0;
}

.question-text {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #e5e7eb;
  line-height: 1.6;
}

.options-list {
  width: 100%;
}

.option-item {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.option-item.correct {
  background: rgba(183, 235, 143, 0.2);
  border-color: #52c41a;
}

.option-item.wrong {
  background: rgba(255, 204, 199, 0.2);
  border-color: #ff4d4f;
}

.option-item.selected:not(.correct) {
  border-color: #ff7875;
}

.option-key {
  font-weight: 600;
  margin-right: 8px;
  color: #9ca3af;
}

.option-text {
  flex: 1;
  color: #e5e7eb;
}

.text-answer-block {
  margin-top: 12px;
}

.answer-section,
.feedback-section {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-answer,
.feedback-text {
  margin-top: 8px;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #d1d5db;
}

.explanation-block {
  margin-top: 16px;
}

.pagination-footer {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

@media (max-width: 768px) {
  .record-card {
    border-radius: 8px;
  }

  :deep(.n-card__content) {
    padding: 12px !important;
  }

  .record-header {
    margin-bottom: 12px;
  }

  .title-section h3 {
    font-size: 15px;
    margin-bottom: 6px;
    line-height: 1.4;
  }

  .meta-info {
    gap: 6px !important;
  }

  .time {
    font-size: 11px;
    width: 100%; /* 换行显示时间 */
    margin-top: 4px;
    display: block;
  }

  .question-text {
    font-size: 14px;
    margin-bottom: 12px;
  }

  .option-item {
    padding: 8px 10px;
    font-size: 13px;
  }

  .option-key {
    font-size: 13px;
    margin-right: 6px;
  }

  .text-answer-block {
    font-size: 13px;
  }

  .answer-section,
  .feedback-section {
    padding: 10px;
    margin-top: 8px;
  }

  .explanation-block {
    margin-top: 12px;
  }

  :deep(.n-alert) {
    padding: 10px !important;
  }
}
</style>
