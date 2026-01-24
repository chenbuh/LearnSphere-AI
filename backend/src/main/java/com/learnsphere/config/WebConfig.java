package com.learnsphere.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.File;
import java.io.IOException;

/**
 * Web配置 - 静态资源访问和 SPA 路由支持
 * 
 * @author LearnSphere Team
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AntiCrawlerInterceptor antiCrawlerInterceptor;

    /**
     * 配置拦截器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 添加防爬虫拦截器，仅对 API 请求生效
        registry.addInterceptor(antiCrawlerInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/auth/login", // 登录接口豁免
                        "/api/auth/register", // 注册接口豁免
                        "/api/health" // 健康检查豁免
                );
    }

    /**
     * 配置静态资源处理
     * 支持前端打包后的 dist 文件访问
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // API 请求不处理静态资源
        // 用户网站静态资源 - 支持 SPA 路由
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600) // 缓存 1 小时
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(@NonNull String resourcePath, @NonNull Resource location)
                            throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);

                        // 如果请求的是 API 路径，不处理
                        if (resourcePath.startsWith("api/")) {
                            return null;
                        }

                        // 如果资源存在，直接返回
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }

                        // 否则返回 index.html（支持前端路由）
                        return location.createRelative("index.html");
                    }
                });

        // 管理后台静态资源 - 支持 SPA 路由
        registry.addResourceHandler("/admin/**")
                .addResourceLocations("classpath:/static/admin/")
                .setCachePeriod(3600)
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(@NonNull String resourcePath, @NonNull Resource location)
                            throws IOException {
                        // 移除 /admin/ 前缀
                        String path = resourcePath.startsWith("admin/") ? resourcePath.substring(6) : resourcePath;

                        Resource requestedResource = location.createRelative(path);

                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }

                        // 返回管理后台的 index.html
                        return location.createRelative("index.html");
                    }
                });

        // 上传文件访问 - 不缓存
        String uploadPath = "file:" + System.getProperty("user.dir") + File.separator + "uploads" + File.separator;
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath)
                .setCachePeriod(0); // 上传文件不缓存
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
