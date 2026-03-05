<template>
  <div class="integration-test">
    <n-card title="🔗 前后端集成测试" class="test-card">
      <n-space vertical size="large">
        
        <!-- 登录测试 -->
        <n-card title="1. 用户登录测试" size="small">
          <n-space vertical>
            <n-input v-model:value="loginForm.username" placeholder="用户名" />
            <n-input v-model:value="loginForm.password" type="password" placeholder="密码" />
            <n-button type="primary" @click="testLogin" :loading="loading.login">
              测试登录
            </n-button>
            <n-alert v-if="results.login" :type="results.login.success ? 'success' : 'error'">
              {{ results.login.message }}
            </n-alert>
          </n-space>
        </n-card>

        <!-- 词汇API测试 -->
        <n-card title="2. 词汇API测试" size="small">
          <n-space>
            <n-button @click="testVocabularyList" :loading="loading.vocabulary">
              测试词汇列表
            </n-button>
            <n-button @click="testDailyWords" :loading="loading.daily">
              测试每日单词
            </n-button>
          </n-space>
          <n-divider />
          <n-alert v-if="results.vocabulary" :type="results.vocabulary.success ? 'success' : 'error'">
            {{ results.vocabulary.message }}
          </n-alert>
        </n-card>

        <!-- 学习记录测试 -->
        <n-card title="3. 学习记录测试" size="small">
          <n-space>
            <n-button @click="testCreateRecord" :loading="loading.record">
              创建学习记录
            </n-button>
            <n-button @click="testGetStatistics" :loading="loading.statistics">
              获取学习统计
            </n-button>
          </n-space>
          <n-divider />
          <n-alert v-if="results.learning" :type="results.learning.success ? 'success' : 'error'">
            {{ results.learning.message }}
          </n-alert>
        </n-card>

        <!-- 测试结果汇总 -->
        <n-card title="测试结果汇总" size="small">
          <n-space vertical>
            <div v-for="(result, key) in results" :key="key">
              <n-tag :type="result.success ? 'success' : 'error'">
                {{ key }}: {{ result.success ? '✅ 通过' : '❌ 失败' }}
              </n-tag>
            </div>
          </n-space>
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
import { learningApi } from '@/api/learning'

const message = useMessage()

const loginForm = reactive({
  username: '',
  password: ''
})

const loading = reactive({
  login: false,
  vocabulary: false,
  daily: false,
  record: false,
  statistics: false
})

const results = reactive({})

// 测试登录
const testLogin = async () => {
  loading.login = true
  try {
    const response = await authApi.login(loginForm)
    results.login = {
      success: true,
      message: `登录成功！Token: ${response.data.satoken.substring(0, 20)}...`
    }
    localStorage.setItem('satoken', response.data.satoken)
    message.success('登录成功')
  } catch (error) {
    results.login = {
      success: false,
      message: `登录失败: ${error.message}`
    }
  } finally {
    loading.login = false
  }
}

// 测试词汇列表
const testVocabularyList = async () => {
  loading.vocabulary = true
  try {
    const response = await vocabularyApi.getVocabularyList({
      examType: 'cet4',
      page: 1,
      pageSize: 10
    })
    results.vocabulary = {
      success: true,
      message: `获取成功！共 ${response.data.total} 个词汇，当前页 ${response.data.records.length} 个`
    }
    message.success('词汇列表获取成功')
  } catch (error) {
    results.vocabulary = {
      success: false,
      message: `获取失败: ${error.message}`
    }
  } finally {
    loading.vocabulary = false
  }
}

// 测试每日单词
const testDailyWords = async () => {
  loading.daily = true
  try {
    const response = await vocabularyApi.getDailyWords({
      examType: 'cet4',
      count: 5
    })
    results.vocabulary = {
      success: true,
      message: `获取成功！每日单词 ${response.data.records.length} 个`
    }
    message.success('每日单词获取成功')
  } catch (error) {
    results.vocabulary = {
      success: false,
      message: `获取失败: ${error.message}`
    }
  } finally {
    loading.daily = false
  }
}

// 测试创建学习记录
const testCreateRecord = async () => {
  loading.record = true
  try {
    await learningApi.createRecord({
      contentId: 1,
      contentType: 'vocabulary',
      isCorrect: 1,
      timeSpent: 30,
      score: 100,
      answer: 'test',
      correctAnswer: 'test',
      masteryLevel: 3
    })
    results.learning = {
      success: true,
      message: '学习记录创建成功！'
    }
    message.success('学习记录创建成功')
  } catch (error) {
    results.learning = {
      success: false,
      message: `创建失败: ${error.message}`
    }
  } finally {
    loading.record = false
  }
}

// 测试获取统计
const testGetStatistics = async () => {
  loading.statistics = true
  try {
    const response = await learningApi.getStatistics()
    results.learning = {
      success: true,
      message: `统计获取成功！总记录: ${response.data.overall.totalCount || 0}`
    }
    message.success('学习统计获取成功')
  } catch (error) {
    results.learning = {
      success: false,
      message: `获取失败: ${error.message}`
    }
  } finally {
    loading.statistics = false
  }
}
</script>

<style scoped>
.integration-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-card {
  margin-bottom: 20px;
}
</style>
