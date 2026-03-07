package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.AITutorConversation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * AI Tutor 对话历史 Mapper
 * 
 * @author LearnSphere Team
 * @since 3.0.0
 */
@Mapper
public interface AITutorConversationMapper extends BaseMapper<AITutorConversation> {

    /**
     * 获取用户的对话历史。
     *
     * @param userId    用户 ID
     * @param sessionId 会话 ID
     * @return 对话列表
     */
    List<AITutorConversation> getConversationHistory(@Param("userId") Long userId,
                    @Param("sessionId") String sessionId);

    /**
     * 分页查询会话列表（管理员用）。
     */
    com.baomidou.mybatisplus.core.metadata.IPage<java.util.Map<String, Object>> getConversationList(
                    com.baomidou.mybatisplus.extension.plugins.pagination.Page<?> page,
                    @Param("keyword") String keyword,
                    @Param("role") String role);

    /**
     * 获取 AI 助教统计数据。
     */
    java.util.Map<String, Object> getAITutorStats(@Param("todayStart") java.time.LocalDateTime todayStart);
}
