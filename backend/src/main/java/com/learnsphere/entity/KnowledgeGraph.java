package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 知识点关联实体
 * 构建知识图谱,记录知识点之间的关联关系
 * 
 * @author LearnSphere Team
 * @since 3.0.0
 */
@Data
@TableName("knowledge_graph")
public class KnowledgeGraph {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 知识点名称
     */
    private String topic;

    /**
     * 知识点类别 (grammar/reading/vocabulary等)
     */
    private String category;

    /**
     * 关联的知识点 (JSON 数组)
     * 示例: ["现在完成时", "现在进行时", "过去完成时"]
     */
    @TableField(value = "related_topics")
    private String relatedTopics;

    /**
     * 前置知识点 (学习这个知识点前需要掌握的)
     */
    @TableField(value = "prerequisite_topics")
    private String prerequisiteTopics;

    /**
     * 后续知识点 (学完这个可以继续学习的)
     */
    @TableField(value = "next_topics")
    private String nextTopics;

    /**
     * 难度级别 (1-5)
     */
    private Integer difficultyLevel;

    /**
     * 知识点描述
     */
    private String description;

    /**
     * 常见易错点 (JSON 数组)
     */
    @TableField(value = "common_mistakes")
    private String commonMistakes;

    /**
     * 推荐练习资源 (JSON 数组)
     */
    @TableField(value = "recommended_resources")
    private String recommendedResources;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 逻辑删除
     */
    @TableLogic
    private Integer deleted;
}
