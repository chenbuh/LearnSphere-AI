# API 超时问题 - 快速修复

## ✅ 已修复

### 问题
```
AxiosError: timeout of 60000ms exceeded
```

### 根本原因
后端 AI 服务超时配置太短（30秒），而 AI 生成请求通常需要 60-120 秒。

### 修复内容

#### 1. 后端 AI 服务超时
**文件**: `backend/src/main/resources/application-redis.properties`

```diff
- resilience4j.timelimiter.instances.aiService.timeout-duration=30s
+ resilience4j.timelimiter.instances.aiService.timeout-duration=120s
```

#### 2. Redis 超时
**文件**: `backend/src/main/resources/application.yml`

```diff
- timeout: 5000
+ timeout: 10000
```

---

## 🔄 重启后端服务

修复后需要重启后端服务才能生效：

```bash
# 停止当前运行的后端服务
# 然后重新启动
cd backend
mvn spring-boot:run
```

---

## 📊 新的超时配置

| 组件 | 超时时间 | 说明 |
|------|---------|------|
| 前端请求 | 120秒 | 已配置 |
| 后端 AI 服务 | 120秒 | ✅ 已修复 |
| Redis | 10秒 | ✅ 已修复 |
| 数据库 | 5秒 | 一般查询 |

---

## 🧪 验证

重启后端后，测试 AI 生成功能：

1. **口语话题生成** - 应在 30-60 秒内完成
2. **模拟试卷生成** - 可能需要 60-120 秒
3. **AI 对话** - 应在 10-30 秒内完成

如果仍然超时，请检查：
- AI API 密钥是否有效
- 网络连接是否正常
- 后端日志是否有错误

---

**修复时间**: 2026-02-24
