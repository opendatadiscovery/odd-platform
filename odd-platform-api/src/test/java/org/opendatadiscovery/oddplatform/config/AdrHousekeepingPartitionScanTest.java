package org.opendatadiscovery.oddplatform.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * ADR-0045 pin — Housekeeping ⟂ partition-creation separation.
 *
 * <p>Housekeeping ({@code HousekeepingJobManager}, {@code @Scheduled fixedRate 15m}, ShedLock
 * {@code housekeepingJob}) and partition creation ({@code PostgreSQLPartitionCreationJob}, nightly
 * cron + boot {@code @PostConstruct}, ShedLock {@code partitionCreationJob}) are distinct packages,
 * schedules, and lock names — a shared lock or schedule would couple a 15-minute sweep to a nightly
 * DDL job. The single bridge {@code EmptyPartitionsHousekeepingJob} lives in the housekeeping
 * package but delegates the actual drop to {@code PartitionService.getEmptyPastPartitions} +
 * {@code dropPartition} rather than reimplementing partition logic.
 *
 * <p>Idiom: source scan (sibling of {@link AdrContractScanTest}) — deterministic, no Spring
 * context; gradle runs tests with the module root as the working dir.
 *
 * @enforces ADR-0045
 */
class AdrHousekeepingPartitionScanTest {

    private static final String BASE = "src/main/java/org/opendatadiscovery/oddplatform/";
    private static final Path HOUSEKEEPING_MANAGER = Path.of(BASE + "housekeeping/HousekeepingJobManager.java");
    private static final Path PARTITION_JOB = Path.of(BASE + "partition/PostgreSQLPartitionCreationJob.java");
    private static final Path BRIDGE = Path.of(BASE + "housekeeping/job/EmptyPartitionsHousekeepingJob.java");

    private static String read(final Path p) throws IOException {
        Assertions.assertThat(Files.exists(p))
            .as("source must be readable for this structural pin; looked at %s "
                + "(gradle test working dir should be the module root)", p.toAbsolutePath())
            .isTrue();
        return Files.readString(p);
    }

    @Test
    void housekeepingAndPartitionUseDistinctShedlockNames() throws IOException {
        Assertions.assertThat(read(HOUSEKEEPING_MANAGER))
            .as("ADR-0045: the housekeeping manager holds ShedLock `housekeepingJob` and never the partition "
                + "lock — distinct schedules must not share a lock.")
            .contains("name = \"housekeepingJob\"")
            .doesNotContain("partitionCreationJob");
        Assertions.assertThat(read(PARTITION_JOB))
            .as("ADR-0045: the partition-creation job holds ShedLock `partitionCreationJob` and never the "
                + "housekeeping lock.")
            .contains("name = \"partitionCreationJob\"")
            .doesNotContain("housekeepingJob");
    }

    @Test
    void housekeepingRunsFixedRate_partitionRunsNightlyCronAndBoot() throws IOException {
        Assertions.assertThat(read(HOUSEKEEPING_MANAGER))
            .as("ADR-0045: housekeeping is a fixed-rate sweep (15m), distinct from the nightly partition cron.")
            .contains("fixedRate = 15")
            .contains("TimeUnit.MINUTES");
        Assertions.assertThat(read(PARTITION_JOB))
            .as("ADR-0045: partition creation runs on a nightly cron AND at boot (@PostConstruct), distinct "
                + "from the housekeeping fixed-rate schedule.")
            .contains("cron = \"0 1 0 * * *\"")
            .contains("@PostConstruct");
    }

    @Test
    void theOneBridgeDelegatesDropToPartitionService() throws IOException {
        // The production code wraps the call across lines (`partitionService\n .getEmptyPastPartitions(...)`),
        // so assert on the leading-dot method tokens + the injected type rather than a contiguous dotted call.
        Assertions.assertThat(read(BRIDGE))
            .as("ADR-0045: EmptyPartitionsHousekeepingJob is the single bridge — it lives in housekeeping but "
                + "delegates the drop to PartitionService (getEmptyPastPartitions + dropPartition); it does not "
                + "reimplement partition logic.")
            .contains("PartitionService")
            .contains(".getEmptyPastPartitions")
            .contains(".dropPartition");
    }
}
