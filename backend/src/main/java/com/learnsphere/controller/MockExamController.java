package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.service.IMockExamService;
import lombok.Data;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "模拟考试接口", description = "真题/AI 模拟试卷列表、动态组卷及自动评分提交")
public class MockExamController {

    private final IMockExamService mockExamService;

    /**
     * 获取考试列表
     */
    @Operation(summary = "获取可用考试列表")
    @GetMapping("/list")
    public Result<List<Map<String, Object>>> getExamList(
            @RequestParam(required = false) String examType) {
        return Result.success(mockExamService.getExamList(examType));
    }

    /**
     * 生成新考试
     * 普通用户每日限5次（共享AI配额），VIP用户每日50-200次
     */
    @Operation(summary = "实时生成 AI 模拟考试", description = "基于所选难度和类型，调用 AI 实时编排一套完整的试卷")
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
    @Operation(summary = "获取考试卷面详情")
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
    @Operation(summary = "提交考试答案并获取评分")
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
    @Schema(description = "生成考试请求参数")
    public static class GenerateExamRequest {
        @Schema(description = "考试类型", example = "ielts")
        private String examType;
        @Schema(description = "难度等级", example = "Hard")
        private String difficulty;
    }

    @Data
    @Schema(description = "考试提交参数")
    public static class SubmitExamRequest {
        @Schema(description = "考试 ID")
        private Long examId;
        @Schema(description = "用户答案列表")
        private List<Object> answers;
        @Schema(description = "耗时（秒）")
        private Integer timeSpent;
    }
}
