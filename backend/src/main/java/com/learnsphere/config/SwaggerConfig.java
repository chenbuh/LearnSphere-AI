package com.learnsphere.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Knife4j / Swagger API 文档配置
 * 访问地址：http://localhost:8080/doc.html
 */
@Configuration
public class SwaggerConfig {

        @Bean
        public OpenAPI springShopOpenAPI() {
                return new OpenAPI()
                                .info(new Info().title("LearnSphere AI 接口文档")
                                                .description("## 智能英语学习平台后端服务接口说明\n\n" +
                                                                "### 全局状态码说明\n" +
                                                                "- **200**: 操作成功\n" +
                                                                "- **401**: 认证失败/会话失效\n" +
                                                                "- **403**: 权限不足/触犯安全规则限制\n" +
                                                                "- **429**: 接口限流或 AI 配额耗尽\n" +
                                                                "- **500**: 服务器内部错误")
                                                .version("v1.2.0")
                                                .contact(new Contact().name("LearnSphere Team")
                                                                .email("support@learnsphere.com"))
                                                .license(new License().name("Apache 2.0").url("http://springdoc.org")))
                                .components(new Components()
                                                .addSecuritySchemes("Sa-Token", new SecurityScheme()
                                                                .type(SecurityScheme.Type.APIKEY)
                                                                .in(SecurityScheme.In.HEADER)
                                                                .name("satoken")
                                                                .description("请通过 /api/auth/login 获取 Token 并在此输入")))
                                .addSecurityItem(new SecurityRequirement().addList("Sa-Token"));
        }

        @Bean
        public GroupedOpenApi aiApi() {
                return GroupedOpenApi.builder()
                                .group("1. AI 业务接口")
                                .pathsToMatch("/api/ai/**")
                                .build();
        }

        @Bean
        public GroupedOpenApi authApi() {
                return GroupedOpenApi.builder()
                                .group("2. 个人/认证接口")
                                .pathsToMatch("/api/auth/**", "/api/user/**", "/api/security/**")
                                .build();
        }

        @Bean
        public GroupedOpenApi learningApi() {
                return GroupedOpenApi.builder()
                                .group("3. 核心学习/统计接口")
                                .pathsToMatch("/api/learning/**", "/api/vocabulary/**", "/api/exam/**")
                                .build();
        }

        @Bean
        public GroupedOpenApi adminApi() {
                return GroupedOpenApi.builder()
                                .group("4. 管理后台接口")
                                .pathsToMatch("/api/admin/**")
                                .build();
        }

        @Bean
        public GroupedOpenApi commonApi() {
                return GroupedOpenApi.builder()
                                .group("5. 通用基础接口")
                                .pathsToMatch("/api/common/**", "/api/file/**", "/api/health/**")
                                .build();
        }
}
