package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.ReadingArticle;
import org.apache.ibatis.annotations.Mapper;

/**
 * 阅读文章 Mapper 接口
 */
@Mapper
public interface ReadingArticleMapper extends BaseMapper<ReadingArticle> {
}
