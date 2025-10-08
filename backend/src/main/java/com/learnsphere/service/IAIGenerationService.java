package com.learnsphere.service;

import java.util.List;
import java.util.Map;

/**
 * AI 生成服务接口
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
public interface IAIGenerationService {

    /**
     * 生成阅读理解
     */
    Map<String, Object> generateReading(String source, String category, String difficulty, String length);

    /**
     * 生成写作题目
     */
    Map<String, Object> generateWriting(String examType, String mode);

    /**
     * 评估写作内容
     */
    Map<String, Object> evaluateWriting(String topic, String content);

    /**
     * 生成听力练习
     */
    Map<String, Object> generateListening(String type, String difficulty, Integer count);

    /**
     * 生成语法练习
     */
    Map<String, Object> generateGrammar(String topic, String difficulty);

    /**
     * 生成口语练习
     */
    Map<String, Object> generateSpeaking(String type, String difficulty);

    /**
     * 评估口语内容
     */
    Map<String, Object> evaluateSpeaking(String topic, String transcription);

    /**
     * 从本地数据生成（当 AI 配额不足时）
     */
    Map<String, Object> generateFromLocal(String type, Map<String, Object> criteria);

    /**
     * 获取最近的阅读记录
     */
    Map<String, Object> getRecentReadings(int page, int size);

    /**
     * 获取最近的听力记录
     */
    Map<String, Object> getRecentListenings(int page, int size);

    /**
     * 获取最近的语法记录
     */
    Map<String, Object> getRecentGrammars(int page, int size);

    /**
     * 获取最近的口语记录
     */
    Map<String, Object> getRecentSpeakings(int page, int size);

    /**
     * 获取最近的写作记录
     */
    Map<String, Object> getRecentWritings(int page, int size);

    /**
     * 生成词汇详情
     */
    Map<String, Object> generateVocabularyDetails(String word, String examType);

    /**
     * 获取最后的学习分析报告
     */
    Map<String, Object> getLastAnalysis(Long userId);

    /**
     * 生成学习分析报告
     */
    Map<String, Object> generateLearningAnalysis(Long userId, Map<String, Object> statistics);

    /**
     * 个性化错题深度 RAG 解析
     */
    Map<String, Object> deepAnalyzeError(Long recordId);

    /**
     * 开启口语1V1模考会话
     */
    Map<String, Object> startSpeakingMock(String topic, String difficulty);

    /**
     * 继续口语1V1模考对话
     */
    Map<String, Object> continueSpeakingMock(String sessionId, String userTranscription);

    /**
     * 生成口语模考全量分析报告
     */
    Map<String, Object> generateSpeakingReport(List<Map<String, String>> conversation);

    /**
     * AI 内容审查机器人
     */
    Map<String, Object> auditContent(String contentType, Long contentId);
}
