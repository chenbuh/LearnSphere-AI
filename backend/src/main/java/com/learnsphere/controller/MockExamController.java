package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.service.IMockExamService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 模拟考试控制器
 */
@RestController
@RequestMapping("/api/exam")
@RequiredArgsConstructor
public class MockExamController {

    private final IMockExamService mockExamService;

    /**
     * 获取考试列表
     */
    @GetMapping("/list")
    public Result<List<Map<String, Object>>> getExamList(
            @RequestParam(required = false) String examType) {
        return Result.success(mockExamService.getExamList(examType));
    }

    /**
     * 生成新考试
     * 普通用户每日限5次（共享AI配额），VIP用户每日50-200次
     */
    @com.learnsphere.common.annotation.RequireVip(feature = "AI 模拟考试生成", quotaCost = 4, minLevel = 0)
    @PostMapping("/generate")
    public Result<Map<String, Object>> generateExam(@RequestBody GenerateExamRequest request) {
        Map<String, Object> result = mockExamService.generateExam(
                request.getExamType(),
                request.getDifficulty());
        return Result.success(result);
    }

    /**
     * 获取考试详情（开始考试）
     */
    @GetMapping("/detail/{examId}")
    public Result<Map<String, Object>> getExamDetail(@PathVariable Long examId) {
        Map<String, Object> result = mockExamService.getExamDetail(examId);
        if (result == null) {
            return Result.error("考试不存在");
        }
        return Result.success(result);
    }

    /**
     * 提交考试
     */
    @PostMapping("/submit")
    public Result<Map<String, Object>> submitExam(@RequestBody SubmitExamRequest request) {
        Long userId = StpUtil.getLoginIdAsLong();
        Map<String, Object> result = mockExamService.submitExam(
                userId,
                request.getExamId(),
                request.getAnswers(),
                request.getTimeSpent());
        return Result.success(result);
    }

    /**
     * 获取用户考试记录
     */
    @GetMapping("/records")
    public Result<List<Map<String, Object>>> getUserExamRecords() {
        Long userId = StpUtil.getLoginIdAsLong();
        return Result.success(mockExamService.getUserExamRecords(userId));
    }

    @Data
    public static class GenerateExamRequest {
        private String examType;
        private String difficulty;
    }

    @Data
    public static class SubmitExamRequest {
        private Long examId;
        private List<Object> answers;
        private Integer timeSpent;
    }
}
