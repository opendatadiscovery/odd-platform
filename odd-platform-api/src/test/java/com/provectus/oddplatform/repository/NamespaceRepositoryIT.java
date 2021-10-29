package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.container.ODDPlatformDatabaseContainer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Slf4j
@RunWith(SpringRunner.class)
@SpringBootTest
@ContextConfiguration(initializers = {NamespaceRepositoryIT.Initializer.class})
@RequiredArgsConstructor(onConstructor_ = {@Autowired})
@Testcontainers
public class NamespaceRepositoryIT {
    @Container
    public static PostgreSQLContainer<ODDPlatformDatabaseContainer> DATABASE_CONTAINER =
        ODDPlatformDatabaseContainer.getInstance();

    private final NamespaceRepositoryImpl namespaceRepository;

    static class Initializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        public void initialize(final ConfigurableApplicationContext configurableApplicationContext) {
            TestPropertyValues.of(
                "spring.datasource.url=" + DATABASE_CONTAINER.getJdbcUrl(),
                "spring.datasource.username=" + DATABASE_CONTAINER.getUsername(),
                "spring.datasource.password=" + DATABASE_CONTAINER.getPassword()
            ).applyTo(configurableApplicationContext.getEnvironment());
        }
    }
}
