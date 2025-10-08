package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.entity.DailyTask;
import com.learnsphere.entity.StudyPlan;
import com.learnsphere.service.impl.StudyPlanService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 学习计划控制器
 */
@RestController
@RequestMapping("/api/study-plan")
@RequiredArgsConstructor
public class StudyPlanController {

    private final StudyPlanService studyPlanService;

    /**
     * 创建学习计划
     */
    @PostMapping("/create")
    public Result<StudyPlan> createPlan(@RequestBody CreatePlanRequest request) {
        Long userId = StpUtil.getLoginIdAsLong();

        StudyPlan plan = studyPlanService.createPlan(
                userId,
                request.getExamType(),
                request.getTargetScore(),
                request.getDurationDays());

        return Result.success("学习计划创建成功", plan);
    }

    /**
     * 获取当前计划
     */
    @GetMapping("/current")
    public Result<StudyPlan> getCurrentPlan() {
        Long userId = StpUtil.getLoginIdAsLong();
        StudyPlan plan = studyPlanService.getCurrentPlan(userId);

        if (plan == null) {
            return Result.success("暂无进行中的学习计划", null);
        }

        return Result.success(plan);
    }

    /**
     * 获取今日任务
     */
    @GetMapping("/tasks/today")
    public Result<List<DailyTask>> getTodayTasks() {
        Long userId = StpUtil.getLoginIdAsLong();
        List<DailyTask> tasks = studyPlanService.getTodayTasks(userId);
        return Result.success(tasks);
    }

    /**
     * 完成任务
     */
    @PostMapping("/tasks/{id}/complete")
    public Result<?> completeTask(
            @PathVariable Long id,
            @RequestBody CompleteTaskRequest request) {
        studyPlanService.completeTask(id, request.getCompletedCount());
        return Result.success("任务完成");
    }

    @Data
    public static class CreatePlanRequest {
        private String examType; // cet4/cet6/ielts/toefl
        private Integer targetScore;
        private Integer durationDays;
    }

    @Data
    public static class CompleteTaskRequest {
        private Integer completedCount;
    }
}
