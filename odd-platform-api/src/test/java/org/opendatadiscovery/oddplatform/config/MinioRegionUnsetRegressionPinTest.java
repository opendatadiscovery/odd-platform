package org.opendatadiscovery.oddplatform.config;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.List;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;

/**
 * Config-key contract guard for the MinIO / S3 region — LSN-002.
 *
 * <p><b>FLIPPED 2026-06-14 (#1741).</b> This pin used to assert the ABSENCE of a region knob (the
 * LSN-002 bug: the only configurable inputs were the endpoint URL + credentials). The fix added
 * one, so per LSN-029 the pin is RE-GROUNDED (not deleted) to assert its PRESENCE and the public
 * contract — a distinct angle from {@link MinioConfigRegionTest} (which asserts the runtime
 * behaviour): here we pin that the {@code region} field exists and binds the OPTIONAL
 * {@code attachment.remote.region} key with an EMPTY default. Removing the knob, renaming the key,
 * or dropping the empty default (which is what keeps existing deployments on the
 * backwards-compatible us-east-1 default — no migration) breaks this.
 *
 * @regresses LSN-002
 */
class MinioRegionUnsetRegressionPinTest {

    @Test
    void minioConfig_exposesConfigurableRegionKnob() throws NoSuchFieldException {
        final List<String> instanceFields = Arrays.stream(MinioConfig.class.getDeclaredFields())
            .filter(f -> !Modifier.isStatic(f.getModifiers()))
            .map(Field::getName)
            .toList();

        Assertions.assertThat(instanceFields)
            .as("LSN-002: MinioConfig exposes a configurable region knob alongside endpoint + credentials")
            .containsExactlyInAnyOrder("url", "accessKey", "secretKey", "region");

        final Value value = MinioConfig.class.getDeclaredField("region").getAnnotation(Value.class);
        Assertions.assertThat(value)
            .as("LSN-002: the region field must be a bindable @Value")
            .isNotNull();
        Assertions.assertThat(value.value())
            .as("LSN-002: region must bind the OPTIONAL attachment.remote.region key with an EMPTY default — "
                + "blank keeps the backwards-compatible us-east-1 default (no migration)")
            .isEqualTo("${attachment.remote.region:}");
    }
}
