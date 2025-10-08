package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.SpeakingTopic;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SpeakingTopicMapper extends BaseMapper<SpeakingTopic> {

    @Select("SELECT * FROM speaking_topic WHERE type = #{type} AND difficulty = #{difficulty} AND deleted = 0 ORDER BY RAND() LIMIT 1")
    SpeakingTopic getRandomTopic(String type, String difficulty);
}
