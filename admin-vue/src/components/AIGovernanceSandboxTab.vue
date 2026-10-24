<script setup>
import { ref } from 'vue'
import { NButton, NForm, NFormItem, NInput, NSpin, useMessage } from 'naive-ui'
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
  <div class="ls-grid-2 sandbox-row">
    <section class="ls-panel">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">输入配置</h2>
        <div class="ls-panel__tools">
          <n-button type="primary" size="small" :loading="sandboxLoading" @click="handleRunTest">
            <template #icon><Zap :size="14" /></template>
            运行测试
          </n-button>
        </div>
      </header>
      <div class="ls-panel__body">
        <n-form label-placement="top" :show-feedback="false" class="sandbox-form">
          <n-form-item label="系统提示词">
            <n-input
              v-model:value="sandboxSystemPrompt"
              type="textarea"
              placeholder="设定 AI 的角色和行事准则..."
              :autosize="{ minRows: 6, maxRows: 10 }"
            />
          </n-form-item>
          <n-form-item label="用户指令">
            <n-input
              v-model:value="sandboxUserPrompt"
              type="textarea"
              placeholder="输入具体的测试指令..."
              :autosize="{ minRows: 8, maxRows: 14 }"
            />
          </n-form-item>
        </n-form>
      </div>
    </section>

    <section class="ls-panel">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">输出结果</h2>
      </header>
      <div class="ls-panel__body">
        <n-spin :show="sandboxLoading" class="result-spin">
          <div class="result-console" :class="{ 'is-empty': !sandboxResult }">
            {{ sandboxResult || '等待执行结果...' }}
          </div>
        </n-spin>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sandbox-row {
  align-items: stretch;
}

.sandbox-row > .ls-panel {
  display: flex;
  flex-direction: column;
}

.sandbox-row .ls-panel__body {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.sandbox-form {
  display: grid;
  gap: 16px;
}

.result-spin,
.result-spin :deep(.n-spin-content) {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.result-console {
  flex: 1;
  min-height: 360px;
  padding: 12px 14px;
  border-radius: var(--r-md);
  background: var(--paper-sunken);
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.result-console.is-empty {
  color: var(--ink-3);
}
</style>
