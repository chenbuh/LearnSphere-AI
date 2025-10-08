package com.learnsphere.controller;

import com.learnsphere.common.Result;
import com.learnsphere.utils.VocabularyImporter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 词汇导入控制器
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/vocabulary/import")
@RequiredArgsConstructor
public class VocabularyImportController {

    private final VocabularyImporter vocabularyImporter;

    /**
     * 导入CET-4词汇
     */
    @PostMapping("/cet4")
    public Result<String> importCet4Vocabulary() {
        try {
            String filePath = "../frontend-vue/src/data/cet4_words.js";
            vocabularyImporter.importFromJsFile(filePath);
            return Result.success("CET-4词汇导入成功");
        } catch (Exception e) {
            return Result.error("导入失败: " + e.getMessage());
        }
    }

    /**
     * 导入所有词汇
     */
    @PostMapping("/all")
    public Result<String> importAllVocabulary() {
        try {
            String[] files = {
                "../frontend-vue/src/data/cet4_words.js",
                "../frontend-vue/src/data/cet6_words.js",
                "../frontend-vue/src/data/ielts_words.js",
                "../frontend-vue/src/data/toefl_words.js",
                "../frontend-vue/src/data/gre_words.js",
                "../frontend-vue/src/data/tem4_words.js",
                "../frontend-vue/src/data/tem8_words.js",
                "../frontend-vue/src/data/postgraduate_words.js"
            };
            
            int totalSuccess = 0;
            int totalFailed = 0;
            
            for (String filePath : files) {
                try {
                    vocabularyImporter.importFromJsFile(filePath);
                    totalSuccess++;
                } catch (Exception e) {
                    totalFailed++;
                    System.err.println("导入失败: " + filePath + " - " + e.getMessage());
                }
            }
            
            return Result.success("导入完成！成功: " + totalSuccess + " 个文件，失败: " + totalFailed + " 个文件");
        } catch (Exception e) {
            return Result.error("导入失败: " + e.getMessage());
        }
    }
}
