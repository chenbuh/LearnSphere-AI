package com.learnsphere.utils;

import com.learnsphere.entity.Vocabulary;
import com.learnsphere.mapper.VocabularyMapper;
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
public class VocabularyImporter {

    private final VocabularyMapper vocabularyMapper;

    public VocabularyImporter(VocabularyMapper vocabularyMapper) {
        this.vocabularyMapper = vocabularyMapper;
    }

    /**
     * 从JS文件导入词汇数据
     */
    public void importFromJsFile(String filePath) {
        try {
            System.out.println("=== 开始导入词汇数据 ===");
            System.out.println("文件路径: " + filePath);
            
            // 读取JS文件
            BufferedReader reader = new BufferedReader(new FileReader(filePath));
            StringBuilder content = new StringBuilder();
            String line;
            int lineCount = 0;
            while ((line = reader.readLine()) != null) {
                content.append(line).append("\n");
                lineCount++;
            }
            reader.close();
            
            System.out.println("读取文件成功，共 " + lineCount + " 行");
            System.out.println("文件内容长度: " + content.length() + " 字符");
            
            // 解析词汇数据
            List<Vocabulary> vocabularies = parseVocabularies(content.toString());
            System.out.println("解析到 " + vocabularies.size() + " 个词汇");
            
            if (vocabularies.isEmpty()) {
                System.err.println("警告：没有解析到任何词汇数据！");
                System.err.println("文件前100个字符: " + content.substring(0, Math.min(100, content.length())));
                return;
            }
            
            // 批量插入
            int successCount = 0;
            int errorCount = 0;
            
            for (int i = 0; i < vocabularies.size(); i++) {
                try {
                    vocabularyMapper.insert(vocabularies.get(i));
                    successCount++;
                    
                    if ((i + 1) % 500 == 0) {
                        System.out.println("已导入 " + (i + 1) + " / " + vocabularies.size() + " 个词汇");
                    }
                } catch (Exception e) {
                    errorCount++;
                    if (errorCount <= 10) {
                        System.err.println("导入失败: " + vocabularies.get(i).getWord() + " - " + e.getMessage());
                    }
                }
            }
            
            System.out.println("\n=== 导入完成 ===");
            System.out.println("成功: " + successCount + " 个");
            System.out.println("失败: " + errorCount + " 个");
            
        } catch (Exception e) {
            System.err.println("导入失败: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 解析JS文件中的词汇数据
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
            Pattern.DOTALL
        );
        
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
     * 解析JSON格式的词汇数据
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
            Pattern.DOTALL
        );
        
        Matcher matcher = pattern.matcher(arrayContent);
        int frequency = 5000;
        
        // 从文件名推断考试类型
        String examType = "cet4"; // 默认值
        if (content.contains("cet6")) examType = "cet6";
        else if (content.contains("ielts")) examType = "ielts";
        else if (content.contains("toefl")) examType = "toefl";
        else if (content.contains("gre")) examType = "gre";
        else if (content.contains("tem4")) examType = "tem4";
        else if (content.contains("tem8")) examType = "tem8";
        else if (content.contains("postgraduate")) examType = "postgraduate";
        
        while (matcher.find()) {
            Vocabulary vocabulary = new Vocabulary();
            vocabulary.setWord(matcher.group(1));
            vocabulary.setTranslation(matcher.group(2));
            vocabulary.setPhonetic(""); // JSON格式可能没有音标
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
        System.out.println("请在Spring Boot应用中使用此工具类");
        System.out.println("或创建一个Controller接口来触发导入");
    }
}
