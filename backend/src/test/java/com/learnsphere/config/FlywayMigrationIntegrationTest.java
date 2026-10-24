package com.learnsphere.config;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationState;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Flyway 迁移机制的集成测试。
 *
 * <p>只连接本机可丢弃的临时数据库，不启动 Spring 容器、不启动 Web 服务。
 * 需要真实 MySQL，因此通过系统属性开关控制：
 * <pre>
 *   mvn test -Dtest=FlywayMigrationIntegrationTest \
 *            -Dlearnsphere.mysql.bootstrap-test=true
 * </pre>
 *
 * <p>覆盖四个关键场景：
 * <ol>
 *   <li>空库首次迁移：V1 baseline 与 V2 正确落地，历史表记录完整</li>
 *   <li>重复执行幂等：再跑一次不产生新记录、不报错</li>
 *   <li>已有数据的库升级：不破坏存量数据</li>
 *   <li>V2 的幂等性：字段已存在时不报错（模拟各环境状态不一致）</li>
 * </ol>
 */
@EnabledIfSystemProperty(named = "learnsphere.mysql.bootstrap-test", matches = "true")
class FlywayMigrationIntegrationTest {

    private static final String MYSQL_SERVER = "jdbc:mysql://127.0.0.1:3306/";
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

    private String createDatabase(Properties creds) throws Exception {
        String db = "learnsphere_flyway_test_" + UUID.randomUUID().toString().replace("-", "");
        try (Connection conn = DriverManager.getConnection(MYSQL_SERVER + PARAMS,
                creds.getProperty("spring.datasource.username"),
                creds.getProperty("spring.datasource.password"));
                Statement st = conn.createStatement()) {
            st.execute("CREATE DATABASE `" + db + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        }
        return db;
    }

    private Flyway flywayFor(String db, Properties creds) {
        return Flyway.configure()
                .dataSource(MYSQL_SERVER + db + PARAMS,
                        creds.getProperty("spring.datasource.username"),
                        creds.getProperty("spring.datasource.password"))
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .baselineVersion("1")
                .validateOnMigrate(true)
                .outOfOrder(false)
                .load();
    }

    private void dropDatabase(String db, Properties creds) throws Exception {
        try (Connection conn = DriverManager.getConnection(MYSQL_SERVER + PARAMS,
                creds.getProperty("spring.datasource.username"),
                creds.getProperty("spring.datasource.password"));
                Statement st = conn.createStatement()) {
            st.execute("DROP DATABASE IF EXISTS `" + db + "`");
        }
    }

    /** 造出 V2 依赖的 4 张表，模拟「存量库已有业务表但缺 user_id」的状态。 */
    private void createLegacyTables(String db, Properties creds) throws Exception {
        String url = MYSQL_SERVER + db + PARAMS;
        try (Connection conn = DriverManager.getConnection(url,
                creds.getProperty("spring.datasource.username"),
                creds.getProperty("spring.datasource.password"));
                Statement st = conn.createStatement()) {
            st.execute("CREATE TABLE `listening_material` (`id` BIGINT PRIMARY KEY AUTO_INCREMENT,"
                    + " `title` VARCHAR(200)) ENGINE=InnoDB");
            st.execute("CREATE TABLE `reading_article` (`id` BIGINT PRIMARY KEY AUTO_INCREMENT,"
                    + " `title` VARCHAR(200)) ENGINE=InnoDB");
            st.execute("CREATE TABLE `writing_topic` (`id` BIGINT PRIMARY KEY AUTO_INCREMENT,"
                    + " `title` VARCHAR(200)) ENGINE=InnoDB");
            st.execute("CREATE TABLE `grammar_exercise` (`id` BIGINT PRIMARY KEY AUTO_INCREMENT,"
                    + " `topic` VARCHAR(200)) ENGINE=InnoDB");
        }
    }

    /**
     * 执行 db/bootstrap/schema.sql，模拟 spring.sql.init 在生产环境的行为。
     *
     * <p>这是必要的：真实启动时 schema.sql 先建 36 张表，DatabaseInitializer 再跑
     * 幂等 ALTER，最后 Flyway 才执行 V2。若测试跳过这一步，空库上 V2 会因为
     * 目标表不存在而走 skip 分支，无法验证真实路径。
     *
     * <p>用 Spring 的 ScriptUtils 而非手工按分号切分：schema.sql 的建表语句跨多行，
     * 且文件头有注释块，手工切分会把注释与语句粘连导致语法错误。
     */
    private void applyBootstrapSchema(String db, Properties creds) throws Exception {
        String url = MYSQL_SERVER + db + PARAMS;
        String script = Files.readString(
                Path.of("src/main/resources/db/bootstrap/schema.sql"), StandardCharsets.UTF_8);
        try (Connection conn = DriverManager.getConnection(url,
                creds.getProperty("spring.datasource.username"),
                creds.getProperty("spring.datasource.password"))) {
            org.springframework.jdbc.datasource.init.ScriptUtils.executeSqlScript(
                    conn,
                    new org.springframework.core.io.ByteArrayResource(script.getBytes(StandardCharsets.UTF_8)));
        }
    }

    private boolean hasColumn(String db, String table, String column, Properties creds) throws Exception {
        String url = MYSQL_SERVER + db + PARAMS;
        try (Connection conn = DriverManager.getConnection(url,
                creds.getProperty("spring.datasource.username"),
                creds.getProperty("spring.datasource.password"));
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(
                        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE()"
                                + " AND TABLE_NAME = '" + table + "' AND COLUMN_NAME = '" + column + "'")) {
            rs.next();
            return rs.getInt(1) > 0;
        }
    }

    private int countAppliedMigrations(String db, Properties creds) throws Exception {
        String url = MYSQL_SERVER + db + PARAMS;
        try (Connection conn = DriverManager.getConnection(url,
                creds.getProperty("spring.datasource.username"),
                creds.getProperty("spring.datasource.password"));
                Statement st = conn.createStatement();
                ResultSet rs = st.executeQuery(
                        "SELECT COUNT(*) FROM flyway_schema_history WHERE success = 1")) {
            rs.next();
            return rs.getInt(1);
        }
    }

    @Test
    void migratesEmptyDatabaseAndRecordsHistory() throws Exception {
        Properties creds = credentials();
        String db = createDatabase(creds);
        try {
            // 先走既有机制建基线表，再交给 Flyway —— 与真实启动顺序一致
            applyBootstrapSchema(db, creds);

            Flyway flyway = flywayFor(db, creds);
            var result = flyway.migrate();

            assertThat(result.success).isTrue();

            // baseline 记录 + V2
            assertThat(countAppliedMigrations(db, creds)).isGreaterThanOrEqualTo(2);

            // V2 的核心效果：4 张表都补上了 user_id 与索引
            for (String table : List.of("listening_material", "reading_article",
                    "writing_topic", "grammar_exercise")) {
                assertThat(hasColumn(db, table, "user_id", creds))
                        .as(table + ".user_id 应已创建")
                        .isTrue();
            }

            // 历史表结构合理：版本号可解析、描述非空
            List<MigrationInfo> applied = new ArrayList<>();
            for (MigrationInfo info : flyway.info().applied()) {
                applied.add(info);
            }
            assertThat(applied).isNotEmpty();
            assertThat(applied).allSatisfy(info -> {
                assertThat(info.getVersion()).isNotNull();
                assertThat(info.getState()).isIn(MigrationState.SUCCESS, MigrationState.BASELINE);
            });
        } finally {
            dropDatabase(db, creds);
        }
    }

    @Test
    void secondMigrateIsNoOp() throws Exception {
        Properties creds = credentials();
        String db = createDatabase(creds);
        try {
            applyBootstrapSchema(db, creds);
            Flyway flyway = flywayFor(db, creds);
            assertThat(flyway.migrate().success).isTrue();
            int afterFirst = countAppliedMigrations(db, creds);

            // 再跑一次：不应产生新记录
            var second = flyway.migrate();
            assertThat(second.success).isTrue();
            assertThat(second.migrationsExecuted).isZero();
            assertThat(countAppliedMigrations(db, creds)).isEqualTo(afterFirst);
        } finally {
            dropDatabase(db, creds);
        }
    }

    @Test
    void migratesLegacyDatabaseWithoutLosingData() throws Exception {
        Properties creds = credentials();
        String db = createDatabase(creds);
        try {
            // 模拟存量库：表已存在、已有数据、但没有 user_id
            createLegacyTables(db, creds);
            String url = MYSQL_SERVER + db + PARAMS;
            try (Connection conn = DriverManager.getConnection(url,
                    creds.getProperty("spring.datasource.username"),
                    creds.getProperty("spring.datasource.password"));
                    Statement st = conn.createStatement()) {
                st.execute("INSERT INTO `listening_material` (`title`) VALUES ('存量听力')");
                st.execute("INSERT INTO `reading_article` (`title`) VALUES ('存量阅读')");
            }

            Flyway flyway = flywayFor(db, creds);
            assertThat(flyway.migrate().success).isTrue();

            // 存量数据必须保留，且 user_id 为 NULL 表示全局共享
            try (Connection conn = DriverManager.getConnection(url,
                    creds.getProperty("spring.datasource.username"),
                    creds.getProperty("spring.datasource.password"));
                    Statement st = conn.createStatement();
                    ResultSet rs = st.executeQuery(
                            "SELECT title, user_id FROM listening_material")) {
                assertThat(rs.next()).isTrue();
                assertThat(rs.getString("title")).isEqualTo("存量听力");
                rs.getObject("user_id");
                assertThat(rs.wasNull()).as("存量记录 user_id 应为 NULL（全局共享）").isTrue();
            }

            assertThat(hasColumn(db, "writing_topic", "user_id", creds)).isTrue();
        } finally {
            dropDatabase(db, creds);
        }
    }

    @Test
    void v2IsIdempotentWhenColumnsAlreadyExist() throws Exception {
        Properties creds = credentials();
        String db = createDatabase(creds);
        try {
            // 模拟「部分环境已经手工加过 user_id」的不一致状态
            createLegacyTables(db, creds);
            String url = MYSQL_SERVER + db + PARAMS;
            try (Connection conn = DriverManager.getConnection(url,
                    creds.getProperty("spring.datasource.username"),
                    creds.getProperty("spring.datasource.password"));
                    Statement st = conn.createStatement()) {
                st.execute("ALTER TABLE `listening_material` ADD COLUMN `user_id` BIGINT NULL AFTER `id`");
                st.execute("ALTER TABLE `listening_material` ADD INDEX `idx_user_id` (`user_id`)");
            }

            // 关键断言：V2 遇到已存在的字段/索引必须跳过而不是报错
            Flyway flyway = flywayFor(db, creds);
            var result = flyway.migrate();
            assertThat(result.success)
                    .as("V2 应在字段已存在时安全跳过，而非失败")
                    .isTrue();

            assertThat(hasColumn(db, "listening_material", "user_id", creds)).isTrue();
            assertThat(hasColumn(db, "grammar_exercise", "user_id", creds)).isTrue();
        } finally {
            dropDatabase(db, creds);
        }
    }
}
