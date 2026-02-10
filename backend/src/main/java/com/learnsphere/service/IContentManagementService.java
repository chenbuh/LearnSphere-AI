package com.learnsphere.service;

import com.learnsphere.dto.ContentQualityCheckDTO;
import com.learnsphere.dto.ContentHeatAnalysisDTO;

import java.util.List;

/**
 * 内容管理服务接口
 */
public interface IContentManagementService {

    /**
     * 检查内容质量
     * 
     * @param content     内容文本
     * @param contentType 内容类型
     * @return 质检结果
     */
    ContentQualityCheckDTO checkContentQuality(String content, String contentType);

    /**
     * 获取内容热度分析
     * 
     * @param contentId   内容ID
     * @param contentType 内容类型
     * @return 热度分析结果
     */
    ContentHeatAnalysisDTO getContentHeatAnalysis(Long contentId, String contentType);

    /**
     * 获取热门内容列表
     * 
     * @param contentType 内容类型
     * @param orderBy     排序字段 (completeRate, favoriteRate, viewCount)
     * @param limit       返回数量
     * @return 热门内容列表
     */
    List<ContentHeatAnalysisDTO> getHotContentList(String contentType, String orderBy, Integer limit);
}
