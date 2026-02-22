# 用户操作日志功能使用指南

## 📋 功能概述

用户操作日志功能可以实时记录和监控用户的所有操作行为，包括：
- ✅ 用户真实IP地址
- ✅ IP地理位置（国家、省份、城市）
- ✅ 浏览器类型和版本
- ✅ 操作系统信息
- ✅ 设备类型（桌面/移动/平板）
- ✅ 操作模块和类型
- ✅ 请求URL和方法
- ✅ 操作状态（成功/失败）

---

## 🎯 功能特点

### 1. **自动记录**
所有用户操作都会自动异步记录，不影响主业务性能。

### 2. **详细信息**
记录完整的用户环境信息，包括：
- IP地址及地理位置
- 浏览器和操作系统
- 设备类型识别

### 3. **数据可视化**
提供丰富的图表统计：
- 操作类型分布（饼图）
- 地区分布 TOP 10（柱状图）
- 设备类型占比
- 实时统计卡片

### 4. **高级筛选**
支持多维度筛选：
- 用户名
- 操作模块
- 操作类型
- IP地址
- 操作状态

---

## 🚀 快速开始

### 后端集成

#### 1. 在 Controller 中记录日志

```java
@RestController
@RequestMapping("/api/reading")
public class ReadingController {

    @Autowired
    private IUserLogService userLogService;

    @PostMapping("/submit")
    public Result<?> submitReading(
        @RequestBody SubmitRequest req,
        HttpServletRequest request
    ) {
        // 获取当前用户
        User user = getCurrentUser();
        
        try {
            // 业务逻辑
            readingService.submit(req);
            
            // 记录成功日志
            userLogService.logSuccess(
                user.getId(),
                user.getUsername(),
                "reading",              // 模块
                "submit",               // 操作类型
                "提交阅读练习",          // 详情
                request
            );
            
            return Result.success();
        } catch (Exception e) {
            // 记录失败日志
            userLogService.logFail(
                user.getId(),
                user.getUsername(),
                "reading",
                "submit",
                "提交阅读练习",
                e.getMessage(),         // 错误信息
                request
            );
            
            return Result.error("提交失败");
        }
    }
}
```

#### 2. 异步记录（推荐）

日志服务已使用 `@Async` 注解，自动异步执行，不会阻塞主业务。

---

## 📊 管理后台使用

### 访问路径
```
http://localhost:5173/admin/user-logs
```

### 功能说明

#### 1. **实时统计**
顶部显示四个统计卡片：
- 总日志数
- 独立IP数
- 活跃用户数
- 移动端占比

#### 2. **数据可视化**
- **操作类型分布**：以饼图展示不同操作的占比
- **地区分布 TOP 10**：以柱状图展示访问量最高的地区

#### 3. **日志列表**
表格展示所有日志记录，包含：
- 用户信息
- 操作模块和类型
- IP地址和地理位置
- 设备和浏览器信息
- 操作状态
- 操作时间

#### 4. **筛选功能**
支持按以下条件筛选：
- 用户名（模糊搜索）
- 操作模块（下拉选择）
- 操作类型（下拉选择）
- IP地址（模糊搜索）
- 操作状态（成功/失败）

#### 5. **查看详情**
点击每行的"详情"按钮，可查看完整的日志信息。

#### 6. **批量操作**
- 刷新：重新加载数据
- 清空日志：删除所有日志记录（需确认）

---

## 🔧 扩展配置

### 1. IP地理位置解析

默认使用简单的本地判断，生产环境建议集成第三方IP数据库：

**推荐方案：**
- **ip2region**：离线IP数据库，快速准确
- **高德API**：提供详细的地理位置信息
- **淘宝IP库**：免费但有限流

**集成示例（ip2region）：**

```java
// 1. 添加依赖
<dependency>
    <groupId>org.lionsoul</groupId>
    <artifactId>ip2region</artifactId>
    <version>2.7.0</version>
</dependency>

// 2. 更新 IpUtils.java
public static IpLocation getIpLocation(String ip) {
    try {
        DbSearcher searcher = new DbSearcher(new DbConfig(), "data/ip2region.xdb");
        String region = searcher.search(ip);
        
        // 解析结果：中国|0|北京|北京市|联通
        String[] parts = region.split("\\|");
        
        IpLocation location = new IpLocation();
        location.setCountry(parts[0]);
        location.setProvince(parts[2]);
        location.setCity(parts[3]);
        
        return location;
    } catch (Exception e) {
        log.error("IP解析失败", e);
        return getDefaultLocation();
    }
}
```

