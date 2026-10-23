<script setup>
import { computed, ref, watch } from 'vue'
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NRadio,
  NSelect,
  NSpin,
  useMessage
} from 'naive-ui'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import { EXAM_TYPE_LABELS } from '@/utils/examTypeMeta'

const props = defineProps({
  show: { type: Boolean, default: false },
  // 为空表示新建
  examId: { type: [Number, String], default: null }
})
const emit = defineEmits(['update:show', 'saved'])

const message = useMessage()
const loading = ref(false)
const saving = ref(false)

const examTypeOptions = Object.entries(EXAM_TYPE_LABELS).map(([value, label]) => ({ value, label }))
const difficultyOptions = [
  { value: 1, label: '入门' },
  { value: 2, label: '简单' },
  { value: 3, label: '中等' },
  { value: 4, label: '困难' },
  { value: 5, label: '挑战' }
]
const questionTypeOptions = [
  { value: 'choice', label: '选择题' },
  { value: 'essay', label: '写作题' },
  { value: 'translation', label: '翻译题' },
  { value: 'fill', label: '填空/简答' }
]

const emptyQuestion = () => ({ section: '', type: 'choice', text: '', options: ['', '', '', ''], correct: 0 })
const emptyForm = () => ({ title: '', examType: 'cet4', duration: 60, difficulty: 3, questions: [emptyQuestion()] })
const form = ref(emptyForm())

const isEdit = computed(() => props.examId != null)

// 兼容 AI 生成的题目：type 可能是 single_choice、listening 等，有选项就按选择题编辑
const normalizeQuestion = (q) => {
  const options = Array.isArray(q.options) ? q.options.map((o) => (typeof o === 'string' ? o : o?.text ?? String(o))) : []
  const knownType = questionTypeOptions.some((opt) => opt.value === q.type)
  return {
    ...q,
    section: q.section || '',
    type: knownType ? q.type : options.length ? 'choice' : 'fill',
    text: q.text || q.question || '',
    options: options.length ? options : ['', '', '', ''],
    correct: q.correct == null || q.correct === '' ? null : Number(q.correct)
  }
}

const load = async () => {
  if (!isEdit.value) {
    form.value = emptyForm()
    return
  }
  loading.value = true
  try {
    const res = await adminApi.getExamDetail(props.examId)
    const exam = res.data || {}
    form.value = {
      title: exam.title || '',
      examType: exam.examType || 'cet4',
      duration: exam.duration || 60,
      difficulty: exam.difficulty || 3,
      questions: (exam.questions || []).map(normalizeQuestion)
    }
    if (!form.value.questions.length) form.value.questions.push(emptyQuestion())
  } catch {
    message.error('加载试卷失败')
    emit('update:show', false)
  } finally {
    loading.value = false
  }
}

watch(() => props.show, (visible) => {
  if (visible) load()
})

const addQuestion = () => {
  const last = form.value.questions[form.value.questions.length - 1]
  form.value.questions.push({ ...emptyQuestion(), section: last?.section || '' })
}
const removeQuestion = (index) => form.value.questions.splice(index, 1)
const moveQuestion = (index, delta) => {
  const target = index + delta
  const list = form.value.questions
  if (target < 0 || target >= list.length) return
  ;[list[index], list[target]] = [list[target], list[index]]
}
const addOption = (q) => q.options.push('')
const removeOption = (q, index) => {
  q.options.splice(index, 1)
  if (q.correct === index) q.correct = null
  else if (q.correct > index) q.correct -= 1
}

const optionLetter = (index) => String.fromCharCode(65 + index)

const buildPayload = () => ({
  title: form.value.title,
  examType: form.value.examType,
  duration: form.value.duration,
  difficulty: form.value.difficulty,
  questions: form.value.questions.map((q) => {
    const base = { ...q, text: q.text.trim(), section: q.section.trim() }
    if (q.type !== 'choice') {
      // 非选择题不保存空的选项和答案下标
      delete base.options
      delete base.correct
    } else {
      base.options = q.options.map((o) => o.trim())
    }
    return base
  })
})

const validate = () => {
  if (!form.value.title.trim()) return '请填写试卷标题'
  for (let i = 0; i < form.value.questions.length; i++) {
    const q = form.value.questions[i]
    if (!q.text.trim()) return `第 ${i + 1} 题缺少题干`
    if (q.type === 'choice') {
      if (q.options.length < 2 || q.options.some((o) => !o.trim())) return `第 ${i + 1} 题至少需要两个非空选项`
      if (q.correct == null) return `第 ${i + 1} 题请选择正确答案`
    }
  }
  return null
}

