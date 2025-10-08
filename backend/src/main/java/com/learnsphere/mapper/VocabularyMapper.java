package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.Vocabulary;
import org.apache.ibatis.annotations.Mapper;

/**
 * 词汇Mapper
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Mapper
public interface VocabularyMapper extends BaseMapper<Vocabulary> {
}
