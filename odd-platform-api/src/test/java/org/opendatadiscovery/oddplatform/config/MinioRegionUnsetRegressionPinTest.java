package org.opendatadiscovery.oddplatform.config;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.List;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Regression pin for LSN-002 (MinIO region unset).
 *
 * <p>{@link MinioConfig#minioClient()} builds the {@code MinioAsyncClient} with
 * {@code .endpoint(url).credentials(...).build()} and NO {@code .region(...)},
 * and the config exposes no region property — so a REMOTE attachment backend
 * only works against AWS {@code us-east-1} (the 2026-04 incident where operators
 * following our guide hit a region that silently failed).
 *
 * <p>This pins the ABSENCE of any region knob: the only configurable inputs are
 * the endpoint URL and credentials. When region support is added (a {@code region}
 * field / {@code attachment.remote.region} property), this test fails — forcing
 * the LSN-002 caveat and the builder fix to be confronted together rather than
 * one drifting from the other.
 *
 * <p>This is a deterministic gate, not a free-floating test:
 *
 * @regresses LSN-002
 */
class MinioRegionUnsetRegressionPinTest {

    @Test
    void minioConfig_exposesNoRegionKnob() {
        final List<String> instanceFields = Arrays.stream(MinioConfig.class.getDeclaredFields())
            .filter(f -> !Modifier.isStatic(f.getModifiers()))
            .map(Field::getName)
            .toList();

        // LSN-002: endpoint + credentials are the only configurable inputs; there
        // is deliberately (and dangerously) NO region. Adding one must break this
        // pin so the region caveat cannot silently disappear or silently appear.
        Assertions.assertThat(instanceFields)
            .as("MinioConfig configurable inputs — LSN-002 pins the absence of a region knob")
            .containsExactlyInAnyOrder("url", "accessKey", "secretKey")
            .doesNotContain("region");
    }
}
