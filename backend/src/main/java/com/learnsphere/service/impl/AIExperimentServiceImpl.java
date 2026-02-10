package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.AIExperiment;
import com.learnsphere.mapper.AIExperimentMapper;
import com.learnsphere.service.IAIExperimentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.*;

@Service
public class AIExperimentServiceImpl extends ServiceImpl<AIExperimentMapper, AIExperiment>
        implements IAIExperimentService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public AIExperiment getActiveExperiment(String actionType) {
        LambdaQueryWrapper<AIExperiment> query = new LambdaQueryWrapper<>();
        query.eq(AIExperiment::getActionType, actionType)
                .eq(AIExperiment::getStatus, "RUNNING")
                .orderByDesc(AIExperiment::getCreateTime)
                .last("LIMIT 1"); // Only one active experiment per action type
        return this.baseMapper.selectOne(query);
    }

    @Override
    public String allocateTraffic(AIExperiment experiment) {
        if (experiment == null || experiment.getTrafficRatio() == null) {
            return "CONTROL";
        }
        int random = new Random().nextInt(100); // 0-99
        return random < experiment.getTrafficRatio() ? "VARIANT_B" : "CONTROL";
    }

    @Override
    public Map<String, Object> getExperimentReport(Long experimentId) {
        AIExperiment exp = this.getById(experimentId);
        if (exp == null)
            return Collections.emptyMap();

        String sql = """
                    SELECT
                        variant,
                        COUNT(*) as request_count,
                        AVG(duration_ms) as avg_latency,
                        SUM(CASE WHEN status = 'FAIL' THEN 1 ELSE 0 END) as failure_count,
                        SUM(total_tokens) as total_cost_tokens
                    FROM ai_generation_log
                    WHERE experiment_id = ?
                    GROUP BY variant
                """;

        List<Map<String, Object>> metrics = jdbcTemplate.queryForList(sql, experimentId);

        // Also fetch feedback if possible
        String feedbackSql = """
                    SELECT
                        l.variant,
                        COUNT(f.id) as feedback_count,
                        AVG(f.rating) as avg_rating,
                        SUM(CASE WHEN f.rating = -1 THEN 1 ELSE 0 END) as negative_count
                    FROM ai_generation_log l
                    JOIN ai_content_feedback f ON l.id = f.log_id
                    WHERE l.experiment_id = ?
                    GROUP BY l.variant
                """;
        List<Map<String, Object>> feedbackMetrics = jdbcTemplate.queryForList(feedbackSql, experimentId);

        Map<String, Object> report = new HashMap<>();
        report.put("experiment", exp);
        report.put("performance", metrics);
        report.put("feedback", feedbackMetrics);

        return report;
    }
}
