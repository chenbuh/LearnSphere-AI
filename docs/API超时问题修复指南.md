# API 超时问题修复指南

## 🐛 问题描述

```
AxiosError: timeout of 60000ms exceeded
```

这个错误表示 API 请求在 60 秒后超时。对于 AI 生成类请求，这个时间太短了。

## 🔍 问题分析

### 当前超时配置

| 配置位置 | 当前值 | 说明 |
|---------|--------|------|
| 前端 `request.js` | 120,000ms (120秒) | ✅ 已正确配置 |
| 后端 AI 服务 | 30,000ms (30秒) | ❌ **太短** |
| 后端数据库 | 5,000ms (5秒) | ⚠️ 可能需要调整 |

### 问题根源

**后端 AI 服务超时配置太短**（`application-redis.properties:32`）：
```yaml
resilience4j.timelimiter.instances.aiService.timeout-duration=30s
```

这导致即使前端等待 120 秒，后端在 30 秒后就中断了请求。

---

## ✅ 解决方案

### 方案 1：增加后端 AI 服务超时时间（推荐）

**修改文件**: `backend/src/main/resources/application-redis.properties`

```properties
# 将 AI 服务超时从 30 秒增加到 120 秒
resilience4j.timelimiter.instances.aiService.timeout-duration=120s

# 或者对于更复杂的任务，设置更长的时间
# resilience4j.timelimiter.instances.aiService.timeout-duration=180s
```

**修改文件**: `backend/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    hikari:
      # 连接超时 30 秒
      connection-timeout: 30000
      # 最大连接生命周期 30 分钟
      max-lifetime: 1800000
      # 连接池超时
      poolTimeout: 30000
```

### 方案 2：针对不同接口设置不同超时

**创建配置类**: `backend/src/main/java/com/learnsphere/config/TimeoutConfig.java`

```java
package com.learnsphere.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class TimeoutConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        // 连接超时 10 秒
        factory.setConnectTimeout(10000);
        // 读取超时 120 秒（适用于 AI 生成）
        factory.setReadTimeout(120000);
        return new RestTemplate(factory);
    }
}
```

### 方案 3：添加请求重试机制

**创建配置**: `backend/src/main/resources/application-redis.properties`

```properties
# Resilience4j 重试配置
resilience4j.retry.instances.aiService.max-attempts=3
resilience4j.retry.instances.aiService.wait-duration=1s
resilience4j.retry.instances.aiService.enable-exponential-backoff=true
resilience4j.retry.instances.aiService.exponential-backoff-multiplier=2
```

---

## 🚀 快速修复

### 步骤 1: 更新后端配置

编辑 `backend/src/main/resources/application-redis.properties`：

```properties
# 时间限制器配置 - 增加到 120 秒
resilience4j.timelimiter.instances.aiService.timeout-duration=120s
```

### 步骤 2: 更新数据库超时（可选）

编辑 `backend/src/main/resources/application.yml`：

```yaml
spring:
  datasource:
    hikari:
      connection-timeout: 30000
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 600000
      max-lifetime: 1800000
      connection-timeout: 30000
      # 对于长时间运行的查询
      validation-timeout: 5000
```

### 步骤 3: 重启后端服务

```bash
# 停止后端服务
# 重新启动
cd backend
mvn spring-boot:run
```

---

## 📊 推荐的超时配置

根据不同的操作类型，设置不同的超时时间：

| 操作类型 | 推荐超时 | 说明 |
|---------|---------|------|
| 用户登录/注册 | 10s | 快速响应 |
| 数据查询 | 30s | 一般查询 |
| 单词浏览 | 15s | 简单查询 |
| AI 生成内容 | 120s | 需要等待 AI 响应 |
| 模拟考试 | 180s | 可能需要生成试卷 |
| 语音识别 | 60s | Whisper 处理 |

### 前端配置

保持现有的 120 秒超时即可：
```javascript
// src/utils/request.js
timeout: 120000 // 120 秒
```

### 后端配置

```yaml
# application-redis.properties

# AI 服务超时
resilience4j.timelimiter.instances.aiService.timeout-duration=120s

# 普通服务超时
resilience4j.timelimiter.instances.defaultService.timeout-duration=30s

# 数据库查询超时
spring.datasource.hikari.connection-timeout: 30000
spring.datasource.hikari.validation-timeout: 5000
```

