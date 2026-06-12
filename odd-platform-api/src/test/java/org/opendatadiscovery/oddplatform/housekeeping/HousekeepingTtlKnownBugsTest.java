package org.opendatadiscovery.oddplatform.housekeeping;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Known-bug characterization pins for the housekeeping TTL data-loss class — PLT-083 and PLT-005.
 * Both assert the CURRENT (incorrect) behaviour: GREEN while the bug exists, RED the instant the
 * code changes. See retrospectives/LSN-029 for the general rule + flip protocol.
 *
 * <p>PLT-083 (LSN-001 shape, F-010 H-002) — {@code HousekeepingTTLProperties} holds bare primitive
 * {@code int} fields with no default, so an unset TTL silently defaults to {@code 0}. The job then
 * computes {@code now.minusDays(0) = now} and deletes everything older-or-equal — i.e. a partial
 * {@code application.yml} override silently wipes all retained data within 15 minutes. The fix is a
 * sane non-zero default (or an unset≠0 guard). Flip on RED: confirm the default fix, drop this pin.
 *
 * <p>PLT-005 (F-010 H-001) — {@code AlertHousekeepingJob} chains {@code .where(A).or(B).and(C)},
 * which SQL precedence (AND binds tighter than OR) evaluates as {@code A OR (B AND C)} — NOT the
 * intended {@code (A OR B) AND C}. So manually-RESOLVED alerts (branch A) are hard-deleted next
 * cycle regardless of {@code resolved_alerts_days}. The fix groups the OR
 * ({@code .where(A.or(B)).and(C)} or {@code STATUS.in(...)}). Flip on RED: confirm the grouping fix,
 * drop this pin.
 *
 * <p>Idiom: source scan of the real config + job — deterministic, no Spring context; gradle runs
 * tests with the module root as the working dir.
 *
 * @pins PLT-083
 * @pins PLT-005
 */
class HousekeepingTtlKnownBugsTest {

    private static final String BASE = "src/main/java/org/opendatadiscovery/oddplatform/housekeeping/";
    private static final Path TTL_PROPS = Path.of(BASE + "config/HousekeepingTTLProperties.java");
    private static final Path ALERT_JOB = Path.of(BASE + "job/AlertHousekeepingJob.java");

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

    @Test
    void alertHousekeepingOrAndPrecedence_knownBug_PLT005() throws IOException {
        Assertions.assertThat(read(ALERT_JOB))
            .as("PLT-005: the ungrouped .where(A).or(B).and(C) chain evaluates as A OR (B AND C) — so "
                + "manually-RESOLVED alerts are deleted regardless of resolved_alerts_days. RED here = the OR "
                + "was grouped (the fix); confirm and drop this @pins. See retrospectives/LSN-029.")
            .contains(".where(ALERT.STATUS.eq(AlertStatusEnum.RESOLVED.getCode()))")
            .contains(".or(ALERT.STATUS.eq(AlertStatusEnum.RESOLVED_AUTOMATICALLY.getCode()))")
            .contains(".and(ALERT.STATUS_UPDATED_AT.lessOrEqual(");
    }
}
