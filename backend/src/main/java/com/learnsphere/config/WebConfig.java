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
 * /assets/** -> classpath:/static/dist/assets/ （用户前端带 hash 的 JS/CSS/图片，长期缓存）
 * /favicon.svg, /manifest.webmanifest, /manifest.json, /robots.txt, /pwa-*.png, /vite.svg, /models/**
 *            -> classpath:/static/dist/ （用户前端顶层静态文件）
 * /dist/** -> classpath:/static/dist/ （用户前端构建目录）
 * /dist/sw.js, /dist/workbox* -> classpath:/static/dist/ （Service Worker，不缓存）
 * /** -> classpath:/static/dist/ （仅无扩展名路由做用户前端 SPA fallback，不缓存）
 * /uploads/** -> file:./uploads/ （用户上传文件）
 * 前端用户端构建产物由 frontend-vue/vite.config.js 直接输出到 classpath:/static/dist/
 * 管理后台构建产物由 admin-vue/vite.config.js 直接输出到 classpath:/static/admin/
 *
 * 缓存策略：
 * - dist/assets/（带 contenthash 文件名）-> 7天强缓存 (Cache-Control: max-age=604800,
 * immutable)
 * - dist 顶层静态文件 / models/** -> 1小时缓存
 * - dist/index.html / dist/sw.js / dist/workbox* -> 不缓存 (Cache-Control: no-store)
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
     *
     * 安全修复（2026-03）：
     * 原实现将 /api/auth/login 与 /api/auth/register 排除在防爬拦截器之外，
     * 使登录、注册这两条最敏感路径只剩下 @RateLimit(limitType = IP) 一层防护。
     * 而 IP 解析曾可被 X-Forwarded-For 伪造（见 ClientIpResolver 修复说明），
     * 一旦单层防护被绕过，登录爆破与批量注册将完全失去屏障。
     *
     * 现移除这两条排除项，使其同时受「防爬计数」与「@RateLimit」两层约束。
     * 每分钟 60 次的阈值对正常用户登录/注册绰绰有余，但对爆破是有效遏制。
     * /api/health 保持排除，因其为探活接口，不应消耗限流额度，
     * 且该接口不涉及认证与状态变更。
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(antiCrawlerInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
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
        registry.addResourceHandler("/assets/**", "/dist/assets/**")
                .addResourceLocations("classpath:/static/dist/assets/")
                .setCacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).immutable());

        // 用户前端顶层静态资源
        registry.addResourceHandler(
                        "/favicon.svg",
                        "/manifest.webmanifest",
                        "/manifest.json",
                        "/robots.txt",
                        "/pwa-*.png",
                        "/vite.svg")
                .addResourceLocations("classpath:/static/dist/")
                .setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS));

        // 语音识别模型（大文件，独立映射）
        //
        // 修复（2026-10）：原实现把 "/models/**" 和 "/dist/models/**" 与上面的顶层文件
        // 合并，位置都指向 classpath:/static/dist/。但 ResourceHandler 会把通配前缀
        // 整段剥掉：请求 /models/vosk/x 时剩余路径是 "vosk/x"，最终去解析
        // static/dist/vosk/x —— 而文件实际在 static/dist/models/vosk/x，必然 404。
        // 之前之所以"看起来能用"，是因为仓库里还额外存了一份 static/models/ 副本，
        // 由 Spring Boot 默认的 classpath:/static/ 兜底命中。该副本已删除，
        // 这里把位置改成 classpath:/static/dist/models/ 使映射与真实目录一致。
        registry.addResourceHandler("/models/**", "/dist/models/**")
                .addResourceLocations("classpath:/static/dist/models/")
                .setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS));

        // Service Worker 和 Workbox 运行时脚本必须不缓存
        registry.addResourceHandler(
                        "/sw.js",
                        "/registerSW.js",
                        "/workbox-*.js",
                        "/dist/sw.js",
                        "/dist/registerSW.js",
                        "/dist/workbox-*.js")
                .addResourceLocations("classpath:/static/dist/")
                .setCacheControl(CacheControl.noStore());

        // 用户前端 dist 目录直出
        registry.addResourceHandler("/dist/**")
                .addResourceLocations("classpath:/static/dist/")
                .setCacheControl(CacheControl.noStore());

        // 用户前端静态资源（SPA 路由支持，index.html 不缓存）
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/dist/")
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
                        if (resourcePath.startsWith("dist/")) {
                            return null;
                        }

                        Resource res = location.createRelative(resourcePath);
                        if (res.exists() && res.isReadable()) {
                            return res;
                        }

                        // 带扩展名的静态资源请求返回 404，不兜底到 index.html
                        if (resourcePath.contains(".")) {
                            return null;
                        }

                        // SPA fallback 到 index.html（支持 Vue Router history 模式）
                        return location.createRelative("index.html");
                    }
                });

        // 用户上传文件（不缓存）
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
        registry.addViewController("/").setViewName("forward:/dist/index.html");
        registry.addViewController("/dist").setViewName("forward:/dist/index.html");
        registry.addViewController("/dist/").setViewName("forward:/dist/index.html");
        registry.addViewController("/admin").setViewName("forward:/admin/index.html");
        registry.addViewController("/admin/").setViewName("forward:/admin/index.html");
    }
}
