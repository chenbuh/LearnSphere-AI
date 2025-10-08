package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.DailyTask;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

/**
 * 每日任务 Mapper
 */
@Mapper
public interface DailyTaskMapper extends BaseMapper<DailyTask> {

    /**
     * 获取用户今日任务
     */
    @Select("SELECT * FROM daily_task WHERE user_id = #{userId} AND task_date = #{date} ORDER BY task_type")
    List<DailyTask> getTodayTasks(@Param("userId") Long userId, @Param("date") LocalDate date);

    /**
     * 获取计划的所有任务
     */
    @Select("SELECT * FROM daily_task WHERE plan_id = #{planId} ORDER BY task_date, task_type")
    List<DailyTask> getPlanTasks(@Param("planId") Long planId);
}
