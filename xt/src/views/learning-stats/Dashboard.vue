<template>
  <div class="learning-dashboard">
    <el-page-header title="管理后台" content="学习数据大屏" />
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card blue">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="40"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.studyPlans?.total || 0 }}</div>
              <div class="stat-label">总学习计划</div>
              <div class="stat-sub">
                进行中: {{ stats.studyPlans?.inProgress || 0 }}
              </div>
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
              <div class="stat-label">今日完成任务</div>
              <div class="stat-sub">
                总任务: {{ stats.dailyTasks?.todayTotal || 0 }}
              </div>
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
              <div class="stat-label">已掌握词汇</div>
              <div class="stat-sub">
                总记录: {{ stats.vocabularyMastery?.totalRecords || 0 }}
              </div>
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
              <div class="stat-label">今日学习记录</div>
              <div class="stat-sub">
                总记录: {{ formatNumber(stats.learningRecords?.total || 0) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>学习趋势</span>
              <el-button text @click="refreshCharts">刷新</el-button>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>任务完成率</span>
              <el-tag type="success">{{ completionRate }}%</el-tag>
            </div>
          </template>
          <div ref="completionChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活��用户 -->
    <el-row :gutter="20" class="users-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近活跃用户</span>
              <el-button type="primary" size="small" @click="viewAllUsers">
                查看全部
              </el-button>
            </div>
          </template>
          
          <el-table :data="activeUsers" stripe style="width: 100%">
            <el-table-column prop="userId" label="用户ID" width="100" />
            <el-table-column prop="username" label="用户名" width="150" />
            <el-table-column prop="tasksCompleted" label="完成任务" width="120">
              <template #default="{ row }">
                <el-tag type="success">{{ row.tasksCompleted }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="masteredWords" label="掌握词汇" width="120">
              <template #default="{ row }">
                <el-tag type="warning">{{ row.masteredWords }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="studyTime" label="学习时长" width="150" />
            <el-table-column prop="lastActive" label="最后活跃" width="180" />
            <el-table-column label="操作" fixed="right" width="150">
              <template #default="{ row }">
                <el-button text type="primary" @click="viewUserDetail(row.userId)">
                  查看详情
                </el-button>
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

// 数据
const stats = ref({})
const activeUsers = ref([])
const trendChartRef = ref(null)
const completionChartRef = ref(null)
let trendChart = null
let completionChart = null

// 计算完成率
const completionRate = computed(() => {
  const { todayTotal, todayCompleted } = stats.value.dailyTasks || {}
  if (!todayTotal) return 0
  return Math.round((todayCompleted / todayTotal) * 100)
})

// 加载数据
onMounted(async () => {
  await loadDashboardData()
  initCharts()
  loadActiveUsers()
})

// 加载大屏数据
const loadDashboardData = async () => {
  try {
    const res = await axios.get('/api/admin/learning-stats/dashboard')
    stats.value = res.data.data
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    ElMessage.error('加载数据失败')
  }
}

// 初始化图表
const initCharts = () => {
  // 趋势图
  trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['学习计划', '完成任务', '掌握词汇']
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '学习计划',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210],
        smooth: true,
        itemStyle: { color: '#409eff' }
      },
      {
        name: '完成任务',
        type: 'line',
        data: [220, 182, 191, 234, 290, 330, 310],
        smooth: true,
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '掌握词汇',
        type: 'line',
        data: [150, 232, 201, 154, 190, 330, 410],
        smooth: true,
        itemStyle: { color: '#e6a23c' }
      }
    ]
  })
  
  // 完成率饼图
  completionChart = echarts.init(completionChartRef.value)
  completionChart.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '任务完成情况',
        type: 'pie',
        radius: '50%',
        data: [
          { value: stats.value.dailyTasks?.todayCompleted || 0, name: '已完成', itemStyle: { color: '#67c23a' } },
          { value: (stats.value.dailyTasks?.todayTotal || 0) - (stats.value.dailyTasks?.todayCompleted || 0), name: '未完成', itemStyle: { color: '#e6a23c' } }
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

// 加载活跃用户（模拟数据）
const loadActiveUsers = () => {
  activeUsers.value = [
    { userId: 1, username: '张三', tasksCompleted: 12, masteredWords: 256, studyTime: '2小时30分', lastActive: '10分钟前' },
    { userId: 2, username: '李四', tasksCompleted: 8, masteredWords: 189, studyTime: '1小时45分', lastActive: '25分钟前' },
    { userId: 3, username: '王五', tasksCompleted: 15, masteredWords: 312, studyTime: '3小时15分', lastActive: '5分钟前' },
    { userId: 4, username: '赵六', tasksCompleted: 6, masteredWords: 145, studyTime: '1小时10分', lastActive: '1小时前' },
    { userId: 5, username: '孙七', tasksCompleted: 10, masteredWords: 220, studyTime: '2小时05分', lastActive: '30分钟前' }
  ]
}

// 刷新图表
const refreshCharts = () => {
  loadDashboardData()
  trendChart?.resize()
  completionChart?.resize()
  ElMessage.success('数据已刷新')
}

// 查看用户详情
const viewUserDetail = (userId) => {
  router.push(`/learning-stats/user/${userId}`)
}

// 查看所有用户
const viewAllUsers = () => {
  router.push('/learning-stats/users')
}

// 格式化数字
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
