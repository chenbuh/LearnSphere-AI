package com.learnsphere.controller;

import com.learnsphere.common.Result;
import com.learnsphere.dto.FrontendMetricDTO;
import com.learnsphere.dto.FrontendMetricsBatchDTO;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/api/metrics")
public class FrontendMetricsController {

    private final MeterRegistry meterRegistry;

    public FrontendMetricsController(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @PostMapping("/frontend")
    public Result<?> ingest(@RequestBody FrontendMetricsBatchDTO batch) {
        if (batch == null || batch.getMetrics() == null) {
            return Result.success();
        }
        for (FrontendMetricDTO metric : batch.getMetrics()) {
            recordMetric(metric);
        }
        return Result.success();
    }

    private void recordMetric(FrontendMetricDTO metric) {
        if (metric == null || metric.getType() == null) {
            return;
        }

        String type = safe(metric.getType());
        String name = safe(metric.getName());
        meterRegistry.counter("frontend.event.total", "type", type, "name", name).increment();

        if (metric.getValue() == null) {
            return;
        }

        switch (type) {
            case "web_vital" -> DistributionSummary.builder("frontend.web_vital")
                    .tags("name", name, "path", safe(metric.getPath()))
                    .register(meterRegistry)
                    .record(metric.getValue());
            case "api" -> Timer.builder("frontend.api.latency")
                    .tags(
                            "endpoint", safe(metric.getEndpoint()),
                            "method", safe(metric.getMethod()),
                            "status", safe(metric.getStatus()))
                    .register(meterRegistry)
                    .record(Duration.ofMillis(Math.max(0L, metric.getValue().longValue())));
            case "route" -> Timer.builder("frontend.route.latency")
                    .tags("from", safe(metric.getFrom()), "to", safe(metric.getTo()))
                    .register(meterRegistry)
                    .record(Duration.ofMillis(Math.max(0L, metric.getValue().longValue())));
            default -> {
                // ignore
            }
        }
    }

    private String safe(String value) {
        if (value == null || value.isBlank()) {
            return "unknown";
        }
        return value.length() > 120 ? value.substring(0, 120) : value;
    }
}
