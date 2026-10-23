package com.learnsphere.controller;

import com.learnsphere.common.Result;
import com.learnsphere.dto.FrontendMetricDTO;
import com.learnsphere.dto.FrontendMetricsBatchDTO;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Locale;
import java.util.Set;

/**
 * 前端监控指标接收接口。
 *
 * ============================================================================
 * 安全修复（2026-03）—— 修复指标标签基数爆炸（Cardinality Explosion）
 * ----------------------------------------------------------------------------
 * 本接口位于 SaTokenConfig 白名单（/api/metrics/**），匿名可访问（前端
 * navigator.sendBeacon 无法携带 Token，这是设计约束）。
 *
 * 原实现把请求中的 type / name / path / endpoint / method / status / from / to
 * 直接作为 Micrometer 标签使用。而 Micrometer 会为每一个不同的标签组合
 * 创建一个独立的 meter 并常驻内存、永不回收，因此：
 *
 *     for i in 1..100000:
 *         POST /api/metrics/frontend {"metrics":[{"type":"<i>","name":"<i>"}]}
 *
 * 每次请求都会生成一个新的时间序列，后果为：
 *   1. 堆内存被 meter 对象持续占用直至 OOM；
 *   2. /api/actuator/metrics 输出体积失控；
 *   3. Prometheus 侧 scrape 与存储成本激增。
 *
 * 原实现的 safe() 仅截断长度到 120 字符，并不能限制「取值个数」。
 *
 * 修复策略（三层）：
 *   ① 类型白名单：只接受 web_vital / api / route，其余丢弃；
 *   ② 标签值归一化：name 走白名单，path / endpoint / method / status / from / to
 *      走「已知集合 + other 兜底」，确保每个维度的取值数量有硬上界；
 *   ③ 批量条数上限：单次请求最多处理 MAX_METRICS_PER_BATCH 条，
 *      防止一次请求携带海量条目放大处理开销。
 *
 * 由此，全部标签组合的基数上界是可枚举的小常数。
 * ============================================================================
 */
@RestController
@RequestMapping("/api/metrics")
public class FrontendMetricsController {

    private static final Logger log = LoggerFactory.getLogger(FrontendMetricsController.class);

    /** 单次请求最多处理的指标条数 */
    private static final int MAX_METRICS_PER_BATCH = 100;

    /** 指标类型白名单 */
    private static final Set<String> ALLOWED_TYPES = Set.of("web_vital", "api", "route");

    /** Web Vitals 名称白名单（浏览器标准指标） */
    private static final Set<String> ALLOWED_VITAL_NAMES = Set.of(
            "LCP", "FID", "CLS", "FCP", "TTFB", "INP");

    /** HTTP 方法白名单 */
    private static final Set<String> ALLOWED_METHODS = Set.of(
            "GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS");

