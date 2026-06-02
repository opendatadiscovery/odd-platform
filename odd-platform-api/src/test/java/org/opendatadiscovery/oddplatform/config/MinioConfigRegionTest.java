package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/**
 * KNOWN-BUG PIN (characterization tripwire) — PLT-086 Defect 2 / LSN-002.
 *
 * <p><b>This test asserts behaviour that is WRONG, on purpose.</b> It pins the CURRENT,
 * deliberately-unfixed state of {@code MinioConfig}: the S3 client is built as
 * {@code MinioAsyncClient.builder().endpoint(...).credentials(...).build()} with NO
 * {@code .region(...)} call, and there is no {@code attachment.remote.region} config key.
 * The AWS/MinIO SDK defaults an unset region to {@code us-east-1}, so REMOTE S3 storage
 * silently only works against us-east-1 — an operator pointing REMOTE at any other region
 * gets opaque failures (the 2026-04 incident: retrospectives/LSN-002).
 *
 * <p><b>Why a GREEN characterization pin, not {@code @Disabled} and not a RED aspiration
 * test.</b> We are choosing not to fix this bug right now — but we must not go blind to it.
 * A {@code @Disabled} test runs nothing: if the behaviour later changes (someone adds
 * {@code .region(...)} as a side effect, or refactors the builder), nothing fires and the
 * change ships undocumented and unplanned. A RED aspiration test (asserting the fix is
 * present) breaks the build. So instead this test asserts the bug IS present: it is GREEN
 * while the bug exists, and goes RED the instant {@code MinioConfig}'s region handling
 * changes — a live tripwire, not a dead annotation. The general rule: retrospectives/LSN-029.
 *
 * <p><b>When this test goes RED — the flip protocol.</b> RED means MinioConfig's region
 * handling changed. Decide which:
 * <ol>
 *   <li><b>Intentional, planned fix</b> (PLT-086 Defect 2 done): INVERT this test to assert
 *       the CORRECT behaviour — {@code src.contains(".region(")} and
 *       {@code src.contains("attachment.remote.region")} — rename it to
 *       {@code minioClient_setsRegionFromConfiguration}, change {@code @pins} to
 *       {@code @regresses} (it now guards the fix from regressing), and move PLT-086 from
 *       {@code pins:} to {@code regresses:} in lineage/odd-platform/test-gates.yaml. Then
 *       close PLT-086 Defect 2.</li>
 *   <li><b>Unplanned change</b>: you just caught an undocumented behaviour change — stop and
 *       investigate before it ships.</li>
 * </ol>
 *
 * <p>Why a STRUCTURAL (source-scan) pin rather than a runtime/integration test: a vanilla
 * MinIO cannot reproduce the bug — minio-java auto-discovers the bucket region via
 * {@code GetBucketLocation} and adapts (verified by IT-008 in the odd-team workspace). The
 * real failure is against AWS S3 under least-privilege IAM (no {@code s3:GetBucketLocation}
 * permission → the SDK falls back to us-east-1 → cross-region requests rejected), which a
 * local store cannot faithfully reproduce. So the deterministic, faithful pin is the code
 * fact: today the region is not set from configuration. Idiom: source scan (sibling of
 * {@link DependencyPostureTest}'s classpath scan), no Spring context; gradle runs tests with
 * the module root as the working directory.
 *
 * @pins PLT-086
 */
@Tag("known-bug")
class MinioConfigRegionTest {

    private static final Path MINIO_CONFIG = Path.of(
        "src/main/java/org/opendatadiscovery/oddplatform/config/MinioConfig.java");

    /**
     * Characterizes the OPEN bug: MinioConfig builds the S3 client without a configurable
     * region. GREEN asserts the bug is still present; RED means the behaviour changed —
     * follow the flip protocol in the class javadoc. Named for the buggy state it pins.
     */
    @Test
    void minioClient_doesNotSetRegion_knownBug_PLT086() throws IOException {
        Assertions.assertThat(Files.exists(MINIO_CONFIG))
            .as("MinioConfig source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", MINIO_CONFIG.toAbsolutePath())
            .isTrue();

        final String src = Files.readString(MINIO_CONFIG);

        Assertions.assertThat(src)
            .as("KNOWN-BUG PIN (PLT-086 Defect 2 / LSN-002): MinioConfig is expected to STILL "
                + "lack a .region(...) call — REMOTE S3 silently defaults to us-east-1. If this is "
                + "RED, .region(...) appeared: follow the flip protocol in the class javadoc — if "
                + "it is the intentional fix, invert this pin to assert .region(...) IS present and "
                + "move PLT-086 from pins: to regresses:.")
            .doesNotContain(".region(");

        Assertions.assertThat(src)
            .as("KNOWN-BUG PIN (PLT-086 Defect 2 / LSN-002): MinioConfig is expected to STILL have "
                + "no attachment.remote.region config key. If this is RED, the key appeared: follow "
                + "the flip protocol in the class javadoc.")
            .doesNotContain("attachment.remote.region");
    }
}
