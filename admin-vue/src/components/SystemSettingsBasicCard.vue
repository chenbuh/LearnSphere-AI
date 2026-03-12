<script setup>
import { Save, Settings } from 'lucide-vue-next'
import { NButton, NCard, NForm, NFormItem, NInput } from 'naive-ui'
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
  <n-card title="基础设置" class="setting-card">
    <template #header-extra>
      <Settings class="icon" />
    </template>

    <n-form label-placement="top">
      <n-form-item label="网站名称">
        <n-input v-model:value="configs['sys.site_name']" placeholder="LearnSphere AI" />
      </n-form-item>
      <n-form-item label="系统公告">
        <RichTextEditor
          v-model="configs['sys.announcement']"
          placeholder="发布带有丰富样式的全局通知..."
        />
      </n-form-item>
      <n-button type="primary" @click="emit('save-basic')">
        <template #icon>
          <Save />
        </template>
        保存基础设置
      </n-button>
    </n-form>
  </n-card>
</template>

<style scoped>
.setting-card {
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(20, 20, 25, 0.6);
}

.icon {
  width: 20px;
  height: 20px;
  color: #a1a1aa;
}
</style>
