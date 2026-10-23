package com.learnsphere.controller.admin;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.learnsphere.common.Result;
import com.learnsphere.mapper.DailyTaskMapper;
import com.learnsphere.mapper.StudyPlanMapper;
import com.learnsphere.mapper.VocabularyMasteryMapper;
import com.learnsphere.mapper.LearningRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 管理后台 - 学习数据统计
 */
@RestController
@RequestMapping("/api/admin/learning-stats")
@SaCheckRole("admin")
@RequiredArgsConstructor
public class AdminLearningStatsController {

        private final StudyPlanMapper studyPlanMapper;
        private final DailyTaskMapper dailyTaskMapper;
        private final VocabularyMasteryMapper vocabularyMasteryMapper;
        private final LearningRecordMapper learningRecordMapper;
        private final com.learnsphere.service.IUserService userService;

        /**
         * 获取学习数据大屏统计
         */
        @GetMapping("/dashboard")
        public Result<Map<String, Object>> getDashboardStats() {
                Map<String, Object> stats = new HashMap<>();

                // 1. 学习计划统计
                Map<String, Object> planStats = new HashMap<>();
                planStats.put("total", studyPlanMapper.selectCount(null));
                planStats.put("inProgress", studyPlanMapper.selectCount(
                                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.learnsphere.entity.StudyPlan>()
                                                .eq(com.learnsphere.entity.StudyPlan::getStatus, 1)));
                planStats.put("completed", studyPlanMapper.selectCount(
                                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.learnsphere.entity.StudyPlan>()
                                                .eq(com.learnsphere.entity.StudyPlan::getStatus, 0)));
                stats.put("studyPlans", planStats);

                // 2. 每日任务统计
                Map<String, Object> taskStats = new HashMap<>();
                taskStats.put("todayTotal", dailyTaskMapper.selectCount(
                                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.learnsphere.entity.DailyTask>()
                                                .eq(com.learnsphere.entity.DailyTask::getTaskDate, LocalDate.now())));
                taskStats.put("todayCompleted", dailyTaskMapper.selectCount(
                                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.learnsphere.entity.DailyTask>()
                                                .eq(com.learnsphere.entity.DailyTask::getTaskDate, LocalDate.now())
                                                .eq(com.learnsphere.entity.DailyTask::getIsCompleted, true)));
                stats.put("dailyTasks", taskStats);

                // 3. 词汇掌握度统计
                Map<String, Object> masteryStats = new HashMap<>();
                masteryStats.put("totalRecords", vocabularyMasteryMapper.selectCount(null));
                masteryStats.put("masteredWords", vocabularyMasteryMapper.selectCount(
                                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.learnsphere.entity.VocabularyMastery>()
                                                .eq(com.learnsphere.entity.VocabularyMastery::getMasteryLevel, 5)));
                stats.put("vocabularyMastery", masteryStats);

                // 4. 学习记录统计
                Map<String, Object> recordStats = new HashMap<>();
                recordStats.put("total", learningRecordMapper.selectCount(null));
                recordStats.put("today", learningRecordMapper.selectCount(
                                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.learnsphere.entity.LearningRecord>()
                                                .ge(com.learnsphere.entity.LearningRecord::getCreateTime,
                                                                LocalDate.now().atStartOfDay())));
                stats.put("learningRecords", recordStats);

                return Result.success(stats);
        }

        /**
         * 获取用户学习详情
         */
        @GetMapping("/user/{userId}")
        public Result<Map<String, Object>> getUserLearningDetail(@PathVariable Long userId) {
                Map<String, Object> detail = new HashMap<>();

                // 当前学习计划
                com.learnsphere.entity.StudyPlan currentPlan = studyPlanMapper.selectOne(
                                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.learnsphere.entity.StudyPlan>()
                                                .eq(com.learnsphere.entity.StudyPlan::getUserId, userId)
                                                .eq(com.learnsphere.entity.StudyPlan::getStatus, 1)
                                                .orderByDesc(com.learnsphere.entity.StudyPlan::getCreateTime)
                                                .last("LIMIT 1"));
                detail.put("currentPlan", currentPlan);

                // 今日任务
                detail.put("todayTasks", dailyTaskMapper.getTodayTasks(userId, LocalDate.now()));

                // 词汇掌握统计
                detail.put("masteryStats", vocabularyMasteryMapper.getMasteryStats(userId));

                // 最近学习记录（10条）
                detail.put("recentRecords", learningRecordMapper.selectList(
                                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.learnsphere.entity.LearningRecord>()
                                                .eq(com.learnsphere.entity.LearningRecord::getUserId, userId)
                                                .orderByDesc(com.learnsphere.entity.LearningRecord::getCreateTime)
                                                .last("LIMIT 10")));

                return Result.success(detail);
        }

