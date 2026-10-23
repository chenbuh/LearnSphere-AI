<script setup>
import { Save } from 'lucide-vue-next'
import { NButton, NForm, NFormItem, NIcon, NInput } from 'naive-ui'
import RichTextEditor from '../components/RichTextEditor.vue'

defineProps({
  configs: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save-basic'])
</script>

<template>
  <section class="ls-panel settings-panel">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">基础设置</h2>
    </header>
    <div class="ls-panel__body settings-body">
      <n-form label-placement="left" label-width="120" label-align="left" :show-feedback="false" class="settings-form">
        <n-form-item label="网站名称">
          <n-input v-model:value="configs['sys.site_name']" placeholder="LearnSphere AI" />
        </n-form-item>
        <n-form-item label="系统公告" class="settings-form__top">
          <RichTextEditor
            v-model="configs['sys.announcement']"
            class="settings-form__fill"
            placeholder="发布带有丰富样式的全局通知..."
          />
        </n-form-item>
      </n-form>
    </div>
    <footer class="ls-panel__foot">
      <n-button type="primary" secondary @click="emit('save-basic')">
        <template #icon>
          <n-icon :component="Save" />
        </template>
        保存基础设置
      </n-button>
    </footer>
  </section>
</template>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
}

.settings-body {
  flex: 1;
}

.settings-form {
  display: grid;
  gap: 16px;
}

/* Multi-line control: pin the label to the first line instead of centring it. */
.settings-form__top :deep(.n-form-item-label) {
  align-self: flex-start;
}

.settings-form__fill {
  width: 100%;
}
</style>