---

## 🧪 测试验证

修复后，测试以下场景：

### 1. AI 生成测试
```javascript
// 测试口语话题生成
const res = await aiApi.generateSpeaking({
    type: 'daily',
    difficulty: 'medium'
})
// 应该在 30-60 秒内完成
```

### 2. 长时间请求测试
```javascript
// 测试模拟试卷生成
const res = await aiApi.startMockExam({
    type: 'ielts',
    modules: ['listening', 'reading', 'writing']
})
// 可能需要 60-120 秒
```

### 3. 超时处理测试
```javascript
// 验证超时错误处理
try {
    const res = await aiApi.generateEssay({ topic: 'test' })
} catch (error) {
    if (error.code === 'ECONNABORTED') {
        console.log('超时处理正常')
    }
}
```

---

## 🔧 调试技巧

### 1. 监控请求时间

```javascript
// 在 axios 拦截器中添加
request.interceptors.request.use(config => {
    config.metadata = { startTime: Date.now() }
    return config
})

request.interceptors.response.use(response => {
    const duration = Date.now() - response.config.metadata.startTime
    console.log(`请求耗时: ${duration}ms`)
    return response
})
```

### 2. 后端日志监控

```java
@Aspect
@Component
@Slf4j
public class ApiTimeLogAspect {

    @Around("@annotation(org.springframework.web.bind.annotation.PostMapping))")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long duration = System.currentTimeMillis() - start;

        log.info("{} 执行耗时: {}ms",
            joinPoint.getSignature().toShortString(), duration);

        if (duration > 30000) {
            log.warn("⚠️ 慢查询: {} 耗时 {}ms",
                joinPoint.getSignature().toShortString(), duration);
        }

        return result;
    }
}
```

### 3. 添加超时警告

在前端添加进度提示：

```javascript
const LOADING_TIMEOUTS = [
    { time: 10000, message: 'AI 正在思考，请稍候...' },
    { time: 30000, message: '生成内容较多，请耐心等待...' },
    { time: 60000, message: '即将完成...' }
]

function showLoadingProgress() {
    let timeoutId
    LOADING_TIMEOUTS.forEach(({ time, message }) => {
        timeoutId = setTimeout(() => {
            message.info(message, { duration: 3000 })
        }, time)
    })
    return () => clearTimeout(timeoutId)
}
```

---

## 📝 预防措施

### 1. 添加请求队列

```javascript
// 避免同时发起多个 AI 请求
const aiRequestQueue = new Map()

async function queueAiRequest(key, requestFn) {
    if (aiRequestQueue.has(key)) {
        message.warning('上一个请求正在处理中...')
        return
    }

    aiRequestQueue.set(key, true)
    try {
        return await requestFn()
    } finally {
        aiRequestQueue.delete(key)
    }
}
```

### 2. 实现请求取消

```javascript
// 允许用户取消长时间请求
const abortController = new AbortController()

async function makeRequest() {
    try {
        const res = await aiApi.generateSomething({
            signal: abortController.signal
        })
    } catch (error) {
        if (error.name === 'AbortError') {
            message.info('请求已取消')
        }
    }
}

// 用户点击取消按钮
function cancelRequest() {
    abortController.abort()
}
```

### 3. 添加重试逻辑

```javascript
async function retryRequest(requestFn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await requestFn()
        } catch (error) {
            if (i === maxRetries - 1) throw error
            if (error.code === 'ECONNABORTED') {
                message.warning(`请求超时，正在重试 (${i + 1}/${maxRetries})...`)
                await new Promise(resolve => setTimeout(resolve, 2000))
            }
        }
    }
}
```

---

## 📞 需要帮助？

如果问题仍然存在：

1. **检查后端日志**：查看是否有错误信息
2. **检查网络连接**：确保能访问后端 API
3. **检查 AI 服务**：确认 AI API 密钥有效
4. **增加超时时间**：如果 AI 服务响应较慢，可以进一步增加超时

---

**最后更新**: 2026-02-24
**版本**: 1.0
