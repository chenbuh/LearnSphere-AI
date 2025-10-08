package com.learnsphere.controller;

import com.learnsphere.entity.Vocabulary;
import com.learnsphere.service.IVocabularyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 诊断控制器 - 用于检查系统状态
 */
@RestController
@RequestMapping("/api/diagnostic")
public class DiagnosticController {

    @Autowired(required = false)
    private DataSource dataSource;

    @Autowired(required = false)
    private IVocabularyService vocabularyService;

    /**
     * 最简单的测试接口
     */
    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }

    /**
     * 系统状态检查
     */
    @GetMapping("/status")
    public Map<String, Object> systemStatus() {
        Map<String, Object> status = new HashMap<>();
        
        try {
            // 检查数据库连接
            if (dataSource != null) {
                try (Connection conn = dataSource.getConnection()) {
                    status.put("database", "连接正常");
                    status.put("databaseUrl", conn.getMetaData().getURL());
                } catch (Exception e) {
                    status.put("database", "连接失败: " + e.getMessage());
                }
            } else {
                status.put("database", "数据源未配置");
            }
            
            // 检查JVM信息
            Runtime runtime = Runtime.getRuntime();
            status.put("jvm", Map.of(
                "totalMemory", runtime.totalMemory(),
                "freeMemory", runtime.freeMemory(),
                "maxMemory", runtime.maxMemory()
            ));
            
            // 检查系统属性
            status.put("system", Map.of(
                "javaVersion", System.getProperty("java.version"),
                "osName", System.getProperty("os.name"),
                "userDir", System.getProperty("user.dir")
            ));
            
            status.put("timestamp", System.currentTimeMillis());
            status.put("status", "运行正常");
            
        } catch (Exception e) {
            status.put("error", e.getMessage());
            status.put("status", "异常");
        }
        
        return status;
    }

    @GetMapping("/apply-example-fix")
    public Map<String, Object> applyExampleFix(@RequestParam(defaultValue = "fix_examples_batch21_30.sql") String file) {
        Map<String, Object> result = new HashMap<>();

        if (dataSource == null) {
            result.put("success", false);
            result.put("message", "数据源未配置");
            return result;
        }

        String fileName = Paths.get(file).getFileName().toString();
        if (!"fix_examples_batch21_30.sql".equals(fileName)) {
            result.put("success", false);
            result.put("message", "仅允许执行 fix_examples_batch21_30.sql");
            return result;
        }

        Path workingDir = Paths.get(System.getProperty("user.dir"));
        Path sqlPath = workingDir.resolve(fileName).normalize();
        if (!Files.exists(sqlPath)) {
            Path fallback = workingDir.resolve("backend").resolve(fileName).normalize();
            if (Files.exists(fallback)) {
                sqlPath = fallback;
            } else {
                result.put("success", false);
                result.put("message", "未找到SQL文件: " + sqlPath);
                return result;
            }
        }

        try {
            List<String> lines = Files.readAllLines(sqlPath, StandardCharsets.UTF_8);
            StringBuilder builder = new StringBuilder();
            for (String line : lines) {
                String trimmed = line.trim();
                if (trimmed.startsWith("--") || trimmed.isEmpty()) {
                    continue;
                }
                builder.append(line).append('\n');
            }

            String cleanedSql = builder.toString();
            String[] parts = cleanedSql.split(";");
            List<String> statements = new ArrayList<>();
            for (String part : parts) {
                String stmt = part.trim();
                if (!stmt.isEmpty()) {
                    statements.add(stmt);
                }
            }

            int executed = 0;
            int affectedRows = 0;

            try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
                for (String sql : statements) {
                    boolean hasResultSet = stmt.execute(sql);
                    executed++;
                    if (!hasResultSet) {
                        int count = stmt.getUpdateCount();
                        if (count > 0) {
                            affectedRows += count;
                        }
                    }
                }
            }

            result.put("success", true);
            result.put("file", fileName);
            result.put("executedStatements", executed);
            result.put("affectedRows", affectedRows);
            result.put("message", "执行完成");
            return result;
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "执行失败: " + e.getMessage());
            return result;
        }
    }

    @GetMapping("/template-words")
    public Map<String, Object> getTemplateWords(@RequestParam(defaultValue = "20") int limit) {
        Map<String, Object> result = new HashMap<>();

        if (vocabularyService == null) {
            result.put("success", false);
            result.put("message", "词汇服务未配置");
            return result;
        }

        if (limit < 1) {
            limit = 1;
        }
        if (limit > 100) {
            limit = 100;
        }

        List<Vocabulary> words = vocabularyService.lambdaQuery()
            .select(Vocabulary::getId, Vocabulary::getWord, Vocabulary::getTranslation, Vocabulary::getExample)
            .like(Vocabulary::getExample, "This is an example with")
            .last("LIMIT " + limit)
            .list();

        result.put("success", true);
        result.put("limit", limit);
        result.put("items", words);
        return result;
    }

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
            .select(Vocabulary::getId, Vocabulary::getWord, Vocabulary::getTranslation, Vocabulary::getExample, Vocabulary::getExampleTranslation)
            .in(Vocabulary::getWord, wordList)
            .list();

        result.put("success", true);
        result.put("items", items);
        return result;
    }

    @GetMapping("/example-duplicates")
    public Map<String, Object> getExampleDuplicates(@RequestParam(defaultValue = "20") int limit) {
        Map<String, Object> result = new HashMap<>();

        if (dataSource == null) {
            result.put("success", false);
            result.put("message", "数据源未配置");
            return result;
        }

        if (limit < 1) {
            limit = 1;
        }
        if (limit > 100) {
            limit = 100;
        }

        String sql = "SELECT example, COUNT(*) AS cnt FROM vocabulary " +
            "WHERE example IS NOT NULL AND example != '' " +
            "GROUP BY example HAVING cnt > 1 " +
            "ORDER BY cnt DESC LIMIT " + limit;

        List<Map<String, Object>> items = new ArrayList<>();
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("example", rs.getString("example"));
                row.put("count", rs.getLong("cnt"));
                items.add(row);
            }
            result.put("success", true);
            result.put("limit", limit);
            result.put("items", items);
            return result;
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "查询失败: " + e.getMessage());
            return result;
        }
    }

    @GetMapping("/words-by-example")
    public Map<String, Object> getWordsByExample(@RequestParam String example, @RequestParam(defaultValue = "20") int limit) {
        Map<String, Object> result = new HashMap<>();

        if (dataSource == null) {
            result.put("success", false);
            result.put("message", "数据源未配置");
            return result;
        }

        if (example == null || example.trim().isEmpty()) {
            result.put("success", false);
            result.put("message", "example 不能为空");
            return result;
        }

        if (limit < 1) {
            limit = 1;
        }
        if (limit > 200) {
            limit = 200;
        }

        List<Map<String, Object>> items = new ArrayList<>();
        String sql = "SELECT id, word, translation, example, example_translation FROM vocabulary WHERE example = ? LIMIT " + limit;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, example);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> row = new HashMap<>();
                    row.put("id", rs.getLong("id"));
                    row.put("word", rs.getString("word"));
                    row.put("translation", rs.getString("translation"));
                    row.put("example", rs.getString("example"));
                    row.put("exampleTranslation", rs.getString("example_translation"));
                    items.add(row);
                }
            }
            result.put("success", true);
            result.put("limit", limit);
            result.put("items", items);
            return result;
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "查询失败: " + e.getMessage());
            return result;
        }
    }

    /**
     * 导出所有单词到Markdown文件
     */
    @GetMapping("/export-md")
    public Map<String, Object> exportVocabularyToMd() {
        Map<String, Object> result = new HashMap<>();

        if (vocabularyService == null) {
            result.put("success", false);
            result.put("message", "词汇服务未配置");
            return result;
        }

        try {
            List<Vocabulary> allWords = vocabularyService.list();
            
            Path workingDir = Paths.get(System.getProperty("user.dir"));
            Path mdPath = workingDir.resolve("vocabulary_list.md");
            
            StringBuilder sb = new StringBuilder();
            sb.append("# Vocabulary List\n\n");
            sb.append("Total words: ").append(allWords.size()).append("\n\n");
            sb.append("| ID | Word | Phonetic | Translation | Example | Example Translation |\n");
            sb.append("|---:|---|---|---|---|---|\n");
            
            for (Vocabulary v : allWords) {
                sb.append("| ").append(v.getId()).append(" | ")
                  .append(escapeMd(v.getWord())).append(" | ")
                  .append(escapeMd(v.getPhonetic())).append(" | ")
                  .append(escapeMd(v.getTranslation())).append(" | ")
                  .append(escapeMd(v.getExample())).append(" | ")
                  .append(escapeMd(v.getExampleTranslation())).append(" |\n");
            }
            
            Files.writeString(mdPath, sb.toString(), StandardCharsets.UTF_8);
            
            result.put("success", true);
            result.put("count", allWords.size());
            result.put("path", mdPath.toString());
            result.put("message", "导出成功");
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "导出失败: " + e.getMessage());
        }
        
        return result;
    }
    
    private String escapeMd(String s) {
        if (s == null) return "";
        return s.replace("|", "\\|").replace("\n", " ").replace("\r", "");
    }

}
