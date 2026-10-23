package com.learnsphere.common.aspect;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.learnsphere.common.annotation.AdminOperation;
import com.learnsphere.service.IAdminLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AdminLogAspect {

    private final IAdminLogService adminLogService;
    private final ObjectMapper objectMapper;

    @Around("@annotation(adminOperation)")
    public Object around(ProceedingJoinPoint point, AdminOperation adminOperation) throws Throwable {
        Object result = null;
        String errorMsg = null;
        Integer status = 1; // Success

        try {
            result = point.proceed();
        } catch (Throwable e) {
            status = 0; // Failure
            errorMsg = e.getMessage();
            throw e;
        } finally {
            // Log the operation
            try {
                String module = adminOperation.module();
                String action = adminOperation.action();

                // Get method arguments as details
                // Filter out MultipartFile or too large objects if necessary
                Object[] args = point.getArgs();
                List<Object> logArgs = new ArrayList<>();
                for (Object arg : args) {
                    if (arg instanceof MultipartFile || arg instanceof jakarta.servlet.http.HttpServletRequest
                            || arg instanceof jakarta.servlet.http.HttpServletResponse) {
                        continue;
                    }
                    logArgs.add(arg);
                }

                String details = "";
                try {
                    JsonNode tree = objectMapper.valueToTree(logArgs);
                    maskSensitive(tree);
                    details = objectMapper.writeValueAsString(tree);
                    if (details.length() > 500) {
                        details = details.substring(0, 500) + "...";
                    }
                } catch (Exception e) {
                    details = "Args serialization failed";
                }

                adminLogService.log(module, action, details, status, errorMsg);

            } catch (Exception e) {
                log.error("Error recording admin log", e);
            }
        }
        return result;
    }

    /**
     * 递归脱敏密码、token 等字段，避免明文写入操作日志
     */
    private void maskSensitive(JsonNode node) {
        if (node instanceof ObjectNode objectNode) {
            Iterator<Map.Entry<String, JsonNode>> fields = objectNode.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                String key = field.getKey().toLowerCase(Locale.ROOT);
                if (key.contains("password") || key.contains("secret") || key.contains("token")
                        || key.contains("apikey") || key.contains("api_key")) {
                    field.setValue(objectNode.textNode("******"));
                } else {
                    maskSensitive(field.getValue());
                }
            }
        } else if (node != null && node.isArray()) {
            node.forEach(this::maskSensitive);
        }
    }
}
