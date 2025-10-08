package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.VocabularyMastery;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 词汇掌握度 Mapper
 */
@Mapper
public interface VocabularyMasteryMapper extends BaseMapper<VocabularyMastery> {

    /**
     * 获取用户需要复习的单词列表
     */
    @Select("SELECT vm.*, v.word, v.phonetic, v.translation " +
            "FROM vocabulary_mastery vm " +
            "LEFT JOIN vocabulary v ON vm.vocabulary_id = v.id " +
            "WHERE vm.user_id = #{userId} " +
            "AND vm.next_review_time <= NOW() " +
            "AND vm.deleted = 0 " +
            "ORDER BY vm.mastery_level ASC, vm.next_review_time ASC " +
            "LIMIT #{limit}")
    List<Map<String, Object>> getReviewList(@Param("userId") Long userId, @Param("limit") Integer limit);

    /**
     * 获取用户掌握度统计
     */
    @Select("SELECT " +
            "  COUNT(*) as total, " +
            "  SUM(CASE WHEN mastery_level >= 5 THEN 1 ELSE 0 END) as mastered, " +
            "  SUM(CASE WHEN mastery_level >= 3 AND mastery_level < 5 THEN 1 ELSE 0 END) as familiar, " +
            "  SUM(CASE WHEN mastery_level > 0 AND mastery_level < 3 THEN 1 ELSE 0 END) as learning, " +
            "  SUM(CASE WHEN mastery_level = 0 THEN 1 ELSE 0 END) as not_started " +
            "FROM vocabulary_mastery " +
            "WHERE user_id = #{userId} AND deleted = 0")
    Map<String, Object> getMasteryStats(@Param("userId") Long userId);
}
