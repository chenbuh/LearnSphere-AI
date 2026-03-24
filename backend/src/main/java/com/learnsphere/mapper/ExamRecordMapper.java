package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.ExamRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface ExamRecordMapper extends BaseMapper<ExamRecord> {

    @Select("SELECT COALESCE(SUM(time_spent), 0) " +
            "FROM exam_record " +
            "WHERE user_id = #{userId} AND deleted = 0")
    Long getTotalTimeSpentByUser(@Param("userId") Long userId);

    @Select("SELECT DATE(create_time) as date, COALESCE(SUM(time_spent), 0) as timeSpent " +
            "FROM exam_record " +
            "WHERE user_id = #{userId} " +
            "AND deleted = 0 " +
            "AND create_time >= #{startDate} " +
            "GROUP BY DATE(create_time) " +
            "ORDER BY date")
    List<Map<String, Object>> getExamTimeStats(@Param("userId") Long userId, @Param("startDate") String startDate);

    @Select("SELECT DATE(create_time) as date, " +
            "COALESCE(SUM(correct_count), 0) as correctCount, " +
            "COALESCE(SUM(total_count), 0) as totalCount " +
            "FROM exam_record " +
            "WHERE user_id = #{userId} " +
            "AND deleted = 0 " +
            "AND create_time >= #{startDate} " +
            "GROUP BY DATE(create_time) " +
            "ORDER BY date")
    List<Map<String, Object>> getExamAccuracyTrendStats(@Param("userId") Long userId,
            @Param("startDate") String startDate);
}
