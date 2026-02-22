package com.learnsphere.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "前端指标批量上报")
public class FrontendMetricsBatchDTO {
    @Schema(description = "指标列表")
    private List<FrontendMetricDTO> metrics;
}
