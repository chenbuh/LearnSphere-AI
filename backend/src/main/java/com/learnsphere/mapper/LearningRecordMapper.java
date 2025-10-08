package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.LearningRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.Map;

/**
 * 学习记录Mapper
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Mapper
public interface LearningRecordMapper extends BaseMapper<LearningRecord> {

        /**
         * 获取用户学习统计
         */
        @Select("SELECT " +
                        "COUNT(*) as totalCount, " +
                        "SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correctCount, " +
                        "AVG(score) as avgScore, " +
                        "SUM(time_spent) as totalTimeSpent " +
                        "FROM learning_record " +
                        "WHERE user_id = #{userId} AND deleted = 0")
        Map<String, Object> getUserStatistics(@Param("userId") Long userId);

        /**
         * 获取用户按内容类型的学习统计
         */
        @Select("SELECT " +
                        "content_type, " +
                        "COUNT(*) as count, " +
                        "SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correctCount, " +
                        "AVG(score) as avgScore " +
                        "FROM learning_record " +
                        "WHERE user_id = #{userId} AND deleted = 0 " +
                        "GROUP BY content_type")
        java.util.List<Map<String, Object>> getUserStatisticsByType(@Param("userId") Long userId);

        /**
         * 获取学习时长分布 (按日期)
         */
        @Select("SELECT DATE(create_time) as date, SUM(time_spent) as timeSpent " +
                        "FROM learning_record " +
                        "WHERE user_id = #{userId} " +
                        "AND deleted = 0 " +
                        "AND create_time >= #{startDate} " +
                        "GROUP BY DATE(create_time) " +
                        "ORDER BY date")
        java.util.List<Map<String, Object>> getLearningTimeStats(@Param("userId") Long userId,
                        @Param("startDate") String startDate);

        /**
         * 获取正确率趋势 (按日期)
         */
        @Select("SELECT DATE(create_time) as date, " +
                        "SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as accuracy " +
                        "FROM learning_record " +
                        "WHERE user_id = #{userId} " +
                        "AND deleted = 0 " +
                        "AND create_time >= #{startDate} " +
                        "GROUP BY DATE(create_time) " +
                        "ORDER BY date")
        java.util.List<Map<String, Object>> getAccuracyTrendStats(@Param("userId") Long userId,
                        @Param("startDate") String startDate);

        /**
         * 获取新增词汇数量
         */
        @Select("SELECT COUNT(DISTINCT content_id) " +
                        "FROM learning_record " +
                        "WHERE user_id = #{userId} " +
                        "AND deleted = 0 " +
                        "AND content_type = 'vocabulary' " +
                        "AND create_time >= #{startDate}")
        Integer getNewVocabCount(@Param("userId") Long userId, @Param("startDate") String startDate);
}
