package com.learnsphere.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "前端性能与体验指标")
public class FrontendMetricDTO {
    @Schema(description = "指标类型", example = "web_vital")
    private String type;

    @Schema(description = "指标名称", example = "LCP")
    private String name;

    @Schema(description = "指标值", example = "1234.56")
    private Double value;

    @Schema(description = "单位", example = "ms")
    private String unit;

    @Schema(description = "页面路径")
    private String path;

    @Schema(description = "路由来源")
    private String from;

    @Schema(description = "路由目标")
    private String to;

    @Schema(description = "HTTP 方法")
    private String method;

    @Schema(description = "API 路径")
    private String endpoint;

    @Schema(description = "状态")
    private String status;

    @Schema(description = "时间戳")
    private Long timestamp;

    @Schema(description = "网络类型")
    private String connection;

    @Schema(description = "User Agent")
    private String userAgent;
}
