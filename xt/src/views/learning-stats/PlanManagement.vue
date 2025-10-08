<template>
  <div class="plan-management">
    <el-page-header title="管理后台" content="学习计划管理" />
    
    <!-- 筛选工具栏 -->
    <el-card shadow="never" class="filter-card mt-4">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="考试类型">
          <el-select v-model="queryParams.examType" placeholder="全部类型" clearable>
            <el-option label="CET-4" value="cet4" />
            <el-option label="CET-6" value="cet6" />
            <el-option label="IELTS" value="ielts" />
            <el-option label="TOEFL" value="toefl" />
            <el-option label="GRE" value="gre" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable>
            <el-option label="进行中" :value="1" />
            <el-option label="已完成" :value="0" />
            <el-option label="已放弃" :value="2" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="hover" class="mt-4">
      <el-table 
        v-loading="loading" 
        :data="planList" 
        stripe 
        style="width: 100%"
      >
        <el-table-column prop="id" label="计划ID" width="80" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="examType" label="考试类型" width="100">
          <template #default="{ row }">
            <el-tag effect="plain">{{ formatExamType(row.examType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetScore" label="目标分数" width="100" />
        <el-table-column prop="durationDays" label="周期(天)" width="100" />
        <el-table-column prop="progress" label="进度" width="200">
          <template #default="{ row }">
            <el-progress :percentage="row.progress || 0" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getPlanStatusType(row.status)">
              {{ getPlanStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
             <el-button link type="primary" @click="viewUserDetail(row.userId)">
              查看用户
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)
const planList = ref([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  pageSize: 20,
  examType: '',
  status: null
})

// 加载数据
onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/admin/learning-stats/plans', { 
      params: queryParams 
    })
    const data = res.data.data
    planList.value = data.records
    total.value = data.total
  } catch (error) {
    console.error('Failed to load plans:', error)
    ElMessage.error('加载计划列表失败')
  } finally {
    loading.value = false
  }
}

// 查询操作
const handleQuery = () => {
  queryParams.page = 1
  loadData()
}

const resetQuery = () => {
  queryParams.examType = ''
  queryParams.status = null
  handleQuery()
}

// 分页操作
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  loadData()
}

const handleCurrentChange = (val) => {
  queryParams.page = val
  loadData()
}

// 查看详情
const viewUserDetail = (userId) => {
  router.push(`/learning-stats/user/${userId}`)
}

// 工具函数
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

const getPlanStatusType = (status) => {
  return status === 0 ? 'success' : status === 1 ? 'primary' : 'info'
}

const getPlanStatusText = (status) => {
  return status === 0 ? '已完成' : status === 1 ? '进行中' : '已放弃'
}

const formatDateTime = (datetime) => {
  if (!datetime) return '-'
  return new Date(datetime).toLocaleString('zh-CN')
}
</script>

<style scoped>
.plan-management {
  padding: 20px;
}

.mt-4 {
  margin-top: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
