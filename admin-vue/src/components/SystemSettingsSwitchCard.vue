<script setup>
import { ShieldAlert } from 'lucide-vue-next'
import { NCard, NDivider, NInput, NSpace, NSwitch } from 'naive-ui'

defineProps({
  configs: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save-switch'])
</script>

<template>
  <n-card title="系统开关" class="setting-card">
    <template #header-extra>
      <ShieldAlert class="icon" />
    </template>

    <div class="card-intro">
      <strong>访问与维护策略</strong>
      <span>注册开关影响新用户入口，维护模式会改变全站可访问性，请谨慎保存。</span>
    </div>

    <n-space vertical size="large">
      <div class="switch-item">
        <div class="switch-info">
          <span class="switch-title">开放用户注册</span>
          <span class="switch-desc">关闭后新用户将无法注册，现有用户不受影响</span>
        </div>
        <span class="switch-badge">用户入口</span>
        <n-switch
          v-model:value="configs['sys.user_registration']"
          @update:value="emit('save-switch', 'sys.user_registration')"
        />
      </div>

      <n-divider style="margin: 0" />

      <div class="switch-item">
        <div class="switch-info">
          <span class="switch-title">系统维护模式</span>
          <span class="switch-desc text-warning">开启后除管理员外无法访问，请谨慎操作</span>
        </div>
        <span class="switch-badge switch-badge--danger">高风险</span>
        <n-switch
          v-model:value="configs['sys.maintenance_mode']"
          :rail-style="({ checked }) => checked ? { background: '#d03050' } : {}"
          @update:value="emit('save-switch', 'sys.maintenance_mode')"
        />
      </div>

      <div v-if="configs['sys.maintenance_mode']" class="maintenance-box">
        <n-input
          v-model:value="configs['sys.maintenance_message']"
          type="textarea"
          placeholder="请输入维护公告内容（支持 HTML）"
          :rows="3"
          @blur="emit('save-switch', 'sys.maintenance_message')"
        />
      </div>
    </n-space>
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

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 8px 0;
}

.switch-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.switch-title {
  font-size: 1rem;
  font-weight: 600;
}

.switch-desc {
  font-size: 0.85rem;
  color: #71717a;
}

.text-warning {
  color: #f59e0b;
}

.switch-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(92, 168, 255, 0.12);
  border: 1px solid rgba(92, 168, 255, 0.18);
  color: #bfdbfe;
  font-size: 0.76rem;
  font-weight: 600;
}

.switch-badge--danger {
  color: #fecdd3;
  background: rgba(238, 138, 151, 0.12);
  border-color: rgba(238, 138, 151, 0.18);
}

.maintenance-box {
  margin-top: 16px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(238, 138, 151, 0.16);
  background: rgba(238, 138, 151, 0.06);
}
</style>
