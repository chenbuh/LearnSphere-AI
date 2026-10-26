package com.learnsphere.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.AdminOperation;
import com.learnsphere.entity.Vocabulary;
import com.learnsphere.service.IAIGenerationService;
import com.learnsphere.service.IVocabularyService;
import com.learnsphere.utils.ExamTypeAliasUtils;
import com.learnsphere.utils.VocabularyContentGuard;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 管理后台控制器（词汇域）
 *
 * @author LearnSphere Team
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@SaCheckRole("admin")
public class AdminController {

    @Autowired
    private IVocabularyService vocabularyService;

    @Autowired
    private IAIGenerationService aiGenerationService;

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    /**
     * AI 词汇结果必须包含可直接展示的完整内容。失败文本或占位符不能落库，
     * 否则批量任务会把一次真实调用失败伪装成成功补全。
     */
    private String invalidVocabularyDetailsReason(Map<String, Object> details) {
        if (details == null) {
            return "AI 未返回结果";
        }

        for (String field : List.of("phonetic", "translation", "definition", "example", "exampleTranslation")) {
            String value = asString(details.get(field));
            if (value == null || value.isBlank()) {
                return field + " 为空";
            }
            String placeholderReason = placeholderReason(value);
            if (placeholderReason != null) {
                return field + " 包含占位内容: " + placeholderReason;
            }
        }

        String exampleTranslationReason = VocabularyContentGuard
                .reasonBadExampleTranslation(asString(details.get("exampleTranslation")));
        if (exampleTranslationReason != null) {
            return "exampleTranslation 无效: " + exampleTranslationReason;
        }
        return null;
    }

    private String placeholderReason(String value) {
        String normalized = VocabularyContentGuard.normalize(value);
        String lower = normalized.toLowerCase(java.util.Locale.ROOT);
        if (lower.contains("unavailable") || lower.contains("not available")
                || lower.contains("translation failed") || lower.contains("example unavailable")
                || normalized.contains("暂无") || normalized.contains("解析失败")
                || normalized.contains("点击重试")) {
            return "AI failure/placeholder text";
        }
        return null;
    }

    private String invalidExampleTranslationReason(String value) {
        if (value == null) {
            return null;
        }
        String normalized = VocabularyContentGuard.normalize(value);
        if (normalized.isEmpty()) {
            return null;
        }
        return VocabularyContentGuard.reasonBadExampleTranslation(normalized);
    }

