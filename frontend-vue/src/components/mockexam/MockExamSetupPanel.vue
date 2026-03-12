<script setup>
import { NCard, NGrid, NGridItem, NIcon, NDivider, NButton, NTag, NPagination } from 'naive-ui'
import { Timer, Rocket, GraduationCap, Brain, History, Target, ShieldCheck, Clock } from 'lucide-vue-next'

defineProps({
  settings: {
    type: Object,
    required: true
  },
  examTypes: {
    type: Array,
    required: true
  },
  difficulties: {
    type: Array,
    required: true
  },
  generating: {
    type: Boolean,
    default: false
  },
  exams: {
    type: Array,
    required: true
  },
  paginatedExams: {
    type: Array,
    required: true
  },
  currentPage: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    required: true
  }
})

defineEmits(['update-setting', 'generate', 'start-exam', 'update:page', 'update:page-size'])
</script>

<template>
  <div class="setup-view">
    <div class="page-header">
      <h1>全真模拟考试</h1>
      <p>由 AI 驱动的高保真考场模拟，全方位检测学习成效</p>
    </div>

    <n-card class="setup-card" :bordered="false">
      <n-grid x-gap="40" y-gap="40" cols="1 900:3" responsive="screen">
        <n-grid-item span="2">
          <div class="setting-section">
            <h3><n-icon :component="GraduationCap" color="#6366f1" /> 选择考试项目</h3>
            <div class="pill-options">
              <div
                v-for="type in examTypes"
                :key="type.value"
                class="pill-option"
                :class="{ active: settings.examType === type.value }"
                @click="$emit('update-setting', 'examType', type.value)"
              >
                <span class="pill-icon-tag" :style="{ color: type.color }">{{ type.icon }}</span>
                {{ type.label }}
              </div>
            </div>
          </div>

          <div class="setting-section mt-8">
            <h3><n-icon :component="ShieldCheck" color="#10b981" /> 考场纪律说明</h3>
            <div class="rules-box">
              <div class="rule-item">模拟考试开启后将进入全屏/沉浸模式。</div>
              <div class="rule-item">中途离开页面或刷新将导致考试强制结束并不计分。</div>
              <div class="rule-item">AI 根据您的水平动态出题（含短篇阅读）。</div>
              <div class="rule-item" style="color: #fbbf24;">注：听力与口语考试请前往对应的专项训练模块。</div>
            </div>
          </div>
        </n-grid-item>

        <n-grid-item>
          <div class="side-panel">
            <div class="setting-section">
              <h3><n-icon :component="Brain" color="#f59e0b" /> 难度选择</h3>
              <div class="pill-options">
                <div
                  v-for="d in difficulties"
                  :key="d.value"
                  class="pill-option"
                  :class="{ active: settings.difficulty === d.value }"
                  @click="$emit('update-setting', 'difficulty', d.value)"
                >
                  {{ d.icon }} {{ d.label }}
                </div>
              </div>
            </div>

            <div class="setting-section mt-8">
              <h3><n-icon :component="Clock" color="#ef4444" /> 时间设定</h3>
              <div class="duration-selector">
                <div class="val">120 分钟</div>
                <p class="desc">标准考试时长，请确保有充足时间。</p>
              </div>
            </div>

            <n-divider />

            <n-button
              type="primary"
              size="large"
              block
              round
              class="start-btn"
              :loading="generating"
              @click="$emit('generate')"
            >
              <template #icon><Rocket :size="20" /></template>
              进入模拟考场
            </n-button>
          </div>
        </n-grid-item>
      </n-grid>
    </n-card>

    <div v-if="exams.length > 0" class="history-section mt-12">
      <div class="section-title">
        <n-icon :component="History" /> 最近生成考卷
      </div>
      <n-grid x-gap="20" y-gap="20" cols="1 600:2 1200:3">
        <n-grid-item v-for="exam in paginatedExams" :key="exam.id">
          <n-card class="history-card" hoverable @click="$emit('start-exam', exam)">
            <div class="h-card-header">
              <n-tag size="small" :bordered="false" round :color="{ color: '#6366f1', textColor: '#fff' }">
                {{ exam.examType?.toUpperCase() }}
              </n-tag>
              <span class="exam-date">{{ new Date().toLocaleDateString() }}</span>
            </div>
            <h4 class="exam-title">{{ exam.title }}</h4>
            <div class="h-card-footer">
              <span><Timer :size="14" /> {{ exam.duration }}m</span>
              <span><Target :size="14" /> {{ exam.totalQuestions }} 题</span>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>
      <div v-if="exams.length > pageSize" class="pagination-wrapper mt-6">
        <n-pagination
          :page="currentPage"
          :page-count="Math.ceil(exams.length / pageSize)"
          :page-size="pageSize"
          show-size-picker
          :page-sizes="[6, 12, 18, 24]"
          @update:page="$emit('update:page', $event)"
          @update:page-size="$emit('update:page-size', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 48px;
}

.page-header h1 {
  font-size: 2.8rem;
  font-weight: 800;
  background: linear-gradient(120deg, #6366f1, #d946ef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
}

.page-header p {
  color: #a1a1aa;
  font-size: 1.1rem;
}

.setup-card {
  background: rgba(30, 30, 35, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 12px;
}

.setting-section h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.15rem;
  color: #e4e4e7;
  margin-bottom: 20px;
}

.rules-box {
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: 16px;
}

.rule-item {
  color: #a1a1aa;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rule-item::before {
  content: "•";
  color: #10b981;
  font-size: 1.5rem;
}

.side-panel {
  background: rgba(255, 255, 255, 0.02);
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.pill-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.pill-option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  cursor: pointer;
  color: #a1a1aa;
  font-size: 0.9rem;
  transition: all 0.2s;
  gap: 8px;
}

.pill-option.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.pill-icon-tag {
  font-weight: 900;
  font-size: 1.1rem;
  opacity: 0.8;
  background: rgba(0,0,0,0.2);
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pill-option.active .pill-icon-tag {
  background: rgba(255,255,255,0.2);
  color: #fff !important;
}

.duration-selector {
  background: rgba(255,255,255,0.03);
  padding: 16px;
  border-radius: 12px;
}

.duration-selector .val {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
}

.duration-selector .desc {
  font-size: 0.8rem;
  color: #71717a;
  margin-top: 4px;
}

.start-btn {
  height: 60px;
  font-weight: 800;
  font-size: 1.1rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
}

.history-card {
  background: rgba(30, 30, 35, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  transition: all 0.2s;
  cursor: pointer;
}

.history-card:hover {
  border-color: #6366f1;
  background: rgba(50, 50, 55, 0.8);
}

.h-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.exam-date {
  font-size: 0.75rem;
  color: #71717a;
}

.exam-title {
  font-size: 1.1rem;
  color: #fff;
  margin-bottom: 16px;
}

.h-card-footer {
  display: flex;
  gap: 16px;
  color: #a1a1aa;
  font-size: 0.85rem;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .pill-options {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .start-btn {
    height: 50px;
    font-size: 1rem;
  }
}
</style>
