package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.KnowledgeGraph;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 知识图谱 Mapper
 * 
 * @author LearnSphere Team
 * @since 3.0.0
 */
@Mapper
public interface KnowledgeGraphMapper extends BaseMapper<KnowledgeGraph> {

    /**
     * 根据知识点获取关联知识点
     * 
     * @param topic 知识点
     * @return 知识图谱信息
     */
    KnowledgeGraph getByTopic(@Param("topic") String topic);

    /**
     * 获取相关知识点推荐
     * 
     * @param topic 当前知识点
     * @return 相关知识点列表
     */
    List<KnowledgeGraph> getRelatedTopics(@Param("topic") String topic);

    /**
     * 获取某个类别的所有知识点
     * 
     * @param category 类别
     * @return 知识点列表
     */
    List<KnowledgeGraph> getByCategory(@Param("category") String category);
}
