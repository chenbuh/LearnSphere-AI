package com.learnsphere.controller.admin;

import com.learnsphere.common.Result;
import com.learnsphere.dto.ContentQualityCheckDTO;
import com.learnsphere.dto.ContentHeatAnalysisDTO;
import com.learnsphere.service.IContentManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 内容管理控制器
 */
@RestController
@RequestMapping("/api/admin/content")
public class AdminContentManagementController {

    @Autowired
    private IContentManagementService contentManagementService;

    /**
     * 内容质量检查
     */
    @PostMapping("/quality-check")
    public Result<?> checkQuality(@RequestBody Map<String, Object> request) {
        String content = (String) request.get("content");
        String contentType = (String) request.getOrDefault("contentType", "general");

        if (content == null || content.trim().isEmpty()) {
            return Result.error("内容不能为空");
        }

        try {
            ContentQualityCheckDTO result = contentManagementService.checkContentQuality(content, contentType);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("质检失败: " + e.getMessage());
        }
    }

    /**
     * 获取内容热度分析
     */
    @GetMapping("/{contentId}/heat-analysis")
    public Result<?> getHeatAnalysis(
            @PathVariable Long contentId,
            @RequestParam(required = false, defaultValue = "general") String contentType) {
        try {
            ContentHeatAnalysisDTO result = contentManagementService.getContentHeatAnalysis(contentId, contentType);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("获取热度分析失败: " + e.getMessage());
        }
    }

    /**
     * 获取热门内容列表
     */
    @GetMapping("/hot-list")
    public Result<?> getHotList(
            @RequestParam(required = false, defaultValue = "general") String contentType,
            @RequestParam(required = false, defaultValue = "completeRate") String orderBy,
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        try {
            List<ContentHeatAnalysisDTO> result = contentManagementService.getHotContentList(contentType, orderBy,
                    limit);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("获取热门内容失败: " + e.getMessage());
        }
    }
}
