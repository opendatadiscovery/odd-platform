package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * ADR-0046 pin (depth) — housekeeping is opt-out at the BEAN-condition level.
 *
 * <p>Distinct from {@link FeatureGatingDefaultsTest}'s {@code application.yml} default check: this pins the
 * gate on the bean itself — {@code HousekeepingJobManager} is
 * {@code @ConditionalOnProperty(value = "housekeeping.enabled", havingValue = "true")} with NO
 * {@code matchIfMissing}. So the shipped yaml {@code true} enables it (opt-out), and an ABSENT key
 * disables it (which the integration-test profile relies on). Adding {@code matchIfMissing = true} would
 * make an absent key silently enable housekeeping.
 *
 * <p>Idiom: source scan (sibling of {@link AdrContractScanTest}).
 *
 * @enforces ADR-0046
 */
class AdrHousekeepingOptOutScanTest {

    private static final Path MANAGER =
        Path.of("src/main/java/org/opendatadiscovery/oddplatform/housekeeping/HousekeepingJobManager.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void housekeepingManagerIsConditionalOptOut_noMatchIfMissing() throws IOException {
        Assertions.assertThat(read(MANAGER))
            .as("ADR-0046: HousekeepingJobManager is @ConditionalOnProperty(housekeeping.enabled, havingValue=true) "
                + "with NO matchIfMissing — shipped-true via yaml enables it (opt-out); an absent key disables it "
                + "(the integration-test profile depends on that). matchIfMissing=true would flip the absent-key "
                + "behaviour to on.")
            .contains("@ConditionalOnProperty(value = \"housekeeping.enabled\", havingValue = \"true\")")
            .doesNotContain("matchIfMissing");
    }
}
