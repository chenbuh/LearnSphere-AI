package com.learnsphere.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis-Plus配置类
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Configuration
public class MybatisPlusConfig {

    /**
     * 分页插件
     */
    /**
     * 配置 MyBatis Plus 分页插件
     * 如果不配置此拦截器，MyBatis Plus 的分页查询将无法生效（退化为内存分页或报错）。
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
