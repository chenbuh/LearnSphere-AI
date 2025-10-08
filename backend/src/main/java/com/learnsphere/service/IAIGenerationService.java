package com.learnsphere.service;

import java.util.List;
import java.util.Map;

public interface IAIGenerationService {
    Map<String, Object> generateReading(String source, String category, String difficulty, String length);

    Map<String, Object> generateWriting(String examType, String mode);

    Map<String, Object> evaluateWriting(String topic, String content);

    Map<String, Object> generateListening(String type, String difficulty);

    Map<String, Object> generateGrammar(String topic, String difficulty);

    List<Map<String, Object>> getRecentReadings();

    List<Map<String, Object>> getRecentListenings();

    /**
     * 生成学习分析报告
     * 
     * @param userId 用户ID
     * @param stats  学习统计数据
     * @return 分析报告
     */
    Map<String, Object> generateLearningAnalysis(Long userId, Map<String, Object> stats);

    /**
     * 获取用户最近一次分析报告
     * 
     * @param userId 用户ID
     * @return 分析报告，如果不存在则返回 null
     */
    Map<String, Object> getLastAnalysis(Long userId);

    // Speaking
    Map<String, Object> generateSpeaking(String type, String difficulty);

    Map<String, Object> evaluateSpeaking(String topic, String transcription);
}
