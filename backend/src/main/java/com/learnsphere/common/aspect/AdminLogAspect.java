package com.learnsphere.common.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.List;

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
                    details = objectMapper.writeValueAsString(logArgs);
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
}
