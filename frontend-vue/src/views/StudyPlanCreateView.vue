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
        <h1 class="text-3xl font-bold text-white mb-2">创建学习计划</h1>
        <p class="text-gray-400">制定一个科学的学习计划，让备考更高效</p>
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
            <h3 class="text-xl font-bold text-white mb-6">选择考试类型</h3>
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
                  <p class="text-sm text-gray-400">{{ exam.description }}</p>
                </div>
              </div>
            </n-form-item>
          </div>

          <!-- 步骤 2: 设置目标 -->
          <div v-show="currentStep === 2" class="step-content">
            <h3 class="text-xl font-bold text-white mb-6">设置学习目标</h3>
            
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
            <h3 class="text-xl font-bold text-white mb-6">确认计划信息</h3>
            
            <div class="confirm-card">
              <div class="confirm-item">
                <span class="label">考试类型</span>
                <span class="value">{{ getExamLabel() }}</span>
              </div>
              <div class="confirm-item">
                <span class="label">目标分数</span>
                <span class="value">{{ formData.targetScore }} 分</span>
              </div>
              <div class="confirm-item">
                <span class="label">学习时长</span>
                <span class="value">{{ formData.durationDays }} 天</span>
              </div>
              <div class="confirm-item">
                <span class="label">预计完成日期</span>
                <span class="value">{{ getEndDate() }}</span>
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
          <n-button
            v-if="currentStep > 1"
            size="large"
            @click="prevStep"
          >
            上一步
          </n-button>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton, NSteps, NStep, NForm, NFormItem, NInputNumber,
  NRadioGroup, NRadio, NSpace, NAlert, useMessage
} from 'naive-ui'
import { ArrowLeft, BookOpen, GraduationCap, Globe, Award, Lightbulb } from 'lucide-vue-next'
import { studyPlanApi } from '@/api/studyPlan'

const router = useRouter()
const message = useMessage()
const formRef = ref(null)
const currentStep = ref(1)
const creating = ref(false)

// 表单数据
const formData = ref({
  examType: '',
  targetScore: 425,
  durationDays: 60
})

// 考试类型配置
const examTypes = [
  {
    value: 'cet4',
    label: '英语四级',
    description: '大学英语四级考试',
    icon: BookOpen,
    maxScore: 710
  },
  {
    value: 'cet6',
    label: '英语六级',
    description: '大学英语六级考试',
    icon: GraduationCap,
    maxScore: 710
  },
  {
    value: 'ielts',
    label: '雅思',
    description: 'IELTS 国际英语测试',
    icon: Globe,
    maxScore: 9
  },
  {
    value: 'toefl',
    label: '托福',
    description: 'TOEFL 托福考试',
    icon: Award,
    maxScore: 120
  }
]

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
  padding: 24px;
  min-height: 100vh;
}

.form-card {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 32px;
}

.step-content {
  min-height: 400px;
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
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.exam-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(139, 92, 246, 0.5);
  transform: translateY(-4px);
}

.exam-card.active {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}

.exam-card h4 {
  color: white;
}

.confirm-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
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
  color: #9ca3af;
  font-size: 14px;
}

.confirm-item .value {
  color: white;
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
  border-radius: 16px;
}
</style>
