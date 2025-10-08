package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.entity.SystemConfig;

public interface ISystemConfigService extends IService<SystemConfig> {
    /**
     * Get config value by key, return default if not found
     */
    String getConfigValue(String key, String defaultValue);

    /**
     * Set config value
     */
    void setConfigValue(String key, String value);
}
