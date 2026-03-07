<script setup>
import { computed, ref } from 'vue'
import {
  NButton,
  NCard,
  NEmpty,
  NInput,
  NModal,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
  useMessage
} from 'naive-ui'
import { adminApi } from '@/api/admin'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['update:show', 'applied'])

const message = useMessage()
const loading = ref(false)
const filterConditions = ref([])
const filterLogic = ref('AND')

const filterFieldOptions = [
  { label: '最后登录时间', value: 'lastLoginTime' },
  { label: '积分', value: 'points' },
  { label: 'VIP状态', value: 'vipStatus' },
  { label: '学习记录数', value: 'learningCount' },
  { label: 'AI使用次数', value: 'aiUsageCount' }
]

const filterOperatorOptions = [
  { label: '等于', value: 'equals' },
  { label: '不等于', value: 'notEquals' },
  { label: '大于', value: 'greaterThan' },
  { label: '小于', value: 'lessThan' }
]

const modalVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const addFilterCondition = () => {
  filterConditions.value.push({
    field: 'lastLoginTime',
    operator: 'lessThan',
    value: '30days'
  })
}

const removeFilterCondition = (index) => {
  filterConditions.value.splice(index, 1)
}

const applyFilter = async () => {
  if (filterConditions.value.length === 0) {
    message.warning('请至少添加一个筛选条件')
    return
  }

  loading.value = true

  try {
    const criteria = {
      conditions: filterConditions.value,
      logic: filterLogic.value
    }
    const res = await adminApi.filterUsers(criteria, props.page, props.pageSize)
    emit('applied', {
      records: res.data.records,
      total: res.data.total,
      criteria
    })
    message.success('筛选成功')
    modalVisible.value = false
  } catch (error) {
    message.error('筛选失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <n-modal v-model:show="modalVisible" preset="card" title="高级筛选" style="width: 700px">
    <div style="margin-bottom: 16px">
      <n-space align="center" justify="space-between">
        <n-radio-group v-model:value="filterLogic">
          <n-radio value="AND">满足所有条件(AND)</n-radio>
          <n-radio value="OR">满足任一条件(OR)</n-radio>
        </n-radio-group>
        <n-button secondary type="primary" @click="addFilterCondition">
          + 添加条件
        </n-button>
      </n-space>
    </div>

    <n-space vertical style="width: 100%">
      <n-card
        v-for="(condition, index) in filterConditions"
        :key="index"
        size="small"
        :bordered="false"
        embedded
      >
        <n-space align="center">
          <n-select
            v-model:value="condition.field"
            :options="filterFieldOptions"
            style="width: 150px"
            placeholder="选择字段"
          />
          <n-select
            v-model:value="condition.operator"
            :options="filterOperatorOptions"
            style="width: 120px"
            placeholder="操作符"
          />
          <n-input
            v-model:value="condition.value"
            placeholder="值(如30days)"
            style="flex: 1"
          />
          <n-button text type="error" @click="removeFilterCondition(index)">
            删除
          </n-button>
        </n-space>
      </n-card>

      <n-empty v-if="filterConditions.length === 0" description="暂无筛选条件" />
    </n-space>

    <template #footer>
      <n-space justify="end">
        <n-button @click="modalVisible = false">取消</n-button>
        <n-button type="primary" :loading="loading" @click="applyFilter">应用筛选</n-button>
      </n-space>
    </template>
  </n-modal>
</template>