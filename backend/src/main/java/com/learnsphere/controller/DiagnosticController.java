package com.learnsphere.controller;

import com.learnsphere.entity.Vocabulary;
import com.learnsphere.service.IVocabularyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 诊断控制器 - 用于检查系统状态。
 *
 * ============================================================================
 * 安全修复说明（2026-03）
 * ----------------------------------------------------------------------------
 * 本类此前包含以下被审计确认的高危能力，现已全部移除：
 *
 *   1) POST /apply-example-fix
 *      读取本地 .sql 文件并以 Statement.execute() 逐条执行。
 *      虽然文件名被白名单限制，但该文件位于项目内，任何可访问接口者
 *      都能触发其内容执行；配合 debug profile 默认开启，构成实际风险。
 *      ➜ 已删除。数据库结构变更请统一走 Flyway/Liquibase 迁移脚本。
 *
 *   2) GET /status 中的 databaseUrl 与 userDir 回显
 *      泄露数据库连接串（含主机、端口、库名、参数）与服务器绝对路径。
 *      ➜ 已移除，仅保留「连接是否正常」的布尔结果与 JVM 内存概况。
 *
 *   3) POST /export-md
 *      将全表数据写出到服务器磁盘，并把绝对路径回显给调用方。
 *      ➜ 已删除。
 *
 * 当前类仅提供无副作用、无敏感信息的只读诊断接口。
 * 该控制器仍由 app.diagnostic.enabled 控制注册，生产环境务必保持 false。
 * ============================================================================
 */
@RestController
@ConditionalOnProperty(name = "app.diagnostic.enabled", havingValue = "true")
@RequestMapping("/api/diagnostic")
public class DiagnosticController {

    @Autowired(required = false)
    private javax.sql.DataSource dataSource;

    @Autowired(required = false)
    private IVocabularyService vocabularyService;

    /**
     * 最简单的存活探测接口。
     */
    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }

    /**
     * 系统状态检查。
     * 仅返回健康状态与 JVM 内存概况，不回显连接串、路径或环境变量。
     */
    @GetMapping("/status")
    public Map<String, Object> systemStatus() {
        Map<String, Object> status = new HashMap<>();

        // 仅报告连通性，不返回 URL、主机、库名等细节
        if (dataSource != null) {
            try (java.sql.Connection conn = dataSource.getConnection()) {
                boolean valid = conn.isValid(2);
                status.put("database", valid ? "连接正常" : "连接异常");
            } catch (Exception e) {
                status.put("database", "连接失败");
            }
        } else {
            status.put("database", "数据源未配置");
        }

        Runtime runtime = Runtime.getRuntime();
        status.put("jvm", Map.of(
                "totalMemory", runtime.totalMemory(),
                "freeMemory", runtime.freeMemory(),
                "maxMemory", runtime.maxMemory()
        ));

        // 仅保留非敏感的运行时版本信息
        status.put("runtime", Map.of(
                "javaVersion", System.getProperty("java.version")
        ));

        status.put("timestamp", System.currentTimeMillis());
        status.put("status", "运行正常");
        return status;
    }

    /**
     * 查询示例模板词条（只读）。
     * limit 为受控整数，配合参数绑定使用，不参与 SQL 拼接。
     */
    @GetMapping("/template-words")
    public Map<String, Object> getTemplateWords(@RequestParam(defaultValue = "20") int limit) {
        Map<String, Object> result = new HashMap<>();

        if (vocabularyService == null) {
            result.put("success", false);
            result.put("message", "词汇服务未配置");
            return result;
        }

        int safeLimit = Math.max(1, Math.min(limit, 100));

        List<Vocabulary> words = vocabularyService.lambdaQuery()
                .select(Vocabulary::getId, Vocabulary::getWord, Vocabulary::getTranslation, Vocabulary::getExample)
                .like(Vocabulary::getExample, "This is an example with")
                .last("LIMIT " + safeLimit)
                .list();

        result.put("success", true);
        result.put("limit", safeLimit);
        result.put("items", words);
        return result;
    }

    /**
     * 按词表查询词汇（只读）。
     */
    @GetMapping("/vocabulary")
    public Map<String, Object> getVocabularyByWords(@RequestParam String words) {
        Map<String, Object> result = new HashMap<>();

        if (vocabularyService == null) {
            result.put("success", false);
            result.put("message", "词汇服务未配置");
            return result;
        }

        List<String> wordList = new ArrayList<>();
        for (String w : words.split(",")) {
            String trimmed = w.trim();
            if (!trimmed.isEmpty()) {
                wordList.add(trimmed);
            }
        }
        if (wordList.isEmpty()) {
            result.put("success", false);
            result.put("message", "words 不能为空");
            return result;
        }

        List<Vocabulary> items = vocabularyService.lambdaQuery()
                .select(Vocabulary::getId, Vocabulary::getWord, Vocabulary::getTranslation,
                        Vocabulary::getExample, Vocabulary::getExampleTranslation)
                .in(Vocabulary::getWord, wordList)
                .list();

        result.put("success", true);
        result.put("items", items);
        return result;
    }
}