    /**
     * 获取词汇列表（分页）
     */
    @GetMapping("/vocabulary")
    public Result<?> getVocabularyList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) String keyword) {

        Page<Vocabulary> pageParam = new Page<>(page, size);
        QueryWrapper<Vocabulary> query = new QueryWrapper<>();

        if (examType != null && !examType.isEmpty()) {
            query.in("exam_type", ExamTypeAliasUtils.expandAliases(examType));
        }

        if (keyword != null && !keyword.trim().isEmpty()) {
            query.and(wrapper -> wrapper
                    .like("word", keyword)
                    .or().like("translation", keyword));
        }

        query.orderByDesc("frequency");
        Page<Vocabulary> result = vocabularyService.page(pageParam, query);

        return Result.success(result);
    }

    /**
     * 添加词汇
     */
    @PostMapping("/vocabulary")
    @AdminOperation(module = "词汇管理", action = "添加词汇")
    public Result<?> addVocabulary(@RequestBody Vocabulary vocabulary) {
        String badReason = invalidExampleTranslationReason(vocabulary.getExampleTranslation());
        if (badReason != null) {
            return Result.error("Invalid exampleTranslation: " + badReason);
        }
        vocabulary.setExampleTranslation(
                VocabularyContentGuard.pickValidExampleTranslation(vocabulary.getExampleTranslation(), null));
        vocabulary.setCreateTime(LocalDateTime.now());
        vocabulary.setUpdateTime(LocalDateTime.now());
        vocabularyService.save(vocabulary);
        return Result.success("添加成功");
    }

    /**
     * 更新词汇
     */
    @PutMapping("/vocabulary/{id}")
    @AdminOperation(module = "词汇管理", action = "更新词汇")
    public Result<?> updateVocabulary(@PathVariable Long id, @RequestBody Vocabulary vocabulary) {
        Vocabulary existing = vocabularyService.getById(id);
        if (existing == null) {
            return Result.error("Word not found");
        }
        String badReason = invalidExampleTranslationReason(vocabulary.getExampleTranslation());
        if (badReason != null) {
            return Result.error("Invalid exampleTranslation: " + badReason);
        }
        vocabulary.setId(id);
        vocabulary.setExampleTranslation(
                VocabularyContentGuard.pickValidExampleTranslation(
                        vocabulary.getExampleTranslation(),
                        existing.getExampleTranslation()));
        vocabulary.setUpdateTime(LocalDateTime.now());
        vocabularyService.updateById(vocabulary);
        return Result.success("更新成功");
    }

    /**
     * 删除词汇
     */
    @DeleteMapping("/vocabulary/{id}")
    @AdminOperation(module = "词汇管理", action = "删除词汇")
    public Result<?> deleteVocabulary(@PathVariable Long id) {
        vocabularyService.removeById(id);
        return Result.success("删除成功");
    }

    /**
     * 批量导入词汇
     */
    @PostMapping("/vocabulary/batch")
    @AdminOperation(module = "词汇管理", action = "批量导入词汇")
    public Result<?> batchAddVocabulary(@RequestBody List<Vocabulary> vocabularyList) {
        LocalDateTime now = LocalDateTime.now();
        int rowNum = 0;
        for (Vocabulary vocab : vocabularyList) {
            rowNum += 1;
            String badReason = invalidExampleTranslationReason(vocab.getExampleTranslation());
            if (badReason != null) {
                String word = vocab.getWord() == null ? "" : vocab.getWord();
                return Result.error("Invalid exampleTranslation at row " + rowNum + " (word=" + word + "): " + badReason);
            }
            vocab.setExampleTranslation(
                    VocabularyContentGuard.pickValidExampleTranslation(vocab.getExampleTranslation(), null));
            vocab.setCreateTime(now);
            vocab.setUpdateTime(now);
        }
        vocabularyService.saveBatch(vocabularyList);
        return Result.success("批量导入成功，共导入" + vocabularyList.size() + "条");
    }

    /**
     * AI 生成词汇详情
     */
    @PostMapping("/vocabulary/{id}/generate-details")
    @AdminOperation(module = "词汇管理", action = "AI生成词汇详情")
    public Result<?> generateVocabularyDetails(@PathVariable Long id) {
        Vocabulary vocab = vocabularyService.getById(id);
        if (vocab == null) {
            return Result.error("Word not found");
        }

        Map<String, Object> details;
        try {
            details = aiGenerationService.generateVocabularyDetails(vocab.getWord(), vocab.getExamType());
        } catch (Exception error) {
            log.error("AI 词汇解析失败: {}", vocab.getWord(), error);
            return Result.error("AI 生成失败: " + error.getMessage());
        }
        String invalidReason = invalidVocabularyDetailsReason(details);
        if (invalidReason != null) {
            return Result.error("AI 生成结果不可用: " + invalidReason);
        }

        vocab.setPhonetic(asString(details.getOrDefault("phonetic", vocab.getPhonetic())));
        vocab.setTranslation(asString(details.getOrDefault("translation", vocab.getTranslation())));
        vocab.setDefinition(asString(details.getOrDefault("definition", vocab.getDefinition())));
        vocab.setExample(asString(details.getOrDefault("example", vocab.getExample())));
        vocab.setExampleTranslation(
                VocabularyContentGuard.pickValidExampleTranslation(
                        asString(details.getOrDefault("exampleTranslation", vocab.getExampleTranslation())),
                        vocab.getExampleTranslation()));
        vocab.setUpdateTime(LocalDateTime.now());

        if (!vocabularyService.updateById(vocab)) {
            return Result.error("AI 生成结果保存失败");
        }
        return Result.success(vocab);
    }

    /**
     * 批量 AI 生成词汇详情
     */
    @PostMapping("/vocabulary/batch-generate")
    @AdminOperation(module = "词汇管理", action = "批量AI生成词汇详情")
    public Result<?> batchGenerateVocabularyDetails(@RequestParam(defaultValue = "20") Integer limit) {
        int batchLimit = limit == null ? 20 : limit;
        if (batchLimit < 1 || batchLimit > 20) {
            return Result.error("批量 AI 补全数量必须在 1 到 20 之间");
        }
        log.info("开始执行批量 AI 词汇补全，限制数量: {}", batchLimit);

        List<Vocabulary> list = vocabularyService
                .list(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Vocabulary>()
                        .and(w -> w.isNull(Vocabulary::getExample)
                                .or().like(Vocabulary::getExample, "unavailable")
                                .or().isNull(Vocabulary::getDefinition)
                                .or().like(Vocabulary::getDefinition, "unavailable")
                                .or().isNull(Vocabulary::getPhonetic)
                                .or().eq(Vocabulary::getPhonetic, "")
                                .or().isNull(Vocabulary::getTranslation)
                                .or().eq(Vocabulary::getTranslation, "")
                                .or().like(Vocabulary::getTranslation, "unavailable")
                                .or().isNull(Vocabulary::getExampleTranslation)
                                .or().eq(Vocabulary::getExampleTranslation, "")
                                .or().like(Vocabulary::getExampleTranslation, "暂无")
                                .or().like(Vocabulary::getExampleTranslation, "unavailable"))
                        .orderByDesc(Vocabulary::getFrequency)
                        .orderByAsc(Vocabulary::getId)
                        .last("LIMIT " + batchLimit));

        if (list == null || list.isEmpty()) {
            return Result.success("未发现匹配的质量缺失记录 (匹配到 0 条)");
        }

        int successCount = 0;
        int errorCount = 0;
        StringBuilder lastError = new StringBuilder();

        for (Vocabulary vocab : list) {
            try {
                Map<String, Object> details = aiGenerationService.generateVocabularyDetails(vocab.getWord(),
                        vocab.getExamType());

                String invalidReason = invalidVocabularyDetailsReason(details);
                if (invalidReason != null) {
                    errorCount++;
                    lastError.append(vocab.getWord()).append(":").append(invalidReason).append("; ");
                } else {
                    vocab.setPhonetic(asString(details.getOrDefault("phonetic", vocab.getPhonetic())));
                    vocab.setTranslation(asString(details.getOrDefault("translation", vocab.getTranslation())));
                    vocab.setDefinition(asString(details.getOrDefault("definition", vocab.getDefinition())));
                    vocab.setExample(asString(details.getOrDefault("example", vocab.getExample())));
                    vocab.setExampleTranslation(
                            VocabularyContentGuard.pickValidExampleTranslation(
                                    asString(details.getOrDefault("exampleTranslation", vocab.getExampleTranslation())),
                                    vocab.getExampleTranslation()));
                    vocab.setUpdateTime(LocalDateTime.now());

                    if (!vocabularyService.updateById(vocab)) {
                        throw new IllegalStateException("数据库更新未生效");
                    }
                    // 只有 AI 内容已经成功写入后才删除同词重复记录，避免失败时破坏原数据。
                    vocabularyService.remove(new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Vocabulary>()
                            .eq("word", vocab.getWord())
                            .eq("exam_type", vocab.getExamType())
                            .ne("id", vocab.getId()));
                    successCount++;
                }
            } catch (Exception e) {
                errorCount++;
                log.error("处理词汇失败: " + vocab.getWord(), e);
                if (lastError.length() < 100) {
                    lastError.append(vocab.getWord()).append(":").append(e.getMessage()).append("; ");
                }
            }
        }

        String summary = String.format("任务执行结果：成功 %d 条，失败 %d 条 (在扫描到的 %d 条匹配记录中)。",
                successCount, errorCount, list.size());
        if (errorCount > 0) {
            summary += " 错误提示: " + lastError;
        }

        return Result.success(summary);
    }

    /**
     * 全库占位符清理：将无效数据置为空，触发前端自动生成
     */
    @PostMapping("/vocabulary/cleanup-placeholders")
    @AdminOperation(module = "词汇管理", action = "占位符清理")
    public Result<?> cleanupVocabularyPlaceholders() {
        int count = 0;
        try {
            count += vocabularyService.getBaseMapper().update(null,
                    new UpdateWrapper<Vocabulary>()
                            .set("example", null)
                            .like("example", "unavailable")
                            .or().like("example", "暂无"));

            count += vocabularyService.getBaseMapper().update(null,
                    new UpdateWrapper<Vocabulary>()
                            .set("definition", null)
                            .like("definition", "unavailable"));

            count += vocabularyService.getBaseMapper().update(null,
                    new UpdateWrapper<Vocabulary>()
                            .set("example_translation", null)
                            .like("example_translation", "暂无"));

            return Result.success("占位符清理完成，共修正 " + count + " 处无效字段。这些单词现在将应用智能补全逻辑。");
        } catch (Exception e) {
            log.error("Cleanup failed", e);
            return Result.error("清理失败: " + e.getMessage());
        }
    }

    /**
     * 全库去重：清理重复词汇，保留信息最完整的一条
     */
    @PostMapping("/vocabulary/deduplicate")
    @AdminOperation(module = "词汇管理", action = "词汇去重")
    public Result<?> deduplicateVocabulary() {
        QueryWrapper<Vocabulary> wrapper = new QueryWrapper<>();
        wrapper.select("word", "exam_type")
                .groupBy("word", "exam_type")
                .having("count(*) > 1");

        List<Map<String, Object>> duplicateGroups = vocabularyService.listMaps(wrapper);
        if (duplicateGroups.isEmpty()) {
            return Result.success("未发现重复词汇");
        }

        int deletedCount = 0;
        int processedGroups = 0;

        for (Map<String, Object> group : duplicateGroups) {
            String word = (String) group.get("word");
            String examType = (String) group.get("exam_type");
            QueryWrapper<Vocabulary> groupQuery = new QueryWrapper<Vocabulary>().eq("word", word);
            if (examType == null) {
                groupQuery.isNull("exam_type");
            } else {
                groupQuery.eq("exam_type", examType);
            }
            List<Vocabulary> records = vocabularyService.list(groupQuery);
            if (records.size() <= 1) {
                continue;
            }

            records.sort((v1, v2) -> {
                double score1 = getVocabularyScore(v1);
                double score2 = getVocabularyScore(v2);
                return Double.compare(score2, score1);
            });

            List<Long> deleteIds = new ArrayList<>();
            for (int i = 1; i < records.size(); i++) {
                deleteIds.add(records.get(i).getId());
            }

            if (!deleteIds.isEmpty()) {
                vocabularyService.removeByIds(deleteIds);
                deletedCount += deleteIds.size();
            }
            processedGroups++;
        }

        return Result.success("去重完成，处理了 " + processedGroups + " 组重复词汇，共删除 " + deletedCount + " 条冗余记录");
    }

    private double getVocabularyScore(Vocabulary v) {
        double score = 0;
        if (v.getTranslation() != null && !v.getTranslation().isEmpty()) {
            score += 2;
        }
        if (v.getExample() != null && !v.getExample().isEmpty()) {
            score += 1;
        }
        if (v.getDefinition() != null && !v.getDefinition().isEmpty()) {
            score += 1;
        }

        score += (v.getId() % 1000000000) / 10000000000.0;
        return score;
    }
}
