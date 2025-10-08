package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.entity.VocabularyMastery;
import com.learnsphere.service.IVocabularyMasteryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 词汇掌握度控制器
 */
@RestController
@RequestMapping("/api/vocabulary/mastery")
@RequiredArgsConstructor
public class VocabularyMasteryController {

    private final IVocabularyMasteryService masteryService;

    /**
     * 记录学习结果
     */
    @PostMapping("/record")
    public Result<?> recordReview(@RequestBody ReviewRequest request) {
        Long userId = StpUtil.getLoginIdAsLong();
        masteryService.recordReview(userId, request.getVocabularyId(), request.getIsCorrect());
        return Result.success("记录成功");
    }

    /**
     * 获取需要复习的单词列表
     */
    @GetMapping("/review-list")
    public Result<List<Map<String, Object>>> getReviewList(
            @RequestParam(defaultValue = "20") Integer limit) {
        Long userId = StpUtil.getLoginIdAsLong();
        List<Map<String, Object>> list = masteryService.getReviewList(userId, limit);
        return Result.success(list);
    }

    /**
     * 获取掌握度统计
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getMasteryStats() {
        Long userId = StpUtil.getLoginIdAsLong();
        Map<String, Object> stats = masteryService.getMasteryStats(userId);
        return Result.success(stats);
    }

    /**
     * 收藏/取消收藏
     */
    @PostMapping("/favorite")
    public Result<?> toggleFavorite(@RequestBody FavoriteRequest request) {
        Long userId = StpUtil.getLoginIdAsLong();
        masteryService.toggleFavorite(userId, request.getVocabularyId(), request.getFavorite());
        return Result.success("操作成功");
    }

    /**
     * 添加笔记
     */
    @PostMapping("/notes")
    public Result<?> addNotes(@RequestBody NotesRequest request) {
        Long userId = StpUtil.getLoginIdAsLong();
        masteryService.addNotes(userId, request.getVocabularyId(), request.getNotes());
        return Result.success("笔记已保存");
    }

    /**
     * 获取单词详细掌握情况
     */
    @GetMapping("/detail/{vocabularyId}")
    public Result<VocabularyMastery> getMasteryDetail(@PathVariable Long vocabularyId) {
        Long userId = StpUtil.getLoginIdAsLong();
        VocabularyMastery mastery = masteryService.getMasteryDetail(userId, vocabularyId);
        return Result.success(mastery);
    }

    @Data
    public static class ReviewRequest {
        private Long vocabularyId;
        private Boolean isCorrect;
    }

    @Data
    public static class FavoriteRequest {
        private Long vocabularyId;
        private Boolean favorite;
    }

    @Data
    public static class NotesRequest {
        private Long vocabularyId;
        private String notes;
    }
}
