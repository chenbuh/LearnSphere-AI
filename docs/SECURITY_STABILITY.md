# Security & Stability Defense System (Level 3 - AI Intelligence)

本项目已实施全方位的安全与稳定性防御机制，并升级至 AI 智能化防御阶段。

## 1. 稳定性防御 (Stability & Resilience - Resilience+)

### 1.1 三层垂直容错架构 (Tiered Resilience)
系统通过 **Resilience4j** 构建了针对 AI 服务的深度防御体系：
- **重试机制 (Retry)**：针对 AI 接口偶发性的网络抖动或上游抖动，系统会自动进行 **指数退避重试** (默认 3 次，2s -> 4s -> 8s)，极大提升了长文本生成任务的最终成功率。
- **舱壁隔离 (Bulkhead)**：
  - **fastTask 隔离区**：为智能对话、语法纠错等轻量级任务分配独立并发配额，确保基础教学功能不被耗时任务阻塞。
  - **slowTask 隔离区**：严格限制长文生成、深度报告分析等高耗时任务的并行数，保护后端核心线程资源。
- **智能熔断 (Circuit Breaker)**：实时监控 AI 接口失败率，异常占比超 50% 时自动开启熔断，进入“自我包含”模式，防止发生雪崩效应。

### 1.2 模型故障对冲 (Failover Strategy)
为了实现 **“永不宕机”** 的学习体验，系统引入了模型级的故障转移机制：
- **容灾自动切换**：当主模型（如 `qwen-plus`）调用触发熔断或异常时，逻辑层会自动捕获异常并即时对冲请求至备用备选模型（如 `qwen-turbo`）。
- **无感补偿**：切换过程由后端静默完成，并在日志中自动标记“Failover Resolved”，确保用户学习流不中断。

### 1.3 观测性与监控 (Observability)
- **非阻塞组件**：AI 调用记录与稳定性指标采用 `@Async` 异步处理，保障核心请求链路的超低延迟。
- **健康度指标集**：P95/P99 响应延迟分布、各隔离区并发利用率、重试成功率统计。

## 2. 安全防护 (Security & Compliance)

### 2.1 高性能敏感词过滤 (Content Security)
- **DFA 算法实现**：引入了基于 **Deterministic Finite Automaton (DFA)** 算法的 `SensitiveWordUtil`，在大数据量下依然保持 $O(n)$ 时间复杂度。
- **智能风险画像 (Security Risk Profiling)**：
  - **违规累积计数**：利用 Redis 实时追踪用户的敏感词触发频次。
  - **分级处置**：根据用户 24 小时内的违规次数（如达到 10 次）自动提升安全等级要求，限制部分敏感功能。
  - **自动化风险解除 (Self-Service Unlock)**：引入 **MFA (多因子认证)** 校验流程。被判为高风险的用户，若已绑定 Google Authenticator 等 MFA 设备，可通过输入 6 位验证码自助清空违规计数，实现错杀后的快速恢复，无需联系管理员。
- **动态词库管理**：敏感词存储在 `sensitive_word` 表中，支持动态加载。

### 2.2 多维隐私脱敏 (Data Masking & PII Protection)
- **PII 识别引擎**：引入 `DataMaskUtil`，利用正则表达式与算法自动识别提问内容中的**手机号、身份证、邮箱**。
- **全链路脱敏**：在 AI 调用日志（System Prompt / User Prompt）入库前，自动对隐私信息进行模糊化处理（如 `138****0000`），确保数据库日志符合隐私合规要求，且管理后台可见但不可读全。

### 2.2 多维限流保护 (Rate Limiting)
- **多级限流规则**：
  - **IP 级防爬虫**：`AntiCrawlerInterceptor` 对全局异常 IP 进行 10 分钟封禁。
  - **用户级限流**：针对高成本的 AI 接口，实施 60 秒内固定次数的精确限流（通过 Redis 原子计数实现）。
  - **接口差异化定制**：生成类接口（昂贵/缓慢）与查询类接口（便宜/快速）拥有独立的限流阈值。

### 2.3 内容加固 (Payload Security)
- **动态混淆加密**：`ContentSecurityUtil` 采用 XOR 异或算法与按天变换的动态密钥，对返回给前端的解析内容（analysis）、参考答案（correct_answer）进行流式模糊，有效防范基础爬虫的“无偿抓取”。

## 3. 成本与效能优化 (Cost Control & Efficiency)

系统实施了全方位的 AI 成本管控方案，在保障功能的同时极大降低了 API 消耗：

### 3.1 战略性结果缓存 (Strategic AI Caching)
- **分析/纠错类缓存**：针对语法纠错、错题分析、单词释义等**幂等性**任务，系统采用 Redis 缓存（TTL 24h）。通过对 `(Model + SystemPrompt + UserPrompt)` 进行 MD5 哈希作为 Key，相同请求直接命中缓存，**Token 消耗降为 0**。
- **对话上下文缓存**：AI 助教对话过程中，针对相同的上下文历史，系统会自动命中 2 小时内的缓存，提升响应速度并降低重复计算成本。

### 3.2 阶梯式配额管理 (Tiered Quota System)
- **精准计量**：利用 `VipCheckAspect` 对每个 AI 接口实施精细化配额扣费。
- **差异化成本配置**：通过 `system_config` 动态配置不同功能的配额消耗（如单次写作批改消耗 5 点，单词查询消耗 1 点），实现资源的优先级分配。
- **VIP 配额池**：普通用户拥有基础免费额度，VIP 用户根据等级（月/季/年）拥有 50-200 不等的每日高阶配额。

### 3.3 模型能效调度 (Model Routing Optimization)
- **快慢任务分流**：
  - **轻量任务 (Fast Path)**：语法检测、短句翻译等默认路由至 `qwen-turbo` 或同档次高速模型。
  - **深度任务 (Deep Path)**：长文生成、深度报告路由至 `qwen-plus`。
- **故障降级与对冲**：在主模型不可用时，系统自动对冲至备用模型，确保服务可用性的同时，避免了因重试失败导致的成本浪费。

## 4. 配置参考
- **熔断配置见**：`CircuitBreakerConfiguration.java`
- **缓存工具见**：`CacheUtil.java`
- **配额切面见**：`VipCheckAspect.java`
- **风控行为见**：`SecurityController.java`
