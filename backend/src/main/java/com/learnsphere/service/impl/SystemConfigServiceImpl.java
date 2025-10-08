package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.SystemConfig;
import com.learnsphere.mapper.SystemConfigMapper;
import com.learnsphere.service.ISystemConfigService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SystemConfigServiceImpl extends ServiceImpl<SystemConfigMapper, SystemConfig>
        implements ISystemConfigService {

    @Override
    public String getConfigValue(String key, String defaultValue) {
        LambdaQueryWrapper<SystemConfig> query = new LambdaQueryWrapper<>();
        query.eq(SystemConfig::getConfigKey, key);
        SystemConfig config = this.baseMapper.selectOne(query);
        return config != null ? config.getConfigValue() : defaultValue;
    }

    @Override
    public void setConfigValue(String key, String value) {
        LambdaQueryWrapper<SystemConfig> query = new LambdaQueryWrapper<>();
        query.eq(SystemConfig::getConfigKey, key);
        SystemConfig config = this.baseMapper.selectOne(query);

        if (config != null) {
            config.setConfigValue(value);
            config.setUpdateTime(LocalDateTime.now());
            this.updateById(config);
        } else {
            config = new SystemConfig();
            config.setConfigKey(key);
            config.setConfigValue(value);
            config.setUpdateTime(LocalDateTime.now());
            // Optionally set category or description if needed, but here we just ensure it
            // exists
            this.save(config);
        }
    }
}
