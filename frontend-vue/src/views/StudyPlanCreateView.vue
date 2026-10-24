<template>
  <div class="study-plan-create-container">
    <div class="max-w-4xl mx-auto">
      <!-- 头部 -->
      <div class="header-section mb-8">
        <n-button text @click="goBack" class="mb-4">
          <template #icon>
            <ArrowLeft :size="20" />
          </template>
          返回
        </n-button>
        <h1 class="text-3xl font-bold page-title mb-2">创建学习计划</h1>
        <p class="page-caption">制定一个科学的学习计划，让备考更高效</p>
      </div>

      <!-- 步骤指示器 -->
      <n-steps :current="currentStep" class="mb-8">
        <n-step title="选择考试" description="选择你要备考的考试类型" />
        <n-step title="设置目标" description="设定目标分数和学习时长" />
        <n-step title="确认创建" description="确认计划并开始学习" />
      </n-steps>

      <!-- 表单内容 -->
      <div class="form-card">
        <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
          <!-- 步骤 1: 选择考试类型 -->
          <div v-show="currentStep === 1" class="step-content">
            <h3 class="text-xl font-bold step-title mb-6">选择考试类型</h3>
            <n-form-item label="考试类型" path="examType">
              <div class="exam-type-grid">
                <div
                  v-for="exam in examTypes"
                  :key="exam.value"
                  class="exam-card"
                  :class="{ active: formData.examType === exam.value }"
                  @click="formData.examType = exam.value"
                >
                  <component :is="exam.icon" :size="32" class="mb-3" />
                  <h4 class="text-lg font-bold mb-1">{{ exam.label }}</h4>
                  <p class="exam-description text-sm">{{ exam.description }}</p>
                </div>
              </div>
            </n-form-item>
          </div>

          <!-- 步骤 2: 设置目标 -->
          <div v-show="currentStep === 2" class="step-content">
            <h3 class="text-xl font-bold step-title mb-6">设置学习目标</h3>

            <n-form-item label="目标分数" path="targetScore">
              <n-input-number
                v-model:value="formData.targetScore"
                :min="0"
                :max="getMaxScore()"
                :step="10"
                size="large"
                class="w-full"
              >
                <template #suffix>分</template>
              </n-input-number>
            </n-form-item>

            <n-form-item label="学习时长" path="durationDays">
              <n-radio-group v-model:value="formData.durationDays" size="large">
                <n-space vertical>
                  <n-radio :value="30">30 天冲刺（适合基础较好）</n-radio>
                  <n-radio :value="60">60 天进阶（推荐）</n-radio>
                  <n-radio :value="90">90 天稳扎稳打（适合零基础）</n-radio>
                  <n-radio :value="180">180 天长期规划</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>
          </div>

          <!-- 步骤 3: 确认信息 -->
          <div v-show="currentStep === 3" class="step-content">
            <h3 class="text-xl font-bold step-title mb-6">确认计划信息</h3>

            <div class="confirm-card">
              <div class="confirm-item">
                <span class="label confirm-label">考试类型</span>
                <span class="value confirm-value">{{ getExamLabel() }}</span>
              </div>
              <div class="confirm-item">
                <span class="label confirm-label">目标分数</span>
                <span class="value confirm-value">{{ formData.targetScore }} 分</span>
              </div>
              <div class="confirm-item">
                <span class="label confirm-label">学习时长</span>
                <span class="value confirm-value">{{ formData.durationDays }} 天</span>
              </div>
              <div class="confirm-item">
                <span class="label confirm-label">预计完成日期</span>
                <span class="value confirm-value">{{ getEndDate() }}</span>
              </div>
            </div>

            <n-alert type="info" class="mt-6">
              <template #icon>
                <Lightbulb :size="20" />
              </template>
              系统将根据你的目标自动生成每日学习任务，包括词汇、语法、听力、阅读等模块的练习。
            </n-alert>
          </div>
        </n-form>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <n-button v-if="currentStep > 1" size="large" @click="prevStep"> 上一步 </n-button>
          <n-button
            v-if="currentStep < 3"
            type="primary"
            size="large"
            @click="nextStep"
            :disabled="!canProceed()"
          >
            下一步
          </n-button>
          <n-button
            v-if="currentStep === 3"
            type="primary"
            size="large"
            :loading="creating"
            @click="createPlan"
          >
            创建计划
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton,
  NSteps,
  NStep,
  NForm,
  NFormItem,
  NInputNumber,
  NRadioGroup,
  NRadio,
  NSpace,
  NAlert,
  useMessage
} from 'naive-ui'
import { ArrowLeft, BookOpen, GraduationCap, Globe, Award, Lightbulb } from 'lucide-vue-next'
import { studyPlanApi } from '@/api/studyPlan'
import { useUserStore } from '@/stores/user'
import {
  STUDY_PLAN_EXAM_TYPE_VALUES,
  getExamTypeLabel,
  resolvePreferredExamType
} from '@/constants/examTypes'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()
const formRef = ref(null)
const currentStep = ref(1)
const creating = ref(false)

