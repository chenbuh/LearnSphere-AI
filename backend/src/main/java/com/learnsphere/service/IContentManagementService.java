package com.learnsphere.service;

import com.learnsphere.dto.ContentQualityCheckDTO;
import com.learnsphere.dto.ContentHeatAnalysisDTO;

import java.util.List;

/**
 * 内管理服务接口
 */
public interface IContentManagementService {

    /**
     * 重载敏感词库
     */
    void reloadSensitiveWords();

    /**
     * 检查内容质量
     * 
     * @param content     内文本
     * @param contentType 内类型
     * @return 质结果
     */
    ContentQualityCheckDTO checkContentQuality(String content, String contentType);

    /**
     * 获取内烺分析
     * 
     * @param contentId   内ID
     * @param contentType 内类型
     * @return 烺分析结果
     */
    ContentHeatAnalysisDTO getContentHeatAnalysis(Long contentId, String contentType);

    /**
     * 获取烗内列表
     * 
     * @param contentType 内类型
     * @param orderBy     排序字 (completeRate, favoriteRate, viewCount)
     * @param limit       返回数量
     * @return 烗内列表
     */
    List<ContentHeatAnalysisDTO> getHotContentList(String contentType, String orderBy, Integer limit);
}
