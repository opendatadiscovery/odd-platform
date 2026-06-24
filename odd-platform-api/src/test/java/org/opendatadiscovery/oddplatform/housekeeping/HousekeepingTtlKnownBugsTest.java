package org.opendatadiscovery.oddplatform.housekeeping;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Known-bug characterization pin for the housekeeping TTL zero-default footgun — PLT-083.
 * It asserts the CURRENT source shape: GREEN while the footgun exists, RED the instant the
 * code changes. See retrospectives/LSN-029 for the general rule + flip protocol.
 *
 * <p>PLT-083 (LSN-001 shape, F-010 H-002) — {@code HousekeepingTTLProperties} holds bare primitive
 * {@code int} fields with no default, so an unset TTL silently defaults to {@code 0}. The job then
 * computes {@code now.minusDays(0) = now} and deletes everything older-or-equal — i.e. a partial
 * {@code application.yml} override silently wipes all retained data within 15 minutes. The fix is a
 * sane non-zero default (or an unset≠0 guard). Flip on RED: confirm the default fix, drop this pin.
 *
 * <p>PLT-005 (the {@code AlertHousekeepingJob} {@code .or()/.and()} precedence claim) was FALSIFIED and
 * is NOT pinned here: jOOQ DSL chaining renders {@code .where(A).or(B).and(C)} as {@code (A OR B) AND C}
 * (the intended grouping), not {@code A OR (B AND C)}, so manual and auto resolutions respect the TTL
 * symmetrically. The behaviour is proven by {@code AlertHousekeepingRetentionTest} (it runs the real job
 * against a real Postgres). The earlier source-scan pin asserted a non-bug and was removed. See
 * issues/odd-platform/PLT-005.md (status: rejected).
 *
 * <p>Idiom: source scan of the real config — deterministic, no Spring context; gradle runs
 * tests with the module root as the working dir.
 *
 * @pins PLT-083
 */
class HousekeepingTtlKnownBugsTest {

    private static final String BASE = "src/main/java/org/opendatadiscovery/oddplatform/housekeeping/";
    private static final Path TTL_PROPS = Path.of(BASE + "config/HousekeepingTTLProperties.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void ttlFieldsSilentlyDefaultToZero_knownBug_PLT083() throws IOException {
        final String src = read(TTL_PROPS);
        Assertions.assertThat(src)
            .as("PLT-083: the TTL fields are bare primitive `int` with no default, so an unset/partial "
                + "housekeeping.ttl silently defaults to 0 → the job deletes everything older-or-equal to now "
                + "(LSN-001 shape: a default that wipes retained data). RED here = a default/guard was added; "
                + "confirm the fix and drop this @pins. See retrospectives/LSN-029.")
            .contains("private int resolvedAlertsDays;")
            .contains("private int searchFacetsDays;")
            .contains("private int dataEntityDeleteDays;")
            .doesNotContain("@DefaultValue");
    }
}
