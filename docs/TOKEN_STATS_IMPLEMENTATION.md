# Token 统计功能实现 - 完整版

## 实现概述
现在系统已经完整实现了 AI Token 使用量的自动记录和统计功能。每次调用 AI 服务时,系统会自动记录输入、输出和总 token 数量,并在管理后台展示详细的统计信息。

## 完成的工作

### 1. 数据库层面 ✅

#### 1.1 表结构更新
- **新增字段**:
  - `input_tokens` INT - 输入 token 数量
  - `output_tokens` INT - 输出 token 数量
  - `total_tokens` INT - 总 token 数量

#### 1.2 迁移脚本
- 文件: `migration_add_token_stats.sql`
- 自动迁移: `DatabaseInitializer.java` 会在应用启动时自动添加字段

### 2. 实体层面 ✅

#### 2.1 AIGenerationLog 实体
- 文件: `backend/src/main/java/com/learnsphere/entity/AIGenerationLog.java`
- 添加了三个 token 相关属性:
  ```java
  private Integer inputTokens;
  private Integer outputTokens;
  private Integer totalTokens;
  ```

### 3. 服务层面 ✅

#### 3.1 更新日志服务接口
- 文件: `IAIGenerationLogService.java`
- 更新方法签名,添加 token 参数:
  ```java
  void log(Long userId, String action, String model, String prompt, 
           String status, String error, Long durationMs,
           Integer inputTokens, Integer outputTokens, Integer totalTokens);
  ```

#### 3.2 更新日志服务实现
- 文件: `AIGenerationLogServiceImpl.java`
- 在 `log()` 方法中保存 token 使用信息到数据库

#### 3.3 更新 AI 生成服务
- 文件: `AIGenerationServiceImpl.java`
- 在 `callLLM()` 方法中:
  1. 从通义千问 API 响应中提取 token 使用信息
  2. 将 token 数据传递给日志服务

**核心代码片段**:
```java
GenerationResult result = gen.call(param);

// 提取 token 使用信息
try {
    if (result.getUsage() != null) {
        inputTokens = result.getUsage().getInputTokens();
        outputTokens = result.getUsage().getOutputTokens();
        
        if (inputTokens != null && outputTokens != null) {
            totalTokens = inputTokens + outputTokens;
        }
    }
} catch (Exception e) {
    log.warn("提取 token 使用信息失败: {}", e.getMessage());
}
```

### 4. 控制器层面 ✅

#### 4.1 更新统计 API
- 文件: `AdminController.java`
- 方法: `getAIStats()`
- 新增返回数据:
  - `totalTokens` - 历史总 token 消耗
  - `avgTokens` - 平均每次调用的 token 数量
  - `tokens24h` - 最近24小时的 token 消耗

### 5. 前端展示层面 ✅

#### 5.1 AI 治理面板
- 文件: `admin-vue/src/views/AIGovernance.vue`
- 新增功能:
  1. 导入 `Coins` 图标
  2. 初始化 token 相关数据字段
  3. 添加三个 Token 统计卡片
  4. 添加金色主题样式

#### 5.2 视觉效果
- Token 卡片采用金色渐变边框: `rgba(251, 191, 36, 0.15)`
- 使用 `Coins` 图标
- 支持数字滚动动画
- 响应式布局

## 工作原理

### 数据流程
```
1. 用户触发 AI 功能（如生成阅读理解）
   ↓
2. AIGenerationServiceImpl.callLLM() 被调用
   ↓
3. 调用通义千问 API
   ↓
4. API 返回 GenerationResult（包含 usage 信息）
   ↓
5. 提取 inputTokens, outputTokens, totalTokens
   ↓
6. 保存到 ai_generation_log 表
   ↓
7. AdminController.getAIStats() 统计数据
   ↓
8. 前端 AIGovernance.vue 展示统计结果
```

### Token 提取逻辑
通义千问 API 的响应结构:
```java
GenerationResult {
    usage: {
        inputTokens: 123,    // 输入 token 数
        outputTokens: 456,   // 输出 token 数
        totalTokens: 579     // 可能不提供,我们自己计算
    },
    output: {...}
}
```

## 如何运行

### 步骤 1: 数据库迁移
如果是现有系统,执行迁移脚本:
```bash
mysql -u your_username -p your_database < migration_add_token_stats.sql
```

**或者** 重启应用,`DatabaseInitializer` 会自动添加字段。

### 步骤 2: 重新编译后端
```bash
cd backend
mvn clean compile
```

### 步骤 3: 重启后端服务
```bash
mvn spring-boot:run
```

### 步骤 4: 刷新前端
如果前端已经在运行,刷新浏览器即可看到新的 Token 统计卡片。

## 验证效果

### 1. 触发 AI 调用
在前端执行任意 AI 功能,例如:
- 生成阅读理解
- AI 口语练习
- 写作评估

### 2. 查看日志
查看后端日志,应该看到:
```
提取 token 使用信息成功
```

没有看到警告信息 "提取 token 使用信息失败"

### 3. 查看数据库
检查 `ai_generation_log` 表:
```sql
SELECT id, action_type, input_tokens, output_tokens, total_tokens 
FROM ai_generation_log 
ORDER BY create_time DESC 
LIMIT 10;
```

应该看到 token 字段有具体数值(而不是 0)

### 4. 查看管理后台
访问管理后台的 "AI 治理" -> "全景监控" 页面,应该看到:
- **总 Token 消耗**: 显示累计的 token 数量
- **24h Token 消耗**: 显示最近24小时的消耗
- **平均 Tokens**: 显示每次调用的平均值

## 已知问题和限制

### 1. 历史数据
现有的历史记录中 token 字段会是 0,只有新的 AI 调用才会有准确的 token 数据。

### 2. API 兼容性
Token 提取依赖于通义千问 API 的 `getUsage()` 方法。如果 API 版本不同或返回结构变化,可能需要调整提取逻辑。

### 3. 降级处理
如果提取 token 失败,系统会记录警告日志但不会中断业务流程,token 字段会保存为 `null` 或 `0`。

## 扩展建议

### 1. Token 成本计算
可以根据不同模型的定价,计算实际成本:
```java
// 通义千问定价示例 (需要根据实际调整)
double cost = (inputTokens * 0.0002 + outputTokens * 0.0002) / 1000;
```

### 2. 预算告警
当 token 消耗超过预设阈值时,发送告警通知:
```java
if (tokens24h > BUDGET_THRESHOLD) {
    sendAlert("Token usage exceeded budget!");
}
```

### 3. 用户级别统计
除了全局统计,还可以按用户统计 token 使用:
```sql
SELECT user_id, SUM(total_tokens) as user_tokens
FROM ai_generation_log
GROUP BY user_id
ORDER BY user_tokens DESC;
```

### 4. 趋势分析
记录每日 token 消耗,绘制趋势图表,帮助优化 AI 使用策略。

## 总结

✅ **数据库**: 增加 token 字段
✅ **实体类**: 添加 token 属性
✅ **服务层**: 提取并保存 token 数据
✅ **API**: 返回 token 统计
✅ **前端**: 展示 token 使用情况

现在系统已经具备完整的 Token 使用量监控能力,管理员可以实时了解 AI 服务的资源消耗情况!🎉
