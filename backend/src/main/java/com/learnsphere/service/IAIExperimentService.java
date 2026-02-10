package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.entity.AIExperiment;

import java.util.Map;

public interface IAIExperimentService extends IService<AIExperiment> {

    /**
     * Get active experiment for action type
     */
    AIExperiment getActiveExperiment(String actionType);

    /**
     * Generate traffic allocation (CONTROL or VARIANT_B)
     */
    String allocateTraffic(AIExperiment experiment);

    /**
     * Get experiment report
     */
    Map<String, Object> getExperimentReport(Long experimentId);
}
