import { onMounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { adminApi } from '@/api/admin'
import {
  buildSystemSettings,
  defaultSystemSettings,
  systemSettingsGroups
} from '@/utils/systemSettingsConfig'

export function useSystemSettings() {
  const message = useMessage()
  const loading = ref(false)
  const configs = ref({ ...defaultSystemSettings })
  const rawConfigList = ref([])

  const handleSave = async (key) => {
    const value = String(configs.value[key])
    try {
      await adminApi.updateSystemConfig(key, value)
      message.success('配置已更新')
    } catch (error) {
      message.error('更新失败')
    }
  }

  const saveConfigGroup = (groupKeys) => {
    groupKeys.forEach((key) => {
      handleSave(key)
    })
  }

  const fetchConfigs = async () => {
    loading.value = true
    try {
      const res = await adminApi.getSystemConfigs()
      rawConfigList.value = res.data || []
      configs.value = buildSystemSettings(rawConfigList.value)
    } catch (error) {
      message.error('加载系统配置失败')
    } finally {
      loading.value = false
    }
  }

  const handleSaveBasic = () => saveConfigGroup(systemSettingsGroups.basic)
  const handleSaveSwitch = (key) => handleSave(key)
  const handleSaveAI = () => saveConfigGroup(systemSettingsGroups.aiQuota)
  const handleSaveQuotaCost = () => saveConfigGroup(systemSettingsGroups.quotaCost)

  onMounted(() => {
    fetchConfigs()
  })

  return {
    configs,
    fetchConfigs,
    handleSaveAI,
    handleSaveBasic,
    handleSaveQuotaCost,
    handleSaveSwitch,
    loading
  }
}
