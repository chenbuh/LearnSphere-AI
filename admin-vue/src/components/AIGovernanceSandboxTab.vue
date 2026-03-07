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
    message.warning('请输入 User Prompt')
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
<n-grid :cols="2" :x-gap="24" class="h-full">
          <n-grid-item>
            <div class="flex flex-col gap-4 h-full">
              <n-card title="输入配置" :bordered="false" class="main-card flex-1">
                <n-form label-placement="top">
                  <n-form-item label="System Prompt (系统提示词)">
                    <n-input
                      v-model:value="sandboxSystemPrompt"
                      type="textarea"
                      placeholder="设定 AI 的角色和行事准则..."
                      :autosize="{ minRows: 4, maxRows: 8 }"
                    />
                  </n-form-item>
                  <n-form-item label="User Prompt (用户指令)">
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
                 <n-tag type="info" size="small" v-if="sandboxResult">Token消耗: 未知</n-tag>
              </template>
              <n-spin :show="sandboxLoading">
                <div class="bg-zinc-900/50 rounded-lg p-4 min-h-[400px] font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
                  {{ sandboxResult || '等待运行...' }}
                </div>
              </n-spin>
            </n-card>
          </n-grid-item>
        </n-grid>
</template>

<style scoped>
.main-card {
  backdrop-filter: blur(12px);
  background: rgba(20, 20, 25, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.main-card:hover {
  box-shadow: 0 8px 32px -1px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.12) !important;
}
</style>
