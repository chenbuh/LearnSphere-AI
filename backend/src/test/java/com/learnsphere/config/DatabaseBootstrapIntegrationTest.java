package com.learnsphere.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.JdbcTemplateAutoConfiguration;
import org.springframework.boot.autoconfigure.sql.init.SqlInitializationAutoConfiguration;
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/** Runs only against a disposable local database; never starts the application or web server. */
@EnabledIfSystemProperty(named = "learnsphere.mysql.bootstrap-test", matches = "true")
class DatabaseBootstrapIntegrationTest {

    @Test
    void createsMissingDatabaseAndTablesAndPreservesDataOnSecondInitialization() throws Exception {
        Properties credentials = new Properties();
        try (Reader reader = Files.newBufferedReader(
                Path.of("src/main/resources/application-secret.properties"), StandardCharsets.UTF_8)) {
            credentials.load(reader);
        }
        String user = credentials.getProperty("spring.datasource.username", "root");
        String password = credentials.getProperty("spring.datasource.password");
        String database = "learnsphere_bootstrap_test_" + UUID.randomUUID().toString().replace("-", "");
        String serverUrl = "jdbc:mysql://127.0.0.1:3306/?useSSL=false&allowPublicKeyRetrieval=true";
        String databaseUrl = serverUrl.replace("/?", "/" + database + "?");
        ApplicationContextRunner runner = new ApplicationContextRunner()
                .withInitializer(new ConfigDataApplicationContextInitializer())
                .withConfiguration(AutoConfigurations.of(DataSourceAutoConfiguration.class,
                        JdbcTemplateAutoConfiguration.class, SqlInitializationAutoConfiguration.class))
                .withUserConfiguration(DatabaseInitializer.class)
                .withPropertyValues("spring.datasource.url=" + databaseUrl,
                        "spring.datasource.username=" + user, "spring.datasource.password=" + password,
                        "spring.datasource.hikari.minimum-idle=0", "spring.datasource.hikari.maximum-pool-size=1",
                        "spring.datasource.hikari.connection-timeout=1000");
        try {
            runner.run(context -> {
                assertThat(context).hasNotFailed();
                JdbcTemplate jdbc = context.getBean(JdbcTemplate.class);
                assertThat(jdbc.queryForObject("SELECT DATABASE()", String.class)).isEqualTo(database);
                assertThat(jdbc.queryForList("SHOW TABLES")).hasSizeGreaterThanOrEqualTo(36);
                assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM `user`", Integer.class)).isZero();
                jdbc.update("INSERT INTO `vocabulary` (`word`, `translation`) VALUES (?, ?)", "bootstrap-sentinel", "验证");
                context.getBean(DatabaseInitializer.class).run();
                assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM `system_config`", Integer.class)).isPositive();
                assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM `system_prompt`", Integer.class)).isPositive();
            });
            runner.run(context -> {
                assertThat(context).hasNotFailed();
                JdbcTemplate jdbc = context.getBean(JdbcTemplate.class);
                assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM `vocabulary` WHERE word = ?", Integer.class,
                        "bootstrap-sentinel")).isEqualTo(1);
                assertThat(jdbc.queryForObject("SELECT translation FROM `vocabulary` WHERE word = ?", String.class,
                        "bootstrap-sentinel")).isEqualTo("验证");
            });
        } finally {
            // The name is generated above and restricted to this test's own schema.
            try (Connection connection = DriverManager.getConnection(serverUrl, user, password)) {
                connection.createStatement().execute("DROP DATABASE IF EXISTS `" + database + "`");
            }
        }
    }
}
