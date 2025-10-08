<template>
  <div class="api-test-container">
    <n-card title="API接口测试" class="test-card">
      <n-space vertical size="large">
        <!-- 健康检查测试 -->
        <n-card title="健康检查" size="small">
          <n-space>
            <n-button @click="testHealthCheck" :loading="healthLoading">
              健康检查
            </n-button>
            <n-button @click="testVersion" :loading="versionLoading">
              版本信息
            </n-button>
          </n-space>
        </n-card>

        <!-- 用户注册测试 -->
        <n-card title="用户注册" size="small">
          <n-form ref="registerFormRef" :model="registerForm" :rules="registerRules">
            <n-form-item label="用户名" path="username">
              <n-input v-model:value="registerForm.username" placeholder="请输入用户名" />
            </n-form-item>
            <n-form-item label="密码" path="password">
              <n-input v-model:value="registerForm.password" type="password" placeholder="请输入密码" />
            </n-form-item>
            <n-form-item label="邮箱" path="email">
              <n-input v-model:value="registerForm.email" placeholder="请输入邮箱" />
            </n-form-item>
            <n-form-item label="昵称">
              <n-input v-model:value="registerForm.nickname" placeholder="请输入昵称（可选）" />
            </n-form-item>
            <n-form-item>
              <n-button type="primary" @click="testRegister" :loading="registerLoading">
                测试注册
              </n-button>
            </n-form-item>
          </n-form>
        </n-card>

        <!-- 用户登录测试 -->
        <n-card title="用户登录" size="small">
          <n-form ref="loginFormRef" :model="loginForm" :rules="loginRules">
            <n-form-item label="用户名" path="username">
              <n-input v-model:value="loginForm.username" placeholder="请输入用户名" />
            </n-form-item>
            <n-form-item label="密码" path="password">
              <n-input v-model:value="loginForm.password" type="password" placeholder="请输入密码" />
            </n-form-item>
            <n-form-item>
              <n-space>
                <n-button type="primary" @click="testLogin" :loading="loginLoading">
                  测试登录
                </n-button>
                <n-button @click="testGetUserInfo" :loading="userInfoLoading">
                  获取用户信息
                </n-button>
                <n-button @click="testLogout">
                  测试登出
                </n-button>
              </n-space>
            </n-form-item>
          </n-form>
        </n-card>

        <!-- 词汇API测试 -->
        <n-card title="词汇API测试" size="small">
          <n-space>
            <n-select
              v-model:value="examType"
              :options="examTypeOptions"
              placeholder="选择考试类型"
              style="width: 150px"
            />
            <n-button @click="testGetVocabulary" :loading="vocabularyLoading">
              获取词汇列表
            </n-button>
            <n-button @click="testGetDailyWords" :loading="dailyWordsLoading">
              获取每日单词
            </n-button>
          </n-space>
        </n-card>

        <!-- 测试结果显示 -->
        <n-card title="测试结果" size="small">
          <n-code :code="testResult" language="json" />
        </n-card>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useMessage } from 'naive-ui'
import { authApi } from '@/api/auth'
import { vocabularyApi } from '@/api/vocabulary'

const message = useMessage()

// 表单数据
const registerForm = reactive({
  username: 'testuser3',
  password: '123456',
  email: 'test3@example.com',
  nickname: '测试用户3'
})

const loginForm = reactive({
  username: 'testuser3',
  password: '123456'
})

// 加载状态
const registerLoading = ref(false)
const loginLoading = ref(false)
const userInfoLoading = ref(false)
const vocabularyLoading = ref(false)
const dailyWordsLoading = ref(false)
const healthLoading = ref(false)
const versionLoading = ref(false)

// 考试类型
const examType = ref('cet4')
const examTypeOptions = [
  { label: 'CET-4', value: 'cet4' },
  { label: 'CET-6', value: 'cet6' },
  { label: '考研', value: 'kaoyan' },
  { label: '托福', value: 'toefl' },
  { label: '雅思', value: 'ielts' }
]

