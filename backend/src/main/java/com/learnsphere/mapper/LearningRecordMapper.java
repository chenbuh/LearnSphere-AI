package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.LearningRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
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
                        "COALESCE(SUM(time_spent), 0) as totalTimeSpent " +
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
        @Select("SELECT DATE(create_time) as date, COALESCE(SUM(time_spent), 0) as timeSpent " +
                        "FROM learning_record " +
                        "WHERE user_id = #{userId} " +
                        "AND deleted = 0 " +
                        "AND create_time >= #{startDate} " +
                        "GROUP BY DATE(create_time) " +
                        "ORDER BY date")
        java.util.List<Map<String, Object>> getLearningTimeStats(@Param("userId") Long userId,
                        @Param("startDate") String startDate);

        /**
         * 获取学习记录正确率趋势基础数据(按日期)
         * 仅统计存在判题结果的记录，避免把未判题的历史记录计入分母。
         */
        @Select("SELECT DATE(create_time) as date, " +
                        "COUNT(*) as totalCount, " +
                        "SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correctCount " +
                        "FROM learning_record " +
                        "WHERE user_id = #{userId} " +
                        "AND deleted = 0 " +
                        "AND create_time >= #{startDate} " +
                        "AND is_correct IS NOT NULL " +
                        "GROUP BY DATE(create_time) " +
                        "ORDER BY date")
        java.util.List<Map<String, Object>> getAccuracyTrendBaseStats(@Param("userId") Long userId,
                        @Param("startDate") String startDate);

        /**
         * 获取新词汇数量
         */
        @Select("SELECT COUNT(DISTINCT content_id) " +
                        "FROM learning_record " +
                        "WHERE user_id = #{userId} " +
                        "AND deleted = 0 " +
                        "AND content_type = 'vocabulary' " +
                        "AND create_time >= #{startDate}")
        Integer getNewVocabCount(@Param("userId") Long userId, @Param("startDate") String startDate);

        /**
         * 获取指定时间窗口内的学习统计
         */
        @Select("SELECT " +
                        "COUNT(*) as totalCount, " +
                        "SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correctCount, " +
                        "AVG(score) as avgScore, " +
                        "COALESCE(SUM(time_spent), 0) as totalTimeSpent, " +
                        "COUNT(DISTINCT DATE(create_time)) as activeDays " +
                        "FROM learning_record " +
                        "WHERE user_id = #{userId} " +
                        "AND deleted = 0 " +
                        "AND create_time >= #{startTime} " +
                        "AND create_time < #{endTime}")
        Map<String, Object> getPeriodStatistics(@Param("userId") Long userId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        /**
         * 获取真实词汇覆盖数量（学习记录 + 掌握度记录去重并集）
         */
        @Select("SELECT COUNT(*) FROM (" +
                        "SELECT DISTINCT content_id AS vocabulary_id " +
                        "FROM learning_record " +
                        "WHERE user_id = #{userId} " +
                        "AND deleted = 0 " +
                        "AND content_type = 'vocabulary' " +
                        "AND content_id IS NOT NULL " +
                        "AND content_id > 0 " +
                        "UNION " +
                        "SELECT DISTINCT vocabulary_id " +
                        "FROM vocabulary_mastery " +
                        "WHERE user_id = #{userId} " +
                        "AND deleted = 0 " +
                        "AND (review_count > 0 OR correct_count > 0 OR wrong_count > 0 OR mastery_level > 0)" +
                        ") covered_vocabulary")
        Integer getCoveredVocabularyCount(@Param("userId") Long userId);

        /**
         * 获取最近时间窗口新增覆盖词汇数量（学习记录 + 掌握度记录去重并集）
         */
        @Select("SELECT COUNT(*) FROM (" +
                        "SELECT DISTINCT content_id AS vocabulary_id " +
                        "FROM learning_record " +
                        "WHERE user_id = #{userId} " +
                        "AND deleted = 0 " +
                        "AND content_type = 'vocabulary' " +
                        "AND content_id IS NOT NULL " +
                        "AND content_id > 0 " +
                        "AND create_time >= #{startTime} " +
                        "UNION " +
                        "SELECT DISTINCT vocabulary_id " +
                        "FROM vocabulary_mastery " +
                        "WHERE user_id = #{userId} " +
                        "AND deleted = 0 " +
                        "AND (review_count > 0 OR correct_count > 0 OR wrong_count > 0 OR mastery_level > 0) " +
                        "AND COALESCE(first_learned_time, create_time) >= #{startTime}" +
                        ") recent_covered_vocabulary")
        Integer getNewCoveredVocabularyCount(@Param("userId") Long userId,
                        @Param("startTime") LocalDateTime startTime);
}
