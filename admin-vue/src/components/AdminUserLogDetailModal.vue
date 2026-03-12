<script setup>
import { NDescriptions, NDescriptionsItem, NModal, NTag, NText } from 'naive-ui'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  log: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:show'])
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="日志详情"
    style="width: 800px;"
    :bordered="false"
    @update:show="emit('update:show', $event)"
  >
    <n-descriptions v-if="log" :column="2" bordered>
      <n-descriptions-item label="用户ID">{{ log.userId }}</n-descriptions-item>
      <n-descriptions-item label="用户名">{{ log.username || '-' }}</n-descriptions-item>
      <n-descriptions-item label="操作模块">
        <n-tag type="info">{{ log.module || '-' }}</n-tag>
      </n-descriptions-item>
      <n-descriptions-item label="操作类型">
        <n-tag type="success">{{ log.action || '-' }}</n-tag>
      </n-descriptions-item>
      <n-descriptions-item label="操作详情" :span="2">
        {{ log.details || '-' }}
      </n-descriptions-item>
      <n-descriptions-item label="IP地址">
        <n-text code>{{ log.ip || '-' }}</n-text>
      </n-descriptions-item>
      <n-descriptions-item label="地理位置">
        {{ log.ipProvince || '-' }} {{ log.ipCity || '-' }}
      </n-descriptions-item>
      <n-descriptions-item label="浏览器">{{ log.browser || '-' }}</n-descriptions-item>
      <n-descriptions-item label="操作系统">{{ log.os || '-' }}</n-descriptions-item>
      <n-descriptions-item label="设备类型">
        <n-tag v-if="log.deviceType === 'Mobile'" type="warning">移动端</n-tag>
        <n-tag v-else-if="log.deviceType === 'Tablet'" type="info">平板</n-tag>
        <n-tag v-else type="default">桌面端</n-tag>
      </n-descriptions-item>
      <n-descriptions-item label="状态">
        <n-tag v-if="log.status === 1" type="success">成功</n-tag>
        <n-tag v-else type="error">失败</n-tag>
      </n-descriptions-item>
      <n-descriptions-item label="请求URL" :span="2">
        <n-text code>{{ log.requestUrl || '-' }}</n-text>
      </n-descriptions-item>
      <n-descriptions-item label="请求方法">{{ log.requestMethod || '-' }}</n-descriptions-item>
      <n-descriptions-item label="操作时间">
        {{ log.createTime ? new Date(log.createTime).toLocaleString('zh-CN') : '-' }}
      </n-descriptions-item>
      <n-descriptions-item v-if="log.errorMsg" label="错误信息" :span="2">
        <n-text type="error">{{ log.errorMsg }}</n-text>
      </n-descriptions-item>
    </n-descriptions>
  </n-modal>
</template>