const submit = async () => {
  const error = validate()
  if (error) {
    message.warning(error)
    return
  }
  saving.value = true
  try {
    const payload = buildPayload()
    const res = isEdit.value ? await adminApi.updateExam(props.examId, payload) : await adminApi.createExam(payload)
    if (res.code === 200) {
      message.success(isEdit.value ? '试卷已保存' : '试卷已创建')
      emit('saved')
      emit('update:show', false)
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    :title="isEdit ? '编辑试卷' : '新建试卷'"
    style="width: min(880px, 96vw)"
    :mask-closable="!saving"
    @update:show="emit('update:show', $event)"
  >
    <n-spin :show="loading">
      <n-form label-placement="top" class="exam-meta">
        <n-form-item label="试卷标题" required class="exam-meta__title">
          <n-input v-model:value="form.title" maxlength="200" placeholder="例如：CET-4 全真模拟（一）" />
        </n-form-item>
        <n-form-item label="考试类型" required>
          <n-select v-model:value="form.examType" :options="examTypeOptions" />
        </n-form-item>
        <n-form-item label="时长（分钟）" required>
          <n-input-number v-model:value="form.duration" :min="1" :max="600" style="width: 100%" />
        </n-form-item>
        <n-form-item label="难度">
          <n-select v-model:value="form.difficulty" :options="difficultyOptions" />
        </n-form-item>
      </n-form>

      <div class="q-head">
        <strong>题目</strong>
        <span>{{ form.questions.length }} 题</span>
      </div>

      <ol class="q-list">
        <li v-for="(q, index) in form.questions" :key="index" class="q-item">
          <div class="q-item__bar">
            <span class="q-item__no">{{ index + 1 }}</span>
            <n-input v-model:value="q.section" size="small" placeholder="所属部分，如 Part III Reading" class="q-item__section" />
            <n-select v-model:value="q.type" size="small" :options="questionTypeOptions" class="q-item__type" />
            <div class="q-item__tools">
              <n-button size="tiny" quaternary :disabled="index === 0" aria-label="上移" @click="moveQuestion(index, -1)">
                <template #icon><ArrowUp :size="14" /></template>
              </n-button>
              <n-button size="tiny" quaternary :disabled="index === form.questions.length - 1" aria-label="下移" @click="moveQuestion(index, 1)">
                <template #icon><ArrowDown :size="14" /></template>
              </n-button>
              <n-button size="tiny" quaternary type="error" :disabled="form.questions.length === 1" aria-label="删除题目" @click="removeQuestion(index)">
                <template #icon><Trash2 :size="14" /></template>
              </n-button>
            </div>
          </div>

          <n-input v-model:value="q.text" type="textarea" :autosize="{ minRows: 2, maxRows: 8 }" placeholder="题干或阅读材料" />

          <div v-if="q.type === 'choice'" class="q-options">
            <div v-for="(option, oi) in q.options" :key="oi" class="q-option">
              <n-radio :checked="q.correct === oi" :aria-label="`设为正确答案 ${optionLetter(oi)}`" @update:checked="q.correct = oi" />
              <span class="q-option__letter">{{ optionLetter(oi) }}</span>
              <n-input v-model:value="q.options[oi]" size="small" :placeholder="`选项 ${optionLetter(oi)}`" />
              <n-button size="tiny" quaternary :disabled="q.options.length <= 2" aria-label="删除选项" @click="removeOption(q, oi)">
                <template #icon><Trash2 :size="13" /></template>
              </n-button>
            </div>
            <div class="q-options__foot">
              <n-button size="tiny" quaternary :disabled="q.options.length >= 8" @click="addOption(q)">
                <template #icon><Plus :size="13" /></template>
                添加选项
              </n-button>
              <span class="q-options__hint">点击左侧圆点标记正确答案</span>
            </div>
          </div>
        </li>
      </ol>

      <n-button dashed block @click="addQuestion">
        <template #icon><Plus :size="15" /></template>
        添加题目
      </n-button>
    </n-spin>

    <template #footer>
      <div class="modal-actions">
        <n-button @click="emit('update:show', false)">取消</n-button>
        <n-button type="primary" :loading="saving" :disabled="loading" @click="submit">
          {{ isEdit ? '保存试卷' : '创建试卷' }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<style scoped>
.exam-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 16px;
}

.exam-meta__title {
  grid-column: 1 / -1;
}

.q-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 4px 0 12px;
  color: var(--ink);
}

.q-head span {
  color: var(--ink-3);
  font-size: 12px;
}

.q-list {
  display: grid;
  gap: 12px;
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
  max-height: 52vh;
  overflow-y: auto;
}

.q-item {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--surface);
}

.q-item__bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.q-item__no {
  flex: none;
  width: 24px;
  color: var(--ink-3);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.q-item__section {
  flex: 1 1 auto;
}

.q-item__type {
  flex: none;
  width: 120px;
}

.q-item__tools {
  display: flex;
  flex: none;
  gap: 2px;
}

.q-options {
  display: grid;
  gap: 6px;
  padding-left: 32px;
}

.q-option {
  display: grid;
  grid-template-columns: auto 16px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.q-option__letter {
  color: var(--ink-2);
  font-weight: 600;
}

.q-options__foot {
  display: flex;
  align-items: center;
  gap: 12px;
}

.q-options__hint {
  color: var(--ink-3);
  font-size: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 720px) {
  .exam-meta {
    grid-template-columns: minmax(0, 1fr);
  }

  .q-item__bar {
    flex-wrap: wrap;
  }
}
</style>
