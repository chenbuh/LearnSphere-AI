package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.SensitiveLog;
import org.apache.ibatis.annotations.Mapper;

/**
 * 敏感内容日志 Mapper
 */
@Mapper
public interface SensitiveLogMapper extends BaseMapper<SensitiveLog> {
}
