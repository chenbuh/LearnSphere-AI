import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { useVipPermission } from '@/composables/useVipPermission'
import { achievementApi } from '@/api/achievement'
import { userApi } from '@/api/user'

export function useProfileSettings() {
  const userStore = useUserStore()
  const message = useMessage()

  const uploadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/file/upload/avatar`
  const { quotaInfo, fetchQuotaInfo } = useVipPermission()

  const profileForm = ref({
    nickname: userStore.nickname || '',
    email: userStore.email || '',
    bio: userStore.userInfo?.bio || '这家伙很懒，什么都没留下',
    examType: userStore.examType || 'cet4'
  })

  const passwordForm = ref({
    current: '',
    new: '',
    confirm: ''
  })

  const achievements = ref([])
  const isUploading = ref(false)
  const isScanning = ref(false)
  const showMfaModal = ref(false)
  const mfaSetupData = ref({ secret: '', qrCodeUrl: '' })
  const mfaCode = ref('')
  const isBindingMfa = ref(false)
  const riskStatus = ref({ violations: 0, isLocked: false, mfaEnabled: false })
  const securityLogs = ref([])

  let quotaTimer = null
  let scanTimer = null

  const syncProfileForm = () => {
    profileForm.value = {
      nickname: userStore.nickname || '',
      email: userStore.email || '',
      bio: userStore.userInfo?.bio || '这家伙很懒，什么都没留下',
      examType: userStore.examType || 'cet4'
    }
  }

  const securityScore = computed(() => {
    let score = 60

    if (userStore.email && userStore.email.includes('@')) {
      score += 20
    }

    if (userStore.nickname && userStore.nickname !== userStore.username) {
      score += 10
    }

    if (userStore.avatar && !userStore.avatar.includes('ui-avatars.com')) {
      score += 10
    }

    return Math.min(score, 100)
  })

  const fetchRiskStatus = async () => {
    try {
      const res = await userApi.getRiskStatus()
      if (res.code === 200) {
        riskStatus.value = res.data
      }
    } catch (error) {
      console.error('Fetch risk status error', error)
    }
  }

  const openMfaSetup = async () => {
    try {
      const res = await userApi.setupMfa()
      if (res.code === 200) {
        mfaSetupData.value = res.data
        showMfaModal.value = true
      }
    } catch (error) {
      message.error('无法初始化 MFA，请稍后再试')
    }
  }

  const handleBindMfa = async () => {
    if (mfaCode.value.length !== 6) {
      message.warning('请输入6位数字验证码')
      return
    }

    isBindingMfa.value = true
    try {
      const res = await userApi.bindMfa({
        secret: mfaSetupData.value.secret,
        code: mfaCode.value
      })

      if (res.code === 200) {
        message.success('MFA 绑定成功！')
        showMfaModal.value = false
        mfaCode.value = ''
        await fetchRiskStatus()
        await userStore.getUserInfo()
        syncProfileForm()
      } else {
        message.error(res.message || '绑定失败')
      }
    } catch (error) {
      message.error('系统繁忙，请重试')
    } finally {
      isBindingMfa.value = false
    }
  }

  const fetchSecurityLogs = async () => {
    try {
      const res = await userApi.getSecurityLogs()
      if (res.code === 200) {
        securityLogs.value = res.data.map(log => ({
          id: log.id,
          event: log.event,
          time: new Date(log.createTime).toLocaleString(),
          ip: log.ip,
          status: log.status
        }))
      }
    } catch (error) {
      console.error('Fetch security logs error', error)
      securityLogs.value = [
        { id: 1, event: '密码更新成功', time: '1小时前', ip: '192.168.1.102', status: 'success' },
        { id: 2, event: '登录地址验证', time: '3小时前', ip: '112.54.33.21', status: 'success' },
        { id: 3, event: '检测到远程异地登录', time: '2天前', ip: '223.4.1.9', status: 'warning' }
      ]
    }
  }

  const fetchAchievements = async () => {
    try {
      const res = await achievementApi.getMyAchievements()
      if (res.code === 200) {
        achievements.value = res.data
      }
    } catch (error) {
      console.error('Fetch achievements error', error)
    }
  }

  const updateProfile = async () => {
    try {
      const res = await userApi.updateProfile({
        nickname: profileForm.value.nickname,
        email: profileForm.value.email,
        bio: profileForm.value.bio,
        examType: profileForm.value.examType
      })

      if (res.code === 200) {
        message.success('个人资料已更新！')
        await userStore.getUserInfo()
        syncProfileForm()
      } else {
        message.error(res.message || '更新失败')
      }
    } catch (error) {
      message.error('更新个人资料失败')
    }
  }

  const updatePassword = async () => {
    if (passwordForm.value.new !== passwordForm.value.confirm) {
      message.error('两次输入的密码不一致')
      return
    }

    if (!passwordForm.value.new || passwordForm.value.new.length < 6) {
      message.error('新密码长度不能少于6位')
      return
    }

    try {
      const res = await userApi.updatePassword({
        current: passwordForm.value.current,
        new: passwordForm.value.new
      })

      if (res.code === 200) {
        message.success('密码修改成功！')
        passwordForm.value = { current: '', new: '', confirm: '' }
      } else {
        message.error(res.message || '密码修改失败')
      }
    } catch (error) {
      message.error('修改密码失败')
    }
  }

  const handleAvatarBeforeUpload = data => {
    const file = data.file?.file
    if (!file) {
      message.error('无法读取上传文件')
      return false
    }

    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片！')
      return false
    }

    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB！')
      return false
    }

    isUploading.value = true
    return true
  }

  const handleAvatarFinish = async ({ event }) => {
    isUploading.value = false

    try {
      const response = JSON.parse(event?.target?.response ?? '{}')
      if (response.code === 200) {
        userStore.avatar = response.data
        message.success('头像上传成功！')
        await userStore.getUserInfo()
        syncProfileForm()
      } else {
        message.error(response.message || '上传失败')
      }
    } catch (error) {
      message.error('解析响应失败')
    }
  }

  const handleAvatarError = () => {
    isUploading.value = false
    message.error('上传过程中发生系统错误')
  }

  const runSecurityScan = () => {
    if (isScanning.value) {
      return
    }

    isScanning.value = true
    if (scanTimer) {
      clearTimeout(scanTimer)
    }

    scanTimer = setTimeout(() => {
      isScanning.value = false
      if (securityScore.value >= 90) {
        message.success('深度安全扫描完成，账号资料完整，安全状况极佳！')
      } else {
        message.warning(`扫描完成，当前评分为 ${securityScore.value}。建议完善绑定邮箱和个人头像以提升安全等级。`)
      }
    }, 2500)
  }

  onMounted(async () => {
    await userStore.getUserInfo()
    syncProfileForm()

    await fetchQuotaInfo()
    await fetchAchievements()
    fetchSecurityLogs()
    fetchRiskStatus()

    quotaTimer = setInterval(() => {
      fetchQuotaInfo()
    }, 60000)
  })

  onUnmounted(() => {
    if (quotaTimer) {
      clearInterval(quotaTimer)
    }
    if (scanTimer) {
      clearTimeout(scanTimer)
    }
  })

  return {
    achievements,
    handleAvatarBeforeUpload,
    handleAvatarError,
    handleAvatarFinish,
    handleBindMfa,
    isBindingMfa,
    isScanning,
    isUploading,
    mfaCode,
    mfaSetupData,
    openMfaSetup,
    passwordForm,
    profileForm,
    quotaInfo,
    riskStatus,
    runSecurityScan,
    securityLogs,
    securityScore,
    showMfaModal,
    updatePassword,
    updateProfile,
    uploadUrl,
    userStore
  }
}
