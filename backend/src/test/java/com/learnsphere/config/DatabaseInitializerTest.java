package com.learnsphere.config;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.CannotGetJdbcConnectionException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;

class DatabaseInitializerTest {

    @Test
    void initializationFailurePreventsReportingSuccessfulStartup() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        CannotGetJdbcConnectionException failure = new CannotGetJdbcConnectionException("database unavailable");
        doThrow(failure).when(jdbc).execute(anyString());
        DatabaseInitializer initializer = new DatabaseInitializer();
        ReflectionTestUtils.setField(initializer, "jdbcTemplate", jdbc);

        assertThatThrownBy(initializer::run)
                .isInstanceOf(IllegalStateException.class)
                .hasCause(failure);
    }
}
