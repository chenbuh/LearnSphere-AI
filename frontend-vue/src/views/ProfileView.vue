<script setup>
import { defineAsyncComponent } from 'vue'
import { NAvatar, NButton, NCard, NIcon, NInput, NSpin, NTabPane, NTabs, NTag, NUpload } from 'naive-ui'
import { Camera, Mail, User, Zap } from 'lucide-vue-next'
import { useProfileSettings } from '@/composables/useProfileSettings'

const ProfileAchievementPanel = defineAsyncComponent(() => import('@/components/profile/ProfileAchievementPanel.vue'))
const ProfileMfaModal = defineAsyncComponent(() => import('@/components/profile/ProfileMfaModal.vue'))
const ProfileSecurityPanel = defineAsyncComponent(() => import('@/components/profile/ProfileSecurityPanel.vue'))
const ProfileVipPanel = defineAsyncComponent(() => import('@/components/profile/ProfileVipPanel.vue'))

const {
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
} = useProfileSettings()

const handleMfaCodeChange = value => {
  mfaCode.value = value
}

const handleMfaModalShowChange = value => {
  showMfaModal.value = value
}
</script>

<template>
  <div class="profile-container max-w-4xl mx-auto">
    <div class="header mb-8 flex items-center gap-6 profile-header-mobile">
      <div class="avatar-wrapper relative group">
        <n-upload
          :action="uploadUrl"
          :headers="{ satoken: userStore.token }"
          :show-file-list="false"
          @before-upload="handleAvatarBeforeUpload"
          @finish="handleAvatarFinish"
          @error="handleAvatarError"
        >
          <div class="relative cursor-pointer">
            <n-avatar
              round
              :src="userStore.avatar"
              class="border-4 border-white shadow-xl transition-all duration-300 group-hover:brightness-50 profile-avatar"
            >
              <n-icon :component="User" />
            </n-avatar>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 rounded-full">
              <n-spin v-if="isUploading" size="small" stroke="white" />
              <Camera v-else class="text-white" :size="24" />
            </div>
          </div>
        </n-upload>
      </div>

      <div class="user-info-mobile">
        <h2 class="text-3xl font-bold mb-2 username-mobile">{{ userStore.nickname || userStore.username }}</h2>
        <div class="flex flex-wrap items-center gap-2 tags-mobile">
          <n-tag :type="userStore.isVip() ? 'success' : 'default'" round size="small">
            {{ userStore.getVipLabel() }}
          </n-tag>
          <n-tag v-if="userStore.vipLevel > 0 && !userStore.isVip()" type="error" round size="small">
            已过期
          </n-tag>
          <n-tag type="warning" round size="small" class="flex items-center">
            <template #icon><n-icon :component="Zap" /></template>
            {{ userStore.userInfo?.points || 0 }} XP
          </n-tag>
          <n-tag v-if="userStore.userInfo?.currentLevel" type="info" round size="small">
            {{ userStore.userInfo.currentLevel.toUpperCase() }}
          </n-tag>
        </div>
        <div v-if="userStore.vipExpireTime" class="mt-2 text-xs text-gray-500">
          {{ userStore.isVip() ? '有效期至:' : '过期于:' }} {{ new Date(userStore.vipExpireTime).toLocaleDateString() }}
        </div>
      </div>
    </div>

    <n-card class="profile-card stats-card-bg" :bordered="false">
      <n-tabs type="line" animated>
        <n-tab-pane name="general" tab="通用设置">
          <div class="max-w-md space-y-6 py-4">
            <div class="form-group">
              <label class="block mb-2 text-gray-400">用户名 (不可修改)</label>
              <n-input :value="userStore.username" disabled>
                <template #prefix><User :size="16" /></template>
              </n-input>
            </div>
            <div class="form-group">
              <label class="block mb-2 text-gray-400">昵称</label>
              <n-input v-model:value="profileForm.nickname" placeholder="请输入昵称">
                <template #prefix><User :size="16" /></template>
              </n-input>
            </div>
            <div class="form-group">
              <label class="block mb-2 text-gray-400">电子邮箱</label>
              <n-input v-model:value="profileForm.email" placeholder="请输入邮箱">
                <template #prefix><Mail :size="16" /></template>
              </n-input>
            </div>
            <div class="form-group">
              <label class="block mb-2 text-gray-400">个人简介</label>
              <n-input v-model:value="profileForm.bio" type="textarea" placeholder="介绍一下自己..." />
            </div>
            <n-button type="primary" size="large" @click="updateProfile">保存修改</n-button>
          </div>
        </n-tab-pane>

        <n-tab-pane name="security" tab="安全设置">
          <ProfileSecurityPanel
            :is-scanning="isScanning"
            :password-form="passwordForm"
            :risk-status="riskStatus"
            :security-logs="securityLogs"
            :security-score="securityScore"
            @open-mfa-setup="openMfaSetup"
            @run-security-scan="runSecurityScan"
            @update-password="updatePassword"
          />
        </n-tab-pane>

        <n-tab-pane name="vip" tab="会员权益">
          <ProfileVipPanel :user-store="userStore" :quota-info="quotaInfo" />
        </n-tab-pane>

        <n-tab-pane name="achievements" tab="我的成就">
          <ProfileAchievementPanel :achievements="achievements" />
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <ProfileMfaModal
      :show="showMfaModal"
      :is-binding-mfa="isBindingMfa"
      :mfa-code="mfaCode"
      :mfa-setup-data="mfaSetupData"
      @bind="handleBindMfa"
      @update:mfa-code="handleMfaCodeChange"
      @update:show="handleMfaModalShowChange"
    />
  </div>
</template>

<style scoped>
.profile-container {
  padding: 40px 20px;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.avatar-wrapper {
  transition: transform 0.3s ease;
}

.avatar-wrapper:hover {
  transform: scale(1.02);
}

.stats-card-bg {
  background: rgba(20, 20, 25, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(10px);
  border-radius: 20px;
}

:deep(.n-tabs-tab__label) {
  font-size: 1.05rem;
  font-weight: 600;
}

:deep(.n-tabs .n-tabs-tab.n-tabs-tab--active) {
  color: #6366f1;
}

:deep(.n-tabs-bar) {
  background-color: #6366f1;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 20px 12px;
  }

  .profile-header-mobile {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .profile-avatar {
    width: 90px !important;
    height: 90px !important;
  }

  .username-mobile {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }

  .tags-mobile {
    justify-content: center;
  }

  .max-w-md {
    max-width: 100% !important;
  }

  :deep(.n-tabs-tab) {
    font-size: 0.9rem;
    padding: 8px 10px;
  }
}
</style>
