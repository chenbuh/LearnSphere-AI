# Grafana 看板说明

> **本文已被正式资产取代。** 看板不再需要手写，直接导入
> [grafana-dashboard-template.json](grafana-dashboard-template.json) 即可（18 个面板）。
>
> 导入步骤、变量绑定、No data 排查见
> [监控与告警运维手册](../部署运维/监控与告警运维手册.md)。
>
> 指标口径与 PromQL 速查见 [观测链路实施.md](观测链路实施.md)。

本文保留的是看板**设计说明**，用来说明为什么这样分面板——改看板时先看这里，
避免把有用的面板删掉或重复添加。

---

## 一、面板分层

看板按「先判断有没有事，再定位是谁的事」分三层，从上到下：

### 第一层：总览（y=0~5）

四个 stat 面板，一眼判断服务整体状态。

| 面板 | 回答的问题 |
|---|---|
| 服务可用性 | 服务活着吗 |
| HTTP P95 响应时间 | 用户感觉慢吗 |
| AI 失败率 | AI 功能正常吗 |
| AI 日成本 | 今天烧了多少钱 |

这一层是**每天巡检看的**。四个都是绿色就可以关掉页面。

### 第二层：排障（y=22~51）

告警响了之后看这里，定位具体是哪个环节。

| 面板 | 定位什么问题 |
|---|---|
| HTTP 5xx 错误率 | 服务端在报错吗 |
| HTTP 5xx 错误明细 | 是哪个接口在报错 |
| 数据库连接池（HikariCP） | 连接够不够用 |
| 数据库连接获取耗时 | 数据库响应变慢了吗 |
| 缓存命中与操作 | 缓存生效吗 |
| JVM 堆内存趋势 | 内存有压力吗，是否有泄漏迹象 |
| GC 停顿与吞吐 | GC 是否在拖慢响应（平均/最长停顿、GC 时间占比） |
| 数据库连接池使用率 / JVM 堆使用率 / 进程运行时长 | 当前瞬时值，判断是否触阈值 |

### 第三层：业务与体验（y=6~21）

| 面板 | 用途 |
|---|---|
| 吞吐量总览 | 请求量趋势，判断是流量涨了还是变慢了 |
| 延迟总览 | AI / 前端接口延迟对比 |
| 前端体验核心指标 | LCP / INP 等 Web Vitals |
| 缓存与资源健康 | 缓存命中率 + JVM 内存占比 |

---

## 二、变量设计

| 变量 | 类型 | 作用 |
|---|---|---|
| `DS_PROMETHEUS` | datasource | 导入时绑定数据源。**必须有 `__inputs` 才能让 Grafana 弹出选择框** |
| `application` | query | `label_values(up, application)`，多应用时切换 |
| `env` | query | `label_values(up{application=~"$application"}, env)` |
| `job` | query | `label_values(up{application=~"$application"}, job)` |

> `env` 的实际取值来自 `spring.profiles.active`。
> **默认值是 `default` 不是 `prod`**，生产部署要显式设 `--spring.profiles.active=prod`，
> 否则看板的环境下拉里会看到 `default`。

---

## 三、刻意没做的面板

这些曾经考虑过，但决定不加，记下原因避免以后重复讨论：

| 没做的面板 | 原因 |
|---|---|
| 按用户维度的调用量 | 用户 ID 是高基数标签，会把 Prometheus 的 series 撑爆 |
| 前端按页面/路由的 LCP | 同上，路由维度不可控。前端埋点刻意只上报聚合值 |
| GC 停顿 P95 | `jvm_gc_pause_seconds` 是 summary 类型，只有 `_count`/`_sum`/`_max`，没有 `_bucket`，算不了分位数。面板用平均值 + `_max` 代替 |
| 数据库连接获取 P95 | 同上，`hikaricp_connections_acquire_seconds` 也是 summary |
| Redis 内存/键数量 | 需要 redis_exporter，当前没部署。如果以后加了，可以在「缓存」面板补上 |

---

## 四、修改看板的注意事项

1. **改完必须校验 JSON 合法性**。Grafana 导入失败时不会告诉你哪一行错了。
2. **面板 id 不能重复**，`gridPos` 的同一行宽度之和不要超过 24。
3. **新增面板的 `description` 要写清楚「这个指标异常说明什么、下一步看哪里」**。
   运维看面板时不应该再去翻文档。
4. **引用 `_bucket` 指标前先确认它真的存在**。Timer 类型默认不带 histogram，
   需要在 `application.yml` 的 `percentiles-histogram` 里显式开启。
5. **不要改 `__inputs` 里的 `DS_PROMETHEUS` 名字**，除非同步改所有面板的 `datasource.uid`。

---

## 五、历史说明

早期版本（8 个面板）存在的问题，已在本轮修复：

| 问题 | 影响 | 修复 |
|---|---|---|
| 缺 `__inputs` 段 | 导入后 `${DS_PROMETHEUS}` 为空，所有面板 No data | 已补 |
| 标题带「（草案）」 | 无法作为正式资产交付 | 已改为「LearnSphere 监控总览」 |
| `uid` 为 `learnsphere-observability-draft` | 重新导入会生成重复看板 | 已固定为 `learnsphere-observability` |
| 缺排障面板 | 告警响了之后没有下钻入口 | 新增 10 个排障面板（含 GC 停顿） |
| `hikaricp_connections_acquire_seconds_bucket` | 该指标不存在，面板永久 No data | 改用 `_sum / _count` 算平均 |
| `jvm_gc_pause_seconds` 曾被误判为不存在 | 一度改用 `jvm_gc_overhead` 替代 | 实际是懒注册（有 GC 才出现）。已恢复使用，改为 summary 正确的算法 |
