package com.learnsphere.controller;

import com.learnsphere.common.Result;
import com.learnsphere.config.VocabularyImportSourceRegistry;
import com.learnsphere.entity.Vocabulary;
import com.learnsphere.service.IAIGenerationService;
import com.learnsphere.service.IVocabularyService;
import com.learnsphere.utils.VocabularyImporter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 词汇管理控制器
 * 用于批量导入和完善词汇数据
 * 
 * @author LearnSphere Team
 */
@RestController
@RequestMapping("/api/admin/vocabulary")
@CrossOrigin
public class VocabularyManagementController {

    @Autowired
    private IVocabularyService vocabularyService;

    @Autowired
    private VocabularyImporter vocabularyImporter;

    @Autowired
    private IAIGenerationService aiGenerationService;

    /**
     * 从JS文件导入词汇数据
     * 
     * @param filePath 文件路径或白名单键
     * @return 导入结果
     */
    @PostMapping("/import-from-file")
    public Result<String> importFromFile(@RequestParam String filePath) {
        String resolvedPath = VocabularyImportSourceRegistry.resolvePath(filePath);
        if (resolvedPath == null) {
            return Result.error("Illegal filePath. Allowed keys: "
                    + String.join(",", VocabularyImportSourceRegistry.getSafeImportTargets().keySet()));
        }

        try {
            vocabularyImporter.importFromJsFile(resolvedPath);
            return Result.success("导入成功");
        } catch (Exception e) {
            return Result.error("导入失败: " + e.getMessage());
        }
    }

    /**
     * 获取词汇库统计信息
     * 
     * @return 统计数据
     */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // 总词汇数
            long totalCount = vocabularyService.count();
            stats.put("totalCount", totalCount);

            // 缺少音标的词汇数
            long missingPhonetic = vocabularyService.lambdaQuery()
                    .and(w -> w.isNull(Vocabulary::getPhonetic).or().eq(Vocabulary::getPhonetic, ""))
                    .count();
            stats.put("missingPhonetic", missingPhonetic);

            // 缺少释义的词汇数
            long missingDefinition = vocabularyService.lambdaQuery()
                    .and(w -> w.isNull(Vocabulary::getDefinition).or().eq(Vocabulary::getDefinition, ""))
                    .count();
            stats.put("missingDefinition", missingDefinition);

            // 缺少例句的词汇数
            long missingExample = vocabularyService.lambdaQuery()
                    .and(w -> w.isNull(Vocabulary::getExample).or().eq(Vocabulary::getExample, ""))
                    .count();
            stats.put("missingExample", missingExample);

            // 完整的词汇数
            long completeCount = vocabularyService.lambdaQuery()
                    .isNotNull(Vocabulary::getPhonetic)
                    .ne(Vocabulary::getPhonetic, "")
                    .isNotNull(Vocabulary::getDefinition)
                    .ne(Vocabulary::getDefinition, "")
                    .isNotNull(Vocabulary::getExample)
                    .ne(Vocabulary::getExample, "")
                    .count();
            stats.put("completeCount", completeCount);

            // 完整度百分比
            double completeness = totalCount > 0 ? (double) completeCount / totalCount * 100 : 0;
            stats.put("completeness", String.format("%.2f%%", completeness));

            return Result.success(stats);
        } catch (Exception e) {
            return Result.error("获取统计信息失败: " + e.getMessage());
        }
    }

    /**
     * AI 生成词汇详情
     */
    @PostMapping("/generate-details")
    public Result<Vocabulary> generateDetails(@RequestBody Map<String, String> body) {
        String word = body.get("word");
        String examType = body.get("examType");
        if (word == null || word.isEmpty()) {
            return Result.error("单词不能为空");
        }
        try {
            Map<String, Object> details = aiGenerationService.generateVocabularyDetails(word, examType);
            Vocabulary vocabulary = new Vocabulary();
            Number difficulty = details.get("difficulty") instanceof Number number ? number : 3;
            Number frequency = details.get("frequency") instanceof Number number ? number : 50;
            vocabulary.setWord(word);
            vocabulary.setPhonetic((String) details.getOrDefault("phonetic", ""));
            vocabulary.setDefinition((String) details.getOrDefault("definition", ""));
            vocabulary.setTranslation((String) details.getOrDefault("translation", ""));
            vocabulary.setExample((String) details.getOrDefault("example", ""));
            vocabulary.setExampleTranslation((String) details.getOrDefault("exampleTranslation", ""));
            vocabulary.setDifficulty(difficulty.intValue());
            vocabulary.setFrequency(frequency.intValue());
            vocabulary.setExamType(examType == null || examType.isBlank() ? "cet4" : examType);
            return Result.success(vocabulary);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
