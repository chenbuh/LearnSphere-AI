package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.entity.MockExam;
import java.util.List;
import java.util.Map;

/**
 * 模拟考试服务接口
 */
public interface IMockExamService extends IService<MockExam> {

    /**
     * 获取考试列表
     */
    List<Map<String, Object>> getExamList(String examType);

    /**
     * 生成新考试（AI生成或从数据库获取）
     */
    Map<String, Object> generateExam(String examType, String difficulty);

    /**
     * 获取考试详情（包含题目）
     */
    Map<String, Object> getExamDetail(Long examId);

    /**
     * 提交考试答案
     */
    Map<String, Object> submitExam(Long userId, Long examId, List<Object> answers, Integer timeSpent);

    /**
     * 获取用户考试记录
     */
    List<Map<String, Object>> getUserExamRecords(Long userId);

    /**
     * 获取考试详情（仅查看，不增加参与人数）
     */
    Map<String, Object> getExamDetailOnly(Long examId);
}
