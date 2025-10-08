package com.learnsphere.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web配置 - 静态资源访问
 * 
 * @author LearnSphere Team
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * 配置静态资源处理
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 用户网站静态资源
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");

        // 管理后台静态资源
        registry.addResourceHandler("/admin/**")
                .addResourceLocations("classpath:/static/admin/");
    }

    /**
     * 配置视图控制器 - 支持前端路由
     */
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 用户网站首页
        registry.addViewController("/").setViewName("forward:/index.html");

        // 管理后台首页
        registry.addViewController("/admin").setViewName("forward:/admin/index.html");
        registry.addViewController("/admin/").setViewName("forward:/admin/index.html");
    }
}
