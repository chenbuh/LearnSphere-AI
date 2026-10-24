package com.learnsphere.config;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;

import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 在「生产库副本」上验证 Flyway 升级路径。
 *
 * <p>与 {@link FlywayMigrationIntegrationTest} 的区别：那个测试从空库或手工构造的
 * 小表开始；本测试直接对 {@code learnsphere_prod_copy}（由 mysqldump 从
 * {@code learnsphere_ai} 克隆而来，含 36 张表与真实数据）执行迁移，
 * 是上线前最接近真实场景的验证。
 *
 * <p>前提：副本库已由外部脚本创建。若不存在，测试直接跳过而非失败，
 * 避免污染常规 CI（CI 环境没有生产库副本）。
 *
 * <pre>
 *   mvn test -Dtest=FlywayProductionCopyIntegrationTest \
 *            -Dlearnsphere.mysql.bootstrap-test=true
 * </pre>
 */
@EnabledIfSystemProperty(named = "learnsphere.mysql.bootstrap-test", matches = "true")
class FlywayProductionCopyIntegrationTest {

    private static final String COPY_DB = "learnsphere_prod_copy";
    private static final String SERVER = "jdbc:mysql://127.0.0.1:3306/";
    private static final String PARAMS = "?useSSL=false&allowPublicKeyRetrieval=true"
            + "&serverTimezone=Asia/Shanghai&characterEncoding=utf8";

    private Properties credentials() throws Exception {
        Properties props = new Properties();
        try (Reader reader = Files.newBufferedReader(
                Path.of("src/main/resources/application-secret.properties"), StandardCharsets.UTF_8)) {
            props.load(reader);
        }
        return props;
    }

    private boolean copyExists(Properties creds) throws Exception {
        try (Connection conn = DriverManager.getConnection(SERVER + PARAMS,
                creds.getProperty("spring.datasource.username"),
                creds.getProperty("spring.datasource.password"));
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(
                        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '" + COPY_DB + "'")) {
            rs.next();
            return rs.getInt(1) > 0;
        }
    }

    private int tableCount(String db, Properties creds) throws Exception {
        try (Connection conn = DriverManager.getConnection(SERVER + db + PARAMS,
                creds.getProperty("spring.datasource.username"),
                creds.getProperty("spring.datasource.password"));
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(
                        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '" + db + "'")) {
            rs.next();
            return rs.getInt(1);
        }
    }

    private long rowCount(String db, String table, Properties creds) throws Exception {
        try (Connection conn = DriverManager.getConnection(SERVER + db + PARAMS,
                creds.getProperty("spring.datasource.username"),
                creds.getProperty("spring.datasource.password"));
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM `" + table + "`")) {
            rs.next();
            return rs.getLong(1);
        }
    }

    @Test
    void migratesProductionCopyWithoutDataLoss() throws Exception {
        Properties creds = credentials();
        org.junit.jupiter.api.Assumptions.assumeTrue(copyExists(creds),
                "跳过：未找到 " + COPY_DB + "，请先用 mysqldump 克隆生产库");

        int tablesBefore = tableCount(COPY_DB, creds);
        long usersBefore = rowCount(COPY_DB, "user", creds);
        long vocabBefore = rowCount(COPY_DB, "vocabulary", creds);

        Flyway flyway = Flyway.configure()
                .dataSource(SERVER + COPY_DB + PARAMS,
                        creds.getProperty("spring.datasource.username"),
                        creds.getProperty("spring.datasource.password"))
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .baselineVersion("1")
                .validateOnMigrate(true)
                .outOfOrder(false)
                .load();

        var result = flyway.migrate();
        assertThat(result.success).as("生产库副本迁移应成功").isTrue();

        // 1. 数据零丢失
        assertThat(rowCount(COPY_DB, "user", creds)).isEqualTo(usersBefore);
        assertThat(rowCount(COPY_DB, "vocabulary", creds)).isEqualTo(vocabBefore);

        // 2. 表数量只增不减（新增 flyway_schema_history）
        assertThat(tableCount(COPY_DB, creds)).isGreaterThanOrEqualTo(tablesBefore);

        // 3. 历史表记录了 baseline + V2
        try (Connection conn = DriverManager.getConnection(SERVER + COPY_DB + PARAMS,
                creds.getProperty("spring.datasource.username"),
                creds.getProperty("spring.datasource.password"));
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(
                        "SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank")) {
            int rows = 0;
            while (rs.next()) {
                assertThat(rs.getBoolean("success"))
                        .as("所有迁移记录都应成功: " + rs.getString("version"))
                        .isTrue();
                rows++;
            }
            assertThat(rows).isGreaterThanOrEqualTo(2);
        }

        // 4. V2 补齐了缺失字段
        try (Connection conn = DriverManager.getConnection(SERVER + COPY_DB + PARAMS,
                creds.getProperty("spring.datasource.username"),
                creds.getProperty("spring.datasource.password"));
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(
                        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '" + COPY_DB + "'"
                                + " AND COLUMN_NAME = 'user_id'"
                                + " AND TABLE_NAME IN ('listening_material','reading_article',"
                                + "'writing_topic','grammar_exercise')")) {
            int withUserId = 0;
            while (rs.next()) {
                withUserId++;
            }
            assertThat(withUserId)
                    .as("V2 后 4 张表都应有 user_id")
                    .isEqualTo(4);
        }

        // 5. 再次迁移应无操作（幂等）
        var second = flyway.migrate();
        assertThat(second.migrationsExecuted).isZero();
    }
}
