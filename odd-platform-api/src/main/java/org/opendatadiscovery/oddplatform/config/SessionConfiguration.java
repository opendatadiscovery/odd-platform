package org.opendatadiscovery.oddplatform.config;

import java.util.concurrent.ConcurrentHashMap;
import org.opendatadiscovery.oddplatform.auth.session.JooqSessionRepository;
import org.opendatadiscovery.oddplatform.auth.session.PostgreSQLSessionHousekeepingJob;
import org.opendatadiscovery.oddplatform.auth.session.PostgreSQLSessionHousekeepingJobHandler;
import org.opendatadiscovery.oddplatform.repository.util.JooqQueryHelper;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.session.MapSession;
import org.springframework.session.ReactiveMapSessionRepository;
import org.springframework.session.ReactiveSessionRepository;
import org.springframework.session.config.annotation.web.server.EnableSpringWebSession;
import org.springframework.session.data.redis.config.annotation.web.server.EnableRedisWebSession;

@Configuration
public class SessionConfiguration {
    @Configuration
    @Conditional(SpringWebSessionConfiguration.SpringWebSessionCondition.class)
    @EnableSpringWebSession
    @EnableScheduling
    static class SpringWebSessionConfiguration {
        @Bean
        @ConditionalOnProperty(prefix = "session", name = "provider", havingValue = "INTERNAL_POSTGRESQL")
        public ReactiveSessionRepository<MapSession> psqlReactiveSessionRepository(
            final JooqReactiveOperations jooqReactiveOperations,
            final JooqQueryHelper jooqQueryHelper
        ) {
            return new JooqSessionRepository(jooqReactiveOperations, jooqQueryHelper);
        }

        @ConditionalOnProperty(prefix = "session", name = "provider", havingValue = "INTERNAL_POSTGRESQL")
        @Bean
        public PostgreSQLSessionHousekeepingJobHandler scheduleHousekeepingTask(
            final PostgreSQLSessionHousekeepingJob job
        ) {
            return new PostgreSQLSessionHousekeepingJobHandler(job);
        }

        @Bean
        @ConditionalOnProperty(prefix = "session", name = "provider", havingValue = "IN_MEMORY")
        public ReactiveSessionRepository<MapSession> inMemoryReactiveSessionRepository() {
            return new ReactiveMapSessionRepository(new ConcurrentHashMap<>());
        }

        static class SpringWebSessionCondition implements Condition {
            @Override
            public boolean matches(final ConditionContext context,
                                   final AnnotatedTypeMetadata metadata) {
                final String sessionProvider = context.getEnvironment().getProperty("session.provider");
                return "INTERNAL_POSTGRESQL".equals(sessionProvider) || "IN_MEMORY".equals(sessionProvider);
            }
        }
    }

    @Configuration
    @ConditionalOnProperty(prefix = "session", name = "provider", havingValue = "REDIS")
    @EnableRedisWebSession
    static class RedisSessionConfiguration {
    }
}
