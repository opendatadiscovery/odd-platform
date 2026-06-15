package org.opendatadiscovery.oddplatform.config;

import io.minio.MinioAsyncClient;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

/**
 * Regression guard for the configurable MinIO / S3 region — PLT-086 Defect 2 / LSN-002.
 *
 * <p><b>FLIPPED 2026-06-14 (#1741).</b> This class used to be a {@code @Tag("known-bug")}
 * characterization pin asserting MinioConfig had NO {@code .region(...)} call and no
 * {@code attachment.remote.region} key — GREEN while the bug existed. The bug is now fixed, so
 * per the flip protocol (retrospectives/LSN-029) the pin is RE-GROUNDED (not deleted) to assert
 * the CORRECT behaviour and {@code @pins}&nbsp;->&nbsp;{@code @regresses}.
 *
 * <p><b>Behavioural, not a source scan.</b> The prior pin scanned the source text for
 * {@code .region(}; this builds the real {@link MinioAsyncClient} through {@link MinioConfig} and
 * reads back the region the SDK will sign with — a stronger, meaningful guard. The contract:
 * <ul>
 *   <li>a configured {@code attachment.remote.region} must reach the client (so AWS S3 buckets
 *       outside us-east-1 work — the LSN-002 failure);</li>
 *   <li>a blank region must leave the SDK default in place — the backwards-compatible behaviour
 *       existing MinIO / us-east-1 deployments depend on (no migration).</li>
 * </ul>
 *
 * <p>Why a local store cannot test the end-to-end failure: minio-java auto-discovers the bucket
 * region via {@code GetBucketLocation} and adapts, so a vanilla MinIO upload succeeds regardless
 * (verified by IT-008). The real failure is AWS S3 under least-privilege IAM (no
 * {@code s3:GetBucketLocation} -> the SDK falls back to us-east-1). The deterministic unit-level
 * guard is therefore "the configured region reaches the client"; the REMOTE round-trip is
 * covered by IT-008 in the odd-team workspace.
 *
 * @regresses PLT-086
 */
class MinioConfigRegionTest {

    @Test
    void minioClient_setsRegionFromConfiguration() {
        Assertions.assertThat(regionOf(buildClient("eu-central-1")))
            .as("attachment.remote.region must reach the S3 client so AWS S3 buckets outside "
                + "us-east-1 work (PLT-086 Defect 2 / LSN-002)")
            .isEqualTo("eu-central-1");
    }

    @Test
    void minioClient_withBlankRegion_keepsSdkDefault() {
        final MinioAsyncClient baseline = MinioAsyncClient.builder()
            .endpoint("http://localhost:9000")
            .credentials("access", "secret")
            .build();
        // A blank region leaves the builder exactly as it was before the fix, so the SDK default
        // (us-east-1) governs. Asserted against a baseline built the pre-fix way so the
        // backwards-compatible default is pinned without hard-coding an SDK internal.
        Assertions.assertThat(regionOf(buildClient("")))
            .as("a blank attachment.remote.region must not change the pre-fix SDK default "
                + "(backwards compatible — no migration for existing MinIO / us-east-1 deployments)")
            .isEqualTo(regionOf(baseline));
    }

    private static MinioAsyncClient buildClient(final String region) {
        final MinioConfig config = new MinioConfig();
        ReflectionTestUtils.setField(config, "url", "http://localhost:9000");
        ReflectionTestUtils.setField(config, "accessKey", "access");
        ReflectionTestUtils.setField(config, "secretKey", "secret");
        ReflectionTestUtils.setField(config, "region", region);
        return config.minioClient();
    }

    private static String regionOf(final MinioAsyncClient client) {
        // io.minio.S3Base#region holds the region the SDK signs with when it is explicitly set.
        final Object value = ReflectionTestUtils.getField(client, "region");
        return value == null ? null : value.toString();
    }
}
