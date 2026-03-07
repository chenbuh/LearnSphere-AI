<script setup>
import { computed } from 'vue'
import {
  NDivider,
  NGrid,
  NGridItem,
  NModal,
  NScrollbar,
  NSpace,
  NTag
} from 'naive-ui'

const props = defineProps({
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

const modalVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}
</script>

<template>
  <n-modal v-model:show="modalVisible" preset="card" title="AI 生成全量数据审计" style="width: 1000px">
    <div v-if="log" class="log-audit-detail">
      <n-grid :cols="24" :x-gap="24">
        <n-grid-item :span="16">
          <div class="audit-section">
            <h3 class="audit-title">Prompt 详情</h3>

            <div class="mb-4">
              <p class="text-xs text-zinc-500 mb-1">System Prompt (系统提示词)</p>
              <div class="code-box bg-indigo-500/5 border border-indigo-500/20">
                <pre class="whitespace-pre-wrap text-sm text-indigo-200">{{ log.systemPrompt || '未记录系统提示词' }}</pre>
              </div>
            </div>

            <div>
              <p class="text-xs text-zinc-500 mb-1">User Prompt (用户输入/环境上下文)</p>
              <div class="code-box bg-blue-500/5 border border-blue-500/20">
                <pre class="whitespace-pre-wrap text-sm text-blue-200">{{ log.promptPreview }}</pre>
              </div>
            </div>
          </div>

          <div class="audit-section mt-6">
            <h3 class="audit-title">AI 生成响应</h3>
            <div class="code-box bg-emerald-500/5 border border-emerald-500/20 result-box">
              <n-scrollbar style="max-height: 400px">
                <pre class="whitespace-pre-wrap text-sm text-emerald-200 p-2">{{ log.responseContent || '暂无响应内容' }}</pre>
              </n-scrollbar>
            </div>
          </div>
        </n-grid-item>

        <n-grid-item :span="8">
          <div class="audit-section">
            <h3 class="audit-title">运行元数据</h3>
            <n-space vertical size="large">
              <div class="meta-item">
                <span class="label">动作类型</span>
                <n-tag type="info" size="small">{{ log.actionType }}</n-tag>
              </div>
              <div class="meta-item">
                <span class="label">模型名称</span>
                <span class="value font-mono">{{ log.modelName }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Token 消耗统计</span>
                <div class="token-stats bg-zinc-900 p-3 rounded-lg border border-zinc-800 mt-2">
                  <div class="flex justify-between mb-1">
                    <span class="text-xs text-zinc-500">输入 Tokens</span>
                    <span class="text-sm font-bold text-amber-400">{{ log.inputTokens }}</span>
                  </div>
                  <div class="flex justify-between mb-2">
                    <span class="text-xs text-zinc-500">输出 Tokens</span>
                    <span class="text-sm font-bold text-emerald-400">{{ log.outputTokens }}</span>
                  </div>
                  <n-divider style="margin: 8px 0" />
                  <div class="flex justify-between">
                    <span class="text-xs text-zinc-500">合计总额</span>
                    <span class="text-base font-black text-white">{{ log.totalTokens }}</span>
                  </div>
                </div>
              </div>
              <div class="meta-item">
                <span class="label">响应耗时</span>
                <span class="value">{{ log.durationMs }} ms</span>
              </div>
              <div class="meta-item">
                <span class="label">记录时间</span>
                <span class="value text-xs">{{ formatTime(log.createTime) }}</span>
              </div>
              <div v-if="log.status === 'FAIL'" class="meta-item">
                <span class="label text-rose-400">错误详情</span>
                <div class="bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 mt-2">
                  <p class="text-xs text-rose-300">{{ log.errorMessage }}</p>
                </div>
              </div>
            </n-space>
          </div>
        </n-grid-item>
      </n-grid>
    </div>
  </n-modal>
</template>

<style scoped>
.log-audit-detail {
  padding: 8px;
}

.audit-section {
  background: rgba(0, 0, 0, 0.2);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  height: 100%;
}

.audit-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
}

.audit-title::before {
  content: '';
  width: 4px;
  height: 18px;
  background: #3b82f6;
  border-radius: 2px;
}

.code-box {
  padding: 16px;
  border-radius: 8px;
  font-family: 'Fira Code', monospace;
  overflow: hidden;
}

.result-box {
  min-height: 300px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-item .label {
  font-size: 0.8rem;
  color: #71717a;
  font-weight: 500;
}

.meta-item .value {
  font-size: 1rem;
  font-weight: 600;
  color: #e4e4e7;
}
</style>