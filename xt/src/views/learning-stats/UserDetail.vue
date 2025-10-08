<template>
  <div class="user-learning-detail">
    <el-page-header @back="goBack" title="返回" :content="`用户学习详情 - ID: ${userId}`" />
    
    <el-row :gutter="20" class="mt-4">
      <!-- 左侧：用户信息和学习计划 -->
      <el-col :span="16">
        <!-- 当前学习计划 -->
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>当前学习计划</span>
              <el-tag v-if="detail.currentPlan" :type="getPlanStatusType(detail.currentPlan.status)">
                {{ getPlanStatusText(detail.currentPlan.status) }}
              </el-tag>
            </div>
          </template>
          
          <div v-if="detail.currentPlan" class="plan-info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="考试类型">
                <el-tag>{{ formatExamType(detail.currentPlan.examType) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="目标分数">
                {{ detail.currentPlan.targetScore }}
              </el-descriptions-item>
              <el-descriptions-item label="开始日期">
                {{ formatDate(detail.currentPlan.startDate) }}
              </el-descriptions-item>
              <el-descriptions-item label="结束日期">
                {{ formatDate(detail.currentPlan.endDate) }}
              </el-descriptions-item>
              <el-descriptions-item label="计划天数">
                {{ detail.currentPlan.durationDays }} 天
              </el-descriptions-item>
              <el-descriptions-item label="完成进度">
                <el-progress :percentage="detail.currentPlan.progress" />
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <el-empty v-else description="暂无学习计划" />
        </el-card>

        <!-- 今日任务 -->
        <el-card shadow="hover" class="mt-4">
          <template #header>
            <div class="card-header">
              <span>今日任务</span>
              <el-tag type="success">{{ completedTasks }} / {{ totalTasks }}</el-tag>
            </div>
          </template>
          
          <el-table :data="detail.todayTasks" stripe>
            <el-table-column prop="taskName" label="任务名称" />
            <el-table-column prop="taskType" label="类型" width="120">
              <template #default="{ row }">
                <el-tag>{{ formatTaskType(row.taskType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="进度" width="200">
              <template #default="{ row }">
                <el-progress 
                  :percentage="calculateProgress(row.completedCount, row.targetCount)" 
                  :status="row.isCompleted ? 'success' : ''"
                />
              </template>
            </el-table-column>
            <el-table-column prop="isCompleted" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.isCompleted ? 'success' : 'warning'">
                  {{ row.isCompleted ? '已完成' : '未完成' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 最近学习记录 -->
        <el-card shadow="hover" class="mt-4">
          <template #header>
            <span>最近学习记录</span>
          </template>
          
          <el-timeline>
            <el-timeline-item 
              v-for="record in detail.recentRecords" 
              :key="record.id"
              :timestamp="formatDateTime(record.createTime)"
              placement="top"
            >
              <el-card>
                <h4>{{ formatContentType(record.contentType) }}</h4>
                <p class="record-detail">
                  {{ record.isCorrect ? '✅ 答对' : '❌ 答错' }} - {{ record.correctAnswer }}
                </p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <!-- 右侧：统计数据 -->
      <el-col :span="8">
        <!-- 词汇掌握统计 -->
        <el-card shadow="hover">
          <template #header>
            <span>词汇掌握统计</span>
          </template>
          
          <div v-if="detail.masteryStats" class="mastery-stats">
            <div ref="masteryChartRef" style="height: 300px;"></div>
            
            <el-divider />
            
            <div class="stat-item">
              <span class="label">完全掌握</span>
              <span class="value green">{{ detail.masteryStats.mastered || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="label">熟悉中</span>
              <span class="value blue">{{ detail.masteryStats.familiar || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="label">学习中</span>
              <span class="value orange">{{ detail.masteryStats.learning || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="label">未学习</span>
              <span class="value gray">{{ detail.masteryStats.not_started || 0 }}</span>
            </div>
          </div>
        </el-card>

        <!-- 学习建议 -->
        <el-card shadow="hover" class="mt-4">
          <template #header>
            <span>AI学习建议</span>
          </template>
          
          <el-alert
            title="学习状态良好"
            type="success"
            description="继续保持当前学习节奏，建议加强听力训练。"
            :closable="false"
            show-icon
          />
          
          <el-alert
            class="mt-3"
            title="复习提醒"
            type="warning"
            description="有50个单词需要复习，建议今天完成。"
            :closable="false"
            show-icon
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const userId = ref(route.params.id)
const detail = ref({
  currentPlan: null,
  todayTasks: [],
  masteryStats: null,
  recentRecords: []
})

const masteryChartRef = ref(null)
let masteryChart = null

// 计算今日任务统计
const totalTasks = computed(() => detail.value.todayTasks?.length || 0)
const completedTasks = computed(() => 
  detail.value.todayTasks?.filter(t => t.isCompleted).length || 0
)

onMounted(async () => {
  await loadUserDetail()
  initMasteryChart()
})

// 加载用户详情
const loadUserDetail = async () => {
  try {
    const res = await axios.get(`/api/admin/learning-stats/user/${userId.value}`)
    detail.value = res.data.data
  } catch (error) {
    console.error('Failed to load user detail:', error)
    ElMessage.error('加载用户详情失败')
  }
}

// 初始化掌握度图表
const initMasteryChart = () => {
  masteryChart = echarts.init(masteryChartRef.value)
  const stats = detail.value.masteryStats || {}
  
  masteryChart.setOption({
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: '词汇掌握度',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        data: [
          { value: stats.mastered || 0, name: '完全掌握', itemStyle: { color: '#67c23a' } },
          { value: stats.familiar || 0, name: '熟悉中', itemStyle: { color: '#409eff' } },
          { value: stats.learning || 0, name: '学习中', itemStyle: { color: '#e6a23c' } },
          { value: stats.not_started || 0, name: '未学习', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  })
}

// 工具函数
const goBack = () => router.back()

const formatExamType = (type) => {
  const types = {
    'cet4': 'CET-4',
    'cet6': 'CET-6',
    'ielts': 'IELTS',
    'toefl': 'TOEFL',
    'gre': 'GRE'
  }
  return types[type] || type
}

const formatTaskType = (type) => {
  const types = {
    'vocabulary': '词汇',
    'reading': '阅读',
    'listening': '听力',
    'grammar': '语法',
    'writing': '写作',
    'speaking': '口语'
  }
  return types[type] || type
}

const formatContentType = (type) => {
  const types = {
    'vocabulary': '词汇练习',
    'reading': '阅读理解',
    'listening': '听力训练',
    'grammar': '语法练习',
    'writing': '写作练习',
    'speaking': '口语练习'
  }
  return types[type] || type
}

const getPlanStatusType = (status) => {
  return status === 0 ? 'success' : status === 1 ? 'primary' : 'info'
}

const getPlanStatusText = (status) => {
  return status === 0 ? '已完成' : status === 1 ? '进行中' : '已放弃'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (datetime) => {
  if (!datetime) return '-'
  return new Date(datetime).toLocaleString('zh-CN')
}

const calculateProgress = (completed, target) => {
  if (!target) return 0
  return Math.round((completed / target) * 100)
}
</script>

<style scoped>
.user-learning-detail {
  padding: 20px;
}

.mt-4 {
  margin-top: 20px;
}

.mt-3 {
  margin-top: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-info {
  padding: 10px 0;
}

.mastery-stats {
  padding: 10px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin: 8px 0;
  background: #f5f7fa;
  border-radius: 4px;
}

.stat-item .label {
  font-size: 14px;
  color: #606266;
}

.stat-item .value {
  font-size: 18px;
  font-weight: bold;
}

.value.green { color: #67c23a; }
.value.blue { color: #409eff; }
.value.orange { color: #e6a23c; }
.value.gray { color: #909399; }

.record-detail {
  color: #909399;
  font-size: 13px;
  margin: 5px 0 0 0;
}
</style>
