<script setup>
import { ref } from 'vue'
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NSpin,
  NTag,
  useMessage
} from 'naive-ui'
import { Zap } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const message = useMessage()
const sandboxSystemPrompt = ref('')
const sandboxUserPrompt = ref('')
const sandboxResult = ref('')
const sandboxLoading = ref(false)

const handleRunTest = async () => {
  if (!sandboxUserPrompt.value) {
    message.warning('请输入用户指令')
    return
  }
  sandboxLoading.value = true
  sandboxResult.value = ''
  try {
    const res = await adminApi.testPrompt({
      systemPrompt: sandboxSystemPrompt.value,
      userPrompt: sandboxUserPrompt.value
    })
    sandboxResult.value = res.data
    message.success('请求成功')
  } catch (error) {
    message.error('测试请求失败')
  } finally {
    sandboxLoading.value = false
  }
}
</script>

<template>
  <div class="sandbox-page">
    <div class="page-header">
      <div>
        <div class="header-eyebrow">沙箱测试</div>
        <h2>提示词测试</h2>
        <p>按输入配置和输出结果测试提示词，便于快速复现、比对和排查。</p>
      </div>
    </div>
    <n-grid :cols="2" :x-gap="24" class="h-full">
          <n-grid-item>
            <div class="flex flex-col gap-4 h-full">
              <n-card title="输入配置" :bordered="false" class="main-card flex-1">
                <div class="panel-copy">
                  <div class="panel-kicker">输入区</div>
                  <p>先明确系统约束，再填写用户指令，确保测试结果可复现。</p>
                </div>
                <n-form label-placement="top">
                  <n-form-item label="系统提示词">
                    <n-input
                      v-model:value="sandboxSystemPrompt"
                      type="textarea"
                      placeholder="设定 AI 的角色和行事准则..."
                      :autosize="{ minRows: 4, maxRows: 8 }"
                    />
                  </n-form-item>
                  <n-form-item label="用户指令">
                    <n-input
                      v-model:value="sandboxUserPrompt"
                      type="textarea"
                      placeholder="输入具体的测试指令..."
                      :autosize="{ minRows: 6, maxRows: 12 }"
                    />
                  </n-form-item>
                  <div class="flex justify-end mt-4">
                    <n-button type="primary" :loading="sandboxLoading" @click="handleRunTest">
                      <template #icon><Zap :size="16" /></template>
                      运行测试
                    </n-button>
                  </div>
                </n-form>
              </n-card>
            </div>
          </n-grid-item>
          <n-grid-item>
            <n-card title="输出结果" :bordered="false" class="main-card h-full flex flex-col">
              <template #header-extra>
                 <n-tag type="info" size="small" v-if="sandboxResult">Token 消耗：未知</n-tag>
              </template>
              <div class="panel-copy">
                <div class="panel-kicker">结果区</div>
                <p>结果区域保留原始响应，方便检查语气、结构、约束遵循与异常输出。</p>
              </div>
              <n-spin :show="sandboxLoading">
                <div class="result-console">
                  {{ sandboxResult || '等待执行结果...' }}
                </div>
              </n-spin>
            </n-card>
          </n-grid-item>
        </n-grid>
  </div>
</template>

<style scoped>
.sandbox-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.header-eyebrow {
  margin-bottom: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #67e8f9;
  text-transform: uppercase;
}

.page-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
}

.page-header p {
  max-width: 760px;
  margin: 10px 0 0;
  font-size: 0.9rem;
  line-height: 1.7;
  color: #94a3b8;
}

.main-card {
  background: rgba(12, 18, 28, 0.84) !important;
  border: 1px solid rgba(148, 163, 184, 0.12) !important;
  box-shadow: 0 14px 30px -24px rgba(0, 0, 0, 0.8);
  transition: all 0.3s ease;
}

.main-card:hover {
  box-shadow: 0 18px 36px -24px rgba(0, 0, 0, 0.85);
  border-color: rgba(94, 234, 212, 0.16) !important;
}

.panel-copy {
  margin-bottom: 18px;
}

.panel-kicker {
  margin-bottom: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #67e8f9;
}

.panel-copy p {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.65;
  color: #94a3b8;
}

.result-console {
  min-height: 400px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(6, 10, 18, 0.86);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.7;
  white-space: pre-wrap;
  color: #d4d4d8;
}
</style>