// 表单数据
const formData = ref({
  examType: resolvePreferredExamType(STUDY_PLAN_EXAM_TYPE_VALUES, userStore.examType),
  targetScore: 425,
  durationDays: 60
})

// 考试类型配置
const examTypeConfigMap = {
  primary: {
    description: '小学英语阶段目标',
    icon: BookOpen,
    maxScore: 100,
    defaultTargetScore: 90
  },
  middle: {
    description: '中考英语备考',
    icon: GraduationCap,
    maxScore: 120,
    defaultTargetScore: 100
  },
  high: { description: '高考英语备考', icon: Award, maxScore: 150, defaultTargetScore: 120 },
  cet4: { description: '大学英语四级考试', icon: BookOpen, maxScore: 710, defaultTargetScore: 425 },
  cet6: {
    description: '大学英语六级考试',
    icon: GraduationCap,
    maxScore: 710,
    defaultTargetScore: 425
  },
  ielts: { description: 'IELTS 国际英语测试', icon: Globe, maxScore: 9, defaultTargetScore: 7 },
  toefl: { description: 'TOEFL 托福考试', icon: Award, maxScore: 120, defaultTargetScore: 90 }
}

const examTypes = STUDY_PLAN_EXAM_TYPE_VALUES.map(value => ({
  value,
  label: getExamTypeLabel(value, value.toUpperCase()),
  ...(examTypeConfigMap[value] || {
    description: value,
    icon: BookOpen,
    maxScore: 100,
    defaultTargetScore: 80
  })
}))

// 表单验证规则
const rules = {
  examType: {
    required: true,
    message: '请选择考试类型',
    trigger: 'change'
  },
  targetScore: {
    required: true,
    type: 'number',
    message: '请输入目标分数',
    trigger: 'blur'
  },
  durationDays: {
    required: true,
    type: 'number',
    message: '请选择学习时长',
    trigger: 'change'
  }
}

// 获取最大分数
const getMaxScore = () => {
  const exam = examTypes.find(e => e.value === formData.value.examType)
  return exam ? exam.maxScore : 710
}

// 获取考试标签
const getExamLabel = () => {
  const exam = examTypes.find(e => e.value === formData.value.examType)
  return exam ? exam.label : ''
}

watch(
  () => formData.value.examType,
  nextExamType => {
    const exam = examTypes.find(item => item.value === nextExamType)
    if (!exam) {
      return
    }

    if (formData.value.targetScore > exam.maxScore || formData.value.targetScore <= 0) {
      formData.value.targetScore = exam.defaultTargetScore
    }
  },
  { immediate: true }
)

// 获取预计完成日期
const getEndDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + formData.value.durationDays)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 检查是否可以进入下一步
const canProceed = () => {
  if (currentStep.value === 1) {
    return formData.value.examType !== ''
  }
  if (currentStep.value === 2) {
    return formData.value.targetScore > 0 && formData.value.durationDays > 0
  }
  return true
}

// 下一步
const nextStep = () => {
  if (canProceed()) {
    currentStep.value++
  }
}

// 上一步
const prevStep = () => {
  currentStep.value--
}

// 返回
const goBack = () => {
  router.back()
}

