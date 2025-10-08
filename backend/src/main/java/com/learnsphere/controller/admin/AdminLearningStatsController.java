package com.learnsphere.controller.admin;

import com.learnsphere.common.Result;
import com.learnsphere.mapper.DailyTaskMapper;
import com.learnsphere.mapper.StudyPlanMapper;
import com.learnsphere.mapper.VocabularyMasteryMapper;
import com.learnsphere.mapper.LearningRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * 管理后台 - 学习数据统计
 */
@RestController
@RequestMapping("/api/admin/learning-stats")
@RequiredArgsConstructor
public class AdminLearningStatsController {

        private final StudyPlanMapper studyPlanMapper;
        private final DailyTaskMapper dailyTaskMapper;
        private final VocabularyMasteryMapper vocabularyMasteryMapper;
        private final LearningRecordMapper learningRecordMapper;

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

                return Result.success(studyPlanMapper.selectPage(pageParam, wrapper));
        }

        /**
         * 获取词汇掌握度Top用户
         */
        @GetMapping("/mastery/top-users")
        public Result<?> getTopMasteryUsers(@RequestParam(defaultValue = "10") Integer limit) {
                // 这里简化返回，实际应该关联用户表获取用户信息
                return Result.success("请在前端使用原生SQL或优化查询");
        }
}
