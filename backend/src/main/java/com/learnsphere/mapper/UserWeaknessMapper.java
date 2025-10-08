package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.UserWeakness;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户薄弱知识点 Mapper
 * 
 * @author LearnSphere Team
 * @since 3.0.0
 */
@Mapper
public interface UserWeaknessMapper extends BaseMapper<UserWeakness> {

    /**
     * 获取用户的薄弱知识点列表
     * 
     * @param userId      用户ID
     * @param needsReview 是否只获取需要复习的
     * @return 薄弱知识点列表
     */
    List<UserWeakness> getUserWeaknesses(@Param("userId") Long userId,
            @Param("needsReview") Boolean needsReview);

    /**
     * 获取用户按优先级排序的复习建议
     * 
     * @param userId 用户ID
     * @param limit  限制数量
     * @return 薄弱知识点列表
     */
    List<UserWeakness> getReviewSuggestions(@Param("userId") Long userId,
            @Param("limit") int limit);

    /**
     * 更新知识点统计
     * 
     * @param userId    用户ID
     * @param topic     知识点
     * @param isCorrect 是否正确
     */
    void updateTopicStats(@Param("userId") Long userId,
            @Param("topic") String topic,
            @Param("category") String category,
            @Param("isCorrect") Boolean isCorrect);
}
