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
                    v-for="(opt, optIdx) in qa.options" 
                    :key="optIdx"
                    class="option-item"
                    :class="{
                      'correct': opt.key === qa.correctAnswer,
                      'wrong': opt.key === qa.userAnswer && opt.key !== qa.correctAnswer,
                      'selected': opt.key === qa.userAnswer
                    }"
                  >
                    <span class="option-key">{{ opt.key }}.</span>
                    <span class="option-text">{{ opt.text }}</span>
                    <n-tag v-if="opt.key === qa.correctAnswer" type="success" size="tiny" style="margin-left: 8px">
                      ✓ 正确答案
                    </n-tag>
                    <n-tag v-else-if="opt.key === qa.userAnswer" type="error" size="tiny" style="margin-left: 8px">
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
      </div>
    </n-spin>
  </div>
</template>

<script setup>
import { NCard, NEmpty, NSpace, NTag, NCollapse, NCollapseItem, NAlert, NSpin } from 'naive-ui'
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
  }
})

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
      questions = JSON.parse(record.questions)
    } else if (Array.isArray(record.questions)) {
      questions = record.questions
    }

    // Parse user answers
    let userAnswers = []
    if (typeof record.answer === 'string') {
      try {
        userAnswers = JSON.parse(record.answer)
      } catch {
        userAnswers = [record.answer]
      }
    } else if (Array.isArray(record.answer)) {
      userAnswers = record.answer
    }

    // Combine questions with answers
    return questions.map((q, idx) => {
      const userAns = Array.isArray(userAnswers) ? userAnswers[idx] : userAnswers
      
      return {
        question: q.question || q.text || q,
        options: q.options || [],
        userAnswer: userAns,
        correctAnswer: q.answer || q.correctAnswer,
        explanation: q.explanation,
        feedback: q.feedback
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
  color: #333;
  line-height: 1.6;
}

.options-list {
  width: 100%;
}

.option-item {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.option-item.correct {
  background: #f6ffed;
  border-color: #b7eb8f;
}

.option-item.wrong {
  background: #fff2f0;
  border-color: #ffccc7;
}

.option-item.selected:not(.correct) {
  border-color: #ff7875;
}

.option-key {
  font-weight: 600;
  margin-right: 8px;
  color: #666;
}

.option-text {
  flex: 1;
  color: #333;
}

.text-answer-block {
  margin-top: 12px;
}

.answer-section,
.feedback-section {
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.user-answer,
.feedback-text {
  margin-top: 8px;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #555;
}

.explanation-block {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .title-section h3 {
    font-size: 16px;
  }

  .question-text {
    font-size: 14px;
  }

  .option-item {
    padding: 10px 12px;
  }
}
</style>
