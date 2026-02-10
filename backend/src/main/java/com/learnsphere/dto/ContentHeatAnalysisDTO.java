package com.learnsphere.dto;

import lombok.Data;
import java.util.List;

/**
 * 内容热度分析 DTO
 */
@Data
public class ContentHeatAnalysisDTO {

    private Long contentId;
    private String contentType; // vocabulary, writing, reading, etc.
    private String title;

    // 核心指标
    private Long viewCount; // 浏览量
    private Long completeCount; // 完成量
    private Long favoriteCount; // 收藏量

    // 计算指标
    private Double completeRate; // 完读率 = completeCount / viewCount * 100
    private Double favoriteRate; // 收藏率 = favoriteCount / viewCount * 100

    // 趋势数据
    private List<TrendData> trend; // 7天趋势

    // 排名
    private Integer rank; // 热度排名

    @Data
    public static class TrendData {
        private String date;
        private Long views;
        private Long completes;
        private Long favorites;
    }
}
