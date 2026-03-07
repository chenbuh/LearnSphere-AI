package com.learnsphere.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.learnsphere.common.Result;
import com.learnsphere.config.VocabularyImportSourceRegistry;
import com.learnsphere.utils.VocabularyImporter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 词汇导入控制器
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/vocabulary/import")
@SaCheckRole("admin")
@Slf4j
@RequiredArgsConstructor
public class VocabularyImportController {

    private final VocabularyImporter vocabularyImporter;

    /**
     * 导入CET-4词汇
     */
    @PostMapping("/cet4")
    public Result<String> importCet4Vocabulary() {
        try {
            String filePath = VocabularyImportSourceRegistry.getPath("cet4");
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
            int totalSuccess = 0;
            int totalFailed = 0;

            for (String filePath : VocabularyImportSourceRegistry.getAllImportFilePaths()) {
                try {
                    vocabularyImporter.importFromJsFile(filePath);
                    totalSuccess++;
                } catch (Exception e) {
                    totalFailed++;
                    log.warn("导入词库失败, filePath={}, message={}", filePath, e.getMessage());
                }
            }

            return Result.success("导入完成！成功: " + totalSuccess + " 个文件，失败: " + totalFailed + " 个文件");
        } catch (Exception e) {
            return Result.error("导入失败: " + e.getMessage());
        }
    }
}
