package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.SensitiveWord;
import org.apache.ibatis.annotations.Mapper;

/**
 * Mapper for SensitiveWord entity using MyBatis-Plus
 */
@Mapper
public interface SensitiveWordMapper extends BaseMapper<SensitiveWord> {
    // Additional custom queries can be defined here if needed
}
