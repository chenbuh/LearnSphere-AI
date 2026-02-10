package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 词汇实体
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Data
@TableName("vocabulary")
@Schema(description = "词汇信息")
public class Vocabulary {

    @TableId(type = IdType.AUTO)
    @Schema(description = "词汇ID")
    private Long id;

    @Schema(description = "单词")
    private String word;

    @Schema(description = "音标")
    private String phonetic;

    @Schema(description = "释义")
    private String definition;

    @Schema(description = "中文翻译")
    private String translation;

    @Schema(description = "例句")
    private String example;

    @Schema(description = "例句翻译")
    private String exampleTranslation;

    @Schema(description = "考试类型 (cet4/cet6/ielts/toefl)")
    private String examType;

    @Schema(description = "难度等级 (1-5)")
    private Integer difficulty;

    @Schema(description = "词频")
    private Integer frequency;

    @Schema(description = "标签 (JSON数组)")
    private String tags;

    /**
     * 逻辑删除
     */
    @TableLogic
    private Integer deleted;

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
}
