package com.learnsphere.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * Web配置 - 静态资源与 SPA 路由支持
 *
 * 资源映射规则：
 * /admin/** -> classpath:/static/admin/ （管理后台，优先注册）
 * /assets/** -> classpath:/static/assets/ （带 hash 的 JS/CSS/图片，长期缓存）
 * /sw.js, /workbox* -> classpath:/static/ （Service Worker，不缓存）
 * /** -> classpath:/static/ （用户前端 SPA fallback，不缓存）
 * /uploads/** -> file:./uploads/ （用户上传文件）
 * 前端用户端构建产物由 frontend-vue/vite.config.js 直接输出到 classpath:/static/
 *
 * 缓存策略：
 * - assets/（带 contenthash 文件名）-> 7天强缓存 (Cache-Control: max-age=604800,
 * immutable)
 * - index.html / sw.js / workbox* -> 不缓存 (Cache-Control: no-store)
 * - 其他静态文件 -> 1小时缓存
 *
 * @author LearnSphere Team
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AntiCrawlerInterceptor antiCrawlerInterceptor;

    /**
     * 配置拦截器 - 仅 API 请求生效
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(antiCrawlerInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/auth/login",
                        "/api/auth/register",
                        "/api/health");
    }

    /**
     * 配置静态资源
     * ⚠️ 注意：越具体的 handler 必须越先注册
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // 管理后台静态资源（优先注册，避免 /** 拦截）
        registry.addResourceHandler("/admin", "/admin/", "/admin/**")
                .addResourceLocations("classpath:/static/admin/")
                .setCacheControl(CacheControl.noStore())
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(@NonNull String resourcePath, @NonNull Resource location)
                            throws IOException {
                        // 去除多余的 admin/ 前缀
                        String path = resourcePath;
                        if (path.startsWith("admin/")) {
                            path = path.substring(6);
                        }
                        if (path.isEmpty()) {
                            path = "index.html";
                        }

                        Resource res = location.createRelative(path);
                        if (res.exists() && res.isReadable()) {
                            return res;
                        }

                        // SPA fallback 到 admin/index.html
                        return location.createRelative("index.html");
                    }
                });

        // 带 contenthash 的静态资源（JS/CSS/字体/图片），设置长期缓存
        // Vite 打包 assets/ 下的文件名都包含 hash，内容不变则 URL 不变
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).immutable());

        // Service Worker 和 Workbox 运行时脚本必须不缓存
        registry.addResourceHandler("/sw.js", "/registerSW.js", "/workbox-*.js")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.noStore());

        // 用户前端静态资源（SPA 路由支持，index.html 不缓存）
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.noStore())
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(@NonNull String resourcePath, @NonNull Resource location)
                            throws IOException {
                        // API 请求不处理静态资源，交给 Controller
                        if (resourcePath.startsWith("api/")) {
                            return null;
                        }
                        // admin 路由交给上面的 handler
                        if (resourcePath.startsWith("admin/") || resourcePath.equals("admin")) {
                            return null;
                        }
                        // assets 路由由上面的专属 handler 处理
                        if (resourcePath.startsWith("assets/")) {
                            return null;
                        }

                        Resource res = location.createRelative(resourcePath);
                        if (res.exists() && res.isReadable()) {
                            return res;
                        }

                        // SPA fallback 到 index.html（支持 Vue Router history 模式）
                        return location.createRelative("index.html");
                    }
                });

        // 用户上传文件（不缓存
        String uploadPath = "file:" + System.getProperty("user.dir") + File.separator + "uploads" + File.separator;
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath)
                .setCacheControl(CacheControl.noStore());
    }

    /**
     * 视图控制器 - 根路径映射
     */
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/index.html");
        registry.addViewController("/admin").setViewName("forward:/admin/index.html");
        registry.addViewController("/admin/").setViewName("forward:/admin/index.html");
    }
}

