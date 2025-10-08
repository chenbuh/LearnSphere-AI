<template>
  <div class="debug-container">
    <n-card title="🔧 后端调试测试" class="debug-card">
      <n-space vertical size="large">
        
        <!-- 连接测试 -->
        <n-card title="连接测试" size="small">
          <n-space>
            <n-button type="primary" @click="testPing" :loading="pingLoading">
              Ping测试
            </n-button>
            <n-button @click="testStatus" :loading="statusLoading">
              系统状态
            </n-button>
            <n-button @click="testOriginalHealth" :loading="healthLoading">
              原始健康检查
            </n-button>
          </n-space>
          <n-divider />
          <div class="status-info">
            <n-tag :type="connectionStatus.type">
              {{ connectionStatus.text }}
            </n-tag>
          </div>
        </n-card>

        <!-- 手动测试 -->
        <n-card title="手动测试" size="small">
          <n-form inline>
            <n-form-item label="接口地址">
              <n-input 
                v-model:value="customUrl" 
                placeholder="输入完整URL"
                style="width: 300px"
              />
            </n-form-item>
            <n-form-item label="请求方法">
              <n-select 
                v-model:value="customMethod" 
                :options="methodOptions"
                style="width: 100px"
              />
            </n-form-item>
            <n-form-item>
              <n-button @click="testCustom" :loading="customLoading">
                测试
              </n-button>
            </n-form-item>
          </n-form>
        </n-card>

        <!-- 结果显示 -->
        <n-card title="测试结果" size="small">
          <n-tabs>
            <n-tab-pane name="result" tab="响应结果">
              <n-code :code="testResult" language="json" />
            </n-tab-pane>
            <n-tab-pane name="logs" tab="测试日志">
              <div class="logs-container">
                <div v-for="(log, index) in testLogs" :key="index" class="log-item">
                  <n-tag :type="log.type" size="small">{{ log.time }}</n-tag>
                  <span class="log-message">{{ log.message }}</span>
                </div>
              </div>
            </n-tab-pane>
          </n-tabs>
        </n-card>

        <!-- 调试建议 -->
        <n-card title="调试建议" size="small">
          <n-alert v-if="debugSuggestions.length > 0" type="info">
            <ul>
              <li v-for="suggestion in debugSuggestions" :key="suggestion">
                {{ suggestion }}
              </li>
            </ul>
          </n-alert>
          <div v-else>
            <n-text depth="3">运行测试后会显示调试建议</n-text>
          </div>
        </n-card>

      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useMessage } from 'naive-ui'

const message = useMessage()

// 加载状态
const pingLoading = ref(false)
const statusLoading = ref(false)
const healthLoading = ref(false)
const customLoading = ref(false)

// 连接状态
const connectionStatus = reactive({
  type: 'default',
  text: '未测试'
})

// 自定义测试
const customUrl = ref('http://localhost:8080/api/diagnostic/ping')
const customMethod = ref('GET')
const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' }
]

// 测试结果和日志
const testResult = ref('等待测试...')
const testLogs = ref([])
const debugSuggestions = ref([])

// 添加日志
const addLog = (message, type = 'info') => {
  testLogs.value.unshift({
    time: new Date().toLocaleTimeString(),
    message,
    type
  })
  if (testLogs.value.length > 50) {
    testLogs.value = testLogs.value.slice(0, 50)
  }
}

// 更新调试建议
const updateSuggestions = (error) => {
  debugSuggestions.value = []
  
  if (error.includes('网络')) {
    debugSuggestions.value.push('检查后端服务是否启动（IDEA中运行LearnSphereApplication）')
    debugSuggestions.value.push('确认端口8080没有被其他程序占用')
    debugSuggestions.value.push('检查防火墙设置')
  }
  
  if (error.includes('500')) {
    debugSuggestions.value.push('查看IDEA控制台的详细错误日志')
    debugSuggestions.value.push('检查数据库连接配置')
    debugSuggestions.value.push('尝试使用DebugApplication启动（排除数据库依赖）')
  }
  
  if (error.includes('404')) {
    debugSuggestions.value.push('检查接口路径是否正确')
    debugSuggestions.value.push('确认控制器是否正确注册')
  }
}

// Ping测试
const testPing = async () => {
  pingLoading.value = true
  addLog('开始Ping测试...')
  
  try {
    const response = await fetch('http://localhost:8080/api/diagnostic/ping', {
      method: 'GET',
      timeout: 5000
    })
    
    if (response.ok) {
      const text = await response.text()
      testResult.value = JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        data: text
      }, null, 2)
      
      connectionStatus.type = 'success'
      connectionStatus.text = '连接正常'
      addLog('Ping测试成功', 'success')
      message.success('后端连接正常')
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    testResult.value = JSON.stringify({ error: error.message }, null, 2)
    connectionStatus.type = 'error'
    connectionStatus.text = '连接失败'
    addLog(`Ping测试失败: ${error.message}`, 'error')
    updateSuggestions(error.message)
    message.error('后端连接失败')
  } finally {
    pingLoading.value = false
  }
}

// 系统状态测试
const testStatus = async () => {
  statusLoading.value = true
  addLog('检查系统状态...')
  
  try {
    const response = await fetch('http://localhost:8080/api/diagnostic/status')
    const data = await response.json()
    
    testResult.value = JSON.stringify(data, null, 2)
    addLog('系统状态检查完成', 'success')
    message.success('系统状态获取成功')
  } catch (error) {
    testResult.value = JSON.stringify({ error: error.message }, null, 2)
    addLog(`系统状态检查失败: ${error.message}`, 'error')
    updateSuggestions(error.message)
    message.error('系统状态检查失败')
  } finally {
    statusLoading.value = false
  }
}

// 原始健康检查测试
const testOriginalHealth = async () => {
  healthLoading.value = true
  addLog('测试原始健康检查接口...')
  
  try {
    const response = await fetch('http://localhost:8080/api/health/check')
    const data = await response.json()
    
    testResult.value = JSON.stringify(data, null, 2)
    addLog('原始健康检查完成', 'success')
    message.success('健康检查成功')
  } catch (error) {
    testResult.value = JSON.stringify({ error: error.message }, null, 2)
    addLog(`健康检查失败: ${error.message}`, 'error')
    updateSuggestions(error.message)
    message.error('健康检查失败')
  } finally {
    healthLoading.value = false
  }
}

// 自定义测试
const testCustom = async () => {
  if (!customUrl.value) {
    message.warning('请输入测试URL')
    return
  }
  
  customLoading.value = true
  addLog(`自定义测试: ${customMethod.value} ${customUrl.value}`)
  
  try {
    const response = await fetch(customUrl.value, {
      method: customMethod.value
    })
    
    let data
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }
    
    testResult.value = JSON.stringify({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: data
    }, null, 2)
    
    addLog('自定义测试完成', 'success')
    message.success('测试完成')
  } catch (error) {
    testResult.value = JSON.stringify({ error: error.message }, null, 2)
    addLog(`自定义测试失败: ${error.message}`, 'error')
    updateSuggestions(error.message)
    message.error('测试失败')
  } finally {
    customLoading.value = false
  }
}
</script>

<style scoped>
.debug-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.debug-card {
  margin-bottom: 20px;
}

.status-info {
  margin-top: 10px;
}

.logs-container {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.log-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-family: monospace;
  font-size: 12px;
}

.log-message {
  margin-left: 10px;
}
</style>