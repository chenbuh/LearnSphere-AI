package com.learnsphere.controller;

import com.learnsphere.common.annotation.RateLimit;
import com.learnsphere.dto.LoginDTO;
import com.learnsphere.dto.RegisterDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class AuthControllerContractTest {

    @Test
    void authController_usesExpectedBasePath() {
        RequestMapping requestMapping = AuthController.class.getAnnotation(RequestMapping.class);
        assertNotNull(requestMapping, "AuthController should declare @RequestMapping");
        assertArrayEquals(new String[]{"/api/auth"}, requestMapping.value());
    }

    @Test
    void loginEndpoint_hasPostMappingAndRateLimit() throws NoSuchMethodException {
        Method loginMethod = AuthController.class.getMethod("login", LoginDTO.class, HttpServletRequest.class);

        PostMapping postMapping = loginMethod.getAnnotation(PostMapping.class);
        assertNotNull(postMapping, "login should declare @PostMapping");
        assertArrayEquals(new String[]{"/login"}, postMapping.value());

        RateLimit rateLimit = loginMethod.getAnnotation(RateLimit.class);
        assertNotNull(rateLimit, "login should declare @RateLimit");
        assertEquals("login", rateLimit.key());
        assertEquals(60, rateLimit.time());
        assertEquals(15, rateLimit.count());
    }

    @Test
    void registerAndCaptchaEndpoints_haveExpectedRateLimitPolicies() throws NoSuchMethodException {
        Method registerMethod = AuthController.class.getMethod("register", RegisterDTO.class, HttpServletRequest.class);
        RateLimit registerRateLimit = registerMethod.getAnnotation(RateLimit.class);
        assertNotNull(registerRateLimit, "register should declare @RateLimit");
        assertEquals("register", registerRateLimit.key());
        assertEquals(3600, registerRateLimit.time());
        assertEquals(5, registerRateLimit.count());

        Method captchaRequiredMethod = AuthController.class.getMethod("checkCaptchaRequired", String.class);
        GetMapping captchaRequiredGetMapping = captchaRequiredMethod.getAnnotation(GetMapping.class);
        assertNotNull(captchaRequiredGetMapping, "checkCaptchaRequired should declare @GetMapping");
        assertArrayEquals(new String[]{"/captcha/required"}, captchaRequiredGetMapping.value());

        RateLimit captchaRequiredRateLimit = captchaRequiredMethod.getAnnotation(RateLimit.class);
        assertNotNull(captchaRequiredRateLimit, "checkCaptchaRequired should declare @RateLimit");
        assertEquals("captcha:required", captchaRequiredRateLimit.key());
        assertEquals(60, captchaRequiredRateLimit.time());
        assertEquals(20, captchaRequiredRateLimit.count());
    }
}
