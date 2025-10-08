package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.UserAchievement;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface UserAchievementMapper extends BaseMapper<UserAchievement> {

    @Select("SELECT a.*, COALESCE(ua.status, 0) as status, COALESCE(ua.current_value, 0) as current_value, ua.unlocked_time "
            +
            "FROM achievement a " +
            "LEFT JOIN user_achievement ua ON a.id = ua.achievement_id AND ua.user_id = #{userId} " +
            "ORDER BY a.condition_type, a.level ASC")
    List<Map<String, Object>> selectUserAchievements(Long userId);
}
