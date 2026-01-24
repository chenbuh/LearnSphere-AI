package com.learnsphere.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.learnsphere.entity.UserLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 用户日志 Mapper
 */
@Mapper
public interface UserLogMapper extends BaseMapper<UserLog> {

    /**
     * 统计操作类型分布
     */
    @Select("SELECT action, COUNT(*) as count FROM user_log GROUP BY action ORDER BY count DESC LIMIT 10")
    List<Map<String, Object>> getActionStats();

    /**
     * 统计模块使用分布
     */
    @Select("SELECT module, COUNT(*) as count FROM user_log GROUP BY module ORDER BY count DESC")
    List<Map<String, Object>> getModuleStats();

    /**
     * 统计地区分布（按省份）
     */
    @Select("SELECT ip_province as province, COUNT(*) as count FROM user_log WHERE ip_province IS NOT NULL GROUP BY ip_province ORDER BY count DESC LIMIT 15")
    List<Map<String, Object>> getProvinceStats();

    /**
     * 统计设备类型分布
     */
    @Select("SELECT device_type, COUNT(*) as count FROM user_log GROUP BY device_type")
    List<Map<String, Object>> getDeviceStats();
}
