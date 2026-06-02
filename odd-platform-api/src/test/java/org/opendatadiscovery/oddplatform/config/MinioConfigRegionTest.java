package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * LSN-002 regression pin — MinioConfig must build the S3 client with an explicit,
 * configurable region.
 *
 * <p>The 2026-04 incident (retrospectives/LSN-002): {@code MinioConfig} built
 * {@code MinioAsyncClient.builder().endpoint(...).credentials(...).build()} with NO
 * {@code .region(...)} call, and there is no {@code attachment.remote.region} config key.
 * The AWS/MinIO SDK defaults an unset region to {@code us-east-1}, so REMOTE S3 storage
 * silently only worked against us-east-1 buckets — an operator pointing REMOTE at any
 * other region got opaque failures.
 *
 * <p>Why this is a STRUCTURAL pin rather than an integration test: a vanilla MinIO cannot
 * reproduce the bug — minio-java auto-discovers the bucket region via
 * {@code GetBucketLocation} and adapts, so an upload against a non-us-east-1 MinIO
 * succeeds (verified by the integration test IT-008 in the odd-team workspace). The real
 * failure is against AWS S3 under least-privilege IAM (no {@code s3:GetBucketLocation}
 * permission → the SDK falls back to us-east-1 → cross-region requests rejected), which a
 * local store cannot faithfully reproduce. So the deterministic, faithful pin is the code
 * fact: the region must be set from configuration.
 *
 * <p>Idiom: source scan (sibling of {@link DependencyPostureTest}'s classpath scan) —
 * deterministic, no Spring context. Reads the real {@code MinioConfig} source from the
 * module (gradle runs tests with the module root as the working directory). RED until
 * {@code MinioConfig} reads {@code attachment.remote.region} and applies it via
 * {@code .region(...)}.
 *
 * @regresses PLT-086
 */
class MinioConfigRegionTest {

    private static final Path MINIO_CONFIG = Path.of(
        "src/main/java/org/opendatadiscovery/oddplatform/config/MinioConfig.java");

    @Test
    void minioClient_setsRegionFromConfiguration() throws IOException {
        Assertions.assertThat(Files.exists(MINIO_CONFIG))
            .as("MinioConfig source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", MINIO_CONFIG.toAbsolutePath())
            .isTrue();

        final String src = Files.readString(MINIO_CONFIG);

        Assertions.assertThat(src)
            .as("LSN-002: MinioConfig must build MinioAsyncClient with an explicit .region(...) "
                + "so REMOTE S3 works outside us-east-1 (an unset region defaults to us-east-1). "
                + "See retrospectives/LSN-002, PLT-086 Defect 2.")
            .contains(".region(");

        Assertions.assertThat(src)
            .as("LSN-002: MinioConfig must read the region from configuration "
                + "(attachment.remote.region) so operators can target a non-us-east-1 bucket; "
                + "today there is no such key. See retrospectives/LSN-002, PLT-086 Defect 2.")
            .contains("attachment.remote.region");
    }
}
