package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.User;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户Mapper
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
}
