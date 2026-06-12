package org.opendatadiscovery.oddplatform.config;

import java.util.Properties;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.io.ClassPathResource;

/**
 * Regression pin for LSN-001 (attachment-storage ephemeral default).
 *
 * <p>The default {@code attachment.storage} is {@code LOCAL}, writing to
 * {@code /tmp/odd/attachments} — which is EPHEMERAL: a container restart silently
 * wipes every uploaded attachment (the 2026-04 production data-loss incident).
 * This test pins the documented default so any change to it must consciously
 * revisit the data-loss caveat in the operator docs and in ADR-0012
 * (attachment-storage backend selected at boot).
 *
 * <p>This is a deterministic gate, not a free-floating test:
 *
 * @enforces ADR-0012
 * @regresses LSN-001
 */
class AttachmentStorageDefaultRegressionPinTest {

    @Test
    void attachmentStorageDefault_isLocalEphemeralTmpPath() {
        final YamlPropertiesFactoryBean factory = new YamlPropertiesFactoryBean();
        factory.setResources(new ClassPathResource("application.yml"));
        final Properties props = factory.getObject();

        Assertions.assertThat(props)
            .as("main application.yml must load from the test classpath")
            .isNotNull();

        // LSN-001: the shipped default backend is LOCAL (ephemeral). If this
        // flips, the ephemeral-data-loss caveat (docs + ADR-0012) must be
        // re-confirmed — the test forces that decision rather than letting the
        // default drift silently.
        Assertions.assertThat(props.getProperty("attachment.storage"))
            .as("default attachment.storage — LSN-001 ephemeral default")
            .isEqualTo("LOCAL");

        Assertions.assertThat(props.getProperty("attachment.local.path"))
            .as("LOCAL path is the tmp dir wiped on container restart — LSN-001")
            .isEqualTo("/tmp/odd/attachments");
    }
}
