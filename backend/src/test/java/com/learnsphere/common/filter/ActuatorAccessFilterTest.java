package com.learnsphere.common.filter;

import cn.dev33.satoken.stp.StpUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * actuator 访问控制测试。
 *
 * <p>这组用例对应一个实测确认过的真实漏洞：未登录请求
 * {@code GET /api/actuator/prometheus} 返回 200 和完整指标。
 * 修复方式是绕过 MVC 拦截器、直接在 Filter 层拦。
 */
class ActuatorAccessFilterTest {

    private ActuatorAccessFilter filter;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private FilterChain chain;
    private MockedStatic<StpUtil> stpUtil;
    private StringWriter responseBody;

    @BeforeEach
    void setup() throws Exception {
        filter = new ActuatorAccessFilter("");
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        chain = mock(FilterChain.class);

        responseBody = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(responseBody));
        when(request.getRemoteAddr()).thenReturn("203.0.113.9");
    }

    /** 构造一个配置了监控令牌的 filter。 */
    private ActuatorAccessFilter withToken(String token) {
        return new ActuatorAccessFilter(token);
    }

    @AfterEach
    void closeStatic() {
        if (stpUtil != null) {
            stpUtil.close();
            stpUtil = null;
        }
    }

    private void loginAs(Object loginId, boolean adminRole) {
        stpUtil = Mockito.mockStatic(StpUtil.class);
        stpUtil.when(StpUtil::getLoginIdDefaultNull).thenReturn(loginId);
        stpUtil.when(() -> StpUtil.hasRole("admin")).thenReturn(adminRole);
    }

    @Test
    void unauthenticatedActuatorRequestIsBlocked() throws Exception {
        loginAs(null, false);
        when(request.getRequestURI()).thenReturn("/api/actuator/prometheus");

        filter.doFilter(request, response, chain);

        // 关键：不能放行到 chain，否则指标就泄露了
        verify(chain, never()).doFilter(any(), any());
        verify(response).setStatus(HttpServletResponse.SC_NOT_FOUND);
        assertThat(responseBody.toString()).contains("404");
    }

    @Test
    void unauthenticatedActuatorIsDisguisedAsNotFound() throws Exception {
        loginAs(null, false);
        when(request.getRequestURI()).thenReturn("/api/actuator/env");

        filter.doFilter(request, response, chain);

        // 返回 404 而不是 403：不告诉探测者「这里存在但你没权限」
        assertThat(responseBody.toString()).doesNotContain("权限")
                .doesNotContain("actuator");
    }

    @Test
    void normalUserCannotReachActuator() throws Exception {
        // 普通用户即使已登录也不该看到运维指标
        loginAs("42", false);
        when(request.getRequestURI()).thenReturn("/api/actuator/prometheus");

        filter.doFilter(request, response, chain);

        verify(chain, never()).doFilter(any(), any());
        verify(response).setStatus(HttpServletResponse.SC_NOT_FOUND);
    }

    @Test
    void adminSessionIsAllowed() throws Exception {
        loginAs("admin:1", true);
        when(request.getRequestURI()).thenReturn("/api/actuator/prometheus");

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        verify(response, never()).setStatus(HttpServletResponse.SC_NOT_FOUND);
    }

    @Test
    void adminWithoutAdminRoleIsStillBlocked() throws Exception {
        // 边界：id 是 admin: 前缀但角色查询失败时，不能放行
        loginAs("admin:1", false);
        when(request.getRequestURI()).thenReturn("/api/actuator/prometheus");

        filter.doFilter(request, response, chain);

        verify(chain, never()).doFilter(any(), any());
    }

    @Test
    void nonActuatorPathIsNeverTouched() throws Exception {
        loginAs(null, false);
        when(request.getRequestURI()).thenReturn("/api/user/profile");

        filter.doFilter(request, response, chain);

        // 普通接口的鉴权由 SaTokenConfig 拦截器负责，本 Filter 不介入
        verify(chain).doFilter(request, response);
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    void actuatorPrefixLookalikeIsNotBlocked() throws Exception {
        // /api/actuator-x 不是 actuator，不应被误伤
        loginAs(null, false);
        when(request.getRequestURI()).thenReturn("/api/actuator-admin/report");

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    @Test
    void exactPrefixWithoutSlashIsBlocked() throws Exception {
        loginAs(null, false);
        when(request.getRequestURI()).thenReturn("/api/actuator");

        filter.doFilter(request, response, chain);

        verify(chain, never()).doFilter(any(), any());
    }

    @Test
    void saTokenExceptionIsTreatedAsUnauthorized() throws Exception {
        // Sa-Token 在无上下文时抛异常而不是返回 null，必须按未授权处理
        stpUtil = Mockito.mockStatic(StpUtil.class);
        stpUtil.when(StpUtil::getLoginIdDefaultNull).thenThrow(new IllegalStateException("no context"));
        when(request.getRequestURI()).thenReturn("/api/actuator/prometheus");

        filter.doFilter(request, response, chain);

        verify(chain, never()).doFilter(any(), any());
        verify(response).setStatus(HttpServletResponse.SC_NOT_FOUND);
    }

    // ---------- 监控令牌通道 ----------

    @Test
    void metricsTokenAllowsScrapingWithoutSession() throws Exception {
        // Prometheus 没有用户会话，靠静态令牌抓取
        loginAs(null, false);
        when(request.getRequestURI()).thenReturn("/api/actuator/prometheus");
        when(request.getHeader("X-Metrics-Token")).thenReturn("s3cr3t-token-value");

        withToken("s3cr3t-token-value").doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    @Test
    void wrongMetricsTokenIsRejected() throws Exception {
        loginAs(null, false);
        when(request.getRequestURI()).thenReturn("/api/actuator/prometheus");
        when(request.getHeader("X-Metrics-Token")).thenReturn("wrong");

        withToken("s3cr3t-token-value").doFilter(request, response, chain);

        verify(chain, never()).doFilter(any(), any());
    }

    @Test
    void emptyConfiguredTokenDisablesTheChannel() throws Exception {
        // 安全默认值：没配令牌就不能靠「空令牌」蒙混进来
        loginAs(null, false);
        when(request.getRequestURI()).thenReturn("/api/actuator/prometheus");
        when(request.getHeader("X-Metrics-Token")).thenReturn("");

        withToken("").doFilter(request, response, chain);

        verify(chain, never()).doFilter(any(), any());
    }

    @Test
    void missingTokenHeaderWithConfiguredTokenIsRejected() throws Exception {
        loginAs(null, false);
        when(request.getRequestURI()).thenReturn("/api/actuator/prometheus");
        when(request.getHeader("X-Metrics-Token")).thenReturn(null);

        withToken("s3cr3t-token-value").doFilter(request, response, chain);

        verify(chain, never()).doFilter(any(), any());
    }

    @Test
    void metricsTokenOnlyWorksOnActuatorPaths() throws Exception {
        // 令牌不能变成万能钥匙，普通接口仍走正常鉴权
        loginAs(null, false);
        when(request.getRequestURI()).thenReturn("/api/user/profile");
        when(request.getHeader("X-Metrics-Token")).thenReturn("s3cr3t-token-value");

        withToken("s3cr3t-token-value").doFilter(request, response, chain);

        // 放行到 chain，但是因为路径不是 actuator，与令牌无关
        verify(chain).doFilter(request, response);
    }
}
