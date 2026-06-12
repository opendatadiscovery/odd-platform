package org.opendatadiscovery.oddplatform.config;

import java.util.List;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Dependency-posture pins — ADR-0071 (Postgres-only runtime dependency) and
 * ADR-0072 (contract-first reactive stack, no servlet).
 *
 * <p>ODD's deliberate operational simplicity is "run Postgres and nothing else": no
 * Kafka/AMQP/ActiveMQ/Pulsar/NATS broker, no ZooKeeper/Consul/etcd/Hazelcast external
 * coordination, no search cluster, and a fully reactive (WebFlux + R2DBC) stack with
 * no blocking servlet container. Each of those, if it crept onto the classpath, would
 * silently add an operational dependency an operator must now provision and run — the
 * exact drift ADR-0071/0072 forbid. These pins assert the forbidden runtime libraries
 * are absent (and the reactive ones present), so adding any of them is a conscious
 * edit that trips CI rather than a transitive surprise.
 *
 * <p>Idiom: {@code Class.forName} absence — the same deterministic, no-context shape as
 * the LSN-001/002 regression pins. It checks the real resolved classpath rather than a
 * declared coordinate, so a forbidden <em>transitive</em> dependency is caught too. A
 * mistyped forbidden class name is harmless (it is simply absent → the pin still
 * passes); the only way a forbidden-set pin fails is the library actually being present.
 *
 * <p>Deterministic gates, not free-floating tests:
 *
 * @enforces ADR-0071
 * @enforces ADR-0072
 */
class DependencyPostureTest {

    /**
     * ADR-0071: no messaging broker or external coordination/search client on the
     * runtime classpath. Redis is intentionally NOT in this set — it is an allowed
     * opt-in (reactive) session store; Postgres + ShedLock-JDBC are the only
     * coordination primitives.
     */
    @Test
    void noForbiddenMessagingOrCoordinationClient_onClasspath() {
        final List<String> forbidden = List.of(
            "org.apache.kafka.clients.producer.KafkaProducer",       // Kafka
            "com.rabbitmq.client.Connection",                        // AMQP / RabbitMQ
            "org.apache.activemq.ActiveMQConnection",                // ActiveMQ
            "org.apache.pulsar.client.api.PulsarClient",             // Pulsar
            "io.nats.client.Connection",                             // NATS
            "com.hazelcast.core.Hazelcast",                          // Hazelcast
            "org.apache.zookeeper.ZooKeeper",                        // ZooKeeper
            "io.etcd.jetcd.Client",                                  // etcd
            "co.elastic.clients.elasticsearch.ElasticsearchClient",  // Elasticsearch 8.x
            "org.elasticsearch.client.RestHighLevelClient"           // Elasticsearch legacy
        );
        for (final String fqcn : forbidden) {
            Assertions.assertThat(isOnClasspath(fqcn))
                .as("ADR-0071 forbids %s on the runtime classpath (Postgres-only dependency)", fqcn)
                .isFalse();
        }
    }

    /**
     * ADR-0072: no blocking servlet stack. The platform is contract-first reactive
     * (WebFlux + R2DBC); a servlet DispatcherServlet / embedded Tomcat / embedded
     * Jetty would mean a blocking tier slipped in. springdoc uses the {@code
     * -webflux-ui} variant precisely so this stays true.
     */
    @Test
    void noServletStack_onClasspath() {
        final List<String> forbidden = List.of(
            "org.springframework.web.servlet.DispatcherServlet",  // Spring MVC
            "org.apache.catalina.startup.Tomcat",                 // embedded Tomcat
            "org.eclipse.jetty.server.Server"                     // embedded Jetty
        );
        for (final String fqcn : forbidden) {
            Assertions.assertThat(isOnClasspath(fqcn))
                .as("ADR-0072 forbids servlet stack %s (reactive WebFlux only)", fqcn)
                .isFalse();
        }
    }

    /**
     * ADR-0072 positive guard: the reactive stack the platform DOES depend on must be
     * present — catches an accidental removal that would silently break the reactive
     * contract before the no-servlet pin above could.
     */
    @Test
    void reactiveStack_isPresent() {
        Assertions.assertThat(isOnClasspath("org.springframework.web.reactive.function.server.RouterFunction"))
            .as("ADR-0072 requires the WebFlux reactive web stack")
            .isTrue();
        Assertions.assertThat(isOnClasspath("io.r2dbc.spi.ConnectionFactory"))
            .as("ADR-0072 requires R2DBC reactive persistence")
            .isTrue();
    }

    private static boolean isOnClasspath(final String fqcn) {
        try {
            Class.forName(fqcn, false, DependencyPostureTest.class.getClassLoader());
            return true;
        } catch (final ClassNotFoundException e) {
            return false;
        }
    }
}
