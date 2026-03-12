<script setup>
import SystemSettingsHeader from '@/components/SystemSettingsHeader.vue'
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
  <div class="page-container">
    <SystemSettingsHeader />

    <div class="settings-grid">
      <SystemSettingsBasicCard :configs="configs" @save-basic="handleSaveBasic" />
      <SystemSettingsSwitchCard :configs="configs" @save-switch="handleSaveSwitch" />
      <SystemSettingsAiQuotaCard :configs="configs" @save-ai="handleSaveAI" />
      <SystemSettingsQuotaCostCard :configs="configs" @save-quota-cost="handleSaveQuotaCost" />
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
