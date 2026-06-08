package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * ADR-0028 pin (structural) — range-partition lifecycle is create-only, boot + nightly.
 *
 * <p>{@code PostgreSQLPartitionCreationJob} creates partitions at boot ({@code @PostConstruct}, behind
 * the leader-election advisory lock) AND nightly ({@code @Scheduled} cron), always via
 * {@code createPartitionsIfNotExists} — and it NEVER drops (no {@code dropPartition} anywhere in the
 * creation job; dropping empty past partitions is housekeeping's separate concern, ADR-0045). A drop
 * call here would make the creation job destructive.
 *
 * <p>This is the unit/source-scan half of ADR-0028; the clock/two-replica contention behaviour is the
 * integration complement. Idiom: source scan (sibling of {@link AdrContractScanTest}).
 *
 * @enforces ADR-0028
 */
class AdrPartitionLifecycleScanTest {

    private static final Path JOB =
        Path.of("src/main/java/org/opendatadiscovery/oddplatform/partition/PostgreSQLPartitionCreationJob.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void partitionsCreatedAtBootBehindLeaderLock_andNightly() throws IOException {
        Assertions.assertThat(read(JOB))
            .as("ADR-0028: partitions are created at boot (@PostConstruct, behind the leader-election advisory "
                + "lock) AND nightly (@Scheduled cron) — double coverage so a fresh boot is never missing a window.")
            .contains("@PostConstruct")
            .contains("leaderElectionManager.acquire(activityLockId")
            .contains("@Scheduled(cron = \"0 1 0 * * *\")");
    }

    @Test
    void partitionCreationIsCreateOnly_neverDrops() throws IOException {
        Assertions.assertThat(read(JOB))
            .as("ADR-0028: the creation job is create-only — createPartitionsIfNotExists, and NEVER a drop "
                + "(dropping empty past partitions is housekeeping's concern, ADR-0045). A dropPartition here would "
                + "make partition creation destructive.")
            .contains("createPartitionsIfNotExists")
            .doesNotContain("dropPartition");
    }
}
