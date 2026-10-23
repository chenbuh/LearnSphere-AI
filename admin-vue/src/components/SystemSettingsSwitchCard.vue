<script setup>
import { NInput, NSwitch } from 'naive-ui'

defineProps({
  configs: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save-switch'])

const dangerRail = ({ checked }) => (checked ? { background: 'var(--danger)' } : {})
</script>

<template>
  <section class="ls-panel settings-panel">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">系统开关</h2>
    </header>
    <ul class="switch-list">
      <li class="switch-row">
        <div class="switch-row__text">
          <span class="switch-row__title">开放用户注册</span>
          <span class="switch-row__desc">关闭后新用户无法注册，现有用户不受影响</span>
        </div>
        <n-switch
          v-model:value="configs['sys.user_registration']"
          @update:value="emit('save-switch', 'sys.user_registration')"
        />
      </li>
      <li class="switch-row">
        <div class="switch-row__text">
          <span class="switch-row__title">系统维护模式</span>
          <span class="switch-row__desc switch-row__desc--danger">开启后除管理员外无法访问</span>
        </div>
        <n-switch
          v-model:value="configs['sys.maintenance_mode']"
          :rail-style="dangerRail"
          @update:value="emit('save-switch', 'sys.maintenance_mode')"
        />
      </li>
      <li v-if="configs['sys.maintenance_mode']" class="switch-row switch-row--block">
        <span class="switch-row__title">维护公告</span>
        <n-input
          v-model:value="configs['sys.maintenance_message']"
          type="textarea"
          placeholder="请输入维护公告内容（支持 HTML），失焦自动保存"
          :rows="3"
          @blur="emit('save-switch', 'sys.maintenance_message')"
        />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
}

.switch-list {
  flex: 1;
  margin: 0;
  padding: 0;
  list-style: none;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 64px;
  padding: 12px 20px;
}

.switch-row + .switch-row {
  border-top: 1px solid var(--line);
}

.switch-row--block {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.switch-row__text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.switch-row__title {
  color: var(--ink);
  font-size: 14px;
  font-weight: 500;
}

.switch-row__desc {
  color: var(--ink-3);
  font-size: 12px;
}

.switch-row__desc--danger {
  color: var(--danger);
}
</style>
