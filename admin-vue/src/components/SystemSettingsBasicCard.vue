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

    <div class="card-intro">
      <strong>站点基础信息</strong>
      <span>维护站点名称与后台公告内容，这些配置会直接影响管理端与前台的全局提示。</span>
    </div>

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

.card-intro {
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.42);
  border: 1px solid rgba(148, 163, 184, 0.12);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-intro strong {
  color: #e2e8f0;
  font-size: 0.92rem;
  font-weight: 700;
}

.card-intro span {
  color: #94a3b8;
  font-size: 0.82rem;
  line-height: 1.55;
}

.icon {
  width: 20px;
  height: 20px;
  color: #a1a1aa;
}
</style>