        /**
         * 获取学习计划列表（所有用户）
         */
        @GetMapping("/plans")
        public Result<?> getAllPlans(
                        @RequestParam(defaultValue = "1") Integer page,
                        @RequestParam(defaultValue = "20") Integer pageSize,
                        @RequestParam(required = false) Integer status) {
                com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.learnsphere.entity.StudyPlan> pageParam = new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(
                                page, pageSize);

                com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.learnsphere.entity.StudyPlan> wrapper = new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();

                if (status != null) {
                        wrapper.eq(com.learnsphere.entity.StudyPlan::getStatus, status);
                }

                wrapper.orderByDesc(com.learnsphere.entity.StudyPlan::getCreateTime);

                com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.learnsphere.entity.StudyPlan> result = studyPlanMapper
                                .selectPage(pageParam, wrapper);
                Map<Long, com.learnsphere.entity.User> users = loadUsers(result.getRecords().stream()
                                .map(com.learnsphere.entity.StudyPlan::getUserId).collect(Collectors.toSet()));

                com.baomidou.mybatisplus.extension.plugins.pagination.Page<Map<String, Object>> view = new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(
                                result.getCurrent(), result.getSize(), result.getTotal());
                view.setRecords(result.getRecords().stream().map(plan -> {
                        Map<String, Object> row = new HashMap<>();
                        com.learnsphere.entity.User user = users.get(plan.getUserId());
                        row.put("id", plan.getId());
                        row.put("userId", plan.getUserId());
                        row.put("username", user == null ? null : user.getUsername());
                        row.put("examType", plan.getExamType());
                        row.put("targetScore", plan.getTargetScore());
                        row.put("durationDays", plan.getDurationDays());
                        row.put("startDate", plan.getStartDate());
                        row.put("endDate", plan.getEndDate());
                        row.put("status", plan.getStatus());
                        row.put("progress", plan.getProgress());
                        row.put("createTime", plan.getCreateTime());
                        return row;
                }).toList());
                return Result.success(view);
        }

        /**
         * 获取词汇掌握度Top用户
         */
        @GetMapping("/mastery/top-users")
        public Result<?> getTopMasteryUsers(@RequestParam(defaultValue = "10") Integer limit) {
                int safeLimit = Math.max(1, Math.min(limit, 50));
                com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.learnsphere.entity.VocabularyMastery> query = new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
                query.select("user_id AS userId",
                                "COUNT(*) AS totalWords",
                                "SUM(CASE WHEN mastery_level >= 5 THEN 1 ELSE 0 END) AS masteredWords",
                                "MAX(last_review_time) AS lastReviewTime")
                                .groupBy("user_id")
                                .orderByDesc("masteredWords")
                                .orderByDesc("totalWords")
                                .last("LIMIT " + safeLimit);
                List<Map<String, Object>> rows = vocabularyMasteryMapper.selectMaps(query);

                Map<Long, com.learnsphere.entity.User> users = loadUsers(rows.stream()
                                .map(row -> row.get("userId"))
                                .filter(java.util.Objects::nonNull)
                                .map(id -> Long.valueOf(id.toString()))
                                .collect(Collectors.toSet()));
                for (Map<String, Object> row : rows) {
                        Object id = row.get("userId");
                        com.learnsphere.entity.User user = id == null ? null : users.get(Long.valueOf(id.toString()));
                        row.put("username", user == null ? null : user.getUsername());
                        row.put("nickname", user == null ? null : user.getNickname());
                }
                return Result.success(rows);
        }

        private Map<Long, com.learnsphere.entity.User> loadUsers(java.util.Set<Long> ids) {
                if (ids.isEmpty()) {
                        return Map.of();
                }
                return userService.listByIds(ids).stream()
                                .collect(Collectors.toMap(com.learnsphere.entity.User::getId, u -> u));
        }
}
