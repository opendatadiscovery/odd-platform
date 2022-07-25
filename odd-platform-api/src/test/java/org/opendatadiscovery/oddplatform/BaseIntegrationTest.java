package org.opendatadiscovery.oddplatform;

import java.util.concurrent.atomic.AtomicInteger;
import lombok.SneakyThrows;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

import static org.testcontainers.containers.PostgreSQLContainer.POSTGRESQL_PORT;

@ActiveProfiles("integration-test")
@SpringBootTest
@ContextConfiguration(initializers = {BaseIntegrationTest.Initializer.class})
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_CLASS)
public abstract class BaseIntegrationTest {

    static final PostgreSQLContainer<?> POSTGRE_SQL_CONTAINER;

    static {
        POSTGRE_SQL_CONTAINER = new PostgreSQLContainer<>(DockerImageName.parse("postgres:13.2-alpine"));
        POSTGRE_SQL_CONTAINER.start();
    }

    static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

        public void initialize(final ConfigurableApplicationContext configurableApplicationContext) {
            final String newDbName = DatabaseGenerator.createDatabaseInContainer();
            TestPropertyValues.of(
                "spring.datasource.url=" + "jdbc:postgresql://" + POSTGRE_SQL_CONTAINER.getHost() + ":"
                    + POSTGRE_SQL_CONTAINER.getMappedPort(POSTGRESQL_PORT) + "/" + newDbName,
                "spring.datasource.username=" + POSTGRE_SQL_CONTAINER.getUsername(),
                "spring.datasource.password=" + POSTGRE_SQL_CONTAINER.getPassword()
            ).applyTo(configurableApplicationContext.getEnvironment());
        }
    }

    static class DatabaseGenerator {

        static AtomicInteger index = new AtomicInteger(0);

        @SneakyThrows
        static String createDatabaseInContainer() {
            final String dbName = "odd" + index.getAndIncrement();
            final String command = "CREATE DATABASE " + dbName + " OWNER test;";
            POSTGRE_SQL_CONTAINER.execInContainer("psql", "-U", "test", "-c", command);
            return dbName;
        }
    }
}
