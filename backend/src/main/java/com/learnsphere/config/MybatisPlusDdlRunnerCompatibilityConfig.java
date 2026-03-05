package com.learnsphere.config;

import com.baomidou.mybatisplus.autoconfigure.DdlApplicationRunner;
import com.baomidou.mybatisplus.extension.ddl.IDdl;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Compatibility workaround for MyBatis-Plus 3.5.3.1 on Spring Boot 3.2.x.
 *
 * <p>When no {@link IDdl} beans are present, MyBatis-Plus may register
 * {@code ddlApplicationRunner} as a NullBean, which breaks Spring Boot runner
 * invocation with BeanNotOfRequiredTypeException.
 */
@Configuration
public class MybatisPlusDdlRunnerCompatibilityConfig {

  @Bean("ddlApplicationRunner")
  public DdlApplicationRunner ddlApplicationRunner(List<IDdl> ddlList) {
    return new DdlApplicationRunner(ddlList);
  }
}