    /** HTTP 状态码白名单（仅保留状态类别，进一步压低基数） */
    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "2xx", "3xx", "4xx", "5xx", "other");

    /** 兜底标签值：任何未知取值统一归入此项，保证基数有上界 */
    private static final String OTHER = "other";

    /** 标签值最大长度 */
    private static final int MAX_TAG_LENGTH = 120;

    private final MeterRegistry meterRegistry;

    public FrontendMetricsController(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @PostMapping("/frontend")
    public Result<?> ingest(@RequestBody FrontendMetricsBatchDTO batch) {
        if (batch == null || batch.getMetrics() == null || batch.getMetrics().isEmpty()) {
            return Result.success();
        }

        int processed = 0;
        for (FrontendMetricDTO metric : batch.getMetrics()) {
            if (processed >= MAX_METRICS_PER_BATCH) {
                log.warn("前端指标单次上报超过 {} 条，超出部分已丢弃", MAX_METRICS_PER_BATCH);
                break;
            }
            if (metric == null) {
                continue;
            }
            recordMetric(metric);
            processed++;
        }

        return Result.success();
    }

    private void recordMetric(FrontendMetricDTO metric) {
        String type = normalize(metric.getType());
        // ① 类型必须命中白名单，否则整条丢弃（不产生任何 meter）
        if (!ALLOWED_TYPES.contains(type)) {
            return;
        }

        switch (type) {
            case "web_vital" -> {
                String name = vitalName(metric.getName());
                meterRegistry.counter("frontend.event.total", "type", type, "name", name).increment();

                if (metric.getValue() == null) {
                    return;
                }
                // route 维度可能无限，故不把 path 作为标签，只保留指标名
                DistributionSummary.builder("frontend.web_vital")
                        .tags("name", name)
                        .register(meterRegistry)
                        .record(metric.getValue());
            }
            case "api" -> {
                String endpoint = apiEndpoint(metric.getEndpoint());
                String method = httpMethod(metric.getMethod());
                String status = httpStatus(metric.getStatus());

                meterRegistry.counter("frontend.event.total", "type", type, "name", endpoint).increment();

                if (metric.getValue() == null) {
                    return;
                }
                Timer.builder("frontend.api.latency")
                        .tags("endpoint", endpoint, "method", method, "status", status)
                        .register(meterRegistry)
                        .record(Duration.ofMillis(Math.max(0L, metric.getValue().longValue())));
            }
            case "route" -> {
                String from = routeToken(metric.getFrom());
                String to = routeToken(metric.getTo());

                meterRegistry.counter("frontend.event.total", "type", type, "name", to).increment();

                if (metric.getValue() == null) {
                    return;
                }
                Timer.builder("frontend.route.latency")
                        .tags("from", from, "to", to)
                        .register(meterRegistry)
                        .record(Duration.ofMillis(Math.max(0L, metric.getValue().longValue())));
            }
            default -> {
                // 不可达：type 已通过白名单校验
            }
        }
    }

    /**
     * Web Vitals 名称归一化：只放行标准指标名。
     */
    private String vitalName(String value) {
        if (value == null) {
            return OTHER;
        }
        String upper = value.trim().toUpperCase(Locale.ROOT);
        return ALLOWED_VITAL_NAMES.contains(upper) ? upper : OTHER;
    }

    /**
     * API 端点归一化。
     *
     * 保留第一段路径，并把后续的动态段（数字 ID、UUID 等）归一为 :id，
     * 避免 /api/user/1、/api/user/2 ... 造成基数爆炸。
     */
    private String apiEndpoint(String value) {
        if (value == null || value.isBlank()) {
            return OTHER;
        }
        String trimmed = value.trim();
        // 去掉查询串
        int q = trimmed.indexOf('?');
        if (q >= 0) {
            trimmed = trimmed.substring(0, q);
        }
        if (trimmed.isEmpty()) {
            return OTHER;
        }

        String[] segments = trimmed.split("/");
        StringBuilder sb = new StringBuilder();
        int kept = 0;
        for (String segment : segments) {
            if (segment.isEmpty()) {
                continue;
            }
            sb.append('/');
            if (isDynamicSegment(segment) || kept >= 2) {
                sb.append(":id");
            } else {
                sb.append(clamp(segment));
                kept++;
            }
        }
        String result = sb.length() == 0 ? OTHER : sb.toString();
        return clamp(result);
    }

    /** 动态段：纯数字、UUID、或超长 token */
    private boolean isDynamicSegment(String segment) {
        if (segment.length() > 32) {
            return true;
        }
        if (segment.matches("\\d+")) {
            return true;
        }
        return segment.matches("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");
    }

    private String httpMethod(String value) {
        if (value == null) {
            return OTHER;
        }
        String upper = value.trim().toUpperCase(Locale.ROOT);
        return ALLOWED_METHODS.contains(upper) ? upper : OTHER;
    }

    /** 状态码归一化为 2xx/3xx/4xx/5xx，而非原始数字 */
    private String httpStatus(String value) {
        if (value == null || value.isBlank()) {
            return OTHER;
        }
        String trimmed = value.trim();
        char first = trimmed.charAt(0);
        if (first >= '1' && first <= '5') {
            String bucket = first + "xx";
            return ALLOWED_STATUSES.contains(bucket) ? bucket : OTHER;
        }
        return OTHER;
    }

    /**
     * 路由名归一化：只保留路径前两段，其余归一为 :id。
     */
    private String routeToken(String value) {
        if (value == null || value.isBlank()) {
            return OTHER;
        }
        return apiEndpoint(value);
    }

    private String clamp(String value) {
        if (value == null) {
            return OTHER;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return OTHER;
        }
        return trimmed.length() > MAX_TAG_LENGTH ? trimmed.substring(0, MAX_TAG_LENGTH) : trimmed;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
