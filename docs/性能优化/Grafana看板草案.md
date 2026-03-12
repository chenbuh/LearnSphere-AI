# Grafana 看板草案

本草案用于把仓库里已经存在的 `Actuator + Prometheus + 前端埋点` 指标接成一套能直接落地的 Grafana 看板。当前内容以 PromQL 草案为主，后续可以再转成正式 JSON 导入文件。

## 前置假设

- Prometheus 已抓取后端 `GET /actuator/prometheus`。
- 指标包含公共标签：`application`、`env`。
- 默认应用名使用 `learnsphere-ai`，Prometheus 抓取任务名示例使用 `learnsphere-backend`。
- 前端埋点已经通过 `POST /api/metrics/frontend` 进入后端并暴露为 Prometheus 指标。

## 看板变量建议

- `$application`
  - 默认值：`learnsphere-ai`
  - 查询建议：`label_values(up, application)`
- `$env`
  - 默认值：`prod`
  - 查询建议：`label_values(up{application="$application"}, env)`
- `$job`
  - 默认值：`learnsphere-backend`
  - 查询建议：`label_values(up{application="$application"}, job)`

## 看板一：系统总览

适合首页总览，先回答“系统现在活着没有、慢不慢、资源紧不紧”。

### 面板建议

1. 服务可用性
- PromQL：`up{job="$job", application="$application", env="$env"}`
- 展示：Stat
- 阈值：`0 = 红色`，`1 = 绿色`

2. HTTP 吞吐量
- PromQL：`sum(rate(http_server_requests_seconds_count{application="$application", env="$env"}[5m]))`
- 展示：Time series

3. HTTP P95 响应时间
- PromQL：`histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket{application="$application", env="$env"}[5m])) by (le))`
- 展示：Time series
- 阈值：`0.8s` 预警，`1.2s` 严重

4. 5xx 错误率
- PromQL：`sum(rate(http_server_requests_seconds_count{application="$application", env="$env", status=~"5.."}[5m])) / clamp_min(sum(rate(http_server_requests_seconds_count{application="$application", env="$env"}[5m])), 0.001)`
- 展示：Time series
- 阈值：`2%` 预警，`5%` 严重

5. JVM Heap 使用率
- PromQL：`max(jvm_memory_used_bytes{application="$application", env="$env", area="heap"} / jvm_memory_max_bytes{application="$application", env="$env", area="heap"})`
- 展示：Gauge
- 阈值：`85%` 预警，`92%` 严重

## 看板二：AI 调用与成本

适合 AI 治理、成本复盘和模型稳定性排查。

### 面板建议

1. AI 请求量
- PromQL：`sum(rate(ai_request_total{application="$application", env="$env"}[5m])) by (action, model)`
- 展示：Time series

2. AI 失败率
- PromQL：`sum(rate(ai_request_total{application="$application", env="$env", status!="SUCCESS"}[5m])) / clamp_min(sum(rate(ai_request_total{application="$application", env="$env"}[5m])), 0.001)`
- 展示：Time series
- 阈值：`5%` 预警

3. AI P95 延迟
- PromQL：`histogram_quantile(0.95, sum(rate(ai_request_latency_seconds_bucket{application="$application", env="$env"}[5m])) by (le, action))`
- 展示：Time series
- 建议按 `action` 分组

4. AI Token 消耗
- PromQL：`sum(increase(ai_tokens_total{application="$application", env="$env"}[1d])) by (model, type)`
- 展示：Bar chart

5. AI 日成本
- PromQL：`sum(increase(ai_cost_usd_total{application="$application", env="$env"}[1d]))`
- 展示：Stat
- 阈值：结合预算，例如 `50 / 80 / 100 USD`

## 看板三：前端体验

适合补足“接口没报警，但用户实际感知已经变差”的盲区。

### 面板建议

1. LCP 平均值
- PromQL：`sum(rate(frontend_web_vital_sum{application="$application", env="$env", name="LCP"}[5m])) / clamp_min(sum(rate(frontend_web_vital_count{application="$application", env="$env", name="LCP"}[5m])), 0.001)`
- 展示：Time series
- 阈值：`2500ms` 目标，`4000ms` 预警

2. INP 平均值
- PromQL：`sum(rate(frontend_web_vital_sum{application="$application", env="$env", name="INP"}[5m])) / clamp_min(sum(rate(frontend_web_vital_count{application="$application", env="$env", name="INP"}[5m])), 0.001)`
- 展示：Time series
- 阈值：`200ms` 目标，`500ms` 预警

3. CLS 平均值
- PromQL：`sum(rate(frontend_web_vital_sum{application="$application", env="$env", name="CLS"}[5m])) / clamp_min(sum(rate(frontend_web_vital_count{application="$application", env="$env", name="CLS"}[5m])), 0.001)`
- 展示：Time series
- 阈值：`0.1` 目标，`0.25` 预警

4. 前端 API P95 延迟
- PromQL：`histogram_quantile(0.95, sum(rate(frontend_api_latency_seconds_bucket{application="$application", env="$env"}[5m])) by (le, endpoint))`
- 展示：Table 或 Time series

5. 路由切换耗时 P95
- PromQL：`histogram_quantile(0.95, sum(rate(frontend_route_latency_seconds_bucket{application="$application", env="$env"}[5m])) by (le, to))`
- 展示：Table

## 看板四：缓存与稳定性

适合排查“AI 慢、接口慢、但根因其实是缓存命中和错误波动”的场景。

### 面板建议

1. 缓存访问量
- PromQL：`sum(rate(cache_access_total{application="$application", env="$env"}[5m])) by (result)`
- 展示：Time series

2. 缓存命中率
- PromQL：`sum(rate(cache_access_total{application="$application", env="$env", result="hit"}[5m])) / clamp_min(sum(rate(cache_access_total{application="$application", env="$env", result=~"hit|miss"}[5m])), 0.001)`
- 展示：Gauge
- 阈值：低于 `60%` 可预警

3. 降级或失败请求比率
- PromQL：`sum(rate(ai_request_total{application="$application", env="$env", status=~"FAIL|DEGRADED|TIMEOUT"}[5m])) / clamp_min(sum(rate(ai_request_total{application="$application", env="$env"}[5m])), 0.001)`
- 展示：Time series

4. 告警联动表
- 数据来源：Prometheus Alerting / Alertmanager
- 目标：让运维和开发能直接在同一看板里看到当前 firing alerts

## 阈值建议

- 后端 HTTP P95：`> 0.8s` 预警，`> 1.2s` 严重。
- JVM Heap：`> 85%` 预警，`> 92%` 严重。
- AI 失败率：`> 5%` 预警，`> 10%` 严重。
- AI 日成本：建议先按预算的 `80%` 做预警。
- LCP：`> 4000ms` 预警。
- INP：`> 500ms` 预警。

## 落地顺序建议

1. 先把 `prometheus-alert-rules.yml` 接入现有 Prometheus，确认 `job` 和 `application` 标签与真实抓取配置一致。
2. 先做“系统总览 + AI 调用与成本”两张看板，因为收益最高。
3. 再补“前端体验”和“缓存与稳定性”，把前后端体验链路打通。
4. 等指标命名和标签稳定后，再把本草案转成正式 Grafana JSON 导入模板。

## 相关文档

- [观测链路实施](./观测链路实施.md)
- [Prometheus 告警规则草案](./prometheus-alert-rules.yml)
- [AI 成本控制](../AI功能/AI成本控制.md)
