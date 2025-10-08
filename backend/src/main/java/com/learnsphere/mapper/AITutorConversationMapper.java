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
     * 获取用户的对话历史
     * 
     * @param userId    用户ID
     * @param sessionId 会话ID
     * @return 对话列表
     */
    List<AITutorConversation> getConversationHistory(@Param("userId") Long userId,
            @Param("sessionId") String sessionId);

    /**
     * 获取用户最近的对话会话
     * 
     * @param userId 用户ID
     * @param limit  限制数量
     * @return 会话ID列表
     */
    List<String> getRecentSessions(@Param("userId") Long userId, @Param("limit") int limit);
}