// 创建计划
const createPlan = async () => {
  creating.value = true
  try {
    await studyPlanApi.createPlan({
      examType: formData.value.examType,
      targetScore: formData.value.targetScore,
      durationDays: formData.value.durationDays
    })

    message.success('学习计划创建成功！')

    // 跳转到每日任务页面
    setTimeout(() => {
      router.push('/daily-tasks')
    }, 1000)
  } catch (error) {
    console.error('创建计划失败:', error)
    message.error(error.response?.data?.message || '创建失败，请重试')
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.study-plan-create-container {
  padding: 24px max(24px, env(safe-area-inset-right)) calc(24px + env(safe-area-inset-bottom))
    max(24px, env(safe-area-inset-left));
  min-height: 100vh;
}

.form-card {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  padding: 32px;
}

.step-content {
  min-height: 400px;
}

.header-section,
.form-card,
.exam-type-grid,
.action-buttons {
  min-width: 0;
}

.page-title,
.step-title,
.confirm-value {
  color: var(--text-color);
}

.page-title,
.confirm-value,
.exam-card h4,
.exam-description {
  overflow-wrap: anywhere;
}

.page-caption,
.exam-description,
.confirm-label {
  /* R2：#9ca3af 在浅色主题下不足 4.5:1，改用次要文字令牌 */
  color: var(--secondary-text);
}

.exam-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  width: 100%;
}

.exam-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.exam-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(43, 122, 96, 0.5);
  transform: translateY(-4px);
}

.exam-card.active {
  background: rgba(43, 122, 96, 0.2);
  border-color: var(--tone-emerald);
}

.exam-card h4 {
  color: var(--text-color);
}

.confirm-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.confirm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.confirm-item:last-child {
  border-bottom: none;
}

.confirm-item .label {
  /* R2：同上，固定灰改次要文字令牌 */
  color: var(--secondary-text);
  font-size: 14px;
}

.confirm-item .value {
  color: var(--text-color);
  font-weight: 600;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

:deep(.n-input-number) {
  width: 100%;
}

:deep(.n-steps) {
  background: rgba(30, 41, 59, 0.3);
  padding: 24px;
  border-radius: var(--radius-lg);
  overflow-x: auto;
  scrollbar-width: none;
}

:deep(.n-steps::-webkit-scrollbar) {
  display: none;
}

:deep(.n-step) {
  min-width: 168px;
}

:global(html[data-theme='light'] .study-plan-create-container) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .page-title),
:global(html[data-theme='light'] .step-title),
:global(html[data-theme='light'] .confirm-value) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .page-caption),
:global(html[data-theme='light'] .exam-description),
:global(html[data-theme='light'] .confirm-label) {
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .study-plan-create-container .text-white),
:global(html[data-theme='light'] .study-plan-create-container h1),
:global(html[data-theme='light'] .study-plan-create-container h3),
:global(html[data-theme='light'] .study-plan-create-container h4) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .study-plan-create-container .text-gray-400),
:global(html[data-theme='light'] .study-plan-create-container .confirm-item .label) {
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .form-card) {
  border-color: rgba(148, 163, 184, 0.18);
  /* R6：固定深色卡片底与浅色主题正文色冲突，补浅色底 */
  background: var(--card-bg);
}

:global(html[data-theme='light'] .exam-card) {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .exam-card:hover) {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(30, 107, 82, 0.32);
}

:global(html[data-theme='light'] .exam-card.active) {
  border-color: rgba(30, 107, 82, 0.4);
}

:global(html[data-theme='light'] .confirm-card) {
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .confirm-item) {
  border-bottom-color: rgba(148, 163, 184, 0.12);
}

:global(html[data-theme='light'] .confirm-item .value) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .action-buttons) {
  border-top-color: rgba(148, 163, 184, 0.12);
}

:global(html[data-theme='light'] .n-steps) {
  border: 1px solid rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .study-plan-create-container .n-step-header__title),
:global(html[data-theme='light'] .study-plan-create-container .n-step-header__description),
:global(html[data-theme='light'] .study-plan-create-container .n-form-item-label__text) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .n-step-indicator) {
  background: rgba(255, 255, 255, 0.98) !important;
  border-color: rgba(148, 163, 184, 0.2) !important;
}

