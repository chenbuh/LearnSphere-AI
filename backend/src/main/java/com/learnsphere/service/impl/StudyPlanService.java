package com.learnsphere.service.impl;

import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.learnsphere.entity.DailyTask;
import com.learnsphere.entity.StudyPlan;
import com.learnsphere.mapper.DailyTaskMapper;
import com.learnsphere.mapper.StudyPlanMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 学习计划服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StudyPlanService {

    private final StudyPlanMapper studyPlanMapper;
    private final DailyTaskMapper dailyTaskMapper;

    /**
     * 创建学习计划
     */
    @Transactional
    public StudyPlan createPlan(Long userId, String examType, Integer targetScore, Integer durationDays) {
        log.info("Creating study plan: userId={}, examType={}, target={}, days={}",
                userId, examType, targetScore, durationDays);

        // 创建计划
        StudyPlan plan = new StudyPlan();
        plan.setUserId(userId);
        plan.setExamType(examType);
        plan.setTargetScore(targetScore);
        plan.setCurrentLevel(estimateCurrentLevel(userId)); // 评估当前水平
        plan.setDurationDays(durationDays);
        plan.setStartDate(LocalDate.now());
        plan.setEndDate(LocalDate.now().plusDays(durationDays));
        plan.setStatus(1); // 进行中
        plan.setProgress(0);

        // 生成详细计划
        String planDetail = generatePlanDetail(examType, targetScore, durationDays);
        plan.setPlanDetail(planDetail);

        studyPlanMapper.insert(plan);

        // 生成每日任务
        generateDailyTasks(plan);

        return plan;
    }

    /**
     * 获取当前计划
     */
    public StudyPlan getCurrentPlan(Long userId) {
        LambdaQueryWrapper<StudyPlan> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StudyPlan::getUserId, userId)
                .eq(StudyPlan::getStatus, 1) // 进行中
                .orderByDesc(StudyPlan::getCreateTime)
                .last("LIMIT 1");

        return studyPlanMapper.selectOne(wrapper);
    }

    /**
     * 获取今日任务
     */
    public List<DailyTask> getTodayTasks(Long userId) {
        return dailyTaskMapper.getTodayTasks(userId, LocalDate.now());
    }

    /**
     * 完成任务
     */
    @Transactional
    public void completeTask(Long taskId, Integer completedCount) {
        DailyTask task = dailyTaskMapper.selectById(taskId);
        if (task == null) {
            throw new RuntimeException("Task not found");
        }

        task.setCompletedCount(completedCount);
        task.setIsCompleted(completedCount >= task.getTargetCount());

        if (task.getIsCompleted()) {
            task.setCompleteTime(LocalDateTime.now());
        }

        dailyTaskMapper.updateById(task);

        // 更新计划进度
        updatePlanProgress(task.getPlanId());
    }

    /**
     * 评估当前水平（简化版）
     */
    private Integer estimateCurrentLevel(Long userId) {
        // TODO: 根据历史数据评估
        return 400; // 默认返回400分
    }

    /**
     * 生成计划详情（简化版）
     */
    private String generatePlanDetail(String examType, Integer targetScore, Integer durationDays) {
        Map<String, Object> detail = new HashMap<>();

        // 根据天数分周
        int weeks = (durationDays + 6) / 7;
        List<Map<String, Object>> weekPlans = new ArrayList<>();

        for (int i = 1; i <= weeks; i++) {
            Map<String, Object> weekPlan = new HashMap<>();
            weekPlan.put("week", i);

            if (i == 1) {
                weekPlan.put("focus", "词汇基础");
                weekPlan.put("tasks", Arrays.asList(
                        "每天学习100个新单词",
                        "复习已学单词",
                        "基础语法练习30分钟"));
            } else if (i == 2) {
                weekPlan.put("focus", "阅读技巧");
                weekPlan.put("tasks", Arrays.asList(
                        "每天阅读2篇文章",
                        "词汇复习",
                        "语法强化练习"));
            } else if (i == weeks) {
                weekPlan.put("focus", "模拟考试");
                weekPlan.put("tasks", Arrays.asList(
                        "完整模拟考试2次",
                        "薄弱点强化",
                        "考前冲刺复习"));
            } else {
                weekPlan.put("focus", "综合训练");
                weekPlan.put("tasks", Arrays.asList(
                        "听力训练1小时",
                        "阅读练习",
                        "语法巩固"));
            }

            weekPlans.add(weekPlan);
        }

        detail.put("weeks", weekPlans);
        detail.put("targetScore", targetScore);
        detail.put("examType", examType);

        return JSONUtil.toJsonStr(detail);
    }

    /**
     * 生成每日任务（前7天）
     */
    private void generateDailyTasks(StudyPlan plan) {
        LocalDate startDate = plan.getStartDate();

        // 生成未来7天的任务
        for (int i = 0; i < 7; i++) {
            LocalDate taskDate = startDate.plusDays(i);

            // 词汇任务
            createTask(plan.getUserId(), plan.getId(), taskDate, "vocabulary",
                    "学习新单词", 50);

            // 阅读任务
            createTask(plan.getUserId(), plan.getId(), taskDate, "reading",
                    "阅读文章", 2);

            // 听力任务
            createTask(plan.getUserId(), plan.getId(), taskDate, "listening",
                    "听力练习（分钟）", 30);

            // 语法任务
            createTask(plan.getUserId(), plan.getId(), taskDate, "grammar",
                    "语法练习题", 10);
        }
    }

    /**
     * 创建单个任务
     */
    private void createTask(Long userId, Long planId, LocalDate taskDate,
            String taskType, String taskName, Integer targetCount) {
        DailyTask task = new DailyTask();
        task.setUserId(userId);
        task.setPlanId(planId);
        task.setTaskDate(taskDate);
        task.setTaskType(taskType);
        task.setTaskName(taskName);
        task.setTargetCount(targetCount);
        task.setCompletedCount(0);
        task.setIsCompleted(false);

        dailyTaskMapper.insert(task);
    }

    /**
     * 更新计划进度
     */
    private void updatePlanProgress(Long planId) {
        if (planId == null)
            return;

        // 获取所有任务
        List<DailyTask> tasks = dailyTaskMapper.getPlanTasks(planId);
        if (tasks.isEmpty())
            return;

        // 计算完成率
        long completedCount = tasks.stream().filter(DailyTask::getIsCompleted).count();
        int progress = (int) ((completedCount * 100) / tasks.size());

        // 更新计划
        StudyPlan plan = studyPlanMapper.selectById(planId);
        if (plan != null) {
            plan.setProgress(progress);

            // 如果全部完成，更新状态
            if (progress == 100) {
                plan.setStatus(0); // 已完成
            }

            studyPlanMapper.updateById(plan);
        }
    }
}
