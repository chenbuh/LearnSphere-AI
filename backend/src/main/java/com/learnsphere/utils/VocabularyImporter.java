package com.learnsphere.utils;

import com.learnsphere.entity.Vocabulary;
import com.learnsphere.mapper.VocabularyMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 词汇数据导入工具
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Component
@Slf4j
public class VocabularyImporter {

    private static final int PROGRESS_LOG_INTERVAL = 500;
    private static final int MAX_IMPORT_ERROR_LOGS = 10;

    private final VocabularyMapper vocabularyMapper;

    public VocabularyImporter(VocabularyMapper vocabularyMapper) {
        this.vocabularyMapper = vocabularyMapper;
    }

    /**
     * 从JS文件导入词汇数据
     */
    public void importFromJsFile(String filePath) {
        try {
            log.info("Vocabulary import started. filePath={}", filePath);

            // 读取JS文件
            StringBuilder content = new StringBuilder();
            String line;
            int lineCount = 0;
            try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
                while ((line = reader.readLine()) != null) {
                    content.append(line).append("\n");
                    lineCount++;
                }
            }

            log.info("Vocabulary source file loaded. filePath={}, lineCount={}, contentLength={}",
                    filePath, lineCount, content.length());

            // 解析词汇数据
            List<Vocabulary> vocabularies = parseVocabularies(content.toString());
            log.info("Vocabulary parsing completed. filePath={}, parsedCount={}", filePath, vocabularies.size());

            if (vocabularies.isEmpty()) {
                String preview = content.substring(0, Math.min(100, content.length())).replace('\n', ' ');
                log.warn("No vocabulary parsed from file. filePath={}, contentPreview={}", filePath, preview);
                return;
            }

            // 批量插入
            int successCount = 0;
            int errorCount = 0;

            for (int i = 0; i < vocabularies.size(); i++) {
                try {
                    vocabularyMapper.insert(vocabularies.get(i));
                    successCount++;

                    if ((i + 1) % PROGRESS_LOG_INTERVAL == 0) {
                        log.info("Vocabulary import progress. filePath={}, imported={}, total={}",
                                filePath, i + 1, vocabularies.size());
                    }
                } catch (Exception e) {
                    errorCount++;
                    if (errorCount <= MAX_IMPORT_ERROR_LOGS) {
                        log.warn("Vocabulary import item failed. filePath={}, index={}, word={}",
                                filePath, i, vocabularies.get(i).getWord(), e);
                    }
                }
            }

            log.info("Vocabulary import finished. filePath={}, successCount={}, errorCount={}, total={}",
                    filePath, successCount, errorCount, vocabularies.size());

        } catch (Exception e) {
            log.error("Vocabulary import failed. filePath={}", filePath, e);
        }
    }

    /**
     * 解析 JS 文件中的词汇数据
     * 支持两种格式：
     * 1. 标准 JSON 格式 (包含 "word": "...")
     * 2. JS 对象格式 (word: "...", meaning: "...")
     * 
     * 会尝试使用正则表达式提取 word, translation, phonetic, difficulty 等字段。
     * 并为每个单词生成默认的频率排序（用于热门词汇推荐）。
     *
     * @param content 文件内容字符串
     * @return 解析后的 Vocabulary 对象列表
     */
    private List<Vocabulary> parseVocabularies(String content) {
        List<Vocabulary> vocabularies = new ArrayList<>();

        // 尝试JSON格式解析
        if (content.contains("\"word\":")) {
            vocabularies = parseJsonFormat(content);
            if (!vocabularies.isEmpty()) {
                return vocabularies;
            }
        }

        // 尝试对象格式解析
        Pattern pattern = Pattern.compile(
                "\\{\\s*word:\\s*\"([^\"]+)\"[^}]*?meaning:\\s*\"([^\"]+)\"[^}]*?phonetic:\\s*\"([^\"]*?)\"[^}]*?difficulty:\\s*(\\d+)[^}]*?examType:\\s*\"([^\"]+)\"[^}]*?\\}",
                Pattern.DOTALL);

        Matcher matcher = pattern.matcher(content);
        int frequency = 5000;

        while (matcher.find()) {
            Vocabulary vocabulary = new Vocabulary();
            vocabulary.setWord(matcher.group(1));
            vocabulary.setTranslation(matcher.group(2));
            vocabulary.setPhonetic(matcher.group(3));
            vocabulary.setDifficulty(Integer.parseInt(matcher.group(4)));
            vocabulary.setExamType(matcher.group(5));
            vocabulary.setFrequency(frequency--);

            vocabularies.add(vocabulary);
        }

        return vocabularies;
    }

    /**
     * 解析 JSON 格式的词汇数据
     */
    private List<Vocabulary> parseJsonFormat(String content) {
        List<Vocabulary> vocabularies = new ArrayList<>();

        // 提取数组部分
        int startIndex = content.indexOf('[');
        int endIndex = content.lastIndexOf(']');
        if (startIndex == -1 || endIndex == -1) {
            return vocabularies;
        }

        String arrayContent = content.substring(startIndex + 1, endIndex);

        // 简单的JSON对象解析
        Pattern pattern = Pattern.compile(
                "\\{[^}]*?\"word\"\\s*:\\s*\"([^\"]+)\"[^}]*?\"meaning\"\\s*:\\s*\"([^\"]+)\"[^}]*?\\}",
                Pattern.DOTALL);

        Matcher matcher = pattern.matcher(arrayContent);
        int frequency = 5000;

        // 从文件名推断考试类型
        String examType = "cet4"; // 默认
        if (content.contains("cet6"))
            examType = "cet6";
        else if (content.contains("ielts"))
            examType = "ielts";
        else if (content.contains("toefl"))
            examType = "toefl";
        else if (content.contains("gre"))
            examType = "gre";
        else if (content.contains("tem4"))
            examType = "tem4";
        else if (content.contains("tem8"))
            examType = "tem8";
        else if (content.contains("postgraduate"))
            examType = "postgraduate";

        while (matcher.find()) {
            Vocabulary vocabulary = new Vocabulary();
            vocabulary.setWord(matcher.group(1));
            vocabulary.setTranslation(matcher.group(2));
            vocabulary.setPhonetic(""); // JSON格式通常没有音标
            vocabulary.setDifficulty(2); // 默认难度
            vocabulary.setExamType(examType);
            vocabulary.setFrequency(frequency--);

            vocabularies.add(vocabulary);
        }

        return vocabularies;
    }

    /**
     * 主方法 - 用于独立运行
     */
    public static void main(String[] args) {
        log.info("Please use VocabularyImporter inside Spring Boot application context.");
        log.info("Or create a Controller endpoint to trigger import.");
    }
}