// 测试结果
const testResult = ref('等待测试...')

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 测试健康检查
const testHealthCheck = async () => {
  healthLoading.value = true
  try {
    const response = await fetch('http://localhost:8080/api/health/check')
    const data = await response.json()
    testResult.value = JSON.stringify(data, null, 2)
    message.success('健康检查成功')
  } catch (error) {
    testResult.value = JSON.stringify({ error: error.message }, null, 2)
    message.error('健康检查失败')
  } finally {
    healthLoading.value = false
  }
}

// 测试版本信息
const testVersion = async () => {
  versionLoading.value = true
  try {
    const response = await fetch('http://localhost:8080/api/health/version')
    const data = await response.json()
    testResult.value = JSON.stringify(data, null, 2)
    message.success('获取版本信息成功')
  } catch (error) {
    testResult.value = JSON.stringify({ error: error.message }, null, 2)
    message.error('获取版本信息失败')
  } finally {
    versionLoading.value = false
  }
}

// 测试注册
const testRegister = async () => {
  registerLoading.value = true
  try {
    const response = await authApi.register(registerForm)
    testResult.value = JSON.stringify(response, null, 2)
    message.success('注册测试成功')
  } catch (error) {
    testResult.value = JSON.stringify({ error: error.message }, null, 2)
    message.error('注册测试失败')
  } finally {
    registerLoading.value = false
  }
}

// 测试登录
const testLogin = async () => {
  loginLoading.value = true
  try {
    const response = await authApi.login(loginForm)
    testResult.value = JSON.stringify(response, null, 2)
    message.success('登录测试成功')
    
    // 保存token用于后续测试
    if (response.data && response.data.satoken) {
      localStorage.setItem('satoken', response.data.satoken)
    }
  } catch (error) {
    testResult.value = JSON.stringify({ error: error.message }, null, 2)
    message.error('登录测试失败')
  } finally {
    loginLoading.value = false
  }
}

// 测试获取用户信息
const testGetUserInfo = async () => {
  userInfoLoading.value = true
  try {
    const response = await authApi.getUserInfo()
    testResult.value = JSON.stringify(response, null, 2)
    message.success('获取用户信息成功')
  } catch (error) {
    testResult.value = JSON.stringify({ error: error.message }, null, 2)
    message.error('获取用户信息失败')
  } finally {
    userInfoLoading.value = false
  }
}

// 测试登出
const testLogout = async () => {
  try {
    const response = await authApi.logout()
    testResult.value = JSON.stringify(response, null, 2)
    message.success('登出测试成功')
    localStorage.removeItem('satoken')
  } catch (error) {
    testResult.value = JSON.stringify({ error: error.message }, null, 2)
    message.error('登出测试失败')
  }
}

// 测试获取词汇列表
const testGetVocabulary = async () => {
  vocabularyLoading.value = true
  try {
    const response = await vocabularyApi.getVocabularyList({
      examType: examType.value,
      page: 1,
      pageSize: 10
    })
    testResult.value = JSON.stringify(response, null, 2)
    message.success('获取词汇列表成功')
  } catch (error) {
    testResult.value = JSON.stringify({ error: error.message }, null, 2)
    message.error('获取词汇列表失败')
  } finally {
    vocabularyLoading.value = false
  }
}

// 测试获取每日单词
const testGetDailyWords = async () => {
  dailyWordsLoading.value = true
  try {
    const response = await vocabularyApi.getDailyWords({
      examType: examType.value,
      count: 20
    })
    testResult.value = JSON.stringify(response, null, 2)
    message.success('获取每日单词成功')
  } catch (error) {
    testResult.value = JSON.stringify({ error: error.message }, null, 2)
    message.error('获取每日单词失败')
  } finally {
    dailyWordsLoading.value = false
  }
}
</script>

<style scoped>
.api-test-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-card {
  margin-bottom: 20px;
}
</style>