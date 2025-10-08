<script setup>
import { ref } from 'vue'
import { NCard, NTabs, NTabPane, NInput, NButton, NAvatar, NTag, NDivider, useMessage } from 'naive-ui'
import { User, Mail, Shield, Lock } from 'lucide-vue-next'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const message = useMessage()

const profileForm = ref({
  username: userStore.username,
  email: 'user@example.com',
  bio: 'Learning English since 2024'
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

const updateProfile = () => {
  message.success('个人资料已更新！')
}

const updatePassword = () => {
  message.success('密码修改成功！')
}
</script>

<template>
  <div class="profile-container max-w-4xl mx-auto">
    <div class="header mb-8 flex items-center gap-6">
       <n-avatar round :size="100" :src="userStore.avatar" class="border-4 border-primary/20" />
       <div>
          <h2 class="text-3xl font-bold mb-2">{{ userStore.username }}</h2>
          <div class="flex gap-2">
             <n-tag type="success" round>专业会员</n-tag>
             <n-tag type="info" round>Lv. 12</n-tag>
          </div>
       </div>
    </div>

    <n-card class="profile-card">
       <n-tabs type="line" animated>
          <n-tab-pane name="general" tab="通用设置">
             <div class="max-w-md space-y-6 py-4">
                <div class="form-group">
                   <label class="block mb-2 text-gray-400">用户名</label>
                   <n-input v-model:value="profileForm.username" placeholder="请输入用户名">
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
                <n-button type="primary" @click="updateProfile">保存修改</n-button>
             </div>
          </n-tab-pane>
          
          <n-tab-pane name="security" tab="安全设置">
             <div class="max-w-md space-y-6 py-4">
                <div class="form-group">
                   <label class="block mb-2 text-gray-400">当前密码</label>
                   <n-input type="password" v-model:value="passwordForm.current" show-password-on="click">
                      <template #prefix><Lock :size="16" /></template>
                   </n-input>
                </div>
                <n-divider />
                <div class="form-group">
                   <label class="block mb-2 text-gray-400">新密码</label>
                   <n-input type="password" v-model:value="passwordForm.new" show-password-on="click">
                      <template #prefix><Shield :size="16" /></template>
                   </n-input>
                </div>
                <div class="form-group">
                   <label class="block mb-2 text-gray-400">确认新密码</label>
                   <n-input type="password" v-model:value="passwordForm.confirm" show-password-on="click">
                      <template #prefix><Shield :size="16" /></template>
                   </n-input>
                </div>
                <n-button type="warning" @click="updatePassword">修改密码</n-button>
             </div>
          </n-tab-pane>
       </n-tabs>
    </n-card>
  </div>
</template>

<style scoped>
.space-y-6 > * + * { margin-top: 1.5rem; }
.border-primary\/20 { border-color: rgba(99, 102, 241, 0.2); }
</style>
