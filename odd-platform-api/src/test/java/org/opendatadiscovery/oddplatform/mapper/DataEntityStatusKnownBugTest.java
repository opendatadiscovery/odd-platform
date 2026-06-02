package org.opendatadiscovery.oddplatform.mapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * KNOWN-BUG PIN — PLT-027 (F-044 H-002 / the root behind F-010 H-005).
 *
 * <p>{@code DataEntityMapperImpl.applyStatus} mutates {@code pojo.setStatus(statusDto.getId())} BEFORE
 * the change-detection guard {@code if (statusDto.getId() != pojo.getStatus())}. Because the pojo was
 * just set to {@code statusDto.getId()}, the guard is always false, so {@code status_updated_at} is
 * NEVER set on a transition. Downstream, housekeeping's TTL purge keys on {@code status_updated_at} —
 * so soft-deleted entities never become reapable (the cross-pillar contract F-044→F-010 is broken at
 * the data layer). This is a characterization pin of the order-of-operations bug: GREEN while the
 * mutation precedes the guard, RED when the order is fixed.
 *
 * <p><b>Flip protocol</b> (on RED): confirm the guard now compares against the prior value (or runs
 * before the mutation), delete this {@code @pins}, close PLT-027. General rule: retrospectives/LSN-029.
 *
 * @pins PLT-027
 */
class DataEntityStatusKnownBugTest {

    private static final Path MAPPER =
        Path.of("src/main/java/org/opendatadiscovery/oddplatform/mapper/DataEntityMapperImpl.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void applyStatusMutatesBeforeChangeGuard_knownBug_PLT027() throws IOException {
        final String src = read(MAPPER);
        final int setIdx = src.indexOf("pojo.setStatus(statusDto.getId())");
        final int guardIdx = src.indexOf("if (statusDto.getId() != pojo.getStatus())");
        Assertions.assertThat(setIdx)
            .as("PLT-027: the applyStatus setStatus mutation must be present in %s", MAPPER)
            .isGreaterThanOrEqualTo(0);
        Assertions.assertThat(guardIdx)
            .as("PLT-027: the applyStatus change-detection guard must be present in %s", MAPPER)
            .isGreaterThanOrEqualTo(0);
        Assertions.assertThat(setIdx)
            .as("PLT-027: applyStatus calls pojo.setStatus(...) BEFORE the `statusDto.getId() != pojo.getStatus()` "
                + "guard — so the guard is always false and status_updated_at is never set (TTL purge never matches). "
                + "RED here = the order was fixed; drop this @pins and close PLT-027. See retrospectives/LSN-029.")
            .isLessThan(guardIdx);
    }
}
