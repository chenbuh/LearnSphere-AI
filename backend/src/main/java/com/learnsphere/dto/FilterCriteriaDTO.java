package com.learnsphere.dto;

import lombok.Data;
import java.util.List;

/**
 * 高级筛选条件 DTO
 */
@Data
public class FilterCriteriaDTO {
    private List<Condition> conditions;
    private String logic; // "AND" or "OR"

    @Data
    public static class Condition {
        private String field; // lastLoginTime, createTime, vipStatus, points, learningCount, aiUsageCount,
                              // checkInDays
        private String operator; // equals, notEquals, greaterThan, lessThan, between, contains
        private Object value; // 具体值，如 "30days", 100, [startDate, endDate]
    }
}
