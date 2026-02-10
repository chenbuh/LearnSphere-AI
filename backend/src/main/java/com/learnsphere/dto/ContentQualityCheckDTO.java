package com.learnsphere.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * 内容质量检查结果 DTO
 */
@Data
public class ContentQualityCheckDTO {

    private Boolean passed; // 是否通过质检
    private Integer score; // 质量评分 0-100
    private List<Issue> issues; // 问题列表
    private Map<String, Object> statistics; // 统计信息

    @Data
    public static class Issue {
        private String type; // spelling, sensitive, format, grammar
        private String severity; // low, medium, high
        private String message; // 问题描述
        private Integer position; // 问题位置（字符索引）
        private String suggestion; // 修复建议
        private String originalText; // 原始文本
    }
}
