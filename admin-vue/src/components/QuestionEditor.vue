<script setup>
import { ref, watch } from 'vue'
import { NButton, NInput, NSpace, NCard, NRadioGroup, NRadio, NIcon, NEmpty } from 'naive-ui'
import { Plus, Trash, CheckCircle } from 'lucide-vue-next'

const props = defineProps({
  value: {
    type: String,
    default: '[]'
  }
})

const emit = defineEmits(['update:value'])

// 内部数据模型：Array
const questions = ref([])

// 初始化：将传入的 JSON 字符串解析为对象数组
watch(() => props.value, (newVal) => {
  try {
    const parsed = JSON.parse(newVal || '[]')
    // 只有当解析结果和当前内部状态不一致时才更新，避免循环更新导致的光标跳动等问题
    if (JSON.stringify(parsed) !== JSON.stringify(questions.value)) {
      questions.value = Array.isArray(parsed) ? parsed : []
    }
  } catch (e) {
    console.error('Invalid JSON for questions:', e)
    questions.value = []
  }
}, { immediate: true })

// 监听内部变化，同步回父组件（序列化为字符串）
watch(questions, (newVal) => {
  emit('update:value', JSON.stringify(newVal))
}, { deep: true })

const addQuestion = () => {
  questions.value.push({
    id: Date.now(), // 临时 ID
    text: '',
    options: ['', '', '', ''], // 默认4个选项
    correct: 0
  })
}

const removeQuestion = (index) => {
  questions.value.splice(index, 1)
}

const addOption = (questionIndex) => {
  questions.value[questionIndex].options.push('')
}

const removeOption = (questionIndex, optionIndex) => {
  questions.value[questionIndex].options.splice(optionIndex, 1)
  // 如果删除的是正确答案或前面的选项，可能需要重置正确答案索引
  if (questions.value[questionIndex].correct >= questions.value[questionIndex].options.length) {
    questions.value[questionIndex].correct = 0
  }
}
</script>

<template>
  <div class="question-editor">
    <div v-if="questions.length === 0" class="empty-state">
      <n-empty description="暂无题目">
        <template #extra>
          <n-button type="primary" dashed @click="addQuestion">
            <template #icon><n-icon :component="Plus" /></template>
            添加第一道题
          </n-button>
        </template>
      </n-empty>
    </div>

    <div v-else class="questions-list">
      <n-card 
        v-for="(q, qIndex) in questions" 
        :key="qIndex" 
        class="question-card" 
        size="small"
      >
        <template #header>
          <div class="card-header">
            <span class="q-index">Q{{ qIndex + 1 }}</span>
            <n-input v-model:value="q.text" placeholder="输入题目题干..." class="q-input" />
          </div>
        </template>
        <template #header-extra>
          <n-button text type="error" @click="removeQuestion(qIndex)">
            <template #icon><n-icon :component="Trash" /></template>
          </n-button>
        </template>

        <div class="options-section">
          <n-radio-group v-model:value="q.correct" name="correct-answer">
            <div 
              v-for="(opt, oIndex) in q.options" 
              :key="oIndex" 
              class="option-row"
              :class="{ 'is-correct': q.correct === oIndex }"
            >
              <n-radio :value="oIndex" class="correct-radio" title="设为正确答案" />
              <span class="option-label">{{ String.fromCharCode(65 + oIndex) }}.</span>
              <n-input 
                v-model:value="q.options[oIndex]" 
                placeholder="输入选项内容" 
                size="small"
              />
              <n-button 
                text 
                type="error" 
                size="tiny" 
                @click="removeOption(qIndex, oIndex)"
                :disabled="q.options.length <= 2"
                class="del-opt-btn"
              >
                <n-icon :component="Trash" />
              </n-button>
            </div>
          </n-radio-group>
          
          <n-button dashed size="small" block class="add-opt-btn" @click="addOption(qIndex)">
            <template #icon><n-icon :component="Plus" /></template>
            添加选项
          </n-button>
        </div>
      </n-card>

      <n-button type="primary" dashed block class="add-question-btn" @click="addQuestion">
        <template #icon><n-icon :component="Plus" /></template>
        添加题目
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.question-editor {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.empty-state {
  padding: 24px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-card {
  background: rgba(30, 30, 35, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.q-index {
  font-weight: 700;
  color: #6366f1;
  min-width: 24px;
}

.q-input {
  flex: 1;
}

.options-section {
  padding-left: 36px; /* Align with input */
}

.option-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.option-row.is-correct {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.option-label {
  font-weight: 600;
  color: #a1a1aa;
  min-width: 20px;
}

.del-opt-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.option-row:hover .del-opt-btn {
  opacity: 1;
}

.add-opt-btn {
  margin-top: 8px;
  opacity: 0.6;
}
.add-opt-btn:hover {
  opacity: 1;
}

.add-question-btn {
  margin-top: 8px;
  height: 48px;
  font-size: 16px;
}
</style>
