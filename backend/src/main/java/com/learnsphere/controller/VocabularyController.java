package com.learnsphere.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.annotation.RateLimit;
import com.learnsphere.common.Result;
import com.learnsphere.entity.Vocabulary;
import com.learnsphere.service.IVocabularyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 词汇控制器
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/vocabulary")
@RequiredArgsConstructor
@Tag(name = "词汇服务接口", description = "词书浏览、每日单词推荐及词汇详情查询")
public class VocabularyController {

    private final IVocabularyService vocabularyService;

    /**
     * 分页查询词汇列表
     * 支持多维度筛选，用于词汇书浏览或特定范围的练习选题。
     *
     * @param page       当前页码 (1-based)
     * @param pageSize   每页条数
     * @param examType   考试类型 (e.g. "cet4", "ielts")
     * @param difficulty 难度等级 (1-5)
     * @param keyword    搜索关键词 (匹配单词或中文释义)
     * @return 分页的词汇对象列表
     */
    @RateLimit(key = "vocab_list", time = 60, count = 30, limitType = RateLimit.LimitType.IP)
    @Operation(summary = "分页查询词汇列表", description = "支持按考试类型、难度及关键词搜索。返回结果已过动态混淆加密。")
    @GetMapping("/list")
    public Result<Page<Vocabulary>> getVocabularyList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) Integer difficulty,
            @RequestParam(required = false) String keyword) {
        Page<Vocabulary> result = vocabularyService.getVocabularyList(page, pageSize, examType, difficulty, keyword);
        com.learnsphere.utils.ContentSecurityUtil.encryptVocabularyPage(result);
        return Result.success(result);
    }

    /**
     * 获取每日推荐单词
     * 针对用户选择的考试类型，随机或基于算法推荐的一组单词。
     * 适用于首页 "每日一练" 或打卡功能。
     *
     * @param examType 目标考试类型
     * @param count    请求数量 (默认 10)
     * @return 推荐词汇列表
     */
    @RateLimit(key = "vocab_daily", time = 60, count = 30, limitType = RateLimit.LimitType.IP)
    @Operation(summary = "获取每日推荐单词", description = "根据考试类型随机推荐，适用于每日打卡")
    @GetMapping("/daily")
    public Result<Page<Vocabulary>> getDailyWords(
            @RequestParam(required = false) String examType,
            @RequestParam(defaultValue = "10") Integer count) {
        Page<Vocabulary> result = vocabularyService.getDailyWords(examType, count);
        com.learnsphere.utils.ContentSecurityUtil.encryptVocabularyPage(result);
        return Result.success(result);
    }

    /**
     * 获取词汇详情
     */
    @RateLimit(key = "vocab_detail", time = 60, count = 100, limitType = RateLimit.LimitType.IP)
    @Operation(summary = "获取单词详情")
    @GetMapping("/{id}")
    public Result<Vocabulary> getVocabularyDetail(@PathVariable Long id) {
        Vocabulary vocabulary = vocabularyService.getVocabularyDetail(id);
        com.learnsphere.utils.ContentSecurityUtil.encryptVocabulary(vocabulary);
        return Result.success(vocabulary);
    }

}
