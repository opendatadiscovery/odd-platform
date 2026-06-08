package org.opendatadiscovery.oddplatform.config;

import java.util.Properties;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.config.properties.GenAIProperties;
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.io.ClassPathResource;

/**
 * Feature-gating defaults pin — ADR-0075 posture + the off-by-default family.
 *
 * <p>ODD ships cost-/risk-bearing optional feature families DISABLED and ships the
 * data-hygiene family ENABLED — the deliberate inversion captured in ADR-0075. An
 * accidental flip of any shipped default silently changes a fresh install's security,
 * cost, or data-retention posture: a GenAI endpoint suddenly reachable, notifications
 * firing on first boot against an unconfigured channel, or — the dangerous inversion —
 * housekeeping NOT running so partitions and aged rows grow without bound.
 *
 * <p>These pins assert every shipped gating default so a change to any of them must be
 * a conscious edit that trips this test, rather than a value that drifts unnoticed.
 * Same idiom as the LSN-001/002 regression pins (no Spring context, deterministic, CI).
 *
 * <p>Deterministic gates, not free-floating tests:
 *
 * @enforces ADR-0075
 * @enforces ADR-0004
 * @enforces ADR-0040
 * @enforces ADR-0046
 */
class FeatureGatingDefaultsTest {

    private static Properties shippedDefaults() {
        final YamlPropertiesFactoryBean factory = new YamlPropertiesFactoryBean();
        factory.setResources(new ClassPathResource("application.yml"));
        final Properties props = factory.getObject();
        Assertions.assertThat(props)
            .as("main application.yml must load from the test classpath")
            .isNotNull();
        return props;
    }

    /**
     * ADR-0075 / ADR-0004 / ADR-0040 / ADR-0019: the cost-/risk-bearing optional
     * families ship DISABLED. A flip here opens a fresh install's posture silently —
     * an external LLM call path, or notification senders, live on first boot.
     */
    @Test
    void offByDefaultFamily_shipsDisabled() {
        final Properties props = shippedDefaults();

        Assertions.assertThat(props.getProperty("genai.enabled"))
            .as("genai.enabled — ADR-0004 GenAI disabled-by-default")
            .isEqualTo("false");

        Assertions.assertThat(props.getProperty("notifications.enabled"))
            .as("notifications.enabled — ADR-0040 notifications disabled-by-default")
            .isEqualTo("false");

        Assertions.assertThat(props.getProperty("datacollaboration.enabled"))
            .as("datacollaboration.enabled — ADR-0075 off-by-default family (ADR-0019)")
            .isEqualTo("false");
    }

    /**
     * ADR-0075 / ADR-0046: the data-hygiene family ships ENABLED — the deliberate
     * inversion. If this flips to false, TTL housekeeping stops and partitions plus
     * aged audit/alert rows accumulate without bound (the silent-growth failure mode).
     */
    @Test
    void hygieneFamily_shipsEnabled() {
        final Properties props = shippedDefaults();

        Assertions.assertThat(props.getProperty("housekeeping.enabled"))
            .as("housekeeping.enabled — ADR-0046 housekeeping enabled-by-default (the ADR-0075 inversion)")
            .isEqualTo("true");
    }

    /**
     * ADR-0004: GenAI ships INERT — no URL, no timeout in application.yml. Combined
     * with the disabled flag, a fresh install has no external LLM endpoint to reach
     * even if the disabled guard were bypassed.
     */
    @Test
    void genai_shipsInert_noEndpointInYaml() {
        final Properties props = shippedDefaults();

        Assertions.assertThat(props.getProperty("genai.url"))
            .as("genai.url must not be shipped — ADR-0004 inert default")
            .isNull();

        Assertions.assertThat(props.getProperty("genai.request_timeout"))
            .as("genai.request_timeout must not be shipped — ADR-0004 inert default")
            .isNull();
    }

    /**
     * ADR-0004: the GenAIProperties Java field defaults are inert (enabled=false,
     * url=null, requestTimeout=0) — so even with the yml keys absent, the bound bean
     * is harmless. Introducing a non-null url or non-zero timeout default changes the
     * shape of the "request_timeout=0 → misleading 0-minute error" misconfiguration
     * (F-039 H-002); this pin forces that to be confronted with the docs/ADR.
     */
    @Test
    void genaiProperties_javaDefaults_areInert() {
        final GenAIProperties defaults = new GenAIProperties();

        Assertions.assertThat(defaults.isEnabled())
            .as("GenAIProperties.enabled default — ADR-0004")
            .isFalse();

        Assertions.assertThat(defaults.getUrl())
            .as("GenAIProperties.url default — ADR-0004 inert")
            .isNull();

        Assertions.assertThat(defaults.getRequestTimeout())
            .as("GenAIProperties.requestTimeout default — ADR-0004 inert (the misleading '0 min')")
            .isZero();
    }
}
