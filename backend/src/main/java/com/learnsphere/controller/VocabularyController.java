package com.learnsphere.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.entity.Vocabulary;
import com.learnsphere.service.IVocabularyService;
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
public class VocabularyController {

    private final IVocabularyService vocabularyService;

    /**
     * 分页查询词汇列表
     */
    @GetMapping("/list")
    public Result<Page<Vocabulary>> getVocabularyList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) Integer difficulty,
            @RequestParam(required = false) String keyword) {
        Page<Vocabulary> result = vocabularyService.getVocabularyList(page, pageSize, examType, difficulty, keyword);
        return Result.success(result);
    }

    /**
     * 获取每日单词
     */
    @GetMapping("/daily")
    public Result<Page<Vocabulary>> getDailyWords(
            @RequestParam(required = false) String examType,
            @RequestParam(defaultValue = "10") Integer count) {
        Page<Vocabulary> result = vocabularyService.getDailyWords(examType, count);
        return Result.success(result);
    }

    /**
     * 获取词汇详情
     */
    @GetMapping("/{id}")
    public Result<Vocabulary> getVocabularyDetail(@PathVariable Long id) {
        Vocabulary vocabulary = vocabularyService.getVocabularyDetail(id);
        return Result.success(vocabulary);
    }

}
