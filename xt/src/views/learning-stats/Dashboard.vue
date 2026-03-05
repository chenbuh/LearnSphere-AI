<template>
  <div class="learning-dashboard">
    <el-page-header
      title="Learning Analytics Dashboard"
      content="Track study plans, daily tasks, vocabulary mastery, and active users."
    />

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card blue">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.studyPlans?.total || 0 }}</div>
              <div class="stat-label">Study Plans</div>
              <div class="stat-sub">In Progress: {{ stats.studyPlans?.inProgress || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card green">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><Check /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.dailyTasks?.todayCompleted || 0 }}</div>
              <div class="stat-label">Today Tasks</div>
              <div class="stat-sub">Total Today: {{ stats.dailyTasks?.todayTotal || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card orange">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><Reading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.vocabularyMastery?.masteredWords || 0 }}</div>
              <div class="stat-label">Mastered Words</div>
              <div class="stat-sub">Total Records: {{ stats.vocabularyMastery?.totalRecords || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card purple">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><DataLine /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.learningRecords?.today || 0 }}</div>
              <div class="stat-label">Learning Records</div>
              <div class="stat-sub">Total: {{ formatNumber(stats.learningRecords?.total || 0) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>Weekly Learning Trend</span>
              <el-button text @click="refreshCharts">Refresh</el-button>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>Task Completion Rate</span>
              <el-tag type="success">{{ completionRate }}%</el-tag>
            </div>
          </template>
          <div ref="completionChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="users-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>Active Users</span>
              <el-button type="primary" size="small" @click="viewAllUsers">View All Users</el-button>
            </div>
          </template>

          <el-table :data="activeUsers" stripe style="width: 100%">
            <el-table-column prop="userId" label="User ID" width="100" />
            <el-table-column prop="username" label="Username" width="150" />
            <el-table-column prop="tasksCompleted" label="Tasks Completed" width="120">
              <template #default="{ row }">
                <el-tag type="success">{{ row.tasksCompleted }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="masteredWords" label="Mastered Words" width="120">
              <template #default="{ row }">
                <el-tag type="warning">{{ row.masteredWords }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="studyTime" label="Study Time" width="150" />
            <el-table-column prop="lastActive" label="Last Active" width="180" />
            <el-table-column label="Actions" fixed="right" width="150">
              <template #default="{ row }">
                <el-button text type="primary" @click="viewUserDetail(row.userId)">View Detail</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, Check, Reading, DataLine } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import axios from 'axios'

const router = useRouter()

const stats = ref({})
const activeUsers = ref([])
const trendChartRef = ref(null)
const completionChartRef = ref(null)
let trendChart = null
let completionChart = null

const completionRate = computed(() => {
  const { todayTotal, todayCompleted } = stats.value.dailyTasks || {}
  if (!todayTotal) return 0
  return Math.round((todayCompleted / todayTotal) * 100)
})

onMounted(async () => {
  await loadDashboardData()
  initCharts()
  loadActiveUsers()
})

const loadDashboardData = async () => {
  try {
    const res = await axios.get('/api/admin/learning-stats/dashboard')
    stats.value = res.data.data
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    ElMessage.error('Failed to load dashboard data')
  }
}

const initCharts = () => {
  trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Study Time', 'Words Mastered', 'Tasks Completed'] },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Study Time',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210],
        smooth: true,
        itemStyle: { color: '#409eff' }
      },
      {
        name: 'Words Mastered',
        type: 'line',
        data: [220, 182, 191, 234, 290, 330, 310],
        smooth: true,
        itemStyle: { color: '#67c23a' }
      },
      {
        name: 'Tasks Completed',
        type: 'line',
        data: [150, 232, 201, 154, 190, 330, 410],
        smooth: true,
        itemStyle: { color: '#e6a23c' }
      }
    ]
  })

  completionChart = echarts.init(completionChartRef.value)
  completionChart.setOption({
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'Task Completion',
        type: 'pie',
        radius: '50%',
        data: [
          { value: stats.value.dailyTasks?.todayCompleted || 0, name: 'Completed', itemStyle: { color: '#67c23a' } },
          { value: Math.max((stats.value.dailyTasks?.todayTotal || 0) - (stats.value.dailyTasks?.todayCompleted || 0), 0), name: 'Remaining', itemStyle: { color: '#f56c6c' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })
}

const loadActiveUsers = () => {
  activeUsers.value = [
    { userId: 1, username: 'UserA', tasksCompleted: 12, masteredWords: 256, studyTime: '2h30m', lastActive: '10m ago' },
    { userId: 2, username: 'UserB', tasksCompleted: 8, masteredWords: 189, studyTime: '1h45m', lastActive: '25m ago' },
    { userId: 3, username: 'UserC', tasksCompleted: 15, masteredWords: 312, studyTime: '3h15m', lastActive: '5m ago' },
    { userId: 4, username: 'UserD', tasksCompleted: 6, masteredWords: 145, studyTime: '1h10m', lastActive: '1h ago' },
    { userId: 5, username: 'UserE', tasksCompleted: 10, masteredWords: 220, studyTime: '2h05m', lastActive: '30m ago' }
  ]
}

const refreshCharts = () => {
  loadDashboardData()
  trendChart?.resize()
  completionChart?.resize()
  ElMessage.success('Data refreshed')
}

const viewUserDetail = (userId) => {
  router.push(`/learning-stats/user/${userId}`)
}

const viewAllUsers = () => {
  router.push('/learning-stats/users')
}

const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num
}
</script>

<style scoped>
.learning-dashboard {
  padding: 20px;
}

.stats-row {
  margin: 20px 0;
}

.stat-card {
  border-radius: 8px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card.blue { border-left: 4px solid #409eff; }
.stat-card.green { border-left: 4px solid #67c23a; }
.stat-card.orange { border-left: 4px solid #e6a23c; }
.stat-card.purple { border-left: 4px solid #9c27b0; }

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.blue .stat-icon { background: rgba(64, 158, 255, 0.1); color: #409eff; }
.green .stat-icon { background: rgba(103, 194, 58, 0.1); color: #67c23a; }
.orange .stat-icon { background: rgba(230, 162, 60, 0.1); color: #e6a23c; }
.purple .stat-icon { background: rgba(156, 39, 176, 0.1); color: #9c27b0; }

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-sub {
  font-size: 12px;
  color: #c0c4cc;
}

.charts-row {
  margin: 20px 0;
}

.users-row {
  margin: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>