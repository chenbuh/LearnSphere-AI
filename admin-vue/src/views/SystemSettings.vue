<script setup>
import SystemSettingsBasicCard from '@/components/SystemSettingsBasicCard.vue'
import SystemSettingsSwitchCard from '@/components/SystemSettingsSwitchCard.vue'
import SystemSettingsAiQuotaCard from '@/components/SystemSettingsAiQuotaCard.vue'
import SystemSettingsQuotaCostCard from '@/components/SystemSettingsQuotaCostCard.vue'
import { useSystemSettings } from '@/composables/useSystemSettings'

const {
  configs,
  handleSaveAI,
  handleSaveBasic,
  handleSaveQuotaCost,
  handleSaveSwitch
} = useSystemSettings()
</script>

<template>
  <div class="admin-page admin-page--wide">
    <div class="ls-grid-2 settings-grid">
      <SystemSettingsBasicCard :configs="configs" @save-basic="handleSaveBasic" />
      <div class="settings-stack">
        <SystemSettingsSwitchCard :configs="configs" @save-switch="handleSaveSwitch" />
        <SystemSettingsAiQuotaCard :configs="configs" @save-ai="handleSaveAI" />
      </div>
    </div>
    <SystemSettingsQuotaCostCard :configs="configs" @save-quota-cost="handleSaveQuotaCost" />
  </div>
</template>

<style scoped>
.settings-grid {
  align-items: stretch;
}

/* Right column: two panels stacked; the last one grows so its bottom edge meets the left panel's. */
.settings-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.settings-stack > :last-child {
  flex: 1;
}
</style>