:global(html[data-theme='light'] .n-step-indicator--current),
:global(html[data-theme='light'] .n-step-indicator--process),
:global(html[data-theme='light'] .n-step-indicator--finish) {
  box-shadow: 0 0 0 6px rgba(30, 107, 82, 0.08);
}

:global(html[data-theme='light'] .n-input-number),
:global(html[data-theme='light'] .n-input-number .n-input-wrapper),
:global(html[data-theme='light'] .n-alert) {
  background: rgba(255, 255, 255, 0.96) !important;
  border-color: rgba(148, 163, 184, 0.16) !important;
}

:global(html[data-theme='light'] .study-plan-create-container .n-radio) {
  color: var(--text-color);
}

@media (max-width: 768px) {
  .study-plan-create-container {
    padding: 18px max(12px, env(safe-area-inset-right)) calc(24px + env(safe-area-inset-bottom))
      max(12px, env(safe-area-inset-left));
    min-height: auto;
  }

  .header-section {
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 1.8rem;
    line-height: 1.12;
  }

  .page-caption {
    font-size: 0.95rem;
    line-height: 1.6;
  }

  :deep(.n-steps) {
    padding: 16px 12px;
  }

  /* 步骤条改为弹性等分，避免定宽把最后一步挤出视口 */
  :deep(.n-step) {
    flex: 1 1 0;
    min-width: 0;
  }

  :deep(.n-step-content) {
    flex: 1 1 auto;
    min-width: 0;
  }

  /* 层级写全才能压过 naive-ui 自带的 .n-steps .n-step … 选择器 */
  :deep(.n-steps .n-step .n-step-content .n-step-content-header) {
    min-width: 0;
    margin-left: 4px;
  }

  /* 标题保留 naive-ui 的 flex:0 + nowrap：flex 项的自动最小尺寸就是文字宽度，
     显式写 min-width:0 反而会让标题被压成 0 宽 */
  :deep(.n-step-content-header__title) {
    line-height: 1.35;
  }

  :deep(.n-step-splitor) {
    flex: 1 1 0;
    min-width: 0;
    margin-left: 2px;
    margin-right: 2px;
  }

  /* 文字按钮默认高度 30px，移动端抬到 36px 保证可点 */
  .header-section :deep(.n-button) {
    min-height: 36px;
  }

  .form-card {
    padding: 22px 18px;
    border-radius: var(--radius-lg);
  }

  .step-content {
    min-height: auto;
  }

  .exam-type-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .exam-card {
    padding: 18px 16px;
  }

  .confirm-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .action-buttons {
    flex-direction: column-reverse;
  }

  .action-buttons :deep(.n-button) {
    width: 100%;
    min-height: 46px;
  }
}

@media (max-width: 480px) {
  .study-plan-create-container {
    padding: 16px max(8px, env(safe-area-inset-right)) calc(24px + env(safe-area-inset-bottom))
      max(8px, env(safe-area-inset-left));
  }

  .form-card {
    padding: 18px 14px;
    border-radius: var(--radius-lg);
  }

  .page-title {
    font-size: 1.55rem;
  }

  :deep(.n-steps) {
    padding: 12px 10px;
    border-radius: var(--radius-lg);
  }

  :deep(.n-step) {
    flex: 1 1 0;
    min-width: 0;
  }

  /* 窄屏里 16px 的四字标题放不下时允许折行，保住标题字号与层级；
     层级写全才能压过 naive-ui 自己的 .n-steps .n-step ... 规则 */
  :deep(.n-steps .n-step .n-step-content .n-step-content-header) {
    margin-left: 2px;
  }

  :deep(.n-steps .n-step .n-step-content .n-step-content-header .n-step-content-header__title) {
    flex: 0 1 auto;
    min-width: 0;
    white-space: normal;
    overflow-wrap: anywhere;
    line-height: 1.25;
  }

  /* 手机宽度只保留步骤标题，隐藏描述避免挤压溢出 */
  :deep(.n-step-content__description) {
    display: none;
  }

  .exam-card {
    padding: 16px 14px;
  }

  .confirm-card {
    padding: 18px 14px;
  }

  .confirm-item {
    padding: 12px 0;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .study-plan-create-container {
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }

  .action-buttons {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .action-buttons :deep(.n-button) {
    flex: 1 1 220px;
  }
}
</style>