### 2. 自定义操作模块

在 `UserLogs.vue` 中修改 `moduleOptions`：

```javascript
const moduleOptions = [
  { label: '阅读', value: 'reading' },
  { label: '听力', value: 'listening' },
  { label: '写作', value: 'writing' },
  { label: '口语', value: 'speaking' },
  // 添加自定义模块
  { label: '我的模块', value: 'my_module' }
]
```

### 3. 日志保留策略

建议定期清理旧日志，可以创建定时任务：

```java
@Scheduled(cron = "0 0 2 * * ?") // 每天凌晨2点执行
public void cleanOldLogs() {
    LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
    
    LambdaQueryWrapper<UserLog> wrapper = new LambdaQueryWrapper<>();
    wrapper.lt(UserLog::getCreateTime, thirtyDaysAgo);
    
    userLogService.remove(wrapper);
    log.info("清理30天前的日志完成");
}
```

---

## 📈 性能优化建议

### 1. 数据库索引
已在建表SQL中添加必要索引：
- `idx_user_id`
- `idx_username`
- `idx_module`
- `idx_action`
- `idx_ip`
- `idx_create_time`

### 2. 异步记录
日志记录使用 `@Async` 异步执行，不影响主业务性能。

### 3. 批量写入
高并发场景下，可考虑使用消息队列批量写入：

```java
@Service
public class UserLogQueueService {
    
    private BlockingQueue<UserLog> logQueue = new LinkedBlockingQueue<>(10000);
    
    @PostConstruct
    public void init() {
        // 启动消费线程
        new Thread(() -> {
            List<UserLog> batch = new ArrayList<>();
            while (true) {
                try {
                    UserLog log = logQueue.poll(1, TimeUnit.SECONDS);
                    if (log != null) {
                        batch.add(log);
                    }
                    
                    // 批量保存
                    if (batch.size() >= 100 || (batch.size() > 0 && log == null)) {
                        userLogService.saveBatch(batch);
                        batch.clear();
                    }
                } catch (Exception e) {
                    log.error("批量保存日志失败", e);
                }
            }
        }).start();
    }
    
    public void addLog(UserLog userLog) {
        logQueue.offer(userLog);
    }
}
```

---

## 🎨 前端自定义

### 修改统计卡片颜色

在 `UserLogs.vue` 中修改 `.stat-icon` 的渐变色：

```vue
<div class="stat-icon" style="background: linear-gradient(135deg, #YOUR_COLOR1, #YOUR_COLOR2);">
```

### 添加新的图表

```javascript
// 在 renderCharts 方法中添加
const newChart = echarts.init(newChartRef.value)
newChart.setOption({
  // 图表配置
})
```

---

## 🔐 安全建议

### 1. 敏感信息脱敏
对于敏感操作，建议脱敏处理：

```java
String details = "用户修改密码";
// 不要记录：details = "用户修改密码：从 oldPwd 到 newPwd"
```

### 2. 权限控制
确保只有管理员可以访问日志：

```java
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/list")
public Result<Page<UserLog>> getUserLogs(...) {
    // ...
}
```

### 3. IP白名单
可以添加IP白名单过滤：

```java
private static final Set<String> IP_WHITELIST = Set.of(
    "127.0.0.1",
    "192.168.1.100"
);

if (IP_WHITELIST.contains(ip)) {
    return; // 不记录白名单IP
}
```

---

## 📞 技术支持

如有问题，请联系技术团队或查看项目文档。

---

## 📝 更新日志

### v1.0.0 (2026-01-29)
- ✅ 初始版本发布
- ✅ 支持IP地址记录和地理位置解析
- ✅ 支持浏览器和设备识别
- ✅ 提供完整的管理后台界面
- ✅ 数据可视化图表
- ✅ 高级筛选和搜索功能
